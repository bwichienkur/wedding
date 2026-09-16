import type { Attending, EventRecord } from "@/lib/rsvp/types";
import {
  CEREMONY_EVENT_SLUG,
  WELCOME_PARTY_EVENT_SLUG,
} from "@/lib/rsvp/event-config";

export type AttendancePlan =
  | "both"
  | "ceremony"
  | "welcome"
  | "neither"
  | "unknown";

export const ATTENDANCE_PLAN_OPTIONS: Array<{
  value: AttendancePlan;
  label: string;
}> = [
  { value: "both", label: "Ceremony & welcome party" },
  { value: "ceremony", label: "Ceremony only" },
  { value: "welcome", label: "Welcome party only" },
  { value: "neither", label: "Can't attend" },
];

export function resolveCeremonyAndWelcomeEvents(events: EventRecord[]): {
  ceremony: EventRecord;
  welcome: EventRecord;
} | null {
  const ceremony = events.find((event) => event.slug === CEREMONY_EVENT_SLUG);
  const welcome = events.find((event) => event.slug === WELCOME_PARTY_EVENT_SLUG);
  if (!ceremony || !welcome) return null;
  return { ceremony, welcome };
}

export function attendancePlanLabel(plan: AttendancePlan): string {
  return (
    ATTENDANCE_PLAN_OPTIONS.find((option) => option.value === plan)?.label ??
    "Not answered yet"
  );
}

export function attendancePlanForGuest(
  drafts: Array<{ guestId: string; eventId: string; attending: Attending }>,
  guestId: string,
  ceremonyEventId: string,
  welcomeEventId: string,
): AttendancePlan {
  const ceremony = drafts.find(
    (draft) =>
      draft.guestId === guestId && draft.eventId === ceremonyEventId,
  )?.attending;
  const welcome = drafts.find(
    (draft) =>
      draft.guestId === guestId && draft.eventId === welcomeEventId,
  )?.attending;

  if (ceremony === "unknown" || welcome === "unknown") return "unknown";
  if (ceremony === "yes" && welcome === "yes") return "both";
  if (ceremony === "yes" && welcome === "no") return "ceremony";
  if (ceremony === "no" && welcome === "yes") return "welcome";
  if (ceremony === "no" && welcome === "no") return "neither";
  return "unknown";
}

export function attendingForPlan(
  plan: AttendancePlan,
  which: "ceremony" | "welcome",
): Attending {
  switch (plan) {
    case "both":
      return "yes";
    case "ceremony":
      return which === "ceremony" ? "yes" : "no";
    case "welcome":
      return which === "welcome" ? "yes" : "no";
    case "neither":
      return "no";
    default:
      return "unknown";
  }
}
