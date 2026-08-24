# Deployment (Vercel-compatible)

## Recommended platform

Deploy on Vercel (or any Node host that supports Next.js App Router).

## Steps

1. Create a Vercel project from this repository.
2. Set environment variables from `.env.example` (never commit `.env.local`).
3. Deploy the production branch.
4. Point the custom domain and update:
   - `NEXT_PUBLIC_SITE_URL`
   - `data/wedding.ts` → `site.canonicalUrl`
5. Configure Mux webhook to `https://YOUR_DOMAIN/api/media/webhook`.
6. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` before sharing the URL.
7. Optionally enable email with Resend (`EMAIL_ENABLED=true`).

## Environment checklist

| Variable | Required for |
|----------|--------------|
| `NEXT_PUBLIC_SITE_URL` | Absolute links, CORS for Mux uploads |
| `ADMIN_PASSWORD` | Production admin lock |
| `ADMIN_SESSION_SECRET` | Signed admin sessions |
| `RSVP_SESSION_SECRET` | Household RSVP sessions |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | Video uploads |
| `MUX_WEBHOOK_SECRET` | Webhook verification |
| `MUX_SIGNING_KEY_*` | Private video playback |
| `RESEND_API_KEY` / `EMAIL_FROM` | RSVP emails |
| `EMAIL_ENABLED` | Must be `true` to send |

## Persistence note

Phase 6/4 local JSON stores (`.data/*.json`) are fine for development. For production, migrate media + RSVP stores to Supabase using the SQL in `supabase/migrations/` and replace the file-backed repositories. Do not rely on ephemeral serverless disk for guest responses.

## Post-deploy smoke test

1. `/` loads and skip-intro works
2. `/rsvp` lookup with a seed name (staging only) or a real invite code (production)
3. `/admin/login` rejects bad passwords
4. Schedule ICS download works
5. FAQ deep links work
6. robots/sitemap reflect site mode
