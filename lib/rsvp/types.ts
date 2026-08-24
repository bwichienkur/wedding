import { z } from "zod";

export const attendingSchema = z.enum(["yes", "no", "unknown"]);
export const rsvpStatusSchema = z.enum([
  "pending",
  "partial",
  "complete",
  "declined",
]);

export const eventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  startsAt: z.string().nullable(),
  location: z.string().nullable(),
  isAdultsOnly: z.boolean(),
  allowsPlusOnes: z.boolean(),
  collectMeals: z.boolean(),
  sortOrder: z.number().int(),
});

export const mealOptionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  label: z.string(),
  description: z.string().default(""),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export const guestSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  fullName: z.string(),
  normalizedName: z.string(),
  isChild: z.boolean(),
  isPlusOne: z.boolean(),
  plusOneNamed: z.boolean(),
  sortOrder: z.number().int(),
});

export const householdSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  invitationCodeHash: z.string().nullable(),
  invitationCodeHint: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  notesAdmin: z.string().default(""),
  rsvpStatus: rsvpStatusSchema,
  eventIds: z.array(z.string()),
  maxPlusOnes: z.number().int().nonnegative().default(0),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const guestResponseSchema = z.object({
  id: z.string(),
  guestId: z.string(),
  eventId: z.string(),
  attending: attendingSchema,
  mealOptionId: z.string().nullable(),
  dietaryNotes: z.string().default(""),
  accessibilityNotes: z.string().default(""),
});

export const lookupRequestSchema = z.object({
  query: z.string().trim().min(2).max(120),
});

export const householdSelectSchema = z.object({
  householdId: z.string().min(1),
  confirmationToken: z.string().min(1),
});

export const guestResponseInputSchema = z.object({
  guestId: z.string(),
  eventId: z.string(),
  attending: attendingSchema,
  mealOptionId: z.string().nullable().optional(),
  dietaryNotes: z.string().max(500).optional(),
  accessibilityNotes: z.string().max(500).optional(),
  plusOneName: z.string().max(120).optional(),
});

export const submitRsvpSchema = z.object({
  songRequest: z.string().max(200).optional(),
  messageToCouple: z.string().max(1000).optional(),
  responses: z.array(guestResponseInputSchema).min(1),
});

export type Attending = z.infer<typeof attendingSchema>;
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;
export type EventRecord = z.infer<typeof eventSchema>;
export type MealOption = z.infer<typeof mealOptionSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type Household = z.infer<typeof householdSchema>;
export type GuestResponse = z.infer<typeof guestResponseSchema>;

export interface RsvpSubmission {
  id: string;
  householdId: string;
  submittedAt: string;
  submittedBy: "guest" | "admin";
  songRequest: string;
  messageToCouple: string;
  ipHash: string | null;
}

export interface RsvpUpdateHistory {
  id: string;
  householdId: string;
  payloadJson: string;
  changedBy: "guest" | "admin";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadataJson: string;
  createdAt: string;
}

export interface RsvpDatabase {
  events: EventRecord[];
  mealOptions: MealOption[];
  households: Household[];
  guests: Guest[];
  responses: GuestResponse[];
  submissions: RsvpSubmission[];
  history: RsvpUpdateHistory[];
  auditLogs: AuditLog[];
}

/** Safe household candidate returned to the client after lookup. */
export interface HouseholdCandidate {
  confirmationToken: string;
  displayName: string;
  guestPreview: string[];
  invitedEventTitles: string[];
}
