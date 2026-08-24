import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { getSectionPlacement } from "@/data/section-media";
import { isBlobStorageEnabled } from "@/lib/media/blob-env";
import {
  archiveMediaAsset,
  createMediaAsset,
  updateMediaAsset,
  writeUploadFileWithUrl,
} from "@/lib/media/store";
import {
  extensionForMime,
  isHeicFile,
  resolveImageMime,
} from "@/lib/media/image-upload";
import { MAX_IMAGE_BYTES, type MediaCategory } from "@/lib/media/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production" && !isBlobStorageEnabled()) {
    return NextResponse.json(
      {
        error:
          "Photo storage is not configured. In Vercel: Storage → Blob → Connect to this project, then redeploy so BLOB_READ_WRITE_TOKEN is available.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  const mimeType = resolveImageMime(file);
  if (!mimeType) {
    if (isHeicFile(file)) {
      return NextResponse.json(
        {
          error:
            "HEIC photos from iPhone are not supported. Use Settings → Camera → Formats → Most Compatible, or AirDrop/export as JPEG.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error:
          "Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be 4 MB or smaller." },
      { status: 400 },
    );
  }

  const title = String(form.get("title") || file.name).slice(0, 160);
  const description = String(form.get("description") || "").slice(0, 2000);
  const placementKey = String(form.get("placementKey") || "").trim() || null;
  const alt = String(form.get("alt") || title).slice(0, 300);
  const publish = String(form.get("publish") || "true") === "true";
  const sortOrder = Number(form.get("sortOrder") || 0);

  const placement = placementKey ? getSectionPlacement(placementKey) : null;
  if (placement && !placement.accepts.includes("image")) {
    return NextResponse.json(
      { error: "This placement only accepts video." },
      { status: 400 },
    );
  }

  const category = (placement?.defaultCategory ??
    "section_photo") as MediaCategory;

  let assetId: string | null = null;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());

    const asset = await createMediaAsset({
      kind: "image",
      muxUploadId: null,
      storagePath: null,
      publicUrl: null,
      alt,
      width: null,
      height: null,
      focalX: 50,
      focalY: 40,
      mimeType,
      category,
      title,
      description,
      mediaDate: null,
      posterUrl: null,
      customPosterPath: null,
      durationSeconds: null,
      aspectRatio: null,
      captionsUrl: null,
      transcript: "",
      chaptersJson: [],
      isPublished: false,
      isPrivate: false,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      storyMomentId: placement?.storyMomentId ?? null,
      placementKey,
      errorMessage: null,
      createdBy: "admin",
      status: "ready",
    });

    assetId = asset.id;

    const extension = extensionForMime(mimeType);
    const { storagePath, publicUrl } = await writeUploadFileWithUrl(
      asset.id,
      extension,
      bytes,
      mimeType,
    );

    const updated = await updateMediaAsset(asset.id, {
      storagePath,
      publicUrl,
      status: "ready",
      isPublished: publish,
    });

    return NextResponse.json({ asset: updated ?? asset });
  } catch (error) {
    if (assetId) {
      await archiveMediaAsset(assetId).catch(() => undefined);
    }

    const message =
      error instanceof Error ? error.message : "Photo upload failed.";
    console.error("[media/photo]", error);

    return NextResponse.json(
      {
        error:
          message.includes("BLOB") || message.includes("token")
            ? "Blob storage error. Confirm Vercel Blob is connected and redeploy."
            : `Photo upload failed: ${message}`,
      },
      { status: 500 },
    );
  }
}
