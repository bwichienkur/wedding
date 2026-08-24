# Testing

## Unit (Vitest)

```bash
npm test
```

Covers config integrity, countdown safety, intro storage, golden thread, capabilities, media validation, logistics/calendar helpers, and RSVP lookup/submit/rate-limit behavior.

## End-to-end (Playwright)

```bash
npx playwright install chromium   # once per machine
npm run test:e2e
```

Projects:

- `chromium-desktop` @ 1440×900
- `chromium-mobile` @ 390×844 (iPhone 12 profile)

Covers intro skip/return visits, navigation, schedule/calendar affordances, FAQ search, reduced motion, RSVP lookup success/miss, and admin hub reachability.

## Manual QA checklist

### Viewports

375 · 390 · 430 · 768 · 1024 · 1440

### Browsers

iPhone Safari · Android Chrome · Desktop Chrome · Safari · Firefox · Edge

### Accessibility

- Keyboard-only pass through nav, FAQ, RSVP, dialogs
- Skip links appear on focus
- Focus rings visible on ivory
- Reduced motion: no required motion
- Screen-reader labels on icon buttons/menus
- Form errors associated with RSVP fields

### Performance

- Lighthouse mobile target ≥ 90 in production with real compressed assets
- 3D chunks load only when needed; simplified gallery available
- Videos use posters; no full-film preload

### Security smoke

- `/api/admin/rsvp` unauthorized without session when password configured
- `/api/media` unauthorized without admin
- RSVP submit unauthorized without household session
