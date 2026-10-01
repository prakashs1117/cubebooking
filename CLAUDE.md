# Curiosity Booking — Claude Instructions

## MANDATORY: Read all docs before every session and every code change

Before touching any code, read ALL files in `CLAUDE/` in this order:

1. `CLAUDE/README.md`
2. `CLAUDE/PRD.md`
3. `CLAUDE/ARCHITECTURE.md`
4. `CLAUDE/DESIGN.md`
5. `CLAUDE/RULES.md`
6. `CLAUDE/SECURITY.md`
7. `CLAUDE/DECISIONS.md`
8. `CLAUDE/TASKS.md`
9. `CLAUDE/MEMORY.md`
10. `CLAUDE/TEST_PLAN.md`

These files are the single source of truth for this project. Code that ignores them will conflict with established decisions and standards.

## Quick reference

- **Stack:** React 18 + TypeScript + Vite + Firebase + Zustand + TanStack Query + React Intl + Radix UI + Tailwind
- **Primary color:** `#6366F1` (Indigo) — see DESIGN.md for full token set
- **Font:** Inter (single family)
- **i18n:** Every string in both `en` AND `de` in the same commit — no exceptions
- **Services layer:** No Firebase logic in components — all reads/writes go through `services/`
- **Roles:** `user` | `coordinator` | `admin` — missing role = no elevated access (ADR-007, fail-closed)
- **Loading states:** Skeletons, not spinners
- **QR codes:** Must be server-signed (Cloud Function) — never client-generated plain IDs

## Known issues (update CLAUDE/MEMORY.md as things change)

- `admin@merckgroup.com` has no Firestore user doc — create `users/{uid}` with `role: "admin"`
- Kit readiness ring hardcoded at 72% — needs real persistence
- QR currently client-generated — needs Cloud Function signing (ADR-006)
- TOAD approval workflow not yet implemented

## After every work session

Update `CLAUDE/MEMORY.md` and `CLAUDE/TASKS.md` to reflect what changed.
