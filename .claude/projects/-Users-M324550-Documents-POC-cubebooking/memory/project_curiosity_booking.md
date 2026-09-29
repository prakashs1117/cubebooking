---
name: project-curiosity-booking
description: Full project context for Curiosity Booking app — purpose, stack, architecture, booking flow, data model, and current state as of 2026-09-29
metadata:
  type: project
---

# Curiosity Booking — Project Context

**Purpose:** Teachers in the Darmstadt area book onsite STEM visits (Curiosity Cube, Curiosity Lab, or both) or a TOAD truck outreach visit at Merck KGaA. Goal: under 3-minute booking, confirmed instantly.

**Why:** No sessions collection, no admin seed required — slot times are hardcoded in the app.

---

## Stack

- React 18 + TypeScript + Vite
- Zustand (booking store), React Query (@tanstack/react-query)
- Firebase: Firestore, Auth (Google + magic link + password), Cloud Functions v2 (Node 20)
- react-intl (i18n: `en`, `de`)
- Tailwind CSS + CSS custom properties (design tokens via `var(--*)`)
- Branch: `feat/slot-booking-rules` (push to GitHub: prakashs1117/cubebooking)

---

## Slot Config (hardcoded — `src/config/slots.ts`)

```ts
SLOT_HOURS = [8, 9, 10, 11, 13, 14, 15, 16]  // skip 12 (lunch)
COMBO_PAIRS = [[8,9], [10,11], [13,14], [15,16]]  // for "both" bookings
slotToDate(date, startHour)   // YYYY-MM-DD + int → local Date
slotEndDate(date, startHour)  // same + 60 min
dateToSlotKey(date, startHour) // → "YYYY-MM-DDThour" (map key)
```

**No Firestore `sessions` collection.** Slot existence is determined entirely by `SLOT_HOURS` / `COMBO_PAIRS`. To add or remove slots, edit `src/config/slots.ts` only.

---

## Data Model

### `BookingSegment` (`src/shared/types/index.ts`)
```ts
{ programId: ProgramId; order: number; date: string; startHour: number }
// NO sessionId — removed in refactor 2026-09-29
```

### `Booking` (`bookings` Firestore collection)
```ts
{
  type: 'onsite' | 'toad'
  teacherId, teacherName, teacherEmail, schoolId
  segments: BookingSegment[]
  grade, studentCount, accessNeeds
  status: 'confirmed' | 'pending' | 'cancelled'
  bookingCode: string   // CC-XXXX, client-generated, cosmetic only (not unique-enforced)
  createdAt: Timestamp
}
```

**Slot identity = `programId + date + startHour`.** A slot is "taken" when any confirmed/approved/pending booking has a segment matching all three.

### `SelectedSlot` (`src/stores/bookingStore.ts`)
```ts
{ programId: ProgramId; date: string; startHour: number; start: Date; end: Date }
```

---

## Booking Flow (4 steps)

| Step | Route | Page | Behaviour |
|------|-------|------|-----------|
| 1 | `/book` | `BookPage` | Tap visit type → navigates immediately (no Continue button) |
| 2 | `/book/programs` | `BookProgramsPage` | Tap program → navigates immediately; "Both" reveals order picker, tap order → navigates |
| 3 | `/book/time` | `BookTimePage` | Pick day from week grid, tap slot pill → navigates immediately |
| 4 | `/book/details` | `BookDetailsPage` | Class details form → Continue |
| — | `/book/review` | `ReviewPage` | Summary → Confirm (writes to Firestore) |
| — | `/book/confirmed` | `ConfirmedPage` | Success + calendar link |

**No Continue buttons on steps 1–3.** One tap = next screen.

### Time picker layout (`/book/time`)
Slots grouped into two horizontal scroll rows:
- ☀️ **Morning** — hours 8, 9, 10, 11
- 🌤 **Afternoon** — hours 13, 14, 15, 16

Each slot is a pill card (88px wide single, 104px combo). Disabled slots show "Booked" or "Your booking" badge instead of duration badge. No radio buttons or checkboxes anywhere in the booking flow.

---

## Key Files

| File | Role |
|------|------|
| `src/config/slots.ts` | Hardcoded slot times — single source of truth |
| `src/shared/types/index.ts` | All shared types (`BookingSegment`, `Booking`, etc.) |
| `src/stores/bookingStore.ts` | Zustand store: `SelectedSlot`, booking wizard state |
| `src/hooks/queries/useBookings.ts` | `useMyBookings`, `useBooking`, `useSlotAvailability` |
| `src/components/booking/BookTimePage.tsx` | Time picker with grouped horizontal scroll |
| `src/components/booking/ReviewPage.tsx` | Writes booking via `addDoc` (direct Firestore — CF not deployed) |
| `functions/src/index.ts` | `confirmBooking` CF — validates + writes atomically (not yet deployed) |
| `firestore.rules` | Teachers can create own bookings (CF not enforced yet) |

---

## Availability Check (`useSlotAvailability`)

Queries **all** active bookings from Firestore (no date/programId filter — client-side filter). Returns `Record<string, 'taken' | 'yours'>` keyed by `dateToSlotKey`.

- **'yours'** = current teacher owns this slot (sticky — never overwritten by 'taken')
- **'taken'** = another class holds it
- Absent key = available

**Known deferred:** No Firestore index filter on date/programId. Acceptable at current scale (≤50 bookings). Needs a composite index + server-side filter before scaling.

---

## Cloud Function (`confirmBooking`) — NOT YET DEPLOYED

Located at `functions/src/index.ts`, region `europe-west1`. Does:
1. Validates `programId`, `startHour` (must be in `SLOT_HOURS`), `date` format
2. Firestore transaction: checks slot not already taken (Step A) + teacher has no overlap (Step B) + writes booking (Step C)
3. Returns `{ bookingId }`

**Why not deployed:** Requires GCP `artifactregistry` API — not enabled on the Firebase project. Until deployed, `ReviewPage` writes directly with `addDoc` and Firestore rules allow teacher `create`.

**To deploy later:**
```bash
# Enable required GCP APIs first, then:
firebase deploy --only functions
# Then revert ReviewPage to use httpsCallable and tighten firestore.rules
```

---

## Removed / Deleted

- `src/hooks/queries/useSessions.ts` — deleted (sessions collection no longer exists)
- `src/services/bookingConflictService.ts` — deleted (all conflict logic in CF)
- `BookingSegment.sessionId` — removed 2026-09-29
- `SelectedSlot.sessionId` — removed 2026-09-29
- Continue buttons on steps 1–3 — removed for one-tap UX

---

## Parked / Future Work

| Item | Notes |
|------|-------|
| Deploy Cloud Function | Needs GCP `artifactregistry` API enabled; then tighten Firestore rules |
| `useSlotAvailability` full scan | Add composite Firestore index on `status + segments.date` to filter server-side |
| `bookingCode` uniqueness | Currently client-generated, no server uniqueness check; `bookingId` is the real key |
| `segments=[]` edge case | BookingDetailPage shows no date if segments is empty (legacy data only) |
| TOAD flow | `/toad` route exists but booking flow separate from onsite |
| React Native shared layer | Planned for future — keep business logic in hooks/stores, not components |
