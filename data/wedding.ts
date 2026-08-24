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
    dinnerStyle: "Plated dinner",
    receptionNotes: [
      "Toasts and speeches",
      "Dancing",
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
    beginLabel: "Begin our story",
    skipDetailsLabel: "Skip to wedding details",
    rsvpLabel: "RSVP",
  },
  closing: {
    message:
      "Add a short closing message from Bright and Lexi to their guests.",
    messageIsPlaceholder: true,
  },
  proposal: {
    transitionCopy: "And then, everything changed.",
    dateLabel: "Add the proposal date.",
    dateIsPlaceholder: true,
    locationLabel: "Add the proposal location.",
    locationIsPlaceholder: true,
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
    ivory: "#F7F1EA",
    parchment: "#EEE4D8",
    sage: "#C4B7AB",
    sageDeep: "#8F7F72",
    forest: "#2C2420",
    charcoal: "#3A322E",
    stone: "#D5C8BC",
    gold: "#B8956C",
    goldSoft: "#C9AD8A",
    inkMuted: "#6B605A",
  },
};

export function weddingLocationLine(): string {
  return `${wedding.wedding.venueName} · ${wedding.wedding.city}, ${wedding.wedding.region}`;
}
