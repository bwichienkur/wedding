# Supabase RSVP setup

When **Vercel ↔ Supabase** is connected, the app uses Postgres for RSVP automatically if these env vars exist on the deployment:

- `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`

Optional for schema apply script:

- `POSTGRES_URL` (from the Vercel integration)

## 1. Apply database schema

In the **Supabase SQL editor**, paste and run:

`supabase/migrations/202608240002_rsvp.sql`

Or locally after pulling env from Vercel:

```bash
vercel env pull .env.local
export $(grep -v '^#' .env.local | xargs)  # or use direnv
npm run db:rsvp:apply
```

## 2. Redeploy

Redeploy the Vercel project so serverless functions receive the new env vars.

## 3. Verify

1. Sign in at `/admin/login`
2. Open **`GET /api/admin/rsvp/status`** (or check **`GET /api/admin/storage-status`** → `rsvp` block)
3. Expect `ok: true` and a `householdCount` (demo seed imports automatically when tables are empty)

## 4. Test RSVP

Open `/rsvp` and search for **Bright Wichienkur** or **WICHIEN27** (demo seed).

## Local development without Supabase

If Supabase env vars are **not** set, RSVP continues to use `.data/rsvp.json` (`npm run reset:rsvp-seed`).

## Important

- Keep **`RSVP_SESSION_SECRET`** stable in production — changing it invalidates invitation code hashes and sessions. Set it on Vercel **before** the first RSVP request after enabling Supabase (demo seed hashes are computed with whatever secret is active at import time).
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- If you paste database passwords or JWT keys in chat or tickets, **rotate them** in Supabase and Vercel.
