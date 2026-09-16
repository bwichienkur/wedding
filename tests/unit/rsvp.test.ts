import { hashInvitationCode } from "@/lib/rsvp/crypto";
import { namesMatch, normalizeGuestName } from "@/lib/rsvp/normalize";
import { rateLimit, resetRateLimits } from "@/lib/rsvp/rate-limit";
import {
  lookupHouseholds,
  resolveHouseholdFromToken,
  submitHouseholdRsvp,
} from "@/lib/rsvp/service";
import { resetRsvpDbForTests } from "@/lib/rsvp/store";
import {
  TEST_GUEST_NAME,
  TEST_HOUSEHOLD_DISPLAY,
  TEST_INVITATION_CODE,
} from "@/lib/rsvp/test-fixtures";
import { beforeEach, describe, expect, it } from "vitest";

describe("rsvp normalize", () => {
  it("normalizes names consistently", () => {
    expect(normalizeGuestName("  Alex   Example ")).toBe("alex example");
    expect(namesMatch("Alex Example", "alex example")).toBe(true);
    expect(namesMatch("Alex", "Alex Example")).toBe(false);
  });
});

describe("rsvp rate limit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("blocks after the configured limit", () => {
    const key = "test-limit";
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit({ key, limit: 3, windowMs: 60_000 }).ok).toBe(true);
    }
    expect(rateLimit({ key, limit: 3, windowMs: 60_000 }).ok).toBe(false);
  });
});

describe("rsvp service", () => {
  beforeEach(async () => {
    await resetRsvpDbForTests();
  });

  it("finds a household by test guest name without exposing ids", async () => {
    const result = await lookupHouseholds(TEST_GUEST_NAME);
    expect(result.candidates.length).toBe(1);
    expect(result.candidates[0]?.displayName).toBe(TEST_HOUSEHOLD_DISPLAY);
    expect(result.candidates[0]).not.toHaveProperty("householdId");
    expect(result.candidates[0]?.guestPreview).toContain(TEST_GUEST_NAME);
  });

  it("finds a household by invitation code", async () => {
    const result = await lookupHouseholds(TEST_INVITATION_CODE);
    expect(result.candidates.length).toBe(1);
    expect(result.candidates[0]?.displayName).toBe(TEST_HOUSEHOLD_DISPLAY);
  });

  it("lists standard invitation events for every household", async () => {
    const result = await lookupHouseholds(TEST_INVITATION_CODE);
    expect(result.candidates[0]?.invitedEventTitles).toEqual([
      "Welcome Party",
      "Ceremony & Reception",
    ]);
  });

  it("submits a household RSVP after token selection", async () => {
    const lookup = await lookupHouseholds(TEST_GUEST_NAME);
    const token = lookup.candidates[0]!.confirmationToken;
    const householdId = await resolveHouseholdFromToken(token);
    expect(householdId).toBeTruthy();

    const { getHouseholdWorkspace } = await import("@/lib/rsvp/service");
    const workspace = await getHouseholdWorkspace(householdId!);
    expect(workspace).toBeTruthy();
    expect(workspace!.events.map((event) => event.slug)).toEqual([
      "welcome-party",
      "ceremony-reception",
    ]);

    const responses = workspace!.guests.flatMap((guest) =>
      workspace!.events.map((event) => ({
        guestId: guest.id,
        eventId: event.id,
        attending: "yes" as const,
        mealOptionId: null,
        dietaryNotes: "",
        accessibilityNotes: "",
      })),
    );

    const result = await submitHouseholdRsvp({
      householdId: householdId!,
      payload: {
        songRequest: "",
        messageToCouple: "Cannot wait to celebrate.",
        responses,
      },
      ip: "127.0.0.1",
      actor: "guest",
    });

    expect(result.status).toBe("complete");
    expect(hashInvitationCode(TEST_INVITATION_CODE)).toHaveLength(64);
  });
});
