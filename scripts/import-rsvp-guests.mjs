#!/usr/bin/env node
/**
 * Import invitation households/guests from CSV into local .data/rsvp.json
 * (Supabase not supported — use Table Editor or SQL for production).
 *
 * CSV columns (header row required):
 *   household_name, guest_name, invitation_code, email
 *
 * - invitation_code: optional per row; only needed once per household (first row)
 * - Every invitation includes the welcome party and ceremony & reception.
 *
 *   node scripts/import-rsvp-guests.mjs guests.csv
 */

import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, ".data");
const dataFile = path.join(dataDir, "rsvp.json");

function sessionSecret() {
  return (
    process.env.RSVP_SESSION_SECRET ||
    process.env.WEDDING_ADMIN_SESSION_SECRET ||
    process.env.WEDDING_ADMIN_PASSWORD ||
    "dev-rsvp-secret"
  );
}

function hashInvitationCode(code) {
  return createHash("sha256")
    .update(`${sessionSecret()}:invite:${code.trim().toUpperCase()}`)
    .digest("hex");
}

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV needs a header row and at least one data row.");
  }
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });
}

function standardEventIds() {
  return ["event-welcome-party", "event-ceremony-reception"];
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-rsvp-guests.mjs guests.csv");
  process.exit(1);
}

const raw = readFileSync(path.resolve(csvPath), "utf8");
const rows = parseCsv(raw);

let base;
if (!existsSync(dataFile)) {
  console.error(
    "Missing .data/rsvp.json — run `npm run reset:rsvp-seed` once, then import again.",
  );
  process.exit(1);
}
base = JSON.parse(readFileSync(dataFile, "utf8"));
base.households = [];
base.guests = [];

const now = new Date().toISOString();
const householdByName = new Map();

for (const row of rows) {
  const householdName = row.household_name || row.householdName;
  const guestName = row.guest_name || row.guestName;
  if (!householdName || !guestName) {
    console.warn("Skipping row missing household_name or guest_name:", row);
    continue;
  }

  let household = householdByName.get(householdName);
  if (!household) {
    const code = (row.invitation_code || row.invitationCode || "").trim();
    household = {
      id: randomUUID(),
      displayName: householdName,
      invitationCodeHash: code ? hashInvitationCode(code) : null,
      invitationCodeHint: code ? code.slice(0, 3).toUpperCase() : null,
      email: (row.email || "").trim() || null,
      phone: null,
      notesAdmin: "",
      rsvpStatus: "pending",
      eventIds: standardEventIds(),
      maxPlusOnes: 0,
      createdAt: now,
      updatedAt: now,
    };
    householdByName.set(householdName, household);
    base.households.push(household);
  }

  base.guests.push({
    id: randomUUID(),
    householdId: household.id,
    fullName: guestName,
    normalizedName: normalizeName(guestName),
    isChild: false,
    isPlusOne: false,
    plusOneNamed: true,
    sortOrder: base.guests.filter((g) => g.householdId === household.id).length + 1,
  });
}

mkdirSync(dataDir, { recursive: true });
writeFileSync(dataFile, JSON.stringify(base, null, 2), "utf8");
console.log(
  `Imported ${householdByName.size} households and ${rows.length} guest rows into ${dataFile}`,
);
console.log("Restart dev server and test /rsvp.");
