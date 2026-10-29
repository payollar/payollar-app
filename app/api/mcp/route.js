import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { allowsAnonymous, prepareForChatGpt } from "@/lib/mcp/chatgpt.mjs";
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
  return `Bearer realm="payollar", resource_metadata="${protectedResourceMetadataUrl()}", scope="payollar"`;
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
  if (!token) return { actor: null };
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

async function jsonResponse(response) {
  if (response.status === 204 || response.status === 202) return withCors(response);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) return withCors(response);
  const text = await response.text();
  if (!text) return withCors(new Response(null, { status: response.status, headers: response.headers }));
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return withCors(new Response(text, { status: response.status, headers: response.headers }));
  }
  prepareForChatGpt(payload);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return withCors(Response.json(payload, { status: response.status, headers }));
}

async function handle(request) {
  if (request.method === "GET") {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null },
      { status: 405, headers: { ...CORS_HEADERS, Allow: "POST, DELETE, OPTIONS" } }
    );
  }

  const authResult = await actorFor(request);
  if (authResult.response) return authResult.response;

  let body = null;
  if (!authResult.actor) {
    body = await request.clone().json().catch(() => null);
    if (!allowsAnonymous(body)) return unauthorized();
  }

  const server = createPayollarServer(db, authResult.actor, { catalog: !authResult.actor });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await jsonResponse(await transport.handleRequest(request));
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
