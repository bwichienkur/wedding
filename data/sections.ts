/**
 * Canonical homepage sections that admins can show/hide and re-copy.
 * Hero stays structural and is not listed here.
 */

export type SiteSectionId =
  | "marquee"
  | "story"
  | "gallery"
  | "proposal"
  | "wedding-day"
  | "venue"
  | "travel"
  | "party"
  | "rsvp"
  | "faq"
  | "registry"
  | "closing";

export interface SiteSectionDefinition {
  id: SiteSectionId;
  label: string;
  /** Default visibility on the public site */
  defaultVisible: boolean;
  /** Cannot be turned off in admin (safety for core guest flows) */
  required?: boolean;
  defaultEyebrow?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  /** Whether description editing is meaningful for this block */
  hasDescription: boolean;
}

export const siteSectionDefinitions: SiteSectionDefinition[] = [
  {
    id: "marquee",
    label: "Marquee ticker",
    defaultVisible: true,
    hasDescription: false,
  },
  {
    id: "story",
    label: "Our Story",
    defaultVisible: true,
    defaultEyebrow: "Our story",
    defaultTitle: "How we got here",
    defaultDescription:
      "Three chapters — how we met, the proposal, and our wedding day at Bella Cosa.",
    hasDescription: true,
  },
  {
    id: "gallery",
    label: "Gallery",
    defaultVisible: true,
    defaultEyebrow: "Gallery",
    defaultTitle: "Our moments",
    defaultDescription:
      "Photographs from Bright and Lexi’s story.",
    hasDescription: true,
  },
  {
    id: "proposal",
    label: "The Proposal",
    defaultVisible: false,
    defaultEyebrow: "Proposal",
    defaultTitle: "And then, everything changed.",
    defaultDescription: "",
    hasDescription: true,
  },
  {
    id: "wedding-day",
    label: "Wedding Day",
    defaultVisible: true,
    defaultEyebrow: "Wedding day",
    defaultTitle: "May 15, 2027",
    defaultDescription: "",
    hasDescription: true,
  },
  {
    id: "venue",
    label: "Venue",
    defaultVisible: true,
    defaultEyebrow: "Venue",
    defaultTitle: "Bella Cosa",
    defaultDescription: "Lake Wales, Florida",
    hasDescription: true,
  },
  {
    id: "travel",
    label: "Travel",
    defaultVisible: true,
    defaultEyebrow: "Travel",
    defaultTitle: "Travel",
    defaultDescription: "",
    hasDescription: true,
  },
  {
    id: "party",
    label: "Wedding Party",
    defaultVisible: true,
    defaultEyebrow: "Wedding party",
    defaultTitle: "Standing beside us",
    defaultDescription:
      "Bright’s groomsmen, Lexi’s bridesmaids, and the people celebrating with us.",
    hasDescription: true,
  },
  {
    id: "rsvp",
    label: "RSVP",
    defaultVisible: true,
    required: true,
    defaultEyebrow: "RSVP",
    defaultTitle: "We hope you’ll be there",
    defaultDescription:
      "Find your invitation by name or code, then respond for everyone in your household.",
    hasDescription: true,
  },
  {
    id: "faq",
    label: "FAQ",
    defaultVisible: true,
    defaultEyebrow: "FAQ",
    defaultTitle: "A few helpful answers",
    defaultDescription:
      "Search or browse by topic. Placeholder answers stay clearly labeled until confirmed.",
    hasDescription: true,
  },
  {
    id: "registry",
    label: "Registry",
    defaultVisible: true,
    defaultEyebrow: "Registry",
    defaultTitle: "Registry",
    defaultDescription:
      "Your presence means the world to us. Our registry is on Zola.",
    hasDescription: true,
  },
  {
    id: "closing",
    label: "Closing",
    defaultVisible: false,
    hasDescription: false,
  },
];

export function getSectionDefinition(
  id: SiteSectionId,
): SiteSectionDefinition | undefined {
  return siteSectionDefinitions.find((section) => section.id === id);
}
