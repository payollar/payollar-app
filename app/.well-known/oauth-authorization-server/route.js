import { appBaseUrl, authorizeUrl, OAUTH_SCOPES, registerUrl, tokenUrl } from "@/lib/mcp/url.mjs";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    issuer: appBaseUrl(),
    authorization_endpoint: authorizeUrl(),
    token_endpoint: tokenUrl(),
    registration_endpoint: registerUrl(),
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_basic", "client_secret_post"],
    scopes_supported: OAUTH_SCOPES,
  });
}
