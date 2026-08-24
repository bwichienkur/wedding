import { NextResponse } from "next/server";

import { readUploadFile, getMediaById } from "@/lib/media/store";

type Params = { params: Promise<{ id: string }> };

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const asset = await getMediaById(id);

  if (!asset || asset.kind !== "image" || !asset.storagePath) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const file = await readUploadFile(asset.storagePath);
  if (!file) {
    return NextResponse.json({ error: "File missing." }, { status: 404 });
  }

  const ext = asset.storagePath.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
