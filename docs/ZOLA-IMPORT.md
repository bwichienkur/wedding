# Zola content import

Party names, gallery photos, and FAQs are sourced from the public Zola site:

- Wedding party: https://www.zola.com/wedding/brightandlexi/wedding_party
- Gallery: https://www.zola.com/wedding/brightandlexi/photo
- FAQs: https://www.zola.com/wedding/brightandlexi/faq

## Repo defaults

- `data/party.ts` — names and roles (portraits resolved from blob)
- `data/faq.ts` — FAQ copy aligned with Zola

## Blob upload (required for production images)

Images are **not** committed to git. Run the import once with `BLOB_READ_WRITE_TOKEN` set:

```bash
npm run import:zola
```

This script:

1. Downloads portraits and gallery photos from Zola
2. Uploads files to `wedding/images/*` on Vercel Blob
3. Updates `wedding/media-assets.json` with `placementKey` `party` and `gallery`
4. Updates `wedding/logistics-content.json` FAQ list on blob (so admin overrides match Zola)

Party photos match members when the asset `title` / `alt` equals the member `id` in `data/party.ts` (e.g. `aakash-patel`).

### GitHub Actions

If `BLOB_READ_WRITE_TOKEN` is configured as a repository secret, run **Actions → Import Zola media → Run workflow**.

Without the token, the script writes `.data/media-assets.json` and `.data/uploads/` for local development only.
