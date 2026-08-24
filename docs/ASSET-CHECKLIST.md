# Asset checklist

Replace placeholders with approved photography and films. Never commit large originals to Git — prefer optimized delivery (Mux for video, CDN/`next/image` for photos).

| Asset | Orientation | Aspect | Min resolution | Format | Max size (guide) | Focal point | Accessibility |
|-------|-------------|--------|----------------|--------|------------------|-------------|---------------|
| Hero slideshow photos (3–6) | Mixed; crop works on mobile | 4:5 mobile / 16:9 desktop | 2400px long edge | AVIF/WebP/JPEG | ≤300KB each | Faces mid-upper | Meaningful `alt` in `data/hero-slides.ts` |
| Hero photo | Landscape + mobile crop | 16:9 / 4:5 | 2400px long edge | AVIF/WebP/JPEG | ≤300KB mobile / ≤600KB desktop | Faces mid-upper | Meaningful `alt` |
| Story photos | Mixed | 3:2, 4:5 | 1600px | AVIF/WebP | ≤250KB | Set in `data/story.ts` | `alt` + optional caption |
| Proposal stills | Mixed | — | 2000px | AVIF/WebP | ≤300KB | Subject-centered | `alt` |
| Proposal poster | Landscape or portrait | Match film | 1920px | JPEG/WebP | ≤400KB | Readable when letterboxed | Decorative if title nearby |
| Proposal teaser | Portrait or landscape | 9:16 / 16:9 | Mux ingest | — | Streamed | — | Captions + transcript |
| Proposal highlight | Same | Same | Mux ingest | — | Streamed | — | Captions + transcript |
| Proposal full film | Same | Same | Mux ingest | — | Streamed | — | Captions + transcript |
| Venue layers | Landscape | 16:9 | 2400px | AVIF/WebP | ≤350KB each | Aligned horizons | `alt` describing layer |
| Party portraits | Portrait | 4:5 | 1200px | AVIF/WebP | ≤200KB | Eyes ~⅓ from top | Name in adjacent text |
| Monogram | — | Square SVG | Vector | SVG | ≤20KB | Centered | Accessible title/label |
| Favicon / Apple | — | 1:1 | 512 / 180 | PNG/SVG | Small | Centered | — |
| Open Graph | Landscape | 1.91:1 | 1200×630 | JPG/PNG | ≤300KB | Names readable | — |
| Handwritten notes | — | — | 2x display | PNG/WebP/SVG | ≤150KB | — | Transcript in text |
| Optional audio | — | — | — | AAC/MP3 | Short clips | — | Explicit play only |

## Status

All current public images are intentional editorial placeholders under `public/images/placeholders/`.
