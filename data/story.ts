import type { StoryMilestone } from "./types";
import { wedding } from "./wedding";

/**
 * Condensed relationship story — three milestones for the public site.
 */
export const storyMilestones: StoryMilestone[] = [
  {
    id: "how-we-met",
    dateLabel: wedding.anniversary.dating.dateDisplay,
    title: "How We Met",
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
    title: "The Proposal",
    featured: true,
    locationLabel: wedding.proposal.locationLabel,
    image: {
      src: "/images/placeholders/story-proposal.svg",
      alt: "Bright proposing to Lexi under a lit arch with a drone message in the night sky",
      width: 2400,
      height: 1600,
      focalPoint: { x: 50, y: 42 },
      placeholder: true,
      caption: "Proposal at Joe & Jodi’s home in Longwood, Florida.",
    },
    passages: [
      {
        perspective: "shared",
        body: "Bright proposed on December 13, 2025 at Joe & Jodi’s home in Longwood, Florida.",
        isPlaceholder: false,
      },
    ],
  },
  {
    id: "wedding",
    dateLabel: wedding.wedding.dateDisplay,
    title: "Wedding",
    featured: true,
    locationLabel: `${wedding.wedding.venueName} · ${wedding.wedding.city}, ${wedding.wedding.region}`,
    image: {
      src: "/images/venue/bella-cosa-watercolor.png",
      alt: "Watercolor illustration of Bella Cosa in Lake Wales, Florida",
      width: 1600,
      height: 1200,
      focalPoint: { x: 50, y: 45 },
      placeholder: false,
    },
    passages: [
      {
        perspective: "shared",
        body: `We invite you to celebrate with us on ${wedding.wedding.dateDisplay} at ${wedding.wedding.venueName} in ${wedding.wedding.city}, ${wedding.wedding.region}. Ceremony begins at ${wedding.wedding.ceremonyBegins}.`,
        isPlaceholder: false,
      },
    ],
  },
];
