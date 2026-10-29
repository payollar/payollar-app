import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { resolveBearer } from "@/lib/mcp/actor.mjs";
import { createPayollarServer } from "@/lib/mcp/server.mjs";
import { protectedResourceMetadataUrl } from "@/lib/mcp/url.mjs";
import { db } from "@/lib/prisma";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, WWW-Authenticate",
};

function wwwAuthenticate() {
  return `Bearer realm="payollar", resource_metadata="${protectedResourceMetadataUrl()}"`;
}

function unauthorized() {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401, headers: { ...CORS_HEADERS, "WWW-Authenticate": wwwAuthenticate() } }
  );
}

async function actorFor(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { response: unauthorized() };
  const resolved = await resolveBearer(db, token);
  if (resolved?.error === "cursor_unlinked" || resolved?.error === "cursor_user_missing") {
    return {
      response: Response.json(
        { error: "Set MCP_CURSOR_EMAIL to the Payollar account this Cursor token should use." },
        { status: 403, headers: CORS_HEADERS }
      ),
    };
  }
  if (!resolved?.actor) return { response: unauthorized() };
  return { actor: resolved.actor };
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handle(request) {
  const authResult = await actorFor(request);
  if (authResult.response) return authResult.response;

  const server = createPayollarServer(db, authResult.actor);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return withCors(await transport.handleRequest(request));
  } catch (error) {
    console.error("[payollar-mcp]", error);
    return Response.json({ error: "MCP request failed" }, { status: 500, headers: CORS_HEADERS });
  } finally {
    await server.close().catch(() => {});
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(request) {
  return handle(request);
}

export function POST(request) {
  return handle(request);
}

export function DELETE(request) {
  return handle(request);
}
