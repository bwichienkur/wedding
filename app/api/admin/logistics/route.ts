import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import {
  deleteFaqItem,
  deletePartyMember,
  getResolvedLogistics,
  updateTravel,
  updateVenue,
  upsertFaqItem,
  upsertPartyMember,
} from "@/lib/logistics/store";

const venueSchema = z.object({
  kind: z.literal("venue"),
  name: z.string().min(1).max(120).optional(),
  city: z.string().min(1).max(80).optional(),
  region: z.string().min(1).max(80).optional(),
  addressLine1: z.string().min(1).max(200).optional(),
  addressIsPlaceholder: z.boolean().optional(),
  directions: z.string().max(800).optional(),
  directionsIsPlaceholder: z.boolean().optional(),
  weather: z.string().max(800).optional(),
  weatherIsPlaceholder: z.boolean().optional(),
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
  phone: z.string().max(40).optional(),
  bookingUrl: z.string().max(400).optional(),
  bookingCode: z.string().max(80).optional(),
  bookingDeadline: z.string().max(120).optional(),
  notes: z.string().max(600),
});

const recommendationSchema = z.object({
  id: z.string().min(1).max(80),
  category: z.enum(["restaurant", "activity", "other"]),
  name: z.string().min(1).max(160),
  description: z.string().max(600),
  isPlaceholder: z.boolean().default(false),
  url: z.string().max(400).optional(),
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
  id: z.string().min(1).max(80).optional(),
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
  id: z.string().min(1).max(80).optional(),
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(80),
  side: z.enum(["bright", "lexi", "shared"]),
  relationship: z.string().max(240).optional(),
  relationshipIsPlaceholder: z.boolean().optional(),
  description: z.string().max(800),
  descriptionIsPlaceholder: z.boolean().optional(),
  funFact: z.string().max(240).optional(),
  funFactIsPlaceholder: z.boolean().optional(),
  sharedMemory: z.string().max(400).optional(),
  photoSrc: z.string().max(400).optional(),
  photoAlt: z.string().max(200).optional(),
});

const partyDeleteSchema = z.object({
  kind: z.literal("party"),
  action: z.literal("delete"),
  id: z.string().min(1).max(80),
});

const patchSchema = z.discriminatedUnion("kind", [
  venueSchema,
  travelSchema,
  faqUpsertSchema,
  faqDeleteSchema,
  partyUpsertSchema,
  partyDeleteSchema,
]);

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logistics = await getResolvedLogistics();
  return NextResponse.json(logistics);
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid logistics update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;
    let logistics;
    if (data.kind === "venue") {
      logistics = await updateVenue({
        name: data.name,
        city: data.city,
        region: data.region,
        addressLine1: data.addressLine1,
        addressIsPlaceholder: data.addressIsPlaceholder,
        directions: data.directions,
        directionsIsPlaceholder: data.directionsIsPlaceholder,
        weather: data.weather,
        weatherIsPlaceholder: data.weatherIsPlaceholder,
      });
    } else if (data.kind === "travel") {
      logistics = await updateTravel({
        intro: data.intro,
        airports: data.airports,
        hotels: data.hotels,
        transportation: data.transportation,
        transportationIsPlaceholder: data.transportationIsPlaceholder,
        recommendations: data.recommendations,
        emergencyContact: data.emergencyContact,
        emergencyIsPlaceholder: data.emergencyIsPlaceholder,
      });
    } else if (data.kind === "faq" && data.action === "upsert") {
      logistics = await upsertFaqItem(data);
    } else if (data.kind === "faq" && data.action === "delete") {
      logistics = await deleteFaqItem(data.id);
    } else if (data.kind === "party" && data.action === "upsert") {
      logistics = await upsertPartyMember(data);
    } else {
      logistics = await deletePartyMember(data.id);
    }
    return NextResponse.json(logistics);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update logistics";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
