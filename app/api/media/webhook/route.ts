import { NextResponse } from "next/server";
import {
  findByMuxAssetId,
  findByUploadId,
  getMediaById,
  updateMediaAsset,
} from "@/lib/media/store";
import { muxPosterUrl, verifyMuxWebhookSignature } from "@/lib/media/mux";

interface MuxWebhookData {
  id?: string;
  asset_id?: string;
  status?: string;
  duration?: number;
  aspect_ratio?: string;
  passthrough?: string;
  upload_id?: string;
  playback_ids?: Array<{ id: string; policy: string }>;
  errors?: { messages?: string[] };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("mux-signature");
  const valid = await verifyMuxWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: MuxWebhookData };
  try {
    event = JSON.parse(rawBody) as { type?: string; data?: MuxWebhookData };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = event.data ?? {};
  const type = event.type ?? "";

  if (type === "video.upload.asset_created") {
    const uploadId = data.id;
    if (uploadId) {
      const existing = await findByUploadId(uploadId);
      if (existing) {
        await updateMediaAsset(existing.id, {
          status: "processing",
          muxAssetId: data.asset_id ?? existing.muxAssetId,
        });
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (type.startsWith("video.asset.")) {
    const muxAssetId = data.id;
    if (!muxAssetId) {
      return NextResponse.json({ ok: true });
    }

    const record =
      (await findByMuxAssetId(muxAssetId)) ||
      (data.passthrough ? await getMediaById(data.passthrough) : null) ||
      (data.upload_id ? await findByUploadId(data.upload_id) : null);

    if (!record) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (type === "video.asset.ready") {
      const playbackId = data.playback_ids?.[0]?.id ?? null;
      await updateMediaAsset(record.id, {
        status: "ready",
        muxAssetId,
        muxPlaybackId: playbackId,
        durationSeconds: data.duration ?? null,
        aspectRatio: data.aspect_ratio ?? null,
        posterUrl: playbackId ? muxPosterUrl(playbackId) : record.posterUrl,
        errorMessage: null,
      });
    }

    if (type === "video.asset.errored") {
      await updateMediaAsset(record.id, {
        status: "errored",
        muxAssetId,
        errorMessage: data.errors?.messages?.join("; ") ?? "Mux asset errored",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
