# Setting up BlessedMind on each device

Which Claude surface you use decides which kind of server you need. This is not
a preference — it is a hard split, and it is the single most important thing on
this page:

| Device | Claude surface | Local stdio server | Hosted remote server |
| --- | --- | --- | --- |
| MacBook | Claude desktop app | **Works** | Works |
| MacBook | Claude Code | **Works** | Works |
| iPhone / iPad | Claude mobile app | **Impossible** | **Only option** |
| Any browser | claude.ai | **Impossible** | **Only option** |

A local stdio server is a program on your machine that Claude launches and talks
to over a pipe. The iPhone app cannot launch a program on your Mac — there is
nothing to pipe to. No amount of configuration changes this. **iPhone requires a
hosted server reachable over HTTPS**, which is a different piece of software
(see [the last section](#iphone-what-it-would-actually-take)).

The two MacBooks work today with what is already in this repo. Start there.

---

## Both MacBooks — Claude desktop app

Repeat all of this on each laptop. It takes about five minutes per machine.

### 1. Install Node

```bash
node --version     # need v18 or newer
```

If that fails, install it — `brew install node`, or from nodejs.org.

### 2. Get the code

```bash
git clone <your repo URL> ~/AllostaticReducer
cd ~/AllostaticReducer/mcp-server
npm install
```

### 3. Create the credentials file

```bash
cp .env.example .env
```

Then edit `.env` and fill in all four values. `SUPABASE_URL`,
`SUPABASE_ANON_KEY` and `SUPABASE_EMAIL` are the same as the web app's root
`.env` with the `VITE_` prefixes dropped; `SUPABASE_PASSWORD` is the password
for that Supabase account.

**Type the password on each laptop rather than copying `.env` between them.**
It is gitignored and never synced on purpose — see [Why the credentials work
this way](#why-the-credentials-work-this-way).

### 4. Check it runs before involving Claude

```bash
node index.js
```

Missing or wrong credentials exit immediately with a message saying which. If it
prints nothing and just sits there, it is working — it is waiting for Claude on
stdin. Press Ctrl-C.

Debug this now if it fails. Claude Desktop reports a broken server only as a
silent absence of tools, which is miserable to diagnose.

### 5. Find your absolute paths

Claude Desktop needs both, and this is where most setups go wrong:

```bash
which node       # e.g. /opt/homebrew/bin/node
pwd              # e.g. /Users/dominic/AllostaticReducer/mcp-server
```

Use the **full path to node**, not the bare word `node`. Claude Desktop is
launched from Finder, not from your shell, so it never reads `.zshrc` and its
`PATH` usually does not include Homebrew. `"command": "node"` is the most common
reason a server silently fails to appear.

Apple Silicon Macs usually report `/opt/homebrew/bin/node`; Intel Macs
`/usr/local/bin/node`. If you use nvm the path contains a version number and
**changes when you switch Node versions** — re-check it after any nvm change.

### 6. Point Claude Desktop at it

Open Claude Desktop → **Settings → Developer → Edit Config**. That opens
`~/Library/Application Support/Claude/claude_desktop_config.json`. If the file
is empty, paste this whole thing; if it already has servers, add just the
`blessedmind` entry inside the existing `mcpServers` object.

```json
{
  "mcpServers": {
    "blessedmind": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/dominic/AllostaticReducer/mcp-server/index.js"]
    }
  }
}
```

Substitute the two paths from step 5. Both must be absolute — `~` is not
expanded here, and relative paths resolve against an unpredictable directory.

### 7. Restart properly

**Quit with Cmd-Q.** Closing the window leaves the app running and the config
unread. Reopen it, and BlessedMind's tools appear in the tools menu in a new
chat.

### 8. Confirm

Ask it: *"What's on my plate today?"* It should call `get_dashboard` and come
back with your habits and focus batch. If the tools are missing, see
[Troubleshooting](#troubleshooting).

---

## A MacBook running Claude Code instead

If you want the tools in the terminal rather than the desktop app, install the
bundled plugin — it carries the server, its dependencies and the `/plan`,
`/focus`, `/habits`, `/tasks` and `/ideate` commands, and resolves its own
location, so there are no absolute paths to edit.

On the Windows machine, from the repo root:

```bash
npm run sync:plugin
```

Copy `blessedmind-plugin/` to the Mac, install it as a Claude Code plugin, and
create `server/.env` there (step 3 above). The sync deliberately does not copy
`.env`, so the copy you move carries no password.

---

## Read and write

The server reads **and writes**. Claude can create tasks, edit them, tick off
habits, complete a task (rolling its parent up when the last step is done) and
log pomodoros. It is not a read-only view of your data.

The one thing it cannot do is delete. `delete_task` exists in the server but is
blocked in this repo's Claude Code settings, on the reasoning that a coach
should never destroy your data — completing is the normal operation, and the
web app can still delete. That block lives in `.claude/settings.local.json` and
is one line to remove.

Claude Desktop has its own approval model and does not read that file: it asks
you per tool call the first time, and you can approve for the conversation. If
you want deletion off on a Mac too, remove the `delete_task` tool from
`index.js` — a server that does not offer it cannot be talked into it.

---

## Why the credentials work this way

Since `sql/002_require_auth.sql`, every table grants access `FOR ALL TO
authenticated`. The anon key on its own satisfies no policy, and RLS *hides*
rows rather than erroring — so an unauthenticated read returns an empty list
that looks exactly like "you have no tasks". That is why the server signs in
before its first query and refuses to start without credentials.

`.env` is gitignored, never committed, and never copied by `npm run
sync:plugin`. Each machine holds its own. That way nothing you can zip, sync or
hand to someone carries the account password — which is the failure the deleted
`mcp-remote/` Vercel app represented, and worth not rebuilding by accident.

---

## Troubleshooting

**Tools don't appear in Claude Desktop.** Almost always the `node` path (step 5)
or a config typo. Check the logs:

```bash
tail -n 50 ~/Library/Logs/Claude/mcp-server-blessedmind.log
tail -n 50 ~/Library/Logs/Claude/mcp.log
```

`spawn node ENOENT` means the `command` path is wrong. Also confirm the config
file is valid JSON — one trailing comma silently disables every server in it:

```bash
python3 -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**"Supabase sign-in failed: Invalid login credentials."** The server is running
correctly and reaching Supabase — the email or password in `.env` is wrong.

**Tools appear but everything is empty.** You are on an old build. The current
server errors loudly instead of returning empty; a silent empty result means it
is still reading the retired v1 tables. Re-pull and `npm install`.

**It worked, then stopped after a Node upgrade.** nvm moved the binary. Re-run
`which node` and update the config.

---

## iPhone: what it would actually take

The mobile app only talks to **connectors** — MCP servers it reaches over HTTPS,
authenticated per request. So the iPhone needs the server to be *hosted*
somewhere, which is the thing the `mcp-remote/` Vercel app did badly.

Doing it properly is different from what was deleted, and the difference is
worth stating precisely. That app was dangerous because three things stacked:
a public URL, an anon key baked into it, and wide-open table policies — together
a public REST endpoint onto the database. A connector done right shares none of
that shape:

- Every request must carry an OAuth bearer token; an unauthenticated request
  gets a 401 and no data.
- The server holds no standing credential an anonymous caller can borrow.
- The `authenticated`-only policies still enforce access at the database, so
  even a flaw in the server does not open the tables.

Leaking the URL then costs nothing — which is the actual test.

**That connector now exists, built and tested locally: `../connector/`.** It runs
on Cloudflare Workers (free tier, no cold starts, free HTTPS URL) and its auth
path is documented in [`../connector/AUTH.md`](../connector/AUTH.md) and checked
by `../connector/verify.mjs`.

It would **replace** everything on this page, not add to it. One connector
serves both MacBooks, the iPhone and claude.ai, with no Node install, no
per-machine `.env`, no absolute paths, and no copies to drift apart. You sign in
once, on a laptop, at a single password box — never on the phone.

So the practical choice is:

- Want the Macs working in the next ten minutes, phone not required? Follow this
  page.
- Want the phone, and to stop doing per-device setup? Deploy the connector
  instead and skip this page entirely. See
  [`../connector/README.md`](../connector/README.md).

**Nothing is deployed.** The connector has only ever run on localhost.
