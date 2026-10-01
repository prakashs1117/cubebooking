# Security Requirements

## Authentication
- All routes except public marketing/login pages require authentication.
- Supported methods: email/password, Google OAuth, magic link (email link sign-in).
- Session state is managed via Firebase Auth SDK; no custom token storage in `localStorage`.

## Authorization
- Roles: `user`, `coordinator`, `admin` — stored in `users/{uid}.role` in Firestore.
- A user document with **no `role` field is treated as no elevated access** — this is the current, intended default. It must never silently fall back to `coordinator` or `admin`.
- `/admin`, `/admin/scan`, `/admin/verify/:id` are accessible only to `coordinator` and `admin` roles, enforced by:
  1. Client-side route guard (UX — redirect/hide nav)
  2. Firestore Security Rules (real enforcement for reads/writes)
  3. Cloud Functions role check (real enforcement for any server-side mutation, e.g. marking "Arrived")
- Teachers (`user` role) can only read/write their **own** bookings (`bookings.teacherUid == request.auth.uid`).

## Secrets
- Firebase client config (apiKey, projectId, etc.) is public by design for web SDKs — this is expected and not a secret leak.
- Firebase Admin SDK credentials and any third-party API keys used in Cloud Functions must **never** be committed to the repo or exposed to the client bundle.
- Use Cloud Functions environment config / Secret Manager for server-only secrets.

## Database (Firestore Security Rules)
- `users/{uid}`: readable/writable only by the owner for their own profile fields (name, language, theme); `role` field is writable only via a trusted server context (Cloud Function / admin console), never directly by the client.
- `bookings/{bookingId}`: teacher can create/read/update/cancel their own; coordinators/admins can read all and update `status`.
- `slots/{slotId}`: readable by any authenticated user; writable only by Cloud Functions (capacity enforcement).

## Input Validation
- Validate all form input client-side (booking flow: student count ≤ 30 for Cube/Lab/Combo, required grade level, etc.).
- Re-validate identically server-side in Cloud Functions before writing to Firestore — never trust the client.

## QR Codes
- QR payload = signed token (booking ID + short expiry/validity metadata), signed server-side.
- Verification on scan happens via a Cloud Function — never mark a booking "Arrived" purely from a client-decoded value.
- Manual booking ID fallback entry must go through the same server-side verification path as the scanned QR.

## TOAD Truck Approval Workflow
- TOAD bookings start as `pending` and require explicit staff approval within 3 working days.
- Approval/rejection is a privileged action — restricted to `coordinator`/`admin` roles server-side.

## File Uploads (Pre-Visit Kit assets, if teacher-uploaded content is ever added)
- Validate file type (allow-list, not deny-list).
- Validate file size limits.
- Sanitize/validate filenames before storing in Firebase Storage.

## Known Gap (tracked, not a bug to "fix" in code)
- `admin@merckgroup.com` currently has no Firestore user document / role, so the Admin Dashboard and QR Scanner are correctly hidden for that account. Resolution is an operational task (create the user document with the correct role), not a code change. See `MEMORY.md`.
