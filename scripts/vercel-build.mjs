import { spawnSync } from "node:child_process";

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// Generate client even on first deploy (no DB needed).
run("npx", ["prisma", "generate"]);

if (!hasDatabaseUrl) {
  console.log("[llm-league] DATABASE_URL is not set. Skipping prisma migrate deploy (first deploy is OK).");
} else {
  run("npx", ["prisma", "migrate", "deploy"]);
}

run("npx", ["next", "build"]);
