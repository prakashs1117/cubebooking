# Curiosity Booking

A STEM visit booking platform for Merck KGaA, Darmstadt, letting school teachers book educational experiences — Curiosity Cube, Curiosity Lab, Cube + Lab Combo, and TOAD Truck mobile lab visits — in under 3 minutes.

## Tech Stack
- React + TypeScript + Vite
- Firebase: Auth, Firestore, Storage, Cloud Functions, Analytics
- Zustand (booking wizard state) + TanStack Query (server data)
- React Intl (English + German)
- Tailwind CSS + CSS custom properties (theming)
- Radix UI primitives
- PWA-ready (web manifest + service worker)

## Documentation
See `docs/`:
- `PRD.md` — what we're building and why
- `ARCHITECTURE.md` — how it's built
- `DESIGN.md` — how it should look and feel
- `RULES.md` — how AI/developers should code on this project
- `TASKS.md` — current and upcoming work, phase by phase
- `DECISIONS.md` — permanent architectural decisions and why they were made
- `MEMORY.md` — current project state, known issues, next steps
- `TEST_PLAN.md` — what "working" means, feature by feature
- `SECURITY.md` — authentication, authorization, and data protection requirements

Cursor-specific rule files live in `.cursor/rules/`.

## Roles
| Role | Access |
|---|---|
| `user` (teacher) | Booking flow, own bookings, Pre-Visit Kit, profile |
| `coordinator` | + Admin Dashboard, QR Scanner, Verify booking |
| `admin` | Everything |

> A Firestore `users/{uid}` document with no `role` field means **no elevated access** — this is intentional fail-closed behavior, not a bug. See `docs/SECURITY.md` and `docs/DECISIONS.md` (ADR-007).

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project config
npm run dev
```

### Useful scripts
```bash
npm run dev         # start local dev server
npm run build       # production build
npm run lint        # lint
npm run typecheck   # TypeScript check
npm test            # unit/integration tests
```

## Project Structure
```
src/
├── app/            # routing, layout shells, providers
├── components/     # reusable UI
├── features/       # auth, booking, my-bookings, pre-visit-kit, profile,
│                   # notifications, admin-dashboard, qr-scanner
├── services/       # Firebase access layer
├── lib/            # Firebase init, query client, i18n, theme
├── types/          # shared TypeScript types
└── utils/          # pure helpers
```

## Contributing Workflow
Follow the loop in every task: **Read → Understand → Plan → Implement → Test → Review → Fix → Commit → Update docs.**
Use small, focused commits and update `TASKS.md`/`MEMORY.md` as you go.
