import "server-only";

import { hashInvitationCode } from "@/lib/rsvp/crypto";
import { normalizeGuestName } from "@/lib/rsvp/normalize";
import type { RsvpDatabase } from "@/lib/rsvp/types";
import { randomUUID } from "crypto";

function guest(
  householdId: string,
  fullName: string,
  options: Partial<{
    isChild: boolean;
    isPlusOne: boolean;
    plusOneNamed: boolean;
    sortOrder: number;
  }> = {},
) {
  return {
    id: randomUUID(),
    householdId,
    fullName,
    normalizedName: normalizeGuestName(fullName),
    isChild: options.isChild ?? false,
    isPlusOne: options.isPlusOne ?? false,
    plusOneNamed: options.plusOneNamed ?? true,
    sortOrder: options.sortOrder ?? 0,
  };
}

/** Fictional development seed only — never real guests. */
export function createSeedDatabase(): RsvpDatabase {
  const now = new Date().toISOString();
  const ceremonyId = "event-ceremony-reception";
  const rehearsalId = "event-rehearsal";

  const events = [
    {
      id: ceremonyId,
      slug: "ceremony-reception",
      title: "Ceremony & Reception",
      startsAt: "2027-05-15T16:00:00",
      location: "Bella Cosa, Lake Wales, Florida",
      isAdultsOnly: false,
      allowsPlusOnes: true,
      collectMeals: true,
      sortOrder: 1,
    },
    {
      id: rehearsalId,
      slug: "rehearsal-dinner",
      title: "Rehearsal Dinner",
      startsAt: null,
      location: null,
      isAdultsOnly: true,
      allowsPlusOnes: false,
      collectMeals: true,
      sortOrder: 0,
    },
  ];

  const mealOptions = [
    {
      id: "meal-chicken",
      eventId: ceremonyId,
      label: "Herb chicken",
      description: "Placeholder meal option — replace with final menu.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "meal-fish",
      eventId: ceremonyId,
      label: "Citrus fish",
      description: "Placeholder meal option — replace with final menu.",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "meal-veg",
      eventId: ceremonyId,
      label: "Garden vegetarian",
      description: "Placeholder meal option — replace with final menu.",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "meal-rehearsal-1",
      eventId: rehearsalId,
      label: "Rehearsal entrée A",
      description: "Placeholder.",
      sortOrder: 1,
      isActive: true,
    },
  ];

  const householdA = randomUUID();
  const householdB = randomUUID();
  const householdC = randomUUID();
  const householdD = randomUUID();

  const households = [
    {
      id: householdA,
      displayName: "The Rivera Family",
      invitationCodeHash: hashInvitationCode("RIVERA27"),
      invitationCodeHint: "R27",
      email: "alex.rivera.example@example.com",
      phone: null,
      notesAdmin: "",
      rsvpStatus: "pending" as const,
      eventIds: [ceremonyId],
      maxPlusOnes: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: householdB,
      displayName: "Jordan Lee & Guest",
      invitationCodeHash: hashInvitationCode("LEE2027"),
      invitationCodeHint: "L27",
      email: "jordan.lee.example@example.com",
      phone: null,
      notesAdmin: "",
      rsvpStatus: "pending" as const,
      eventIds: [ceremonyId],
      maxPlusOnes: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: householdC,
      displayName: "Sam & Casey Nguyen",
      invitationCodeHash: hashInvitationCode("NGUYEN27"),
      invitationCodeHint: "N27",
      email: null,
      phone: null,
      notesAdmin: "",
      rsvpStatus: "pending" as const,
      eventIds: [ceremonyId, rehearsalId],
      maxPlusOnes: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: householdD,
      displayName: "Taylor Brooks",
      invitationCodeHash: hashInvitationCode("BROOKS27"),
      invitationCodeHint: "B27",
      email: "taylor.brooks.example@example.com",
      phone: null,
      notesAdmin: "Duplicate first-name test companion household uses Morgan Brooks.",
      rsvpStatus: "pending" as const,
      eventIds: [ceremonyId],
      maxPlusOnes: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Second Brooks for duplicate-name handling demos
  const householdE = randomUUID();
  households.push({
    id: householdE,
    displayName: "Morgan Brooks",
    invitationCodeHash: hashInvitationCode("MORGAN27"),
    invitationCodeHint: "M27",
    email: null,
    phone: null,
    notesAdmin: "",
    rsvpStatus: "pending",
    eventIds: [ceremonyId],
    maxPlusOnes: 0,
    createdAt: now,
    updatedAt: now,
  });

  const guests = [
    guest(householdA, "Alex Rivera", { sortOrder: 1 }),
    guest(householdA, "Riley Rivera", { sortOrder: 2 }),
    guest(householdA, "Quinn Rivera", { isChild: true, sortOrder: 3 }),
    guest(householdB, "Jordan Lee", { sortOrder: 1 }),
    guest(householdB, "Guest of Jordan Lee", {
      isPlusOne: true,
      plusOneNamed: false,
      sortOrder: 2,
    }),
    guest(householdC, "Sam Nguyen", { sortOrder: 1 }),
    guest(householdC, "Casey Nguyen", { sortOrder: 2 }),
    guest(householdD, "Taylor Brooks", { sortOrder: 1 }),
    guest(householdE, "Morgan Brooks", { sortOrder: 1 }),
  ];

  return {
    events,
    mealOptions,
    households,
    guests,
    responses: [],
    submissions: [],
    history: [],
    auditLogs: [],
  };
}
