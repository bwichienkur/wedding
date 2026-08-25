import { z } from "zod";

/** Treat blank strings as omitted so “add” payloads with `id: ""` validate. */
const optionalId = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().min(1).max(80).optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().max(max).optional(),
  );

const venueSchema = z.object({
  kind: z.literal("venue"),
  name: z.string().min(1).max(120).optional(),
  city: z.string().min(1).max(80).optional(),
  region: z.string().min(1).max(80).optional(),
  addressLine1: z.string().min(1).max(200).optional(),
  addressIsPlaceholder: z.boolean().optional(),
});

const airportSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  code: z.string().min(1).max(12),
  driveTimeLabel: z.string().max(240),
  driveTimeIsPlaceholder: z.boolean().default(true),
  notes: z.string().max(600),
  notesIsPlaceholder: z.boolean().default(true),
});

const hotelSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  status: z.enum(["confirmed", "placeholder"]),
  address: z.string().max(240),
  phone: optionalText(40),
  bookingUrl: optionalText(400),
  bookingCode: optionalText(80),
  bookingDeadline: optionalText(120),
  notes: z.string().max(600),
});

const recommendationSchema = z.object({
  id: z.string().min(1).max(80),
  category: z.enum(["restaurant", "activity", "other"]),
  name: z.string().min(1).max(160),
  description: z.string().max(600),
  isPlaceholder: z.boolean().default(false),
  url: optionalText(400),
  imageSrc: optionalText(400),
  imageAlt: optionalText(200),
});

const travelSchema = z.object({
  kind: z.literal("travel"),
  intro: z.string().max(600).optional(),
  airports: z.array(airportSchema).max(12).optional(),
  hotels: z.array(hotelSchema).max(12).optional(),
  transportation: z.string().max(800).optional(),
  transportationIsPlaceholder: z.boolean().optional(),
  recommendations: z.array(recommendationSchema).max(24).optional(),
  emergencyContact: z.string().max(400).optional(),
  emergencyIsPlaceholder: z.boolean().optional(),
});

const faqUpsertSchema = z.object({
  kind: z.literal("faq"),
  action: z.literal("upsert"),
  id: optionalId,
  category: z.string().min(1).max(80),
  question: z.string().min(1).max(240),
  answer: z.string().max(2000),
  answerIsPlaceholder: z.boolean().optional(),
});

const faqDeleteSchema = z.object({
  kind: z.literal("faq"),
  action: z.literal("delete"),
  id: z.string().min(1).max(80),
});

const partyUpsertSchema = z.object({
  kind: z.literal("party"),
  action: z.literal("upsert"),
  id: optionalId,
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(80),
  side: z.enum(["bright", "lexi", "shared"]),
  relationship: z.string().max(240).optional(),
  relationshipIsPlaceholder: z.boolean().optional(),
  description: z.string().max(800),
  descriptionIsPlaceholder: z.boolean().optional(),
  funFact: optionalText(240),
  funFactIsPlaceholder: z.boolean().optional(),
  sharedMemory: optionalText(400),
  photoSrc: optionalText(400),
  photoAlt: optionalText(200),
});

const partyDeleteSchema = z.object({
  kind: z.literal("party"),
  action: z.literal("delete"),
  id: z.string().min(1).max(80),
});

/**
 * Plain union — Zod discriminated unions require unique `kind` values,
 * but FAQ/party both need upsert + delete variants.
 */
export const logisticsPatchSchema = z.union([
  venueSchema,
  travelSchema,
  faqUpsertSchema,
  faqDeleteSchema,
  partyUpsertSchema,
  partyDeleteSchema,
]);

export type LogisticsPatch = z.infer<typeof logisticsPatchSchema>;
