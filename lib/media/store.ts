import "server-only";

import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type { MediaAsset, UpdateMediaInput } from "@/lib/media/types";
import {
  getUploadsDir,
  isBlobStorageEnabled,
  readImageFile,
  readManifestRaw,
  writeImageFile,
  writeManifestRaw,
} from "@/lib/media/persistence";

export { getUploadsDir, isBlobStorageEnabled };

function normalizeAsset(raw: MediaAsset): MediaAsset {
  return {
    ...raw,
    kind: raw.kind ?? "video",
    storagePath: raw.storagePath ?? null,
    publicUrl: raw.publicUrl ?? null,
    alt: raw.alt ?? "",
    width: raw.width ?? null,
    height: raw.height ?? null,
    focalX: raw.focalX ?? null,
    focalY: raw.focalY ?? null,
    mimeType: raw.mimeType ?? null,
  };
}

async function readAll(): Promise<MediaAsset[]> {
  const raw = await readManifestRaw();
  const parsed = JSON.parse(raw) as MediaAsset[];
  return parsed.map(normalizeAsset);
}

async function writeAll(assets: MediaAsset[]): Promise<void> {
  await writeManifestRaw(JSON.stringify(assets, null, 2));
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const assets = await readAll();
  return assets.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
  );
}

export async function listPublishedMedia(): Promise<MediaAsset[]> {
  const assets = await listMediaAssets();
  return assets.filter(
    (asset) =>
      asset.isPublished &&
      asset.status === "ready" &&
      !asset.isPrivate,
  );
}

export async function getMediaById(id: string): Promise<MediaAsset | null> {
  const assets = await readAll();
  return assets.find((asset) => asset.id === id) ?? null;
}

export async function getMediaByPlacement(
  placementKey: string,
): Promise<MediaAsset | null> {
  const assets = await listPublishedByPlacement(placementKey);
  return assets[0] ?? null;
}

/** All published ready assets for a placement, sorted. */
export async function listPublishedByPlacement(
  placementKey: string,
): Promise<MediaAsset[]> {
  noStore();
  const assets = await listMediaAssets();
  return assets
    .filter(
      (asset) =>
        asset.placementKey === placementKey &&
        asset.isPublished &&
        asset.status === "ready",
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export async function createMediaAsset(
  input: Omit<
    MediaAsset,
    "id" | "createdAt" | "updatedAt" | "status" | "muxAssetId" | "muxPlaybackId"
  > & {
    status?: MediaAsset["status"];
    muxAssetId?: string | null;
    muxPlaybackId?: string | null;
    kind?: MediaAsset["kind"];
  },
): Promise<MediaAsset> {
  const now = new Date().toISOString();
  const asset: MediaAsset = {
    id: randomUUID(),
    kind: input.kind ?? "video",
    muxAssetId: input.muxAssetId ?? null,
    muxPlaybackId: input.muxPlaybackId ?? null,
    muxUploadId: input.muxUploadId ?? null,
    storagePath: input.storagePath ?? null,
    publicUrl: input.publicUrl ?? null,
    alt: input.alt ?? "",
    width: input.width ?? null,
    height: input.height ?? null,
    focalX: input.focalX ?? null,
    focalY: input.focalY ?? null,
    mimeType: input.mimeType ?? null,
    status: input.status ?? "waiting",
    category: input.category,
    title: input.title,
    description: input.description ?? "",
    mediaDate: input.mediaDate ?? null,
    posterUrl: input.posterUrl ?? null,
    customPosterPath: input.customPosterPath ?? null,
    durationSeconds: input.durationSeconds ?? null,
    aspectRatio: input.aspectRatio ?? null,
    captionsUrl: input.captionsUrl ?? null,
    transcript: input.transcript ?? "",
    chaptersJson: input.chaptersJson ?? [],
    isPublished: input.isPublished ?? false,
    isPrivate: input.isPrivate ?? false,
    sortOrder: input.sortOrder ?? 0,
    storyMomentId: input.storyMomentId ?? null,
    placementKey: input.placementKey ?? null,
    errorMessage: input.errorMessage ?? null,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? null,
  };

  const assets = await readAll();
  assets.push(asset);
  await writeAll(assets);
  return asset;
}

export async function updateMediaAsset(
  id: string,
  patch: UpdateMediaInput &
    Partial<
      Pick<
        MediaAsset,
        | "muxAssetId"
        | "muxPlaybackId"
        | "muxUploadId"
        | "durationSeconds"
        | "aspectRatio"
        | "errorMessage"
        | "posterUrl"
        | "storagePath"
        | "publicUrl"
        | "width"
        | "height"
        | "mimeType"
        | "kind"
      >
    >,
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

export async function writeUploadFile(
  assetId: string,
  extension: string,
  bytes: Buffer,
  contentType = "image/jpeg",
): Promise<string> {
  const stored = await writeImageFile(assetId, extension, bytes, contentType);
  return stored.storagePath;
}

export async function writeUploadFileWithUrl(
  assetId: string,
  extension: string,
  bytes: Buffer,
  contentType: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  return writeImageFile(assetId, extension, bytes, contentType);
}

export async function readUploadFile(
  storagePath: string,
): Promise<Buffer | null> {
  return readImageFile(storagePath);
}
