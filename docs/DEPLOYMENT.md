# Deployment (Vercel)

## Option A — Vercel GitHub integration (recommended)

1. Sign in at [vercel.com](https://vercel.com) and **Add New → Project**.
2. Import **`bwichienkur/wedding`** from GitHub.
3. Framework preset: **Next.js** (auto-detected). Build command: `npm run build`. Install: `npm ci`.
4. Add environment variables from `.env.example` (Production + Preview):
   - `NEXT_PUBLIC_SITE_URL` → your Vercel URL or custom domain
   - `WEDDING_ADMIN_PASSWORD`, `WEDDING_ADMIN_SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `RSVP_SESSION_SECRET` (required before sharing publicly)
   - Mux / Resend vars when video and email are ready
5. Deploy. Every push to **`main`** triggers a production deployment; PRs get preview URLs.

After the first deploy, update:

- Vercel **Settings → Environment Variables** → `NEXT_PUBLIC_SITE_URL`
- `data/wedding.ts` → `site.canonicalUrl` (or keep in sync with your domain)

Configure Mux webhook to `https://YOUR_DOMAIN/api/media/webhook`.

## Option B — GitHub Actions deploy (optional)

If you prefer deploys via Actions instead of (or in addition to) the Vercel GitHub app, add these **repository secrets**:

| Secret | Where to find it |
|--------|------------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Project **Settings → General** (team/personal id) |
| `VERCEL_PROJECT_ID` | Same page, **Project ID** |

The workflow `.github/workflows/deploy-vercel.yml` runs when repository variable `VERCEL_DEPLOY_ENABLED=true` and the three secrets above are set. Until then it is skipped — use Option A.

## CI

GitHub Actions runs on every push/PR to `main`:

- **`ci.yml`** — `npm run qa` (typecheck, lint, unit, build) + Playwright e2e

See [`docs/TESTING.md`](./TESTING.md).

## Environment checklist

| Variable | Required for |
|----------|--------------|
| `NEXT_PUBLIC_SITE_URL` | Absolute links, CORS for Mux uploads |
| `WEDDING_ADMIN_PASSWORD` | Production admin lock |
| `WEDDING_ADMIN_SESSION_SECRET` | Signed admin sessions |
| `BLOB_READ_WRITE_TOKEN` | Persistent photo uploads (Vercel Blob) |
| `RSVP_SESSION_SECRET` | Household RSVP sessions |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | Video uploads |
| `MUX_WEBHOOK_SECRET` | Webhook verification |
| `MUX_SIGNING_KEY_*` | Private video playback |
| `RESEND_API_KEY` / `EMAIL_FROM` | RSVP emails |
| `EMAIL_ENABLED` | Must be `true` to send |

## Persistence note

Photo uploads and media metadata use **Vercel Blob** in production when `BLOB_READ_WRITE_TOKEN` is set (Vercel → Storage → Blob → Connect to project). Without it, uploads on Vercel are ephemeral and will not persist.

File-backed `.data/*.json` stores work for local development only. For production RSVP data, migrate to Supabase using `supabase/migrations/` before relying on guest data in production.

## Post-deploy smoke test

1. `/` loads; intro skip works; reduced-motion path works
2. `/rsvp` lookup (seed names in staging only, or real invite codes in production)
3. `/admin/login` rejects bad passwords when `WEDDING_ADMIN_PASSWORD` is set
4. Schedule ICS download works
5. FAQ search and deep links work
6. `robots.txt` / `sitemap.xml` reflect site mode

## Vercel deployment failed (GitHub shows red X)

If **`npm run qa` passes in GitHub Actions** but the Vercel GitHub check says **Deployment has failed**:

1. Open the deployment in Vercel → **Build logs** (link from the failed GitHub commit status).
2. Confirm **Build and Deployment → Node.js Version** is **22.x** (this repo pins `"engines": { "node": "22.x" }` in `package.json`).
3. Confirm **Root Directory** is empty (this is a single Next.js app, not a monorepo).
4. Production builds use **`npm run build:vercel`** (`next build --webpack`) via `vercel.json` so the platform builder accepts the output (Next.js 16 defaults to Turbopack, which can fail the post-build deploy step on some builder versions).
5. **Redeploy** after fixing settings, or push a new commit to `main`.

If logs show **`@vercel/next` does not support the version of Next.js**, remove any custom **`builds`** / **`functions`** overrides in the Vercel dashboard that pin an old builder; rely on the Next.js framework preset and this repo’s `vercel.json` only.
