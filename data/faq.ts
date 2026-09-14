import type { FaqItem } from "./logistics-types";

/** FAQs mirrored from https://www.zola.com/wedding/brightandlexi/faq */
export const faqItems: FaqItem[] = [
  {
    id: "arrival-time",
    category: "Day of",
    question: "What time should I arrive?",
    answer:
      "We recommend arriving 20–30 minutes before the start of the ceremony. This will give you time to sign the guest book and chat with guests.",
  },
  {
    id: "dress-code",
    category: "Attire",
    question: "What should I wear?",
    answer:
      "Formal attire is appreciated, but not required. See this link if you're needing more ideas!\nhttps://www.pinterest.com/agragno/guest-attire/\n\nBridesmaids will be in a warm terracotta.\nPlease no white!",
  },
  {
    id: "parking",
    category: "Venue",
    question: "Is there parking at the venue?",
    answer: "Yes, there is free and ample parking available.",
  },
  {
    id: "indoor-outdoor",
    category: "Venue",
    question: "Is it indoors or outdoors?",
    answer:
      "The ceremony will be held outdoors on a paved patio with artificial turf. The reception will take place indoors. In the event of rain, the ceremony will also be moved indoors.",
  },
  {
    id: "plus-ones",
    category: "Guests",
    question: "Can I bring a plus one?",
    answer:
      "Invitiations will usually specify, but contact us directly if you're unsure!",
  },
  {
    id: "photography-policy",
    category: "Day of",
    question: "Can I take and post pictures?",
    answer:
      "Please refrain from taking any photos during the ceremony. As for cocktail hour and reception, snap and post away!",
  },
  {
    id: "open-bar",
    category: "Reception",
    question: "Will there be an open bar?",
    answer: "Is the Pope Catholic?",
  },
];

export const faqCategories = [
  ...new Set(faqItems.map((item) => item.category)),
];
