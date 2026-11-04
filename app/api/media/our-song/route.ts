import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { resolveBlobAccess } from "@/lib/media/blob-access";
import {
  isBlobStorageEnabled,
  requireBlobToken,
} from "@/lib/media/blob-env";
import {
  getOurSongBlobUrl,
  ourSongBlobPathsToTry,
} from "@/lib/media/our-song";
import { ourSongMissingHtml } from "@/lib/media/our-song-error-page";
import { probeOurSongBlob } from "@/lib/media/our-song-probe";

/** Origin must not cache ranged vs full responses interchangeably on the edge. */
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

function contentTypeForPath(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase();
  if (ext === "m4a" || ext === "aac") return "audio/mp4";
  if (ext === "wav") return "audio/wav";
  if (ext === "ogg") return "audio/ogg";
  return "audio/mpeg";
}

function applyStreamCacheHeaders(headers: Headers, partial: boolean): void {
  headers.set("Accept-Ranges", "bytes");
  headers.set("Vary", "Range");
  headers.set(
    "Cache-Control",
    partial
      ? "public, max-age=3600, must-revalidate"
      : "public, max-age=604800, stale-while-revalidate=86400",
  );
  headers.set("CDN-Cache-Control", "no-store");
}

function responseHeadersFromBlob(
  pathname: string,
  result: NonNullable<Awaited<ReturnType<typeof get>>> & {
    stream: ReadableStream<Uint8Array>;
  },
  hasRangeRequest: boolean,
): Headers {
  const headers = new Headers();
  headers.set("Content-Type", contentTypeForPath(pathname));

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

  const partial = hasRangeRequest && headers.has("content-range");
  applyStreamCacheHeaders(headers, partial);

  if (
    !headers.has("Content-Length") &&
    result.blob.size != null &&
    !partial
  ) {
    headers.set("Content-Length", String(result.blob.size));
  }

  if (!partial) {
    headers.delete("Content-Range");
  }

  return headers;
}

function responseStatus(
  result: NonNullable<Awaited<ReturnType<typeof get>>>,
  hasRangeRequest: boolean,
  headers: Headers,
): number {
  if (hasRangeRequest && headers.has("content-range")) {
    return 206;
  }
  return result.statusCode;
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

  const headers = responseHeadersFromBlob(pathname, result, Boolean(range));
  const status = responseStatus(result, Boolean(range), headers);

  return new NextResponse(result.stream, {
    status,
    headers,
  });
}

function wantsHtmlResponse(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) return true;
  const dest = request.headers.get("sec-fetch-dest");
  return dest === "document";
}

function songErrorResponse(
  request: Request,
  status: number,
  detail: string,
): NextResponse {
  if (wantsHtmlResponse(request)) {
    return new NextResponse(ourSongMissingHtml(status, detail), {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return NextResponse.json({ error: detail }, { status });
}

export async function GET(request: Request) {
  const directUrl = getOurSongBlobUrl();
  if (directUrl && resolveBlobAccess() === "public") {
    return NextResponse.redirect(directUrl, 302);
  }

  if (!isBlobStorageEnabled()) {
    const probe = await probeOurSongBlob();
    return songErrorResponse(request, 503, probe.detail);
  }

  const range = request.headers.get("range");
  const pathsToTry = ourSongBlobPathsToTry();

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
        const probe = await probeOurSongBlob();
        return songErrorResponse(request, 404, probe.detail);
      }
      const headers = new Headers();
      headers.set(
        "Content-Type",
        upstream.headers.get("Content-Type") ?? "audio/mpeg",
      );
      const partial = Boolean(range && upstream.headers.get("Content-Range"));
      applyStreamCacheHeaders(headers, partial);
      const contentLength = upstream.headers.get("Content-Length");
      const contentRange = upstream.headers.get("Content-Range");
      if (contentLength) headers.set("Content-Length", contentLength);
      if (contentRange) headers.set("Content-Range", contentRange);

      return new NextResponse(upstream.body, {
        status: partial ? 206 : upstream.status,
        headers,
      });
    } catch {
      return songErrorResponse(
        request,
        503,
        "Song upstream URL failed. Check OUR_SONG_BLOB_URL or upload to Blob.",
      );
    }
  }

  const probe = await probeOurSongBlob();
  return songErrorResponse(request, 404, probe.detail);
}
