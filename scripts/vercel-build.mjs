import { spawnSync } from "node:child_process";

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasDirectUrl = Boolean(process.env.DIRECT_URL);

function looksLikePooler(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.includes("pooler") || u.port === "6543";
  } catch {
    return url.includes("pooler") || url.includes(":6543");
  }
}

// Generate client even on first deploy (no DB needed).
run("npx", ["prisma", "generate"]);

if (!hasDatabaseUrl) {
  console.log("[llm-league] DATABASE_URL is not set. Skipping prisma migrate deploy (first deploy is OK).");
} else {
  const usePooler = looksLikePooler(process.env.DATABASE_URL);
  if (usePooler && !hasDirectUrl) {
    console.log(
      "[llm-league] DATABASE_URL looks like a pooler/pgbouncer URL, but DIRECT_URL is not set. Skipping prisma migrate deploy."
    );
    console.log("[llm-league] Set DIRECT_URL to a non-pooled Postgres URL (usually port 5432) and redeploy.");
  } else if (hasDirectUrl) {
    run("npx", ["prisma", "migrate", "deploy"], {
      env: { ...process.env, DATABASE_URL: process.env.DIRECT_URL }
    });
  } else {
    run("npx", ["prisma", "migrate", "deploy"]);
  }
}

run("npx", ["next", "build"]);
