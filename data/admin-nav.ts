export type AdminNavId = "home" | "sections" | "content" | "media" | "rsvp";

export interface AdminNavItem {
  id: AdminNavId;
  href: string;
  label: string;
  description: string;
}

/** Primary admin navigation — matches how the live invite is organized. */
export const adminNavItems: AdminNavItem[] = [
  {
    id: "home",
    href: "/admin",
    label: "Overview",
    description: "Dashboard and quick links",
  },
  {
    id: "sections",
    href: "/admin/sections",
    label: "Sections",
    description: "Show, hide, and edit section headings on the invite",
  },
  {
    id: "content",
    href: "/admin/content",
    label: "Content",
    description: "FAQ, party bios, venue, and travel details",
  },
  {
    id: "media",
    href: "/admin/media",
    label: "Media",
    description: "Photos and videos assigned to invite sections",
  },
  {
    id: "rsvp",
    href: "/admin/rsvp",
    label: "RSVP",
    description: "Guest responses and invitation codes",
  },
];

export interface AdminDashboardGroup {
  title: string;
  items: Array<{
    href: string;
    title: string;
    body: string;
    navId: Exclude<AdminNavId, "home">;
  }>;
}

export const adminDashboardGroups: AdminDashboardGroup[] = [
  {
    title: "Invite layout",
    items: [
      {
        href: "/admin/sections",
        title: "Section visibility & copy",
        body: "Headings and descriptions for each block on the scrolling invite — venue, story, gallery, RSVP, and more.",
        navId: "sections",
      },
    ],
  },
  {
    title: "Guest-facing content",
    items: [
      {
        href: "/admin/content",
        title: "Structured content",
        body: "FAQ answers, wedding-party bios, Bella Cosa venue copy, and travel notes.",
        navId: "content",
      },
      {
        href: "/admin/media",
        title: "Photos & video",
        body: "Upload portraits and gallery images. Bundled site files (e.g. party photos in the repo) appear here too.",
        navId: "media",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/admin/rsvp",
        title: "RSVP management",
        body: "Look up households, export responses, and manage invitation codes.",
        navId: "rsvp",
      },
    ],
  },
];
