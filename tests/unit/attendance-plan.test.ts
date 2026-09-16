import { describe, expect, it } from "vitest";
import {
  countWelcomeGuests,
  householdRsvpSummary,
  inferHouseholdCeremonyAttending,
  inferHouseholdWelcomeAttending,
  welcomeHeadCountForHousehold,
} from "@/components/rsvp/attendance-plan";

describe("household attendance", () => {
  const ceremonyId = "event-ceremony-reception";
  const welcomeId = "event-welcome-party";
  const guestIds = ["guest-1", "guest-2"];

  it("infers ceremony and welcome answers from drafts", () => {
    const drafts = [
      { guestId: "guest-1", eventId: ceremonyId, attending: "yes" as const },
      { guestId: "guest-2", eventId: ceremonyId, attending: "yes" as const },
      { guestId: "guest-1", eventId: welcomeId, attending: "yes" as const },
      { guestId: "guest-2", eventId: welcomeId, attending: "no" as const },
    ];
    expect(inferHouseholdCeremonyAttending(drafts, ceremonyId, guestIds)).toBe(
      "yes",
    );
    expect(inferHouseholdWelcomeAttending(drafts, welcomeId, guestIds)).toBe(
      "yes",
    );
    expect(countWelcomeGuests(drafts, welcomeId, guestIds)).toBe(1);
  });

  it("formats review summary", () => {
    expect(
      householdRsvpSummary({
        ceremonyAttending: "yes",
        welcomeAttending: "yes",
        welcomeGuestCount: 2,
        rosterSize: 2,
      }),
    ).toContain("Welcome party: 2 guests");
  });

  it("uses full guest allowance for welcome head count", () => {
    expect(
      welcomeHeadCountForHousehold({
        guestAllowance: 4,
        welcomeAttending: "yes",
      }),
    ).toBe(4);
    expect(
      welcomeHeadCountForHousehold({
        guestAllowance: 4,
        welcomeAttending: "no",
      }),
    ).toBe(0);
  });
});
