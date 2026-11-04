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

  it("flattens accepted guests into individual rows", async () => {
    const { flattenAcceptedGuestRows } = await import("@/lib/rsvp/admin-attendance");
    const rows = flattenAcceptedGuestRows([
      {
        id: "h1",
        displayName: "Example Family",
        submittedAt: "2027-01-01T12:00:00Z",
        guests: [
          {
            id: "g1",
            fullName: "Alex Example",
            events: [
              { eventId: WELCOME_PARTY_EVENT_ID, attending: "yes" },
              { eventId: CEREMONY_EVENT_ID, attending: "yes" },
            ],
            dietaryNotes: "Vegetarian",
          },
          {
            id: "g2",
            fullName: "No Show",
            events: [
              { eventId: WELCOME_PARTY_EVENT_ID, attending: "no" },
              { eventId: CEREMONY_EVENT_ID, attending: "no" },
            ],
          },
        ],
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.fullName).toBe("Alex Example");
    expect(rows[0]?.dietaryNotes).toBe("Vegetarian");
  });
});
