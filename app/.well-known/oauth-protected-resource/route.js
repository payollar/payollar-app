import { mcpResourceUrl, OAUTH_SCOPES, appBaseUrl } from "@/lib/mcp/url.mjs";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    resource: mcpResourceUrl(),
    authorization_servers: [appBaseUrl()],
    scopes_supported: OAUTH_SCOPES,
    bearer_methods_supported: ["header"],
  });
}
