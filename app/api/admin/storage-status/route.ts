import "server-only";

import { NextResponse } from "next/server";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/auth/admin";
import { isBlobStorageEnabled } from "@/lib/media/blob-env";

export const runtime = "nodejs";

/** Admin-only storage diagnostics for troubleshooting uploads. */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blobConfigured = isBlobStorageEnabled();
  const isProduction = process.env.NODE_ENV === "production";

  return NextResponse.json({
    authConfigured: isAdminAuthConfigured(),
    blobConfigured,
    production: isProduction,
    photoUploadReady: !isProduction || blobConfigured,
    hints: [
      !isAdminAuthConfigured()
        ? "Set WEDDING_ADMIN_PASSWORD in Vercel environment variables."
        : null,
      isProduction && !blobConfigured
        ? "Connect Vercel Blob (Storage → Blob) to add BLOB_READ_WRITE_TOKEN, then redeploy."
        : null,
      "Use JPEG or PNG under 4 MB. iPhone HEIC is not supported.",
      "Choose a section, upload, and keep “Publish when ready” checked.",
      "Homepage photos appear immediately after upload — no redeploy needed.",
    ].filter(Boolean),
  });
}
