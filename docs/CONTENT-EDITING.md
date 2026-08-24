# Content editing guide

Public wedding copy and logistics live in typed files under `data/`. Presentation components consume these files — do not hardcode facts in UI.

## Files

| File | Edit for |
|------|----------|
| `data/hero-slides.ts` | Homepage photo carousel fallbacks (admin uploads override when published) |
| `data/section-media.ts` | Admin placement keys for section photo/video uploads |
| `data/wedding.ts` | Names, date, venue facts, hero/closing copy, feature flags, site mode |
| `data/story.ts` | Relationship milestones and perspectives |
| `data/schedule.ts` | Wedding-day timeline |
| `data/venue.ts` | Bella Cosa address, parking, accessibility, layers |
| `data/travel.ts` | Airports, hotels, transport, recommendations |
| `data/party.ts` | Wedding party |
| `data/faq.ts` | FAQ questions/answers |
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
   - Access 9:00 AM · Photo/video 2:00 PM · Ceremony 4:00 PM
   - Plated dinner; toasts; dancing; sparkler sendoff
4. After editing, run `npm run typecheck` and spot-check mobile.

## Media & RSVP

- **Photos & videos by section:** `/admin/media` — pick a page section (hero, story milestones, gallery, proposal, venue layers, party, closing), upload a photo (local) or video (Mux), then publish.
- Placement catalog: `data/section-media.ts`
- Photos are stored under `.data/uploads/` and served at `/api/media/file/<id>` (ephemeral on serverless — use Blob/CDN later for durable production photos).
- Videos: Mux direct upload (see `docs/MUX-SETUP.md`)
- Guests: manage via `/admin/rsvp` after production DB migration (see `docs/RSVP.md`)

Repo image files under `public/images` and `data/hero-slides.ts` / `data/story.ts` remain the fallback when no published upload is assigned.
