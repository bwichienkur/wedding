import type { MediaCategory } from "@/lib/media/types";

export interface PublicVideoPlacement {
  placementKey: string;
  category: MediaCategory;
  title: string;
  description: string;
  /** Optional known Mux playback id for demos without admin upload */
  demoPlaybackId?: string;
  posterUrl?: string;
  captionsUrl?: string;
  transcript?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

/**
 * Public video placements. Real Mux assets are assigned in admin.
 * Until then, the UI shows polished unavailable / poster states.
 */
export const videoPlacements: PublicVideoPlacement[] = [
  {
    placementKey: "proposal.teaser",
    category: "proposal_teaser",
    title: "Proposal teaser",
    description: "A short muted preview of the proposal film.",
    aspectRatio: "16:9",
  },
  {
    placementKey: "proposal.highlight",
    category: "proposal_highlight",
    title: "Proposal highlight",
    description: "The highlight film guests can choose to watch.",
    aspectRatio: "16:9",
  },
  {
    placementKey: "proposal.full",
    category: "proposal_full",
    title: "Full proposal film",
    description: "The complete proposal film.",
    aspectRatio: "16:9",
  },
];

export function getPlacement(placementKey: string) {
  return videoPlacements.find((item) => item.placementKey === placementKey);
}
