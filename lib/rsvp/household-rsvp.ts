import type { Attending, Guest, GuestResponse } from "@/lib/rsvp/types";
import { randomUUID } from "crypto";
import { normalizeGuestName } from "@/lib/rsvp/normalize";

export function guestAllowanceForHousehold(
  listedGuestCount: number,
  maxPlusOnes: number,
): number {
  return listedGuestCount + maxPlusOnes;
}

export interface GuestRosterEntry {
  id?: string;
  fullName: string;
}

export function syncGuestRosterInMemory(options: {
  householdId: string;
  allowance: number;
  roster: GuestRosterEntry[];
  existingGuests: Guest[];
  ceremonyAttending: "yes" | "no";
}): {
  guests: Guest[];
  removedGuestIds: string[];
} {
  const trimmed = options.roster
    .map((entry) => ({ ...entry, fullName: entry.fullName.trim() }))
    .filter((entry) => entry.fullName.length > 0);

  if (options.ceremonyAttending === "yes") {
    if (trimmed.length === 0) throw new Error("ROSTER_REQUIRED");
    if (trimmed.length > options.allowance) throw new Error("ROSTER_OVER_ALLOWANCE");
  }

  const keptIds = new Set(
    trimmed.map((entry) => entry.id).filter((id): id is string => Boolean(id)),
  );
  const removedGuestIds = options.existingGuests
    .filter((guest) => !keptIds.has(guest.id))
    .map((guest) => guest.id);

  const nextGuests: Guest[] = [];
  trimmed.forEach((entry, index) => {
    const existing = entry.id
      ? options.existingGuests.find((guest) => guest.id === entry.id)
      : undefined;
    if (existing) {
      nextGuests.push({
        ...existing,
        fullName: entry.fullName,
        normalizedName: normalizeGuestName(entry.fullName),
        sortOrder: index + 1,
      });
      return;
    }
    nextGuests.push({
      id: randomUUID(),
      householdId: options.householdId,
      fullName: entry.fullName,
      normalizedName: normalizeGuestName(entry.fullName),
      isChild: false,
      isPlusOne: false,
      plusOneNamed: true,
      sortOrder: index + 1,
    });
  });

  return { guests: nextGuests, removedGuestIds };
}

export function buildHouseholdGuestResponses(options: {
  guests: Guest[];
  ceremonyEventId: string;
  welcomeEventId: string;
  ceremonyAttending: "yes" | "no";
  welcomeAttending: "yes" | "no";
  welcomeGuestCount: number;
  notesByGuestId: Map<
    string,
    { dietaryNotes: string; accessibilityNotes: string }
  >;
}): GuestResponse[] {
  const sorted = [...options.guests].sort((a, b) => a.sortOrder - b.sortOrder);
  const welcomeCap = Math.max(
    0,
    Math.min(options.welcomeGuestCount, sorted.length),
  );

  const records: GuestResponse[] = [];
  for (const [index, guest] of sorted.entries()) {
    const notes = options.notesByGuestId.get(guest.id) ?? {
      dietaryNotes: "",
      accessibilityNotes: "",
    };
    const ceremony: Attending =
      options.ceremonyAttending === "yes" ? "yes" : "no";
    let welcome: Attending = "no";
    if (options.welcomeAttending === "yes") {
      welcome = index < welcomeCap ? "yes" : "no";
    }

    for (const [eventId, attending] of [
      [options.ceremonyEventId, ceremony],
      [options.welcomeEventId, welcome],
    ] as const) {
      records.push({
        id: randomUUID(),
        guestId: guest.id,
        eventId,
        attending,
        mealOptionId: null,
        dietaryNotes: notes.dietaryNotes,
        accessibilityNotes: notes.accessibilityNotes,
      });
    }
  }
  return records;
}
