import "server-only";

import { get } from "@vercel/blob";
import { resolveBlobAccess } from "@/lib/media/blob-access";
import { isBlobStorageEnabled, requireBlobToken } from "@/lib/media/blob-env";
import {
  getOurSongBlobUrl,
  ourSongBlobPathsToTry,
  resolveOurSongPlaybackSrc,
} from "@/lib/media/our-song";

export type OurSongProbeStatus =
  | "ready"
  | "no_blob_token"
  | "not_in_blob"
  | "upstream_error";

export type OurSongProbeResult = {
  playbackSrc: string;
  blobConfigured: boolean;
  ready: boolean;
  status: OurSongProbeStatus;
  foundPath: string | null;
  attemptedPaths: string[];
  detail: string;
};

export async function probeOurSongBlob(): Promise<OurSongProbeResult> {
  const playbackSrc = resolveOurSongPlaybackSrc();
  const attemptedPaths = ourSongBlobPathsToTry();
  const directUrl = getOurSongBlobUrl();

  if (!isBlobStorageEnabled()) {
    return {
      playbackSrc,
      blobConfigured: false,
      ready: false,
      status: "no_blob_token",
      foundPath: null,
      attemptedPaths,
      detail:
        "BLOB_READ_WRITE_TOKEN is missing. In Vercel: Storage → Blob → Connect to this project, add OUR_SONG_BLOB_PATH, then redeploy.",
    };
  }

  const token = requireBlobToken();
  const access = resolveBlobAccess();

  for (const pathname of attemptedPaths) {
    try {
      const result = await get(pathname, { access, token });
      if (result?.blob) {
        return {
          playbackSrc,
          blobConfigured: true,
          ready: true,
          status: "ready",
          foundPath: pathname,
          attemptedPaths,
          detail: `Blob file found at “${pathname}”.`,
        };
      }
    } catch {
      // try next candidate
    }
  }

  if (directUrl) {
    try {
      const upstream = await fetch(directUrl, { method: "HEAD" });
      if (upstream.ok) {
        return {
          playbackSrc,
          blobConfigured: true,
          ready: true,
          status: "ready",
          foundPath: null,
          attemptedPaths,
          detail: "OUR_SONG_BLOB_URL responds OK (fallback upstream).",
        };
      }
    } catch {
      return {
        playbackSrc,
        blobConfigured: true,
        ready: false,
        status: "upstream_error",
        foundPath: null,
        attemptedPaths,
        detail:
          "OUR_SONG_BLOB_URL is set but unreachable. Use OUR_SONG_BLOB_PATH with a file in your Blob store instead.",
      };
    }
  }

  const pathHint = attemptedPaths[0] ?? "wedding/music/ordinary.mp3";
  return {
    playbackSrc,
    blobConfigured: true,
    ready: false,
    status: "not_in_blob",
    foundPath: null,
    attemptedPaths,
    detail: `No MP3 found in Blob at the configured paths. Upload the track to “${pathHint}” (Vercel → Storage → Blob) or set OUR_SONG_BLOB_PATH to the exact pathname.`,
  };
}
