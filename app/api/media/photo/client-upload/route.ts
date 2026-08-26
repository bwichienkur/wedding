import "server-only";

import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { isBlobStorageEnabled, requireBlobToken } from "@/lib/media/blob-env";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/media/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Issues a short-lived client token for direct browser → Vercel Blob uploads.
 * Prefer this over `handleUpload` so auth cookies and error messages stay explicit.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobStorageEnabled()) {
    return NextResponse.json(
      {
        error:
          "Photo storage is not configured. In Vercel: Storage → Blob → Connect to this project, then redeploy.",
      },
      { status: 503 },
    );
  }

  let pathname = "";
  try {
    const body = (await request.json()) as { pathname?: string };
    pathname = String(body.pathname || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  if (!pathname.startsWith("wedding/images/")) {
    return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
  }

  try {
    // SDK default is only ~30s — too short for large mobile uploads.
    // Cap is 24h; use 1h so slow networks still finish.
    const validUntil = Date.now() + 60 * 60 * 1000;

    const clientToken = await generateClientTokenFromReadWriteToken({
      token: requireBlobToken(),
      pathname,
      allowedContentTypes: [...IMAGE_MIME_TYPES],
      maximumSizeInBytes: MAX_IMAGE_BYTES,
      addRandomSuffix: false,
      allowOverwrite: true,
      validUntil,
    });

    return NextResponse.json({ clientToken, pathname, validUntil });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to authorize photo upload.";
    console.error("[media/photo/client-upload]", error);
    return NextResponse.json(
      {
        error: message.includes("BLOB") || message.includes("token")
          ? "Blob token error. Confirm Vercel Blob is connected and redeploy."
          : `Unable to start photo upload: ${message}`,
      },
      { status: 500 },
    );
  }
}
