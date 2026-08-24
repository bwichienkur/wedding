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
