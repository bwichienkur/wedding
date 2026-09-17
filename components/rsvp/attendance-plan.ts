import type { Attending } from "@/lib/rsvp/types";
import {
  CEREMONY_EVENT_SLUG,
  WELCOME_PARTY_EVENT_SLUG,
} from "@/lib/rsvp/event-config";
import type { EventRecord } from "@/lib/rsvp/types";

export type HouseholdYesNo = "yes" | "no" | "unknown";

export function resolveCeremonyAndWelcomeEvents(events: EventRecord[]): {
  ceremony: EventRecord;
  welcome: EventRecord;
} | null {
  const ceremony = events.find((event) => event.slug === CEREMONY_EVENT_SLUG);
  const welcome = events.find((event) => event.slug === WELCOME_PARTY_EVENT_SLUG);
  if (!ceremony || !welcome) return null;
  return { ceremony, welcome };
}

export function inferHouseholdCeremonyAttending(
  drafts: Array<{ guestId: string; eventId: string; attending: Attending }>,
  ceremonyEventId: string,
  guestIds: string[],
): HouseholdYesNo {
  if (guestIds.length === 0) return "unknown";
  const values = guestIds.map(
    (guestId) =>
      drafts.find(
        (draft) =>
          draft.guestId === guestId && draft.eventId === ceremonyEventId,
      )?.attending ?? "unknown",
  );
  if (values.every((value) => value === "yes")) return "yes";
  if (values.every((value) => value === "no")) return "no";
  return "unknown";
}

export function inferHouseholdWelcomeAttending(
  drafts: Array<{ guestId: string; eventId: string; attending: Attending }>,
  welcomeEventId: string,
  guestIds: string[],
): HouseholdYesNo {
  if (guestIds.length === 0) return "unknown";
  const values = guestIds.map(
    (guestId) =>
      drafts.find(
        (draft) => draft.guestId === guestId && draft.eventId === welcomeEventId,
      )?.attending ?? "unknown",
  );
  if (values.every((value) => value === "no")) return "no";
  if (values.some((value) => value === "yes")) return "yes";
  return "unknown";
}

export function countWelcomeGuests(
  drafts: Array<{ guestId: string; eventId: string; attending: Attending }>,
  welcomeEventId: string,
  guestIds: string[],
): number {
  return guestIds.filter(
    (guestId) =>
      drafts.find(
        (draft) =>
          draft.guestId === guestId && draft.eventId === welcomeEventId,
      )?.attending === "yes",
  ).length;
}

/** Clamp welcome head count to 1 … guest allowance (admin allocation). */
export function clampWelcomeGuestCount(
  count: number,
  guestAllowance: number,
): number {
  const max = Math.max(1, guestAllowance);
  if (!Number.isFinite(count) || count < 1) return max;
  return Math.min(max, Math.round(count));
}

export function initialWelcomeGuestCount(options: {
  guestAllowance: number;
  welcomeAttending: HouseholdYesNo;
  savedCount?: number;
}): number {
  const max = Math.max(1, options.guestAllowance);
  if (options.welcomeAttending !== "yes") {
    return max;
  }
  if (options.savedCount != null && options.savedCount >= 1) {
    return clampWelcomeGuestCount(options.savedCount, options.guestAllowance);
  }
  return max;
}

export function householdRsvpSummary(options: {
  ceremonyAttending: HouseholdYesNo;
  welcomeAttending: HouseholdYesNo;
  welcomeGuestCount: number;
  rosterSize: number;
}): string {
  if (options.ceremonyAttending === "no" && options.welcomeAttending === "no") {
    return "Not attending";
  }
  const parts: string[] = [];
  if (options.ceremonyAttending === "yes") {
    parts.push(
      `Ceremony: ${options.rosterSize} guest${options.rosterSize === 1 ? "" : "s"}`,
    );
  } else if (options.ceremonyAttending === "no") {
    parts.push("Ceremony: not attending");
  }
  if (options.welcomeAttending === "yes") {
    parts.push(
      `Welcome party: ${options.welcomeGuestCount} guest${options.welcomeGuestCount === 1 ? "" : "s"}`,
    );
  } else if (options.welcomeAttending === "no") {
    parts.push("Welcome party: not attending");
  }
  return parts.join(" · ");
}
