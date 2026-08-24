import { IMAGE_MIME_TYPES } from "@/lib/media/types";

export function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

/** Resolve image MIME from browser File (handles empty type from some mobile browsers). */
export function resolveImageMime(file: File): string | null {
  if (file.type && IMAGE_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "avif") return "image/avif";
  if (ext === "heic" || ext === "heif") return null;
  return null;
}

export function isHeicFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return file.type === "image/heic" || file.type === "image/heif" || ext === "heic" || ext === "heif";
}
