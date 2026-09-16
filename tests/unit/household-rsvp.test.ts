import { describe, expect, it } from "vitest";
import {
  buildHouseholdGuestResponses,
  guestAllowanceForHousehold,
  syncGuestRosterInMemory,
} from "@/lib/rsvp/household-rsvp";

describe("household rsvp", () => {
  const householdId = "hh-1";
  const existing = [
    {
      id: "g1",
      householdId,
      fullName: "Alex Example",
      normalizedName: "alex example",
      isChild: false,
      isPlusOne: false,
      plusOneNamed: true,
      sortOrder: 1,
    },
  ];

  it("caps roster size by allowance", () => {
    expect(() =>
      syncGuestRosterInMemory({
        householdId,
        allowance: 1,
        roster: [
          { id: "g1", fullName: "Alex Example" },
          { fullName: "Riley Example" },
        ],
        existingGuests: existing,
        ceremonyAttending: "yes",
      }),
    ).toThrowError("ROSTER_OVER_ALLOWANCE");
  });

  it("builds welcome headcount from first roster guests", () => {
    const records = buildHouseholdGuestResponses({
      guests: [
        ...existing,
        {
          id: "g2",
          householdId,
          fullName: "Riley Example",
          normalizedName: "riley example",
          isChild: false,
          isPlusOne: false,
          plusOneNamed: true,
          sortOrder: 2,
        },
      ],
      ceremonyEventId: "ceremony",
      welcomeEventId: "welcome",
      ceremonyAttending: "yes",
      welcomeAttending: "yes",
      welcomeGuestCount: 1,
      notesByGuestId: new Map(),
    });
    const welcomeYes = records.filter(
      (record) => record.eventId === "welcome" && record.attending === "yes",
    );
    expect(welcomeYes).toHaveLength(1);
    expect(guestAllowanceForHousehold(2, 1)).toBe(3);
  });
});
