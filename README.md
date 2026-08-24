# Bright & Lexi — Wedding Website

Editorial wedding experience for **Bright & Lexi** · May 15, 2027 · Bella Cosa, Lake Wales, Florida.

Concept: **The Golden Thread** — an interactive love story that remains a practical guest guide.

## Status

Phases 1–7 implemented across PRs (foundation → story/3D → video → logistics → RSVP → polish/QA).

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo RSVP (fictional): `/rsvp` → `Alex Rivera` or `RIVERA27`

## Documentation

| Guide | Path |
|-------|------|
| Setup | [`docs/SETUP.md`](./docs/SETUP.md) |
| Deployment | [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) |
| Content editing | [`docs/CONTENT-EDITING.md`](./docs/CONTENT-EDITING.md) |
| Asset checklist | [`docs/ASSET-CHECKLIST.md`](./docs/ASSET-CHECKLIST.md) |
| Mux / video | [`docs/MUX-SETUP.md`](./docs/MUX-SETUP.md) |
| RSVP | [`docs/RSVP.md`](./docs/RSVP.md) |
| Security | [`docs/SECURITY.md`](./docs/SECURITY.md) |
| Testing | [`docs/TESTING.md`](./docs/TESTING.md) |
| Known limitations | [`docs/KNOWN-LIMITATIONS.md`](./docs/KNOWN-LIMITATIONS.md) |
| Remaining content | [`docs/REMAINING-CONTENT.md`](./docs/REMAINING-CONTENT.md) |
| Phase 1 design | [`docs/PHASE-1-DESIGN-PROPOSAL.md`](./docs/PHASE-1-DESIGN-PROPOSAL.md) |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run qa` | typecheck + lint + unit + build |

## Stack

Next.js App Router · React · TypeScript · Tailwind · Motion · React Three Fiber · Zod · Mux · Resend · Vitest · Playwright · Vercel-compatible
