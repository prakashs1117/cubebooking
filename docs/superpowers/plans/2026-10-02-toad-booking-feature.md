# TOAD Booking Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete TOAD truck booking lifecycle — teacher requests a date-only visit, coordinator/admin approves or declines, teacher sees status + QR once approved, admin scans QR on visit day.

**Architecture:** New TOAD wizard steps branch off `BookingModal` when `visitType === 'toad'`. A new `ToadApprovalsPage` at `/admin/toad` handles approval. `BookingDetailPage` and `BookingVerifyPage` get TOAD-specific status rows. No new npm packages; no new Firestore collections.

**Tech Stack:** React 18 + TypeScript, Zustand, TanStack Query, Firebase Firestore, React Intl, Radix UI, Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-10-02-toad-booking-feature.md`

## Global Constraints

- Every new string in both `src/i18n/en.ts` AND `src/i18n/de.ts` in the same commit — no exceptions
- No new npm packages
- TypeScript strict — no `any`, no `@ts-ignore`
- TOAD bookings do NOT write to `slots` or `teacherSlots` collections
- Booking code prefix for TOAD: `TC-` (not `CC-`)
- `ToadApprovalsPage` requires staff role — wrap route in `<ProtectedRoute requireStaff>`
- Skeletons for loading states, not spinners
- All Firestore writes: `createBooking` service for new bookings; direct `updateDoc` acceptable for approval status updates

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/i18n/en.ts` | Modify | All new TOAD i18n keys |
| `src/i18n/de.ts` | Modify | German translations |
| `src/stores/bookingStore.ts` | Modify | Add `truckParking` to `ClassDetails` |
| `src/services/bookingService.ts` | Modify | Accept `truckParking`, skip slots for TOAD |
| `src/components/booking/steps/ToadDateStep.tsx` | **Create** | Date-only calendar picker |
| `src/components/booking/steps/ToadDetailsStep.tsx` | **Create** | Class details + parking address |
| `src/components/booking/steps/ToadReviewStep.tsx` | **Create** | Review + submit TOAD booking |
| `src/components/booking/steps/ToadConfirmedStep.tsx` | **Create** | "Request sent" confirmation |
| `src/components/booking/BookingModal.tsx` | Modify | Add TOAD step flow branch |
| `src/hooks/queries/useBookings.ts` | Modify | Add `useAllToadBookings` hook |
| `src/components/admin/ToadApprovalsPage.tsx` | **Create** | Approve/decline UI |
| `src/components/pages/BookingDetailPage.tsx` | Modify | QR for approved, parking row, status notes |
| `src/components/admin/BookingVerifyPage.tsx` | Modify | Parking row, pending warning |
| `src/App.tsx` | Modify | Add `/admin/toad` route |

---

### Task 1: i18n keys — all TOAD strings in en + de

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/de.ts`

**Interfaces:**
- Produces: all message IDs consumed by Tasks 2–7

- [ ] **Step 1: Add English keys to `src/i18n/en.ts`**

Find the `// ── Admin / Coordinator ──` section near the end of the file. Add after the last existing admin key:

```ts
  // ── TOAD booking wizard ───────────────────────────────────────────────────
  'toad.date.heading': 'When should the truck come?',
  'toad.date.sub': 'Choose a weekday. We\'ll confirm within 2 working days.',
  'toad.details.parking.label': 'School address & parking info',
  'toad.details.parking.placeholder': 'e.g. Main entrance, Schulstraße 1, 64283 Darmstadt. Truck needs 6×12 m.',
  'toad.details.parking.hint': 'The truck driver uses this to plan the visit.',
  'toad.review.heading': 'Check and send',
  'toad.review.type': 'TOAD truck visit',
  'toad.review.row.date': 'Date',
  'toad.review.row.parking': 'Parking',
  'toad.review.pending.note': 'Not instant — Merck approves within 2 working days',
  'toad.review.submit': 'Send request',
  'toad.confirmed.heading': 'Request sent!',
  'toad.confirmed.sub': 'Merck will review and email you within 2 working days.',
  'toad.confirmed.code': 'Your request code',
  'toad.confirmed.goBookings': 'Go to my bookings',
  // ── TOAD approvals (admin) ────────────────────────────────────────────────
  'toad.approvals.title': 'TOAD approvals',
  'toad.approvals.pending': 'Pending · {count}',
  'toad.approvals.recent': 'Recent',
  'toad.approvals.empty': 'All caught up',
  'toad.approvals.emptySub': 'No pending TOAD requests right now.',
  'toad.approvals.approve': 'Approve',
  'toad.approvals.decline': 'Decline',
  'toad.approvals.declineReason.label': 'Reason for declining',
  'toad.approvals.declineReason.placeholder': 'e.g. Date unavailable, parking not suitable',
  'toad.approvals.declineAndNotify': 'Decline',
  'toad.approvals.undo': 'Undo',
  'toad.approvals.daysAgo': '{days, plural, one {# day ago} other {# days ago}}',
  'toad.approvals.today': 'Today',
  'toad.approvals.parking': 'Parking',
  // ── Booking detail — TOAD additions ──────────────────────────────────────
  'bookingDetail.row.parking': 'Parking',
  'bookingDetail.status.approved': 'Approved',
  'bookingDetail.toad.pendingNote': 'Merck will email you within 2 working days',
  'bookingDetail.toad.approvedNote': 'Show this QR on the day of your visit',
  'bookingDetail.toad.declinedNote': 'This request was not approved',
  'adminVerify.toad.pendingWarning': 'This booking is still pending Merck approval',
```

- [ ] **Step 2: Add German keys to `src/i18n/de.ts`**

Same location (after last admin key):

```ts
  // ── TOAD Buchungsassistent ─────────────────────────────────────────────────
  'toad.date.heading': 'Wann soll der Truck kommen?',
  'toad.date.sub': 'Wählen Sie einen Werktag. Wir bestätigen innerhalb von 2 Werktagen.',
  'toad.details.parking.label': 'Schuladresse & Parkinfo',
  'toad.details.parking.placeholder': 'z. B. Haupteingang, Schulstraße 1, 64283 Darmstadt. Truck benötigt 6×12 m.',
  'toad.details.parking.hint': 'Der Truckfahrer nutzt diese Angabe zur Planung.',
  'toad.review.heading': 'Prüfen und senden',
  'toad.review.type': 'TOAD-Truck-Besuch',
  'toad.review.row.date': 'Datum',
  'toad.review.row.parking': 'Parken',
  'toad.review.pending.note': 'Nicht sofort – Merck genehmigt innerhalb von 2 Werktagen',
  'toad.review.submit': 'Anfrage senden',
  'toad.confirmed.heading': 'Anfrage gesendet!',
  'toad.confirmed.sub': 'Merck prüft und sendet Ihnen innerhalb von 2 Werktagen eine E-Mail.',
  'toad.confirmed.code': 'Ihr Anfragecode',
  'toad.confirmed.goBookings': 'Zu meinen Buchungen',
  // ── TOAD-Genehmigungen (Admin) ─────────────────────────────────────────────
  'toad.approvals.title': 'TOAD-Genehmigungen',
  'toad.approvals.pending': 'Ausstehend · {count}',
  'toad.approvals.recent': 'Zuletzt',
  'toad.approvals.empty': 'Alles erledigt',
  'toad.approvals.emptySub': 'Derzeit keine ausstehenden TOAD-Anfragen.',
  'toad.approvals.approve': 'Genehmigen',
  'toad.approvals.decline': 'Ablehnen',
  'toad.approvals.declineReason.label': 'Ablehnungsgrund',
  'toad.approvals.declineReason.placeholder': 'z. B. Datum nicht verfügbar, Parkplatz ungeeignet',
  'toad.approvals.declineAndNotify': 'Ablehnen',
  'toad.approvals.undo': 'Rückgängig',
  'toad.approvals.daysAgo': '{days, plural, one {vor # Tag} other {vor # Tagen}}',
  'toad.approvals.today': 'Heute',
  'toad.approvals.parking': 'Parken',
  // ── Buchungsdetail — TOAD ──────────────────────────────────────────────────
  'bookingDetail.row.parking': 'Parken',
  'bookingDetail.status.approved': 'Genehmigt',
  'bookingDetail.toad.pendingNote': 'Merck sendet Ihnen innerhalb von 2 Werktagen eine E-Mail',
  'bookingDetail.toad.approvedNote': 'Zeigen Sie diesen QR-Code am Besuchstag vor',
  'bookingDetail.toad.declinedNote': 'Diese Anfrage wurde nicht genehmigt',
  'adminVerify.toad.pendingWarning': 'Diese Buchung wartet noch auf Merck-Genehmigung',
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.ts src/i18n/de.ts
git commit -m "feat(i18n): add TOAD booking and approval keys (en + de)"
```

---

### Task 2: Store + service — add truckParking, skip slots for TOAD

**Files:**
- Modify: `src/stores/bookingStore.ts`
- Modify: `src/services/bookingService.ts`

**Interfaces:**
- Produces:
  - `ClassDetails.truckParking: string` — consumed by Tasks 3, 4, 5
  - `CreateBookingParams.truckParking?: string` — consumed by Task 5
  - TOAD bookings no longer write to `slots`/`teacherSlots`

- [ ] **Step 1: Update `bookingStore.ts`**

Find `ClassDetails` interface and add `truckParking: string`:

```ts
export interface ClassDetails {
  grade: string
  studentCount: number
  accessNeeds: string
  truckParking: string   // required for TOAD, empty for onsite
}
```

Find `DEFAULT_CLASS_DETAILS` and add `truckParking: ''`.

- [ ] **Step 2: Update `bookingService.ts`**

Add `truckParking?: string` to `CreateBookingParams`:

```ts
export interface CreateBookingParams {
  uid: string
  teacherName: string
  teacherEmail: string
  schoolId: string
  visitType: 'onsite' | 'toad'
  segments: BookingSegment[]
  grade: string
  studentCount: number
  accessNeeds: string
  bookingCode: string
  truckParking?: string   // TOAD only
}
```

In `createBooking`, update the `batch.set(bookingRef, {...})` call to include `truckParking` when present:

```ts
batch.set(bookingRef, {
  type: visitType,
  teacherId: uid,
  teacherName,
  teacherEmail,
  schoolId,
  segments,
  grade,
  studentCount,
  accessNeeds,
  status: visitType === 'toad' ? 'pending' : 'confirmed',
  bookingCode,
  ...(truckParking ? { truckParking } : {}),
  createdAt: serverTimestamp(),
})
```

Then wrap the slot + teacherSlot writes in `if (visitType !== 'toad')`:

```ts
if (visitType !== 'toad') {
  for (const seg of segments) {
    const slotId = toSlotDocId(seg.date, seg.programId, seg.startHour)
    batch.set(doc(db, 'slots', slotId), { ... })
  }
  const uniqueHours = [ ... ]
  for (const key of uniqueHours) {
    const teacherSlotId = toTeacherSlotDocId(uid, date, startHour)
    batch.set(doc(db, 'teacherSlots', teacherSlotId), { ... })
  }
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/bookingStore.ts src/services/bookingService.ts
git commit -m "feat(toad): add truckParking to store and service, skip slots for TOAD bookings"
```

---

### Task 3: ToadDateStep — date-only calendar picker

**Files:**
- Create: `src/components/booking/steps/ToadDateStep.tsx`

**Interfaces:**
- Consumes: `useBookingStore()` for `setSlots`; `SelectedSlot` type from `bookingStore`
- Produces: `export function ToadDateStep({ onContinue }: { onContinue: () => void })`

- [ ] **Step 1: Create `ToadDateStep.tsx`**

```tsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useBookingStore } from '../../../stores/bookingStore'
import type { SelectedSlot } from '../../../stores/bookingStore'
import { ContinueButton } from '../BookingLayout'

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay() // 0=Sun
  const offset = first === 0 ? 6 : first - 1      // Mon-based
  const days: (number | null)[] = Array(offset).fill(null)
  const total = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= total; d++) days.push(d)
  return days
}

export function ToadDateStep({ onContinue }: { onContinue: () => void }) {
  const intl = useIntl()
  const { setSlots } = useBookingStore()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [viewYear, setViewYear] = useState(tomorrow.getFullYear())
  const [viewMonth, setViewMonth] = useState(tomorrow.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const days = calendarDays(viewYear, viewMonth)
  const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Disable navigation to months before the month containing tomorrow
  const canGoPrev = viewYear > tomorrow.getFullYear() || viewMonth > tomorrow.getMonth()

  const handleSelect = (d: number) => {
    const dow = new Date(viewYear, viewMonth, d).getDay()
    if (dow === 0 || dow === 6) return  // weekend
    const date = isoDate(viewYear, viewMonth, d)
    const dateObj = new Date(viewYear, viewMonth, d)
    if (dateObj <= today) return
    setSelected(date)
    const start = new Date(viewYear, viewMonth, d, 9, 0, 0)
    const end   = new Date(viewYear, viewMonth, d, 10, 30, 0)
    const slot: SelectedSlot = {
      programId: 'toad',
      date,
      startHour: 9,
      start,
      end,
    }
    setSlots([slot])
  }

  const monthLabel = intl.formatDate(new Date(viewYear, viewMonth, 1), { month: 'long', year: 'numeric' })

  return (
    <>
      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'toad.date.heading' })}
      </h1>
      <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {intl.formatMessage({ id: 'toad.date.sub' })}
      </p>

      {/* Calendar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="iconbtn tap disabled:opacity-30"
            aria-label="Previous month"
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 10 }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <button
            type="button"
            onClick={nextMonth}
            className="iconbtn tap"
            aria-label="Next month"
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 10 }}
          >
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {DOW.map((d) => (
            <span key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--muted-foreground)' }}>{d}</span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {days.map((d, i) => {
            if (d === null) return <span key={i} />
            const date = isoDate(viewYear, viewMonth, d)
            const dow = new Date(viewYear, viewMonth, d).getDay()
            const isWeekend = dow === 0 || dow === 6
            const dateObj = new Date(viewYear, viewMonth, d)
            const isPast = dateObj <= today
            const isDisabled = isWeekend || isPast
            const isSel = date === selected
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(d)}
                aria-pressed={isSel}
                aria-label={intl.formatDate(dateObj, { weekday: 'long', day: 'numeric', month: 'long' })}
                className="tap"
                style={{
                  height: 40,
                  borderRadius: 10,
                  border: isSel ? '2px solid var(--brand-magenta)' : '1px solid transparent',
                  background: isSel ? 'var(--tint-magenta)' : 'transparent',
                  color: isDisabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: isDisabled ? 0.35 : 1,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: isSel ? 700 : 400,
                  cursor: isDisabled ? 'default' : 'pointer',
                }}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <p className="m-0 text-sm font-medium text-center" style={{ color: 'var(--brand-magenta)' }}>
          {intl.formatDate(new Date(selected + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}

      <ContinueButton disabled={!selected} onClick={onContinue} />
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/steps/ToadDateStep.tsx
git commit -m "feat(toad): add ToadDateStep — date-only calendar picker"
```

---

### Task 4: ToadDetailsStep + ToadReviewStep + ToadConfirmedStep

**Files:**
- Create: `src/components/booking/steps/ToadDetailsStep.tsx`
- Create: `src/components/booking/steps/ToadReviewStep.tsx`
- Create: `src/components/booking/steps/ToadConfirmedStep.tsx`

**Interfaces:**
- Consumes: `useBookingStore()` (grade, studentCount, accessNeeds, truckParking, slots), `createBooking` from bookingService, `ContinueButton` from BookingLayout
- Produces:
  - `export function ToadDetailsStep({ onContinue }: { onContinue: () => void })`
  - `export function ToadReviewStep({ onBack, onConfirmed }: { onBack: () => void; onConfirmed: (id: string, code: string) => void })`
  - `export function ToadConfirmedStep({ bookingId, bookingCode, onDone }: { bookingId: string | null; bookingCode: string | null; onDone: () => void })`

- [ ] **Step 1: Create `ToadDetailsStep.tsx`**

```tsx
import { forwardRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@radix-ui/react-icons'
import * as Select from '@radix-ui/react-select'
import { useIntl } from 'react-intl'
import { ContinueButton } from '../BookingLayout'
import { useBookingStore } from '../../../stores/bookingStore'

const GRADES = ['1','2','3','4','5','6','7','8','9','10','11','12']
const MAX_STUDENTS = 30

const GradeSelectItem = forwardRef<HTMLDivElement, { value: string; children: React.ReactNode }>(
  ({ value, children, ...props }, ref) => (
    <Select.Item
      value={value}
      ref={ref}
      {...props}
      className="tap"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', outline: 'none', color: 'var(--foreground)', userSelect: 'none' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator><CheckIcon style={{ color: 'var(--primary)', width: 16, height: 16 }} /></Select.ItemIndicator>
    </Select.Item>
  )
)
GradeSelectItem.displayName = 'GradeSelectItem'

export function ToadDetailsStep({ onContinue }: { onContinue: () => void }) {
  const intl = useIntl()
  const { classDetails, setClassDetails } = useBookingStore()
  const isValid = !!classDetails.grade && classDetails.studentCount >= 1 && classDetails.truckParking.trim().length > 0

  return (
    <>
      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'bookDetails.heading' })}
      </h1>

      {/* Grade */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'bookDetails.grade.label' })}</label>
        <Select.Root value={classDetails.grade} onValueChange={(v) => setClassDetails({ grade: v })}>
          <Select.Trigger aria-label={intl.formatMessage({ id: 'bookDetails.grade.selectLabel' })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 44, padding: '0 12px', borderRadius: 12, border: '1px solid var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)', fontSize: 14, fontWeight: 500, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
            <Select.Value placeholder={intl.formatMessage({ id: 'bookDetails.grade.placeholder' })} />
            <Select.Icon><ChevronDownIcon style={{ color: 'var(--muted-foreground)', width: 16, height: 16 }} /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content position="popper" sideOffset={6} style={{ zIndex: 99999, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-float)', padding: 6, minWidth: 'var(--radix-select-trigger-width)', maxHeight: 280, overflowY: 'auto' }}>
              <Select.ScrollUpButton style={{ display: 'flex', justifyContent: 'center', padding: 4, color: 'var(--muted-foreground)' }}><ChevronUpIcon /></Select.ScrollUpButton>
              <Select.Viewport>
                <Select.Group>
                  <Select.Label style={{ padding: '4px 14px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'bookDetails.grade.label' })}</Select.Label>
                  {GRADES.map((g) => <GradeSelectItem key={g} value={g}>{intl.formatMessage({ id: 'bookDetails.grade.option' }, { grade: g })}</GradeSelectItem>)}
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton style={{ display: 'flex', justifyContent: 'center', padding: 4, color: 'var(--muted-foreground)' }}><ChevronDownIcon /></Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Students */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{intl.formatMessage({ id: 'bookDetails.students.label' })}</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'bookDetails.students.max' }, { max: MAX_STUDENTS })}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={intl.formatMessage({ id: 'bookDetails.students.remove' })} onClick={() => setClassDetails({ studentCount: Math.max(1, classDetails.studentCount - 1) })} disabled={classDetails.studentCount <= 1} className="tap flex-none grid place-items-center w-11 h-11 rounded-xl border disabled:opacity-40" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><Minus className="w-4 h-4" /></button>
          <div className="flex-1 h-11 flex items-center justify-center rounded-xl border text-xl font-bold tabular-nums" style={{ background: 'var(--card)', borderColor: 'var(--border)', fontFamily: 'var(--font-display)' }}>{classDetails.studentCount}</div>
          <button type="button" aria-label={intl.formatMessage({ id: 'bookDetails.students.add' })} onClick={() => setClassDetails({ studentCount: Math.min(MAX_STUDENTS, classDetails.studentCount + 1) })} disabled={classDetails.studentCount >= MAX_STUDENTS} className="tap flex-none grid place-items-center w-11 h-11 rounded-xl border disabled:opacity-40" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Parking — required for TOAD */}
      <div className="flex flex-col gap-2">
        <label htmlFor="parking" className="text-sm font-medium">
          {intl.formatMessage({ id: 'toad.details.parking.label' })}
        </label>
        <textarea
          id="parking"
          rows={4}
          required
          placeholder={intl.formatMessage({ id: 'toad.details.parking.placeholder' })}
          value={classDetails.truckParking}
          onChange={(e) => setClassDetails({ truckParking: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border resize-none text-sm leading-relaxed"
          style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }}
        />
        <p className="m-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'toad.details.parking.hint' })}
        </p>
      </div>

      {/* Access needs — optional */}
      <div className="flex flex-col gap-2">
        <label htmlFor="access" className="text-sm font-medium">
          {intl.formatMessage({ id: 'bookDetails.access.label' })} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{intl.formatMessage({ id: 'bookDetails.access.optional' })}</span>
        </label>
        <textarea id="access" rows={2} placeholder={intl.formatMessage({ id: 'bookDetails.access.placeholder' })} value={classDetails.accessNeeds} onChange={(e) => setClassDetails({ accessNeeds: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border resize-none text-sm leading-relaxed" style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }} />
      </div>

      <ContinueButton disabled={!isValid} onClick={onContinue} />
    </>
  )
}
```

- [ ] **Step 2: Create `ToadReviewStep.tsx`**

```tsx
import { useState } from 'react'
import { Truck } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '../../../context/AuthContext'
import { useBookingStore } from '../../../stores/bookingStore'
import { ContinueButton } from '../BookingLayout'
import { createBooking } from '../../../services/bookingService'

function makeToadCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'TC-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface Props {
  onBack: () => void
  onConfirmed: (bookingId: string, bookingCode: string) => void
}

export function ToadReviewStep({ onBack, onConfirmed }: Props) {
  const intl = useIntl()
  const { user, profile } = useAuthContext()
  const { slots, classDetails } = useBookingStore()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!slots.length || !user) return null

  const slot = slots[0]
  const dateStr = intl.formatDate(slot.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const rows = [
    { k: intl.formatMessage({ id: 'toad.review.row.date' }),     v: dateStr },
    { k: intl.formatMessage({ id: 'review.row.grade' }),          v: classDetails.grade },
    { k: intl.formatMessage({ id: 'review.row.students' }),       v: String(classDetails.studentCount) },
    { k: intl.formatMessage({ id: 'toad.review.row.parking' }),   v: classDetails.truckParking },
    ...(classDetails.accessNeeds ? [{ k: intl.formatMessage({ id: 'review.row.access' }), v: classDetails.accessNeeds }] : []),
  ]

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const bookingCode = makeToadCode()
      const { bookingId } = await createBooking({
        uid: user.uid,
        teacherName: profile?.displayName ?? '',
        teacherEmail: user.email ?? '',
        schoolId: profile?.schoolId ?? '',
        visitType: 'toad',
        segments: [{ programId: 'toad', date: slot.date, startHour: 9, order: 1 }],
        grade: classDetails.grade,
        studentCount: classDetails.studentCount,
        accessNeeds: classDetails.accessNeeds ?? '',
        truckParking: classDetails.truckParking,
        bookingCode,
      })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onConfirmed(bookingId, bookingCode)
    } catch {
      setError(intl.formatMessage({ id: 'review.error' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'toad.review.heading' })}
      </h1>

      <div className="rounded-3xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="h-2.5" style={{ background: 'var(--brand-magenta)' }} />
        <div className="px-[18px] py-[18px] flex flex-col gap-1 border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.review.type' })}
          </span>
          <span className="flex items-center gap-2 text-[22px] font-extrabold leading-[28px]" style={{ fontFamily: 'var(--font-display)' }}>
            <Truck style={{ width: 22, height: 22, color: 'var(--brand-magenta)' }} />
            {intl.formatMessage({ id: 'program.toad' })}
          </span>
          <span className="text-[15px] font-medium">{dateStr}</span>
        </div>
        <div className="px-[18px] flex flex-col">
          {rows.map((row) => (
            <div key={row.k} className="flex items-start gap-3 min-h-[48px] py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="w-[110px] text-[13px] mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{row.k}</span>
              <span className="flex-1 text-sm font-semibold leading-relaxed">{row.v}</span>
              <button type="button" onClick={onBack} className="text-[13px] font-medium min-h-[44px] inline-flex items-center tap shrink-0" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {intl.formatMessage({ id: 'review.row.edit' })}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending note */}
      <div className="flex gap-2.5 items-start p-3.5 rounded-2xl" style={{ background: 'var(--tint-magenta)' }}>
        <Truck className="flex-none mt-0.5" style={{ width: 16, height: 16, color: 'var(--brand-magenta)' }} />
        <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'toad.review.pending.note' })}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
          {error}
        </div>
      )}

      <ContinueButton loading={submitting} onClick={handleSubmit}>
        {intl.formatMessage({ id: 'toad.review.submit' })}
      </ContinueButton>
    </>
  )
}
```

- [ ] **Step 3: Create `ToadConfirmedStep.tsx`**

```tsx
import { useIntl } from 'react-intl'
import { Truck } from 'lucide-react'

interface Props {
  bookingId: string | null
  bookingCode: string | null
  onDone: () => void
}

export function ToadConfirmedStep({ bookingCode, onDone }: Props) {
  const intl = useIntl()
  return (
    <div className="flex flex-col items-center gap-5 pb-4 text-center">
      {/* Icon */}
      <div className="grid place-items-center rounded-full" style={{ width: 80, height: 80, background: 'var(--tint-magenta)' }}>
        <Truck style={{ width: 40, height: 40, color: 'var(--brand-magenta)' }} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'toad.confirmed.heading' })}
        </h1>
        <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'toad.confirmed.sub' })}
        </p>
      </div>

      {bookingCode && (
        <div className="flex flex-col items-center gap-1.5 w-full p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.confirmed.code' })}
          </span>
          <span className="text-3xl font-extrabold tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-magenta)', letterSpacing: '0.06em' }}>
            {bookingCode}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="tap w-full h-12 rounded-2xl text-sm font-semibold"
        style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {intl.formatMessage({ id: 'toad.confirmed.goBookings' })}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/booking/steps/ToadDateStep.tsx src/components/booking/steps/ToadDetailsStep.tsx src/components/booking/steps/ToadReviewStep.tsx src/components/booking/steps/ToadConfirmedStep.tsx
git commit -m "feat(toad): add ToadDetailsStep, ToadReviewStep, ToadConfirmedStep wizard steps"
```

---

### Task 5: Wire TOAD steps into BookingModal

**Files:**
- Modify: `src/components/booking/BookingModal.tsx`

**Interfaces:**
- Consumes: `ToadDateStep`, `ToadDetailsStep`, `ToadReviewStep`, `ToadConfirmedStep`
- Produces: updated `BookingModal` that routes `visitType === 'toad'` through the TOAD step flow

- [ ] **Step 1: Update `BookingModal.tsx`**

Add `'toad-date' | 'toad-details' | 'toad-review' | 'toad-confirmed'` to the `Step` union.

Update `STEP_ORDER` and `STEP_TITLES`:

```ts
type Step = 'type' | 'programs' | 'time' | 'details' | 'review' | 'confirmed'
          | 'toad-date' | 'toad-details' | 'toad-review' | 'toad-confirmed'

const TOAD_STEP_ORDER: Step[] = ['type', 'toad-date', 'toad-details', 'toad-review', 'toad-confirmed']
const TOAD_PROGRESS_STEPS: Step[] = ['toad-date', 'toad-details', 'toad-review']

// Add to STEP_TITLES:
'toad-date':      'book.title',
'toad-details':   'bookDetails.title',
'toad-review':    'toad.review.heading',
'toad-confirmed': 'toad.confirmed.heading',
```

Update `goBack` to use the right order depending on `visitType`:

```ts
const goBack = () => {
  const isToad = visitType === 'toad'
  const baseOrder = isToad ? TOAD_STEP_ORDER : STEP_ORDER
  const order = initialVisitType ? baseOrder.filter((s) => s !== 'type') : baseOrder
  const idx = order.indexOf(step)
  if (idx > 0) setStep(order[idx - 1])
}
```

Update progress calculation to handle TOAD steps:

```ts
const isToadStep = (s: Step) => s.startsWith('toad-')
const progressIdx = isToadStep(step)
  ? TOAD_PROGRESS_STEPS.indexOf(step)
  : PROGRESS_STEPS.indexOf(step)
```

Update `showBack` and `showProgress`:

```ts
const showBack = step !== 'type' && step !== 'programs' && step !== 'confirmed' && step !== 'toad-confirmed' && step !== 'toad-date'
const showProgress = step !== 'type' && step !== 'confirmed' && step !== 'toad-confirmed'
const totalSteps = isToadStep(step) ? TOAD_PROGRESS_STEPS.length : PROGRESS_STEPS.length
```

Add imports at the top:

```ts
import { ToadDateStep } from './steps/ToadDateStep'
import { ToadDetailsStep } from './steps/ToadDetailsStep'
import { ToadReviewStep } from './steps/ToadReviewStep'
import { ToadConfirmedStep } from './steps/ToadConfirmedStep'
```

Add the TOAD step branches inside the modal content, after the onsite step renders. Also update `BookTypeStep` `onSelect` to branch:

```tsx
{step === 'type' && (
  <BookTypeStep onSelect={(vt) => {
    goTo(vt === 'toad' ? 'toad-date' : 'programs')
  }} />
)}
{step === 'toad-date' && (
  <ToadDateStep onContinue={() => goTo('toad-details')} />
)}
{step === 'toad-details' && (
  <ToadDetailsStep onContinue={() => goTo('toad-review')} />
)}
{step === 'toad-review' && (
  <ToadReviewStep
    onBack={() => goTo('toad-details')}
    onConfirmed={(id, code) => { setConfirmedBookingId(id); setConfirmedBookingCode(code); goTo('toad-confirmed') }}
  />
)}
{step === 'toad-confirmed' && (
  <ToadConfirmedStep
    bookingId={confirmedBookingId}
    bookingCode={confirmedBookingCode}
    onDone={handleClose}
  />
)}
```

Also update the `useEffect` that handles `initialVisitType`: if `initialVisitType === 'toad'`, set `step` to `'toad-date'` not `'programs'`.

- [ ] **Step 2: TypeScript check + build**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/BookingModal.tsx
git commit -m "feat(toad): wire TOAD step flow into BookingModal"
```

---

### Task 6: ToadApprovalsPage + useAllToadBookings hook + route

**Files:**
- Modify: `src/hooks/queries/useBookings.ts` — add `useAllToadBookings`
- Create: `src/components/admin/ToadApprovalsPage.tsx`
- Modify: `src/App.tsx` — add `/admin/toad` route

**Interfaces:**
- Produces: `useAllToadBookings()` returning `BookingDoc[]` via realtime `onSnapshot`; `ToadApprovalsPage` default export

- [ ] **Step 1: Add `useAllToadBookings` to `useBookings.ts`**

```ts
/**
 * Staff-only: real-time listener for all TOAD bookings (pending, approved, declined).
 */
export function useAllToadBookings(): BookingDoc[] {
  const { user } = useAuthContext()
  const [bookings, setBookings] = useState<BookingDoc[]>([])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'bookings'),
      where('type', '==', 'toad'),
      where('status', 'in', ['pending', 'approved', 'declined']),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc))
    })
  }, [user])

  return bookings
}
```

Import `useState` and `useEffect` at the top if not already imported.

- [ ] **Step 2: Create `ToadApprovalsPage.tsx`**

```tsx
import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Check, X, RotateCcw } from 'lucide-react'
import { useIntl } from 'react-intl'
import { db } from '../../shared/firebase'
import { useAllToadBookings, type BookingDoc } from '../../hooks/queries/useBookings'

function daysSince(ts: { seconds: number } | undefined): number {
  if (!ts) return 0
  return Math.floor((Date.now() / 1000 - ts.seconds) / 86400)
}

function DateBadge({ dateStr }: { dateStr?: string }) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00')
  const mon = d.toLocaleString('en', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  return (
    <div className="flex-none flex flex-col items-center justify-center rounded-2xl text-white" style={{ width: 52, minHeight: 60, background: 'var(--brand-magenta)', padding: '8px 0' }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>{mon}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{day}</span>
    </div>
  )
}

function BookingCard({ booking, onApprove, onDecline }: { booking: BookingDoc; onApprove: () => void; onDecline: (reason: string) => void }) {
  const intl = useIntl()
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')

  const date = booking.segments?.[0]?.date
  const days = daysSince(booking.createdAt as { seconds: number } | undefined)

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex gap-3 items-start">
        <DateBadge dateStr={date} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-sm font-bold truncate">{booking.teacherName}</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{booking.teacherEmail}</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'review.row.grade' })} {booking.grade} · {booking.studentCount} {intl.formatMessage({ id: 'review.row.students' }).toLowerCase()}
          </span>
          {days === 0
            ? <span className="text-xs font-medium" style={{ color: 'var(--brand-magenta)' }}>{intl.formatMessage({ id: 'toad.approvals.today' })}</span>
            : <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'toad.approvals.daysAgo' }, { days })}</span>
          }
        </div>
      </div>

      {booking.truckParking && (
        <div className="flex gap-2 text-xs p-2.5 rounded-xl" style={{ background: 'var(--app-ground)', color: 'var(--muted-foreground)' }}>
          <span className="font-semibold shrink-0">{intl.formatMessage({ id: 'toad.approvals.parking' })}:</span>
          <span className="leading-relaxed">{booking.truckParking}</span>
        </div>
      )}

      {!declining ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDeclining(true)}
            className="tap flex-1 h-9 rounded-xl text-xs font-semibold border"
            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {intl.formatMessage({ id: 'toad.approvals.decline' })}
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="tap flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Check style={{ width: 14, height: 14 }} />
            {intl.formatMessage({ id: 'toad.approvals.approve' })}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium">{intl.formatMessage({ id: 'toad.approvals.declineReason.label' })}</label>
          <textarea
            rows={2}
            placeholder={intl.formatMessage({ id: 'toad.approvals.declineReason.placeholder' })}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border resize-none text-sm"
            style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setDeclining(false); setReason('') }} className="tap flex-none h-9 px-3 rounded-xl text-xs border" style={{ background: 'transparent', borderColor: 'var(--border)', cursor: 'pointer', fontFamily: 'inherit' }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
            <button type="button" onClick={() => onDecline(reason)} className="tap flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: 'var(--destructive)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {intl.formatMessage({ id: 'toad.approvals.declineAndNotify' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RecentCard({ booking }: { booking: BookingDoc }) {
  const intl = useIntl()
  const date = booking.segments?.[0]?.date
  const isApproved = booking.status === 'approved'
  return (
    <div className="flex gap-3 items-center p-3.5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)', opacity: 0.85 }}>
      <DateBadge dateStr={date} />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold truncate block">{booking.teacherName}</span>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'review.row.grade' })} {booking.grade} · {booking.studentCount} students</span>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: isApproved ? 'rgba(1,136,76,0.12)' : 'var(--tint-red)', color: isApproved ? 'var(--brand-green)' : 'var(--destructive)' }}>
        {isApproved ? intl.formatMessage({ id: 'bookingDetail.status.approved' }) : intl.formatMessage({ id: 'bookings.status.cancelled' })}
      </span>
    </div>
  )
}

export default function ToadApprovalsPage() {
  const intl = useIntl()
  const bookings = useAllToadBookings()
  const [undoQueue, setUndoQueue] = useState<Record<string, BookingDoc['status']>>({})

  const pending = bookings.filter((b) => b.status === 'pending')
    .sort((a, b) => ((a.createdAt as { seconds: number })?.seconds ?? 0) - ((b.createdAt as { seconds: number })?.seconds ?? 0))
  const recent = bookings.filter((b) => b.status === 'approved' || b.status === 'declined').slice(0, 20)

  const approve = async (booking: BookingDoc) => {
    setUndoQueue((q) => ({ ...q, [booking.id]: 'pending' }))
    await updateDoc(doc(db, 'bookings', booking.id), { status: 'approved', updatedAt: serverTimestamp() })
    setTimeout(() => setUndoQueue((q) => { const n = { ...q }; delete n[booking.id]; return n }), 5000)
  }

  const decline = async (booking: BookingDoc, reason: string) => {
    setUndoQueue((q) => ({ ...q, [booking.id]: 'pending' }))
    await updateDoc(doc(db, 'bookings', booking.id), { status: 'declined', declineReason: reason, updatedAt: serverTimestamp() })
    setTimeout(() => setUndoQueue((q) => { const n = { ...q }; delete n[booking.id]; return n }), 5000)
  }

  const undo = async (bookingId: string) => {
    const prev = undoQueue[bookingId]
    if (!prev) return
    setUndoQueue((q) => { const n = { ...q }; delete n[bookingId]; return n })
    await updateDoc(doc(db, 'bookings', bookingId), { status: prev, updatedAt: serverTimestamp() })
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto flex flex-col gap-6" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>
      <h1 className="m-0 text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'toad.approvals.title' })}
      </h1>

      {/* Undo toasts */}
      {Object.keys(undoQueue).map((id) => (
        <div key={id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
          <span className="flex-1 text-sm font-medium">{intl.formatMessage({ id: 'toad.approvals.title' })}</span>
          <button type="button" onClick={() => undo(id)} className="tap flex items-center gap-1.5 text-sm font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--background)', fontFamily: 'inherit' }}>
            <RotateCcw style={{ width: 14, height: 14 }} />
            {intl.formatMessage({ id: 'toad.approvals.undo' })}
          </button>
        </div>
      ))}

      {/* Pending section */}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'toad.approvals.pending' }, { count: pending.length })}
        </h2>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <Check style={{ width: 32, height: 32, color: 'var(--primary)' }} />
            <span className="text-base font-bold">{intl.formatMessage({ id: 'toad.approvals.empty' })}</span>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'toad.approvals.emptySub' })}</span>
          </div>
        ) : (
          pending.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onApprove={() => approve(b)}
              onDecline={(reason) => decline(b, reason)}
            />
          ))
        )}
      </section>

      {/* Recent section */}
      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.approvals.recent' })}
          </h2>
          {recent.map((b) => <RecentCard key={b.id} booking={b} />)}
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add route to `App.tsx`**

Import `ToadApprovalsPage` and add the route inside `AppRoutes`:

```tsx
import ToadApprovalsPage from './components/admin/ToadApprovalsPage'

// Inside <Routes>:
<Route path="/admin/toad" element={<ShellRoute element={<ProtectedRoute requireStaff><ToadApprovalsPage /></ProtectedRoute>} />} />
```

- [ ] **Step 4: TypeScript check + build**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/queries/useBookings.ts src/components/admin/ToadApprovalsPage.tsx src/App.tsx
git commit -m "feat(toad): add ToadApprovalsPage, useAllToadBookings hook, /admin/toad route"
```

---

### Task 7: BookingDetailPage + BookingVerifyPage — TOAD status and parking

**Files:**
- Modify: `src/components/pages/BookingDetailPage.tsx`
- Modify: `src/components/admin/BookingVerifyPage.tsx`

**Interfaces:**
- Consumes: existing `BookingDoc`, `BookingQRCode`, i18n keys added in Task 1
- Produces: no new exports — enhancements only

- [ ] **Step 1: Read both files to understand exact current structure**

Read `src/components/pages/BookingDetailPage.tsx` and `src/components/admin/BookingVerifyPage.tsx` fully before editing.

- [ ] **Step 2: Update `BookingDetailPage.tsx`**

Find where the QR code section is rendered (look for `BookingQRCode` or `status === 'confirmed'`). Change the condition to also show QR for `approved`:

```tsx
// Before:
{booking.status === 'confirmed' && <BookingQRCode ... />}

// After:
{(booking.status === 'confirmed' || booking.status === 'approved') && <BookingQRCode ... />}
```

Find where status rows are defined. Add a `truckParking` row for TOAD bookings:

```tsx
// Add after existing rows, conditionally:
if (booking.type === 'toad' && booking.truckParking) {
  rows.push({
    label: intl.formatMessage({ id: 'bookingDetail.row.parking' }),
    value: booking.truckParking,
  })
}
```

Add TOAD-specific status notes below the status chip. Find where `booking.status` drives the status chip display and add a note paragraph:

```tsx
{booking.type === 'toad' && booking.status === 'pending' && (
  <p className="m-0 text-sm" style={{ color: 'var(--muted-foreground)' }}>
    {intl.formatMessage({ id: 'bookingDetail.toad.pendingNote' })}
  </p>
)}
{booking.type === 'toad' && booking.status === 'approved' && (
  <p className="m-0 text-sm" style={{ color: 'var(--brand-green)' }}>
    {intl.formatMessage({ id: 'bookingDetail.toad.approvedNote' })}
  </p>
)}
{booking.type === 'toad' && booking.status === 'declined' && (
  <>
    <p className="m-0 text-sm font-medium" style={{ color: 'var(--destructive)' }}>
      {intl.formatMessage({ id: 'bookingDetail.toad.declinedNote' })}
    </p>
    {booking.declineReason && (
      <p className="m-0 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        {booking.declineReason}
      </p>
    )}
  </>
)}
```

Also add `'approved'` to the status chip map:
```tsx
approved: { label: intl.formatMessage({ id: 'bookingDetail.status.approved' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.1)' },
```

- [ ] **Step 3: Update `BookingVerifyPage.tsx`**

Add `truckParking` row for TOAD bookings in the detail card. Find where detail rows are built and add:

```tsx
{booking.type === 'toad' && booking.truckParking && (
  <div className="flex items-start gap-3 min-h-[48px] py-3 border-b" style={{ borderColor: 'var(--border)' }}>
    <span className="w-[110px] text-[13px] shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
      {intl.formatMessage({ id: 'bookingDetail.row.parking' })}
    </span>
    <span className="flex-1 text-sm font-semibold leading-relaxed">{booking.truckParking}</span>
  </div>
)}
```

Add pending warning for TOAD `pending` bookings — show above the "Mark as Arrived" button:

```tsx
{booking.type === 'toad' && booking.status === 'pending' && (
  <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-yellow)', color: 'var(--foreground)' }}>
    {intl.formatMessage({ id: 'adminVerify.toad.pendingWarning' })}
  </div>
)}
```

Hide "Mark as Arrived" for TOAD bookings with `status === 'pending'`:

```tsx
// Find the "Mark as Arrived" button condition and add:
&& !(booking.type === 'toad' && booking.status === 'pending')
```

- [ ] **Step 4: TypeScript check + build**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/BookingDetailPage.tsx src/components/admin/BookingVerifyPage.tsx
git commit -m "feat(toad): show QR for approved, parking row, status notes in detail and verify pages"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| TOAD wizard date-only step | Task 3 (ToadDateStep) |
| TOAD wizard no time/program steps | Task 5 (BookingModal branching) |
| truckParking in store + service | Task 2 |
| TOAD bookings skip slots collection | Task 2 |
| TC- prefix for TOAD booking codes | Task 4 (ToadReviewStep makeToadCode) |
| ToadDetailsStep with required parking | Task 4 |
| ToadReviewStep with pending note | Task 4 |
| ToadConfirmedStep "request sent" | Task 4 |
| Coordinator/admin approval UI | Task 6 (ToadApprovalsPage) |
| Real-time listener for TOAD bookings | Task 6 (useAllToadBookings) |
| Approve action | Task 6 |
| Decline with reason | Task 6 |
| Undo 5 s toast | Task 6 |
| /admin/toad route, staff-gated | Task 6 |
| QR shown for approved TOAD | Task 7 |
| truckParking row in BookingDetail | Task 7 |
| TOAD status notes (pending/approved/declined) | Task 7 |
| truckParking row in BookingVerifyPage | Task 7 |
| Pending TOAD: no "Mark as Arrived" | Task 7 |
| All strings in en + de | Task 1 |

**Type consistency:**
- `ToadDateStep` sets `SelectedSlot` with `programId: 'toad'` — matches `ProgramId = 'cube' | 'lab' | 'toad'` ✓
- `ToadReviewStep` calls `createBooking({ visitType: 'toad', truckParking, ... })` — `truckParking` added to params in Task 2 ✓
- `ToadConfirmedStep` accepts `bookingId: string | null` and `bookingCode: string | null` — same signature as `BookConfirmedStep` ✓
- `useAllToadBookings` returns `BookingDoc[]` — consistent with `useAllBookings` ✓
- `BookingModal` `Step` union extended — `goBack` uses correct order array based on `visitType` ✓
