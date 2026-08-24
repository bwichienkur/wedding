import { createUploadSchema, updateMediaSchema } from "@/lib/media/types";
import { muxPosterUrl } from "@/lib/media/mux-public";
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
});

describe("mux public helpers", () => {
  it("builds poster urls from playback ids", () => {
    expect(muxPosterUrl("abc123")).toContain("image.mux.com/abc123/thumbnail.jpg");
  });
});
