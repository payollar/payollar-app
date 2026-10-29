import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";

import { tokenHash } from "./actor.mjs";
import { OAUTH_SCOPES } from "./url.mjs";

const CODE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TTL_MS = 60 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function s256(verifier) {
  return createHash("sha256").update(verifier).digest("base64url");
}

function same(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function grantedScopes(requested) {
  const asked = String(requested || "")
    .split(/[\s+]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
  const known = asked.filter((scope) => OAUTH_SCOPES.includes(scope));
  const scopes = new Set(known.length ? known : ["payollar"]);
  if (asked.includes("offline_access") || asked.length === 0) scopes.add("offline_access");
  if (!scopes.has("payollar")) scopes.add("payollar");
  return [...scopes].join(" ");
}

export function safeRedirectUri(value) {
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const ok = url.protocol === "https:" || (url.protocol === "http:" && local);
    if (!ok || url.username || url.password) return null;
    return String(value);
  } catch {
    return null;
  }
}

export async function registerClient(db, body) {
  const redirects = (Array.isArray(body.redirect_uris) ? body.redirect_uris : [])
    .map(safeRedirectUri)
    .filter(Boolean);
  if (!redirects.length) {
    return { error: "redirect_uris must contain at least one https URL" };
  }
  const id = randomUUID();
  const method = body.token_endpoint_auth_method || "none";
  let secret = null;
  let secretHash = null;
  if (method !== "none") {
    secret = randomToken();
    secretHash = tokenHash(secret);
  }
  await db.mcpOAuthClient.create({
    data: {
      id,
      secretHash,
      name: typeof body.client_name === "string" ? body.client_name.slice(0, 120) : null,
      redirectUris: redirects,
    },
  });
  return {
    client: {
      client_id: id,
      ...(secret ? { client_secret: secret } : {}),
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: body.client_name || "Payollar MCP",
      redirect_uris: redirects,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: secret ? method : "none",
    },
  };
}

export async function clientMatches(db, clientId, redirectUri, secret) {
  const client = await db.mcpOAuthClient.findUnique({ where: { id: clientId } });
  if (!client) return null;
  if (redirectUri && !client.redirectUris.includes(redirectUri)) return null;
  if (client.secretHash) {
    if (!secret || !same(tokenHash(secret), client.secretHash)) return null;
  }
  return client;
}

export async function issueCode(db, { clientId, userId, redirectUri, codeChallenge, scope }) {
  const code = randomToken();
  await db.mcpAuthCode.create({
    data: {
      codeHash: tokenHash(code),
      clientId,
      userId,
      redirectUri,
      codeChallenge,
      scope: grantedScopes(scope),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  return code;
}

async function issueTokens(db, { clientId, userId, scope }) {
  const access = randomToken();
  const refresh = randomToken();
  const now = Date.now();
  await db.mcpAccessToken.create({
    data: {
      tokenHash: tokenHash(access),
      clientId,
      userId,
      scope,
      expiresAt: new Date(now + ACCESS_TTL_MS),
    },
  });
  await db.mcpRefreshToken.create({
    data: {
      tokenHash: tokenHash(refresh),
      clientId,
      userId,
      scope,
      expiresAt: new Date(now + REFRESH_TTL_MS),
    },
  });
  return {
    access_token: access,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TTL_MS / 1000),
    refresh_token: refresh,
    scope,
  };
}

export async function exchangeCode(db, { code, clientId, redirectUri, verifier }) {
  const row = await db.mcpAuthCode.findUnique({ where: { codeHash: tokenHash(code) } });
  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) return { error: "invalid_grant" };
  if (row.clientId !== clientId || row.redirectUri !== redirectUri) return { error: "invalid_grant" };
  if (!verifier || !same(s256(verifier), row.codeChallenge)) return { error: "invalid_grant" };
  const spent = await db.mcpAuthCode.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (spent.count !== 1) return { error: "invalid_grant" };
  return { tokens: await issueTokens(db, row) };
}

export async function exchangeRefresh(db, { refreshToken, clientId }) {
  const row = await db.mcpRefreshToken.findUnique({ where: { tokenHash: tokenHash(refreshToken) } });
  if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) return { error: "invalid_grant" };
  if (row.clientId !== clientId) return { error: "invalid_grant" };
  await db.mcpRefreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
  return { tokens: await issueTokens(db, row) };
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
