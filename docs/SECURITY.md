# Security notes

## Principles

- Secrets never ship to the client (`MUX_*`, `ADMIN_*`, `RESEND_*`, service roles).
- Admin and RSVP mutations are authorized server-side.
- Zod validates request bodies.
- Rate limits protect RSVP lookup/submit.
- Invitation codes are hashed at rest in the RSVP store.
- Unpublished media is not exposed by public playback routes.
- Private Mux playback uses signed tokens when configured.
- No real guest data in repository seeds.

## Admin

- Set `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` before staging/production.
- Without `ADMIN_PASSWORD`, non-production allows local admin access for development convenience.
- Admin cookies are httpOnly + `SameSite=Lax` (+ `Secure` in production).

## RSVP

- Lookup returns minimal household candidates + confirmation tokens only.
- Household session cookie is required for submit.
- Deadline enforcement is server-side when `wedding.rsvp.deadlineISO` is set.
- Free-text fields are length-limited and stripped of angle brackets.

## Media

- Direct upload URLs are minted server-side.
- Webhooks verify `MUX_WEBHOOK_SECRET` in production.
- Do not commit video binaries.

## Site privacy modes

`data/wedding.ts` → `site.mode` drives robots indexing behavior. Password / invite-code gating beyond RSVP should be expanded server-side before a private launch (see remaining work).

## Reporting

Rotate credentials immediately if leaked. Prefer Vercel env + Mux dashboard key rotation.
