# Slot Booking Rules — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce correct 1-hour slot pairing, teacher-clash prevention in the UI, and a race-condition-safe server write via Cloud Function for the Curiosity Cube + Lab booking system.

**Architecture:** Sessions become 60-minute. The time picker filters out slots that overlap the teacher's existing bookings before they are shown. On confirm, a Cloud Function runs a Firestore transaction that atomically re-validates slot availability and teacher non-overlap before writing the booking — direct `addDoc` from the client is removed.

**Tech Stack:** React 18, Zustand, React Query (@tanstack/react-query), Firebase Firestore, Firebase Cloud Functions v2 (Node 20, TypeScript), react-intl

**Spec:** _No separate spec file — requirements captured in this plan._

## Global Constraints

- Slot duration: **60 minutes** (1 hour) for both Cube and Lab — no 45-minute sessions.
- There is exactly **one** Curiosity Cube and **one** Curiosity Lab (capacity = 1 class per slot).
- Teacher clash rule: **same teacher cannot hold two bookings whose time ranges overlap**, whether booked as a pair or separately.
- Slot clash rule: **each session can only be taken by one class** (capacity 1 enforced in the transaction).
- "Both" programs: consecutive pair where `first.end === second.start`. Teacher chooses order (Cube-first or Lab-first).
- Cloud Function writes bookings; the client no longer calls `addDoc` directly.
- Firestore security rule for `bookings` `create`: only the Cloud Function (admin SDK) writes — client `create` rule is removed.
- All user-facing text must be added to both `src/i18n/en.ts` and `src/i18n/de.ts`.
- No TypeScript `any` except where already present in existing files.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `scripts/seed-curiosity.mjs` | Modify | Change sessions to 60-min, align start times |
| `src/i18n/en.ts` | Modify | Update "45 min" copy → "60 min / 1 hour"; add conflict i18n keys |
| `src/i18n/de.ts` | Modify | Same as en.ts in German |
| `src/components/booking/BookProgramsPage.tsx` | Modify | Remove hardcoded time sub-labels |
| `src/hooks/queries/useSessions.ts` | No change | Already correct |
| `src/hooks/queries/useBookings.ts` | Modify | Export `useTeacherBookingTimes` helper |
| `src/services/bookingConflictService.ts` | Modify | Add `teacherHasTimeOverlap` (client-side pre-filter) |
| `src/components/booking/BookTimePage.tsx` | Modify | Filter available slots by teacher's existing bookings |
| `functions/src/index.ts` | Modify | Add `confirmBooking` callable Cloud Function |
| `src/components/booking/ReviewPage.tsx` | Modify | Call Cloud Function instead of `addDoc` |
| `firestore.rules` | Modify | Remove client `create` on bookings; allow Function (admin) only |

---

## Task 1: Fix seed data — 60-minute sessions

**Files:**
- Modify: `scripts/seed-curiosity.mjs`

**Interfaces:**
- Produces: Firestore sessions where Cube slots are `09:00–10:00, 10:00–11:00, 11:00–12:00, 12:00–13:00, 13:00–14:00` and Lab slots are identical start times `09:00–10:00, 10:00–11:00, 11:00–12:00, 12:00–13:00, 13:00–14:00`. A "both cube-first" pair starting at 09:00 = Cube 09:00–10:00 + Lab 10:00–11:00.

**Why these times:** With 60-min sessions, cube-first at 09:00 uses Lab 10:00. Lab-first at 09:00 uses Cube 10:00. Both start times share the same pool — the pairing logic in `BookTimePage` already finds the match by `first.end === second.start`, so both programs just need the same set of start times one hour apart.

- [ ] **Step 1: Update programs block in seed**

In `scripts/seed-curiosity.mjs`, replace the `programs` object:

```js
const programs = {
  cube: {
    name: 'Curiosity Cube',
    type: 'onsite',
    sessionMinutes: 60,
    capacity: 1,
    openWeekdays: [1, 2, 3, 4, 5],
    dailyStartTimes: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    needsApproval: false,
    serviceCities: [],
  },
  lab: {
    name: 'Curiosity Lab',
    type: 'onsite',
    sessionMinutes: 60,
    capacity: 1,
    openWeekdays: [1, 2, 3, 4, 5],
    dailyStartTimes: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    needsApproval: false,
    serviceCities: [],
  },
  toad: {
    name: 'TOAD Truck',
    type: 'outreach',
    sessionMinutes: 90,
    capacity: 30,
    openWeekdays: [2, 4],
    dailyStartTimes: ['09:00', '13:00'],
    needsApproval: true,
    serviceCities: ['Darmstadt'],
  },
}
```

- [ ] **Step 2: Verify the pairing math manually**

With the above data:
- Cube 09:00–10:00, Lab 10:00–11:00 → cube-first pair at 09:00 ✓
- Lab 09:00–10:00, Cube 10:00–11:00 → lab-first pair at 09:00 ✓
- Cube 10:00–11:00 single booking ✓ (independent if not part of a pair)

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-curiosity.mjs
git commit -m "fix: update seed to 60-min sessions, capacity 1, aligned start times"
```

---

## Task 2: Update i18n strings — 60-min copy

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/de.ts`

**Interfaces:**
- Produces: i18n keys `bookPrograms.cube.sub`, `bookPrograms.lab.sub`, `bookPrograms.both.sub`, and new key `bookTime.teacherConflict`.

- [ ] **Step 1: Update en.ts**

In `src/i18n/en.ts`, change these three lines:

```ts
'bookPrograms.cube.sub': '60 min · hands-on science exhibits',
'bookPrograms.lab.sub': '60 min · guided lab experiments',
'bookPrograms.both.sub': '2 × 60 min · two back-to-back sessions',
```

And add the new conflict key (insert after `'bookTime.loadError'`):

```ts
'bookTime.teacherConflict': 'You already have a booking at this time.',
```

- [ ] **Step 2: Update de.ts**

Apply the same changes to `src/i18n/de.ts`:

```ts
'bookPrograms.cube.sub': '60 Min · Hands-on-Wissenschaftsausstellung',
'bookPrograms.lab.sub': '60 Min · Angeleitete Laborexperimente',
'bookPrograms.both.sub': '2 × 60 Min · Zwei aufeinanderfolgende Einheiten',
'bookTime.teacherConflict': 'Sie haben bereits eine Buchung für diesen Zeitraum.',
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en.ts src/i18n/de.ts
git commit -m "fix: update i18n to 60-min session copy, add teacher conflict message"
```

---

## Task 3: Remove hardcoded time labels from BookProgramsPage

**Files:**
- Modify: `src/components/booking/BookProgramsPage.tsx`

**Interfaces:**
- Consumes: i18n keys `bookPrograms.order.cubeFirst.label`, `bookPrograms.order.labFirst.label`
- Produces: Order option cards with no hardcoded clock times in `sub`

- [ ] **Step 1: Replace the `orderOptions` array**

In `src/components/booking/BookProgramsPage.tsx`, replace the `orderOptions` definition inside `useBookProgramOptions`:

```ts
const orderOptions: { id: ProgramOrder; label: string; sub: string }[] = [
  {
    id: 'cube-first',
    label: intl.formatMessage({ id: 'bookPrograms.order.cubeFirst.label' }),
    sub: intl.formatMessage({ id: 'bookPrograms.order.sub' }),
  },
  {
    id: 'lab-first',
    label: intl.formatMessage({ id: 'bookPrograms.order.labFirst.label' }),
    sub: intl.formatMessage({ id: 'bookPrograms.order.sub' }),
  },
]
```

Both sub-lines now reuse the existing key `'bookPrograms.order.sub'` which already reads: "The second session starts right when the first ends." — accurate and timeless.

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Navigate to Book → Onsite → Both Programs. The order cards should show the label and the generic sub-line, no clock times.

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/BookProgramsPage.tsx
git commit -m "fix: remove hardcoded clock times from program order labels"
```

---

## Task 4: Teacher overlap helper — client-side pre-filter

**Files:**
- Modify: `src/hooks/queries/useBookings.ts`
- Modify: `src/services/bookingConflictService.ts`

**Interfaces:**
- Consumes: `BookingDoc` from `useBookings.ts`, `SelectedSlot` shape `{ start: Date; end: Date }`
- Produces:
  - `useTeacherBookingWindows(): { start: Date; end: Date }[]` — React hook, returns the teacher's active booking time windows (from React Query cache)
  - `slotsOverlapTeacherBookings(proposedSlots: { start: Date; end: Date }[], existingWindows: { start: Date; end: Date }[]): boolean` — pure function, returns `true` if any proposed slot overlaps any existing window

**Overlap rule:** Two time ranges overlap when `a.start < b.end && a.end > b.start`.

- [ ] **Step 1: Add `useTeacherBookingWindows` to useBookings.ts**

Append to `src/hooks/queries/useBookings.ts`:

```ts
export function useTeacherBookingWindows(): { start: Date; end: Date }[] {
  const { data: bookings = [] } = useMyBookings()
  const active = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'approved' || b.status === 'pending',
  )
  const windows: { start: Date; end: Date }[] = []
  for (const booking of active) {
    for (const seg of booking.segments ?? []) {
      const s = seg as { sessionId: string; programId: string; order: number; start?: { toDate(): Date }; end?: { toDate(): Date } }
      if (s.start && s.end) {
        windows.push({ start: s.start.toDate(), end: s.end.toDate() })
      }
    }
  }
  return windows
}
```

Note: segments in Firestore carry `start`/`end` Timestamps only if the booking was written with them. If not present (older bookings), the window is silently skipped — the server transaction is the hard gate.

- [ ] **Step 2: Add `slotsOverlapTeacherBookings` to bookingConflictService.ts**

Append to `src/services/bookingConflictService.ts`:

```ts
export function slotsOverlapTeacherBookings(
  proposedSlots: { start: Date; end: Date }[],
  existingWindows: { start: Date; end: Date }[],
): boolean {
  for (const proposed of proposedSlots) {
    for (const existing of existingWindows) {
      if (proposed.start < existing.end && proposed.end > existing.start) {
        return true
      }
    }
  }
  return false
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/queries/useBookings.ts src/services/bookingConflictService.ts
git commit -m "feat: add teacher booking time windows hook and overlap checker"
```

---

## Task 5: Filter time picker by teacher's existing bookings

**Files:**
- Modify: `src/components/booking/BookTimePage.tsx`

**Interfaces:**
- Consumes: `useTeacherBookingWindows()` from `src/hooks/queries/useBookings.ts`, `slotsOverlapTeacherBookings()` from `src/services/bookingConflictService.ts`
- Produces: `availableTimes` list that excludes any slot (single or pair) overlapping the teacher's active bookings; a `teacherConflict` note shown below a greyed-out slot

**Corner cases handled:**
1. Single program: each slot is checked individually against all teacher windows.
2. Both programs, cube-first: both the cube slot AND the matched lab slot are checked.
3. Both programs, lab-first: both the lab slot AND the matched cube slot are checked.
4. If `existingWindows` is empty (new teacher, no bookings), all slots pass — no false negatives.
5. Duplicate session dedup (already present) is preserved.
6. The filter runs in the same `availableTimes` memo — no extra re-renders.

- [ ] **Step 1: Import the new helpers**

At the top of `src/components/booking/BookTimePage.tsx`, add:

```ts
import { useTeacherBookingWindows } from '../../hooks/queries/useBookings'
import { slotsOverlapTeacherBookings } from '../../services/bookingConflictService'
```

- [ ] **Step 2: Call the hook inside the component**

Inside `BookTimePage`, after the existing hooks:

```ts
const teacherWindows = useTeacherBookingWindows()
```

- [ ] **Step 3: Update the single-program branch of `availableTimes`**

Replace the existing single-program filter block (inside `availableTimes` memo) with:

```ts
if (programSelection !== 'both') {
  const seen = new Set<string>()
  return daySessions
    .filter((s) => {
      const available = s.capacity - s.seatsTaken - s.seatsHeld
      if (available <= 0) return false
      const timeKey = toDate(s.start).getTime().toString()
      if (seen.has(timeKey)) return false
      seen.add(timeKey)
      const slotWindow = { start: toDate(s.start), end: toDate(s.end) }
      if (slotsOverlapTeacherBookings([slotWindow], teacherWindows)) return false
      return true
    })
    .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())
    .map((s) => ({
      label: intl.formatTime(toDate(s.start), { hour: '2-digit', minute: '2-digit' }),
      endLabel: intl.formatTime(toDate(s.end), { hour: '2-digit', minute: '2-digit' }),
      slots: [s],
    }))
}
```

- [ ] **Step 4: Update the "both" branch of `availableTimes`**

Replace the existing "both" pairing block with:

```ts
const firstProg = programIds[0]
const secondProg = programIds[1]
const firsts = daySessions
  .filter((s) => s.programId === firstProg && s.capacity - s.seatsTaken - s.seatsHeld > 0)
  .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())

const seen = new Set<string>()
return firsts.flatMap((first) => {
  const firstEnd = toDate(first.end).getTime()
  const match = daySessions.find(
    (s) =>
      s.programId === secondProg &&
      toDate(s.start).getTime() === firstEnd &&
      s.capacity - s.seatsTaken - s.seatsHeld > 0,
  )
  if (!match) return []
  const pairKey = `${toDate(first.start).getTime()}-${toDate(match.end).getTime()}`
  if (seen.has(pairKey)) return []
  seen.add(pairKey)
  const windows = [
    { start: toDate(first.start), end: toDate(first.end) },
    { start: toDate(match.start), end: toDate(match.end) },
  ]
  if (slotsOverlapTeacherBookings(windows, teacherWindows)) return []
  return [{
    label: intl.formatTime(toDate(first.start), { hour: '2-digit', minute: '2-digit' }),
    endLabel: intl.formatTime(toDate(match.end), { hour: '2-digit', minute: '2-digit' }),
    slots: [first, match],
  }]
})
```

- [ ] **Step 5: Add `teacherWindows` to the memo dependency array**

The `availableTimes` memo already depends on `[selectedDate, sessionsByDay, programSelection, programIds, intl]`. Add `teacherWindows`:

```ts
}, [selectedDate, sessionsByDay, programSelection, programIds, intl, teacherWindows])
```

- [ ] **Step 6: Verify in browser**

Run `npm run dev`. As a teacher who already has a booking, open the time picker — slots that overlap your existing booking should be absent from the list. Slots that don't overlap should still appear.

- [ ] **Step 7: Commit**

```bash
git add src/components/booking/BookTimePage.tsx
git commit -m "feat: filter time picker slots by teacher's existing booking windows"
```

---

## Task 6: Cloud Function — `confirmBooking`

**Files:**
- Modify: `functions/src/index.ts`

**What the function does (transaction steps):**
1. Receives `{ teacherId, sessionIds, segments, grade, studentCount, accessNeeds, visitType, teacherName, teacherEmail, schoolId, bookingCode }` from the authenticated client.
2. Inside a Firestore transaction:
   a. For each `sessionId`: read the session doc. Verify `status === 'open'` and `seatsTaken + seatsHeld < capacity`. If not → throw `slots-unavailable`.
   b. Read all active bookings for `teacherId` (status in `['confirmed', 'approved', 'pending']`). For each booking, fetch its session docs and build time windows. Check that none of the proposed session time windows overlap any existing window. If overlap → throw `teacher-conflict`.
   c. Write the new booking doc with `status = visitType === 'toad' ? 'pending' : 'confirmed'`.
   d. For each sessionId, increment `seatsTaken` by 1.
3. Return `{ bookingId: string }` on success.

**Interfaces:**
- Consumes: Firebase Auth context (function is `onCall`, `enforceAppCheck: false`)
- Produces: exported `confirmBooking` callable function; returns `{ bookingId: string }`
- Error codes: `'unauthenticated'`, `'invalid-argument'`, `'failed-precondition'` (with `message` = `'slots-unavailable'` or `'teacher-conflict'`)

- [ ] **Step 1: Replace functions/src/index.ts**

```ts
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()

interface BookingSegmentInput {
  sessionId: string
  programId: string
  order: number
}

interface ConfirmBookingData {
  sessionIds: string[]
  segments: BookingSegmentInput[]
  visitType: 'onsite' | 'toad'
  teacherName: string
  teacherEmail: string
  schoolId: string
  grade: string
  studentCount: number
  accessNeeds?: string
  bookingCode: string
}

function rangesOverlap(
  aStart: FirebaseFirestore.Timestamp,
  aEnd: FirebaseFirestore.Timestamp,
  bStart: FirebaseFirestore.Timestamp,
  bEnd: FirebaseFirestore.Timestamp,
): boolean {
  return aStart.toMillis() < bEnd.toMillis() && aEnd.toMillis() > bStart.toMillis()
}

export const confirmBooking = onCall<ConfirmBookingData>(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.')
    }

    const teacherId = request.auth.uid
    const { sessionIds, segments, visitType, teacherName, teacherEmail, schoolId, grade, studentCount, accessNeeds, bookingCode } = request.data

    if (!sessionIds?.length || !segments?.length) {
      throw new HttpsError('invalid-argument', 'sessionIds and segments are required.')
    }

    const bookingId = await db.runTransaction(async (tx) => {
      // ── Step A: verify each session is still open and has capacity ──────────
      const sessionRefs = sessionIds.map((id) => db.collection('sessions').doc(id))
      const sessionSnaps = await Promise.all(sessionRefs.map((ref) => tx.get(ref)))

      const proposedWindows: { start: FirebaseFirestore.Timestamp; end: FirebaseFirestore.Timestamp }[] = []

      for (const snap of sessionSnaps) {
        if (!snap.exists) {
          throw new HttpsError('failed-precondition', 'slots-unavailable')
        }
        const data = snap.data()!
        if (data['status'] !== 'open') {
          throw new HttpsError('failed-precondition', 'slots-unavailable')
        }
        const taken: number = data['seatsTaken'] ?? 0
        const held: number = data['seatsHeld'] ?? 0
        const capacity: number = data['capacity'] ?? 0
        if (taken + held >= capacity) {
          throw new HttpsError('failed-precondition', 'slots-unavailable')
        }
        proposedWindows.push({
          start: data['start'] as FirebaseFirestore.Timestamp,
          end: data['end'] as FirebaseFirestore.Timestamp,
        })
      }

      // ── Step B: verify teacher has no overlapping active booking ────────────
      const bookingsSnap = await tx.get(
        db.collection('bookings')
          .where('teacherId', '==', teacherId)
          .where('status', 'in', ['confirmed', 'approved', 'pending']),
      )

      for (const bookingDoc of bookingsSnap.docs) {
        const bData = bookingDoc.data()
        const existingSegments: BookingSegmentInput[] = bData['segments'] ?? []
        for (const seg of existingSegments) {
          const existingSessionSnap = await tx.get(db.collection('sessions').doc(seg.sessionId))
          if (!existingSessionSnap.exists) continue
          const eData = existingSessionSnap.data()!
          const eStart = eData['start'] as FirebaseFirestore.Timestamp
          const eEnd = eData['end'] as FirebaseFirestore.Timestamp
          for (const proposed of proposedWindows) {
            if (rangesOverlap(proposed.start, proposed.end, eStart, eEnd)) {
              throw new HttpsError('failed-precondition', 'teacher-conflict')
            }
          }
        }
      }

      // ── Step C: write the booking ────────────────────────────────────────────
      const bookingRef = db.collection('bookings').doc()
      tx.set(bookingRef, {
        type: visitType,
        teacherId,
        teacherName,
        teacherEmail,
        schoolId,
        segments,
        grade,
        studentCount,
        accessNeeds: accessNeeds ?? '',
        status: visitType === 'toad' ? 'pending' : 'confirmed',
        bookingCode,
        createdAt: FieldValue.serverTimestamp(),
      })

      // ── Step D: increment seatsTaken on each session ─────────────────────────
      for (const ref of sessionRefs) {
        tx.update(ref, { seatsTaken: FieldValue.increment(1) })
      }

      return bookingRef.id
    })

    return { bookingId }
  },
)
```

- [ ] **Step 2: Build the functions**

```bash
cd functions && npm run build && cd ..
```

Expected: no TypeScript errors, `lib/index.js` generated.

- [ ] **Step 3: Deploy the function (or test with emulator)**

For emulator testing:
```bash
firebase emulators:start --only functions,firestore
```

For production deploy:
```bash
firebase deploy --only functions
```

- [ ] **Step 4: Commit**

```bash
git add functions/src/index.ts functions/lib/
git commit -m "feat: add confirmBooking cloud function with transaction validation"
```

---

## Task 7: Update Firestore security rules

**Files:**
- Modify: `firestore.rules`

**What changes:** The `bookings` `create` rules for teachers are removed — the Cloud Function (admin SDK) bypasses all rules. A direct client create is no longer allowed. The existing `update` (cancel) and admin rules stay.

- [ ] **Step 1: Replace the bookings block in firestore.rules**

```
// ── Bookings ───────────────────────────────────────────────────────────
// Bookings are created exclusively by the confirmBooking Cloud Function
// (admin SDK bypasses rules). Teachers can only read their own and cancel.
match /bookings/{bookingId} {
  allow read: if isSignedIn() && (
    resource.data.teacherId == request.auth.uid || isAdmin()
  );

  // No client-side create — handled by confirmBooking Cloud Function.

  // Teachers can cancel their own bookings (status → 'cancelled')
  allow update: if isSignedIn()
    && resource.data.teacherId == request.auth.uid
    && request.resource.data.status == 'cancelled'
    && request.resource.data.teacherId == resource.data.teacherId;

  // Admins can update/delete any booking
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

- [ ] **Step 2: Deploy rules**

```bash
firebase deploy --only firestore:rules
```

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "security: remove direct client create on bookings — Cloud Function only"
```

---

## Task 8: Wire ReviewPage to call the Cloud Function

**Files:**
- Modify: `src/components/booking/ReviewPage.tsx`

**Interfaces:**
- Consumes: `confirmBooking` callable (Firebase Functions v9 modular SDK)
- Produces: same UX as before — navigates to `/book/confirmed` on success, shows error on failure; differentiates `slots-unavailable` vs `teacher-conflict` error messages

**New i18n keys needed** (add in Task 2 above — already listed, cross-check):
- `'review.conflict'` — already exists ("One of these time slots is already booked...")
- `'review.teacherConflict'` — add: "You already have a booking that overlaps this time. Please go back and choose a different slot."

- [ ] **Step 0: Add missing i18n keys**

In `src/i18n/en.ts`, add after `'review.conflict'`:
```ts
'review.teacherConflict': 'You already have a booking that overlaps this time. Please go back and choose a different slot.',
```

In `src/i18n/de.ts`, add:
```ts
'review.teacherConflict': 'Sie haben bereits eine Buchung, die diesen Zeitraum überschneidet. Bitte gehen Sie zurück und wählen Sie einen anderen Zeitraum.',
```

- [ ] **Step 1: Add Firebase Functions import**

At the top of `src/components/booking/ReviewPage.tsx`, add:

```ts
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../../shared/firebase'
```

(Assuming `app` is exported from `src/shared/firebase.ts` — verify and adjust if the export name differs.)

- [ ] **Step 1a: Verify firebase.ts exports `app`**

Open `src/shared/firebase.ts`. If it does not already export `app`, add:
```ts
export { app }
```
where `app` is the result of `initializeApp(...)`.

- [ ] **Step 2: Replace `handleConfirm` in ReviewPage.tsx**

Remove the existing `handleConfirm` function and replace with:

```ts
const handleConfirm = async () => {
  if (!user) return
  setSubmitting(true)
  setError(null)
  try {
    const functions = getFunctions(app, 'europe-west1')
    const confirm = httpsCallable<
      {
        sessionIds: string[]
        segments: { sessionId: string; programId: string; order: number }[]
        visitType: string
        teacherName: string
        teacherEmail: string
        schoolId: string
        grade: string
        studentCount: number
        accessNeeds: string
        bookingCode: string
      },
      { bookingId: string }
    >(functions, 'confirmBooking')

    const bookingCode = makeBookingCode()
    const sessionIds = slots.map((s) => s.sessionId)
    const segments = slots.map((s, i) => ({
      sessionId: s.sessionId,
      programId: s.programId,
      order: i + 1,
    }))

    await confirm({
      sessionIds,
      segments,
      visitType: visitType ?? 'onsite',
      teacherName: profile?.displayName ?? '',
      teacherEmail: user.email ?? '',
      schoolId: profile?.schoolId ?? '',
      grade: classDetails.grade,
      studentCount: classDetails.studentCount,
      accessNeeds: classDetails.accessNeeds ?? '',
      bookingCode,
    })

    // Build calendar URL
    const firstSlot = slots[0]
    const lastSlot = slots[slots.length - 1]
    const calFmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
    const calParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Curiosity ${programTitle} – Class ${classDetails.grade}`,
      dates: `${calFmt(firstSlot.start)}/${calFmt(lastSlot.end)}`,
      details: `${classDetails.studentCount} students · Grade ${classDetails.grade} · Code: ${bookingCode}`,
      location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
    })
    const calendarUrl = `https://calendar.google.com/calendar/render?${calParams}`

    pushNotification({
      type: 'confirmed',
      title: intl.formatMessage({ id: 'review.notification.title' }),
      body: `${programTitle} · ${intl.formatDate(firstSlot.start, { weekday: 'short', day: 'numeric', month: 'short' })} · ${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })} · Code ${bookingCode}`,
      calendarUrl,
      bookingId: bookingCode,
    })

    reset()
    navigate('/book/confirmed', { replace: true })
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? ''
    const message = (err as { message?: string })?.message ?? ''
    if (message.includes('teacher-conflict')) {
      setError(intl.formatMessage({ id: 'review.teacherConflict' }))
    } else if (message.includes('slots-unavailable') || code === 'failed-precondition') {
      setError(intl.formatMessage({ id: 'review.conflict' }))
    } else {
      setError(intl.formatMessage({ id: 'review.error' }))
    }
    console.error(err)
  } finally {
    setSubmitting(false)
  }
}
```

- [ ] **Step 3: Remove now-unused imports**

Remove `collection`, `addDoc`, `serverTimestamp` from the firebase/firestore import line. Remove `hasBookingConflict` import from `bookingConflictService`.

- [ ] **Step 4: Verify in browser**

Run `npm run dev` (with emulator running or against real project). Go through the full booking flow:
- Select Cube only → select a slot → fill details → review → confirm. Should succeed and show confirmed page.
- Try booking a time that is already taken → should show "slot unavailable" error.
- Log in as Teacher A with an existing booking. Try to book a slot that overlaps it → should show "teacher conflict" error at the review step (and ideally that slot was already hidden in the time picker from Task 5).

- [ ] **Step 5: Commit**

```bash
git add src/components/booking/ReviewPage.tsx src/i18n/en.ts src/i18n/de.ts src/shared/firebase.ts
git commit -m "feat: call confirmBooking cloud function from ReviewPage, handle conflict errors"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|------------|------|
| 1-hour sessions | Task 1 (seed), Task 2 (i18n copy) |
| Teacher picks order (cube-first / lab-first) | Already implemented — Task 3 just removes bad copy |
| Consecutive pair: first.end === second.start | Already in BookTimePage — preserved in Task 5 |
| Same teacher can't hold two overlapping bookings | Task 4 (helper) + Task 5 (UI filter) + Task 6 (transaction) |
| Other teachers can book free slots independently | Capacity=1 enforced per session, not per teacher globally |
| Exactly one Cube, one Lab | capacity=1 in seed (Task 1), enforced in transaction (Task 6) |
| Race condition: two teachers simultaneous | Task 6 (Firestore transaction) |
| Client no longer writes bookings directly | Task 7 (Firestore rules) + Task 8 (ReviewPage) |
| Error messages: slot taken vs teacher conflict | Task 6 (error codes) + Task 8 (error handling) + Task 2 (i18n) |
| German translations | Task 2 + Task 8 Step 0 |
| "Both" pair order shown with no hardcoded times | Task 3 |

**Placeholder scan:** None found.

**Type consistency check:**
- `BookingSegmentInput` defined in Task 6, used in Task 8 inline — matches shape.
- `useTeacherBookingWindows` returns `{ start: Date; end: Date }[]`, consumed by `slotsOverlapTeacherBookings` with same type — ✓.
- `slotsOverlapTeacherBookings` param `proposedSlots: { start: Date; end: Date }[]` — in Task 5 we pass `[{ start: toDate(s.start), end: toDate(s.end) }]` — ✓.
- `confirmBooking` Cloud Function region `'europe-west1'` must match in both Task 6 (`onCall` options) and Task 8 (`getFunctions` second arg) — ✓.
