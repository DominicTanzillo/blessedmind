#!/usr/bin/env node
/**
 * BlessedMind MCP server — stdio transport.
 *
 * Claude launches this as a child process and talks to it over a pipe. Nothing
 * listens on a port and there is no URL, so there is no network surface to
 * attack; the credentials never leave the machine.
 *
 * The tools themselves live in tools.mjs, shared with connector/ so the two
 * transports cannot drift apart.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createSession } from "./session.mjs";
import { createTools } from "./tools.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

let session;
try {
  session = createSession({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    email: process.env.SUPABASE_EMAIL,
    password: process.env.SUPABASE_PASSWORD,
  });
} catch (err) {
  console.error(
    `BlessedMind MCP: ${err.message}\n\n` +
      `Set these in mcp-server/.env — see .env.example. Since\n` +
      `sql/002_require_auth.sql the anon key alone reads nothing, so a\n` +
      `signed-in session is required.`
  );
  process.exit(1);
}

const tools = createTools(session.supabase);
const byName = new Map(tools.map((t) => [t.name, t]));

const server = new Server(
  { name: "BlessedMind", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = byName.get(request.params.name);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Error: unknown tool ${request.params.name}` }],
      isError: true,
    };
  }

  try {
    await session.ensureSession();
    const result = await tool.run(request.params.arguments ?? {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
  }
});

await server.connect(new StdioServerTransport());
