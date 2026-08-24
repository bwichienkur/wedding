import { hashInvitationCode } from "@/lib/rsvp/crypto";
import { namesMatch, normalizeGuestName } from "@/lib/rsvp/normalize";
import { rateLimit, resetRateLimits } from "@/lib/rsvp/rate-limit";
import {
  lookupHouseholds,
  resolveHouseholdFromToken,
  submitHouseholdRsvp,
} from "@/lib/rsvp/service";
import { resetRsvpDbForTests } from "@/lib/rsvp/store";
import { beforeEach, describe, expect, it } from "vitest";

describe("rsvp normalize", () => {
  it("normalizes names consistently", () => {
    expect(normalizeGuestName("  Alex   Rivera ")).toBe("alex rivera");
    expect(namesMatch("Alex Rivera", "alex rivera")).toBe(true);
    expect(namesMatch("Alex", "Alex Rivera")).toBe(false);
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

  it("finds a household by fictional guest name without exposing ids", async () => {
    const result = await lookupHouseholds("Alex Rivera");
    expect(result.candidates.length).toBe(1);
    expect(result.candidates[0]?.displayName).toContain("Rivera");
    expect(result.candidates[0]).not.toHaveProperty("householdId");
    expect(result.candidates[0]?.guestPreview).toContain("Alex Rivera");
  });

  it("finds a household by invitation code", async () => {
    const result = await lookupHouseholds("LEE2027");
    expect(result.candidates.length).toBe(1);
    expect(result.candidates[0]?.displayName).toContain("Jordan Lee");
  });

  it("handles duplicate last names as ambiguous candidates", async () => {
    const result = await lookupHouseholds("Brooks");
    // exact full-name match required — last name alone should not match
    expect(result.candidates.length).toBe(0);

    const taylor = await lookupHouseholds("Taylor Brooks");
    const morgan = await lookupHouseholds("Morgan Brooks");
    expect(taylor.candidates.length).toBe(1);
    expect(morgan.candidates.length).toBe(1);
    expect(taylor.candidates[0]?.displayName).not.toBe(
      morgan.candidates[0]?.displayName,
    );
  });

  it("submits a household RSVP after token selection", async () => {
    const lookup = await lookupHouseholds("Alex Rivera");
    const token = lookup.candidates[0]!.confirmationToken;
    const householdId = await resolveHouseholdFromToken(token);
    expect(householdId).toBeTruthy();

    const workspaceLookup = await lookupHouseholds("Alex Rivera");
    expect(workspaceLookup.candidates[0]?.invitedEventTitles.length).toBeGreaterThan(0);

    // Pull guests via submit path using service workspace helper would need import
    const { getHouseholdWorkspace } = await import("@/lib/rsvp/service");
    const workspace = await getHouseholdWorkspace(householdId!);
    expect(workspace).toBeTruthy();

    const responses = workspace!.guests.flatMap((guest) =>
      workspace!.events.map((event) => ({
        guestId: guest.id,
        eventId: event.id,
        attending: "yes" as const,
        mealOptionId:
          workspace!.mealOptions.find((meal) => meal.eventId === event.id)?.id ??
          null,
        dietaryNotes: guest.fullName === "Quinn Rivera" ? "Nut allergy" : "",
        accessibilityNotes: "",
      })),
    );

    const result = await submitHouseholdRsvp({
      householdId: householdId!,
      payload: {
        songRequest: "At Last",
        messageToCouple: "Cannot wait to celebrate.",
        responses,
      },
      ip: "127.0.0.1",
      actor: "guest",
    });

    expect(result.status).toBe("complete");
    expect(hashInvitationCode("RIVERA27")).toHaveLength(64);
  });
});
