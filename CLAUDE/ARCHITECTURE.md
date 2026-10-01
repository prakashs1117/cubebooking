# Architecture

## Overview
Curiosity Booking is a **React + TypeScript + Vite** single-page application backed by **Firebase** (Auth, Firestore, Storage, Cloud Functions, Analytics). It is responsive-first (mobile/tablet/desktop) and PWA-installable, with an architecture that does not block wrapping it in Capacitor/React Native later.

## Frontend
- **Framework**: React 18 + TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS + CSS custom properties (theming: light/dark/system)
- **UI primitives**: Radix UI (dialogs, accordion, popovers) — headless, styled with Tailwind
- **State**:
  - **Zustand** for the booking flow wizard state (ephemeral, client-only, step-by-step)
  - **TanStack Query** for all server/Firestore data fetching, caching, and invalidation
- **i18n**: React Intl, full English + German coverage, no hardcoded UI strings
- **Routing**: React Router (or equivalent), with protected routes gated by role

## Backend (Firebase)
- **Auth**: Email/password, Google OAuth, magic link (email link sign-in)
- **Firestore**: `bookings`, `slots`, `users` collections (see Data Model below)
- **Storage**: Pre-visit kit assets, consent template files, any uploaded documents
- **Cloud Functions**: Server-side logic that must not run on the client — booking validation, slot capacity enforcement, TOAD approval workflow, role checks, QR code payload signing/verification, notification triggers
- **Analytics**: Firebase Analytics for usage tracking (booking funnel, drop-off points)

## Deployment
- **Hosting**: Firebase Hosting (or Vercel — decide in DECISIONS.md if changed)
- **PWA**: Web manifest + service worker for installability and offline caching of previously loaded bookings

## High-Level Data Flow

```
Teacher / Staff (browser, PWA)
        |
        v
   React UI (Vite build)
        |
        +--> Zustand (booking wizard local state)
        |
        +--> TanStack Query
                |
                v
        Firebase SDK (client)
                |
        +-------+--------+
        |                |
    Firestore        Firebase Auth
        |
        v
  Cloud Functions (validation, TOAD approval,
  QR verification, notifications)
```

## Data Model (Firestore)

### `users/{uid}`
```
{
  uid: string,
  email: string,
  displayName: string,
  school: string,
  role: "user" | "coordinator" | "admin",   // MUST be explicitly set — no default
  language: "en" | "de",
  theme: "light" | "dark" | "system",
  createdAt: Timestamp
}
```
> A user with no document, or no `role` field, has **no elevated access**. This is intentional (see SECURITY.md and MEMORY.md known issue).

### `bookings/{bookingId}`
```
{
  bookingId: string,
  teacherUid: string,
  program: "cube" | "lab" | "combo" | "toad",
  slotId: string | null,          // null for TOAD until scheduled
  status: "pending" | "confirmed" | "arrived" | "cancelled",
  classDetails: {
    grade: string,
    studentCount: number,
    accessibilityNeeds: string
  },
  qrPayload: string,               // signed token, verified server-side
  createdAt: Timestamp,
  visitDate: Timestamp,
  approvalDeadline: Timestamp | null   // TOAD only, +3 working days
}
```

### `slots/{slotId}`
```
{
  slotId: string,
  program: "cube" | "lab" | "combo",
  startTime: Timestamp,
  endTime: Timestamp,
  capacity: number,      // max 30 students
  bookedCount: number,
  isAvailable: boolean
}
```

## Folder Structure

```
src/
├── app/                # Routing, layout shells, providers
├── components/         # Reusable, presentational UI (Radix-based)
├── features/
│   ├── auth/
│   ├── booking/        # 6-step wizard, Zustand store lives here
│   ├── my-bookings/
│   ├── pre-visit-kit/
│   ├── profile/
│   ├── notifications/
│   ├── admin-dashboard/
│   └── qr-scanner/
├── services/           # Firebase access layer (auth.ts, bookings.ts, slots.ts, users.ts)
├── lib/                # Firebase init, query client, i18n setup, theme engine
├── types/              # Shared TypeScript types/interfaces
└── utils/              # Pure helper functions (date formatting, QR encoding, etc.)
```

## Architectural Rules

- UI components must **not** contain Firestore/Firebase logic directly — all reads/writes go through `services/`.
- Business logic (slot capacity checks, TOAD approval rules, role checks) lives in Cloud Functions or `services/`, never duplicated in components.
- Zustand is **only** for the booking wizard's transient client state — it must never hold data that Firestore already owns as source of truth.
- TanStack Query owns all server data caching; do not hand-roll `useEffect` fetches.
- Every role-gated route must verify the role **server-side** (Firestore security rules + Cloud Functions), not just hide UI client-side.
- Every user-facing string goes through React Intl — no hardcoded English/German text in components.
- Reusable UI (buttons, cards, modals) lives in `components/`; feature-specific UI lives in `features/<feature>/`.
- The app must render correctly at 375px, 768px, and 1440px breakpoints — no feature ships without checking all three.

## Platform Strategy

- **v1**: Responsive web app, installable as a PWA (manifest + service worker), offline-read for previously cached bookings.
- **Later (not v1, but architecture must support it)**: Wrapping the PWA in Capacitor for native app store distribution. To keep this possible:
  - Avoid browser-only APIs without a fallback (e.g., camera access for QR scanning should use a well-supported, Capacitor-compatible library).
  - Keep all business logic out of the DOM layer so it is portable.
