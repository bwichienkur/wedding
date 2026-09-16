import "server-only";

import { getSupabaseAdmin } from "@/lib/rsvp/supabase-client";
import { ensureSupabaseRsvpSeed } from "@/lib/rsvp/seed-supabase";
import type {
  AuditLog,
  Guest,
  GuestResponse,
  Household,
  MealOption,
  RsvpDatabase,
  RsvpSubmission,
  RsvpUpdateHistory,
  EventRecord,
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

export async function readRsvpDbSupabase(): Promise<RsvpDatabase> {
  await ensureSupabaseRsvpSeed();
  const supabase = getSupabaseAdmin();

  const [
    eventsRes,
    mealsRes,
    householdsRes,
    invitationsRes,
    guestsRes,
    responsesRes,
    submissionsRes,
    historyRes,
    auditRes,
  ] = await Promise.all([
    supabase.from("events").select("*").order("sort_order"),
    supabase.from("meal_options").select("*").order("sort_order"),
    supabase.from("households").select("*"),
    supabase.from("household_event_invitations").select("*"),
    supabase.from("guests").select("*").is("archived_at", null),
    supabase.from("guest_responses").select("*"),
    supabase.from("rsvp_submissions").select("*"),
    supabase.from("rsvp_update_history").select("*"),
    supabase.from("audit_logs").select("*"),
  ]);

  const firstError =
    eventsRes.error ||
    mealsRes.error ||
    householdsRes.error ||
    invitationsRes.error ||
    guestsRes.error ||
    responsesRes.error ||
    submissionsRes.error ||
    historyRes.error ||
    auditRes.error;

  if (firstError) {
    throw new Error(`Supabase RSVP read failed: ${firstError.message}`);
  }

  const eventIdsByHousehold = new Map<string, string[]>();
  for (const row of invitationsRes.data ?? []) {
    const householdId = String(row.household_id);
    const list = eventIdsByHousehold.get(householdId) ?? [];
    list.push(String(row.event_id));
    eventIdsByHousehold.set(householdId, list);
  }

  const households = (householdsRes.data ?? []).map((row) =>
    mapHousehold(
      row as Record<string, unknown>,
      eventIdsByHousehold.get(String(row.id)) ?? [],
    ),
  );

  return {
    events: (eventsRes.data ?? []).map((row) =>
      mapEvent(row as Record<string, unknown>),
    ),
    mealOptions: (mealsRes.data ?? []).map((row) =>
      mapMeal(row as Record<string, unknown>),
    ),
    households,
    guests: (guestsRes.data ?? []).map((row) =>
      mapGuest(row as Record<string, unknown>),
    ),
    responses: (responsesRes.data ?? []).map((row) =>
      mapResponse(row as Record<string, unknown>),
    ),
    submissions: (submissionsRes.data ?? []).map(
      (row): RsvpSubmission => ({
        id: String(row.id),
        householdId: String(row.household_id),
        submittedAt: String(row.submitted_at),
        submittedBy: row.submitted_by as RsvpSubmission["submittedBy"],
        songRequest: String(row.song_request ?? ""),
        messageToCouple: String(row.message_to_couple ?? ""),
        ipHash: (row.ip_hash as string | null) ?? null,
      }),
    ),
    history: (historyRes.data ?? []).map(
      (row): RsvpUpdateHistory => ({
        id: String(row.id),
        householdId: String(row.household_id),
        payloadJson:
          typeof row.payload_json === "string"
            ? row.payload_json
            : JSON.stringify(row.payload_json ?? {}),
        changedBy: row.changed_by as RsvpUpdateHistory["changedBy"],
        createdAt: String(row.created_at),
      }),
    ),
    auditLogs: (auditRes.data ?? []).map((row): AuditLog => {
      const meta =
        typeof row.metadata_json === "object" && row.metadata_json !== null
          ? (row.metadata_json as Record<string, unknown>)
          : {};
      const actorFromMeta =
        typeof meta.actor === "string" ? meta.actor : undefined;
      return {
        id: String(row.id),
        actor: actorFromMeta ?? String(row.actor_admin_id ?? "system"),
        action: String(row.action),
        entityType: String(row.entity_type),
        entityId: (row.entity_id as string | null) ?? null,
        metadataJson: JSON.stringify(meta),
        createdAt: String(row.created_at),
      };
    }),
  };
}

export async function saveHouseholdResponsesSupabase(options: {
  householdId: string;
  responses: GuestResponse[];
  submission: Omit<RsvpSubmission, "id">;
  history: Omit<RsvpUpdateHistory, "id">;
  audit: Omit<AuditLog, "id">;
  householdStatus: Household["rsvpStatus"];
  guestNameUpdates?: Array<{ guestId: string; fullName: string; normalizedName: string }>;
}): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: guestRows, error: guestLookupError } = await supabase
    .from("guests")
    .select("id")
    .eq("household_id", options.householdId);
  if (guestLookupError) throw new Error(guestLookupError.message);

  const guestIds = (guestRows ?? []).map((row) => String(row.id));

  if (guestIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("guest_responses")
      .delete()
      .in("guest_id", guestIds);
    if (deleteError) throw new Error(deleteError.message);
  }

  if (options.responses.length > 0) {
    const { error: insertError } = await supabase.from("guest_responses").insert(
      options.responses.map((response) => ({
        id: response.id,
        guest_id: response.guestId,
        event_id: response.eventId,
        attending: response.attending,
        meal_option_id: response.mealOptionId,
        dietary_notes: response.dietaryNotes,
        accessibility_notes: response.accessibilityNotes,
      })),
    );
    if (insertError) throw new Error(insertError.message);
  }

  if (options.guestNameUpdates?.length) {
    for (const update of options.guestNameUpdates) {
      const { error } = await supabase
        .from("guests")
        .update({
          full_name: update.fullName,
          normalized_name: update.normalizedName,
        })
        .eq("id", update.guestId);
      if (error) throw new Error(error.message);
    }
  }

  const now = new Date().toISOString();
  const { error: householdError } = await supabase
    .from("households")
    .update({
      rsvp_status: options.householdStatus,
      updated_at: now,
    })
    .eq("id", options.householdId);
  if (householdError) throw new Error(householdError.message);

  const { error: submissionError } = await supabase.from("rsvp_submissions").insert({
    household_id: options.submission.householdId,
    submitted_at: options.submission.submittedAt,
    submitted_by: options.submission.submittedBy,
    song_request: options.submission.songRequest,
    message_to_couple: options.submission.messageToCouple,
    ip_hash: options.submission.ipHash,
  });
  if (submissionError) throw new Error(submissionError.message);

  const { error: historyError } = await supabase.from("rsvp_update_history").insert({
    household_id: options.history.householdId,
    payload_json: JSON.parse(options.history.payloadJson) as object,
    changed_by: options.history.changedBy,
    created_at: options.history.createdAt,
  });
  if (historyError) throw new Error(historyError.message);

  const { error: auditError } = await supabase.from("audit_logs").insert({
    action: options.audit.action,
    entity_type: options.audit.entityType,
    entity_id: options.audit.entityId,
    metadata_json: {
      ...(JSON.parse(options.audit.metadataJson) as object),
      actor: options.audit.actor,
    },
    created_at: options.audit.createdAt,
  });
  if (auditError) throw new Error(auditError.message);
}

export async function appendAuditSupabase(
  entry: Omit<AuditLog, "id">,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("audit_logs").insert({
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    metadata_json: JSON.parse(entry.metadataJson) as object,
    created_at: entry.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function updateHouseholdAdminSupabase(
  householdId: string,
  patch: Partial<Pick<Household, "notesAdmin" | "rsvpStatus" | "email">>,
): Promise<Household | null> {
  const db = await readRsvpDbSupabase();
  const existing = db.households.find((item) => item.id === householdId);
  if (!existing) return null;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("households")
    .update({
      notes_admin: patch.notesAdmin ?? existing.notesAdmin,
      rsvp_status: patch.rsvpStatus ?? existing.rsvpStatus,
      email: patch.email ?? existing.email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", householdId);
  if (error) throw new Error(error.message);

  const refreshed = await readRsvpDbSupabase();
  return refreshed.households.find((item) => item.id === householdId) ?? null;
}

export async function createHouseholdAdminSupabase(options: {
  household: Household;
  guests: Guest[];
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { household, guests } = options;
  const { error: hErr } = await supabase.from("households").insert({
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
  });
  if (hErr) throw new Error(hErr.message);

  const invitations = household.eventIds.map((eventId) => ({
    household_id: household.id,
    event_id: eventId,
  }));
  if (invitations.length > 0) {
    const { error: invErr } = await supabase
      .from("household_event_invitations")
      .insert(invitations);
    if (invErr) throw new Error(invErr.message);
  }

  if (guests.length > 0) {
    const { error: gErr } = await supabase.from("guests").insert(
      guests.map((guest) => ({
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
    if (gErr) throw new Error(gErr.message);
  }
}

export async function deleteHouseholdAdminSupabase(
  householdId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("households")
    .delete()
    .eq("id", householdId);
  if (error) throw new Error(error.message);
}

export async function createGuestAdminSupabase(guest: Guest): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("guests")
    .select("sort_order")
    .eq("household_id", guest.householdId);
  const sortOrder = (existing?.length ?? 0) + 1;
  const { error } = await supabase.from("guests").insert({
    id: guest.id,
    household_id: guest.householdId,
    full_name: guest.fullName,
    normalized_name: guest.normalizedName,
    is_child: guest.isChild,
    is_plus_one: guest.isPlusOne,
    plus_one_named: guest.plusOneNamed,
    sort_order: sortOrder,
  });
  if (error) throw new Error(error.message);
  await supabase
    .from("households")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", guest.householdId);
}

export async function deleteGuestAdminSupabase(guestId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("guests").delete().eq("id", guestId);
  if (error) throw new Error(error.message);
}

export async function updateHouseholdAdminRecordSupabase(
  householdId: string,
  patch: Partial<
    Pick<
      Household,
      | "displayName"
      | "email"
      | "phone"
      | "notesAdmin"
      | "invitationCodeHash"
      | "invitationCodeHint"
    >
  >,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.notesAdmin !== undefined) row.notes_admin = patch.notesAdmin;
  if (patch.invitationCodeHash !== undefined) {
    row.invitation_code_hash = patch.invitationCodeHash;
  }
  if (patch.invitationCodeHint !== undefined) {
    row.invitation_code_hint = patch.invitationCodeHint;
  }
  const { error } = await supabase
    .from("households")
    .update(row)
    .eq("id", householdId);
  if (error) throw new Error(error.message);
}

export async function updateGuestAdminSupabase(
  guestId: string,
  patch: Partial<Pick<Guest, "fullName" | "normalizedName" | "isChild">>,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.normalizedName !== undefined) row.normalized_name = patch.normalizedName;
  if (patch.isChild !== undefined) row.is_child = patch.isChild;
  const { error } = await supabase.from("guests").update(row).eq("id", guestId);
  if (error) throw new Error(error.message);
}
