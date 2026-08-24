import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  archiveMediaAsset,
  getMediaById,
  listMediaAssets,
  updateMediaAsset,
} from "@/lib/media/store";
import { updateMediaSchema } from "@/lib/media/types";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await listMediaAssets();
  return NextResponse.json({ assets });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as { id?: string } & Record<string, unknown>;
  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing asset id" }, { status: 400 });
  }

  const parsed = updateMediaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await getMediaById(body.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.isPublished && existing.status !== "ready") {
    return NextResponse.json(
      { error: "Only ready assets can be published" },
      { status: 400 },
    );
  }

  const updated = await updateMediaAsset(body.id, parsed.data);
  return NextResponse.json({ asset: updated });
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const archived = await archiveMediaAsset(id);
  if (!archived) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ asset: archived });
}
