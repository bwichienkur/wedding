# Bright & Lexi — Wedding Website

Editorial wedding experience for **Bright & Lexi** · May 15, 2027 · Bella Cosa, Lake Wales, Florida.

## Status

Phases 1–6 are in progress across PRs:

1. Design proposal — `docs/PHASE-1-DESIGN-PROPOSAL.md`
2. Foundation — tokens, nav, entry, hero, story
3. Golden Thread + signature 3D experiences
4. Mux video, custom player, admin media
5. Wedding day, venue, travel, party, FAQ, registry, closing
6. Secure RSVP + admin export

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin (local): [/admin](http://localhost:3000/admin) — set `ADMIN_PASSWORD` before production.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

## Content editing

Public wedding facts live in typed files under `data/`:

- `data/wedding.ts` — couple, date, venue, flags, copy
- `data/story.ts` — relationship milestones
- `data/schedule.ts` — wedding-day journey
- `data/venue.ts` — Bella Cosa details
- `data/travel.ts` — airports, hotels, local notes
- `data/party.ts` — wedding party
- `data/faq.ts` — FAQ
- `data/registry.ts` — registry links
- `data/navigation.ts` — nav items
- `data/video.ts` — public video placements

Never invent logistics. Use clearly labeled placeholders until real content is supplied.

## Video / Mux

See [`docs/MUX-SETUP.md`](./docs/MUX-SETUP.md). Large films are never stored in Git.

## RSVP

See [`docs/RSVP.md`](./docs/RSVP.md). Demo lookups use fictional names only (e.g. `Alex Rivera` / `RIVERA27`).

## Environment

Copy `.env.example`. Phase 4 needs Mux + admin password for uploads; the public site still runs without them (proposal player shows unavailable/poster states).
