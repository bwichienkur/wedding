import type { SiteSectionId } from "@/data/sections";
import { placementsForSection } from "@/data/section-media";

export interface AdminSectionGuide {
  /** Matches scroll order on the live invite (when mounted). */
  inviteOrder: number | null;
  mountedOnInvite: boolean;
  contentTab?: "venue" | "travel" | "faq" | "party";
  mediaSectionId?: string;
  hint: string;
}

const guides: Record<SiteSectionId, AdminSectionGuide> = {
  marquee: {
    inviteOrder: null,
    mountedOnInvite: false,
    hint: "Not used on the current video-invite layout.",
  },
  venue: {
    inviteOrder: 1,
    mountedOnInvite: true,
    contentTab: "venue",
    mediaSectionId: "venue",
    hint: "Venue copy in Content → Venue. Photo uses the first venue media slot.",
  },
  "wedding-day": {
    inviteOrder: 2,
    mountedOnInvite: true,
    hint: "Schedule copy under Sections. Timeline details live in site code.",
  },
  travel: {
    inviteOrder: 3,
    mountedOnInvite: true,
    contentTab: "travel",
    hint: "Airports and lodging in Content → Travel.",
  },
  story: {
    inviteOrder: 4,
    mountedOnInvite: true,
    mediaSectionId: "story",
    hint: "Chapter photos in Media → Our story. Milestone text in site data.",
  },
  gallery: {
    inviteOrder: 5,
    mountedOnInvite: true,
    mediaSectionId: "gallery",
    hint: "Gallery cards come from Media → Memories gallery.",
  },
  party: {
    inviteOrder: 6,
    mountedOnInvite: true,
    contentTab: "party",
    mediaSectionId: "party",
    hint: "Bios in Content → Wedding party. Portraits in Media → Wedding party (or bundled repo photos).",
  },
  rsvp: {
    inviteOrder: 7,
    mountedOnInvite: true,
    hint: "RSVP form settings in RSVP admin. Section copy here.",
  },
  faq: {
    inviteOrder: 8,
    mountedOnInvite: true,
    contentTab: "faq",
    hint: "Questions and answers in Content → FAQ.",
  },
  registry: {
    inviteOrder: 9,
    mountedOnInvite: true,
    hint: "Registry link and copy under Sections.",
  },
  proposal: {
    inviteOrder: null,
    mountedOnInvite: false,
    mediaSectionId: "proposal",
    hint: "Proposal block is not on the invite scroll; media slots are for a future layout.",
  },
  closing: {
    inviteOrder: null,
    mountedOnInvite: false,
    mediaSectionId: "closing",
    hint: "Closing block is not on the invite scroll.",
  },
};

export function getAdminSectionGuide(id: SiteSectionId): AdminSectionGuide {
  return guides[id];
}

export function mediaPlacementCountForSection(sectionId: string): number {
  return placementsForSection(sectionId).length;
}
