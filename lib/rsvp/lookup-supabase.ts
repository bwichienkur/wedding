import "server-only";

import {
  invalidateRsvpLookupIndexCache,
  withRsvpLookupIndexCache,
  type RsvpLookupIndex,
} from "@/lib/rsvp/lookup-index-cache";
import { getSupabaseAdmin } from "@/lib/rsvp/supabase-client";
import type {
  EventRecord,
  Guest,
  GuestResponse,
  Household,
  MealOption,
  RsvpDatabase,
} from "@/lib/rsvp/types";

function mapEvent(row: Record<string, unknown>): EventRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    startsAt: (row.starts_at as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    isAdultsOnly: Boolean(row.is_adults_only),
    allowsPlusOnes: Boolean(row.allows_plus_ones),
    collectMeals: Boolean(row.collect_meals),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapHousehold(
  row: Record<string, unknown>,
  eventIds: string[],
): Household {
  return {
    id: String(row.id),
    displayName: String(row.display_name),
    invitationCodeHash: (row.invitation_code_hash as string | null) ?? null,
    invitationCodeHint: (row.invitation_code_hint as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    notesAdmin: String(row.notes_admin ?? ""),
    rsvpStatus: row.rsvp_status as Household["rsvpStatus"],
    eventIds,
    maxPlusOnes: Number(row.max_plus_ones ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapGuest(row: Record<string, unknown>): Guest {
  return {
    id: String(row.id),
    householdId: String(row.household_id),
    fullName: String(row.full_name),
    normalizedName: String(row.normalized_name),
    isChild: Boolean(row.is_child),
    isPlusOne: Boolean(row.is_plus_one),
    plusOneNamed: Boolean(row.plus_one_named),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapMeal(row: Record<string, unknown>): MealOption {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    label: String(row.label),
    description: String(row.description ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active),
  };
}

function mapResponse(row: Record<string, unknown>): GuestResponse {
  return {
    id: String(row.id),
    guestId: String(row.guest_id),
    eventId: String(row.event_id),
    attending: row.attending as GuestResponse["attending"],
    mealOptionId: (row.meal_option_id as string | null) ?? null,
    dietaryNotes: String(row.dietary_notes ?? ""),
    accessibilityNotes: String(row.accessibility_notes ?? ""),
  };
}

/** Cached households + guests + events for name/code lookup (no audit/history/responses). */
export async function readRsvpLookupIndexSupabase(): Promise<RsvpLookupIndex> {
  return withRsvpLookupIndexCache(async () => {
    const supabase = getSupabaseAdmin();
    const [eventsRes, householdsRes, invitationsRes, guestsRes] =
      await Promise.all([
        supabase.from("events").select("*").order("sort_order"),
        supabase.from("households").select("*"),
        supabase.from("household_event_invitations").select("*"),
        supabase.from("guests").select("*").is("archived_at", null),
      ]);

    const firstError =
      eventsRes.error ||
      householdsRes.error ||
      invitationsRes.error ||
      guestsRes.error;
    if (firstError) {
      throw new Error(`Supabase RSVP lookup index failed: ${firstError.message}`);
    }

    const eventIdsByHousehold = new Map<string, string[]>();
    for (const row of invitationsRes.data ?? []) {
      const householdId = String(row.household_id);
      const list = eventIdsByHousehold.get(householdId) ?? [];
      list.push(String(row.event_id));
      eventIdsByHousehold.set(householdId, list);
    }

    return {
      events: (eventsRes.data ?? []).map((row) =>
        mapEvent(row as Record<string, unknown>),
      ),
      households: (householdsRes.data ?? []).map((row) =>
        mapHousehold(
          row as Record<string, unknown>,
          eventIdsByHousehold.get(String(row.id)) ?? [],
        ),
      ),
      guests: (guestsRes.data ?? []).map((row) =>
        mapGuest(row as Record<string, unknown>),
      ),
    };
  });
}

/** Loads one household workspace without reading the full guest_responses table. */
export async function readHouseholdWorkspaceSliceSupabase(
  householdId: string,
): Promise<Pick<
  RsvpDatabase,
  "events" | "mealOptions" | "households" | "guests" | "responses"
> | null> {
  const supabase = getSupabaseAdmin();

  const [eventsRes, mealsRes, householdRes, invitationsRes, guestsRes] =
    await Promise.all([
      supabase.from("events").select("*").order("sort_order"),
      supabase.from("meal_options").select("*").order("sort_order"),
      supabase.from("households").select("*").eq("id", householdId).maybeSingle(),
      supabase
        .from("household_event_invitations")
        .select("*")
        .eq("household_id", householdId),
      supabase
        .from("guests")
        .select("*")
        .eq("household_id", householdId)
        .is("archived_at", null)
        .order("sort_order"),
    ]);

  const firstError =
    eventsRes.error ||
    mealsRes.error ||
    householdRes.error ||
    invitationsRes.error ||
    guestsRes.error;
  if (firstError) {
    throw new Error(`Supabase RSVP workspace read failed: ${firstError.message}`);
  }
  if (!householdRes.data) {
    return null;
  }

  const guests = (guestsRes.data ?? []).map((row) =>
    mapGuest(row as Record<string, unknown>),
  );
  const guestIds = guests.map((guest) => guest.id);

  const responsesRes =
    guestIds.length > 0
      ? await supabase.from("guest_responses").select("*").in("guest_id", guestIds)
      : { data: [] as Record<string, unknown>[], error: null };

  if (responsesRes.error) {
    throw new Error(`Supabase RSVP workspace read failed: ${responsesRes.error.message}`);
  }

  const eventIds = (invitationsRes.data ?? []).map((row) => String(row.event_id));
  const household = mapHousehold(
    householdRes.data as Record<string, unknown>,
    eventIds,
  );

  return {
    events: (eventsRes.data ?? []).map((row) =>
      mapEvent(row as Record<string, unknown>),
    ),
    mealOptions: (mealsRes.data ?? []).map((row) =>
      mapMeal(row as Record<string, unknown>),
    ),
    households: [household],
    guests,
    responses: (responsesRes.data ?? []).map((row) =>
      mapResponse(row as Record<string, unknown>),
    ),
  };
}
