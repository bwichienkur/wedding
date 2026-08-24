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

export const rsvpNav: NavItem = {
  id: "rsvp",
  label: "RSVP",
  href: "#rsvp",
};

export const weddingDetailsHref = "#wedding-day";
export const storyHref = "#story";
export const mainContentId = "main-content";
