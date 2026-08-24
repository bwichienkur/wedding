import "server-only";

import {
  createConfirmationToken,
  hashInvitationCode,
  hashIp,
  verifyConfirmationToken,
} from "@/lib/rsvp/crypto";
import { namesMatch, normalizeGuestName, sanitizeText } from "@/lib/rsvp/normalize";
import {
  getGuestsForHousehold,
  getHousehold,
  getResponsesForHousehold,
  listHouseholds,
  readRsvpDb,
  saveHouseholdResponses,
} from "@/lib/rsvp/store";
import type {
  GuestResponse,
  HouseholdCandidate,
  RsvpStatus,
} from "@/lib/rsvp/types";
import { submitRsvpSchema } from "@/lib/rsvp/types";
import { wedding } from "@/data/wedding";
import { randomUUID } from "crypto";
import type { z } from "zod";

export async function lookupHouseholds(query: string): Promise<{
  candidates: HouseholdCandidate[];
  ambiguous: boolean;
}> {
  const db = await readRsvpDb();
  const trimmed = query.trim();
  const normalized = normalizeGuestName(trimmed);
  const maybeCode = trimmed.toUpperCase().replace(/\s+/g, "");

  let matches = db.households.filter(
    (household) =>
      household.invitationCodeHash &&
      household.invitationCodeHash === hashInvitationCode(maybeCode),
  );

  if (matches.length === 0) {
    const guestHits = db.guests.filter((guest) =>
      namesMatch(normalized, guest.normalizedName),
    );
    const householdIds = new Set(guestHits.map((guest) => guest.householdId));
    matches = db.households.filter((household) => householdIds.has(household.id));
  }

  const candidates: HouseholdCandidate[] = matches.slice(0, 5).map((household) => {
    const guests = db.guests
      .filter((guest) => guest.householdId === household.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const events = db.events.filter((event) =>
      household.eventIds.includes(event.id),
    );
    return {
      confirmationToken: createConfirmationToken(household.id),
      displayName: household.displayName,
      guestPreview: guests
        .filter((guest) => !guest.isPlusOne || guest.plusOneNamed)
        .map((guest) => guest.fullName),
      invitedEventTitles: events.map((event) => event.title),
    };
  });

  return { candidates, ambiguous: candidates.length > 1 };
}

export async function resolveHouseholdFromToken(
  token: string,
): Promise<string | null> {
  const db = await readRsvpDb();
  for (const household of db.households) {
    if (verifyConfirmationToken(token, household.id)) {
      return household.id;
    }
  }
  return null;
}

export async function getHouseholdWorkspace(householdId: string) {
  const db = await readRsvpDb();
  const household = await getHousehold(householdId);
  if (!household) return null;

  const guests = await getGuestsForHousehold(householdId);
  const responses = await getResponsesForHousehold(householdId);
  const events = db.events
    .filter((event) => household.eventIds.includes(event.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const mealOptions = db.mealOptions.filter(
    (meal) => household.eventIds.includes(meal.eventId) && meal.isActive,
  );

  return {
    household: {
      id: household.id,
      displayName: household.displayName,
      email: household.email,
      rsvpStatus: household.rsvpStatus,
      maxPlusOnes: household.maxPlusOnes,
    },
    guests: guests.map((guest) => ({
      id: guest.id,
      fullName: guest.fullName,
      isChild: guest.isChild,
      isPlusOne: guest.isPlusOne,
      plusOneNamed: guest.plusOneNamed,
    })),
    events,
    mealOptions,
    responses,
    deadlineISO: wedding.rsvp.deadlineISO ?? null,
    deadlineLabel: wedding.rsvp.deadlineLabel,
    deadlineIsPlaceholder: wedding.rsvp.deadlineIsPlaceholder,
  };
}

function isPastDeadline(): boolean {
  if (!wedding.rsvp.deadlineISO) return false;
  return Date.now() > new Date(wedding.rsvp.deadlineISO).getTime();
}

export async function submitHouseholdRsvp(options: {
  householdId: string;
  payload: z.infer<typeof submitRsvpSchema>;
  ip: string | null;
  actor: "guest" | "admin";
}) {
  if (options.actor === "guest" && isPastDeadline()) {
    throw new Error("DEADLINE");
  }

  const db = await readRsvpDb();
  const household = db.households.find((item) => item.id === options.householdId);
  if (!household) throw new Error("NOT_FOUND");

  const guests = db.guests.filter(
    (guest) => guest.householdId === options.householdId,
  );
  const guestIds = new Set(guests.map((guest) => guest.id));
  const eventIds = new Set(household.eventIds);

  for (const response of options.payload.responses) {
    if (!guestIds.has(response.guestId) || !eventIds.has(response.eventId)) {
      throw new Error("INVALID_RESPONSE");
    }
  }

  const guestNameUpdates: Array<{
    guestId: string;
    fullName: string;
    normalizedName: string;
  }> = [];

  const records: GuestResponse[] = options.payload.responses.map((response) => {
    const guest = guests.find((item) => item.id === response.guestId)!;
    if (
      guest.isPlusOne &&
      !guest.plusOneNamed &&
      response.plusOneName &&
      response.attending === "yes"
    ) {
      const fullName = sanitizeText(response.plusOneName, 120);
      guestNameUpdates.push({
        guestId: guest.id,
        fullName,
        normalizedName: normalizeGuestName(fullName),
      });
    }

    return {
      id: randomUUID(),
      guestId: response.guestId,
      eventId: response.eventId,
      attending: response.attending,
      mealOptionId: response.mealOptionId ?? null,
      dietaryNotes: sanitizeText(response.dietaryNotes ?? "", 500),
      accessibilityNotes: sanitizeText(response.accessibilityNotes ?? "", 500),
    };
  });

  const attendingValues = records.map((record) => record.attending);
  let status: RsvpStatus = "complete";
  if (attendingValues.every((value) => value === "no")) status = "declined";
  else if (attendingValues.some((value) => value === "unknown")) status = "partial";
  else if (attendingValues.some((value) => value === "no")) status = "partial";

  await saveHouseholdResponses({
    householdId: options.householdId,
    responses: records,
    submission: {
      householdId: options.householdId,
      submittedAt: new Date().toISOString(),
      submittedBy: options.actor,
      songRequest: sanitizeText(options.payload.songRequest ?? "", 200),
      messageToCouple: sanitizeText(options.payload.messageToCouple ?? "", 1000),
      ipHash: hashIp(options.ip),
    },
    history: {
      householdId: options.householdId,
      payloadJson: JSON.stringify(options.payload),
      changedBy: options.actor,
      createdAt: new Date().toISOString(),
    },
    audit: {
      actor: options.actor,
      action: "rsvp.submit",
      entityType: "household",
      entityId: options.householdId,
      metadataJson: JSON.stringify({ status }),
      createdAt: new Date().toISOString(),
    },
    householdStatus: status,
    guestNameUpdates,
  });

  return {
    status,
    email: household.email,
    displayName: household.displayName,
  };
}

export async function getAdminRsvpSummary() {
  const db = await readRsvpDb();
  const households = await listHouseholds();
  const mealTotals = new Map<string, number>();

  for (const response of db.responses) {
    if (response.attending === "yes" && response.mealOptionId) {
      mealTotals.set(
        response.mealOptionId,
        (mealTotals.get(response.mealOptionId) ?? 0) + 1,
      );
    }
  }

  return {
    totals: {
      households: households.length,
      pending: households.filter((h) => h.rsvpStatus === "pending").length,
      partial: households.filter((h) => h.rsvpStatus === "partial").length,
      complete: households.filter((h) => h.rsvpStatus === "complete").length,
      declined: households.filter((h) => h.rsvpStatus === "declined").length,
    },
    mealTotals: [...mealTotals.entries()].map(([mealOptionId, count]) => {
      const meal = db.mealOptions.find((item) => item.id === mealOptionId);
      return { mealOptionId, label: meal?.label ?? mealOptionId, count };
    }),
    households: households.map((household) => {
      const guests = db.guests.filter(
        (guest) => guest.householdId === household.id,
      );
      const responses = db.responses.filter((response) =>
        guests.some((guest) => guest.id === response.guestId),
      );
      const latest = db.submissions
        .filter((submission) => submission.householdId === household.id)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
      return {
        id: household.id,
        displayName: household.displayName,
        email: household.email,
        rsvpStatus: household.rsvpStatus,
        guestCount: guests.length,
        dietary: responses.map((response) => response.dietaryNotes).filter(Boolean),
        accessibility: responses
          .map((response) => response.accessibilityNotes)
          .filter(Boolean),
        songRequest: latest?.songRequest ?? "",
        messageToCouple: latest?.messageToCouple ?? "",
        updatedAt: household.updatedAt,
      };
    }),
  };
}

export async function exportRsvpCsv(): Promise<string> {
  const summary = await getAdminRsvpSummary();
  const header = [
    "household",
    "status",
    "email",
    "guests",
    "dietary",
    "accessibility",
    "song",
    "message",
    "updatedAt",
  ];
  const rows = summary.households.map((household) =>
    [
      household.displayName,
      household.rsvpStatus,
      household.email ?? "",
      String(household.guestCount),
      household.dietary.join(" | "),
      household.accessibility.join(" | "),
      household.songRequest,
      household.messageToCouple,
      household.updatedAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
