#!/usr/bin/env node
// Copy the MCP server from mcp-server/ into blessedmind-plugin/server/.
//
// The plugin used to be assembled by hand, which is how its copy drifted onto
// the v1 schema while mcp-server/ moved on. Run this after touching the server
// so the two cannot disagree.
//
// .env is deliberately NOT copied. Credentials are per-machine: each computer
// writes its own blessedmind-plugin/server/.env, so packaging the plugin (zip,
// USB, sync folder) never carries the account password with it.

import { cp, mkdir, readFile, writeFile, rm, access } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "mcp-server");
const dest = join(root, "blessedmind-plugin", "server");

const exists = (p) => access(p).then(() => true, () => false);

await mkdir(dest, { recursive: true });

for (const file of [
  "index.js",
  "tools.mjs",
  "session.mjs",
  "package.json",
  "package-lock.json",
  ".env.example",
  "README.md",
  "SETUP.md",
]) {
  const from = join(src, file);
  if (await exists(from)) {
    await cp(from, join(dest, file));
    console.log(`  ${file}`);
  }
}

// Replace rather than merge, so a removed dependency actually disappears.
await rm(join(dest, "node_modules"), { recursive: true, force: true });
await cp(join(src, "node_modules"), join(dest, "node_modules"), { recursive: true });
console.log("  node_modules/");

// Keep the plugin manifest's version in step with the server's.
const { version } = JSON.parse(await readFile(join(src, "package.json"), "utf8"));
const manifestPath = join(root, "blessedmind-plugin", ".claude-plugin", "plugin.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.version !== version) {
  manifest.version = version;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  plugin.json -> v${version}`);
}

// Slash commands live in .claude/commands/ and ship with the plugin.
await mkdir(join(root, "blessedmind-plugin", "commands"), { recursive: true });
await cp(join(root, ".claude", "commands"), join(root, "blessedmind-plugin", "commands"), {
  recursive: true,
});
console.log("  commands/");

const hasEnv = await exists(join(dest, ".env"));
console.log(
  `\nPlugin synced to v${version}.` +
    (hasEnv
      ? ""
      : "\nNext: create blessedmind-plugin/server/.env on this machine (see .env.example).")
);
