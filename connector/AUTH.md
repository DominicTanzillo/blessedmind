# The auth path

What actually happens, end to end, and why each step is there. Every claim below
is checked by `verify.mjs` — run it and watch.

## You sign in once

```
┌─ ONCE, on a laptop, in a browser ───────────────────────────────────┐
│                                                                     │
│  You paste the connector URL into claude.ai                         │
│         │                                                           │
│         ▼                                                           │
│  Claude fetches /.well-known/oauth-protected-resource  ← RFC 9728   │
│  then /.well-known/oauth-authorization-server          ← RFC 8414   │
│         │   "where do I authorize, and how?"                        │
│         ▼                                                           │
│  Claude POSTs /register                                ← RFC 7591   │
│         │   registers itself, gets a client_id                      │
│         │   (this is why you never copy a client ID or secret)      │
│         ▼                                                           │
│  Browser opens /authorize?...&code_challenge=XYZ       ← PKCE       │
│         │                                                           │
│         ▼                                                           │
│  ┌───────────────────────────────┐                                  │
│  │  Connect BlessedMind          │  ONE password box.               │
│  │  Signing in as you@email      │  No 2FA. No code. No app.        │
│  │  Password: [____________]     │                                  │
│  └───────────────────────────────┘                                  │
│         │                                                           │
│         │  Worker asks Supabase Auth: is this password right?       │
│         │  (the Worker never stores or compares a password)         │
│         ▼                                                           │
│  Redirect back to Claude with a one-time code                       │
│         │                                                           │
│         ▼                                                           │
│  Claude POSTs /token with the code + the PKCE verifier              │
│         │                                                           │
│         ▼                                                           │
│  access token (1 hour)  +  refresh token (long-lived)               │
└─────────────────────────────────────────────────────────────────────┘

┌─ EVERY TIME AFTER, on any device, forever ──────────────────────────┐
│                                                                     │
│  Claude → POST /mcp   Authorization: Bearer <access token>          │
│         │                                                           │
│         ▼                                                           │
│  OAuthProvider validates the token BEFORE your code runs            │
│         │                                                           │
│         ├── invalid/expired/missing → 401, handler never called,    │
│         │                             no database connection made   │
│         ▼                                                           │
│  MCP handler runs, signs in to Supabase, returns tool results       │
│                                                                     │
│  When the access token expires, Claude silently exchanges the       │
│  refresh token for a new one. You see nothing.                      │
└─────────────────────────────────────────────────────────────────────┘
```

The iPhone never renders that password box. Connectors are account-level: you
add it once on claude.ai and the phone and the second MacBook inherit it.

## Why each piece is there

**PKCE (`code_challenge` / `code_verifier`).** The authorization code comes back
through a browser redirect, where it can leak — browser history, a referrer
header, a malicious app claiming the redirect URI. PKCE makes a stolen code
useless: the token endpoint only accepts it alongside the verifier that produced
the challenge, which never left Claude. `verify.mjs` proves this by replaying a
valid code with the wrong verifier and watching it fail.

**Dynamic client registration.** Without it, you would generate a client ID and
secret by hand and paste them into Claude. With it, Claude registers itself on
first contact. Fewer secrets in existence, none of them in your clipboard.

**Redirect URI validation.** The classic OAuth attack is to take a legitimate
authorization URL and swap the redirect for one you control, so the code lands
in your hands. The provider validates the redirect against what the client
registered, on every call — including the POST, which re-parses the request
rather than trusting the form. `verify.mjs` attempts exactly this swap and
confirms a 400.

**The token check happens before your code.** `/mcp` is declared as `apiRoute`,
so `OAuthProvider` wraps it. An unauthenticated request is rejected by the
library; the MCP handler is never constructed, so no Supabase client is built
and no query is issued. Being unauthenticated is not "denied data" — it is
never reaching the code that could fetch any.

**Rate limiting.** A password box on the public internet gets guessed at. Ten
failures per IP in fifteen minutes, counted in KV, then 429.

## Where the secrets live

| Secret | Where | Visible to |
| --- | --- | --- |
| Supabase password | Cloudflare secret (`wrangler secret put`) | nobody — not readable back after it is set |
| Supabase anon key | Cloudflare secret | public by design, but kept out of the public repo alongside the rest |
| Account email | Cloudflare secret | it is the username half of the login, and this repo is public |
| OAuth tokens | Cloudflare KV, issued by the provider | Claude holds its own; you can revoke the grant |
| Your password | never stored anywhere in this system | — |

The Worker holds the Supabase password because it signs in on your behalf. Being
honest about the tradeoff: **someone who compromised the Worker itself could read
that secret.** What they could not do is reach it through the connector, because
every route to the tool layer runs through token validation first.

The alternative — carrying your Supabase session in the OAuth grant instead —
sounds stronger but breaks in practice: Supabase rotates refresh tokens on use,
and a grant's props are fixed at authorization, so the stored session would go
stale within the hour and strand you at a login screen. A Cloudflare secret is
the right call here, and it is a real improvement on the deleted `mcp-remote/`,
which had no authentication at all.

## Compared to what was deleted

`mcp-remote/` was dangerous because three things stacked, not because it was
hosted:

| | old `mcp-remote/` | this connector |
| --- | --- | --- |
| Reaching the data | anyone with the URL | valid OAuth token only |
| Credential exposure | anon key shipped in the deployment | password is a write-only Cloudflare secret |
| Database policies | wide open to `anon` | `authenticated` only, enforced independently |
| If the URL leaks | full read/write on everything | 401 |

That last row is the test worth applying to any hosted thing: assume the URL is
public, because eventually it is. Here, it costs nothing.

## Revoking

If you ever want to cut Claude off:

```bash
npx wrangler kv key list --binding OAUTH_KV        # see the grants
npx wrangler secret put SUPABASE_PASSWORD          # after changing it in Supabase
```

Changing the Supabase password invalidates the Worker's access immediately.
Deleting the grant from KV forces Claude back to the login screen. Either works;
the first is the bigger hammer.
