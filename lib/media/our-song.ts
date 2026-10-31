import "server-only";

import { resolveBlobAccess } from "@/lib/media/blob-access";
import { isBlobStorageEnabled } from "@/lib/media/blob-env";

export const ourSongMeta = {
  enabled: true,
  title: "Ordinary",
  artistLabel: "Our song",
} as const;

const LOCAL_FALLBACK_SRC = "/music/ordinary.mp3";

function trimEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}

/** Full blob URL from the Vercel Blob dashboard (optional). */
export function getOurSongBlobUrl(): string | null {
  return trimEnv("OUR_SONG_BLOB_URL") ?? trimEnv("NEXT_PUBLIC_OUR_SONG_URL");
}

/** Pathname in the blob store, e.g. `music/ordinary.mp3`. */
export function getOurSongBlobPath(): string | null {
  return trimEnv("OUR_SONG_BLOB_PATH");
}

/** Default pathname when the file lives in a `music/` folder on Blob. */
export function defaultOurSongBlobPathCandidates(): string[] {
  return [
    "music/ordinary.mp3",
    "music/ordinary.mo3",
    "wedding/music/ordinary.mp3",
  ];
}

export function resolvedOurSongBlobPath(): string | null {
  const explicit = getOurSongBlobPath();
  if (explicit) return explicit;
  if (isBlobStorageEnabled()) {
    return defaultOurSongBlobPathCandidates()[0] ?? null;
  }
  return null;
}

/** URL passed to `<audio src>` — may be a blob URL or same-origin API route. */
export function resolveOurSongPlaybackSrc(): string {
  const blobUrl = getOurSongBlobUrl();
  if (blobUrl && resolveBlobAccess() === "public") {
    return blobUrl;
  }
  if (blobUrl || resolvedOurSongBlobPath()) {
    return "/api/media/our-song";
  }
  return LOCAL_FALLBACK_SRC;
}

export function ourSongIsBlobBacked(): boolean {
  return resolveOurSongPlaybackSrc() === "/api/media/our-song";
}
