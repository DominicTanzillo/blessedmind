# BlessedMind MCP server

A local stdio MCP server exposing tasks, habits, pomodoros and the focus batch
to Claude. It is spawned as a child process by whichever Claude client you run
and speaks over stdin/stdout — **it opens no port and has no URL**. There is
nothing to reach from the internet, which is the point: the hosted variant this
replaces (`mcp-remote/`, deleted in `527eb6b`) was a public endpoint carrying an
anon key against open policies.

## Why it signs in

`sql/002_require_auth.sql` dropped every permissive policy and re-granted access
`FOR ALL TO authenticated`. The anon key alone now satisfies no policy — and RLS
*hides* rows rather than erroring, so an unauthenticated read returns `[]` and
looks exactly like "you have no tasks".

So the server signs in with `signInWithPassword` before its first query and
every PostgREST call carries a real JWT. Bad or missing credentials fail loudly
instead of quietly reporting an empty database.

## Setup

```bash
cd mcp-server
npm install
cp .env.example .env      # then fill in SUPABASE_PASSWORD
```

`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_EMAIL` match the app's root
`.env` (`VITE_` prefixes dropped). `SUPABASE_PASSWORD` is the password for that
Supabase Auth account.

`.env` is gitignored and is **never** copied by the plugin sync — each machine
keeps its own. Nothing you can zip or commit carries the password.

Verify it starts:

```bash
node index.js    # missing credentials exit 1 with a message; otherwise it waits on stdio
```

## Where it runs

**Per-device setup instructions are in [SETUP.md](SETUP.md)** — macOS Claude
desktop app, Claude Code, and what the iPhone would require.

This Windows machine is the development box and is **deliberately not connected**:
`.mcp.json` still registers the server, but `.claude/settings.local.json` lists
it under `disabledMcpjsonServers`. Editing the server here does not expose your
data to Claude here. Remove that entry to change your mind.

The consuming devices are the two MacBooks. The short version for each:

- **Claude desktop app** — clone, `npm install`, create `.env`, then add the
  server to `claude_desktop_config.json` using absolute paths for both `node`
  and `index.js`. SETUP.md covers the `PATH` trap that makes this fail silently.
- **Claude Code** — run `npm run sync:plugin` and install `blessedmind-plugin/`,
  which bundles the server, its dependencies and the slash commands and resolves
  its own location via `${PLUGIN_DIR}`, so there are no paths to edit.

Run `npm run sync:plugin` after editing `index.js`. Skipping it is how the
plugin's copy silently drifted onto the retired v1 schema.

**iPhone cannot use this server at all** — the mobile app cannot launch a local
process. That needs a hosted connector, which is a separate build; see the last
section of SETUP.md.

## Tools

| Tool | Notes |
| --- | --- |
| `list_tasks` | `items` where `item_type='task'` and no parent; multi-step tasks include their steps |
| `create_task` | Optional `steps[]` creates child `step` rows |
| `update_task` | Partial update; maintains `starred_at` for focus-batch FIFO ordering |
| `complete_task` | Accepts a task or a step; the last outstanding step completes its parent |
| `delete_task` | Cascades to steps |
| `list_grinds` | Habits with streak, plus `completed_today` / `enabled_today` |
| `create_grind` | `disabled_days` is 0=Sunday … 6=Saturday |
| `complete_grind` | Extends the streak and writes the `habit_entry` the garden counts; a second call the same day is a no-op |
| `list_pomodoros` / `create_pomodoro` | `pomodoros_v2` |
| `get_dashboard` | Habits due, focus batch, overdue, due today, recent pomodoros |

Tool names are load-bearing: `.claude/commands/*.md` call them as
`mcp__blessedmind__<name>`. Renaming one silently breaks those slash commands.

## Schema

Current tables are `items`, `habit_templates`, `focus_batch`, `garden_artifacts`,
`pomodoros_v2` and `time_audits`. The v1 tables (`tasks`, `grinds`, `pomodoros`,
`active_batch`, `prayers`) still exist as stale copies and are **not** used here.
