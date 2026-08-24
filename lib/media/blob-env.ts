import "server-only";

/** Resolve Vercel Blob token — supports default and store-prefixed env names. */
export function resolveBlobToken(): string | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (key.endsWith("_READ_WRITE_TOKEN") && key.includes("BLOB")) {
      return value;
    }
  }

  return null;
}

export function isBlobStorageEnabled(): boolean {
  return Boolean(resolveBlobToken());
}

export function requireBlobToken(): string {
  const token = resolveBlobToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }
  return token;
}
