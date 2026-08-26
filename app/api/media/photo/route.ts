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
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  type MediaCategory,
} from "@/lib/media/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type PhotoMeta = {
  title: string;
  description: string;
  alt: string;
  placementKey: string | null;
  publish: boolean;
  sortOrder: number;
};

type BlobRegisterBody = PhotoMeta & {
  publicUrl: string;
  storagePath: string;
  mimeType: string;
};

function parseMeta(source: {
  title?: string;
  description?: string;
  alt?: string;
  placementKey?: string | null;
  publish?: boolean | string;
  sortOrder?: number | string;
  fileName?: string;
}): PhotoMeta {
  const title = String(source.title || source.fileName || "Photo").slice(0, 160);
  const description = String(source.description || "").slice(0, 2000);
  const placementKey =
    String(source.placementKey || "").trim() || null;
  const alt = String(source.alt || title).slice(0, 300);
  const publish =
    typeof source.publish === "boolean"
      ? source.publish
      : String(source.publish ?? "true") === "true";
  const sortOrder = Number(source.sortOrder ?? 0);

  return {
    title,
    description,
    alt,
    placementKey,
    publish,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

function validatePlacement(placementKey: string | null) {
  const placement = placementKey ? getSectionPlacement(placementKey) : null;
  if (placement && !placement.accepts.includes("image")) {
    return { ok: false as const, error: "This placement only accepts video." };
  }
  return { ok: true as const, placement };
}

function isAllowedBlobRef(publicUrl: string, storagePath: string): boolean {
  if (!storagePath.startsWith("wedding/images/")) return false;
  try {
    const url = new URL(publicUrl);
    if (url.protocol !== "https:") return false;
    // storeId.public.blob.vercel-storage.com (and future regional hosts)
    return (
      url.hostname.endsWith(".blob.vercel-storage.com") ||
      url.hostname.endsWith(".vercel-storage.com")
    );
  } catch {
    return false;
  }
}

async function createReadyPhotoAsset(input: {
  meta: PhotoMeta;
  mimeType: string;
  storagePath: string;
  publicUrl: string;
}) {
  const { meta, mimeType, storagePath, publicUrl } = input;
  const placementCheck = validatePlacement(meta.placementKey);
  if (!placementCheck.ok) {
    return NextResponse.json({ error: placementCheck.error }, { status: 400 });
  }
  const placement = placementCheck.placement;
  const category = (placement?.defaultCategory ??
    "section_photo") as MediaCategory;

  let assetId: string | null = null;
  try {
    const asset = await createMediaAsset({
      kind: "image",
      muxUploadId: null,
      storagePath: null,
      publicUrl: null,
      alt: meta.alt,
      width: null,
      height: null,
      focalX: 50,
      focalY: 40,
      mimeType,
      category,
      title: meta.title,
      description: meta.description,
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
      sortOrder: meta.sortOrder,
      storyMomentId: placement?.storyMomentId ?? null,
      placementKey: meta.placementKey,
      errorMessage: null,
      createdBy: "admin",
      status: "ready",
    });

    assetId = asset.id;

    const updated = await updateMediaAsset(asset.id, {
      storagePath,
      publicUrl,
      status: "ready",
      isPublished: meta.publish,
    });

    return NextResponse.json({ asset: updated ?? asset });
  } catch (error) {
    if (assetId) {
      await archiveMediaAsset(assetId).catch(() => undefined);
    }
    throw error;
  }
}

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

  const contentType = request.headers.get("content-type") || "";

  try {
    // Client-direct Blob upload: register an already-uploaded public blob.
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Partial<BlobRegisterBody>;
      const mimeType = String(body.mimeType || "");
      const publicUrl = String(body.publicUrl || "");
      const storagePath = String(body.storagePath || "");

      if (!IMAGE_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          { error: "Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF." },
          { status: 400 },
        );
      }
      if (!publicUrl || !storagePath || !isAllowedBlobRef(publicUrl, storagePath)) {
        return NextResponse.json(
          { error: "Invalid Blob upload reference." },
          { status: 400 },
        );
      }
      if (!isBlobStorageEnabled()) {
        return NextResponse.json(
          { error: "Blob storage is not configured for this environment." },
          { status: 503 },
        );
      }

      const meta = parseMeta(body);
      return await createReadyPhotoAsset({
        meta,
        mimeType,
        storagePath,
        publicUrl,
      });
    }

    // Local / small-file path: multipart form through the function.
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
          error: "Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: `Image must be ${MAX_IMAGE_MB} MB or smaller.`,
        },
        { status: 400 },
      );
    }

    // Prefer client Blob upload in production when Blob is configured —
    // form posts over ~4.5 MB will fail at the platform boundary.
    if (
      isBlobStorageEnabled() &&
      process.env.NODE_ENV === "production" &&
      file.size > 4 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Large photos must use direct Blob upload. Refresh /admin/media and try again.",
        },
        { status: 413 },
      );
    }

    const meta = parseMeta({
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      alt: String(form.get("alt") || ""),
      placementKey: String(form.get("placementKey") || ""),
      publish: String(form.get("publish") || "true"),
      sortOrder: String(form.get("sortOrder") || "0"),
      fileName: file.name,
    });

    const placementCheck = validatePlacement(meta.placementKey);
    if (!placementCheck.ok) {
      return NextResponse.json({ error: placementCheck.error }, { status: 400 });
    }
    const placement = placementCheck.placement;
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
        alt: meta.alt,
        width: null,
        height: null,
        focalX: 50,
        focalY: 40,
        mimeType,
        category,
        title: meta.title,
        description: meta.description,
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
        sortOrder: meta.sortOrder,
        storyMomentId: placement?.storyMomentId ?? null,
        placementKey: meta.placementKey,
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
        isPublished: meta.publish,
      });

      return NextResponse.json({ asset: updated ?? asset });
    } catch (error) {
      if (assetId) {
        await archiveMediaAsset(assetId).catch(() => undefined);
      }
      throw error;
    }
  } catch (error) {
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
