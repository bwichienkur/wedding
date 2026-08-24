import type { FaqItem } from "./logistics-types";
import { wedding } from "./wedding";

export const faqItems: FaqItem[] = [
  {
    id: "dress-code",
    category: "Attire",
    question: "What is the dress code?",
    answer: "Add dress-code guidance.",
    answerIsPlaceholder: true,
  },
  {
    id: "plus-ones",
    category: "Guests",
    question: "May I bring a plus-one?",
    answer: "Add plus-one guidance. Invitations will show who is included.",
    answerIsPlaceholder: true,
  },
  {
    id: "children",
    category: "Guests",
    question: "Are children welcome?",
    answer: "Add children policy details.",
    answerIsPlaceholder: true,
  },
  {
    id: "arrival-time",
    category: "Day of",
    question: "When should I arrive?",
    answer: `Ceremony begins at ${wedding.wedding.ceremonyBegins}. Add guest arrival guidance.`,
    answerIsPlaceholder: true,
  },
  {
    id: "parking",
    category: "Venue",
    question: "Where do I park?",
    answer: "Add parking instructions.",
    answerIsPlaceholder: true,
  },
  {
    id: "accessibility",
    category: "Venue",
    question: "Is the venue accessible?",
    answer: "Add accessibility details.",
    answerIsPlaceholder: true,
  },
  {
    id: "weather",
    category: "Day of",
    question: "What if the weather changes?",
    answer: "Add weather and indoor/outdoor contingency details.",
    answerIsPlaceholder: true,
  },
  {
    id: "indoor-outdoor",
    category: "Venue",
    question: "Is the wedding indoors or outdoors?",
    answer: "Add indoor or outdoor details for ceremony and reception.",
    answerIsPlaceholder: true,
  },
  {
    id: "photography-policy",
    category: "Day of",
    question: "May guests take photos?",
    answer: "Add photography policy for guests.",
    answerIsPlaceholder: true,
  },
  {
    id: "rsvp-deadline",
    category: "RSVP",
    question: "When is the RSVP deadline?",
    answer: wedding.rsvp.deadlineLabel,
    answerIsPlaceholder: wedding.rsvp.deadlineIsPlaceholder,
  },
  {
    id: "dietary",
    category: "RSVP",
    question: "How do I share dietary needs?",
    answer: "Add guidance for dietary restrictions collected during RSVP.",
    answerIsPlaceholder: true,
  },
  {
    id: "transportation",
    category: "Travel",
    question: "Is transportation provided?",
    answer: "Add transportation details.",
    answerIsPlaceholder: true,
  },
  {
    id: "accommodations",
    category: "Travel",
    question: "Where should I stay?",
    answer: "Add hotel block and accommodation guidance.",
    answerIsPlaceholder: true,
  },
  {
    id: "registry",
    category: "Gifts",
    question: "Where are you registered?",
    answer: "Add registry guidance, or note that presence is the greatest gift.",
    answerIsPlaceholder: true,
  },
  {
    id: "contact",
    category: "Contact",
    question: "Who can I contact with questions?",
    answer: wedding.contact.emailIsPlaceholder
      ? "Add a contact email or phone for guest questions."
      : `Reach out at ${wedding.contact.email}.`,
    answerIsPlaceholder: wedding.contact.emailIsPlaceholder,
  },
];

export const faqCategories = [
  ...new Set(faqItems.map((item) => item.category)),
];
