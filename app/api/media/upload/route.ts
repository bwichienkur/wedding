import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createDirectUpload, isMuxConfigured } from "@/lib/media/mux";
import { createMediaAsset } from "@/lib/media/store";
import { createUploadSchema } from "@/lib/media/types";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMuxConfigured()) {
    return NextResponse.json(
      {
        error:
          "Mux is not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to enable uploads.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createUploadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000";

  const draft = await createMediaAsset({
    muxUploadId: null,
    category: parsed.data.category,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    mediaDate: parsed.data.mediaDate ?? null,
    posterUrl: null,
    customPosterPath: null,
    durationSeconds: null,
    aspectRatio: null,
    captionsUrl: null,
    transcript: "",
    chaptersJson: [],
    isPublished: false,
    isPrivate: parsed.data.isPrivate ?? false,
    sortOrder: 0,
    storyMomentId: parsed.data.storyMomentId ?? null,
    placementKey: parsed.data.placementKey ?? null,
    errorMessage: null,
    createdBy: "admin",
    status: "waiting",
  });

  try {
    const upload = await createDirectUpload({
      corsOrigin: origin,
      passthrough: draft.id,
      isPrivate: draft.isPrivate,
    });

    const { updateMediaAsset } = await import("@/lib/media/store");
    await updateMediaAsset(draft.id, {
      muxUploadId: upload.uploadId,
      status: "uploading",
    });

    return NextResponse.json({
      assetId: draft.id,
      uploadId: upload.uploadId,
      uploadUrl: upload.uploadUrl,
    });
  } catch (error) {
    const { updateMediaAsset } = await import("@/lib/media/store");
    await updateMediaAsset(draft.id, {
      status: "errored",
      errorMessage: error instanceof Error ? error.message : "Upload create failed",
    });
    return NextResponse.json(
      { error: "Unable to create Mux direct upload" },
      { status: 502 },
    );
  }
}
