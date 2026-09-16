import "server-only";

import { hashInvitationCode } from "@/lib/rsvp/crypto";
import { STANDARD_EVENT_IDS } from "@/lib/rsvp/event-config";
import { normalizeGuestName } from "@/lib/rsvp/normalize";
import type { RsvpDatabase } from "@/lib/rsvp/types";
import { randomUUID } from "crypto";

/** Fictional household for unit/e2e tests only — not shipped to production guests. */
export const TEST_HOUSEHOLD_DISPLAY = "The Example Family";
export const TEST_GUEST_NAME = "Alex Example";
export const TEST_INVITATION_CODE = "EXAMPLE27";

export function appendTestHousehold(db: RsvpDatabase): void {
  const now = new Date().toISOString();
  const householdId = randomUUID();

  db.households.push({
    id: householdId,
    displayName: TEST_HOUSEHOLD_DISPLAY,
    invitationCodeHash: hashInvitationCode(TEST_INVITATION_CODE),
    invitationCodeHint: "EX2",
    email: null,
    phone: null,
    notesAdmin: "Automated test fixture — remove before go-live if present.",
    rsvpStatus: "pending",
    eventIds: [...STANDARD_EVENT_IDS],
    maxPlusOnes: 0,
    createdAt: now,
    updatedAt: now,
  });

  db.guests.push({
    id: randomUUID(),
    householdId,
    fullName: TEST_GUEST_NAME,
    normalizedName: normalizeGuestName(TEST_GUEST_NAME),
    isChild: false,
    isPlusOne: false,
    plusOneNamed: true,
    sortOrder: 1,
  });
}

export function shouldIncludeTestHousehold(): boolean {
  return (
    process.env.RSVP_INCLUDE_TEST_HOUSEHOLD === "1" ||
    process.env.RSVP_INCLUDE_E2E_FIXTURE === "1" ||
    process.env.VITEST === "true"
  );
}
