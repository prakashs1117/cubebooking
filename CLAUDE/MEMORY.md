# Project Memory

## Current Status
App is live and largely feature-complete for MVP. Hosted on Vercel (not Firebase Hosting — see open questions). Known gaps listed below.

---

## Completed

### Phase 0 — Setup ✅
- Vite + React + TypeScript project
- Tailwind CSS + CSS custom properties (light/dark/system theming)
- Firebase project (Auth, Firestore, Analytics) — project ID: `mer-booking-tool`
- React Intl with `en` and `de` message catalogs
- TanStack Query provider
- Zustand booking store
- Radix UI primitives (Dialog, Accordion, Popover)
- PWA web manifest (`/public/manifest.webmanifest`)

### Phase 1 — Authentication ✅
- Email/password sign-in
- Google OAuth sign-in
- Magic link sign-in
- `users/{uid}` document created on first sign-in (no role field by default — fail-closed)
- Protected routes (`ProtectedRoute` component)
- Role-aware route guard (`requireStaff` prop on `ProtectedRoute`)

### Phase 2 — Booking Flow ✅ (partial)
- 6-step modal wizard: visit type → program → time slot → class details → review → confirmed
- Zustand store (`bookingStore`) for wizard state
- `slots` and `teacherSlots` Firestore collections with atomic batch writes (double-booking prevention)
- Booking confirmation with `bookingCode` field
- QR code generated client-side on confirmation ⚠️ (should be server-signed — see gaps)
- TOAD booking type exists but **approval workflow not implemented**

### Phase 3 — My Bookings ✅
- Upcoming/Past tabs
- Booking detail page (status, program, time, grade, students, QR code)
- Cancel booking with confirmation dialog
- Add-to-calendar (`.ics` download)

### Phase 4 — Pre-Visit Kit ✅ (partial)
- Arrival & parking info
- Programme overview
- Parent consent template (static text, not Storage download yet)
- Class preparation guide
- Readiness ring UI exists but **hardcoded at 72%** — not persisted per booking ⚠️

### Phase 5 — Profile ✅
- Edit name/school
- Language toggle (EN/DE) wired to React Intl
- Theme toggle (light/dark/system)
- FAQ dialog
- Feedback form
- Terms of Use dialog
- Privacy Policy dialog

### Phase 6 — Notifications ✅ (partial)
- Notification bell UI with popover
- Static/placeholder notifications — **not wired to Firestore or Cloud Functions** ⚠️

### Phase 7 — Home Page ✅
- Greeting (morning/afternoon/evening)
- Next visit hero card with countdown, QR toggle, booking code
- Quick actions row
- Upcoming visits mini-list
- Book a visit cards (onsite + TOAD)
- Staff scanner banner (visible to coordinator/admin roles)

### Phase 8 — Admin Dashboard ✅
- `/admin` route, role-gated (`coordinator`/`admin`)
- Today's bookings list sorted by status then time
- Colour-coded by program
- Status chips (confirmed/arrived/cancelled)

### Phase 9 — QR Scanner & Verification ✅ (partial)
- `/admin/scan` route with camera QR scanner + manual fallback
- `/admin/verify/:id` route to mark booking "Arrived"
- Mark "Arrived" writes directly to Firestore client-side ⚠️ (should go through Cloud Function — see gaps)

### Phase 10 — Polish ✅ (partial)
- EN + DE i18n (audit needed for completeness)
- Responsive layout (mobile/tablet/desktop)
- Maintenance mode banner + modal
- Firebase Analytics with 40+ event tracking functions

---

## Known Gaps / Open Issues

| # | Issue | Priority | Notes |
|---|---|---|---|
| 1 | `admin@merckgroup.com` has no Firestore user doc | High | Operational fix: create `users/{uid}` with `role: "admin"`. Not a code bug (ADR-007). |
| 2 | QR codes are client-generated | High | Should be server-signed via Cloud Function (ADR-006, SECURITY.md). Currently just encodes booking ID. |
| 3 | "Mark Arrived" is a direct Firestore write | High | Must go through a Cloud Function with server-side role check (SECURITY.md). |
| 4 | TOAD approval workflow missing | Medium | Staff need approve/reject UI. Booking stays `pending` forever currently. |
| 5 | Kit readiness ring hardcoded at 72% | Medium | Needs per-booking completion state persisted in Firestore. |
| 6 | Notifications not wired to Firestore | Medium | Bell shows placeholder UI only — no real notification documents or Cloud Function triggers. |
| 7 | Consent template is static text | Low | PRD/TASKS call for a downloadable file from Firebase Storage. |
| 8 | Slot capacity not enforced server-side | High | Max 30 students validated in UI only — Cloud Function needed (RULES.md, SECURITY.md). |
| 9 | German i18n completeness not audited | Medium | `de.ts` parity with `en.ts` not verified. |
| 10 | `prefers-reduced-motion` not implemented | Low | Countdown timer and readiness ring have no reduced-motion fallback (DESIGN.md). |

---

## Open Questions

- **Hosting:** Currently Vercel. `ARCHITECTURE.md` still says Firebase Hosting. Update ARCHITECTURE.md if Vercel is the final decision (update DECISIONS.md with an ADR).
- **TOAD approval notification channel:** In-app only, or also email?
- **Add-to-calendar format:** `.ics` download is implemented — confirm if Google Calendar link is also needed.

---

## Current Branch
`feat/slot-booking-rules`

## Next Priorities
1. Fix `admin@merckgroup.com` user doc (operational)
2. TOAD approval workflow (staff UI)
3. Kit readiness ring persistence
4. Cloud Function for "Mark Arrived" (security)
5. Cloud Function for QR signing (security)

---

*Update this file at the end of every work session: what's done, what's in progress, what's broken, what's next.*
