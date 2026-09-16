#!/usr/bin/env node
/**
 * Delete local RSVP store so the next request re-seeds from lib/rsvp/seed.ts.
 *
 *   node scripts/reset-rsvp-seed.mjs
 */

import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, ".data", "rsvp.json");

if (existsSync(file)) {
  unlinkSync(file);
  console.log("Removed .data/rsvp.json");
} else {
  console.log("No .data/rsvp.json — seed will apply on first RSVP request.");
}

console.log(
  "Restart `npm run dev` if it is running, then import guests or test with RSVP_INCLUDE_E2E_FIXTURE=1 in CI.",
);
