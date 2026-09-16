# RSVP administration

## Guest flow

1. Open `/rsvp`
2. Enter a full name or invitation code
3. Confirm the correct household if multiple matches appear
4. Respond for each invited guest and event
5. Add meals (when attending), dietary needs, accessibility needs
6. Optional song request and message
7. Review and confirm

Demo seed (fictional only):

- Name: `Alex Rivera` or code `RIVERA27`
- Name: **`Bright Wichienkur`** or code **`WICHIEN27`** (solo example)
- Name: **`Bright Wichienkur`** / **`Lexi Wichienkur`** or code **`BRIGHTLEX27`** (couple example — two households match “Bright Wichienkur”; pick the right card)
- Name: `Jordan Lee` or code `LEE2027` (includes unnamed plus-one)
- Name: `Sam Nguyen` / `Casey Nguyen` or code `NGUYEN27` (ceremony + rehearsal)
- Duplicate last name demo: `Taylor Brooks` / `Morgan Brooks`

After changing seed guests locally, run `npm run reset:rsvp-seed` and restart the dev server so `.data/rsvp.json` is rebuilt.

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

Phase 6 stores RSVP data in `.data/rsvp.json` (gitignored) seeded with fictional households. Supabase SQL is prepared in `supabase/migrations/202608240002_rsvp.sql`.
