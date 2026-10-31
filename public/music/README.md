# Our song (optional local fallback)

Production uses **Vercel Blob** (private store is supported):

```bash
OUR_SONG_BLOB_PATH=wedding/music/Alex Warren - 01. Ordinary.mp3
```

Use the **pathname** from the Blob dashboard — not a signed URL with `vercel-blob-delegation` (those expire).

Local dev fallback: **`ordinary.mp3`** here → `/music/ordinary.mp3`.
