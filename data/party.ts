import type { WeddingPartyMember } from "./logistics-types";
import { wedding } from "./wedding";

/**
 * Editorial wedding-party entries.
 * Names and roles remain placeholders until Bright and Lexi supply them.
 */
export const weddingParty: WeddingPartyMember[] = [
  {
    id: "placeholder-bright-1",
    name: "Add a member of Bright’s party",
    role: "Add role",
    side: "bright",
    relationship: `Add relationship to ${wedding.couple.partnerOne}.`,
    relationshipIsPlaceholder: true,
    description: "Add a short personal description.",
    descriptionIsPlaceholder: true,
    funFact: "Add an optional fun fact.",
    funFactIsPlaceholder: true,
    photoAlt: "Photograph placeholder for a wedding-party member",
  },
  {
    id: "placeholder-lexi-1",
    name: "Add a member of Lexi’s party",
    role: "Add role",
    side: "lexi",
    relationship: `Add relationship to ${wedding.couple.partnerTwo}.`,
    relationshipIsPlaceholder: true,
    description: "Add a short personal description.",
    descriptionIsPlaceholder: true,
    sharedMemory: "Add an optional shared memory with the couple.",
    photoAlt: "Photograph placeholder for a wedding-party member",
  },
  {
    id: "placeholder-shared-1",
    name: "Add an honor attendant or reader",
    role: "Add role",
    side: "shared",
    relationship: "Add how this person is connected to Bright and Lexi.",
    relationshipIsPlaceholder: true,
    description: "Add a short personal description.",
    descriptionIsPlaceholder: true,
    photoAlt: "Photograph placeholder for a wedding-party member",
  },
];
