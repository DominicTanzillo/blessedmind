/**
 * BlessedMind remote connector — an OAuth-protected MCP server on Cloudflare.
 *
 * This is what claude.ai, the Mac desktop app and the iPhone talk to. Anthropic's
 * cloud connects here, not your laptop, which is why it has to be hosted at all.
 *
 * The shape that made the deleted mcp-remote/ dangerous was: a public URL, an
 * anon key baked into it, and wide-open table policies — together a public REST
 * endpoint onto the database. None of that is true here:
 *
 *   1. /mcp sits behind OAuthProvider. No valid bearer token, no handler call,
 *      no database connection. An unauthenticated request gets a 401.
 *   2. The Supabase password is a Cloudflare secret — never in this repo, never
 *      in the deployed bundle, not readable back after it is set.
 *   3. The `authenticated`-only policies from sql/002_require_auth.sql still
 *      enforce at the database, independently of anything this Worker does.
 *
 * Leaking the URL therefore costs nothing, which is the real test.
 *
 * Tools come from ../../mcp-server/tools.mjs — the same file the local stdio
 * server uses. Wrangler bundles it at deploy time.
 */

import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { WorkerEntrypoint } from "cloudflare:workers";

import { createSession, verifyCredentials } from "../../mcp-server/session.mjs";
import { createTools } from "../../mcp-server/tools.mjs";

const MCP_PROTOCOL_VERSION = "2025-06-18";

// Brute-force ceiling for the login form. It is a password box on the public
// internet; without this, the only thing between an attacker and the account is
// the password itself.
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_SECONDS = 900; // 15 minutes

// ── The MCP endpoint ─────────────────────────────────────
// OAuthProvider only reaches this after validating the bearer token, so every
// request that arrives here is already authenticated.

class BlessedMindMCP extends WorkerEntrypoint {
  async fetch(request) {
    if (request.method !== "POST") {
      // Streamable HTTP also defines GET for server-initiated events. Nothing
      // here pushes, so decline rather than hold a connection open.
      return new Response("Method not allowed", { status: 405 });
    }

    let message;
    try {
      message = await request.json();
    } catch {
      return jsonRpcError(null, -32700, "Parse error");
    }

    // Notifications carry no id and expect no reply.
    if (message.id === undefined || message.id === null) {
      return new Response(null, { status: 202 });
    }

    try {
      const result = await this.handle(message);
      return Response.json({ jsonrpc: "2.0", id: message.id, result });
    } catch (err) {
      return jsonRpcError(message.id, -32603, err.message);
    }
  }

  async handle(message) {
    switch (message.method) {
      case "initialize":
        return {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: "BlessedMind", version: "2.0.0" },
        };

      case "ping":
        return {};

      case "tools/list":
        return {
          tools: this.tools().map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
          })),
        };

      case "tools/call": {
        const tool = this.tools().find((t) => t.name === message.params?.name);
        if (!tool) {
          return {
            content: [{ type: "text", text: `Error: unknown tool ${message.params?.name}` }],
            isError: true,
          };
        }

        try {
          await this.session().ensureSession();
          const result = await tool.run(message.params.arguments ?? {});
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (err) {
          return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
        }
      }

      default:
        throw new Error(`Unsupported method: ${message.method}`);
    }
  }

  /**
   * One signed-in Supabase client per isolate, reused across requests.
   *
   * ctx.props carries who authorized this grant. It is not used to pick an
   * account — BlessedMind is single-user — but it is what a multi-user version
   * would key off, and it proves the grant is real.
   */
  session() {
    if (!this._session) {
      this._session = createSession({
        url: this.env.SUPABASE_URL,
        anonKey: this.env.SUPABASE_ANON_KEY,
        email: this.env.SUPABASE_EMAIL,
        password: this.env.SUPABASE_PASSWORD,
      });
    }
    return this._session;
  }

  tools() {
    if (!this._tools) {
      // Cloudflare runs in UTC. Without an explicit zone, "today" would roll
      // over in the evening in the Americas and mark habits missed early.
      this._tools = createTools(this.session().supabase, {
        timeZone: this.env.TIMEZONE || "America/New_York",
      });
    }
    return this._tools;
  }
}

function jsonRpcError(id, code, message) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 });
}

// ── The login screen ─────────────────────────────────────
// OAuthProvider owns /token and /register. This handler owns /authorize, which
// is the one page you ever see — once, on a laptop, when adding the connector.

const authHandler = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(
        "BlessedMind connector. Add it to Claude as a custom connector; there is nothing to see here.",
        { headers: { "content-type": "text/plain" } }
      );
    }

    if (url.pathname !== "/authorize") {
      return new Response("Not found", { status: 404 });
    }

    return request.method === "POST"
      ? handleLogin(request, env)
      : showLoginForm(request, env, url.search);
  },
};

async function showLoginForm(request, env, search, error) {
  try {
    await env.OAUTH_PROVIDER.parseAuthRequest(request);
  } catch (err) {
    // A malformed or unregistered request never reaches the password box.
    return new Response(err.description ?? "Invalid authorization request", { status: 400 });
  }

  return new Response(loginPage(env.SUPABASE_EMAIL, search, error), {
    status: error ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handleLogin(request, env) {
  const form = await request.formData();
  const search = String(form.get("oauth_qs") ?? "");
  const password = String(form.get("password") ?? "");

  // Re-parse from the carried query string. Tampering with the hidden field
  // cannot widen anything: parseAuthRequest re-validates client_id and
  // redirect_uri against the registered client on every call.
  const replay = new Request(new URL(request.url).origin + "/authorize" + search);

  let oauthRequest;
  try {
    oauthRequest = await env.OAUTH_PROVIDER.parseAuthRequest(replay);
  } catch (err) {
    return new Response(err.description ?? "Invalid authorization request", { status: 400 });
  }

  const attemptKey = `login-attempts:${request.headers.get("cf-connecting-ip") ?? "unknown"}`;
  const attempts = Number((await env.OAUTH_KV.get(attemptKey)) ?? 0);
  if (attempts >= MAX_ATTEMPTS) {
    return new Response("Too many attempts. Try again in 15 minutes.", { status: 429 });
  }

  // The password is checked by Supabase Auth itself. This Worker never stores
  // one, never compares one, and cannot leak one it does not hold.
  const check = await verifyCredentials({
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    email: env.SUPABASE_EMAIL,
    password,
  });

  if (!check.ok) {
    await env.OAUTH_KV.put(attemptKey, String(attempts + 1), {
      expirationTtl: ATTEMPT_WINDOW_SECONDS,
    });
    return showLoginForm(replay, env, search, "Incorrect password.");
  }

  await env.OAUTH_KV.delete(attemptKey);

  const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthRequest,
    userId: check.userId,
    scope: oauthRequest.scope,
    // Stored on the grant for your own reference when auditing or revoking.
    metadata: { authorizedAt: new Date().toISOString(), email: check.email },
    // Everything here is readable by the MCP handler as ctx.props. Keep it to
    // identity — never put the Supabase password in a grant.
    props: { userId: check.userId, email: check.email },
  });

  return Response.redirect(redirectTo, 302);
}

function loginPage(email, search, error) {
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Connect BlessedMind</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font: 16px/1.5 system-ui, -apple-system, sans-serif;
    display: grid; place-items: center; min-height: 100vh; margin: 0;
    background: #faf9f7; color: #2c2a26;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1b19; color: #e8e6e1; }
    .card { background: #262523; border-color: #3a3835; }
    input { background: #1c1b19; color: inherit; border-color: #4a4744; }
  }
  .card {
    background: #fff; border: 1px solid #e3e0da; border-radius: 12px;
    padding: 2rem; width: min(380px, calc(100vw - 2rem));
  }
  h1 { font-size: 1.25rem; margin: 0 0 .25rem; }
  p.sub { margin: 0 0 1.5rem; color: #6b6862; font-size: .9rem; }
  label { display: block; font-size: .85rem; font-weight: 600; margin-bottom: .35rem; }
  input {
    width: 100%; box-sizing: border-box; padding: .6rem .7rem; font-size: 1rem;
    border: 1px solid #d5d1c9; border-radius: 7px;
  }
  button {
    margin-top: 1rem; width: 100%; padding: .65rem; font-size: 1rem; font-weight: 600;
    background: #5c7f5c; color: #fff; border: 0; border-radius: 7px; cursor: pointer;
  }
  button:hover { background: #4d6d4d; }
  .error {
    margin: 0 0 1rem; padding: .6rem .7rem; border-radius: 7px; font-size: .875rem;
    background: #fdeaea; color: #a33; border: 1px solid #f3caca;
  }
  .note { margin: 1.25rem 0 0; font-size: .8rem; color: #6b6862; }
</style>
</head>
<body>
  <main class="card">
    <h1>Connect BlessedMind</h1>
    <p class="sub">Signing in as ${esc(email)}</p>
    ${error ? `<p class="error">${esc(error)}</p>` : ""}
    <form method="post">
      <input type="hidden" name="oauth_qs" value="${esc(search)}">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password"
             autofocus required>
      <button type="submit">Allow access</button>
    </form>
    <p class="note">
      You only do this once. Claude keeps a revocable token and renews it
      silently — including on your phone, which never shows this page.
    </p>
  </main>
</body>
</html>`;
}

export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: BlessedMindMCP,
  defaultHandler: authHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  // RFC 7591. This is what lets Claude register itself when you paste the URL,
  // so there is no client ID or secret for you to copy anywhere.
  clientRegistrationEndpoint: "/register",
  scopesSupported: ["mcp"],
});
