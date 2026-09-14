# BlessedMind connector

An OAuth-protected MCP server on Cloudflare Workers. This is what claude.ai, the
Mac desktop app and **the iPhone** talk to.

The auth path is explained in [AUTH.md](AUTH.md), and `verify.mjs` proves it.

## Why hosted at all

Anthropic's cloud connects to the connector — not your laptop. That is what lets
the iPhone use it, and it is also why the thing has to be reachable on the
internet. A local stdio server (`../mcp-server/`) cannot serve a phone; there is
nothing for the phone to launch.

## Why Cloudflare, and is it free

Yes, free, and comfortably so for one person.

- **Workers free tier: 100,000 requests/day.** A heavy day of talking to your
  task manager is a few hundred.
- **No cold starts.** V8 isolates start in about a millisecond. This matters:
  Render's and Fly's free tiers sleep, and a connector that takes 30 seconds to
  wake makes Claude look broken.
- **KV free tier** covers the OAuth token storage.
- **A free `*.workers.dev` HTTPS URL**, so there is no domain to buy and no TLS
  to configure.
- **`@cloudflare/workers-oauth-provider`** is Cloudflare's own library, written
  for exactly this job — protecting a remote MCP server. It implements the parts
  you do not want hand-rolled: dynamic client registration, PKCE, token issuance
  and rotation, bearer validation. Roughly 300 lines of security-critical code
  that is someone else's job to get right.

Runners-up and why not: **Vercel** works and is free, but its serverless model
fits this worse and you have history there. **Render** and **Fly** sleep on free
tiers. **Supabase Edge Functions** would keep everything with one vendor, but
you would hand-write the whole OAuth server — the thing Cloudflare hands you.

## Do I need a new git repo

**No.** This is a subdirectory of the existing repo, and that is the better
arrangement — it shares `../mcp-server/tools.mjs` with the local server, so the
two cannot drift onto different schemas the way the plugin's hand-copied server
did.

Wrangler deploys from your machine by pushing the bundle; it does not need a Git
remote at all. From this directory:

```bash
npx wrangler deploy
```

That is the whole deployment story. If you later want pushes to deploy
automatically, Cloudflare's Git integration takes a **root directory** setting —
point it at `connector/` and the monorepo works unchanged. Still no new repo.

## Deploying

Nothing here is deployed yet. When you want it:

```bash
cd connector
npm install
npx wrangler login                                  # opens a browser, once

npx wrangler kv namespace create OAUTH_KV           # prints an id
#   paste that id into wrangler.jsonc

npx wrangler secret put SUPABASE_ANON_KEY           # paste when prompted
npx wrangler secret put SUPABASE_EMAIL              # paste when prompted
npx wrangler secret put SUPABASE_PASSWORD           # paste when prompted

npx wrangler deploy
```

The last command prints your URL, something like
`https://blessedmind-connector.<your-subdomain>.workers.dev`.

Check the deployed Worker before handing it to Claude:

```bash
node verify.mjs https://blessedmind-connector.<your-subdomain>.workers.dev
```

Then in **claude.ai → Settings → Connectors → Add custom connector**, paste the
URL with `/mcp` on the end. Claude registers itself, opens the password box
once, and that is the last you see of it. Both MacBooks and the iPhone pick it
up from your account — there is nothing to install on the phone.

## Running it locally first

```bash
cp .dev.vars.example .dev.vars     # then fill in the three values
npx wrangler dev --port 8788
```

In another terminal:

```bash
node verify.mjs
```

With `SUPABASE_PASSWORD` left blank it runs 11 checks and skips the real
sign-in. Fill the password in and it runs the whole path — sign-in, code
exchange, PKCE replay rejection, `tools/list`, a real `get_dashboard` against
your data, and a token refresh.

`.dev.vars` is gitignored and must stay that way.

## What is in here

| File | |
| --- | --- |
| `src/index.js` | the Worker: OAuth provider config, login page, MCP endpoint |
| `verify.mjs` | walks the auth path and checks every claim in AUTH.md |
| `wrangler.jsonc` | bindings and non-secret vars |
| `AUTH.md` | how the auth works and why |

Tools live in `../mcp-server/tools.mjs`, shared with the local stdio server.
Wrangler bundles that file at deploy time, so the connector is self-contained
once deployed.

## Timezone

Cloudflare runs in UTC. Left alone, "today" would roll over mid-evening in the
Americas and mark habits missed several hours early. `TIMEZONE` in
`wrangler.jsonc` fixes the date arithmetic to your zone; it is set to
`America/New_York`.

## Cost if it ever outgrew free

The Workers paid plan is $5/month and raises limits far past anything a single
person's task manager will do. You will not reach it.
