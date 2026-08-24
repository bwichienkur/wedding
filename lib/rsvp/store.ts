import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { createSeedDatabase } from "@/lib/rsvp/seed";
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
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as RsvpDatabase;
}

async function writeRsvpDb(db: RsvpDatabase): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function resetRsvpDbForTests(): Promise<RsvpDatabase> {
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
  const db = await readRsvpDb();
  db.auditLogs.push({ id: randomUUID(), ...entry });
  await writeRsvpDb(db);
}

export async function updateHouseholdAdmin(
  householdId: string,
  patch: Partial<Pick<Household, "notesAdmin" | "rsvpStatus" | "email">>,
): Promise<Household | null> {
  const db = await readRsvpDb();
  const household = db.households.find((item) => item.id === householdId);
  if (!household) return null;
  Object.assign(household, patch, { updatedAt: new Date().toISOString() });
  await writeRsvpDb(db);
  return household;
}
