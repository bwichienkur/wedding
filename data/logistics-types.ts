export type GuestGroup = "all" | "wedding-party" | "family" | "adults";

export interface ScheduleItem {
  id: string;
  timeLabel: string;
  /** Local wall time HH:mm for calendar generation when known */
  timeLocal?: string;
  endTimeLocal?: string;
  title: string;
  description: string;
  descriptionIsPlaceholder?: boolean;
  locationLabel?: string;
  guestGroup?: GuestGroup;
  attireNote?: string;
  accessibilityNote?: string;
  arrivalGuidance?: string;
  setting?: "indoor" | "outdoor" | "both" | "tbd";
  includeInCalendar?: boolean;
}

export interface VenueInfo {
  name: string;
  city: string;
  region: string;
  addressLine1: string;
  addressIsPlaceholder: boolean;
  mapQuery: string;
  mapUrl: string;
  directions: string;
  directionsIsPlaceholder: boolean;
  weather: string;
  weatherIsPlaceholder: boolean;
  layers: Array<{
    id: string;
    label: string;
    src: string;
    alt: string;
  }>;
}

export interface TravelAirport {
  id: string;
  name: string;
  code: string;
  driveTimeLabel: string;
  driveTimeIsPlaceholder: boolean;
  notes: string;
  notesIsPlaceholder?: boolean;
}

export interface HotelBlock {
  id: string;
  name: string;
  status: "confirmed" | "placeholder";
  address: string;
  phone?: string;
  bookingUrl?: string;
  bookingCode?: string;
  bookingDeadline?: string;
  notes: string;
}

export interface LocalRecommendation {
  id: string;
  category: "restaurant" | "activity" | "other";
  name: string;
  description: string;
  isPlaceholder?: boolean;
  url?: string;
}

export interface TravelInfo {
  intro: string;
  airports: TravelAirport[];
  hotels: HotelBlock[];
  transportation: string;
  transportationIsPlaceholder: boolean;
  recommendations: LocalRecommendation[];
  emergencyContact: string;
  emergencyIsPlaceholder: boolean;
}

export interface WeddingPartyMember {
  id: string;
  name: string;
  role: string;
  side: "bright" | "lexi" | "shared";
  relationship: string;
  relationshipIsPlaceholder?: boolean;
  description: string;
  descriptionIsPlaceholder?: boolean;
  funFact?: string;
  funFactIsPlaceholder?: boolean;
  sharedMemory?: string;
  photoSrc?: string;
  photoAlt?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  answerIsPlaceholder?: boolean;
}

export interface RegistryLink {
  id: string;
  label: string;
  url: string;
  urlIsPlaceholder?: boolean;
  description?: string;
}

export interface RegistryInfo {
  note: string;
  noteIsPlaceholder: boolean;
  presenceMessage: string;
  presenceIsPlaceholder: boolean;
  links: RegistryLink[];
  honeymoonFund?: {
    label: string;
    url: string;
    urlIsPlaceholder?: boolean;
  };
}
