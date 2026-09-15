import "server-only";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { isSupabaseRsvpConfigured } from "@/lib/rsvp/supabase-env";
import { pingSupabaseRsvp } from "@/lib/rsvp/supabase-client";

export const runtime = "nodejs";

/** Admin-only Supabase RSVP connectivity check. */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isSupabaseRsvpConfigured();
  if (!configured) {
    return NextResponse.json({
      backend: "file",
      configured: false,
      ok: false,
      message:
        "Supabase env vars missing. Vercel → Project → Settings → Environment Variables should include NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY after connecting Supabase.",
    });
  }

  const ping = await pingSupabaseRsvp();

  return NextResponse.json({
    backend: ping.ok ? "supabase" : "supabase-error",
    configured: true,
    ok: ping.ok,
    tablesReady: ping.tablesReady ?? false,
    householdCount: ping.householdCount ?? 0,
    error: ping.error ?? null,
    nextSteps: ping.ok
      ? [
          "Open /rsvp and look up a guest (seed loads automatically when tables are empty).",
          "Use /admin/rsvp to review responses.",
        ]
      : ping.tablesReady === false
        ? [
            "Run SQL from supabase/migrations/202608240002_rsvp.sql in the Supabase SQL editor, or",
            "Run: npm run db:rsvp:apply (with POSTGRES_URL from Vercel env pull).",
          ]
        : ["Check SUPABASE_SERVICE_ROLE_KEY and redeploy."],
  });
}
