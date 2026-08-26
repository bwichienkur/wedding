import "server-only";

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { isBlobStorageEnabled } from "@/lib/media/blob-env";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/media/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Issues short-lived Blob client tokens so the browser can upload photos
 * directly to Vercel Blob (needed for files above the ~4.5 MB function body limit).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobStorageEnabled()) {
    return NextResponse.json(
      {
        error:
          "Photo storage is not configured. In Vercel: Storage → Blob → Connect to this project, then redeploy.",
      },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  try {
    // Token generation runs in the browser's request (cookies present).
    // Completion callbacks are server-to-server and are optional here —
    // the admin UI registers the asset after `upload()` resolves.
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        try {
          await requireAdmin();
        } catch {
          throw new Error("Unauthorized");
        }

        if (!pathname.startsWith("wedding/images/")) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: [...IMAGE_MIME_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async () => {
        // Asset registration happens from the admin client after upload().
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to authorize photo upload.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
