import { faqItems } from "@/data/faq";
import type {
  FaqItem,
  TravelInfo,
  VenueInfo,
  WeddingPartyMember,
} from "@/data/logistics-types";
import { weddingParty } from "@/data/party";
import { travel } from "@/data/travel";
import { venue } from "@/data/venue";
import type { LogisticsDocument, ResolvedLogistics } from "@/lib/logistics/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function defaultLogisticsDocument(): LogisticsDocument {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
  };
}

export function sanitizeVenue(input: unknown, fallback: VenueInfo): VenueInfo {
  if (!isRecord(input)) return fallback;
  const addressLine1 = asString(input.addressLine1, fallback.addressLine1);
  const name = asString(input.name, fallback.name);
  const mapQuery =
    asString(input.mapQuery) ||
    `${name}, ${addressLine1}`;
  return {
    name,
    city: asString(input.city, fallback.city),
    region: asString(input.region, fallback.region),
    addressLine1,
    addressIsPlaceholder: asBoolean(
      input.addressIsPlaceholder,
      fallback.addressIsPlaceholder,
    ),
    mapQuery,
    mapUrl:
      asString(input.mapUrl) ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
    layers: Array.isArray(input.layers)
      ? input.layers
          .filter(isRecord)
          .map((layer, index) => ({
            id: asString(layer.id, `layer-${index}`),
            label: asString(layer.label, "Layer"),
            src: asString(layer.src, fallback.layers[0]?.src ?? ""),
            alt: asString(layer.alt, ""),
          }))
          .filter((layer) => layer.src)
      : fallback.layers,
  };
}

export function sanitizeTravel(input: unknown, fallback: TravelInfo): TravelInfo {
  if (!isRecord(input)) return fallback;
  return {
    intro: asString(input.intro, fallback.intro),
    airports: Array.isArray(input.airports)
      ? input.airports.filter(isRecord).map((airport, index) => ({
          id: asString(airport.id, `airport-${index}`),
          name: asString(airport.name, "Airport"),
          code: asString(airport.code, "TBD"),
          driveTimeLabel: asString(airport.driveTimeLabel, ""),
          driveTimeIsPlaceholder: asBoolean(
            airport.driveTimeIsPlaceholder,
            true,
          ),
          notes: asString(airport.notes, ""),
          notesIsPlaceholder: asBoolean(airport.notesIsPlaceholder, true),
        }))
      : fallback.airports,
    hotels: Array.isArray(input.hotels)
      ? input.hotels.filter(isRecord).map((hotel, index) => ({
          id: asString(hotel.id, `hotel-${index}`),
          name: asString(hotel.name, "Hotel"),
          status:
            hotel.status === "confirmed" ? "confirmed" : "placeholder",
          address: asString(hotel.address, ""),
          phone: asString(hotel.phone) || undefined,
          bookingUrl: asString(hotel.bookingUrl) || undefined,
          bookingCode: asString(hotel.bookingCode) || undefined,
          bookingDeadline: asString(hotel.bookingDeadline) || undefined,
          notes: asString(hotel.notes, ""),
        }))
      : fallback.hotels,
    transportation: asString(input.transportation, fallback.transportation),
    transportationIsPlaceholder: asBoolean(
      input.transportationIsPlaceholder,
      fallback.transportationIsPlaceholder,
    ),
    recommendations: Array.isArray(input.recommendations)
      ? input.recommendations.filter(isRecord).map((item, index) => ({
          id: asString(item.id, `rec-${index}`),
          category:
            item.category === "restaurant" ||
            item.category === "activity" ||
            item.category === "other"
              ? item.category
              : "other",
          name: asString(item.name, "Recommendation"),
          description: asString(item.description, ""),
          isPlaceholder: asBoolean(item.isPlaceholder, true),
          url: asString(item.url) || undefined,
          imageSrc: asString(item.imageSrc) || undefined,
          imageAlt: asString(item.imageAlt) || undefined,
        }))
      : fallback.recommendations,
    emergencyContact: asString(
      input.emergencyContact,
      fallback.emergencyContact,
    ),
    emergencyIsPlaceholder: asBoolean(
      input.emergencyIsPlaceholder,
      fallback.emergencyIsPlaceholder,
    ),
  };
}

export function sanitizeFaqItems(
  input: unknown,
  fallback: FaqItem[],
): FaqItem[] {
  if (!Array.isArray(input)) return fallback;
  return input.filter(isRecord).map((item, index) => ({
    id: asString(item.id, `faq-${index}`),
    category: asString(item.category, "General"),
    question: asString(item.question, "Question"),
    answer: asString(item.answer, ""),
    answerIsPlaceholder: asBoolean(item.answerIsPlaceholder, false),
  }));
}

export function sanitizePartyMembers(
  input: unknown,
  fallback: WeddingPartyMember[],
): WeddingPartyMember[] {
  if (!Array.isArray(input)) return fallback;
  return input.filter(isRecord).map((member, index) => {
    const side =
      member.side === "bright" ||
      member.side === "lexi" ||
      member.side === "shared"
        ? member.side
        : "shared";
    return {
      id: asString(member.id, `party-${index}`),
      name: asString(member.name, "Add a name"),
      role: asString(member.role, "Add role"),
      side,
      relationship: asString(member.relationship, ""),
      relationshipIsPlaceholder: asBoolean(
        member.relationshipIsPlaceholder,
        false,
      ),
      description: asString(member.description, ""),
      descriptionIsPlaceholder: asBoolean(
        member.descriptionIsPlaceholder,
        false,
      ),
      funFact: asString(member.funFact) || undefined,
      funFactIsPlaceholder: asBoolean(member.funFactIsPlaceholder, false),
      sharedMemory: asString(member.sharedMemory) || undefined,
      photoSrc: asString(member.photoSrc) || undefined,
      photoAlt: asString(member.photoAlt) || undefined,
    };
  });
}

export function resolveLogistics(doc: LogisticsDocument): ResolvedLogistics {
  return {
    venue: sanitizeVenue(doc.venue, venue),
    travel: sanitizeTravel(doc.travel, travel),
    faq: sanitizeFaqItems(doc.faq, faqItems),
    party: sanitizePartyMembers(doc.party, weddingParty),
  };
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
