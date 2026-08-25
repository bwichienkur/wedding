import "server-only";

import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import {
  isBlobStorageEnabled,
  requireBlobToken,
} from "@/lib/media/blob-env";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "logistics-content.json");
const BLOB_PATH = "wedding/logistics-content.json";

const EMPTY_DOC = JSON.stringify(
  {
    version: 1,
    updatedAt: new Date(0).toISOString(),
  },
  null,
  2,
);

async function ensureLocal(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, EMPTY_DOC, "utf8");
  }
}

async function streamToText(
  stream: ReadableStream<Uint8Array> | null,
): Promise<string> {
  if (!stream) return EMPTY_DOC;
  return new Response(stream).text();
}

export async function readLogisticsRaw(): Promise<string> {
  if (isBlobStorageEnabled()) {
    const result = await get(BLOB_PATH, {
      access: "private",
      token: requireBlobToken(),
    });
    if (!result || result.statusCode !== 200) return EMPTY_DOC;
    return streamToText(result.stream);
  }

  await ensureLocal();
  return fs.readFile(DATA_FILE, "utf8");
}

export async function writeLogisticsRaw(json: string): Promise<void> {
  if (isBlobStorageEnabled()) {
    await put(BLOB_PATH, json, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: requireBlobToken(),
    });
    return;
  }

  await ensureLocal();
  await fs.writeFile(DATA_FILE, json, "utf8");
}
