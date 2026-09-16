#!/usr/bin/env bash
# Slow Ken Burns loop from the floral scroll poster (replace poster with your own art first).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
POSTER="$ROOT/public/videos/invite-scroll-bg-poster.jpg"
OUT="$ROOT/public/videos/invite-scroll-bg.mp4"

if [[ ! -f "$POSTER" ]]; then
  echo "Missing poster: $POSTER" >&2
  exit 1
fi

ffmpeg -y -loop 1 -framerate 30 -i "$POSTER" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.00012,1.04)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30" \
  -t 18 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"

echo "Wrote $OUT"
