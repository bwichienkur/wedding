import type { StoryImage } from "./types";

export interface HeroSlide {
  id: string;
  image: StoryImage;
  /** Optional short label for screen readers / captions */
  label?: string;
}

/**
 * Homepage photo slideshow (Zola-style multi-photo header).
 * Replace placeholder paths with real engagement/couple photos —
 * keep 3–6 landscape or portrait images with clear focal points.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "hero-1",
    label: "Bright and Lexi — photograph coming soon",
    image: {
      src: "/images/placeholders/story-met.svg",
      alt: "Placeholder for a photograph of Bright and Lexi together",
      width: 1600,
      height: 2000,
      focalPoint: { x: 50, y: 40 },
      placeholder: true,
    },
  },
  {
    id: "hero-2",
    label: "A moment from the relationship — photograph coming soon",
    image: {
      src: "/images/placeholders/story-anniversary.svg",
      alt: "Placeholder for a photograph around Bright and Lexi’s dating anniversary",
      width: 1600,
      height: 1067,
      focalPoint: { x: 50, y: 45 },
      placeholder: true,
    },
  },
  {
    id: "hero-3",
    label: "Another favorite — photograph coming soon",
    image: {
      src: "/images/placeholders/story-chapter.svg",
      alt: "Placeholder for a favorite photograph of Bright and Lexi",
      width: 1600,
      height: 1067,
      focalPoint: { x: 50, y: 50 },
      placeholder: true,
    },
  },
  {
    id: "hero-4",
    label: "Proposal chapter — photograph coming soon",
    image: {
      src: "/images/placeholders/story-proposal.svg",
      alt: "Placeholder for a proposal photograph",
      width: 1600,
      height: 2000,
      focalPoint: { x: 50, y: 35 },
      placeholder: true,
    },
  },
];
