import { describe, expect, it } from "vitest";
import { flattenLodgingGuestPool } from "@/lib/rsvp/lodging-guest-pool";

describe("flattenLodgingGuestPool", () => {
  it("includes every guest on a household regardless of RSVP", () => {
    const rows = flattenLodgingGuestPool([
      {
        id: "hh1",
        displayName: "Smith",
        email: null,
        phone: null,
        rsvpStatus: "pending",
        invitationCodeHint: null,
        notesAdmin: "",
        maxPlusOnes: 0,
        updatedAt: "",
        submittedAt: null,
        messageToCouple: "",
        songRequest: "",
        welcomeAttendingCount: 0,
        ceremonyAttendingCount: 0,
        ceremonyGuestNames: [],
        guests: [
          {
            id: "g-a",
            fullName: "Alex Smith",
            isChild: false,
            isPlusOne: false,
            sortOrder: 0,
            events: [
              {
                eventId: "event-ceremony-reception",
                eventTitle: "Ceremony",
                attending: "no",
              },
              {
                eventId: "event-welcome-party",
                eventTitle: "Welcome",
                attending: "no",
              },
            ],
            dietaryNotes: "",
            accessibilityNotes: "",
          },
          {
            id: "g-b",
            fullName: "Blair Smith",
            isChild: false,
            isPlusOne: false,
            sortOrder: 1,
            events: [
              {
                eventId: "event-ceremony-reception",
                eventTitle: "Ceremony",
                attending: "yes",
              },
              {
                eventId: "event-welcome-party",
                eventTitle: "Welcome",
                attending: "yes",
              },
            ],
            dietaryNotes: "",
            accessibilityNotes: "",
          },
        ],
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.fullName)).toEqual(["Alex Smith", "Blair Smith"]);
  });
});
