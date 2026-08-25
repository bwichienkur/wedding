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
    defaultTitle: "Two paths, drawn together",
    defaultDescription:
      "A living timeline of Bright and Lexi. Confirmed moments are marked; everything else waits for your words and photographs.",
    hasDescription: true,
  },
  {
    id: "gallery",
    label: "Memories gallery",
    defaultVisible: true,
    defaultEyebrow: "Memories",
    defaultTitle: "Moments along the thread",
    defaultDescription:
      "Selected photographs from Bright and Lexi’s story — a calm timeline you can browse at your own pace.",
    hasDescription: true,
  },
  {
    id: "proposal",
    label: "The Proposal",
    defaultVisible: true,
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
    defaultDescription:
      "Two paths become one road to Bella Cosa. Here is how the day unfolds — confirmed moments first, the rest as details arrive.",
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
    defaultTitle: "Travel & accommodations",
    defaultDescription:
      "Travel notes for Lake Wales, Florida. Confirmed bookings appear clearly; everything else stays labeled as a placeholder.",
    hasDescription: true,
  },
  {
    id: "party",
    label: "Wedding Party",
    defaultVisible: true,
    defaultEyebrow: "Wedding party",
    defaultTitle: "Standing beside us",
    defaultDescription:
      "An editorial introduction to the people celebrating with Bright and Lexi. Names and photographs remain placeholders until supplied.",
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
    defaultTitle: "Gifts",
    defaultDescription:
      "Kept intentionally understated. Your presence matters most.",
    hasDescription: true,
  },
  {
    id: "closing",
    label: "Closing",
    defaultVisible: true,
    hasDescription: false,
  },
];

export function getSectionDefinition(
  id: SiteSectionId,
): SiteSectionDefinition | undefined {
  return siteSectionDefinitions.find((section) => section.id === id);
}
