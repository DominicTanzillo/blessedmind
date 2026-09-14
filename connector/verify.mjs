#!/usr/bin/env node
/**
 * Walk the connector's whole auth path the way Claude does, and prove the
 * tools work at the end of it.
 *
 * Start the Worker first, in another terminal:
 *   npx wrangler dev --port 8788
 *
 * Then, from connector/:
 *   node verify.mjs
 *
 * It reads the password from .dev.vars, so nothing is typed on the command
 * line and nothing lands in your shell history. Pass a base URL to run the
 * same checks against a deployed Worker:
 *   node verify.mjs https://blessedmind-connector.<subdomain>.workers.dev
 */

import { createHash, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const BASE = (process.argv[2] ?? "http://127.0.0.1:8788").replace(/\/$/, "");
const REDIRECT = "https://claude.ai/api/mcp/auth_callback";
const here = dirname(fileURLToPath(import.meta.url));

const b64url = (b) =>
  b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

let pass = 0;
let fail = 0;

function check(label, ok, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
  ok ? pass++ : fail++;
  return ok;
}

function readPassword() {
  if (process.env.SUPABASE_PASSWORD) return process.env.SUPABASE_PASSWORD;
  try {
    const line = readFileSync(join(here, ".dev.vars"), "utf8")
      .split("\n")
      .find((l) => l.startsWith("SUPABASE_PASSWORD="));
    return line?.slice("SUPABASE_PASSWORD=".length).trim() ?? "";
  } catch {
    return "";
  }
}

console.log(`\nVerifying ${BASE}\n`);

// ── Discovery ────────────────────────────────────────────
console.log("Discovery");

const asMeta = await fetch(`${BASE}/.well-known/oauth-authorization-server`).then((r) => r.json());
check("authorization server metadata (RFC 8414)", !!asMeta.authorization_endpoint);
check("dynamic client registration offered (RFC 7591)", !!asMeta.registration_endpoint);
check(
  "PKCE required, S256 only",
  JSON.stringify(asMeta.code_challenge_methods_supported) === '["S256"]',
  String(asMeta.code_challenge_methods_supported)
);

const prMeta = await fetch(`${BASE}/.well-known/oauth-protected-resource`).then((r) => r.json());
check("protected resource metadata (RFC 9728)", !!prMeta.resource);

// ── The gate ─────────────────────────────────────────────
console.log("\nThe gate");

const noToken = await fetch(`${BASE}/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
});
check("no token is refused", noToken.status === 401, `HTTP ${noToken.status}`);
check("challenge names Bearer", (noToken.headers.get("www-authenticate") ?? "").includes("Bearer"));

const forged = await fetch(`${BASE}/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: "Bearer made-up-token" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
});
check("forged token is refused", forged.status === 401, `HTTP ${forged.status}`);

// ── Registration and authorization ───────────────────────
console.log("\nAuthorization");

const verifier = b64url(randomBytes(32));
const challenge = b64url(createHash("sha256").update(verifier).digest());

const client = await fetch(`${BASE}/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    client_name: "verify.mjs",
    redirect_uris: [REDIRECT],
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
  }),
}).then((r) => r.json());
check("client self-registered", !!client.client_id, client.client_id);

const params = new URLSearchParams({
  response_type: "code",
  client_id: client.client_id,
  redirect_uri: REDIRECT,
  scope: "mcp",
  state: "verify-state",
  code_challenge: challenge,
  code_challenge_method: "S256",
});
const qs = `?${params}`;

const form = await fetch(`${BASE}/authorize${qs}`);
const formHtml = await form.text();
check("login page renders", form.status === 200 && formHtml.includes('name="password"'));

const tamperedQs = qs.replace(encodeURIComponent(REDIRECT), encodeURIComponent("https://evil.example/x"));
const tampered = await fetch(`${BASE}/authorize${tamperedQs}`);
check("tampered redirect_uri rejected", tampered.status === 400, `HTTP ${tampered.status}`);

const wrong = await fetch(`${BASE}/authorize`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ oauth_qs: qs, password: "not-the-password" }),
  redirect: "manual",
});
check(
  "wrong password issues no code",
  wrong.status === 401 && !wrong.headers.get("location"),
  `HTTP ${wrong.status}`
);

// ── The real sign-in ─────────────────────────────────────
console.log("\nSign-in and tools");

const password = readPassword();
if (!password || password === "the-supabase-account-password") {
  console.log("  SKIP  real sign-in — set SUPABASE_PASSWORD in .dev.vars first");
  console.log(`\n${pass} passed, ${fail} failed, sign-in skipped.\n`);
  process.exit(fail > 0 ? 1 : 0);
}

const authed = await fetch(`${BASE}/authorize`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ oauth_qs: qs, password }),
  redirect: "manual",
});

const location = authed.headers.get("location");
if (!check("correct password redirects with a code", !!location, `HTTP ${authed.status}`)) {
  console.log(`\n${pass} passed, ${fail} failed.\n`);
  process.exit(1);
}

const code = new URL(location).searchParams.get("code");
check("state echoed back", new URL(location).searchParams.get("state") === "verify-state");

// The code is worthless without the verifier that produced the challenge.
const wrongVerifier = await fetch(`${BASE}/token`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT,
    client_id: client.client_id,
    code_verifier: b64url(randomBytes(32)),
  }),
});
check("stolen code without PKCE verifier is useless", wrongVerifier.status >= 400,
      `HTTP ${wrongVerifier.status}`);

const token = await fetch(`${BASE}/token`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT,
    client_id: client.client_id,
    code_verifier: verifier,
  }),
}).then((r) => r.json());

if (!check("code exchanged for access token", !!token.access_token, token.error ?? "")) {
  console.log(`\n${pass} passed, ${fail} failed.\n`);
  process.exit(1);
}
check("refresh token issued — this is why you sign in once", !!token.refresh_token);

const call = (body) =>
  fetch(`${BASE}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const init = await call({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
check("initialize", init.result?.serverInfo?.name === "BlessedMind");

const list = await call({ jsonrpc: "2.0", id: 2, method: "tools/list" });
const names = (list.result?.tools ?? []).map((t) => t.name);
check("tools/list returns all 11 tools", names.length === 11, names.join(", "));

const dash = await call({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: { name: "get_dashboard", arguments: {} },
});
const text = dash.result?.content?.[0]?.text ?? "";
const ok = !dash.result?.isError && text.includes('"date"');
check("get_dashboard reads real data", ok, ok ? text.slice(0, 80).replace(/\s+/g, " ") : text.slice(0, 120));

// Refresh must work, or you would be signing in again in an hour.
const refreshed = await fetch(`${BASE}/token`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token.refresh_token,
    client_id: client.client_id,
  }),
}).then((r) => r.json());
check("refresh token yields a new access token", !!refreshed.access_token, refreshed.error ?? "");

console.log(`\n${pass} passed, ${fail} failed.\n`);
process.exit(fail > 0 ? 1 : 0);
