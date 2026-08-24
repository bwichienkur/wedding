import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  createSignedPlaybackToken,
  isMuxConfigured,
} from "@/lib/media/mux";
import { getMediaById, getMediaByPlacement } from "@/lib/media/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const placement = searchParams.get("placement");

  const asset = id
    ? await getMediaById(id)
    : placement
      ? await getMediaByPlacement(placement)
      : null;

  if (!asset || asset.status === "archived") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = await isAdminAuthenticated();
  if (!asset.isPublished && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (asset.status !== "ready" || !asset.muxPlaybackId) {
    return NextResponse.json({
      asset: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        status: asset.status,
        category: asset.category,
        posterUrl: asset.posterUrl,
        captionsUrl: asset.captionsUrl,
        transcript: asset.transcript,
        aspectRatio: asset.aspectRatio,
        isPrivate: asset.isPrivate,
        playbackId: null,
        token: null,
      },
    });
  }

  let token: string | null = null;
  if (asset.isPrivate) {
    if (!isMuxConfigured()) {
      return NextResponse.json({ error: "Playback unavailable" }, { status: 503 });
    }
    try {
      token = await createSignedPlaybackToken(asset.muxPlaybackId);
    } catch {
      return NextResponse.json(
        { error: "Private playback is not configured" },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({
    asset: {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      status: asset.status,
      category: asset.category,
      posterUrl: asset.posterUrl,
      captionsUrl: asset.captionsUrl,
      transcript: asset.transcript,
      aspectRatio: asset.aspectRatio,
      mediaDate: asset.mediaDate,
      chapters: asset.chaptersJson,
      isPrivate: asset.isPrivate,
      playbackId: asset.muxPlaybackId,
      token,
    },
  });
}
