import "server-only";

import type {
  FaqItem,
  TravelInfo,
  VenueInfo,
  WeddingPartyMember,
} from "@/data/logistics-types";
import {
  readLogisticsRaw,
  writeLogisticsRaw,
} from "@/lib/logistics/persistence";
import {
  defaultLogisticsDocument,
  newId,
  resolveLogistics,
  sanitizeFaqItems,
  sanitizePartyMembers,
  sanitizeTravel,
  sanitizeVenue,
} from "@/lib/logistics/resolve";
import type {
  LogisticsDocument,
  ResolvedLogistics,
} from "@/lib/logistics/types";
import { faqItems } from "@/data/faq";
import { weddingParty } from "@/data/party";
import { travel } from "@/data/travel";
import { venue } from "@/data/venue";

export async function readLogisticsDocument(): Promise<LogisticsDocument> {
  try {
    const raw = await readLogisticsRaw();
    const parsed = JSON.parse(raw) as LogisticsDocument;
    if (!parsed || parsed.version !== 1) return defaultLogisticsDocument();
    return {
      version: 1,
      venue: parsed.venue,
      travel: parsed.travel,
      faq: parsed.faq,
      party: parsed.party,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return defaultLogisticsDocument();
  }
}

async function writeLogisticsDocument(
  doc: LogisticsDocument,
): Promise<LogisticsDocument> {
  const next: LogisticsDocument = {
    ...doc,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  await writeLogisticsRaw(JSON.stringify(next, null, 2));
  return next;
}

export async function getResolvedLogistics(): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  return resolveLogistics(doc);
}

export async function updateVenue(
  patch: Partial<VenueInfo>,
): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  const current = resolveLogistics(doc).venue;
  const nextVenue = sanitizeVenue({ ...current, ...patch }, venue);
  doc.venue = nextVenue;
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function updateTravel(
  patch: Partial<TravelInfo>,
): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  const current = resolveLogistics(doc).travel;
  const nextTravel = sanitizeTravel({ ...current, ...patch }, travel);
  doc.travel = nextTravel;
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function replaceFaqItems(
  items: FaqItem[],
): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  doc.faq = sanitizeFaqItems(items, faqItems);
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function upsertFaqItem(
  item: Partial<FaqItem> & Pick<FaqItem, "question" | "answer" | "category">,
): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  const current = resolveLogistics(doc).faq;
  const id = item.id?.trim() || newId("faq");
  const nextItem: FaqItem = {
    id,
    category: item.category,
    question: item.question,
    answer: item.answer,
    answerIsPlaceholder: Boolean(item.answerIsPlaceholder),
  };
  const index = current.findIndex((entry) => entry.id === id);
  const next =
    index >= 0
      ? current.map((entry, i) => (i === index ? nextItem : entry))
      : [...current, nextItem];
  doc.faq = next;
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function deleteFaqItem(id: string): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  const current = resolveLogistics(doc).faq;
  doc.faq = current.filter((item) => item.id !== id);
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function replacePartyMembers(
  members: WeddingPartyMember[],
): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  doc.party = sanitizePartyMembers(members, weddingParty);
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function upsertPartyMember(
  member: Partial<WeddingPartyMember> &
    Pick<WeddingPartyMember, "name" | "role" | "side" | "description">,
): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  const current = resolveLogistics(doc).party;
  const id = member.id?.trim() || newId("party");
  const nextMember: WeddingPartyMember = {
    id,
    name: member.name,
    role: member.role,
    side: member.side,
    relationship: member.relationship ?? "",
    relationshipIsPlaceholder: Boolean(member.relationshipIsPlaceholder),
    description: member.description,
    descriptionIsPlaceholder: Boolean(member.descriptionIsPlaceholder),
    funFact: member.funFact,
    funFactIsPlaceholder: Boolean(member.funFactIsPlaceholder),
    sharedMemory: member.sharedMemory,
    photoSrc: member.photoSrc,
    photoAlt: member.photoAlt,
  };
  const index = current.findIndex((entry) => entry.id === id);
  const next =
    index >= 0
      ? current.map((entry, i) => (i === index ? nextMember : entry))
      : [...current, nextMember];
  doc.party = next;
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export async function deletePartyMember(id: string): Promise<ResolvedLogistics> {
  const doc = await readLogisticsDocument();
  const current = resolveLogistics(doc).party;
  doc.party = current.filter((member) => member.id !== id);
  await writeLogisticsDocument(doc);
  return resolveLogistics(doc);
}

export { resolveLogistics };
