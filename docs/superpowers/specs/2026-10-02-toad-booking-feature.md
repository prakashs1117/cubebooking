# TOAD Booking Feature — Design Spec
**Date:** 2026-10-02  
**Status:** Approved

---

## 1. Overview

Implement the complete TOAD truck booking lifecycle:
1. **Teacher requests** a date-only TOAD visit through a dedicated wizard path
2. **Coordinator/Admin approves or declines** via `/admin/toad`
3. **Teacher sees status** (pending/approved/declined) on booking detail; QR appears once approved
4. **Admin scans QR** on visit day to mark the class as arrived

---

## 2. What Already Exists (do not rebuild)

| Thing | Location |
|-------|----------|
| `visitType: 'toad'` in bookingStore | `src/stores/bookingStore.ts` |
| `BookingStatus: 'pending' \| 'approved' \| 'declined'` | `src/shared/types/index.ts` |
| `truckParking?: string` on `Booking` type | `src/shared/types/index.ts` |
| `createBooking` sets `status: 'pending'` for toad | `src/services/bookingService.ts` |
| TOAD colour coding in AdminDashboard + BookingVerifyPage | existing admin components |
| QR scan → mark arrived (`handleMarkArrived`) | `BookingVerifyPage.tsx` |
| `BookingQRCode` component | `src/components/ui/BookingQRCode.tsx` |
| `makeBookingCode()` helper | `BookReviewStep.tsx` — copy pattern |

---

## 3. Booking Wizard — TOAD Path

### 3a. Step flow

When `visitType === 'toad'` the modal branches:

```
BookTypeStep → ToadDateStep → ToadDetailsStep → ToadReviewStep → ToadConfirmedStep
```

The existing `programs`, `time` steps are **skipped entirely** for TOAD.

`BookingModal.tsx` must add these steps to its `Step` union type and route correctly.

### 3b. ToadDateStep

**Purpose:** Pick a single calendar date for the TOAD visit. No time slot.

**Behaviour:**
- Shows a month calendar, Mon–Fri only. Weekends disabled.
- Past dates and today disabled (earliest = tomorrow).
- No availability check against `slots` collection — TOAD does not use slots.
- On select, stores the date in bookingStore as a synthetic `SelectedSlot`:
  ```ts
  {
    programId: 'toad',
    date: 'YYYY-MM-DD',
    startHour: 9,   // fixed — TOAD has no time
    start: new Date(date + 'T09:00:00'),
    end:   new Date(date + 'T10:30:00'),
  }
  ```
- "Continue" enabled only when a date is selected.

### 3c. ToadDetailsStep

**Purpose:** Class details + school parking address.

**Fields (all same pattern as BookDetailsStep):**
- Grade (Radix Select, grades 1–12) — required
- Number of students (stepper, 1–30) — required
- **School address & parking info** (textarea, required for TOAD) — stored in `classDetails.truckParking`
- Accessibility needs (textarea, optional)

"Continue" enabled when grade, studentCount ≥ 1, and truckParking is non-empty.

### 3d. ToadReviewStep

**Purpose:** Review screen before submitting. Calls `createBooking`.

**Visual:** Same card layout as `BookReviewStep` but:
- Header accent bar: `var(--brand-magenta)` (single colour)
- Program label: `intl.formatMessage({ id: 'program.toad' })`
- Date row (no time row — TOAD is date-only)
- Grade row
- Students row
- Parking address row
- Access needs row (if provided)
- Privacy note + "Pending Merck approval" info chip (magenta tint) explaining it is not instant
- Submit button label: `toad.review.submit` = "Send request"

**On submit:**
```ts
createBooking({
  ...standardFields,
  visitType: 'toad',
  truckParking: classDetails.truckParking,
  segments: [{
    programId: 'toad',
    date: slots[0].date,
    startHour: 9,
    order: 1,
  }],
})
```

### 3e. ToadConfirmedStep

**Purpose:** "Request sent" screen. Different from onsite confirmed — no QR yet.

**Contents:**
- Magenta animated orb header (match existing `BookConfirmedStep` structure)
- Heading: `toad.confirmed.heading` = "Request sent!"
- Sub: `toad.confirmed.sub` = "Merck will review and email you within 2 working days. Your booking code is below."
- Booking code badge (same as onsite, code is `TC-XXXX` prefix for TOAD)
- Pending status chip (magenta)
- "Go to my bookings" button

---

## 4. Booking Store Changes

Add `truckParking: string` to `ClassDetails` interface and `DEFAULT_CLASS_DETAILS`.

```ts
// in bookingStore.ts
export interface ClassDetails {
  grade: string
  studentCount: number
  accessNeeds: string
  truckParking: string   // NEW — required for TOAD
}

const DEFAULT_CLASS_DETAILS: ClassDetails = {
  grade: '4',
  studentCount: 25,
  accessNeeds: '',
  truckParking: '',      // NEW
}
```

---

## 5. bookingService Changes

Add `truckParking` to `CreateBookingParams` and write it conditionally:

```ts
export interface CreateBookingParams {
  // ... existing fields
  truckParking?: string   // TOAD only
}

// In batch.set for bookingRef, add:
...(params.truckParking ? { truckParking: params.truckParking } : {}),
```

TOAD bookings do NOT write to `slots` or `teacherSlots` collections — remove those batch writes when `visitType === 'toad'`.

---

## 6. Coordinator/Admin Approval UI

### 6a. Route

`/admin/toad` — already in `AdminSidebar` nav. Add route to `App.tsx` pointing to `ToadApprovalsPage`.

### 6b. ToadApprovalsPage

**Data:** `useQuery` on `bookings` collection where `type == 'toad'`, ordered by `createdAt desc`. Show all non-cancelled TOAD bookings grouped:
- Section "Pending" — status `pending`, sorted oldest first (most urgent at top)
- Section "Recent" — status `approved` or `declined`, sorted newest first, capped at 20

**Pending card layout (per booking):**
```
[Magenta date badge]  School name · teacher name
                      Date · Grade N · N students
                      Parking: [address text]
                      Requested X days ago
                      [Decline]  [Approve]
```

- **Approve**: `updateDoc(bookingRef, { status: 'approved', updatedAt: serverTimestamp() })`
- **Decline**: opens an inline reason input (same row expands) → "Decline and notify" button → `updateDoc(bookingRef, { status: 'declined', declineReason: reason, updatedAt: serverTimestamp() })`
- Optimistic UI: immediately move card to "Recent" section on action; show undo toast for 4 s
- Undo: revert to previous status via another `updateDoc`

**Empty state (no pending):** green checkmark illustration + "All caught up — no pending TOAD requests."

### 6c. Firestore query

```ts
// useAllToadBookings hook (new)
query(
  collection(db, 'bookings'),
  where('type', '==', 'toad'),
  where('status', 'in', ['pending', 'approved', 'declined']),
  orderBy('createdAt', 'desc'),
)
```

Real-time listener via `onSnapshot` so approvals by one coordinator appear instantly for another.

---

## 7. Teacher Booking Detail — Status Display

`BookingDetailPage.tsx` changes:

**Show QR when:** `booking.status === 'confirmed' || booking.status === 'approved'`  
(Currently only `confirmed` shows QR — add `approved`)

**Status display for TOAD:**
- `pending` → amber chip "Awaiting approval" + info note: "Merck will email you within 2 working days"
- `approved` → green chip "Approved" + QR code + "Show this QR on the day"
- `declined` → red chip "Declined" + `declineReason` displayed if present
- `arrived` → same as onsite

**Add parking row** to booking detail rows for TOAD bookings:
```ts
if (booking.type === 'toad' && booking.truckParking) {
  rows.push({ label: intl.formatMessage({ id: 'bookingDetail.row.parking' }), value: booking.truckParking })
}
```

---

## 8. Admin QR Scan / Verify Changes

`BookingVerifyPage.tsx`:
- Add `truckParking` row to the detail display for TOAD bookings
- TOAD `approved` bookings: show "Mark as Arrived" button (same `handleMarkArrived` logic)
- TOAD `pending` bookings: show warning "This booking is still pending approval" — do not show "Mark as Arrived"

---

## 9. i18n Keys Required

All keys must appear in both `en.ts` and `de.ts` in the same commit.

```
toad.date.heading        = "When should the truck come?"
toad.date.sub            = "Choose a weekday. We'll confirm within 2 working days."
toad.date.continue       = "Continue"
toad.details.parking.label  = "School address & parking info"
toad.details.parking.placeholder = "e.g. Main entrance, Schulstraße 1, 64283 Darmstadt. Truck needs 6×12 m."
toad.details.parking.hint    = "The truck driver uses this to plan the visit."
toad.review.heading      = "Check and send"
toad.review.type         = "TOAD truck visit"
toad.review.row.date     = "Date"
toad.review.row.parking  = "Parking"
toad.review.pending.note = "Not instant — Merck approves within 2 working days"
toad.review.submit       = "Send request"
toad.confirmed.heading   = "Request sent!"
toad.confirmed.sub       = "Merck will review and email you within 2 working days."
toad.confirmed.code      = "Your request code"
toad.confirmed.goBookings = "Go to my bookings"
toad.approvals.title     = "TOAD approvals"
toad.approvals.pending   = "Pending · {count}"
toad.approvals.recent    = "Recent"
toad.approvals.empty     = "All caught up"
toad.approvals.emptySub  = "No pending TOAD requests right now."
toad.approvals.approve   = "Approve"
toad.approvals.decline   = "Decline"
toad.approvals.declineReason.label = "Reason for declining"
toad.approvals.declineReason.placeholder = "e.g. Date unavailable, parking not suitable"
toad.approvals.declineAndNotify = "Decline and notify"
toad.approvals.undo      = "Undo"
toad.approvals.daysAgo   = "{days, plural, one {# day ago} other {# days ago}}"
toad.approvals.today     = "Today"
toad.approvals.parking   = "Parking"
bookingDetail.row.parking  = "Parking"
bookingDetail.status.approved = "Approved"
bookingDetail.toad.pendingNote = "Merck will email you within 2 working days"
bookingDetail.toad.approvedNote = "Show this QR on the day of your visit"
bookingDetail.toad.declinedNote = "This request was not approved"
adminVerify.toad.pendingWarning = "This booking is still pending Merck approval"
```

---

## 10. Global Constraints

- Every new string in both `en.ts` AND `de.ts` in the same commit
- No new npm packages
- TypeScript strict — no `any`, no `@ts-ignore`
- Services layer: all Firestore writes go through `bookingService.ts` or inline `updateDoc` in the approval page (acceptable for simple status updates)
- Role guard: `ToadApprovalsPage` is staff-only (coordinator or admin) — wrap in `ProtectedRoute requireStaff`
- TOAD bookings do NOT write to `slots` or `teacherSlots`
- Booking code prefix for TOAD: `TC-` (not `CC-`) to distinguish at a glance
- Skeletons for loading states, not spinners
