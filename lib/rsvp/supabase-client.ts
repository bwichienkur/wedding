import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseProjectUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/rsvp/supabase-env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseProjectUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export async function pingSupabaseRsvp(): Promise<{
  ok: boolean;
  error?: string;
  householdCount?: number;
  tablesReady?: boolean;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("households")
      .select("*", { count: "exact", head: true });
    if (error) {
      const missing = error.message.includes("does not exist");
      return {
        ok: false,
        error: error.message,
        tablesReady: !missing,
      };
    }
    return { ok: true, householdCount: count ?? 0, tablesReady: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
