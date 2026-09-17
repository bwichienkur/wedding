import "server-only";

import {
  filterStandardEvents,
  STANDARD_EVENT_IDS,
} from "@/lib/rsvp/event-config";
import {
  createConfirmationToken,
  hashInvitationCode,
  hashIp,
  parseConfirmationToken,
} from "@/lib/rsvp/crypto";
import {
  buildHouseholdGuestResponses,
  guestAllowanceForHousehold,
  syncGuestRosterInMemory,
} from "@/lib/rsvp/household-rsvp";
import { deriveHouseholdRsvpStatus } from "@/components/rsvp/attendance-plan";
import { scoreGuestNameMatch } from "@/lib/rsvp/matching";
import { namesMatch, normalizeGuestName, sanitizeText } from "@/lib/rsvp/normalize";
import {
  readRsvpDb,
  replaceHouseholdGuests,
  saveHouseholdResponses,
} from "@/lib/rsvp/store";
import type {
  GuestResponse,
  HouseholdCandidate,
  RsvpStatus,
} from "@/lib/rsvp/types";
import { submitRsvpSchema } from "@/lib/rsvp/types";
import { wedding } from "@/data/wedding";
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

  if (matches.length === 0) {
    const scored: Array<{ householdId: string; score: number }> = [];
    for (const guest of db.guests) {
      const score = scoreGuestNameMatch(trimmed, guest.normalizedName);
      if (score > 0) {
        scored.push({ householdId: guest.householdId, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    const householdIds: string[] = [];
    const seen = new Set<string>();
    for (const entry of scored) {
      if (seen.has(entry.householdId)) continue;
      seen.add(entry.householdId);
      householdIds.push(entry.householdId);
      if (householdIds.length >= 5) break;
    }
    matches = db.households.filter((household) =>
      householdIds.includes(household.id),
    );
    matches.sort(
      (a, b) =>
        householdIds.indexOf(a.id) - householdIds.indexOf(b.id),
    );
  }

  const candidates: HouseholdCandidate[] = matches.slice(0, 5).map((household) => {
    const guests = db.guests
      .filter((guest) => guest.householdId === household.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const standardEvents = filterStandardEvents(db.events);
    return {
      confirmationToken: createConfirmationToken(household.id),
      displayName: household.displayName,
      guestPreview: guests
        .filter((guest) => !guest.isPlusOne || guest.plusOneNamed)
        .map((guest) => guest.fullName),
      invitedEventTitles: standardEvents.map((event) => event.title),
    };
  });

  return { candidates, ambiguous: candidates.length > 1 };
}

export async function resolveHouseholdFromToken(
  token: string,
): Promise<string | null> {
  return parseConfirmationToken(token);
}

export async function getHouseholdWorkspace(householdId: string) {
  const db = await readRsvpDb();
  const household = db.households.find((item) => item.id === householdId);
  if (!household) return null;

  const guests = db.guests
    .filter((guest) => guest.householdId === householdId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const guestIds = new Set(guests.map((guest) => guest.id));
  const responses = db.responses.filter((response) =>
    guestIds.has(response.guestId),
  );
  const events = filterStandardEvents(db.events);
  const mealOptions = db.mealOptions.filter(
    (meal) =>
      STANDARD_EVENT_IDS.includes(
        meal.eventId as (typeof STANDARD_EVENT_IDS)[number],
      ) && meal.isActive,
  );

  const guestAllowance = guestAllowanceForHousehold(
    guests.length,
    household.maxPlusOnes,
  );

  return {
    household: {
      id: household.id,
      displayName: household.displayName,
      email: household.email,
      rsvpStatus: household.rsvpStatus,
      maxPlusOnes: household.maxPlusOnes,
      guestAllowance,
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

  const existingGuests = db.guests.filter(
    (guest) => guest.householdId === options.householdId,
  );
  const allowance = guestAllowanceForHousehold(
    existingGuests.length,
    household.maxPlusOnes,
  );

  const events = filterStandardEvents(db.events);
  const ceremony = events.find((event) => event.slug === "ceremony-reception");
  const welcome = events.find((event) => event.slug === "welcome-party");
  if (!ceremony || !welcome) throw new Error("INVALID_RESPONSE");

  const payload = options.payload;
  const ceremonyAttending = payload.ceremonyAttending;
  const welcomeAttending = payload.welcomeAttending;

  let rosterGuests = existingGuests;
  if (payload.guestRoster && ceremonyAttending === "yes") {
    const synced = syncGuestRosterInMemory({
      householdId: options.householdId,
      allowance,
      roster: payload.guestRoster,
      existingGuests,
      ceremonyAttending,
    });
    await replaceHouseholdGuests(
      options.householdId,
      synced.guests,
      synced.removedGuestIds,
    );
    rosterGuests = synced.guests;
  }

  let welcomeGuestCount = payload.welcomeGuestCount ?? 0;
  if (welcomeAttending === "yes") {
    if (welcomeGuestCount < 1) throw new Error("INVALID_RESPONSE");
    if (welcomeGuestCount > allowance) throw new Error("INVALID_RESPONSE");
  } else {
    welcomeGuestCount = 0;
  }

  const notesByGuestId = new Map<
    string,
    { dietaryNotes: string; accessibilityNotes: string }
  >();
  for (const note of payload.guestNotes ?? []) {
    notesByGuestId.set(note.guestId, {
      dietaryNotes: sanitizeText(note.dietaryNotes ?? "", 500),
      accessibilityNotes: sanitizeText(note.accessibilityNotes ?? "", 500),
    });
  }

  const records: GuestResponse[] = buildHouseholdGuestResponses({
    guests: rosterGuests,
    ceremonyEventId: ceremony.id,
    welcomeEventId: welcome.id,
    ceremonyAttending,
    welcomeAttending,
    welcomeGuestCount,
    notesByGuestId,
  });

  const status: RsvpStatus = deriveHouseholdRsvpStatus({
    ceremonyAttending,
    welcomeAttending,
  });

  await saveHouseholdResponses({
    householdId: options.householdId,
    responses: records,
    submission: {
      householdId: options.householdId,
      submittedAt: new Date().toISOString(),
      submittedBy: options.actor,
      songRequest: sanitizeText(payload.songRequest ?? "", 200),
      messageToCouple: sanitizeText(payload.messageToCouple ?? "", 1000),
      ipHash: hashIp(options.ip),
    },
    history: {
      householdId: options.householdId,
      payloadJson: JSON.stringify(payload),
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
  });

  return {
    status,
    email: household.email,
    displayName: household.displayName,
  };
}

export async function getAdminRsvpSummary() {
  const db = await readRsvpDb();
  const households = db.households;
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
