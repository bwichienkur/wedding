import { afterEach, describe, expect, it, vi } from "vitest";

describe("our song playback src", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.resetModules();
  });

  it("uses the API route when a blob path is configured", async () => {
    process.env.OUR_SONG_BLOB_PATH = "wedding/music/ordinary.mp3";
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    const { resolveOurSongPlaybackSrc } = await import("@/lib/media/our-song");
    expect(resolveOurSongPlaybackSrc()).toBe("/api/media/our-song?v=2");
  });

  it("uses the API route for public blob URLs instead of a cross-origin src", async () => {
    process.env.OUR_SONG_BLOB_URL =
      "https://example.public.blob.vercel-storage.com/ordinary.mp3";
    process.env.BLOB_ACCESS = "public";
    const { resolveOurSongPlaybackSrc } = await import("@/lib/media/our-song");
    expect(resolveOurSongPlaybackSrc()).toBe("/api/media/our-song?v=2");
  });

  it("falls back to local public file when blob is not configured", async () => {
    delete process.env.OUR_SONG_BLOB_PATH;
    delete process.env.OUR_SONG_BLOB_URL;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const { resolveOurSongPlaybackSrc } = await import("@/lib/media/our-song");
    expect(resolveOurSongPlaybackSrc()).toBe("/music/ordinary.mp3");
  });
});
