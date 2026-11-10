import { guestAttendingForEvent } from "@/lib/rsvp/admin-attendance";
import {
  CEREMONY_EVENT_ID,
  WELCOME_PARTY_EVENT_ID,
} from "@/lib/rsvp/event-config";
import type { AdminHouseholdWithGuests } from "@/lib/rsvp/guest-admin";

export interface LodgingGuestPoolRow {
  guestId: string;
  fullName: string;
  householdId: string;
  householdName: string;
  ceremonyAttending: string;
  welcomeAttending: string;
}

/** Every invited guest on a household — not limited to accepted RSVPs. */
export function flattenLodgingGuestPool(
  households: AdminHouseholdWithGuests[],
): LodgingGuestPoolRow[] {
  const rows: LodgingGuestPoolRow[] = [];

  for (const household of households) {
    for (const guest of household.guests) {
      rows.push({
        guestId: guest.id,
        fullName: guest.fullName.trim(),
        householdId: household.id,
        householdName: household.displayName,
        ceremonyAttending: guestAttendingForEvent(guest, CEREMONY_EVENT_ID),
        welcomeAttending: guestAttendingForEvent(guest, WELCOME_PARTY_EVENT_ID),
      });
    }
  }

  return rows.sort((a, b) =>
    a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }),
  );
}
