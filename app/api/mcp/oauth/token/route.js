import { db } from "@/lib/prisma";
import { clientMatches, exchangeCode, exchangeRefresh } from "@/lib/mcp/oauth.mjs";

export const dynamic = "force-dynamic";

async function readBody(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function clientFromHeader(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return {};
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const split = decoded.indexOf(":");
  if (split < 0) return {};
  return { clientId: decodeURIComponent(decoded.slice(0, split)), clientSecret: decodeURIComponent(decoded.slice(split + 1)) };
}

export async function POST(request) {
  const body = await readBody(request).catch(() => ({}));
  const basic = clientFromHeader(request);
  const clientId = String(basic.clientId || body.client_id || "");
  const clientSecret = basic.clientSecret || body.client_secret || "";
  const client = await clientMatches(db, clientId, null, clientSecret);
  if (!client) {
    return Response.json({ error: "invalid_client" }, { status: 401 });
  }

  const grant = body.grant_type;
  const result = grant === "authorization_code"
    ? await exchangeCode(db, {
        code: String(body.code || ""),
        clientId,
        redirectUri: String(body.redirect_uri || ""),
        verifier: String(body.code_verifier || ""),
      })
    : grant === "refresh_token"
      ? await exchangeRefresh(db, { refreshToken: String(body.refresh_token || ""), clientId })
      : { error: "unsupported_grant_type" };

  if (result.error) {
    const status = result.error === "unsupported_grant_type" ? 400 : 400;
    return Response.json({ error: result.error }, { status });
  }
  return Response.json(result.tokens, { headers: { "Cache-Control": "no-store" } });
}
