import "server-only";

import { listPublishedByPlacement } from "@/lib/media/store";
import type { MediaAsset } from "@/lib/media/types";
import type { StoryImage } from "@/data/types";
import { heroSlides, type HeroSlide } from "@/data/hero-slides";
import { storyMilestones } from "@/data/story";
import type { StoryMilestone } from "@/data/types";
import { memoryGallery, type MemoryCard } from "@/data/memories";
import { venue } from "@/data/venue";
import { weddingParty } from "@/data/party";

export function mediaAssetToStoryImage(asset: MediaAsset): StoryImage | null {
  if (asset.kind !== "image" || !asset.publicUrl) return null;
  return {
    src: asset.publicUrl,
    alt: asset.alt || asset.title,
    width: asset.width ?? 1600,
    height: asset.height ?? 2000,
    focalPoint:
      asset.focalX != null && asset.focalY != null
        ? { x: asset.focalX, y: asset.focalY }
        : { x: 50, y: 40 },
    placeholder: false,
    caption: asset.description || undefined,
  };
}

export async function resolveHeroSlides(): Promise<HeroSlide[]> {
  const assets = await listPublishedByPlacement("home.hero");
  const slides = assets
    .map((asset, index) => {
      const image = mediaAssetToStoryImage(asset);
      if (!image) return null;
      return {
        id: asset.id,
        label: asset.title,
        image,
        sortOrder: asset.sortOrder ?? index,
      } satisfies HeroSlide & { sortOrder: number };
    })
    .filter(Boolean) as Array<HeroSlide & { sortOrder: number }>;

  if (slides.length === 0) return heroSlides;
  return slides.map(({ sortOrder: _sort, ...slide }) => slide);
}

export async function resolveStoryMilestones(): Promise<StoryMilestone[]> {
  return Promise.all(
    storyMilestones.map(async (milestone) => {
      const assets = await listPublishedByPlacement(`story.${milestone.id}`);
      const image = assets[0] ? mediaAssetToStoryImage(assets[0]) : null;
      if (!image) return milestone;
      return { ...milestone, image };
    }),
  );
}

export async function resolveMemoryCards(): Promise<MemoryCard[]> {
  const galleryAssets = await listPublishedByPlacement("gallery");
  if (galleryAssets.length > 0) {
    return galleryAssets
      .map((asset, index) => {
        const image = mediaAssetToStoryImage(asset);
        if (!image) return null;
        return {
          id: asset.id,
          title: asset.title,
          dateLabel: asset.mediaDate ?? "Memory",
          annotation: asset.description || undefined,
          image,
          depth: 0.4 + (index % 3) * 0.15,
          offsetX: ((index % 4) - 1.5) * 0.35,
          offsetY: ((index % 3) - 1) * 0.2,
          storyHref: asset.storyMomentId
            ? `#story-${asset.storyMomentId}`
            : "#story",
        } satisfies MemoryCard;
      })
      .filter(Boolean) as MemoryCard[];
  }

  // Fall back to story-derived memories, preferring uploaded story photos.
  const milestones = await resolveStoryMilestones();
  return milestones
    .filter((m) => m.image)
    .slice(0, 6)
    .map((milestone, index) => ({
      id: milestone.id,
      title: milestone.title,
      dateLabel: milestone.dateLabel,
      annotation: undefined,
      image: milestone.image!,
      depth: memoryGallery[index]?.depth ?? 0.5,
      offsetX: memoryGallery[index]?.offsetX ?? 0,
      offsetY: memoryGallery[index]?.offsetY ?? 0,
      storyHref: `#story-${milestone.id}`,
    }));
}

export async function resolveVenueLayers() {
  const layers = await Promise.all(
    venue.layers.map(async (layer) => {
      const assets = await listPublishedByPlacement(`venue.${layer.id}`);
      const image = assets[0] ? mediaAssetToStoryImage(assets[0]) : null;
      if (!image) return layer;
      return { ...layer, src: image.src, alt: image.alt };
    }),
  );
  return { ...venue, layers };
}

export async function resolvePartyMembers() {
  const portraits = await listPublishedByPlacement("party");
  if (portraits.length === 0) return weddingParty;

  return weddingParty.map((member, index) => {
    const asset = portraits[index];
    if (!asset?.publicUrl) return member;
    return {
      ...member,
      photoSrc: asset.publicUrl,
      photoAlt: asset.alt || asset.title || member.photoAlt,
    };
  });
}

export async function resolveClosingImage(): Promise<StoryImage | null> {
  const assets = await listPublishedByPlacement("closing");
  return assets[0] ? mediaAssetToStoryImage(assets[0]) : null;
}

export async function resolveProposalStill(): Promise<StoryImage | null> {
  const assets = await listPublishedByPlacement("proposal.still");
  return assets[0] ? mediaAssetToStoryImage(assets[0]) : null;
}
