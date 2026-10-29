const PUBLIC_ORIGIN = "https://www.payollar.com";

function isLocal(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

export function appBaseUrl() {
  const raw = (process.env.MCP_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || PUBLIC_ORIGIN).replace(/\/+$/, "");
  if (isLocal(raw) || raw === "https://payollar.com" || raw === "http://payollar.com") return PUBLIC_ORIGIN;
  return raw;
}

export function mcpResourceUrl() {
  return `${appBaseUrl()}/api/mcp`;
}

export function protectedResourceMetadataUrl() {
  return `${appBaseUrl()}/.well-known/oauth-protected-resource/api/mcp`;
}

export function authorizeUrl() {
  return `${appBaseUrl()}/api/mcp/oauth/authorize`;
}

export function tokenUrl() {
  return `${appBaseUrl()}/api/mcp/oauth/token`;
}

export function registerUrl() {
  return `${appBaseUrl()}/api/mcp/oauth/register`;
}

export const OAUTH_SCOPES = ["payollar", "offline_access"];
