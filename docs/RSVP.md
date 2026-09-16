# RSVP administration

## Guest flow

1. Open `/rsvp`
2. Enter a full name or invitation code
3. Confirm the correct household if multiple matches appear
4. For each guest, choose **ceremony & welcome party**, **ceremony only**, **welcome party only**, or **can’t attend**
5. Add dietary and accessibility notes when attending either event
6. Optional message to the couple
7. Review and confirm

There are **no demo guests** in production seed data. Import your real list (see below) or use a CSV import locally.

After changing `lib/rsvp/seed.ts` event definitions, run `npm run reset:rsvp-seed` and restart the dev server.

**Importing a real guest list:** see [`docs/RSVP-GUEST-IMPORT.md`](./RSVP-GUEST-IMPORT.md) (CSV → local JSON or Supabase). Admin `/admin/rsvp` is for managing responses, not bulk import.

## Security model

- Guest list never ships to the browser
- Lookup and submit are server-side with Zod validation
- Rate limiting on lookup/submit
- Household session cookie after successful selection
- Invitation codes stored hashed
- Generic errors when rate-limited

## Admin

1. Sign in at `/admin/login`
2. Open `/admin/rsvp`
3. Filter by status, search households, review dietary/accessibility/songs
4. Export CSV

## Email

Set `EMAIL_ENABLED=true`, `RESEND_API_KEY`, and `EMAIL_FROM` to send confirmation emails. Local/test runs skip sending unless explicitly enabled.

## Data

Local development uses `.data/rsvp.json` (gitignored). Production should use Supabase (`supabase/migrations/202608240002_rsvp.sql`).

If Supabase already has old demo guests or a **rehearsal dinner** event, replace events with **Welcome Party** and **Ceremony & Reception** and clear demo households before go-live.
