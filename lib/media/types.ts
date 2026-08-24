import { z } from "zod";

export const mediaCategorySchema = z.enum([
  "proposal_teaser",
  "proposal_highlight",
  "proposal_full",
  "relationship_memory",
  "background_atmosphere",
  "post_wedding_film",
]);

export const mediaStatusSchema = z.enum([
  "waiting",
  "uploading",
  "processing",
  "ready",
  "errored",
  "archived",
]);

export const mediaAssetSchema = z.object({
  id: z.string().uuid(),
  muxAssetId: z.string().nullable(),
  muxPlaybackId: z.string().nullable(),
  muxUploadId: z.string().nullable(),
  status: mediaStatusSchema,
  category: mediaCategorySchema,
  title: z.string().min(1).max(160),
  description: z.string().max(2000).default(""),
  mediaDate: z.string().nullable(),
  posterUrl: z.string().url().nullable(),
  customPosterPath: z.string().nullable(),
  durationSeconds: z.number().nonnegative().nullable(),
  aspectRatio: z.string().nullable(),
  captionsUrl: z.string().url().nullable(),
  transcript: z.string().max(50000).default(""),
  chaptersJson: z
    .array(
      z.object({
        startSeconds: z.number().nonnegative(),
        title: z.string().min(1).max(120),
      }),
    )
    .default([]),
  isPublished: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  storyMomentId: z.string().nullable(),
  placementKey: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().nullable(),
});

export const createUploadSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  category: mediaCategorySchema,
  isPrivate: z.boolean().optional().default(false),
  storyMomentId: z.string().optional(),
  placementKey: z.string().optional(),
  mediaDate: z.string().optional(),
});

export const updateMediaSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  category: mediaCategorySchema.optional(),
  mediaDate: z.string().nullable().optional(),
  posterUrl: z.string().url().nullable().optional(),
  captionsUrl: z.string().url().nullable().optional(),
  transcript: z.string().max(50000).optional(),
  isPublished: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  storyMomentId: z.string().nullable().optional(),
  placementKey: z.string().nullable().optional(),
  status: mediaStatusSchema.optional(),
});

export type MediaCategory = z.infer<typeof mediaCategorySchema>;
export type MediaStatus = z.infer<typeof mediaStatusSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type CreateUploadInput = z.infer<typeof createUploadSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  proposal_teaser: "Proposal teaser",
  proposal_highlight: "Proposal highlight",
  proposal_full: "Proposal full film",
  relationship_memory: "Relationship memory",
  background_atmosphere: "Background atmosphere",
  post_wedding_film: "Post-wedding film",
};
