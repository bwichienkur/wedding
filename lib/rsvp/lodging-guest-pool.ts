import { flattenInvitedGuestRows } from "@/lib/rsvp/admin-attendance";
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
  return flattenInvitedGuestRows(households).map((row) => ({
    guestId: row.guestId,
    fullName: row.fullName,
    householdId: row.householdId,
    householdName: row.householdName,
    ceremonyAttending: row.ceremonyAttending,
    welcomeAttending: row.welcomeAttending,
  }));
}