# Bright & Lexi Wedding Website — Phase 1 Design Proposal

**Status:** Awaiting review — no implementation until approved  
**Couple:** Bright and Lexi  
**Wedding:** May 15, 2027 · Bella Cosa · Lake Wales, Florida  
**Concept:** The Golden Thread

---

## 1. Repository Assessment

### Current state

| Item | Finding |
|------|---------|
| Repository | `bwichienkur/wedding` |
| Branch | `main` (clean) |
| Contents | Single `README.md` with `# wedding` |
| Framework | None — greenfield |
| Dependencies | None |
| Reusable code | None |
| Conflicts | None |

This is a blank slate. There is no existing Next.js app, design system, database, or asset pipeline to preserve or migrate.

### Technical implications

- Full stack selection is unconstrained and should follow the specified stack (Next.js App Router, TypeScript strict, Tailwind, Motion, R3F, Supabase, Mux, Zod, Playwright, Vitest).
- No legacy routing, auth, or CMS patterns to reconcile.
- Opportunity to establish architecture correctly from day one: typed config, server-first security, progressive enhancement, and clear public/admin boundaries.
- Risk is scope, not technical debt. The proposal below prioritizes a phased build so logistics and RSVP ship with the same quality as the cinematic story.

### Recommended baseline versions (to be locked in Phase 2)

| Package | Target |
|---------|--------|
| Next.js | 15.x (App Router, stable) |
| React | 19.x |
| TypeScript | 5.x strict |
| Tailwind CSS | 4.x (or 3.4+ if 4 tooling conflicts) |
| Motion | `motion` (Motion for React) |
| `@react-three/fiber` + `three` + `@react-three/drei` | Current stable compatible set |
| Supabase JS / SSR helpers | Current stable |
| Mux | `@mux/mux-node` (server) + `@mux/mux-player-react` (client player base, restyled) |
| Zod | 3.x |
| Vitest + Playwright | Current stable |
| Resend | Current stable (email abstraction) |

Exact pins will be validated during Phase 2 foundation setup for mutual compatibility.

---

## 2. Proposed Site Map

### Public single-page editorial experience (`/`)

One continuous scroll journey with deep-linkable section anchors:

| # | Section ID | Label | Purpose |
|---|------------|-------|---------|
| 0 | `#entry` | Cinematic Entry | Skippable opening; monogram; Begin / Skip / RSVP |
| 1 | `#home` | Hero | Editorial first impression |
| 2 | `#story` | Our Story | Relationship timeline (Golden Thread) |
| 3 | `#perspectives` | Two Perspectives | Optional Bright / Lexi / Shared toggles on selected moments |
| 4 | `#proposal` | Proposal | Emotional centerpiece + film experience |
| 5 | `#wedding-day` | Wedding Day | Story → logistics transition |
| 6 | `#schedule` | Schedule | Day journey |
| 7 | `#venue` | Bella Cosa | Venue immersion |
| 8 | `#travel` | Travel | Travel & accommodations |
| 9 | `#party` | Wedding Party | Editorial portraits |
| 10 | `#rsvp` | RSVP | Multi-step guest flow |
| 11 | `#faq` | FAQ | Searchable accordions |
| 12 | `#registry` | Registry | Understated links |
| 13 | `#closing` | Closing | Emotional seal + monogram completion |

### Global navigation (desktop)

Our Story · Wedding Day · Venue · Travel · FAQ · Registry · **RSVP**

Mobile: compact header, thumb-friendly drawer, persistent RSVP, skip links (“Skip to content”, “Skip to wedding details”), optional “Return to our story”.

### Secondary routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/rsvp` | Public (mode-aware) | Dedicated RSVP entry (also embedded on `/`) |
| `/admin` | Auth required | Admin hub |
| `/admin/rsvp` | Auth | RSVP management & export |
| `/admin/media` | Auth | Mux upload & publishing |
| `/admin/settings` | Auth | Feature flags, site mode, preview |
| `/api/*` | Server | Lookup, RSVP, media, auth, calendar |
| `/offline` | Public | PWA/offline fallback page (optional Phase 7) |

### Access modes (config-driven)

1. Public  
2. Password protected  
3. Invitation-code access  
4. Public logistics + private RSVP  
5. Private proposal video  

Robots/sitemap/noindex behave according to mode.

---

## 3. Creative-Direction Summary

**Positioning:** Not a wedding website template — an interactive editorial love story that guests can also use as a practical invitation and guide.

**Metaphor — The Golden Thread:** A fine antique-gold filament representing two lives moving independently, approaching, crossing, converging at the proposal, and continuing as one path toward Bella Cosa, finally resolving into a monogram seal.

**Tone:** Romantic, modern, sophisticated, cinematic, warm, editorial, personal, luxurious, subtly playful. Impressive without excess.

**What luxury means here:** Typography, photography, spacing, pacing, materials, sound discipline, and interaction quality — never clutter, metallic kitsch, or motion for its own sake.

**Narrative arc:** Intimate story first → emotional proposal centerpiece → clear guest logistics → warm closing seal.

**Hard avoidances:** Rustic farmhouse, mason jars, blush clichés, script-everywhere typography, floating hearts, diamond-ring ads, cheap gold gradients, glassmorphism excess, scroll hijacking, game UI, stock wedding copy, fabricated facts, desktop-only hover essentials.

---

## 4. Visual-System Proposal

### Color tokens

| Token | Role | Proposed value |
|-------|------|----------------|
| `--color-ivory` | Page background | `#F3EEE4` (warm ivory, not pure white) |
| `--color-parchment` | Secondary surface | `#E8E1D4` |
| `--color-sage` | Muted surfaces | `#A8B5A0` |
| `--color-sage-deep` | Soft section washes | `#6E7F6A` |
| `--color-forest` | Primary text | `#1C2A22` |
| `--color-charcoal` | Secondary text | `#2A2E2B` |
| `--color-stone` | Borders / quiet UI | `#C4BBAE` |
| `--color-gold` | Accent / thread | `#A6873B` (antique gold) |
| `--color-gold-soft` | Focus / selected | `#C4A85A` |
| `--color-ink-muted` | Captions | `#5A615C` |

Gold is used sparingly: thread, fine borders, focus rings, important dates, monogram, selected states.

### Typography

| Role | Direction | Notes |
|------|-----------|-------|
| Display | Editorial serif (e.g. Fraunces or Similar: Cormorant Garamond / Newsreader) | Headlines, couple names, chapter titles |
| Body / UI | Contemporary sans (e.g. Source Sans 3 or Outfit) | Nav, buttons, forms, schedule, FAQ |
| Annotation | Optional handwriting (e.g. Caveat) | Rare personal notes only — never body/UI |

Scale via `clamp()`; documented type ramp in `styles/tokens.css`. Comfortable measure (~60–72ch for long text; shorter for editorial captions).

### Layout principles

- Generous negative space  
- Asymmetric editorial compositions  
- Full-bleed photography balanced with quiet typographic fields  
- Fine hairline rules and delicate gold framing  
- No repetitive card grids for story/party when editorial layouts work  
- Cards only when they contain a clear interaction (FAQ accordion, hotel expandable, RSVP steps)

### Texture & atmosphere

- Extremely subtle paper/film grain via small CSS noise or lightweight SVG/CSS overlay (not a heavy full-page image)  
- Soft depth through layered photography and light, not heavy drop shadows  
- Restrained motion: 2–3 intentional motions per major sequence

### Photography system

- Primary visual asset; never stretched  
- `next/image` with focal-point object-position data in config  
- LQIP / dominant-color placeholders  
- Documented crops: hero desktop 16:9 / mobile 4:5, story 3:2 & 4:5, venue layers, party portraits  

### Motion language

- Prefer SVG path animation for the Golden Thread  
- Motion for React for section reveals and perspective switches  
- R3F only for monogram, floating gallery, and proposal convergence  
- `prefers-reduced-motion: reduce` → static compositions, no parallax, no WebGL motion  

---

## 5. Page-by-Page Experience

### 1. Cinematic Entry

- Monogram, “Bright & Lexi”, May 15, 2027, Bella Cosa, Lake Wales, Florida  
- CTAs: Begin our story · Skip to wedding details · RSVP  
- Thread appears as a single fine filament drawing into the monogram  
- ~2–4s for first visit; immediate skip; `localStorage` remembers seen state; faster re-entry for returners  
- Reduced-motion: static framed intro, no draw animation  

### 2. Hero

- Full-viewport editorial photograph (or intentional placeholder with focal guidance)  
- Names, date, location, short editable statement, RSVP, scroll cue  
- Secondary countdown only (correct post-wedding state; never negative)  
- Subtle scale / grain / thread entering; static SVG monogram fallback if WebGL off  

### 3. Our Story

- Scroll-driven chapters from typed `data/story.ts`  
- Includes dating anniversary: **March 20, 2025**  
- All other moments: clearly labeled placeholders (“Add the story of how you met.”)  
- Alternating full-bleed, quiet type, floating memories, split perspectives, date markers  
- Golden Thread SVG overlays scroll progress; may bifurcate for Bright / Lexi  

### 4. Two Perspectives

- Segmented control: Bright’s version · Lexi’s version · What actually happened  
- Used on selected milestones only  
- Keyboard-accessible tabs; no essential logistics hidden  
- Content from typed config; restrained crossfade; reduced-motion: instant swap  

### 5. Proposal Chapter

- Transition copy from config (suggested default: “And then, everything changed.”)  
- Date/location placeholders; photos; muted teaser; highlight + full films via Mux  
- Sequence driven by scroll + intentional user tap to watch  
- After playback: Continue story · Watch full proposal · View photographs  

### 6. Wedding-Day Transition

- Paths permanently merged; date May 15, 2027; thread becomes route toward Bella Cosa  
- Pacing shifts from intimate to practical; short and satisfying  

### 7. Schedule

- Journey through the day, thread connecting items  
- Known: Ceremony 4:00 PM; plated dinner; toasts/speeches; dancing; sparkler sendoff  
- Unknown times: “Details coming soon” placeholders — never invent times  
- ICS download + Google Calendar; timezone-safe (`America/New_York`)  

### 8. Bella Cosa

- Layered photography (foliage / architecture / sky) with subtle scroll perspective  
- Address, map, directions, parking, accessibility, weather, ceremony/reception placement — placeholders until confirmed  
- Gold location markers; no fabricated layout claims  

### 9. Travel & Accommodations

- Airports, drive times, hotels, codes, deadlines, transport, local tips — all editable; distinguish confirmed vs placeholder  
- One-tap map / phone / booking  

### 10. Wedding Party

- Editorial asymmetric compositions, not corporate card grids  
- Name, role, photo, relationship, short description, optional fun fact / memory  
- Graceful missing-photo treatment  

### 11. RSVP

- Multi-step secure flow (lookup → household → responses → review → confirm)  
- Persistent nav RSVP; dedicated `/rsvp` for deep links  

### 12. FAQ

- Categories + search + deep-linkable accordions  
- Placeholder answers clearly labeled  

### 13. Registry

- Quiet note + external links (+ optional honeymoon fund)  
- Visually secondary to RSVP and logistics  

### 14. Closing

- Full-bleed photo, short message, names, date, venue, RSVP + contact  
- Thread resolves into monogram/knot/seal — bookend with entry  

---

## 6. Component Architecture

```
app/
  layout.tsx                 # fonts, tokens, skip links, analytics gate
  page.tsx                   # public editorial composition
  rsvp/page.tsx
  admin/...
  api/...
components/
  ui/                        # Button, Link, Accordion, Tabs, Dialog, Drawer, Field, SkipLink
  layout/                    # Header, MobileNav, Section, Container
  sections/                  # Entry, Hero, Story, Schedule, Venue, Travel, Party, FAQ, Registry, Closing
  story/                     # Timeline, Milestone, PerspectivesToggle, ThreadOverlay
  three/                     # MonogramScene, MemoryGallery, ConvergenceScene (+ static fallbacks)
  video/                     # WeddingPlayer, Poster, Captions, states
  rsvp/                      # Lookup, HouseholdSelect, GuestForm, Review, Confirmation
data/                        # wedding.ts, story.ts, schedule.ts, venue.ts, travel.ts, party.ts, faq.ts, registry.ts
lib/
  auth/  rsvp/  media/  email/  validation/  access/  analytics/  calendar/
styles/                      # tokens, globals, grain
tests/                       # unit + e2e
docs/                        # setup, content, assets, security
```

### Design principles for components

- Presentation components consume typed config — no hardcoded wedding facts  
- Server Components by default; client only for motion, forms, video, 3D  
- Dynamic `import()` for all R3F scenes  
- Error boundaries around 3D and video  
- CMS-ready: later swap `data/*` loaders without rewriting UI  

---

## 7. Golden-Thread Implementation Plan

### Medium

Primary: **SVG path system** (`GoldenThread` + chapter path segments).  
Secondary: **R3F extruded/tubular paths** only in monogram, gallery, and proposal convergence where depth materially helps.

### Narrative mapping

| Phase | Thread behavior |
|-------|-----------------|
| Entry | Single fine filament draws into monogram |
| Hero | Thread enters frame from edge; quiet idle |
| Story | Continuous scroll-scrubbed path; may split into Bright / Lexi lanes |
| Perspectives | Dual strands labeled subtly; converge on “What actually happened” |
| Proposal | Dual paths approach → weave → single strand → cinematic frame |
| Wedding Day | Single path becomes itinerary polyline |
| Venue | Geographic-feeling route mark near Bella Cosa (stylized, not fake GPS accuracy) |
| Closing | Path knots into monogram/seal |

### Technical approach

- Author master paths in SVG (viewBox-normalized); section components register progress via Intersection Observer / scroll progress  
- Motion pathLength / stroke-dashoffset for draw  
- Bifurcation via two sibling paths with shared endpoints  
- Canvas/WebGL thread segments sync visual style (antique gold metalness low, roughness mid)  
- Never looks like a progress bar: irregular editorial curves, variable opacity, pauses at milestones  

### Performance

- Single SVG layer where possible; avoid per-frame layout thrash  
- Pause updates when offscreen or `document.hidden`  
- Reduced motion: fully drawn static path, no scrubbing animation  

---

## 8. Three-Dimensional Storyboard

### A. Dimensional Monogram

1. Camera: slight three-quarter, soft ivory environment light, restrained gold material  
2. Idle: very slow rotation (~0.1–0.2°/frame equivalent) or gentle breathing scale  
3. Desktop: subtle pointer parallax on X/Y (clamped)  
4. Device orientation: opt-in only — never auto-request permission  
5. Date may sit beneath in HTML overlay, not baked into mesh  
6. Fallback: static SVG monogram in same crop  
7. Reduced motion: frozen frame  

### B. Floating Memory Gallery

1. 5–9 curated prints at controlled depths along a shallow Z corridor  
2. Scroll translates camera forward gently; no tumble / endless float  
3. Thread weaves among frames  
4. Tap/click opens accessible dialog with story, date, alt text  
5. Desktop: slight pointer parallax; mobile: scroll-only, stable  
6. Fallback: vertical editorial timeline with same content  

### C. Two Paths Become One (proposal)

1. Bright path enters from one side; Lexi from the other  
2. Paths pass abbreviated memory markers  
3. Gradual approach; at proposal node, weave/spiral  
4. Unified strand extrudes a thin cinematic frame  
5. Poster image fades into frame  
6. CTA “Watch our proposal” (user gesture required)  
7. On play: pause decorative render loops  
8. Fallback: 2D SVG convergence + poster + same CTAs  

**Not used:** hearts, fireworks, particles storms, ring models, camera spins, autoplay audio.

---

## 9. Proposal-Video Storyboard

1. Timeline reaches proposal chapter  
2. Gallery memories ease out (or fade in reduced motion)  
3. Convergence sequence (3D or 2D fallback)  
4. Poster appears in formed frame  
5. User taps “Watch our proposal”  
6. Custom player opens (focus trapped); teaser/highlight streams from Mux — no full-film preload  
7. Background animations paused  
8. End card: Continue our story · Watch full proposal · View proposal photographs  
9. Escape / Close restores focus to CTA  

Media types supported in schema: teaser, highlight, full film, background, relationship, post-wedding — with captions, transcript, chapters, posters, dates.

---

## 10. Mobile and Reduced-Motion Fallbacks

| Capability | Full experience | Mobile / low power | Reduced motion | No WebGL / JS fail |
|------------|-----------------|--------------------|----------------|--------------------|
| Entry | Short thread draw | Same, shorter | Static frame | Static HTML |
| Monogram | R3F sculpture | Lower DPR / quality or static | Static SVG | Static SVG |
| Gallery | Shallow 3D corridor | Timeline fallback if FPS low | Vertical timeline | Vertical timeline |
| Convergence | R3F weave | SVG weave | Instant unified path + poster | SVG + poster |
| Parallax | Subtle | Off or minimal | Off | Off |
| Video | Custom player | Same; large targets | Same; no decorative motion | Native controls fallback |
| Thread scroll scrub | Yes | Throttled | Static full path | Static CSS/SVG |

**Simplified mode** feature flag + runtime detection (WebGL fail, Save-Data, low memory, explicit user toggle).

---

## 11. Database Schema Proposal

PostgreSQL via Supabase. Soft-delete / archive where noted. All tables include `id` (uuid), `created_at`, `updated_at` unless stated.

### Core entities

**admin_users**  
`id`, `email` (unique), `auth_user_id` (Supabase Auth), `role` (`owner` | `editor`), `last_login_at`

**households**  
`id`, `display_name`, `invitation_code_hash`, `invitation_code_hint` (last 2–3 chars only, optional), `email`, `phone`, `notes_admin`, `rsvp_status` (`pending` | `partial` | `complete` | `declined`), `archived_at`

**guests**  
`id`, `household_id` FK, `full_name`, `normalized_name`, `is_child`, `is_plus_one`, `plus_one_named` bool, `sort_order`, `archived_at`

**events**  
`id`, `slug`, `title`, `starts_at` (nullable), `ends_at`, `location`, `is_adults_only`, `allows_plus_ones`, `sort_order`

**household_event_invitations**  
`household_id`, `event_id`, unique pair

**meal_options**  
`id`, `event_id`, `label`, `description`, `sort_order`, `is_active`

**guest_responses**  
`id`, `guest_id`, `event_id`, `attending` (`yes` | `no` | `unknown`), `meal_option_id`, `dietary_notes`, `accessibility_notes`, unique (`guest_id`, `event_id`)

**rsvp_submissions**  
`id`, `household_id`, `submitted_at`, `submitted_by` (`guest` | `admin`), `admin_user_id` nullable, `song_request`, `message_to_couple`, `ip_hash`, `user_agent_hash`

**rsvp_update_history**  
`id`, `household_id`, `payload_json`, `changed_by`, `admin_user_id`, `created_at`

**media_assets**  
`id`, `mux_asset_id`, `mux_playback_id`, `upload_id`, `status` (`waiting` | `uploading` | `processing` | `ready` | `errored` | `archived`), `category`, `title`, `description`, `media_date`, `poster_url`, `custom_poster_path`, `duration_seconds`, `aspect_ratio`, `captions_url`, `transcript`, `is_published`, `is_private`, `sort_order`, `story_moment_id` nullable, `created_by`

**media_placements**  
`id`, `media_asset_id`, `placement_key` (e. and `proposal.highlight`), `sort_order`

**audit_logs**  
`id`, `actor_admin_id` nullable, `action`, `entity_type`, `entity_id`, `metadata_json`, `created_at`

**site_settings** (optional row or key-value)  
`site_mode`, `rsvp_deadline`, `feature_flags_json`, `private_video_enabled`

### Indexes & security notes

- Index `guests.normalized_name`, `households.invitation_code_hash`, `guest_responses(event_id)`, `media_assets(status, is_published)`  
- RLS: public role cannot read households/guests; service role / authenticated admin only  
- Invitation codes stored hashed (argon2/bcrypt); rate-limited lookup  
- No real guests in seed data — fictional only  

---

## 12. RSVP Security Design

1. **Lookup is server-side only** — never ship guest list to browser  
2. Guest submits name or invitation code → API normalizes name → searches with careful fuzzy/exact rules  
3. Responses return **minimal household candidates** (masked) only when match confidence is high; ambiguous duplicates require disambiguation fields  
4. After N failed lookups, return generic errors (same shape as no-match) + progressive delay / IP rate limit  
5. Household session: short-lived signed token (httpOnly cookie or signed token) scoped to `household_id` after successful identification  
6. All mutations validate with Zod; authorize against token + invitation graph  
7. Show only events invited for that household  
8. Sanitize free text; length limits; strip HTML  
9. Deadline enforced server-side  
10. Audit: submission, update, admin override, export  
11. Confirmation email via Resend abstraction; disabled in local/test unless `EMAIL_ENABLED=true`  
12. CSV export admin-only  
13. Seed data: fictional names only  

---

## 13. Video-Upload Security Design

1. Admin authenticated via Supabase Auth; admin routes gated server-side  
2. Direct upload: server creates Mux direct-upload URL; client uploads to Mux — **no Mux secrets in client**  
3. Webhook (Mux) updates `media_assets.status` with signature verification  
4. Unpublished / private assets: signed playback IDs when private mode on; public pages only fetch published metadata  
5. Validate MIME/type and max size server-side before creating upload  
6. Captions/poster uploads via secured storage (Supabase Storage) with admin-only write  
7. Delete requires confirmation; soft-archive then Mux delete job  
8. Audit log for upload, publish, unpublish, replace, delete  
9. `.env.example` documents all keys; never commit secrets or real videos  

---

## 14. Performance Strategy

**Target:** Mobile Lighthouse ≥ 90 in realistic production conditions.

- `next/image` + modern formats; stable dimensions; focal points  
- Lazy below-fold media; LQIP  
- Dynamic import R3F; render only while in view; pause on `visibilitychange`  
- Cap DPR (e.g. 1.5); quality tiers; no unnecessary realtime shadows  
- Reuse geometries/materials; dispose on unmount  
- No full-film preload; Mux ABR; posters first  
- Pause offscreen video  
- Keep admin code out of public bundles  
- Simplified mode for weak devices  
- Monitor JS weight of Motion + R3F paths  

**Estimated impact (planning):**

| Asset class | Budget mindset |
|-------------|----------------|
| Initial JS (public, no 3D) | Aim lean; 3D chunk separate |
| R3F scenes | Lazy chunks ~150–300KB gz depending on drei usage — minimize drei imports |
| Hero image | Responsive AVIF/WebP; mobile crop ≤ ~200KB ideal |
| Grain texture | CSS or tiny tile ≪ 20KB |
| Fonts | Subset; 2 families max in critical path; handwriting optional defer |

---

## 15. Accessibility Strategy

Meet WCAG AA.

- Semantic landmarks, heading order, skip links  
- Visible gold-tinted focus rings on ivory  
- Keyboard: nav, tabs, accordions, dialogs, RSVP, player  
- ≥44px touch targets on mobile  
- Forms: labels, errors linked via `aria-describedby`, live regions for lookup status  
- Video: captions, transcripts, custom controls fully labeled; Escape closes  
- 3D: static equivalents; decorative canvases `aria-hidden` with adjacent text  
- Contrast: forest on ivory, gold only as accent (not sole meaning)  
- `prefers-reduced-motion` honored sitewide  
- Map: address + external link + textual directions alternative  
- FAQ deep links and searchable text  

---

## 16. Required Assets and Content

### Confirmed content (safe to use)

- Couple: Bright and Lexi  
- Dating anniversary: March 20, 2025  
- Wedding: May 15, 2027  
- Venue: Bella Cosa, Lake Wales, Florida  
- Access begins 9:00 AM; photo/video 2:00 PM; ceremony 4:00 PM  
- Dinner: plated  
- Reception: toasts, speeches, dancing, sparkler sendoff  
- Colors: soft sage, warm ivory, antique gold  

### Placeholders needed (do not invent)

Proposal date/location/story · Additional milestones · Venue address · Parking · Accessibility details · Weather policy · Ceremony/reception placement · Hotels/codes · Airports/drive times · Dress code · Plus-one/children policy · RSVP deadline · Registry URLs · Contact email/phone · Wedding party names · Hero & story photography · Proposal media · Monogram artwork · OG image  

### Asset checklist (summary)

| Asset | Orientation | Aspect | Min resolution | Format | Notes |
|-------|-------------|--------|----------------|--------|-------|
| Hero | Landscape + mobile crop | 16:9 / 4:5 | 2400px long edge | AVIF/WebP/JPEG | Focal: faces mid-upper |
| Story photos | Mixed | 3:2, 4:5 | 1600px | AVIF/WebP | Focal points in config |
| Proposal stills | Mixed | — | 2000px | AVIF/WebP | Poster separate |
| Proposal videos | Portrait & landscape | 9:16 / 16:9 | Mux ingest | — | Captions + transcript |
| Venue layers | Landscape | 16:9 | 2400px | AVIF/WebP | Aligned layers for parallax |
| Party portraits | Portrait | 4:5 | 1200px | AVIF/WebP | Consistent headroom |
| Monogram | — | Square SVG | Vector | SVG | Also 3D source curves |
| Favicon / Apple | — | 1:1 | 512 / 180 | PNG/SVG | Gold on ivory |
| OG image | Landscape | 1.91:1 | 1200×630 | JPG/PNG | Names + date + venue |

Full checklist will live in `docs/ASSET-CHECKLIST.md` in Phase 2+.

---

## 17. Implementation Phases

| Phase | Scope | Exit criteria |
|-------|-------|---------------|
| **1. Discovery & Design** | This document | Reviewed & approved by Bright/Lexi (or steward) |
| **2. Foundation** | Next.js, tokens, nav, config, a11y base, entry, hero, static monogram, basic story | Typecheck, lint, unit tests, production build |
| **3. Story & 3D** | Thread SVG, gallery, monogram 3D, perspectives, convergence, fallbacks | Mobile scroll stability, WebGL/reduced-motion fallbacks |
| **4. Video** | Mux, admin media, player, posters, captions, private playback | Slow-network, publish protection, mobile fullscreen |
| **5. Wedding information** | Transition, schedule, venue, travel, party, FAQ, registry, closing | Info hierarchy & mobile QA |
| **6. RSVP** | Schema, secure lookup, multi-step flow, email, admin, CSV, tests | Security tests green; fictional seed only |
| **7. Polish & QA** | Playwright matrix, a11y, perf, security, docs | Lighthouse target; known limitations listed |

**No Phase 2+ work begins until this proposal is reviewed.**

---

## 18. Decisions Requiring Bright & Lexi’s Input

### Creative & content

1. Approve Golden Thread concept and visual direction (serif + sans pairing samples to follow in Phase 2).  
2. Preferred display names / monogram initials (B & L treatment).  
3. Hero statement and closing message copy.  
4. Which milestones exist beyond March 20, 2025 (titles only OK at first).  
5. Which stories get Two Perspectives treatment.  
6. Proposal transition line — keep “And then, everything changed.” or replace.  
7. Easter eggs: enable any? playlist? secret thread message?  

### Logistics (placeholders until provided)

8. Exact Bella Cosa street address and preferred map pin.  
9. Parking, accessibility, indoor/outdoor ceremony notes, weather plan.  
10. Confirmed schedule times beyond ceremony 4:00 PM (cocktail hour? dinner time? sendoff time?).  
11. Recommended airports, hotels, group codes, booking deadlines.  
12. Dress code, children policy, plus-one policy, photography policy.  
13. RSVP deadline date.  
14. Registry links / honeymoon fund.  
15. Public contact email/phone.  
16. Wedding party list and roles.  

### Media & access

17. Site access mode at launch (public vs password vs invite code, etc.).  
18. Is the proposal film private-only?  
19. Who are admin users (emails)?  
20. Preference for countdown in hero (yes/no/secondary only — proposal defaults to secondary).  

### Technical accounts (for later phases)

21. Supabase project, Mux account, Resend domain, Vercel project, custom domain.  

---

## Appendix A — Explicit Non-Goals for v1

- Full headless CMS for all public copy (file-based config first)  
- Live 3D venue model  
- Autoplaying music  
- Guest photo uploads  
- Seating charts  
- Live streaming the wedding  

## Appendix B — Success Criteria (v1)

Guests on iPhone Safari can: skip intro instantly, understand who/when/where in one viewport, RSVP securely, find schedule/venue/travel/FAQ/registry within seconds, experience the story emotionally without being trapped, and complete key tasks with reduced motion and without WebGL.
