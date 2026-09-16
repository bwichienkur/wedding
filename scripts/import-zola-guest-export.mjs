#!/usr/bin/env node
/**
 * Import a Zola-style guest export (Title, First Name, Last Name, …) into .data/rsvp.json.
 *
 * Household rules:
 * - Rows with a last name join the household keyed by that last name (same surname = one invite).
 * - Rows with no last name join the previous row’s household (plus-ones, “Husband”, children, etc.).
 *
 *   node scripts/import-zola-guest-export.mjs path/to/export.csv [merges.json]
 *
 * Optional merges.json — array of { "displayName": "…", "members": ["Full Name", …] }
 * to combine couples/families split by the automatic rules (see docs/RSVP-GUEST-IMPORT.md).
 *
 * Uses RSVP_SESSION_SECRET (or dev default) for invitation code hashes.
 * Generates one invitation code per household (not stored in git — only in .data/rsvp.json).
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

function normalizeKey(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Minimal RFC-style CSV parse (quoted fields). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r") i += 1;
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);

  if (rows.length < 2) {
    throw new Error("CSV needs a header row and at least one guest row.");
  }

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? "").trim();
    });
    return record;
  });
}

function guestFullName(record) {
  const title = record.Title?.trim() ?? "";
  const first = record["First Name"]?.trim() ?? "";
  const last = record["Last Name"]?.trim() ?? "";
  const suffix = record.Suffix?.trim() ?? "";

  if (last) {
    const parts = [title, first, last, suffix].filter(Boolean);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  if (first) return first.replace(/\s+/g, " ").trim();
  return "Guest";
}

function householdDisplayName(guestNames, key) {
  const titled =
    key.length > 2
      ? key.replace(/\b\w/g, (c) => c.toUpperCase())
      : key.toUpperCase();

  if (guestNames.length === 1) return guestNames[0];
  if (guestNames.length === 2) {
    const a = guestNames[0].split(" ").pop() === guestNames[1].split(" ").pop();
    if (a) {
      const firstA = guestNames[0].replace(/\s+\S+$/, "").trim();
      const firstB = guestNames[1].replace(/\s+\S+$/, "").trim();
      const last = guestNames[0].split(" ").slice(-1)[0];
      return `${firstA} & ${firstB} ${last}`;
    }
    return `${guestNames[0]} & ${guestNames[1]}`;
  }
  return `The ${titled} Family`;
}

function makeInvitationCode(key, used) {
  const base = key.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || "INVITE";
  let code = `${base}27`;
  let n = 1;
  while (used.has(code)) {
    code = `${base}${String(n).padStart(2, "0")}`;
    n += 1;
  }
  used.add(code);
  return code;
}

function standardEventIds() {
  return ["event-welcome-party", "event-ceremony-reception"];
}

function applyHouseholdMerges(base, merges, usedCodes, householdCodes) {
  for (const merge of merges) {
    const wanted = new Set(merge.members.map((name) => normalizeName(name)));
    const matchedGuests = base.guests.filter((guest) =>
      wanted.has(normalizeName(guest.fullName)),
    );
    if (matchedGuests.length === 0) {
      console.warn("Merge skipped (no names matched):", merge.displayName);
      continue;
    }
    if (matchedGuests.length !== merge.members.length) {
      const found = matchedGuests.map((g) => g.fullName);
      const missing = merge.members.filter(
        (name) => !found.some((f) => normalizeName(f) === normalizeName(name)),
      );
      console.warn(
        `Merge partial for "${merge.displayName}" — missing:`,
        missing.join(", "),
      );
    }

    const oldHouseholdIds = new Set(matchedGuests.map((g) => g.householdId));
    const code = makeInvitationCode(
      normalizeKey(merge.displayName),
      usedCodes,
    );
    const householdId = randomUUID();
    const now = new Date().toISOString();

    base.households.push({
      id: householdId,
      displayName: merge.displayName,
      invitationCodeHash: hashInvitationCode(code),
      invitationCodeHint: code.slice(0, 3),
      email: null,
      phone: null,
      notesAdmin: "",
      rsvpStatus: "pending",
      eventIds: standardEventIds(),
      maxPlusOnes: 0,
      createdAt: now,
      updatedAt: now,
    });

    merge._code = code;
    householdCodes.set(householdId, code);

    matchedGuests.forEach((guest, index) => {
      guest.householdId = householdId;
      guest.sortOrder = index + 1;
    });

    base.households = base.households.filter(
      (household) => !oldHouseholdIds.has(household.id),
    );
    for (const oldId of oldHouseholdIds) {
      householdCodes.delete(oldId);
    }
    base.guests = base.guests.filter(
      (guest) =>
        !oldHouseholdIds.has(guest.householdId) ||
        matchedGuests.some((m) => m.id === guest.id),
    );
  }

  const guestCounts = new Map();
  for (const guest of base.guests) {
    guestCounts.set(guest.householdId, (guestCounts.get(guest.householdId) ?? 0) + 1);
  }
  base.households = base.households.filter(
    (household) => (guestCounts.get(household.id) ?? 0) > 0,
  );
}

const csvPath = process.argv[2];
const mergesPath = process.argv[3];
if (!csvPath) {
  console.error(
    "Usage: node scripts/import-zola-guest-export.mjs export.csv [merges.json]",
  );
  process.exit(1);
}

function loadBaseStore() {
  if (existsSync(dataFile)) {
    return JSON.parse(readFileSync(dataFile, "utf8"));
  }
  mkdirSync(dataDir, { recursive: true });
  return {
    events: [
      {
        id: "event-welcome-party",
        slug: "welcome-party",
        title: "Welcome Party",
        startsAt: "2027-05-14T18:00:00",
        location: "Lake Wales, Florida — details to follow",
        isAdultsOnly: false,
        allowsPlusOnes: true,
        collectMeals: false,
        sortOrder: 0,
      },
      {
        id: "event-ceremony-reception",
        slug: "ceremony-reception",
        title: "Ceremony & Reception",
        startsAt: "2027-05-15T16:00:00",
        location: "Bella Cosa, Lake Wales, Florida",
        isAdultsOnly: false,
        allowsPlusOnes: true,
        collectMeals: false,
        sortOrder: 1,
      },
    ],
    mealOptions: [],
    households: [],
    guests: [],
    responses: [],
    submissions: [],
    history: [],
    auditLogs: [],
  };
}

const raw = readFileSync(path.resolve(csvPath), "utf8");
const records = parseCsv(raw);
const base = loadBaseStore();
base.households = [];
base.guests = [];

const now = new Date().toISOString();
/** @type {Map<string, { id: string, displayName: string, guestNames: string[], code: string }>} */
const householdsByKey = new Map();
let previousKey = null;
const usedCodes = new Set();

for (const record of records) {
  const fullName = guestFullName(record);
  const last = record["Last Name"]?.trim() ?? "";
  let key;
  if (last) {
    key = normalizeKey(last);
    previousKey = key;
  } else if (previousKey) {
    key = previousKey;
  } else {
    key = normalizeKey(fullName);
  }

  let bucket = householdsByKey.get(key);
  if (!bucket) {
    const code = makeInvitationCode(key, usedCodes);
    bucket = {
      id: randomUUID(),
      displayName: "",
      guestNames: [],
      code,
    };
    householdsByKey.set(key, bucket);
  }
  bucket.guestNames.push(fullName);
}

const householdCodes = new Map();

for (const [key, bucket] of householdsByKey) {
  bucket.displayName = householdDisplayName(bucket.guestNames, key);
  base.households.push({
    id: bucket.id,
    displayName: bucket.displayName,
    invitationCodeHash: hashInvitationCode(bucket.code),
    invitationCodeHint: bucket.code.slice(0, 3),
    email: null,
    phone: null,
    notesAdmin: "",
    rsvpStatus: "pending",
    eventIds: standardEventIds(),
    maxPlusOnes: 0,
    createdAt: now,
    updatedAt: now,
  });
  householdCodes.set(bucket.id, bucket.code);

  bucket.guestNames.forEach((fullName, index) => {
    base.guests.push({
      id: randomUUID(),
      householdId: bucket.id,
      fullName,
      normalizedName: normalizeName(fullName),
      isChild: false,
      isPlusOne: false,
      plusOneNamed: true,
      sortOrder: index + 1,
    });
  });
}

let merges = [];
if (mergesPath) {
  merges = JSON.parse(readFileSync(path.resolve(mergesPath), "utf8"));
  applyHouseholdMerges(base, merges, usedCodes, householdCodes);
}

mkdirSync(dataDir, { recursive: true });
writeFileSync(dataFile, JSON.stringify(base, null, 2), "utf8");

const codesFile = path.join(dataDir, "invitation-codes.txt");
const codeLines = base.households
  .map((household) => {
    const guests = base.guests.filter((g) => g.householdId === household.id);
    const code = householdCodes.get(household.id) ?? household.invitationCodeHint;
    return `${code}\t${household.displayName}\t(${guests.length} guests)`;
  })
  .sort((a, b) => a.localeCompare(b));
writeFileSync(codesFile, `${codeLines.join("\n")}\n`, "utf8");

console.log(
  `Imported ${base.households.length} households, ${base.guests.length} guests → ${dataFile}`,
);
console.log(`Invitation codes (private): ${codesFile}`);
console.log("Restart the dev server and test /rsvp. Do not commit .data/ or codes file.");
