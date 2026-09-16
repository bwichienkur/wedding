# Invitation scroll background (post–drone-show opening)

After the full-screen **opening** video (`opening-animation.mp4`), the site uses a **fixed, looping** background behind the scroll column — similar to Wooow Invites.

## Files

| File | Purpose |
|------|---------|
| `public/videos/invite-scroll-bg-poster.jpg` | Still frame / reduced-motion fallback |
| `public/videos/invite-scroll-bg.mp4` | Looping background (currently a subtle Ken Burns export from the poster) |

Paths are defined in `lib/media/invite-scroll-background.ts`. Rendering lives in `components/ambient/AmbientBackground.tsx`, enabled from `HomeExperience` once the opening finishes.

## Replace with your own clip

1. Drop a high-res still into `invite-scroll-bg-poster.jpg` (portrait, navy center + side florals works best).
2. Either:
   - Export an **MP4 loop** from your editor → save as `invite-scroll-bg.mp4`, or
   - Regenerate a gentle zoom loop: `bash scripts/generate-invite-scroll-bg.sh`
3. Redeploy.

The invite **card** uses a slightly translucent cream panel so the floral video shows at the edges and through the blur; the **hero** sits outside the card so names sit directly on the animated background.
