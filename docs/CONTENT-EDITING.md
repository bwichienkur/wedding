# Content editing guide

Public wedding copy and logistics live in typed files under `data/`. Presentation components consume these files — do not hardcode facts in UI.

## Files

| File | Edit for |
|------|----------|
| `data/hero-slides.ts` | Homepage photo carousel fallbacks (admin uploads override when published) |
| `data/section-media.ts` | Admin placement keys for section photo/video uploads |
| `public/images/wax-seal-bl.webp` | Intro gold wax seal (B&L monogram) |
| `public/images/envelope-flap-*.webp` | Per-flap embossed botanical artwork (top/bottom/sides + glow variants) |
| `components/entry/vines/*` | Flap artwork layout (`FlapEmbossedArt`, `EnvelopeVines`) |
| `data/wedding.ts` | Names, date, venue facts, hero/closing copy, feature flags, site mode |
| `data/story.ts` | Relationship milestones and perspectives |
| `data/schedule.ts` | Wedding-day timeline |
| `data/venue.ts` | Bella Cosa address + layers (defaults; admin can override) |
| `data/travel.ts` | Airports, transport, recommendations (defaults; admin can override) |
| `data/party.ts` | Wedding party defaults (13 people; admin can add/edit/remove) |
| `data/faq.ts` | FAQ defaults (admin can add/edit/remove) |
| `data/registry.ts` | Registry note and links |
| `data/navigation.ts` | Nav labels/anchors |
| `data/video.ts` | Public video placement keys |
| `data/memories.ts` | Gallery selection (derived from story by default) |

## Rules

1. Never invent logistics. Use labeled placeholders (`Add …`, `Details coming soon`).
2. Mark incomplete fields with `*IsPlaceholder: true` where the pattern exists.
3. Confirmed facts currently safe to keep filled:
   - Bright & Lexi
   - Dating anniversary March 20, 2025
   - Wedding May 15, 2027 · Bella Cosa · Lake Wales, Florida
   - Access 9:00 AM · Photo/video 2:00 PM · Ceremony 4:00 PM · Reception 5:30 PM
4. After editing, run `npm run typecheck` and spot-check mobile.

## Media, content & RSVP

- **Section chrome (show/hide + titles):** `/admin/sections`
- **Section content (FAQ, party, venue, travel):** `/admin/content` — add, edit, and remove individual pieces
- **Photos & videos by section:** `/admin/media` — pick a page section (hero, story milestones, gallery, proposal, venue layers, party, closing), upload a photo (local) or video (Mux), then publish.
- Placement catalog: `data/section-media.ts`
- Photos are stored under `.data/uploads/` and served at `/api/media/file/<id>` (ephemeral on serverless — use Blob/CDN later for durable production photos).
- Logistics overrides persist in `.data/logistics-content.json` (or Vercel Blob `wedding/logistics-content.json` in production).
- Videos: Mux direct upload (see `docs/MUX-SETUP.md`)
- Guests: manage via `/admin/rsvp` after production DB migration (see `docs/RSVP.md`)

Repo image files under `public/images` and `data/hero-slides.ts` / `data/story.ts` remain the fallback when no published upload is assigned.
