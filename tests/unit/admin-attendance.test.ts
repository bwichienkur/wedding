import { describe, expect, it } from "vitest";
import {
  CEREMONY_EVENT_ID,
  WELCOME_PARTY_EVENT_ID,
} from "@/lib/rsvp/event-config";
import {
  ceremonyGuestCount,
  ceremonyGuestNames,
  welcomeGuestCount,
} from "@/lib/rsvp/admin-attendance";

describe("admin attendance helpers", () => {
  const guests = [
    {
      fullName: "Alex Example",
      events: [
        { eventId: WELCOME_PARTY_EVENT_ID, attending: "yes" },
        { eventId: CEREMONY_EVENT_ID, attending: "yes" },
      ],
    },
    {
      fullName: "Riley Example",
      events: [
        { eventId: WELCOME_PARTY_EVENT_ID, attending: "no" },
        { eventId: CEREMONY_EVENT_ID, attending: "yes" },
      ],
    },
  ];

  it("counts welcome and ceremony headcount", () => {
    expect(welcomeGuestCount(guests)).toBe(1);
    expect(ceremonyGuestCount(guests)).toBe(2);
    expect(ceremonyGuestNames(guests)).toEqual([
      "Alex Example",
      "Riley Example",
    ]);
  });
});
