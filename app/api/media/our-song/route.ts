import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { resolveBlobAccess } from "@/lib/media/blob-access";
import {
  isBlobStorageEnabled,
  requireBlobToken,
} from "@/lib/media/blob-env";
import {
  defaultOurSongBlobPathCandidates,
  getOurSongBlobPath,
  getOurSongBlobUrl,
  resolvedOurSongBlobPath,
} from "@/lib/media/our-song";

export const runtime = "nodejs";

function contentTypeForPath(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase();
  if (ext === "m4a" || ext === "aac") return "audio/mp4";
  if (ext === "wav") return "audio/wav";
  if (ext === "ogg") return "audio/ogg";
  return "audio/mpeg";
}

async function streamFromBlobPath(pathname: string): Promise<NextResponse | null> {
  const result = await get(pathname, {
    access: resolveBlobAccess(),
    token: requireBlobToken(),
  });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": contentTypeForPath(pathname),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function GET() {
  const directUrl = getOurSongBlobUrl();
  if (directUrl && resolveBlobAccess() === "public") {
    return NextResponse.redirect(directUrl, 302);
  }

  if (!isBlobStorageEnabled()) {
    return NextResponse.json({ error: "Blob storage not configured." }, { status: 503 });
  }

  const pathsToTry = [
    getOurSongBlobPath(),
    resolvedOurSongBlobPath(),
    ...defaultOurSongBlobPathCandidates(),
  ].filter((value, index, list): value is string => {
    return Boolean(value) && list.indexOf(value) === index;
  });

  for (const pathname of pathsToTry) {
    const response = await streamFromBlobPath(pathname);
    if (response) return response;
  }

  if (directUrl) {
    try {
      const upstream = await fetch(directUrl);
      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ error: "Song not found." }, { status: 404 });
      }
      return new NextResponse(upstream.body, {
        headers: {
          "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      return NextResponse.json({ error: "Song unavailable." }, { status: 503 });
    }
  }

  return NextResponse.json(
    {
      error:
        "Song not found in Blob. Set OUR_SONG_BLOB_PATH (e.g. music/ordinary.mp3) or OUR_SONG_BLOB_URL in Vercel env.",
    },
    { status: 404 },
  );
}
