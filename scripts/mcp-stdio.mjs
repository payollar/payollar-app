import { PrismaClient } from "@prisma/client";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadActorByEmail } from "../lib/mcp/actor.mjs";
import { createPayollarServer } from "../lib/mcp/server.mjs";

const db = new PrismaClient();
const actor = await loadActorByEmail(db, process.env.MCP_CURSOR_EMAIL || "");
if (!actor) {
  console.error("Set MCP_CURSOR_EMAIL to a Payollar account email before starting the MCP server.");
  process.exit(1);
}
const server = createPayollarServer(db, actor);
const transport = new StdioServerTransport();

await server.connect(transport);
