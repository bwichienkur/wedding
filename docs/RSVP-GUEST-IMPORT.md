# Importing your guest list (RSVP)

The site does **not** expose a “upload CSV” button in `/admin/rsvp` yet. You manage who can RSVP by loading **households** and **guests** into the RSVP store (local JSON or Supabase). The admin panel is for **search, review, and export** after guests exist.

## What gets stored

Each **household** (invitation unit) has:

- `display_name` — shown after lookup (“The Rivera Family”)
- Optional **invitation code** — guests can search by name or code
- `email`, `phone`, admin notes
- Which **events** they’re invited to (ceremony, rehearsal, etc.)

Each **guest** belongs to one household (full name, child/plus-one flags).

Invitation codes are stored **hashed** server-side (`RSVP_SESSION_SECRET` must stay stable in production).

## Option A — Local development (`.data/rsvp.json`)

1. Edit fictional/demo data in `lib/rsvp/seed.ts`, **or** merge your real list into that structure (`households`, `guests`, `eventIds`).
2. Reset the file:
   ```bash
   npm run reset:rsvp-seed
   ```
3. Restart `npm run dev` and test at `/rsvp`.

Use **only fictional names** in git; keep real guest data in Supabase or a private CSV, not committed.

## Option B — Production (Supabase)

1. Apply `supabase/migrations/202608240002_rsvp.sql` (see `docs/SUPABASE-RSVP.md`).
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and **`RSVP_SESSION_SECRET`** on Vercel **before** importing codes.
3. If tables are empty, the app auto-imports the **demo seed** once. For a real list, **clear demo rows** (or use a fresh project) then insert your data.

### CSV → Supabase (recommended workflow)

1. Export from Zola, Google Sheets, or your planner as CSV with columns like:

   | household_name | guest_name | invitation_code | email | event_slugs |
   |----------------|------------|-----------------|-------|-------------|
   | Alex & Riley Rivera | Alex Rivera | RIVERA27 | alex@… | ceremony-reception |
   | Alex & Riley Rivera | Riley Rivera | | | ceremony-reception |

2. Hash each invitation code the same way the app does (Node, with your production `RSVP_SESSION_SECRET`):

   ```js
   import { createHash } from "crypto";
   const secret = process.env.RSVP_SESSION_SECRET;
   function hash(code) {
     return createHash("sha256")
       .update(`${secret}:invite:${code.trim().toUpperCase()}`)
       .digest("hex");
   }
   ```

3. Insert into Supabase tables:
   - `households` — one row per invitation
   - `guests` — one row per person (`household_id`, `full_name`, `normalized_name` lowercased/trimmed)
   - `household_event_invitations` — link household to `events.id` (e.g. `event-ceremony-reception` from seed)

4. Verify: `/admin/rsvp` and lookup on `/rsvp`.

### Helper script (local JSON only)

For **local** testing without Supabase, you can import a CSV into `.data/rsvp.json`:

```bash
# Requires RSVP_SESSION_SECRET in env (or uses dev default)
node scripts/import-rsvp-guests.mjs path/to/guests.csv
npm run dev
```

See `scripts/import-rsvp-guests.mjs` for the expected CSV columns. **Do not run this against production Supabase** without adapting it to use the service role API.

## Option C — Zola guest list

Zola does not push guest names into this repo automatically. Typical flow:

1. Export guest / invite list from Zola (or copy into a spreadsheet).
2. Map to the CSV format above.
3. Load into Supabase (production) or local seed (development).

RSVP **responses** still flow through your site; Zola remains useful for registry messaging, not as the source of truth for this RSVP database unless you sync manually.

## Admin after import

1. `/admin/login`
2. `/admin/rsvp` — filter, search, export CSV of **responses**
3. Share invitation codes (or names) with guests for `/rsvp`

## Need bulk import in the admin UI?

That would be a new feature (CSV upload → validate → Supabase). Until then, use Supabase SQL/Table Editor or the local CSV script above.
