# Tasks

## Phase 0: Setup ✅

- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS + CSS custom properties (theming)
- [x] Configure ESLint + Prettier
- [x] Configure Git + GitHub repo
- [x] Create Firebase project (Auth, Firestore, Storage, Functions, Analytics)
- [x] Set up `.env.local` from `.env.example`
- [x] Set up React Intl with `en`/`de` message catalogs
- [x] Set up TanStack Query provider
- [x] Set up Zustand (booking store)
- [x] Set up Radix UI base components (Dialog, Accordion, Popover)
- [x] Configure PWA manifest

## Phase 1: Authentication ✅

- [x] Create signup/login page (email/password)
- [x] Add Google OAuth sign-in
- [x] Add magic link sign-in
- [x] Create `users/{uid}` document on first sign-in (role omitted — fail-closed by default)
- [x] Protect authenticated routes (redirect to login if signed out)
- [x] Add role-aware route guard (client-side UX layer)
- [ ] Write Firestore Security Rules for `users` collection — needs audit
- [ ] Test authentication (see TEST_PLAN.md)

## Phase 2: Booking Flow ✅ (partial)

- [x] Design Zustand store for the 6-step wizard
- [x] Step 1: Visit type selection (onsite vs. TOAD)
- [x] Step 2: Program selection (Cube / Lab / Combo / TOAD), with combo order picker
- [x] Step 3: Time slot selection (query `slots` via TanStack Query)
- [x] Step 4: Class details form (grade, student count ≤30, accessibility needs)
- [x] Step 5: Review screen
- [x] Step 6: Confirmation screen (instant for Cube/Lab/Combo, pending for TOAD)
- [x] Booking creation with atomic slot writes (double-booking prevention)
- [ ] `services/bookings.ts` — dedicated service layer (currently logic is in hooks/components)
- [ ] **Cloud Function: enforce slot capacity server-side** ⚠️ SECURITY GAP
- [ ] **Cloud Function: TOAD approval workflow (pending → confirmed/rejected, 3-working-day deadline)** ⚠️ MISSING FEATURE
- [ ] **Generate signed QR payload on confirmation (server-side)** ⚠️ SECURITY GAP — currently client-generated
- [ ] Add tests for booking creation, validation, and TOAD flow

## Phase 3: My Bookings ✅

- [x] Upcoming/Past tabs UI
- [x] Booking detail view (status, QR code, program info)
- [x] Add-to-calendar action (.ics download)
- [x] Cancel booking flow (confirmation + Firestore update)
- [ ] Authorization check: teacher can only see/cancel their own bookings — needs Firestore rules audit
- [ ] Add tests

## Phase 4: Pre-Visit Kit ✅ (partial)

- [x] Arrival & parking info content block
- [x] Programme overview content block
- [ ] Parent consent template — static text only; needs downloadable file from Firebase Storage
- [x] Class preparation guide content block
- [x] Readiness ring component (UI exists)
- [ ] **Persist kit-item completion state per booking** ⚠️ Currently hardcoded at 72%
- [ ] Add tests

## Phase 5: Profile ✅

- [x] Edit name/school
- [x] Language toggle (EN/DE) wired to React Intl
- [x] Theme toggle (light/dark/system) wired to CSS custom properties
- [x] Privacy settings
- [x] FAQ page
- [x] Feedback form
- [x] Terms of Use / Privacy Policy pages
- [ ] Add tests

## Phase 6: Notifications ⚠️ (UI only)

- [ ] Notification data model + Firestore collection — not implemented
- [x] Notification bell UI with popover (placeholder only)
- [ ] **Trigger notifications on booking status changes (Cloud Function)** — not implemented
- [ ] Mark-as-read behavior — not implemented
- [ ] Add tests

## Phase 7: Home Page ✅

- [x] Greeting + next upcoming visit hero card
- [x] Countdown timer
- [x] QR code toggle on hero card
- [x] Quick actions (book a visit, view kit, etc.)
- [x] Staff scanner banner (for coordinator/admin roles)
- [ ] `prefers-reduced-motion` fallback for countdown + progress ring
- [ ] Add tests

## Phase 8: Admin Dashboard ✅

- [x] `/admin` route, role-gated (`coordinator`/`admin`)
- [x] Today's bookings list, sorted by status then time
- [x] Colour-coded program chips
- [x] Status chips (confirmed/arrived/cancelled)
- [ ] Firestore Security Rules for staff read access — needs audit
- [ ] Add tests

## Phase 9: QR Scanner & Verification ✅ (partial)

- [x] `/admin/scan` route, role-gated
- [x] Camera-based QR scanning component
- [x] Manual booking ID fallback entry
- [ ] **Cloud Function: verify QR/booking ID, mark "Arrived" server-side** ⚠️ SECURITY GAP — currently direct Firestore write
- [x] `/admin/verify/:id` route + UI
- [ ] Add tests

## Phase 10: Polish & Launch Readiness

- [ ] Full i18n audit (every string in `en` and `de`)
- [ ] Responsive audit at 375/768/1440px
- [ ] Accessibility audit (keyboard nav, focus rings, contrast, reduced motion)
- [ ] Security review against `docs/SECURITY.md`
- [ ] Firestore Security Rules full review
- [ ] Lint, typecheck, test, build all pass
- [ ] Deploy to preview, run QA per TEST_PLAN.md
- [ ] **Fix `admin@merckgroup.com` missing role document** (operational task — create `users/{uid}` with `role: "admin"`)
- [ ] Production deploy

## Operational / Immediate

- [ ] Create Firestore `users/{uid}` doc for `admin@merckgroup.com` with `role: "admin"`
- [ ] Decide and document hosting (Vercel vs Firebase Hosting) — update ARCHITECTURE.md + add ADR to DECISIONS.md
