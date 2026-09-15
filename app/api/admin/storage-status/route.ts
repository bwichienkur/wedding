import "server-only";

import { NextResponse } from "next/server";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/auth/admin";
import { isBlobStorageEnabled } from "@/lib/media/blob-env";
import { resolveBlobAccess } from "@/lib/media/blob-access";
import { MAX_IMAGE_MB } from "@/lib/media/types";
import { isSupabaseRsvpConfigured } from "@/lib/rsvp/supabase-env";
import { pingSupabaseRsvp } from "@/lib/rsvp/supabase-client";

export const runtime = "nodejs";

/** Admin-only storage diagnostics for troubleshooting uploads. */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blobConfigured = isBlobStorageEnabled();
  const isProduction = process.env.NODE_ENV === "production";
  const supabaseConfigured = isSupabaseRsvpConfigured();
  const rsvpPing = supabaseConfigured ? await pingSupabaseRsvp() : null;

  return NextResponse.json({
    authConfigured: isAdminAuthConfigured(),
    blobConfigured,
    blobAccess: resolveBlobAccess(),
    production: isProduction,
    photoUploadReady: !isProduction || blobConfigured,
    maxImageMb: MAX_IMAGE_MB,
    rsvp: {
      backend: supabaseConfigured ? "supabase" : "file",
      supabaseConfigured,
      connected: rsvpPing?.ok ?? false,
      householdCount: rsvpPing?.householdCount ?? null,
      error: rsvpPing?.error ?? null,
      statusUrl: "/api/admin/rsvp/status",
    },
    hints: [
      !isAdminAuthConfigured()
        ? "Set WEDDING_ADMIN_PASSWORD in Vercel environment variables."
        : null,
      isProduction && !blobConfigured
        ? "Connect Vercel Blob (Storage → Blob) to add BLOB_READ_WRITE_TOKEN, then redeploy."
        : null,
      isProduction && !supabaseConfigured
        ? "Connect Supabase in Vercel Storage so RSVP uses Postgres (not ephemeral .data/rsvp.json)."
        : null,
      supabaseConfigured && rsvpPing && !rsvpPing.ok
        ? "Supabase RSVP tables missing or unreachable — run supabase/migrations/202608240002_rsvp.sql or npm run db:rsvp:apply."
        : null,
      `JPEG/PNG/WebP up to ${MAX_IMAGE_MB} MB. iPhone HEIC is not supported.`,
      "Choose a section, upload, and keep “Publish when ready” checked.",
      "Homepage photos appear immediately after upload — no redeploy needed.",
    ].filter(Boolean),
  });
}
