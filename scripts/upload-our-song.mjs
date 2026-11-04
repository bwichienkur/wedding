#!/usr/bin/env node
/**
 * Upload the wedding background track to Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=... node scripts/upload-our-song.mjs /path/to/ordinary.mp3
 *
 * Optional:
 *   OUR_SONG_BLOB_PATH=wedding/music/ordinary.mp3
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { put } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
const localPath = process.argv[2];

if (!token) {
  console.error("Set BLOB_READ_WRITE_TOKEN (vercel env pull .env.local).");
  process.exit(1);
}
if (!localPath) {
  console.error("Usage: node scripts/upload-our-song.mjs /path/to/song.mp3");
  process.exit(1);
}

const pathname =
  process.env.OUR_SONG_BLOB_PATH?.trim() ??
  `wedding/music/${basename(localPath)}`;

const body = readFileSync(localPath);

const result = await put(pathname, body, {
  access: "public",
  token,
  contentType: "audio/mpeg",
  addRandomSuffix: false,
});

console.log("Uploaded:", result.pathname);
console.log("Set in Vercel Production + Preview:");
console.log(`  OUR_SONG_BLOB_PATH=${result.pathname}`);
