import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { createSeedDatabase } from "@/lib/rsvp/seed";
import { isSupabaseRsvpConfigured } from "@/lib/rsvp/supabase-env";
import {
  appendAuditSupabase,
  createGuestAdminSupabase,
  createHouseholdAdminSupabase,
  deleteGuestAdminSupabase,
  deleteHouseholdAdminSupabase,
  readRsvpDbSupabase,
  saveHouseholdResponsesSupabase,
  updateGuestAdminSupabase,
  updateHouseholdAdminRecordSupabase,
  updateHouseholdAdminSupabase,
} from "@/lib/rsvp/store-supabase";
import type {
  AuditLog,
  Guest,
  GuestResponse,
  Household,
  RsvpDatabase,
  RsvpSubmission,
  RsvpUpdateHistory,
} from "@/lib/rsvp/types";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "rsvp.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(createSeedDatabase(), null, 2),
      "utf8",
    );
  }
}

export async function readRsvpDb(): Promise<RsvpDatabase> {
  if (isSupabaseRsvpConfigured()) {
    return readRsvpDbSupabase();
  }
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as RsvpDatabase;
}

async function writeRsvpDb(db: RsvpDatabase): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    throw new Error("writeRsvpDb is not supported when Supabase RSVP is enabled.");
  }
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function resetRsvpDbForTests(): Promise<RsvpDatabase> {
  if (isSupabaseRsvpConfigured()) {
    throw new Error("resetRsvpDbForTests cannot run against Supabase.");
  }
  const db = createSeedDatabase();
  await writeRsvpDb(db);
  return db;
}

export async function listHouseholds(): Promise<Household[]> {
  const db = await readRsvpDb();
  return db.households;
}

export async function getHousehold(id: string): Promise<Household | null> {
  const db = await readRsvpDb();
  return db.households.find((item) => item.id === id) ?? null;
}

export async function getGuestsForHousehold(householdId: string): Promise<Guest[]> {
  const db = await readRsvpDb();
  return db.guests
    .filter((guest) => guest.householdId === householdId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getResponsesForHousehold(
  householdId: string,
): Promise<GuestResponse[]> {
  const db = await readRsvpDb();
  const guestIds = new Set(
    db.guests.filter((guest) => guest.householdId === householdId).map((g) => g.id),
  );
  return db.responses.filter((response) => guestIds.has(response.guestId));
}

export async function saveHouseholdResponses(options: {
  householdId: string;
  responses: GuestResponse[];
  submission: Omit<RsvpSubmission, "id">;
  history: Omit<RsvpUpdateHistory, "id">;
  audit: Omit<AuditLog, "id">;
  householdStatus: Household["rsvpStatus"];
  guestNameUpdates?: Array<{ guestId: string; fullName: string; normalizedName: string }>;
}): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await saveHouseholdResponsesSupabase(options);
    return;
  }
  const db = await readRsvpDb();
  const household = db.households.find((item) => item.id === options.householdId);
  if (!household) throw new Error("Household not found");

  const guestIds = new Set(
    db.guests.filter((g) => g.householdId === options.householdId).map((g) => g.id),
  );

  db.responses = db.responses.filter((response) => !guestIds.has(response.guestId));
  db.responses.push(...options.responses);

  if (options.guestNameUpdates?.length) {
    for (const update of options.guestNameUpdates) {
      const guest = db.guests.find((item) => item.id === update.guestId);
      if (guest) {
        guest.fullName = update.fullName;
        guest.normalizedName = update.normalizedName;
      }
    }
  }

  household.rsvpStatus = options.householdStatus;
  household.updatedAt = new Date().toISOString();

  db.submissions.push({ id: randomUUID(), ...options.submission });
  db.history.push({ id: randomUUID(), ...options.history });
  db.auditLogs.push({ id: randomUUID(), ...options.audit });

  await writeRsvpDb(db);
}

export async function appendAudit(entry: Omit<AuditLog, "id">): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await appendAuditSupabase(entry);
    return;
  }
  const db = await readRsvpDb();
  db.auditLogs.push({ id: randomUUID(), ...entry });
  await writeRsvpDb(db);
}

export async function updateHouseholdAdmin(
  householdId: string,
  patch: Partial<Pick<Household, "notesAdmin" | "rsvpStatus" | "email">>,
): Promise<Household | null> {
  if (isSupabaseRsvpConfigured()) {
    return updateHouseholdAdminSupabase(householdId, patch);
  }
  const db = await readRsvpDb();
  const household = db.households.find((item) => item.id === householdId);
  if (!household) return null;
  Object.assign(household, patch, { updatedAt: new Date().toISOString() });
  await writeRsvpDb(db);
  return household;
}

export async function createHouseholdAdmin(options: {
  household: Household;
  guests: Guest[];
}): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await createHouseholdAdminSupabase(options);
    return;
  }
  const db = await readRsvpDb();
  db.households.push(options.household);
  db.guests.push(...options.guests);
  await writeRsvpDb(db);
}

export async function deleteHouseholdAdmin(householdId: string): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await deleteHouseholdAdminSupabase(householdId);
    return;
  }
  const db = await readRsvpDb();
  const guestIds = new Set(
    db.guests.filter((g) => g.householdId === householdId).map((g) => g.id),
  );
  db.guests = db.guests.filter((g) => g.householdId !== householdId);
  db.households = db.households.filter((h) => h.id !== householdId);
  db.responses = db.responses.filter((r) => !guestIds.has(r.guestId));
  await writeRsvpDb(db);
}

export async function createGuestAdmin(
  householdId: string,
  guest: Guest,
): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await createGuestAdminSupabase(guest);
    return;
  }
  const db = await readRsvpDb();
  const household = db.households.find((h) => h.id === householdId);
  if (!household) throw new Error("NOT_FOUND");
  const sortOrder =
    db.guests.filter((g) => g.householdId === householdId).length + 1;
  db.guests.push({ ...guest, householdId, sortOrder });
  household.updatedAt = new Date().toISOString();
  await writeRsvpDb(db);
}

export async function deleteGuestAdmin(guestId: string): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await deleteGuestAdminSupabase(guestId);
    return;
  }
  const db = await readRsvpDb();
  db.guests = db.guests.filter((g) => g.id !== guestId);
  db.responses = db.responses.filter((r) => r.guestId !== guestId);
  await writeRsvpDb(db);
}

export async function updateHouseholdAdminRecord(
  householdId: string,
  patch: Partial<
    Pick<
      Household,
      | "displayName"
      | "email"
      | "phone"
      | "notesAdmin"
      | "invitationCodeHash"
      | "invitationCodeHint"
      | "maxPlusOnes"
    >
  >,
): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await updateHouseholdAdminRecordSupabase(householdId, patch);
    return;
  }
  const db = await readRsvpDb();
  const household = db.households.find((h) => h.id === householdId);
  if (!household) throw new Error("NOT_FOUND");
  Object.assign(household, patch, { updatedAt: new Date().toISOString() });
  await writeRsvpDb(db);
}

export async function updateGuestAdmin(
  guestId: string,
  patch: Partial<Pick<Guest, "fullName" | "normalizedName" | "isChild">>,
): Promise<void> {
  if (isSupabaseRsvpConfigured()) {
    await updateGuestAdminSupabase(guestId, patch);
    return;
  }
  const db = await readRsvpDb();
  const guest = db.guests.find((g) => g.id === guestId);
  if (!guest) throw new Error("NOT_FOUND");
  Object.assign(guest, patch);
  await writeRsvpDb(db);
}
