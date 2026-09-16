import type { EventRecord } from "@/lib/rsvp/types";

export const CEREMONY_EVENT_ID = "event-ceremony-reception";
export const WELCOME_PARTY_EVENT_ID = "event-welcome-party";

export const CEREMONY_EVENT_SLUG = "ceremony-reception";
export const WELCOME_PARTY_EVENT_SLUG = "welcome-party";

/** Every invitation includes both events; guests choose which they attend in RSVP. */
export const STANDARD_EVENT_SLUGS = [
  WELCOME_PARTY_EVENT_SLUG,
  CEREMONY_EVENT_SLUG,
] as const;

export const STANDARD_EVENT_IDS = [
  WELCOME_PARTY_EVENT_ID,
  CEREMONY_EVENT_ID,
] as const;

export function createStandardEvents(): EventRecord[] {
  return [
    {
      id: WELCOME_PARTY_EVENT_ID,
      slug: WELCOME_PARTY_EVENT_SLUG,
      title: "Welcome Party",
      startsAt: "2027-05-14T18:00:00",
      location: "Lake Wales, Florida — details to follow",
      isAdultsOnly: false,
      allowsPlusOnes: true,
      collectMeals: false,
      sortOrder: 0,
    },
    {
      id: CEREMONY_EVENT_ID,
      slug: CEREMONY_EVENT_SLUG,
      title: "Ceremony & Reception",
      startsAt: "2027-05-15T16:00:00",
      location: "Bella Cosa, Lake Wales, Florida",
      isAdultsOnly: false,
      allowsPlusOnes: true,
      collectMeals: false,
      sortOrder: 1,
    },
  ];
}

export function isStandardEvent(event: Pick<EventRecord, "id" | "slug">): boolean {
  return (
    STANDARD_EVENT_IDS.includes(event.id as (typeof STANDARD_EVENT_IDS)[number]) ||
    STANDARD_EVENT_SLUGS.includes(event.slug as (typeof STANDARD_EVENT_SLUGS)[number])
  );
}

export function filterStandardEvents(events: EventRecord[]): EventRecord[] {
  return events
    .filter((event) => isStandardEvent(event))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
