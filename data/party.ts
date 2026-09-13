import type { WeddingPartyMember } from "./logistics-types";
import { wedding } from "./wedding";

function groomsman(index: number): WeddingPartyMember {
  return {
    id: `bright-groomsman-${index}`,
    name: `Add groomsman ${index}`,
    role: "Groomsman",
    side: "bright",
    relationship: `Add relationship to ${wedding.couple.partnerOne}.`,
    relationshipIsPlaceholder: true,
    description: "Add a short personal description.",
    descriptionIsPlaceholder: true,
    photoAlt: `Photograph placeholder for Bright’s groomsman ${index}`,
  };
}

function bridesmaid(index: number): WeddingPartyMember {
  return {
    id: `lexi-bridesmaid-${index}`,
    name: `Add bridesmaid ${index}`,
    role: "Bridesmaid",
    side: "lexi",
    relationship: `Add relationship to ${wedding.couple.partnerTwo}.`,
    relationshipIsPlaceholder: true,
    description: "Add a short personal description.",
    descriptionIsPlaceholder: true,
    photoAlt: `Photograph placeholder for Lexi’s bridesmaid ${index}`,
  };
}

/** Eleven people: five groomsmen, five bridesmaids, ceremony pianist. */
export const weddingParty: WeddingPartyMember[] = [
  ...[1, 2, 3, 4, 5].map(groomsman),
  ...[1, 2, 3, 4, 5].map(bridesmaid),
  {
    id: "ceremony-pianist",
    name: "Add ceremony pianist",
    role: "Ceremony pianist",
    side: "shared",
    relationship: "Add how this musician is connected to Bright and Lexi.",
    relationshipIsPlaceholder: true,
    description: "Add a short note about the ceremony pianist.",
    descriptionIsPlaceholder: true,
    photoAlt: "Photograph placeholder for the ceremony pianist",
  },
];
