import type { MediaCategory, MediaKind } from "@/lib/media/types";

export interface SectionMediaPlacement {
  key: string;
  sectionId: string;
  label: string;
  description: string;
  /** Accept photos, videos, or both */
  accepts: MediaKind[];
  /** Allow multiple assets (hero carousel, gallery) */
  allowMultiple: boolean;
  /** Suggested Mux/video category when uploading video */
  defaultCategory: MediaCategory;
  storyMomentId?: string;
}

/**
 * Canonical placements for assigning uploads to public page sections.
 */
export const sectionMediaPlacements: SectionMediaPlacement[] = [
  {
    key: "home.hero",
    sectionId: "home",
    label: "Hero slides (optional)",
    description:
      "Extra hero stills if you enable a photo carousel. The live invite uses the opening video and names/date overlay — not these slides.",
    accepts: ["image"],
    allowMultiple: true,
    defaultCategory: "section_photo",
  },
  {
    key: "story.how-we-met",
    sectionId: "story",
    label: "Story · How we met",
    description: "Photograph for the “How we met” milestone.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "relationship_memory",
    storyMomentId: "how-we-met",
  },
  {
    key: "story.proposal",
    sectionId: "story",
    label: "Story · Proposal",
    description: "Still photo for the proposal chapter in Our Story.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "relationship_memory",
    storyMomentId: "proposal",
  },
  {
    key: "story.wedding",
    sectionId: "story",
    label: "Story · Wedding",
    description: "Photograph for the wedding chapter in Our Story.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "relationship_memory",
    storyMomentId: "wedding",
  },
  {
    key: "gallery",
    sectionId: "gallery",
    label: "Memories gallery",
    description: "Photos in the scrolling gallery section (matches Sections → Memories gallery).",
    accepts: ["image"],
    allowMultiple: true,
    defaultCategory: "relationship_memory",
  },
  {
    key: "proposal.highlight",
    sectionId: "proposal",
    label: "Proposal highlight film",
    description: "Mux video for the proposal highlight player.",
    accepts: ["video"],
    allowMultiple: false,
    defaultCategory: "proposal_highlight",
  },
  {
    key: "proposal.full",
    sectionId: "proposal",
    label: "Proposal full film",
    description: "Mux video for the full proposal film.",
    accepts: ["video"],
    allowMultiple: false,
    defaultCategory: "proposal_full",
  },
  {
    key: "proposal.teaser",
    sectionId: "proposal",
    label: "Proposal teaser",
    description: "Optional short muted teaser film.",
    accepts: ["video"],
    allowMultiple: false,
    defaultCategory: "proposal_teaser",
  },
  {
    key: "proposal.still",
    sectionId: "proposal",
    label: "Proposal still",
    description: "Photograph shown in the proposal section frame.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "section_photo",
  },
  {
    key: "venue.architecture",
    sectionId: "venue",
    label: "Venue · Architecture",
    description: "Venue architecture layer photo.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "section_photo",
  },
  {
    key: "venue.foliage",
    sectionId: "venue",
    label: "Venue · Foliage",
    description: "Venue foliage / grounds layer photo.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "section_photo",
  },
  {
    key: "venue.sky",
    sectionId: "venue",
    label: "Venue · Sky",
    description: "Venue sky / atmosphere layer photo.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "section_photo",
  },
  {
    key: "party",
    sectionId: "party",
    label: "Wedding party portraits",
    description:
      "One portrait per person. Set title or alt to the member id (e.g. zach-bragg) to match bios. Repo photos appear as bundled assets until uploaded here.",
    accepts: ["image"],
    allowMultiple: true,
    defaultCategory: "section_photo",
  },
  {
    key: "closing",
    sectionId: "closing",
    label: "Closing photograph",
    description: "Optional closing-section photograph.",
    accepts: ["image"],
    allowMultiple: false,
    defaultCategory: "section_photo",
  },
];

export function getSectionPlacement(key: string): SectionMediaPlacement | undefined {
  return sectionMediaPlacements.find((item) => item.key === key);
}

export function placementsForSection(sectionId: string): SectionMediaPlacement[] {
  return sectionMediaPlacements.filter((item) => item.sectionId === sectionId);
}
