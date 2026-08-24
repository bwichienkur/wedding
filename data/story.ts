import type { StoryMilestone } from "./types";
import { wedding } from "./wedding";

/**
 * Relationship story milestones.
 * Only confirmed facts are filled; everything else is an editorial placeholder.
 */
export const storyMilestones: StoryMilestone[] = [
  {
    id: "how-we-met",
    dateLabel: "Add the date you met.",
    title: "How we met",
    featured: true,
    image: {
      src: "/images/placeholders/story-met.svg",
      alt: "Placeholder for a photograph of Bright and Lexi when they met",
      width: 1600,
      height: 2000,
      focalPoint: { x: 50, y: 40 },
      placeholder: true,
      caption: "Add a photograph from early in your story.",
    },
    passages: [
      {
        perspective: "shared",
        body: "Add the story of how you met.",
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "dating-anniversary",
    dateLabel: wedding.anniversary.dating.dateDisplay,
    dateISO: wedding.anniversary.dating.dateISO,
    title: wedding.anniversary.dating.label,
    featured: true,
    image: {
      src: "/images/placeholders/story-anniversary.svg",
      alt: "Placeholder for a photograph marking Bright and Lexi’s dating anniversary",
      width: 1600,
      height: 1067,
      focalPoint: { x: 50, y: 45 },
      placeholder: true,
      caption: "Add a photograph from around March 20, 2025.",
    },
    passages: [
      {
        perspective: "shared",
        body: "Add a short reflection on beginning to date on March 20, 2025.",
        isPlaceholder: true,
      },
      {
        perspective: "bright",
        body: "Add Bright’s memory of this day.",
        isPlaceholder: true,
      },
      {
        perspective: "lexi",
        body: "Add Lexi’s memory of this day.",
        isPlaceholder: true,
      },
      {
        perspective: "actual",
        body: "Add what actually happened — the shared version you both agree on.",
        isPlaceholder: true,
      },
    ],
    perspectivesEnabled: true,
  },
  {
    id: "milestone-placeholder",
    dateLabel: "Add another milestone date.",
    title: "A chapter still being written",
    image: {
      src: "/images/placeholders/story-chapter.svg",
      alt: "Placeholder for a relationship milestone photograph",
      width: 1600,
      height: 1067,
      focalPoint: { x: 50, y: 50 },
      placeholder: true,
    },
    passages: [
      {
        perspective: "shared",
        body: "Add a memorable chapter from your relationship — a trip, a quiet evening, a turning point.",
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "proposal",
    dateLabel: wedding.proposal.dateLabel,
    title: "The proposal",
    featured: true,
    locationLabel: wedding.proposal.locationLabel,
    image: {
      src: "/images/placeholders/story-proposal.svg",
      alt: "Placeholder for a proposal photograph",
      width: 1600,
      height: 2000,
      focalPoint: { x: 50, y: 35 },
      placeholder: true,
      caption: "Add a photograph from the proposal.",
    },
    passages: [
      {
        perspective: "shared",
        title: wedding.proposal.transitionCopy,
        body: "Add a short introduction to the proposal chapter.",
        isPlaceholder: true,
      },
      {
        perspective: "bright",
        body: "Add Bright’s written version of the proposal.",
        isPlaceholder: true,
      },
      {
        perspective: "lexi",
        body: "Add the moment Lexi realized what was happening.",
        isPlaceholder: true,
      },
    ],
    perspectivesEnabled: true,
  },
];
