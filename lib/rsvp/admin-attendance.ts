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
