# NeuroMeet UI Redesign Plan

**Scope:** Public home page + all auth screens
**Direction chosen:** Light-first, with a real dark theme
**Accent chosen:** One professional blue (no cyan/purple UI gradients)
**Date:** 2026-11-05
**Status:** Plan for approval. No UI code changed yet.

---

## 1. Executive summary

The current public surface reads as a generic AI-generated startup page, not a meeting platform:

- A full-screen nebula background, glowing orbs, gradient text, glass cards and neon accents.
- A centered hero with no product visible, followed by a second oversized "Quick Join" card that repeats the CTA.
- Auth screens are a small dark card floating in empty space, with no logo, no back link, no trust cues and cramped fields.
- The marketing assets themselves are AI-slop: `landingbg.webp` is a space nebula, and `meeting.webp` is an AI illustration with garbled labels ("Orowbe glows", fake names).
- The only real product screenshots in the repo (`_docs/assests/*.png`) contain dummy data, a Windows activation watermark and gibberish meeting titles, so they cannot be used as-is.

The fix is not "more polish on the same look". It is a replacement visual world for the public and auth surfaces, while leaving the dashboards and meeting room untouched. The plan keeps every route, server action, form field name and dashboard layout position intact.

**Target feel:** calm, credible, institutional, meeting-first. Reference points are Zoom's default light UI and Google Meet's join flow, not a Web3/AI landing page.

---

## 2. What was reviewed

### Code

| Area | Files |
|---|---|
| Root shell and theme | `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`, `frontend/src/components/providers/theme-provider.tsx` |
| Landing | `frontend/src/app/page.tsx`, `frontend/src/features/landing/components/*` |
| Auth shell | `frontend/src/features/auth/providers/auth-wrapper.tsx`, `frontend/src/features/auth/components/authTabs.tsx` |
| Auth forms | `(auth)/sign-in`, `sign-up`, `forget-password`, `reset-password`, `verify-email`, `setting-profile` |
| Form primitives | `components/ui/{button,input,card,field,label}.tsx`, `features/auth/components/{password-input,password-strength-ui,otp}.tsx` |
| Dashboard baseline (must not break) | `features/dashboard-shared/layout/*`, `features/dashboard-*/**`, `(main)/livekit/**` |
| Assets | `frontend/public/*`, `_docs/assests/*.png` |

### Live screenshots captured for this audit

- `.playwright-mcp/audit-landing-desktop.png`
- `.playwright-mcp/audit-landing-full.png`
- `.playwright-mcp/audit-signin-desktop.png`
- `.playwright-mcp/audit-signup-mobile.png`

---

## 3. Diagnosis: where the "AI slop" comes from

1. **Nebula / space imagery.** `frontend/src/app/page.tsx:34-40` uses `landingbg.webp` as a full-page background; `dashboard.webp` is also a nebula. It signals "AI SaaS template", not "reliable meeting tool".
2. **Gradient brand text and gradient buttons.** `Logo.tsx:12` clips a cyan→purple→white gradient into the wordmark. `button.tsx:19-24` adds `effect`, `live` and `gradient` variants. `Hero.tsx:16` uses a gradient pill CTA.
3. **Glowing orbs and animated gradients.** `auth-wrapper.tsx:9-11` renders two blurred orbs with infinite float animations over an animated 300% gradient. This is the single strongest "AI slop" signal on auth.
4. **Second hero.** `QuickJoin.tsx:50-95` puts a large gradient card directly under the hero with its own title and CTA. Two competing "join" actions, two visual focal points.
5. **Feature cards that are buttons.** `NeuroFeatures.tsx:41-59` renders every feature as a `<button>` with hover lift, glow and scale. They are not clickable destinations, so this is both a visual and semantic bug.
6. **Oversized type.** `Hero.tsx:6` uses `text-6xl` (60px) with `font-extrabold`; `NeuroFeatures.tsx:32` uses up to `text-6xl`. On a 1440px screen the landing is ~70% headline.
7. **No product evidence.** The hero shows no meeting UI, no participant grid, no controls, no dashboard. The only product-looking asset (`public/meeting.webp`) is AI-generated with unreadable text.
8. **Auth has no shell.** There is no `(auth)/layout.tsx`. Every page wraps itself in `AuthWrapper` (`auth-wrapper.tsx`) with no logo, no home link, no support link, no trust row. The card is `max-w-sm` (384px) with `CardContent` only, so fields touch the card edges.
9. **Auth UI details read as template output.**
   - `sign-in.tsx:199-260`: "View Demo Credentials" button with a `Sparkles` icon, `⚡ Fill Instructor` emoji buttons, and hard-coded production credentials inside a client component.
   - `password-input.tsx:49-63`: the show/hide control is a solid blue block pinned on top of the input, 97% of its height.
   - `authTabs.tsx:9-41`: a segmented Sign In / Sign Up control is the strongest element in the card.
   - `sign-in.tsx:99`: `autoFocus` on email produces a glowing focus ring on first paint.
10. **Muted text is too quiet.** `globals.css:264` sets `--muted-foreground` to ~70% lightness, but many surfaces use `muted-foreground-mid` (60% opacity). On the dark card this fails comfortable reading.
11. **Dark-only.** `theme-provider.tsx` is entirely commented out and `next-themes` is not installed. `:root` is dark, `html` has no class, and there is no toggle. The design claims dark tokens but never supports light.
12. **Broken token reference.** `card.tsx:13` contains `to-brand-purple-soft-sutble` (typo). That half of the gradient silently does nothing.
13. **Unverified marketing claims.** The page/metadata claim "4K", "proprietary streaming protocol" and "end-to-end encryption"; the README describes LiveKit, custom WebRTC, JWT hardening and chunked recording, but not those three claims. A professional page must not ship claims the code cannot back.
14. **Placeholder footer links.** `NeuroFooter.tsx:12-17` links both legal items to `#`.

### Blockers found before implementation

- **Syntax error in the working tree:** `frontend/src/app/(auth)/forget-password/forget-password.tsx:21` is missing a comma after `register`. This breaks local compilation. It is uncommitted user work, so it was not modified.
- `frontend/next.config.ts:4-6` has `typescript.ignoreBuildErrors: true`, which hides type errors. The plan recommends removing it after the redesign stabilizes.

---

## 4. Design direction

### Concept: "Calm Campus"

A quiet, high-trust meeting product for university teaching. White space, one blue, real screenshots, plain language. The interface should feel like infrastructure a university would approve, not a launch-week AI demo.

### Principles

1. **Meeting first.** Show the room, the people and the controls before describing them.
2. **One accent.** Blue is for action and focus only. Everything else is neutral.
3. **Flat by default.** Borders and one soft shadow. No glows, no glass, no gradient chrome.
4. **Readable at a glance.** 16px body minimum, 14px UI minimum, AA contrast.
5. **Fewer, stronger sections.** Ten weak sections become six deliberate ones.
6. **Calm motion.** 150-200ms ease-out, no infinite animation, honor `prefers-reduced-motion`.

### Anti-reference (ban list for public + auth)

- Gradient text, gradient buttons, neon borders.
- Nebula, space, circuit-board or AI-generated illustrations.
- Glowing orbs, blur blobs, glassmorphism, animated backgrounds.
- `rounded-full` on every button and card.
- Emoji in UI, `Sparkles` icons, "AI-powered" badges.
- Fake testimonials, fake university logos, invented metrics.
- Hover lift + glow + scale on non-interactive cards.
- Claims ("4K", "E2E", "proprietary") not verified in the repo.

---

## 5. Design system changes

### 5.1 Theming strategy that cannot break the dashboards

The dashboards and meeting room depend on the current dark tokens and hard-coded `text-white` / `bg-black-soft-*` classes. Flipping `:root` to light would break them.

**Do this instead:**

- Keep the existing `:root` dark tokens untouched in Phase 1.
- Add a scoped public theme: `.theme-public { ...light tokens... }` and `.dark .theme-public { ...dark overrides... }`.
- Apply `theme-public` to the landing page wrapper and the new `(auth)/layout.tsx`.
- Never edit dashboard tokens or layout classes in this milestone.

This changes colors only inside the two public surfaces. Zero layout movement in `(main)`.

Phase 2 (separate project) can migrate dashboards by wrapping them in `.dark` and promoting light tokens to `:root`.

### 5.2 Token proposal

| Token | Light | Dark |
|---|---|---|
| `--background` | `#F7F8FA` | `#0B0F19` |
| `--foreground` | `#101828` | `#F2F4F7` |
| `--card` | `#FFFFFF` | `#111827` |
| `--muted` | `#F2F4F7` | `#1A2233` |
| `--muted-foreground` | `#667085` | `#98A2B3` |
| `--border` | `#E4E7EC` | `#1F2937` |
| `--border-strong` | `#D0D5DD` | `#2A3546` |
| `--primary` | `#175CD3` | `#2563EB` |
| `--primary-hover` | `#1249A8` | `#1D4ED8` |
| `--primary-soft` | `#EFF4FF` | `#172554` |
| `--ring` | `#84ADFF` | `#60A5FA` |
| `--status-success` | `#067647` | `#32D583` |
| `--status-warning` | `#B54708` | `#FDB022` |
| `--destructive` | `#B42318` | `#F97066` |

Contrast targets: body text ≥ 7:1, secondary ≥ 4.5:1, primary button white-on-blue ≥ 4.5:1. Verify with the browser, not by eye.

### 5.3 Typography

- Keep **Inter** (already loaded via `next/font`). One family, weights 400/500/600. Drop `font-extrabold` from the public surface.
- Scale: 12 / 13 / 14 / 16 / 18 / 24 / 32 / 40 / 56.
- Display line-height 1.1-1.15, body 1.5-1.6.
- `tracking-tight` only on ≥24px headings.
- Tabular numerals for meeting times and counts (`font-variant-numeric: tabular-nums`).
- Max line length 65-70 characters for paragraphs.

### 5.4 Spacing, radius, elevation

- 4/8px spacing grid.
- Container: 1200px max, 24px mobile gutters, 32px tablet, 48px desktop.
- Header height: 64px desktop, 56px mobile.
- Radius: 8px controls, 12px cards, 16px product frame; `rounded-full` only for avatars and status pills.
- Shadows: one `0 1px 2px rgba(16,24,40,.06)` card shadow. No colored glow.
- Section rhythm: 96px desktop / 56px mobile between major sections.

### 5.5 Motion

- 150ms for color/border, 200ms for transform/opacity.
- Allowed: fade-in, 8px rise, underline shift, button press.
- Removed: orb float, gradient shift, glow pulse, infinite pulse, hover scale on cards.
- Wrap decorative motion in `@media (prefers-reduced-motion: reduce)`.

### 5.6 Component strategy

Keep the existing primitives but make changes additive, so dashboard usage is untouched.

| Component | Change |
|---|---|
| `button.tsx` | Add `size="xl"` (48px, 16px text, 12px radius) for public CTAs. Keep `effect`/`live`/`gradient` for dashboards, but never use them on public/auth. |
| `input.tsx` | Add `size="lg"` (44-48px, 14-16px text, 12px radius). Fix the contradictory `py-5 h-8` only for the new size. |
| `card.tsx` | Add `variant="surface"` (white, 1px border, 12px radius, subtle shadow). Keep `gradient`/`glass` for dashboards. Fix the `soft-sutble` typo. |
| `field.tsx` | Reuse. Ensure `FieldError` renders in an `aria-live="polite"` region and is linked via `aria-describedby`. |
| `authTabs.tsx` | Stop using it in auth. Replace with a footer link. Delete in Phase 2 if unused. |
| `password-input.tsx` | Rebuild the toggle as a 36px ghost icon button inside the field, with `aria-label` and `aria-pressed`. |
| `password-strength-ui.tsx` | One thin bar + 2-column rule list, shown only after typing. No colored check animation. |
| New `OtpInput` | Six 44px boxes, paste support, arrow-key navigation, `inputMode="numeric"`, `autocomplete="one-time-code"`. |
| New `GoogleButton` | Official Google mark, "Continue with Google", 48px, neutral border. |
| New `FormAlert` | Error/success banner with icon, `role="alert"`, no centered red text. |
| New `MeetingPreview` | Hand-built JSX meeting frame used in hero and auth side panel. No AI images. |

---

## 6. Home page blueprint

### Route

Keep `/` and `frontend/src/app/page.tsx`. No route changes.

### Section order

1. **Header (64px, sticky, white/blur, bottom border on scroll)**
   - Left: mark + solid "NeuroMeet" wordmark.
   - Center: `Product`, `Security`, `For education` (anchor links to sections that exist).
   - Right: `Sign in` (text), `Start a meeting` (primary), mobile menu button.
   - Remove the `bg-header-gradient` and the oversized logo.

2. **Hero (two columns ≥1024px)**
   - Left (max 560px):
     - Eyebrow: "Built for university learning"
     - H1: "Meetings that keep everyone in the room."
     - Sub: "Start a class, share your screen, and keep every student engaged - right in the browser."
     - Primary: "Start a meeting" → `/sign-in` with redirect.
     - Secondary: "Join a meeting" → focuses the code field below.
     - Micro-trust: "No downloads · Works in your browser · Role-aware access"
   - Right: `MeetingPreview` in a browser-like frame:
     - Top bar: meeting title, `LIVE` pill, participant count, timer.
     - 2x2 participant grid with initials avatars and muted name tags.
     - Bottom control bar: mic, camera, share, chat, leave.
     - Collapsed right panel showing 3 people and one chat line.
     - No fake photos, no AI illustration, no glow.
   - Mobile: copy first, preview below, CTAs full width.

3. **Join strip (compact, not a card)**
   - "Have a code?" + input + `Join` button, max width 640px, 1px border, white surface.
   - Reuse the existing link parsing logic from `QuickJoin.tsx:24-41` (room= extraction, URL handling, redirect cookie). Do not duplicate it.

4. **Proof strip (one line)**
   - Browser-based · Recordings · Role-based access · Live captions/transcripts · Engagement insights
   - Only include items verified in the codebase.

5. **Features (3 cards, not 4; left-aligned)**
   - "Join from any browser" - no install, one link.
   - "Built for teaching" - roles, groups, recordings, attendance/analytics.
   - "Keep everyone engaged" - instructor engagement panel, live signals.
   - Line icons, 24px, neutral; blue only on icon stroke.

6. **Product tour (alternating rows)**
   - Row 1: instructor dashboard screenshot in a browser frame + 3 bullets.
   - Row 2: student dashboard screenshot + 3 bullets.
   - Use fresh, sanitized captures (real names removed, no activation watermark, no dummy gibberish). If a clean capture is not possible in this phase, use `MeetingPreview`-style JSX frames instead of the current PNGs.
   - `next/image` with explicit `sizes`, `loading="lazy"`, and a fixed aspect ratio to protect CLS.

7. **How it works (3 steps)**
   - Sign in → Create or join a room → Teach or attend.
   - Numbered, horizontal on desktop, stacked on mobile.

8. **Security / trust (verified only)**
   - `Dual-layer JWT verification`
   - `Hashed refresh tokens with reuse detection`
   - `Role-based dashboard access`
   - `Chunked recording uploads`
   - No "bank-grade", "military-grade", "E2E" unless implemented.

9. **Audience (3 role cards)**
   - Students: join, recordings, groups.
   - Instructors: schedule, groups, analytics, recordings.
   - Admins: users, audit log.
   - Each links to the relevant explanation, not to a dead page.

10. **Final CTA band**
    - "Ready when your class is." + primary `Start a meeting` + secondary `Sign in`.

11. **Footer**
    - 4 columns: Product, For you, Resources, Legal.
    - Real links only. If Privacy/Terms do not exist, either create minimal pages or remove the links. Never ship `href="#"`.
    - Keep social icons only if the accounts exist.

### Copy rules

- No "AI-powered", "neural", "crystal clarity", "future of conferencing", "revolutionary".
- Verbs first: start, join, share, record, review.
- Every number and claim must be traceable to the README or the backend.
- Remove "4K", "proprietary streaming protocol", "end-to-end encryption" unless the team confirms them.

---

## 7. Auth blueprint

### New shared shell: `frontend/src/app/(auth)/layout.tsx`

Desktop (≥1024px): `grid-cols-[minmax(0,480px)_1fr]` or a 45/55 split.

- **Left brand panel (desktop only)**
  - Solid `#0B1220` or `#0F172A` panel, not a gradient. Subtle 1px grid at 2% opacity is acceptable; no orbs.
  - Mark + wordmark, one-line value prop, 3 short reassurances with check icons.
  - Compact `MeetingPreview` or a real screenshot, cropped to fit.
  - Bottom: "Privacy · Terms · Help" and a small copyright.
- **Right form panel**
  - White/light canvas, centered column, `max-w-[400px]`.
  - Top row: mobile logo, `Back to home` link.
  - Page title 30-32px, subtitle 15-16px muted.
  - Form, then a single footer link to the alternate auth page.
- Remove the `AuthWrapper` gradient orbs, `animate-gradient-shift`, `animate-orb-float-*`, and the gradient title.

### Page matrix

| Route | Title | Fields / actions | Notes |
|---|---|---|---|
| `/sign-in` | Sign in | Google, email, password, forgot link, submit | Footer: "New to NeuroMeet? Create an account" |
| `/sign-up` | Create your account | Google, name, email, password, confirm, terms checkbox, submit | Footer: "Already have an account? Sign in" |
| `/forget-password` | Reset your password | Email, submit | Always show the same success confirmation (no account enumeration) |
| `/reset-password` | Set a new password | Password, confirm, rule list, submit | On success, go to sign-in with a success banner |
| `/verify-email` | Check your email | Masked email, 6-box OTP, resend timer, change email | Support paste; `autocomplete="one-time-code"` |
| `/setting-profile` | Finish your profile | Avatar upload, save, skip | Wider form (480px), same shell |

### Form UX details

- Input height 44-48px, label 14px/500, helper 13px, error 13px.
- Visible labels always. No placeholder-as-label.
- `autocomplete`: `email`, `current-password`, `new-password`, `name`, `one-time-code`.
- `inputMode`: `email`, `numeric` for OTP.
- Show/hide password inside the field, right-aligned, 36px hit area.
- Caps Lock hint on password fields.
- Error summary at the top of the form on submit, with `role="alert"`; field errors use `aria-describedby`.
- Loading: spinner + verb ("Signing in...", "Creating account..."), button disabled, no layout shift.
- Prevent double submit.
- Success states are explicit screens, not just a toast.
- Remove `autoFocus` from the email field; focus the first field only after the page is interactive if desired.
- Demo credentials: move behind `NODE_ENV !== "production"` or an env flag. If they must stay, present them as a quiet "Demo access" text link and remove the `Sparkles` icon and `⚡` emoji.

### Auth accessibility

- `<main>` landmark, one `<h1>` per page.
- Logo link has an accessible name.
- All icon buttons have `aria-label`.
- Focus order: Google → email → password → forgot → submit.
- Minimum 44x44px targets.
- Error color is not the only signal; icon + text accompany it.

---

## 8. UX facilities to add

| Priority | Facility | Why |
|---|---|---|
| P0 | Shared auth shell with logo, back link and trust row | Removes the "orphan card" feeling |
| P0 | Consistent field system (height, labels, errors, focus) | Biggest perceived-quality jump |
| P0 | Show/hide password inside the field | Current block overlay feels broken |
| P0 | OTP paste + 6 boxes + resend timer | Current single input is error-prone |
| P0 | Scoped light/dark theme + toggle | Requested direction, without touching dashboards |
| P0 | Mobile nav sheet for the landing header | Current header has no navigation at all |
| P1 | Compact join strip with paste-link parsing | Removes the duplicate hero card |
| P1 | Copy meeting link feedback | Already partly implemented via `useCopyFeedback` |
| P1 | Form-level error/success banners with `aria-live` | Current errors are easy to miss |
| P1 | Skeleton states for auth and product preview | Avoids layout jank |
| P1 | Sanitized product screenshots | Replaces AI illustrations |
| P2 | "Continue to dashboard" for signed-in users on `/` | `Avtar.tsx` already resolves the role |
| P2 | Empty-state illustrations (line icons only) | For recordings/groups later |
| P2 | Reduced-motion and high-contrast passes | Accessibility and polish |

---

## 9. File-level implementation map

### New files

```
frontend/src/app/(auth)/layout.tsx
frontend/src/features/auth/components/auth-shell.tsx
frontend/src/features/auth/components/auth-card.tsx
frontend/src/features/auth/components/google-button.tsx
frontend/src/features/auth/components/form-alert.tsx
frontend/src/features/auth/components/otp-input.tsx
frontend/src/features/landing/components/header.tsx
frontend/src/features/landing/components/meeting-preview.tsx
frontend/src/features/landing/components/join-strip.tsx
frontend/src/features/landing/components/proof-strip.tsx
frontend/src/features/landing/components/product-tour.tsx
frontend/src/features/landing/components/how-it-works.tsx
frontend/src/features/landing/components/security.tsx
frontend/src/features/landing/components/audience.tsx
frontend/src/features/landing/components/cta-band.tsx
frontend/src/components/providers/theme-provider.tsx   (replace commented stub)
frontend/src/components/theme/theme-toggle.tsx
frontend/src/styles/theme-public.css                     (or a section in globals.css)
frontend/public/brand/*                                  (fresh screenshots / og image)
```

### Modified files

```
frontend/src/app/page.tsx                     rebuild section order, remove background image
frontend/src/app/layout.tsx                   theme provider, metadata cleanup
frontend/src/app/globals.css                  add .theme-public tokens, fix typo, prune unused motion
frontend/src/features/landing/index.ts        export new sections
frontend/src/features/landing/components/{Hero,QuickJoin,NeuroFeatures,NeuroFooter,Avtar,Logo}.tsx
frontend/src/features/auth/providers/auth-wrapper.tsx   deprecate after shell lands
frontend/src/features/auth/components/{authTabs,password-input,password-strength-ui}.tsx
frontend/src/app/(auth)/sign-in/sign-in.tsx
frontend/src/app/(auth)/sign-up/sign-up.tsx
frontend/src/app/(auth)/forget-password/forget-password.tsx   + fix missing comma blocker
frontend/src/app/(auth)/reset-password/reset-password.tsx
frontend/src/app/(auth)/verify-email/otp-form.tsx
frontend/src/app/(auth)/setting-profile/setting-profile.tsx
frontend/src/components/ui/{button,input,card}.tsx           additive variants only
```

### Explicitly untouched

```
frontend/src/app/(main)/**                 all dashboards, livekit, meeting join
frontend/src/features/dashboard-*/**       layouts and components
frontend/src/features/livekit/**           meeting room
backend/**                                 no API changes
frontend/src/features/auth/actions/**      no action contract changes
frontend/src/validations/**                no schema changes (except optional OTP paste support)
```

No route renames. No form `name`/`id` renames. No server action signature changes.

---

## 10. Phases

| Phase | Work | Estimate |
|---|---|---|
| 0 | Fix `forget-password.tsx` syntax blocker, run `bun run build`, capture baseline screenshots, write `PRODUCT.md` + `DESIGN.md`, add scoped `.theme-public` tokens | 0.5 day |
| 1 | Primitives: button `xl`, input `lg`, card `surface`, `FormAlert`, `GoogleButton`, `PasswordField`, `OtpInput`, theme provider/toggle | 1 day |
| 2 | Landing: header, hero + meeting preview, join strip, proof, features, product tour, how it works, security, audience, CTA, footer | 2 days |
| 3 | Auth: `(auth)/layout.tsx` shell, sign-in, sign-up, forgot, reset, verify, profile | 2 days |
| 4 | Responsive + a11y + dark mode + visual regression + Lighthouse + copy audit | 1 day |

Total: ~6.5 working days for the scoped milestone.

---

## 11. Acceptance criteria

### Functional

- `bun run build` passes with no new type errors.
- Sign-in, sign-up, Google OAuth, forgot/reset, OTP resend and profile save all work exactly as today.
- Redirect cookie flow after joining a meeting still works.
- Every form field keeps its current `name`, `id` and `autoComplete` semantics.

### Visual

- No gradient text, gradient buttons, orbs, glass, nebula or glow on `/` and `(auth)`.
- Header 64px, hero readable at 360px, no horizontal scroll at 360/390/768/1024/1440/1920.
- Dashboard screenshots at 1440px and 390px are pixel-identical before/after (visual diff).
- One primary blue across both surfaces.

### Accessibility

- Lighthouse Accessibility 100 on `/`, `/sign-in`, `/sign-up`.
- All text meets WCAG AA; body text targets AAA where possible.
- Keyboard-only pass for every auth flow.
- Visible focus on every interactive element.
- `prefers-reduced-motion` disables all decorative motion.
- One `<h1>` per page, landmarks present, `aria-live` on errors.

### Performance

- Lighthouse Performance ≥ 95 on `/` at mobile.
- CLS < 0.1 for the hero and product tour.
- No full-screen decorative image in the critical path.
- New screenshots served as AVIF/WebP with explicit dimensions.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Token changes leak into dashboards | Scope all new tokens under `.theme-public`; never edit `:root` dark values in this milestone |
| Auth server actions depend on current DOM/form data | Keep field names and form `action` handlers; only change markup around them |
| `forget-password.tsx` is already broken in the working tree | Fix as Phase 0, first commit, before any UI work |
| `ignoreBuildErrors: true` hides regressions | Run `tsc --noEmit` manually in Phase 0 and 4; remove the flag after the milestone |
| Demo credentials ship to production | Gate behind env/dev; if intentionally public, label them clearly and rotate them |
| Unverified marketing claims | Copy audit against README/backend in Phase 4; delete anything not provable |
| Product screenshots contain dummy data/watermark | Re-capture with clean demo data, or use the hand-built `MeetingPreview` instead |
| Light public + dark dashboard feels inconsistent | Accept for Phase 1; document Phase 2 migration of dashboards |
| Removing `effect`/`live`/`gradient` breaks dashboards | Do not remove them; only stop using them on public/auth |

---

## 13. Open decisions

1. **Final blue:** `#175CD3` (deeper, institutional) vs `#2563EB` (brighter, closer to Zoom). Recommendation: `#175CD3` for light, `#2563EB` for dark.
2. **Product visuals:** capture fresh screenshots from the running app with clean demo data, or ship the hand-built `MeetingPreview` only in this phase? Recommendation: build the JSX preview first, add screenshots in Phase 4.
3. **Demo credentials:** keep public for the graduation demo, or gate behind `NODE_ENV`? Recommendation: keep for demo, gate for production.
4. **Nav links:** which real pages exist for Product / Security / For education? If none, use in-page anchors, not dead links.
5. **Legal pages:** Privacy and Terms currently point to `#`. Create minimal pages or remove the links.
6. **Dark mode toggle placement:** header (public) and auth footer, or system-only? Recommendation: header toggle + persist.

---

## 14. First implementation move

1. Fix `forget-password.tsx:21` (missing comma) and confirm `bun run build`.
2. Add `.theme-public` tokens and the theme provider without touching dashboard tokens.
3. Build the auth shell and the field system first, because every auth page inherits it.
4. Rebuild `/` last, once the primitives are proven.
