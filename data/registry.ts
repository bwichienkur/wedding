import type { RegistryInfo } from "./logistics-types";
import { wedding } from "./wedding";

export const registry: RegistryInfo = {
  note: `Add a short note from ${wedding.couple.partnerOne} and ${wedding.couple.partnerTwo} about gifts.`,
  noteIsPlaceholder: true,
  presenceMessage: "Your presence is the greatest gift — add or refine this line.",
  presenceIsPlaceholder: true,
  links: [
    {
      id: "registry-1",
      label: "Add a registry destination",
      url: "https://example.com",
      urlIsPlaceholder: true,
      description: "Add the retailer or registry name once confirmed.",
    },
  ],
  honeymoonFund: {
    label: "Optional honeymoon fund",
    url: "https://example.com",
    urlIsPlaceholder: true,
  },
};
