#!/usr/bin/env node
/**
 * Apply RSVP Postgres schema (Supabase migration SQL).
 *
 * Requires POSTGRES_URL (injected by Vercel ↔ Supabase integration).
 *
 *   node scripts/apply-supabase-rsvp-schema.mjs
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = path.join(
  root,
  "supabase/migrations/202608240002_rsvp.sql",
);

function connectionString() {
  return (
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    null
  );
}

async function main() {
  const url = connectionString();
  if (!url) {
    console.error(
      "POSTGRES_URL is required. Pull env from Vercel or set DATABASE_URL locally.",
    );
    process.exit(1);
  }

  const sql = readFileSync(migrationPath, "utf8");
  const client = new pg.Client({
    connectionString: url,
    ssl: url.includes("supabase") ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("RSVP schema applied:", migrationPath);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
