import { NextResponse } from "next/server";
import {
  ourSongMeta,
  resolveOurSongPlaybackSrc,
} from "@/lib/media/our-song";

export const runtime = "nodejs";

export async function GET() {
  if (!ourSongMeta.enabled) {
    return NextResponse.json({ enabled: false, src: null });
  }
  return NextResponse.json({
    enabled: true,
    title: ourSongMeta.title,
    src: resolveOurSongPlaybackSrc(),
  });
}
