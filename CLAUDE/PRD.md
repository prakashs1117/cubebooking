# Product Requirements Document (PRD)

## Product
**Curiosity Booking**

## Problem
School teachers need a fast, reliable way to book educational STEM experiences at Merck KGaA, Darmstadt's facilities (or have a mobile lab visit their school). Today this process is slow, manual, and hard to track for both teachers and Merck staff running the programs.

## Target Users

### Primary: Teachers ("user" role)
- School teachers (any grade level) organizing class field trips or in-school STEM sessions.
- Goal: book a visit in under 3 minutes, know exactly what to prepare, and show up with confidence.

### Secondary: Merck Staff ("coordinator" / "admin" roles)
- Coordinators running the Curiosity Cube / Curiosity Lab / TOAD Truck programs day-to-day.
- Need to see today's bookings at a glance and check in arriving classes quickly.

## Goal
Give teachers a self-service booking experience for Merck STEM programs, and give Merck staff a simple operational dashboard to manage arrivals — all in one responsive, bilingual (EN/DE) web app.

## Core Features

1. Authentication (email/password, Google, magic link)
2. Home dashboard (teacher)
3. Book a visit (6-step guided flow)
4. My Bookings (upcoming/past, detail, cancel, add-to-calendar)
5. Pre-Visit Kit (arrival info, consent template, prep guide, readiness ring)
6. Profile & settings (language, theme, privacy)
7. In-app notifications
8. QR code generation (teacher) + QR scanning (staff)
9. Admin Dashboard (today's bookings)
10. Booking verification / check-in (staff)

## Programs (content model, not code)

| Program | Duration | Type | Confirmation |
|---|---|---|---|
| Curiosity Cube | 60 min | Hands-on exhibits (chem/bio/physics) | Instant, free, up to 30 students |
| Curiosity Lab | 60 min | Guided experiments with Merck scientists | Instant, free, up to 30 students |
| Cube + Lab combo | 2 × 60 min | Back-to-back, order selectable | Instant, free, up to 30 students |
| TOAD Truck | Variable | Mobile lab visits the school | Requires Merck approval within 3 working days |

## Roles & Access

| Role | Access |
|---|---|
| `user` (teacher) | Booking flow, own bookings, Pre-Visit Kit, profile |
| `coordinator` | Everything above + Admin Dashboard + QR Scanner + Verify booking |
| `admin` | Everything above |

> Every staff member **must** have a Firestore user document with an explicit `role` field. A missing user document means no elevated access is granted, by design — this is a known onboarding gap to fix operationally (see MEMORY.md), not a bug to code around.

## MVP (v1 scope)

**Teacher-facing**
- [ ] Signup / login (email/password, Google, magic link)
- [ ] Home page — greeting, next-visit hero card with countdown, QR toggle, quick actions
- [ ] Book a visit — 6-step modal: visit type → program → time slot → class details → review → confirmed
- [ ] My Bookings — upcoming/past tabs, detail view, cancel, add-to-calendar
- [ ] Pre-Visit Kit — arrival/parking info, programme overview, consent template, prep guide, readiness ring
- [ ] Profile — name/school edit, language toggle (EN/DE), theme (light/dark/system), privacy settings, FAQ, feedback, Terms, Privacy Policy
- [ ] In-app notification bell
- [ ] QR code per confirmed booking

**Staff-facing**
- [ ] Admin Dashboard (`/admin`) — today's bookings, sorted by status/time, colour-coded by program
- [ ] QR Scanner (`/admin/scan`) — camera scan + manual booking ID fallback
- [ ] Verify booking (`/admin/verify/:id`) — mark class "Arrived"

**Cross-cutting**
- [ ] Full English + German i18n
- [ ] Responsive layout: mobile, tablet, desktop
- [ ] PWA installable, works with the web manifest
- [ ] Light / dark / system theme

## Out of Scope (v1)

- Payments (all programs are free of charge)
- Native mobile app (iOS/Android store builds) — PWA only for now, but architecture must not block a later Capacitor/React Native wrapper
- Multi-tenant support for schools outside Merck's booking scope
- AI-based scheduling optimization
- Public API for third-party integrations
- SMS notifications (in-app + email only)
- Waitlist management for fully booked slots
- Teacher-to-teacher social features / reviews

## Success Criteria

A teacher should be able to:
1. Create an account and log in
2. Book a Curiosity Cube, Curiosity Lab, Combo, or TOAD Truck visit in under 3 minutes
3. See the visit confirmed instantly (Cube/Lab/Combo) or pending approval (TOAD)
4. View the booking with its QR code in My Bookings
5. Complete the Pre-Visit Kit and see the readiness ring reach 100%
6. Cancel a booking if plans change
7. Switch language between English and German at any time

A coordinator should be able to:
1. See all of today's bookings sorted by time and status
2. Scan a teacher's QR code (or enter the booking ID manually) to check in a class
3. Mark a booking as "Arrived"

## Non-Functional Requirements
- Booking flow completion target: **< 3 minutes** end-to-end
- Fully responsive: 375px (mobile) → 768px (tablet) → 1440px+ (desktop)
- Bilingual from day one (no hardcoded strings)
- Works offline for previously-loaded bookings (PWA cache), gracefully degrades booking actions when offline
