import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// This command always targets an isolated local emulator. It cannot accept remote arguments.
if (process.argv.length > 2) throw new Error("This local-only command accepts no arguments");
const root = process.cwd();
await mkdir(resolve(root, ".wrangler"), { recursive: true });
const config = resolve(root, ".wrangler/local-db.json");
await writeFile(config, JSON.stringify({ name: "bib-local", compatibility_date: "2026-07-01",
  d1_databases: [{ binding: "DB", database_name: "site-creator-d1", database_id: "00000000-0000-4000-8000-000000000000" }]
}));
for (const file of (await readdir(resolve(root, "drizzle"))).filter((f) => f.endsWith(".sql")).sort()) {
  const sql = await readFile(resolve(root, "drizzle", file), "utf8");
  if (!/\b(CREATE|ALTER|DROP)\s/i.test(sql)) continue;
  const result = spawnSync(process.execPath, [resolve(root, "node_modules/wrangler/bin/wrangler.js"),
    "d1", "execute", "DB", "--local", "--config", config, "--persist-to", resolve(root, ".wrangler/state"),
    "--file", resolve(root, "drizzle", file)], { stdio: "inherit", env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("Local schema ready. No production database was contacted.");
