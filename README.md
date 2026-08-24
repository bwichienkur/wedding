# Bright & Lexi — Wedding Website

Editorial wedding experience for **Bright & Lexi** · May 15, 2027 · Bella Cosa, Lake Wales, Florida.

## Status

**Phase 2 — Foundation** in progress on this branch.

- Phase 1 design proposal: [`docs/PHASE-1-DESIGN-PROPOSAL.md`](./docs/PHASE-1-DESIGN-PROPOSAL.md)
- Stack: Next.js App Router, TypeScript strict, Tailwind CSS, Motion, Vitest

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
- `data/navigation.ts` — nav items

Never invent logistics. Use clearly labeled placeholders until real content is supplied.

## Environment

Copy `.env.example` when configuring later phases (Supabase, Mux, Resend). Phase 2 runs without secrets.
