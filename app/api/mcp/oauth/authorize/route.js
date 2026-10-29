import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { loadActor } from "@/lib/mcp/actor.mjs";
import {
  clientMatches,
  escapeHtml,
  exchangeCode,
  exchangeRefresh,
  grantedScopes,
  issueCode,
  registerClient,
  safeRedirectUri,
} from "@/lib/mcp/oauth.mjs";
import { appBaseUrl, authorizeUrl } from "@/lib/mcp/url.mjs";

export const dynamic = "force-dynamic";

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action *; base-uri 'none'; frame-ancestors 'none'",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...SECURITY_HEADERS },
  });
}

function rejectsCrossSite(request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  const allowed = new Set([new URL(appBaseUrl()).host, "payollar.com", "www.payollar.com"]);
  try {
    allowed.add(new URL(request.url).host);
  } catch {
    return true;
  }
  try {
    return !allowed.has(new URL(origin).host);
  } catch {
    return true;
  }
}

async function sessionUser(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return null;
  return loadActor(db, session.user.id);
}

function consentPage({ client, user, fields }) {
  const host = (() => {
    try {
      return new URL(fields.redirect_uri).host;
    } catch {
      return "the requesting app";
    }
  })();
  const hidden = Object.entries(fields)
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Connect Payollar</title>
</head>
<body style="margin:0;font-family:Georgia,serif;background:#f4f1ea;color:#1c1915;">
<main style="max-width:32rem;margin:4rem auto;padding:2rem;background:#fff;border:1px solid #e4ddd0;">
<p style="letter-spacing:.12em;text-transform:uppercase;font-size:.75rem;">Payollar</p>
<h1 style="font-size:1.6rem;font-weight:500;">Allow ${escapeHtml(client.name || "this app")} to read your Payollar account?</h1>
<p>${escapeHtml(user.name || user.email)} · ${escapeHtml(user.role)}</p>
<p>This connection can read the inventory, campaigns, and creator data your role is allowed to see. It cannot book, charge, or change records. After you allow it, you return to ${escapeHtml(host)}.</p>
<form method="post" action="${escapeHtml(authorizeUrl())}">
${hidden}
<p>
<button type="submit" name="decision" value="allow" style="background:#1c1915;color:#fff;border:0;padding:.7rem 1.2rem;font:inherit;">Allow</button>
<button type="submit" name="decision" value="deny" style="background:transparent;border:1px solid #1c1915;padding:.7rem 1.2rem;margin-left:.5rem;font:inherit;">Cancel</button>
</p>
</form>
</main>
</body>
</html>`;
}

export async function GET(request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  if (params.response_type !== "code") return html("<p>response_type must be code.</p>", 400);
  const redirectUri = safeRedirectUri(params.redirect_uri);
  const client = await clientMatches(db, params.client_id, redirectUri);
  if (!client || !redirectUri) return html("<p>This application is not registered for that redirect.</p>", 400);
  if (params.code_challenge_method && params.code_challenge_method !== "S256") {
    return html("<p>code_challenge_method must be S256.</p>", 400);
  }
  if (!params.code_challenge) return html("<p>PKCE code_challenge is required.</p>", 400);

  const user = await sessionUser(request);
  if (!user) {
    const back = `${url.pathname}${url.search}`;
    const signIn = new URL("/sign-in", appBaseUrl());
    signIn.searchParams.set("redirect_url", back);
    return Response.redirect(signIn, 302);
  }

  return html(consentPage({
    client,
    user,
    fields: {
      client_id: params.client_id,
      redirect_uri: redirectUri,
      code_challenge: params.code_challenge,
      code_challenge_method: "S256",
      state: params.state || "",
      scope: params.scope || "payollar offline_access",
      resource: params.resource || "",
    },
  }));
}

export async function POST(request) {
  if (rejectsCrossSite(request)) {
    return html("<p>Confirm the connection from the page.</p>", 400);
  }
  const form = await request.formData();
  const fields = Object.fromEntries(form.entries());
  const redirectUri = safeRedirectUri(fields.redirect_uri);
  const client = await clientMatches(db, String(fields.client_id || ""), redirectUri);
  if (!client || !redirectUri || !fields.code_challenge) {
    return html("<p>This authorization request is no longer valid.</p>", 400);
  }
  const user = await sessionUser(request);
  if (!user) {
    const signIn = new URL("/sign-in", appBaseUrl());
    signIn.searchParams.set("redirect_url", "/api/mcp/oauth/authorize");
    return Response.redirect(signIn, 302);
  }

  const destination = new URL(redirectUri);
  if (fields.state) destination.searchParams.set("state", String(fields.state));
  if (fields.decision !== "allow") {
    destination.searchParams.set("error", "access_denied");
    return Response.redirect(destination, 302);
  }

  const code = await issueCode(db, {
    clientId: client.id,
    userId: user.userId,
    redirectUri,
    codeChallenge: String(fields.code_challenge),
    scope: grantedScopes(fields.scope),
  });
  destination.searchParams.set("code", code);
  return Response.redirect(destination, 302);
}
