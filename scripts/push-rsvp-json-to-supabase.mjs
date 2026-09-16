#!/usr/bin/env node
/**
 * Push local .data/rsvp.json guest list into Supabase (production import).
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and the same
 * RSVP_SESSION_SECRET used on Vercel (invitation code hashes must match).
 *
 *   CONFIRM_REPLACE=1 node scripts/push-rsvp-json-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, ".data", "rsvp.json");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (process.env.CONFIRM_REPLACE !== "1") {
  console.error(
    "Refusing to run without CONFIRM_REPLACE=1 (this deletes all RSVP guest rows).",
  );
  process.exit(1);
}

if (!existsSync(dataFile)) {
  console.error("Missing .data/rsvp.json — import guests locally first.");
  process.exit(1);
}

const db = JSON.parse(readFileSync(dataFile, "utf8"));
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function wipeGuestData() {
  await supabase.from("guest_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("rsvp_submissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("rsvp_update_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("guests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("household_event_invitations").delete().neq("household_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("households").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

async function upsertEvents() {
  for (const event of db.events ?? []) {
    const { error } = await supabase.from("events").upsert({
      id: event.id,
      slug: event.slug,
      title: event.title,
      starts_at: event.startsAt,
      location: event.location,
      is_adults_only: event.isAdultsOnly,
      allows_plus_ones: event.allowsPlusOnes,
      collect_meals: event.collectMeals,
      sort_order: event.sortOrder,
    });
    if (error) throw new Error(error.message);
  }
}

async function insertBatch(table, rows, mapRow) {
  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize).map(mapRow);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function main() {
  console.log("Wiping existing Supabase RSVP guest data…");
  await wipeGuestData();
  console.log("Upserting events…");
  await upsertEvents();

  console.log(`Inserting ${db.households?.length ?? 0} households…`);
  await insertBatch("households", db.households ?? [], (h) => ({
    id: h.id,
    display_name: h.displayName,
    invitation_code_hash: h.invitationCodeHash,
    invitation_code_hint: h.invitationCodeHint,
    email: h.email,
    phone: h.phone,
    notes_admin: h.notesAdmin ?? "",
    rsvp_status: h.rsvpStatus,
    max_plus_ones: h.maxPlusOnes ?? 0,
    created_at: h.createdAt,
    updated_at: h.updatedAt,
  }));

  const invitations = (db.households ?? []).flatMap((h) =>
    (h.eventIds ?? []).map((eventId) => ({
      household_id: h.id,
      event_id: eventId,
    })),
  );
  if (invitations.length > 0) {
    await insertBatch("household_event_invitations", invitations, (r) => r);
  }

  console.log(`Inserting ${db.guests?.length ?? 0} guests…`);
  await insertBatch("guests", db.guests ?? [], (g) => ({
    id: g.id,
    household_id: g.householdId,
    full_name: g.fullName,
    normalized_name: g.normalizedName,
    is_child: g.isChild,
    is_plus_one: g.isPlusOne,
    plus_one_named: g.plusOneNamed,
    sort_order: g.sortOrder,
  }));

  console.log("Done. Test /rsvp lookup on production.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
