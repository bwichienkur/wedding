import type { StoryMilestone } from "./types";
import { wedding } from "./wedding";

/**
 * Relationship story milestones.
 * Only confirmed facts are filled; everything else is an editorial placeholder.
 */
export const storyMilestones: StoryMilestone[] = [
  {
    id: "how-we-met",
    dateLabel: wedding.anniversary.dating.dateDisplay,
    title: "How we met",
    featured: true,
    locationLabel: "Sweetwater, Boynton Beach, Florida",
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
        body: "Lexi and Bright met at Sweetwater in Boynton Beach, Florida on March 20, 2025.",
        isPlaceholder: false,
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
        body: "Bright proposed on December 13, 2025 at Lexi’s parents’ home — Joe & Jodi’s house in Longwood, Florida.",
        isPlaceholder: false,
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
