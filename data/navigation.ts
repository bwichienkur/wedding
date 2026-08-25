import type { NavItem } from "./types";

/**
 * Compact primary destinations — labels stay short so the centered bar
 * does not need horizontal scrolling on phone or desktop.
 */
export const primaryNav: NavItem[] = [
  { id: "story", label: "Story", href: "#story" },
  { id: "wedding-day", label: "Schedule", href: "#wedding-day" },
  { id: "venue", label: "Venue", href: "#venue" },
  { id: "travel", label: "Travel", href: "#travel" },
  { id: "party", label: "Party", href: "#party" },
  { id: "gallery", label: "Gallery", href: "#gallery" },
  { id: "faq", label: "FAQ", href: "#faq" },
  { id: "registry", label: "Registry", href: "#registry" },
];

/** Same compact set for the mobile strip under the header. */
export const mobileQuickNav: NavItem[] = primaryNav;

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Grouped mobile drawer — every guest section, including RSVP. */
export const mobileNavGroups: NavGroup[] = [
  {
    id: "story-group",
    label: "Our story",
    items: [
      { id: "story", label: "Our Story", href: "#story" },
      { id: "gallery", label: "Gallery", href: "#gallery" },
      { id: "proposal", label: "The Proposal", href: "#proposal" },
    ],
  },
  {
    id: "wedding-group",
    label: "The wedding",
    items: [
      { id: "wedding-day", label: "Schedule", href: "#wedding-day" },
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

export function filterNavItems(
  items: NavItem[],
  visible: ReadonlySet<string>,
): NavItem[] {
  return items.filter((item) => visible.has(item.id));
}

export function filterNavGroups(
  groups: NavGroup[],
  visible: ReadonlySet<string>,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, visible),
    }))
    .filter((group) => group.items.length > 0);
}
