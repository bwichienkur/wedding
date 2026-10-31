# Our song (optional local fallback)

Production should use **Vercel Blob** (see `.env.example`):

- `OUR_SONG_BLOB_PATH=music/ordinary.mp3` — pathname in your Blob store  
- or `OUR_SONG_BLOB_URL=https://….public.blob.vercel-storage.com/…`

Local dev fallback: **`ordinary.mp3`** here → served at `/music/ordinary.mp3`.

Rename `.mo3` to `.mp3` if needed.
