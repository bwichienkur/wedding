import type {
  FaqItem,
  TravelInfo,
  VenueInfo,
  WeddingPartyMember,
} from "@/data/logistics-types";

export interface LogisticsDocument {
  version: 1;
  venue?: VenueInfo;
  travel?: TravelInfo;
  faq?: FaqItem[];
  party?: WeddingPartyMember[];
  updatedAt: string;
}

export interface ResolvedLogistics {
  venue: VenueInfo;
  travel: TravelInfo;
  faq: FaqItem[];
  party: WeddingPartyMember[];
}
