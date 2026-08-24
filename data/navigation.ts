import type { NavItem } from "./types";

/** Desktop primary navigation — RSVP is rendered separately as a prominent action. */
export const primaryNav: NavItem[] = [
  { id: "story", label: "Our Story", href: "#story" },
  { id: "wedding-day", label: "Wedding Day", href: "#wedding-day" },
  { id: "venue", label: "Venue", href: "#venue" },
  { id: "travel", label: "Travel", href: "#travel" },
  { id: "faq", label: "FAQ", href: "#faq" },
  { id: "registry", label: "Registry", href: "#registry" },
];

/** Quick-jump chips under the header on small screens (Zola-like clarity). */
export const mobileQuickNav: NavItem[] = [
  { id: "story", label: "Story", href: "#story" },
  { id: "wedding-day", label: "Schedule", href: "#wedding-day" },
  { id: "venue", label: "Venue", href: "#venue" },
  { id: "travel", label: "Travel", href: "#travel" },
  { id: "faq", label: "FAQ", href: "#faq" },
  { id: "registry", label: "Registry", href: "#registry" },
];

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Grouped mobile drawer — clearer than a flat list of anchors. */
export const mobileNavGroups: NavGroup[] = [
  {
    id: "story-group",
    label: "Our story",
    items: [
      { id: "story", label: "Our Story", href: "#story" },
      { id: "gallery", label: "Memories", href: "#gallery" },
      { id: "proposal", label: "The Proposal", href: "#proposal" },
    ],
  },
  {
    id: "wedding-group",
    label: "The wedding",
    items: [
      { id: "wedding-day", label: "Wedding Day", href: "#wedding-day" },
      { id: "venue", label: "Venue", href: "#venue" },
      { id: "travel", label: "Travel", href: "#travel" },
      { id: "party", label: "Wedding Party", href: "#party" },
    ],
  },
  {
    id: "guests-group",
    label: "For guests",
    items: [
      { id: "rsvp", label: "RSVP", href: "#rsvp" },
      { id: "faq", label: "FAQ", href: "#faq" },
      { id: "registry", label: "Registry", href: "#registry" },
    ],
  },
];

export const rsvpNav: NavItem = {
  id: "rsvp",
  label: "RSVP",
  href: "#rsvp",
};

export const weddingDetailsHref = "#wedding-day";
export const storyHref = "#story";
export const mainContentId = "main-content";
