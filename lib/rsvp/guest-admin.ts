import "server-only";

import { hashInvitationCode } from "@/lib/rsvp/crypto";
import { filterStandardEvents, STANDARD_EVENT_IDS } from "@/lib/rsvp/event-config";
import { normalizeGuestName } from "@/lib/rsvp/normalize";
import {
  appendAudit,
  createGuestAdmin,
  createHouseholdAdmin,
  deleteGuestAdmin,
  deleteHouseholdAdmin,
  readRsvpDb,
  updateGuestAdmin,
  updateHouseholdAdminRecord,
} from "@/lib/rsvp/store";
import type { Attending, Guest, Household } from "@/lib/rsvp/types";
import { randomUUID } from "crypto";

export interface AdminGuestRsvpEvent {
  eventId: string;
  eventTitle: string;
  attending: Attending;
}

export interface AdminHouseholdWithGuests {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: Household["rsvpStatus"];
  invitationCodeHint: string | null;
  notesAdmin: string;
  maxPlusOnes: number;
  updatedAt: string;
  messageToCouple: string;
  songRequest: string;
  submittedAt: string | null;
  guests: Array<{
    id: string;
    fullName: string;
    isChild: boolean;
    isPlusOne: boolean;
    sortOrder: number;
    events: AdminGuestRsvpEvent[];
    dietaryNotes: string;
    accessibilityNotes: string;
  }>;
}

export async function listAdminGuestHouseholds(): Promise<AdminHouseholdWithGuests[]> {
  const db = await readRsvpDb();
  const standardEvents = filterStandardEvents(db.events);

  return db.households
    .map((household) => {
      const householdGuests = db.guests
        .filter((guest) => guest.householdId === household.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const latest = db.submissions
        .filter((submission) => submission.householdId === household.id)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];

      return {
        id: household.id,
        displayName: household.displayName,
        email: household.email,
        phone: household.phone,
        rsvpStatus: household.rsvpStatus,
        invitationCodeHint: household.invitationCodeHint,
        notesAdmin: household.notesAdmin,
        maxPlusOnes: household.maxPlusOnes,
        updatedAt: household.updatedAt,
        messageToCouple: latest?.messageToCouple ?? "",
        songRequest: latest?.songRequest ?? "",
        submittedAt: latest?.submittedAt ?? null,
        guests: householdGuests.map((guest) => {
          const guestResponses = db.responses.filter(
            (response) => response.guestId === guest.id,
          );
          const sample = guestResponses[0];
          return {
            id: guest.id,
            fullName: guest.fullName,
            isChild: guest.isChild,
            isPlusOne: guest.isPlusOne,
            sortOrder: guest.sortOrder,
            events: standardEvents.map((event) => ({
              eventId: event.id,
              eventTitle: event.title,
              attending:
                guestResponses.find((response) => response.eventId === event.id)
                  ?.attending ?? "unknown",
            })),
            dietaryNotes: sample?.dietaryNotes ?? "",
            accessibilityNotes: sample?.accessibilityNotes ?? "",
          };
        }),
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function randomInviteCode(displayName: string): string {
  const base = displayName
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 5);
  const suffix = randomUUID().replace(/-/g, "").slice(0, 3).toUpperCase();
  return `${base || "INV"}${suffix}`;
}

export async function adminCreateHousehold(input: {
  displayName: string;
  email?: string | null;
  invitationCode?: string | null;
  guestNames: string[];
}): Promise<AdminHouseholdWithGuests> {
  const displayName = input.displayName.trim();
  if (!displayName) throw new Error("INVALID");
  const names = input.guestNames.map((n) => n.trim()).filter(Boolean);
  if (names.length === 0) throw new Error("INVALID");

  const code = (input.invitationCode?.trim() || randomInviteCode(displayName)).toUpperCase();
  const now = new Date().toISOString();
  const householdId = randomUUID();

  const household: Household = {
    id: householdId,
    displayName,
    invitationCodeHash: hashInvitationCode(code),
    invitationCodeHint: code.slice(0, 3),
    email: input.email?.trim() || null,
    phone: null,
    notesAdmin: "",
    rsvpStatus: "pending",
    eventIds: [...STANDARD_EVENT_IDS],
    maxPlusOnes: 0,
    createdAt: now,
    updatedAt: now,
  };

  const guests: Guest[] = names.map((fullName, index) => ({
    id: randomUUID(),
    householdId,
    fullName,
    normalizedName: normalizeGuestName(fullName),
    isChild: false,
    isPlusOne: false,
    plusOneNamed: true,
    sortOrder: index + 1,
  }));

  await createHouseholdAdmin({ household, guests });

  await appendAudit({
    actor: "admin",
    action: "rsvp.household.create",
    entityType: "household",
    entityId: householdId,
    metadataJson: JSON.stringify({ displayName, guestCount: guests.length }),
    createdAt: now,
  });

  const list = await listAdminGuestHouseholds();
  return list.find((item) => item.id === householdId)!;
}

export async function adminDeleteHousehold(householdId: string): Promise<void> {
  await deleteHouseholdAdmin(householdId);
  await appendAudit({
    actor: "admin",
    action: "rsvp.household.delete",
    entityType: "household",
    entityId: householdId,
    metadataJson: "{}",
    createdAt: new Date().toISOString(),
  });
}

export async function adminAddGuest(
  householdId: string,
  fullName: string,
): Promise<void> {
  const name = fullName.trim();
  if (!name) throw new Error("INVALID");
  await createGuestAdmin(householdId, {
    id: randomUUID(),
    householdId,
    fullName: name,
    normalizedName: normalizeGuestName(name),
    isChild: false,
    isPlusOne: false,
    plusOneNamed: true,
    sortOrder: 999,
  });
}

export async function adminRemoveGuest(guestId: string): Promise<void> {
  await deleteGuestAdmin(guestId);
}

export async function adminUpdateHousehold(
  householdId: string,
  patch: {
    displayName?: string;
    email?: string | null;
    invitationCode?: string | null;
    notesAdmin?: string;
    maxPlusOnes?: number;
    guestAllowance?: number;
  },
): Promise<void> {
  const updates: Partial<Household> & { invitationCodeHash?: string | null; invitationCodeHint?: string | null } = {};
  if (patch.displayName !== undefined) {
    updates.displayName = patch.displayName.trim();
  }
  if (patch.email !== undefined) {
    updates.email = patch.email;
  }
  if (patch.notesAdmin !== undefined) {
    updates.notesAdmin = patch.notesAdmin;
  }
  if (patch.invitationCode !== undefined) {
    const code = patch.invitationCode?.trim();
    if (code) {
      updates.invitationCodeHash = hashInvitationCode(code);
      updates.invitationCodeHint = code.slice(0, 3);
    } else {
      updates.invitationCodeHash = null;
      updates.invitationCodeHint = null;
    }
  }
  if (patch.maxPlusOnes !== undefined) {
    updates.maxPlusOnes = Math.max(0, Math.floor(patch.maxPlusOnes));
  }
  if (patch.guestAllowance !== undefined) {
    const db = await readRsvpDb();
    const listed = db.guests.filter((g) => g.householdId === householdId).length;
    updates.maxPlusOnes = Math.max(0, Math.floor(patch.guestAllowance) - listed);
  }
  await updateHouseholdAdminRecord(householdId, updates);
}

export async function adminUpdateGuest(
  guestId: string,
  patch: { fullName?: string; isChild?: boolean },
): Promise<void> {
  const updates: Partial<Guest> = {};
  if (patch.fullName !== undefined) {
    updates.fullName = patch.fullName.trim();
    updates.normalizedName = normalizeGuestName(patch.fullName);
  }
  if (patch.isChild !== undefined) {
    updates.isChild = patch.isChild;
  }
  await updateGuestAdmin(guestId, updates);
}
