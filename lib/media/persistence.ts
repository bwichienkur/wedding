import "server-only";

import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import {
  isBlobStorageEnabled,
  requireBlobToken,
} from "@/lib/media/blob-env";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "media-assets.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const BLOB_MANIFEST_PATH = "wedding/media-assets.json";

export { isBlobStorageEnabled };

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

function blobToken(): string {
  return requireBlobToken();
}

async function ensureLocalStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function streamToText(
  stream: ReadableStream<Uint8Array> | null,
): Promise<string> {
  if (!stream) return "[]";
  return new Response(stream).text();
}

export async function readManifestRaw(): Promise<string> {
  if (isBlobStorageEnabled()) {
    const result = await get(BLOB_MANIFEST_PATH, {
      access: "private",
      token: blobToken(),
    });
    if (!result || result.statusCode !== 200) return "[]";
    return streamToText(result.stream);
  }

  await ensureLocalStore();
  return fs.readFile(DATA_FILE, "utf8");
}

export async function writeManifestRaw(json: string): Promise<void> {
  if (isBlobStorageEnabled()) {
    await put(BLOB_MANIFEST_PATH, json, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: blobToken(),
    });
    return;
  }

  await ensureLocalStore();
  await fs.writeFile(DATA_FILE, json, "utf8");
}

export interface StoredImageFile {
  storagePath: string;
  publicUrl: string;
}

export async function writeImageFile(
  assetId: string,
  extension: string,
  bytes: Buffer,
  contentType: string,
): Promise<StoredImageFile> {
  const ext = extension.replace(/^\./, "");
  const filename = `${assetId}.${ext}`;

  if (isBlobStorageEnabled()) {
    const pathname = `wedding/images/${filename}`;
    const blob = await put(pathname, bytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token: blobToken(),
    });
    return {
      storagePath: blob.pathname,
      publicUrl: blob.url,
    };
  }

  await ensureLocalStore();
  const fullPath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(fullPath, bytes);
  return {
    storagePath: filename,
    publicUrl: `/api/media/file/${assetId}`,
  };
}

export async function readImageFile(storagePath: string): Promise<Buffer | null> {
  if (isBlobStorageEnabled()) {
    const target = storagePath.startsWith("wedding/")
      ? storagePath
      : `wedding/images/${storagePath}`;
    const result = await get(target, {
      access: "public",
      token: blobToken(),
    });
    if (!result || result.statusCode !== 200) return null;
    const arrayBuffer = await new Response(result.stream).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  try {
    return await fs.readFile(path.join(UPLOADS_DIR, storagePath));
  } catch {
    return null;
  }
}
