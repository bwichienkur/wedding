# Known limitations

1. **File-backed media/RSVP stores** (`.data/*.json` and `.data/uploads/`) are for local/dev. Photo uploads and media metadata are ephemeral on serverless hosts until Blob/CDN + Supabase (or equivalent) are wired. Production needs durable storage before relying on guest/admin data.
2. **Site access modes** beyond public robots behavior (password gate / invite-wall) are designed but not fully enforced as middleware yet.
3. **Admin auth** is password+cookie based; Supabase Auth admin users are planned, not wired.
4. **Mux signing key handling** expects base64 private key env; operators must configure carefully.
5. **Email** sends only when `EMAIL_ENABLED=true`; reminder campaigns are architected as future work.
6. **3D experiences** use lightweight custom geometry (no heavy drei kit); visual richness depends on real photography replacing placeholders.
7. **Wedding party / hotels / address / dress code** remain placeholders until Bright & Lexi supply content.
8. **Playwright** currently automates Chromium desktop + mobile profiles; expand matrix in CI as needed.
9. **Analytics** is an event bus stub until a privacy-conscious vendor is configured.
10. **OG/favicon artwork** still uses Next defaults until monogram exports are added.
