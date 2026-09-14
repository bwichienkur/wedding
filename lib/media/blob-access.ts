export type BlobAccess = "public" | "private";

/** Match Vercel Blob store access (private stores require access: "private" on put/get). */
export function resolveBlobAccess(): BlobAccess {
  const explicit = process.env.BLOB_ACCESS?.toLowerCase();
  if (explicit === "public" || explicit === "private") {
    return explicit;
  }
  if (process.env.BLOB_STORE_ID?.trim()) {
    return "private";
  }
  return "public";
}

/** URL used in <img src> — private blobs are served via the app file route. */
export function imagePublicUrl(assetId: string, blobUrl: string): string {
  return resolveBlobAccess() === "private"
    ? `/api/media/file/${assetId}`
    : blobUrl;
}
