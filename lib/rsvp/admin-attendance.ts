import {
  CEREMONY_EVENT_ID,
  WELCOME_PARTY_EVENT_ID,
} from "@/lib/rsvp/event-config";

export interface GuestEventResponse {
  eventId: string;
  attending: string;
}

export interface GuestWithEvents {
  fullName: string;
  events: GuestEventResponse[];
}

export function guestAttendingForEvent(
  guest: GuestWithEvents,
  eventId: string,
): string {
  return (
    guest.events.find((event) => event.eventId === eventId)?.attending ??
    "unknown"
  );
}

export function countHouseholdAttending(
  guests: GuestWithEvents[],
  eventId: string,
): number {
  return guests.filter(
    (guest) => guestAttendingForEvent(guest, eventId) === "yes",
  ).length;
}

export function ceremonyGuestNames(guests: GuestWithEvents[]): string[] {
  return guests
    .filter(
      (guest) =>
        guestAttendingForEvent(guest, CEREMONY_EVENT_ID) === "yes",
    )
    .map((guest) => guest.fullName.trim())
    .filter(Boolean);
}

export function welcomeGuestCount(guests: GuestWithEvents[]): number {
  return countHouseholdAttending(guests, WELCOME_PARTY_EVENT_ID);
}

export function ceremonyGuestCount(guests: GuestWithEvents[]): number {
  return countHouseholdAttending(guests, CEREMONY_EVENT_ID);
}

export function sumWelcomeAcrossHouseholds(
  households: Array<{ guests: GuestWithEvents[] }>,
): number {
  return households.reduce(
    (total, household) => total + welcomeGuestCount(household.guests),
    0,
  );
}

export function sumCeremonyAcrossHouseholds(
  households: Array<{ guests: GuestWithEvents[] }>,
): number {
  return households.reduce(
    (total, household) => total + ceremonyGuestCount(household.guests),
    0,
  );
}

export interface AcceptedGuestListRow {
  guestId: string;
  fullName: string;
  householdId: string;
  householdName: string;
  ceremonyAttending: string;
  welcomeAttending: string;
  dietaryNotes: string;
  accessibilityNotes: string;
  submittedAt: string | null;
}

export interface HouseholdForAcceptedList {
  id: string;
  displayName: string;
  submittedAt: string | null;
  guests: Array<
    GuestWithEvents & {
      id: string;
      dietaryNotes?: string;
      accessibilityNotes?: string;
    }
  >;
}

/** One row per guest who said yes to ceremony and/or welcome party. */
export function flattenAcceptedGuestRows(
  households: HouseholdForAcceptedList[],
): AcceptedGuestListRow[] {
  const rows: AcceptedGuestListRow[] = [];

  for (const household of households) {
    for (const guest of household.guests) {
      const ceremonyAttending = guestAttendingForEvent(guest, CEREMONY_EVENT_ID);
      const welcomeAttending = guestAttendingForEvent(
        guest,
        WELCOME_PARTY_EVENT_ID,
      );
      if (ceremonyAttending !== "yes" && welcomeAttending !== "yes") {
        continue;
      }
      rows.push({
        guestId: guest.id,
        fullName: guest.fullName.trim(),
        householdId: household.id,
        householdName: household.displayName,
        ceremonyAttending,
        welcomeAttending,
        dietaryNotes: guest.dietaryNotes?.trim() ?? "",
        accessibilityNotes: guest.accessibilityNotes?.trim() ?? "",
        submittedAt: household.submittedAt,
      });
    }
  }

  return rows.sort((a, b) =>
    a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }),
  );
}
