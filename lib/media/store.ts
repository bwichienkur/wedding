import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { MediaAsset, UpdateMediaInput } from "@/lib/media/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "media-assets.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<MediaAsset[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as MediaAsset[];
}

async function writeAll(assets: MediaAsset[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(assets, null, 2), "utf8");
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const assets = await readAll();
  return assets.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export async function listPublishedMedia(): Promise<MediaAsset[]> {
  const assets = await listMediaAssets();
  return assets.filter(
    (asset) => asset.isPublished && asset.status === "ready" && !asset.isPrivate,
  );
}

export async function getMediaById(id: string): Promise<MediaAsset | null> {
  const assets = await readAll();
  return assets.find((asset) => asset.id === id) ?? null;
}

export async function getMediaByPlacement(
  placementKey: string,
): Promise<MediaAsset | null> {
  const assets = await listMediaAssets();
  return (
    assets.find(
      (asset) =>
        asset.placementKey === placementKey &&
        asset.isPublished &&
        asset.status === "ready",
    ) ?? null
  );
}

export async function createMediaAsset(
  input: Omit<
    MediaAsset,
    "id" | "createdAt" | "updatedAt" | "status" | "muxAssetId" | "muxPlaybackId"
  > & {
    status?: MediaAsset["status"];
    muxAssetId?: string | null;
    muxPlaybackId?: string | null;
  },
): Promise<MediaAsset> {
  const now = new Date().toISOString();
  const asset: MediaAsset = {
    id: randomUUID(),
    muxAssetId: input.muxAssetId ?? null,
    muxPlaybackId: input.muxPlaybackId ?? null,
    muxUploadId: input.muxUploadId,
    status: input.status ?? "waiting",
    category: input.category,
    title: input.title,
    description: input.description,
    mediaDate: input.mediaDate,
    posterUrl: input.posterUrl,
    customPosterPath: input.customPosterPath,
    durationSeconds: input.durationSeconds,
    aspectRatio: input.aspectRatio,
    captionsUrl: input.captionsUrl,
    transcript: input.transcript,
    chaptersJson: input.chaptersJson,
    isPublished: input.isPublished,
    isPrivate: input.isPrivate,
    sortOrder: input.sortOrder,
    storyMomentId: input.storyMomentId,
    placementKey: input.placementKey,
    errorMessage: input.errorMessage,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };

  const assets = await readAll();
  assets.push(asset);
  await writeAll(assets);
  return asset;
}

export async function updateMediaAsset(
  id: string,
  patch: UpdateMediaInput & Partial<Pick<MediaAsset, "muxAssetId" | "muxPlaybackId" | "muxUploadId" | "durationSeconds" | "aspectRatio" | "errorMessage" | "posterUrl">>,
): Promise<MediaAsset | null> {
  const assets = await readAll();
  const index = assets.findIndex((asset) => asset.id === id);
  if (index < 0) return null;

  const next: MediaAsset = {
    ...assets[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  assets[index] = next;
  await writeAll(assets);
  return next;
}

export async function archiveMediaAsset(id: string): Promise<MediaAsset | null> {
  return updateMediaAsset(id, { status: "archived", isPublished: false });
}

export async function findByUploadId(uploadId: string): Promise<MediaAsset | null> {
  const assets = await readAll();
  return assets.find((asset) => asset.muxUploadId === uploadId) ?? null;
}

export async function findByMuxAssetId(muxAssetId: string): Promise<MediaAsset | null> {
  const assets = await readAll();
  return assets.find((asset) => asset.muxAssetId === muxAssetId) ?? null;
}
