-- Media assets schema (Supabase / PostgreSQL)
-- Apply in Phase 6+ when wiring the database. Phase 4 uses a local JSON store
-- with the same fields so the presentation layer stays stable.

create extension if not exists "pgcrypto";

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  mux_asset_id text,
  mux_playback_id text,
  mux_upload_id text,
  status text not null check (status in ('waiting', 'uploading', 'processing', 'ready', 'errored', 'archived')),
  category text not null,
  title text not null,
  description text not null default '',
  media_date date,
  poster_url text,
  custom_poster_path text,
  duration_seconds numeric,
  aspect_ratio text,
  captions_url text,
  transcript text not null default '',
  chapters_json jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  is_private boolean not null default false,
  sort_order integer not null default 0,
  story_moment_id text,
  placement_key text,
  error_message text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists media_assets_status_published_idx
  on media_assets (status, is_published);

create index if not exists media_assets_placement_idx
  on media_assets (placement_key);

create table if not exists media_placements (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null references media_assets (id) on delete cascade,
  placement_key text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists media_placements_key_asset_uidx
  on media_placements (placement_key, media_asset_id);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_admin_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
