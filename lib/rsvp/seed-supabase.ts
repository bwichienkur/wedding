import "server-only";

import { createSeedDatabase } from "@/lib/rsvp/seed";
import { getSupabaseAdmin } from "@/lib/rsvp/supabase-client";
import type { RsvpDatabase } from "@/lib/rsvp/types";

export async function ensureSupabaseRsvpSeed(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("households")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Supabase households check failed: ${error.message}`);
  }
  if ((count ?? 0) > 0) {
    return;
  }

  const db = createSeedDatabase();
  await importSeedDatabase(db);
}

async function importSeedDatabase(db: RsvpDatabase): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error: eventsError } = await supabase.from("events").insert(
    db.events.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      starts_at: event.startsAt,
      location: event.location,
      is_adults_only: event.isAdultsOnly,
      allows_plus_ones: event.allowsPlusOnes,
      collect_meals: event.collectMeals,
      sort_order: event.sortOrder,
    })),
  );
  if (eventsError) throw new Error(eventsError.message);

  const { error: mealsError } = await supabase.from("meal_options").insert(
    db.mealOptions.map((meal) => ({
      id: meal.id,
      event_id: meal.eventId,
      label: meal.label,
      description: meal.description,
      sort_order: meal.sortOrder,
      is_active: meal.isActive,
    })),
  );
  if (mealsError) throw new Error(mealsError.message);

  const { error: householdsError } = await supabase.from("households").insert(
    db.households.map((household) => ({
      id: household.id,
      display_name: household.displayName,
      invitation_code_hash: household.invitationCodeHash,
      invitation_code_hint: household.invitationCodeHint,
      email: household.email,
      phone: household.phone,
      notes_admin: household.notesAdmin,
      rsvp_status: household.rsvpStatus,
      max_plus_ones: household.maxPlusOnes,
      created_at: household.createdAt,
      updated_at: household.updatedAt,
    })),
  );
  if (householdsError) throw new Error(householdsError.message);

  const invitations = db.households.flatMap((household) =>
    household.eventIds.map((eventId) => ({
      household_id: household.id,
      event_id: eventId,
    })),
  );
  if (invitations.length > 0) {
    const { error: invError } = await supabase
      .from("household_event_invitations")
      .insert(invitations);
    if (invError) throw new Error(invError.message);
  }

  const { error: guestsError } = await supabase.from("guests").insert(
    db.guests.map((guest) => ({
      id: guest.id,
      household_id: guest.householdId,
      full_name: guest.fullName,
      normalized_name: guest.normalizedName,
      is_child: guest.isChild,
      is_plus_one: guest.isPlusOne,
      plus_one_named: guest.plusOneNamed,
      sort_order: guest.sortOrder,
    })),
  );
  if (guestsError) throw new Error(guestsError.message);
}
