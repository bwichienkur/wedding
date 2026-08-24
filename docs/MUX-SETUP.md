# Mux setup

This project streams proposal and relationship video through [Mux](https://www.mux.com/). Large films are never committed to Git.

## 1. Create a Mux environment

1. Create a Mux account and environment.
2. Generate an Access Token with Video permissions (`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`).
3. Create a webhook pointing to `https://YOUR_DOMAIN/api/media/webhook` for asset and upload events. Copy `MUX_WEBHOOK_SECRET`.
4. Optional for private proposal films: create a Signing Key (`MUX_SIGNING_KEY_ID`, `MUX_SIGNING_KEY_PRIVATE` as base64).

## 2. Environment variables

Copy `.env.example` and set:

```bash
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_KEY_PRIVATE=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Never commit real credentials or video files.

## 3. Admin upload flow

1. Sign in at `/admin/login` with `ADMIN_PASSWORD`.
2. Open `/admin/media`.
3. Choose category and placement (`proposal.teaser`, `proposal.highlight`, `proposal.full`, etc.).
4. Upload a video. The browser PUTs bytes directly to Mux using a server-minted URL.
5. Wait for webhook processing (`processing` → `ready`).
6. Publish when ready. Unpublished assets are not exposed on public playback routes.

## 4. Playback behavior

- Public published assets use Mux playback IDs.
- Private assets require signed playback tokens minted server-side.
- The wedding player never autoplays with sound.
- Background teasers are muted, `playsInline`, and pause when offscreen.
- Captions and transcripts can be attached per asset.

## 5. Local development without Mux

The site still builds and renders proposal UI in an unavailable/poster state. Upload APIs return `503` until Mux env vars are present.

Phase 4 stores asset metadata in `.data/media-assets.json` (gitignored). A Supabase SQL migration is prepared under `supabase/migrations/` for Phase 6+.
