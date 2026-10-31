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

function responseHeadersFromBlob(
  pathname: string,
  result: NonNullable<Awaited<ReturnType<typeof get>>> & {
    stream: ReadableStream<Uint8Array>;
  },
): Headers {
  const headers = new Headers();
  headers.set("Content-Type", contentTypeForPath(pathname));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600");

  for (const [key, value] of result.headers.entries()) {
    const lower = key.toLowerCase();
    if (
      lower === "content-length" ||
      lower === "content-range" ||
      lower === "etag" ||
      lower === "last-modified"
    ) {
      headers.set(key, value);
    }
  }

  if (
    !headers.has("Content-Length") &&
    result.blob.size != null
  ) {
    headers.set("Content-Length", String(result.blob.size));
  }

  return headers;
}

async function streamFromBlobPath(
  pathname: string,
  range: string | null,
): Promise<NextResponse | null> {
  const result = await get(pathname, {
    access: resolveBlobAccess(),
    token: requireBlobToken(),
    ...(range ? { headers: { Range: range } } : {}),
  });
  if (!result?.stream) {
    return null;
  }

  return new NextResponse(result.stream, {
    status: result.statusCode,
    headers: responseHeadersFromBlob(pathname, result),
  });
}

export async function GET(request: Request) {
  const directUrl = getOurSongBlobUrl();
  if (directUrl && resolveBlobAccess() === "public") {
    return NextResponse.redirect(directUrl, 302);
  }

  if (!isBlobStorageEnabled()) {
    return NextResponse.json({ error: "Blob storage not configured." }, { status: 503 });
  }

  const range = request.headers.get("range");

  const pathsToTry = [
    getOurSongBlobPath(),
    resolvedOurSongBlobPath(),
    ...defaultOurSongBlobPathCandidates(),
  ].filter((value, index, list): value is string => {
    return Boolean(value) && list.indexOf(value) === index;
  });

  for (const pathname of pathsToTry) {
    const response = await streamFromBlobPath(pathname, range);
    if (response) return response;
  }

  if (directUrl) {
    try {
      const upstream = await fetch(directUrl, {
        headers: range ? { Range: range } : undefined,
      });
      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ error: "Song not found." }, { status: 404 });
      }
      const headers = new Headers();
      headers.set(
        "Content-Type",
        upstream.headers.get("Content-Type") ?? "audio/mpeg",
      );
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=3600");
      const contentLength = upstream.headers.get("Content-Length");
      const contentRange = upstream.headers.get("Content-Range");
      if (contentLength) headers.set("Content-Length", contentLength);
      if (contentRange) headers.set("Content-Range", contentRange);

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers,
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
