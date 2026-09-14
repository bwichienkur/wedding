#!/usr/bin/env node
/**
 * Upload a single section photo to Vercel Blob and register it in the media manifest.
 *
 *   node scripts/upload-section-photo.mjs story.proposal /path/to/photo.jpg
 */

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { get, put } from "@vercel/blob";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOB_MANIFEST_PATH = "wedding/media-assets.json";

function resolveBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const [key, value] of Object.entries(process.env)) {
    if (value && key.endsWith("_READ_WRITE_TOKEN") && key.includes("BLOB")) {
      return value;
    }
  }
  return null;
}

function blobAccess() {
  const explicit = process.env.BLOB_ACCESS?.toLowerCase();
  if (explicit === "public" || explicit === "private") return explicit;
  if (process.env.BLOB_STORE_ID?.trim()) return "private";
  return "public";
}

function nowIso() {
  return new Date().toISOString();
}

async function readManifest(token) {
  if (!token) return [];
  const result = await get(BLOB_MANIFEST_PATH, { access: "private", token });
  if (!result || result.statusCode !== 200) return [];
  return JSON.parse(await new Response(result.stream).text());
}

async function writeManifest(assets, token) {
  await put(BLOB_MANIFEST_PATH, JSON.stringify(assets, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token,
  });
}

async function main() {
  const placementKey = process.argv[2];
  const fileArg = process.argv[3];
  if (!placementKey || !fileArg) {
    console.error(
      "Usage: node scripts/upload-section-photo.mjs <placementKey> <image-path> [title]",
    );
    process.exit(1);
  }

  const token = resolveBlobToken();
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN is required.");
    process.exit(1);
  }

  const filePath = path.resolve(fileArg);
  const bytes = readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace(/^\./, "") || "jpg";
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const title = process.argv[4] || path.basename(filePath, path.extname(filePath));
  const assetId = randomUUID();
  const access = blobAccess();
  const pathname = `wedding/images/${assetId}.${ext}`;

  const blob = await put(pathname, bytes, {
    access,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    token,
  });

  const publicUrl =
    access === "private" ? `/api/media/file/${assetId}` : blob.url;

  const now = nowIso();
  const asset = {
    id: assetId,
    kind: "image",
    muxAssetId: null,
    muxPlaybackId: null,
    muxUploadId: null,
    storagePath: blob.pathname,
    publicUrl,
    alt:
      placementKey === "story.proposal"
        ? "Bright proposing to Lexi under a lit arch with a drone message in the night sky"
        : placementKey === "story.how-we-met"
          ? "Bright dipping Lexi on an outdoor promenade when they met"
          : placementKey === "story.wedding"
            ? "Bright and Lexi smiling together in golden light before their wedding day"
            : title,
    width: 2400,
    height: 1600,
    focalX: 50,
    focalY: 42,
    mimeType: contentType,
    status: "ready",
    category: "relationship_memory",
    title,
    description: "",
    mediaDate: null,
    posterUrl: null,
    customPosterPath: null,
    durationSeconds: null,
    aspectRatio: null,
    captionsUrl: null,
    transcript: "",
    chaptersJson: [],
    isPublished: true,
    isPrivate: false,
    sortOrder: 0,
    storyMomentId: placementKey.startsWith("story.")
      ? placementKey.replace("story.", "")
      : null,
    placementKey,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    createdBy: "upload-section-photo",
  };

  const existing = await readManifest(token);
  const filtered = existing.filter((item) => item.placementKey !== placementKey);
  await writeManifest([...filtered, asset], token);

  console.log(`Uploaded ${placementKey} → ${publicUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
