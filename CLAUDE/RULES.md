# Development Rules

## General
- Use TypeScript everywhere; no implicit `any`.
- Reuse existing components in `components/` before creating new ones.
- Do not duplicate business logic — Firestore/Cloud Functions logic lives in `services/`, never copy-pasted into components.
- Keep functions small and single-purpose.
- Do not modify unrelated files in a task.

## Before Coding
- Read `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `TASKS.md` before touching code.
- Inspect existing implementation for the feature area first.
- Reuse existing functionality (services, hooks, components) where possible.
- For any change touching more than one file, state the plan before implementing.

## UI
- Follow `docs/DESIGN.md` exactly (colors, typography, spacing tokens, component variants).
- Maintain responsive design at 375px / 768px / 1440px.
- Every async view needs a loading state (skeleton), an empty state, and an error state.
- All user-facing text goes through React Intl (`en` and `de`) — no hardcoded strings.
- Respect `prefers-reduced-motion` for countdowns, progress rings, and transitions.

## Booking Flow (Zustand)
- Zustand store holds only transient wizard state (current step, draft selections) — never long-term source of truth.
- On step 6 (confirmation), the draft is submitted through `services/bookings.ts` and the Zustand store is reset.
- Never persist the Firestore-confirmed booking back into Zustand as the canonical copy — TanStack Query owns that.

## Roles & Access
- Every protected route checks role via the authenticated user's Firestore `users/{uid}.role`.
- Client-side role checks are for UX only (hiding nav items) — the real enforcement is Firestore Security Rules and Cloud Functions.
- Never assume a missing `role` field means `"user"` — treat it as "no access" and prompt the person to contact an admin.

## Security
- Never expose Firebase Admin credentials or Cloud Functions secrets in client code.
- Validate all user input client-side (fast feedback) AND server-side (Cloud Functions / Security Rules — source of truth).
- QR payloads are signed server-side and verified server-side on scan — never trust a client-decoded QR payload as proof of a valid booking.
- Enforce slot capacity (max 30 students) in a Cloud Function, not just in the UI.

## i18n
- Add every new string to both `en` and `de` message catalogs in the same PR/task.
- Do not ship a feature with missing German translations.
- Account for German text length (~15-20% longer) in layout — no fixed-width truncation that breaks on `de`.

## Testing
- Add tests for booking flow logic, role-gated routes, and QR verification.
- Run lint, typecheck, and tests after every implementation before marking a task complete.
- Fix failing tests before continuing to the next task.

## Git
- Small, focused commits.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- One feature/task per branch (`feature/booking-flow`, `feature/qr-scanner`, `fix/admin-role-check`).
