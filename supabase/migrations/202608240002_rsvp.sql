-- RSVP schema (Supabase / PostgreSQL)
-- Phase 6 uses a local JSON store with matching fields; apply this when wiring Supabase.

create extension if not exists "pgcrypto";

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  starts_at timestamptz,
  location text,
  is_adults_only boolean not null default false,
  allows_plus_ones boolean not null default true,
  collect_meals boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  invitation_code_hash text,
  invitation_code_hint text,
  email text,
  phone text,
  notes_admin text not null default '',
  rsvp_status text not null check (rsvp_status in ('pending', 'partial', 'complete', 'declined')),
  max_plus_ones integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  full_name text not null,
  normalized_name text not null,
  is_child boolean not null default false,
  is_plus_one boolean not null default false,
  plus_one_named boolean not null default true,
  sort_order integer not null default 0,
  archived_at timestamptz
);

create index if not exists guests_normalized_name_idx on guests (normalized_name);
create index if not exists households_invitation_code_hash_idx on households (invitation_code_hash);

create table if not exists household_event_invitations (
  household_id uuid not null references households(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  primary key (household_id, event_id)
);

create table if not exists meal_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  label text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists guest_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  attending text not null check (attending in ('yes', 'no', 'unknown')),
  meal_option_id uuid references meal_options(id),
  dietary_notes text not null default '',
  accessibility_notes text not null default '',
  unique (guest_id, event_id)
);

create table if not exists rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  submitted_by text not null check (submitted_by in ('guest', 'admin')),
  admin_user_id text,
  song_request text not null default '',
  message_to_couple text not null default '',
  ip_hash text,
  user_agent_hash text
);

create table if not exists rsvp_update_history (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  payload_json jsonb not null,
  changed_by text not null,
  admin_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_admin_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
