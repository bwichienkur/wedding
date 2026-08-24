import {
  createUploadSchema,
  mediaAssetSchema,
  updateMediaSchema,
} from "@/lib/media/types";
import { muxPosterUrl } from "@/lib/media/mux-public";
import { resolveImageMime, isHeicFile } from "@/lib/media/image-upload";
import { sectionMediaPlacements } from "@/data/section-media";
import { describe, expect, it } from "vitest";

describe("media validation", () => {
  it("accepts a valid direct-upload request", () => {
    const parsed = createUploadSchema.safeParse({
      title: "Proposal highlight",
      category: "proposal_highlight",
      isPrivate: true,
      placementKey: "proposal.highlight",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts section photo categories", () => {
    const parsed = createUploadSchema.safeParse({
      title: "Hero 1",
      category: "section_photo",
      kind: "image",
      placementKey: "home.hero",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unknown categories", () => {
    const parsed = createUploadSchema.safeParse({
      title: "x",
      category: "not-real",
    });
    expect(parsed.success).toBe(false);
  });

  it("requires ready assets to opt into publish fields carefully", () => {
    const parsed = updateMediaSchema.safeParse({
      isPublished: true,
      title: "Proposal highlight",
    });
    expect(parsed.success).toBe(true);
  });

  it("normalizes image asset fields", () => {
    const parsed = mediaAssetSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      kind: "image",
      muxAssetId: null,
      muxPlaybackId: null,
      muxUploadId: null,
      storagePath: "abc.jpg",
      publicUrl: "/api/media/file/abc",
      alt: "Bright and Lexi",
      width: 1600,
      height: 2000,
      focalX: 50,
      focalY: 40,
      mimeType: "image/jpeg",
      status: "ready",
      category: "section_photo",
      title: "Hero",
      description: "",
      mediaDate: null,
      posterUrl: null,
      customPosterPath: null,
      durationSeconds: null,
      aspectRatio: null,
      captionsUrl: null,
      transcript: "",
      chaptersJson: [],
      isPublished: true,
      isPrivate: false,
      sortOrder: 0,
      storyMomentId: null,
      placementKey: "home.hero",
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("image upload helpers", () => {
  it("resolves jpeg from extension when mime is empty", () => {
    const file = { type: "", name: "photo.jpg" } as File;
    expect(resolveImageMime(file)).toBe("image/jpeg");
  });

  it("rejects heic with helper", () => {
    const file = { type: "image/heic", name: "IMG_1234.HEIC" } as File;
    expect(resolveImageMime(file)).toBeNull();
    expect(isHeicFile(file)).toBe(true);
  });
});

describe("section media placements", () => {
  it("covers hero, story, gallery, proposal, venue, party, closing", () => {
    const keys = sectionMediaPlacements.map((item) => item.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "home.hero",
        "story.how-we-met",
        "gallery",
        "proposal.highlight",
        "proposal.still",
        "venue.architecture",
        "party",
        "closing",
      ]),
    );
  });

  it("marks hero and gallery as multi-image", () => {
    const hero = sectionMediaPlacements.find((item) => item.key === "home.hero");
    const gallery = sectionMediaPlacements.find((item) => item.key === "gallery");
    expect(hero?.allowMultiple).toBe(true);
    expect(hero?.accepts).toContain("image");
    expect(gallery?.allowMultiple).toBe(true);
  });
});

describe("mux public helpers", () => {
  it("builds poster urls from playback ids", () => {
    expect(muxPosterUrl("abc123")).toContain(
      "image.mux.com/abc123/thumbnail.jpg",
    );
  });
});
