# Setup

## Prerequisites

- Node.js 22+
- npm 10+
- Optional: Mux, Resend, Supabase accounts for production media/RSVP/email

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Useful scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run qa` | typecheck + lint + unit + build |

## First-run notes

- Public site runs without secrets; placeholders remain visible for missing logistics/media.
- Admin routes (`/admin`) are open in non-production when `WEDDING_ADMIN_PASSWORD` is unset. Set a password before any shared/staging deploy.
- RSVP seed data is fictional only (see `docs/RSVP.md`).
- Mux uploads require `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` (see `docs/MUX-SETUP.md`).

## Project map

- `app/` — routes and API
- `components/` — UI, sections, story, three, video, rsvp, admin
- `data/` — typed public wedding content
- `lib/` — auth, media, rsvp, email, calendar, analytics
- `docs/` — setup and operational guides
- `supabase/migrations/` — SQL ready for Postgres/Supabase
- `tests/` — unit + e2e
