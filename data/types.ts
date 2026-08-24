export type SiteMode =
  | "public"
  | "password"
  | "invitation"
  | "public-logistics-private-rsvp"
  | "private-proposal-video";

export type Perspective = "bright" | "lexi" | "shared" | "actual";

export type StoryMediaKind = "image" | "video" | "audio" | "quote";

export interface FocalPoint {
  x: number;
  y: number;
}

export interface StoryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  focalPoint?: FocalPoint;
  placeholder?: boolean;
  caption?: string;
}

export interface StoryPassage {
  perspective: Perspective;
  title?: string;
  body: string;
  isPlaceholder?: boolean;
}

export interface StoryMilestone {
  id: string;
  dateLabel: string;
  /** ISO date when known; omit for placeholders */
  dateISO?: string;
  locationLabel?: string;
  title: string;
  featured?: boolean;
  image?: StoryImage;
  passages: StoryPassage[];
  /** Moments that support Bright / Lexi / What actually happened */
  perspectivesEnabled?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface WeddingConfig {
  couple: {
    partnerOne: string;
    partnerTwo: string;
    displayName: string;
    monogramLetters: [string, string];
  };
  wedding: {
    dateISO: string;
    dateDisplay: string;
    venueName: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
    accessBegins: string;
    photographyBegins: string;
    ceremonyBegins: string;
    dinnerStyle: string;
    receptionNotes: string[];
  };
  anniversary: {
    dating: {
      dateISO: string;
      dateDisplay: string;
      label: string;
    };
  };
  hero: {
    statement: string;
    statementIsPlaceholder: boolean;
  };
  entry: {
    beginLabel: string;
    skipDetailsLabel: string;
    rsvpLabel: string;
    inviteHeadline: string;
    inviteSubline: string;
  };
  closing: {
    message: string;
    messageIsPlaceholder: boolean;
  };
  proposal: {
    transitionCopy: string;
    dateLabel: string;
    dateIsPlaceholder: boolean;
    locationLabel: string;
    locationIsPlaceholder: boolean;
  };
  contact: {
    email: string;
    emailIsPlaceholder: boolean;
    phone: string;
    phoneIsPlaceholder: boolean;
  };
  rsvp: {
    deadlineLabel: string;
    deadlineIsPlaceholder: boolean;
    deadlineISO?: string;
  };
  site: {
    mode: SiteMode;
    canonicalUrl: string;
    title: string;
    description: string;
  };
  featureFlags: {
    cinematicEntry: boolean;
    countdown: boolean;
    threeMonogram: boolean;
    floatingGallery: boolean;
    perspectives: boolean;
  };
  colors: {
    ivory: string;
    parchment: string;
    sage: string;
    sageDeep: string;
    forest: string;
    charcoal: string;
    stone: string;
    gold: string;
    goldSoft: string;
    inkMuted: string;
  };
}
