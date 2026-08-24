import type { StoryImage } from "./types";
import { storyMilestones } from "./story";

export interface MemoryCard {
  id: string;
  title: string;
  dateLabel: string;
  annotation?: string;
  image: StoryImage;
  depth: number;
  offsetX: number;
  offsetY: number;
  storyHref: string;
}

/** Curated spatial gallery selection derived from story milestones. */
export const memoryGallery: MemoryCard[] = storyMilestones
  .filter((milestone) => milestone.image)
  .slice(0, 6)
  .map((milestone, index) => {
    const lane = index % 3;
    return {
      id: milestone.id,
      title: milestone.title,
      dateLabel: milestone.dateLabel,
      annotation:
        milestone.id === "dating-anniversary"
          ? "Where the thread began to braid"
          : undefined,
      image: milestone.image!,
      depth: -2 - index * 1.35,
      offsetX: lane === 0 ? -1.15 : lane === 1 ? 0.95 : -0.25,
      offsetY: lane === 2 ? 0.55 : lane === 1 ? -0.35 : 0.15,
      storyHref: `#story-${milestone.id}`,
    };
  });
