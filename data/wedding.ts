import type { WeddingConfig } from "./types";

/**
 * Central wedding configuration.
 * Presentation components must read from here — do not hardcode facts in UI.
 * Never invent logistics; use clearly labeled placeholders instead.
 */
export const wedding: WeddingConfig = {
  couple: {
    partnerOne: "Bright",
    partnerTwo: "Lexi",
    displayName: "Bright & Lexi",
    monogramLetters: ["B", "L"],
  },
  wedding: {
    dateISO: "2027-05-15",
    dateDisplay: "May 15, 2027",
    venueName: "Bella Cosa",
    city: "Lake Wales",
    region: "Florida",
    country: "United States",
    timezone: "America/New_York",
    accessBegins: "9:00 AM",
    photographyBegins: "2:00 PM",
    ceremonyBegins: "4:00 PM",
    dinnerStyle: "Reception",
    receptionNotes: [
      "Reception begins at 5:30 PM",
      "Sparkler sendoff",
    ],
  },
  anniversary: {
    dating: {
      dateISO: "2025-03-20",
      dateDisplay: "March 20, 2025",
      label: "Dating anniversary",
    },
  },
  hero: {
    statement:
      "Add a short invitation statement that feels personal to Bright and Lexi.",
    statementIsPlaceholder: true,
  },
  entry: {
    beginLabel: "Open wedding invitation",
    skipDetailsLabel: "Skip to wedding details",
    rsvpLabel: "RSVP",
    inviteHeadline:
      "You’re cordially invited to the wedding of Bright & Lexi",
    invitePreamble: "You’re cordially invited to the wedding of",
    inviteNames: "Bright & Lexi",
    inviteSubline: "May 15, 2027 · Bella Cosa · Lake Wales, Florida",
    tapHint: "Tap the glowing seal to open",
    openingHint: "Opening your invitation",
  },
  closing: {
    message:
      "Add a short closing message from Bright and Lexi to their guests.",
    messageIsPlaceholder: true,
  },
  proposal: {
    transitionCopy: "And then, everything changed.",
    dateLabel: "December 13, 2025",
    dateIsPlaceholder: false,
    locationLabel: "Joe & Jodi’s home, Longwood, Florida",
    locationIsPlaceholder: false,
  },
  contact: {
    email: "Add a contact email.",
    emailIsPlaceholder: true,
    phone: "Add a contact phone number.",
    phoneIsPlaceholder: true,
  },
  rsvp: {
    deadlineLabel: "Add the RSVP deadline.",
    deadlineIsPlaceholder: true,
  },
  site: {
    mode: "public",
    canonicalUrl: "https://example.com",
    title: "Bright & Lexi · May 15, 2027",
    description:
      "Bright and Lexi are getting married on May 15, 2027 at Bella Cosa in Lake Wales, Florida.",
  },
  featureFlags: {
    cinematicEntry: true,
    countdown: true,
    // Flat SVG monogram + hairline thread — metallic TubeGeometry reads as CGI, not filament.
    threeMonogram: false,
    floatingGallery: false,
    perspectives: true,
  },
  colors: {
    ivory: "#F4EBDA",
    parchment: "#122036",
    sage: "#9AA5B5",
    sageDeep: "#7D8899",
    forest: "#070F1C",
    charcoal: "#E6DCC4",
    stone: "#3A4D66",
    gold: "#D4AF37",
    goldSoft: "#E8C65A",
    inkMuted: "#A8B4C4",
  },
};

export function weddingLocationLine(): string {
  return `${wedding.wedding.venueName} · ${wedding.wedding.city}, ${wedding.wedding.region}`;
}
