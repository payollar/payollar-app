import { db } from "@/lib/prisma";
import { registerClient } from "@/lib/mcp/oauth.mjs";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "invalid_client_metadata" }, { status: 400 });
  const result = await registerClient(db, body);
  if (result.error) return Response.json({ error: result.error }, { status: 400 });
  return Response.json(result.client, { status: 201 });
}
