# Invitation scroll background (post–drone-show opening)

After the full-screen **opening** video (`opening-animation.mp4`), the site uses a **fixed, looping** background behind the scroll column — similar to Wooow Invites.

## Files

| File | Purpose |
|------|---------|
| `public/videos/openart-scroll-bg.mp4` | OpenArt floral loop (primary background) |
| `public/videos/openart-scroll-bg-poster.jpg` | Still frame / reduced-motion fallback |

Paths are defined in `lib/media/invite-scroll-background.ts`. Rendering lives in `components/ambient/AmbientBackground.tsx`, enabled from `HomeExperience` **after the opening intro finishes** (so the drone show is not covered early).

## Replace the loop

1. Export your clip as `public/videos/openart-scroll-bg.mp4` (portrait-friendly loops work best).
2. Refresh the poster: `ffmpeg -y -i public/videos/openart-scroll-bg.mp4 -frames:v 1 -update 1 public/videos/openart-scroll-bg-poster.jpg`
3. Redeploy.

The invite **card** uses a glassy navy panel (~40% opacity) with **gold** typography so the video shows through.
