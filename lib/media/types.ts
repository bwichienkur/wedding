import { z } from "zod";

export const mediaKindSchema = z.enum(["video", "image"]);

export const mediaCategorySchema = z.enum([
  "proposal_teaser",
  "proposal_highlight",
  "proposal_full",
  "relationship_memory",
  "background_atmosphere",
  "post_wedding_film",
  "section_photo",
  "section_video",
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
  kind: mediaKindSchema.default("video"),
  muxAssetId: z.string().nullable(),
  muxPlaybackId: z.string().nullable(),
  muxUploadId: z.string().nullable(),
  /** Relative path under .data/uploads for local image files */
  storagePath: z.string().nullable().default(null),
  /** Public URL path for images, e.g. /api/media/file/<id> */
  publicUrl: z.string().nullable().default(null),
  alt: z.string().max(300).default(""),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
  focalX: z.number().min(0).max(100).nullable().default(null),
  focalY: z.number().min(0).max(100).nullable().default(null),
  mimeType: z.string().nullable().default(null),
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
  kind: mediaKindSchema.optional().default("video"),
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
  alt: z.string().max(300).optional(),
  focalX: z.number().min(0).max(100).nullable().optional(),
  focalY: z.number().min(0).max(100).nullable().optional(),
  kind: mediaKindSchema.optional(),
});

export type MediaKind = z.infer<typeof mediaKindSchema>;
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
  section_photo: "Section photo",
  section_video: "Section video",
};

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Max photo upload size (client Blob upload bypasses the ~4.5 MB API body cap). */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_MB = 15;
