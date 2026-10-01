# Architecture Decisions

## ADR-001
**Decision:** Use Firebase (Auth, Firestore, Storage, Cloud Functions, Analytics) as the backend.
**Reason:** Provides authentication, a real-time database, file storage, and serverless functions without managing separate infrastructure — matches the project's need to ship fast with a small team while remaining production-grade.

## ADR-002
**Decision:** Use React + TypeScript + Vite instead of a meta-framework (e.g. Next.js).
**Reason:** The app is a client-heavy SPA (booking wizard, dashboard, scanner) with Firebase handling backend concerns directly from the client SDK plus Cloud Functions for privileged logic — no need for server-rendering or a Node backend layer.

## ADR-003
**Decision:** Use Zustand for booking wizard state and TanStack Query for all server data.
**Reason:** Keeps a clean separation between transient UI/flow state (Zustand) and server-synced data with caching/invalidation (TanStack Query), avoiding hand-rolled `useEffect` data fetching and state duplication.

## ADR-004
**Decision:** Use React Intl for i18n with full English + German coverage from day one.
**Reason:** Merck operates in Germany; German-speaking teachers are a primary audience. Retrofitting i18n later is costly — building it in from the start avoids hardcoded strings and layout breakage.

## ADR-005
**Decision:** Ship as a responsive PWA in v1, not a native app.
**Reason:** Covers mobile, tablet, and desktop teacher/staff usage without app store distribution overhead. Architecture (clean service layer, no browser-API lock-in without fallback) is kept compatible with a future Capacitor/React Native wrapper if native distribution is needed later.

## ADR-006
**Decision:** QR code payloads are signed and verified server-side via Cloud Functions, never trusted from client-decoded data alone.
**Reason:** Check-in status ("Arrived") is an operational record Merck staff rely on; it must not be spoofable by anyone who can generate an arbitrary QR image.

## ADR-007
**Decision:** A missing Firestore `users/{uid}` document or missing `role` field means **no elevated access** — never a default fallback to `coordinator`/`admin`.
**Reason:** Fail-closed is the safer default for role-based access to the Admin Dashboard and QR Scanner. This explains the current state where `admin@merckgroup.com` has no visible scanner access — it is intended behavior pending an operational fix (create the missing user document), not a code defect.
