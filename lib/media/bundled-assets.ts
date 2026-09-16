import { weddingParty } from "@/data/party";
import type { WeddingPartyMember } from "@/data/logistics-types";

/** Static / repo-backed media shown on the site but not in the upload library. */
export interface BundledMediaAsset {
  id: string;
  placementKey: string;
  memberId?: string;
  title: string;
  alt: string;
  publicUrl: string;
  source: "bundled";
  hint: string;
}

function partyPortraitBundled(member: WeddingPartyMember): BundledMediaAsset | null {
  const src = member.photoSrc?.trim();
  if (!src || !src.startsWith("/")) return null;
  return {
    id: `bundled:party:${member.id}`,
    placementKey: "party",
    memberId: member.id,
    title: member.id,
    alt: member.photoAlt || member.name,
    publicUrl: src,
    source: "bundled",
    hint: "Stored in the site repo (public/). Upload to Media to move it into cloud storage.",
  };
}

/** Default bundled assets from repo data (before logistics overrides). */
export function listDefaultBundledMediaAssets(): BundledMediaAsset[] {
  return weddingParty
    .map(partyPortraitBundled)
    .filter((item): item is BundledMediaAsset => item !== null);
}

export function listBundledMediaFromParty(
  members: WeddingPartyMember[],
): BundledMediaAsset[] {
  const seen = new Set<string>();
  const out: BundledMediaAsset[] = [];
  for (const member of members) {
    const item = partyPortraitBundled(member);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}
