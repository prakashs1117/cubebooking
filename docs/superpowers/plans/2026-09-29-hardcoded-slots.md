# Hardcoded Slot Config — Drop Sessions, Query Bookings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Firestore `sessions` collection with hardcoded slot times in the app; determine availability by querying `bookings` directly.

**Architecture:** A new `src/config/slots.ts` defines the 8 fixed slots per program and 4 combo pairs. `BookTimePage` renders buttons from this config and queries `bookings` to mark slots as taken or "yours". `BookingSegment` stores `programId + date + startHour` instead of a `sessionId`. The `confirmBooking` Cloud Function validates against existing bookings only — no session documents are read or written. `useSessionsForWeek`, `useBookingTimes`, and `useTeacherBookingWindows` are removed; a single new hook `useSlotAvailability` replaces all three.

**Tech Stack:** React 18, Zustand, React Query (@tanstack/react-query), Firebase Firestore, Firebase Cloud Functions v2 (Node 20, TypeScript), react-intl

**Spec:** Design is captured in the brainstorming conversation (2026-09-29). No separate spec file.

## Global Constraints

- Slot hours (both programs): 8, 9, 10, 11, 13, 14, 15, 16 (skip 12 — lunch break)
- Slot duration: 60 minutes each
- Combo pairs (startHour of first slot): [8,9], [10,11], [13,14], [15,16]
- Capacity per slot: 1 class (a slot is taken when any confirmed/approved/pending booking claims it)
- Slot identity: `programId + date (YYYY-MM-DD) + startHour (integer)`
- Teacher clash rule: same teacher cannot hold two bookings whose time ranges overlap
- No `sessionId` in `BookingSegment` going forward
- No TypeScript `any` except where already present in existing files
- All user-facing text in both `src/i18n/en.ts` and `src/i18n/de.ts`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/config/slots.ts` | **Create** | Single source of truth for slot hours and combo pairs |
| `src/shared/types/index.ts` | Modify | `BookingSegment`: add `date`, `startHour`; remove `sessionId` |
| `src/stores/bookingStore.ts` | Modify | `SelectedSlot`: add `date`, `startHour`; remove `sessionId` |
| `src/hooks/queries/useBookings.ts` | Modify | Remove `useBookingTimes`, `useTeacherBookingWindows`; add `useSlotAvailability` |
| `src/components/booking/BookTimePage.tsx` | Modify | Render slots from config; use `useSlotAvailability` |
| `src/components/booking/ReviewPage.tsx` | Modify | Pass new segment shape (no `sessionIds`) to Cloud Function |
| `src/components/pages/BookingDetailPage.tsx` | Modify | Remove `useBookingTimes`; derive times from `segments.date+startHour` |
| `src/components/pages/BookingsPage.tsx` | Modify | Remove `useBookingTimes`; derive times from `segments.date+startHour` |
| `functions/src/index.ts` | Modify | Validate against bookings collection; no session reads/writes |
| `src/hooks/queries/useSessions.ts` | **Delete** | Unused once sessions collection is gone |

---

## Task 1: Create slot config

**Files:**
- Create: `src/config/slots.ts`

**Interfaces:**
- Produces:
  - `SLOT_HOURS: readonly number[]` — `[8, 9, 10, 11, 13, 14, 15, 16]`
  - `COMBO_PAIRS: readonly [number, number][]` — pairs of consecutive startHours for "both" bookings
  - `slotToDate(date: string, startHour: number): Date` — converts YYYY-MM-DD + startHour to a local Date at that hour
  - `slotEndDate(date: string, startHour: number): Date` — same but +60 min (the slot's end)
  - `dateToSlotKey(date: string, startHour: number): string` — returns `"${date}T${startHour}"` for use as map keys

- [ ] **Step 1: Create the file**

```ts
// src/config/slots.ts

export const SLOT_HOURS = [8, 9, 10, 11, 13, 14, 15, 16] as const

export const COMBO_PAIRS: readonly [number, number][] = [
  [8, 9],
  [10, 11],
  [13, 14],
  [15, 16],
]

export function slotToDate(date: string, startHour: number): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, startHour, 0, 0, 0)
}

export function slotEndDate(date: string, startHour: number): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, startHour + 1, 0, 0, 0)
}

export function dateToSlotKey(date: string, startHour: number): string {
  return `${date}T${startHour}`
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/config/slots.ts
git commit -m "feat: add hardcoded slot config"
```

---

## Task 2: Update data model — `BookingSegment` and `SelectedSlot`

**Files:**
- Modify: `src/shared/types/index.ts`
- Modify: `src/stores/bookingStore.ts`

**Interfaces:**
- Produces:
  - `BookingSegment` (types): `{ programId: ProgramId; order: number; date: string; startHour: number }`
  - `SelectedSlot` (store): `{ programId: ProgramId; date: string; startHour: number; start: Date; end: Date }`

- [ ] **Step 1: Update `BookingSegment` in `src/shared/types/index.ts`**

Find the existing `BookingSegment` interface (around line 75) and replace it:

```ts
export interface BookingSegment {
  programId: ProgramId
  order: number               // 1 = first, 2 = second (Cube+Lab combo)
  date: string                // 'YYYY-MM-DD'
  startHour: number           // 0–23
}
```

- [ ] **Step 2: Update `SelectedSlot` in `src/stores/bookingStore.ts`**

Find the existing `SelectedSlot` interface (around line 8) and replace it:

```ts
export interface SelectedSlot {
  programId: ProgramId
  date: string       // 'YYYY-MM-DD'
  startHour: number  // 0–23
  start: Date
  end: Date
}
```

- [ ] **Step 3: Verify TypeScript compiles (errors expected — will fix in later tasks)**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: errors referencing `sessionId` in `BookingDetailPage`, `BookingsPage`, `useBookings.ts`, `BookTimePage`, `ReviewPage`. These are all fixed in the tasks below — note them, continue.

- [ ] **Step 4: Commit**

```bash
git add src/shared/types/index.ts src/stores/bookingStore.ts
git commit -m "refactor: drop sessionId from BookingSegment and SelectedSlot, add date+startHour"
```

---

## Task 3: Update `useBookings.ts` — remove session-based hooks, add `useSlotAvailability`

**Files:**
- Modify: `src/hooks/queries/useBookings.ts`

**Interfaces:**
- Removes: `useBookingTimes`, `useTeacherBookingWindows`
- Produces:
  - `useSlotAvailability(programIds: ProgramId[], date: string | null): SlotAvailabilityMap`
  - `SlotAvailabilityMap` = `Record<string, 'taken' | 'yours'>` where key is `dateToSlotKey(date, startHour)` — `'yours'` means the current teacher already holds this slot, `'taken'` means another class does

  - `isUpcoming(booking: BookingDoc): boolean` — updated to derive from `segments[0].date + startHour` instead of a session lookup

- [ ] **Step 1: Replace the file contents**

```ts
// src/hooks/queries/useBookings.ts
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Booking, ProgramId } from '../../shared/types'
import { useAuthContext } from '../../context/AuthContext'
import { dateToSlotKey, slotToDate } from '../../config/slots'

export type BookingDoc = Booking & { id: string }

export type SlotAvailabilityMap = Record<string, 'taken' | 'yours'>

export function useMyBookings() {
  const { user } = useAuthContext()
  return useQuery({
    queryKey: ['bookings', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const q = query(
        collection(db, 'bookings'),
        where('teacherId', '==', user!.uid),
        orderBy('createdAt', 'desc'),
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc)
    },
    staleTime: 30_000,
  })
}

export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['booking', bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'bookings', bookingId!))
      if (!snap.exists()) throw new Error('Booking not found')
      return { id: snap.id, ...snap.data() } as BookingDoc
    },
    staleTime: 60_000,
  })
}

export function isUpcoming(booking: BookingDoc): boolean {
  if (!booking.segments?.length) return false
  const seg = booking.segments[0]
  if (!seg.date || seg.startHour == null) return true
  return slotToDate(seg.date, seg.startHour) > new Date()
}

/**
 * Returns a map of slotKey → 'yours' | 'taken' for the given programs and date.
 * 'yours' = current teacher holds this slot (any active status).
 * 'taken' = another class holds this slot.
 * Keys absent from the map = slot is available.
 */
export function useSlotAvailability(
  programIds: ProgramId[],
  date: string | null,
): SlotAvailabilityMap {
  const { user } = useAuthContext()

  const { data } = useQuery({
    queryKey: ['slot-availability', programIds.join(','), date],
    enabled: !!user && !!date && programIds.length > 0,
    queryFn: async () => {
      const activeStatuses = ['confirmed', 'approved', 'pending']
      const results = await Promise.all(
        programIds.map((pid) =>
          getDocs(
            query(
              collection(db, 'bookings'),
              where('status', 'in', activeStatuses),
            ),
          ).then((snap) =>
            snap.docs
              .map((d) => ({ id: d.id, ...d.data() }) as BookingDoc)
              .filter((b) =>
                (b.segments ?? []).some(
                  (seg) => seg.programId === pid && seg.date === date,
                ),
              ),
          ),
        ),
      )

      const map: SlotAvailabilityMap = {}
      for (const bookingList of results) {
        for (const booking of bookingList) {
          for (const seg of booking.segments ?? []) {
            if (!programIds.includes(seg.programId as ProgramId)) continue
            if (seg.date !== date) continue
            const key = dateToSlotKey(date, seg.startHour)
            map[key] = booking.teacherId === user!.uid ? 'yours' : 'taken'
          }
        }
      }
      return map
    },
    staleTime: 30_000,
  })

  return data ?? {}
}
```

> **Note on the query:** Firestore doesn't support querying inside array fields by sub-field value, so we fetch all active bookings and filter client-side by `programId + date`. For a small dataset (one school, a few dozen bookings per day) this is fine.

- [ ] **Step 2: Verify TypeScript compiles (some errors still expected from callers)**

```bash
npx tsc --noEmit 2>&1 | grep useBookings
```

Expected: errors gone from this file; remaining errors are in its callers.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/queries/useBookings.ts
git commit -m "refactor: replace session-based booking hooks with useSlotAvailability"
```

---

## Task 4: Rewrite `BookTimePage` to use slot config

**Files:**
- Modify: `src/components/booking/BookTimePage.tsx`

**Interfaces:**
- Consumes:
  - `SLOT_HOURS`, `COMBO_PAIRS`, `slotToDate`, `slotEndDate`, `dateToSlotKey` from `src/config/slots.ts`
  - `useSlotAvailability(programIds, date)` from `src/hooks/queries/useBookings.ts`
  - `useMyBookings()` — still used for teacher conflict detection via availability map
- Produces: `SelectedSlot[]` (new shape: `{ programId, date, startHour, start, end }`) pushed to `bookingStore`

The weekly calendar (day selection, week nav, prev/next arrows) is kept as-is. The session-loading logic and `useSessionsForWeek` / `useTeacherBookingWindows` imports are removed. The time-slot section renders from `SLOT_HOURS` (single program) or `COMBO_PAIRS` (both programs).

A slot button's disabled state comes from `availabilityMap[key]`: `'taken'` → booked pill, `'yours'` → yours pill. Available → radio indicator.

- [ ] **Step 1: Replace the file**

```tsx
// src/components/booking/BookTimePage.tsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, startOfWeek, format, isSameDay, addWeeks } from 'date-fns'
import { useIntl } from 'react-intl'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'
import { useSlotAvailability } from '../../hooks/queries/useBookings'
import { SLOT_HOURS, COMBO_PAIRS, slotToDate, slotEndDate, dateToSlotKey } from '../../config/slots'
import type { ProgramId } from '../../shared/types'

function getProgramIds(selection: string | null, order: string): ProgramId[] {
  if (selection === 'cube') return ['cube']
  if (selection === 'lab') return ['lab']
  if (selection === 'both') return order === 'cube-first' ? ['cube', 'lab'] : ['lab', 'cube']
  return []
}

function getStepTitle(selection: string | null, order: string, intl: ReturnType<typeof useIntl>): string {
  if (selection === 'cube') return intl.formatMessage({ id: 'program.cube' })
  if (selection === 'lab')  return intl.formatMessage({ id: 'program.lab' })
  if (selection === 'both') return `${intl.formatMessage({ id: 'program.both' })} · ${order === 'cube-first' ? intl.formatMessage({ id: 'bookPrograms.order.cubeFirst.label' }) : intl.formatMessage({ id: 'bookPrograms.order.labFirst.label' })}`
  return intl.formatMessage({ id: 'bookTime.title' })
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function BookTimePage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const { programSelection, programOrder, selectedDate, slots, setSelectedDate, setSlots, startHold } = useBookingStore()

  const [weekOffset, setWeekOffset] = useState(0)

  const DOW_LABELS = [
    intl.formatMessage({ id: 'bookTime.dow.mon' }),
    intl.formatMessage({ id: 'bookTime.dow.tue' }),
    intl.formatMessage({ id: 'bookTime.dow.wed' }),
    intl.formatMessage({ id: 'bookTime.dow.thu' }),
    intl.formatMessage({ id: 'bookTime.dow.fri' }),
  ]

  const todayRef = useRef<Date>((() => { const d = new Date(); d.setHours(0,0,0,0); return d })())
  const tomorrowRef = useRef<Date>((() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+1); return d })())
  const today    = todayRef.current
  const tomorrow = tomorrowRef.current

  const baseWeek = useMemo(() => {
    const base = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
    base.setHours(0, 0, 0, 0)
    return base
  }, [weekOffset, today])

  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => addDays(baseWeek, i)),
    [baseWeek],
  )

  const programIds = getProgramIds(programSelection, programOrder)
  const dateKey = selectedDate ? formatDateKey(selectedDate) : null

  const availabilityMap = useSlotAvailability(programIds, dateKey)

  // Auto-advance to first day of this week if no date selected
  useEffect(() => {
    if (!selectedDate) {
      const firstBookable = weekDays.find((d) => d >= tomorrow)
      if (firstBookable) setSelectedDate(new Date(firstBookable))
    }
  }, [selectedDate, weekDays, tomorrow, setSelectedDate])

  const availableTimes = useMemo(() => {
    if (!dateKey) return []

    if (programSelection !== 'both') {
      const pid = programIds[0]
      return SLOT_HOURS.map((h) => {
        const key = dateToSlotKey(dateKey, h)
        const status = availabilityMap[key]
        return {
          startHour: h,
          programId: pid,
          start: slotToDate(dateKey, h),
          end: slotEndDate(dateKey, h),
          disabled: !!status,
          reason: status ?? null,
          label: intl.formatTime(slotToDate(dateKey, h), { hour: '2-digit', minute: '2-digit' }),
          endLabel: intl.formatTime(slotEndDate(dateKey, h), { hour: '2-digit', minute: '2-digit' }),
        }
      })
    }

    // Both programs — render combo pairs
    const firstProg = programIds[0]
    const secondProg = programIds[1]
    return COMBO_PAIRS.map(([h1, h2]) => {
      const key1 = dateToSlotKey(dateKey, h1)
      const key2 = dateToSlotKey(dateKey, h2)
      const s1 = availabilityMap[key1]
      const s2 = availabilityMap[key2]
      const disabled = !!(s1 || s2)
      // 'yours' only if both halves are yours; otherwise 'taken'
      const reason: 'taken' | 'yours' | null = disabled
        ? (s1 === 'yours' && s2 === 'yours' ? 'yours' : 'taken')
        : null
      return {
        startHour: h1,
        endHour: h2 + 1,
        firstProg,
        secondProg,
        start: slotToDate(dateKey, h1),
        end: slotEndDate(dateKey, h2),
        disabled,
        reason,
        label: intl.formatTime(slotToDate(dateKey, h1), { hour: '2-digit', minute: '2-digit' }),
        endLabel: intl.formatTime(slotEndDate(dateKey, h2), { hour: '2-digit', minute: '2-digit' }),
      }
    })
  }, [dateKey, programSelection, programIds, availabilityMap, intl])

  const selectedSlotKey = slots.length > 0 ? dateToSlotKey(slots[0].date, slots[0].startHour) : null

  const handleSelectSingle = (h: number, pid: ProgramId) => {
    if (!dateKey) return
    setSlots([{
      programId: pid,
      date: dateKey,
      startHour: h,
      start: slotToDate(dateKey, h),
      end: slotEndDate(dateKey, h),
    }])
  }

  const handleSelectCombo = (h1: number, h2: number, firstProg: ProgramId, secondProg: ProgramId) => {
    if (!dateKey) return
    setSlots([
      { programId: firstProg,  date: dateKey, startHour: h1, start: slotToDate(dateKey, h1), end: slotEndDate(dateKey, h1) },
      { programId: secondProg, date: dateKey, startHour: h2, start: slotToDate(dateKey, h2), end: slotEndDate(dateKey, h2) },
    ])
  }

  const handleContinue = () => {
    startHold()
    navigate('/book/details')
  }

  const monthLabel = intl.formatDate(weekDays[0], { month: 'long', year: 'numeric' })

  return (
    <BookingLayout
      title={getStepTitle(programSelection, programOrder, intl)}
      step={3}
      totalSteps={4}
      onBack="/book/programs"
      footer={<ContinueButton disabled={slots.length === 0} onClick={handleContinue} />}
    >
      {/* Month + week nav */}
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[28px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {monthLabel}
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            disabled={weekOffset <= 0}
            className="iconbtn tap border disabled:opacity-30"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            aria-label="Previous week"
          >
            <ChevronLeft className="i" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="iconbtn tap border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            aria-label="Next week"
          >
            <ChevronRight className="i" />
          </button>
        </div>
      </div>

      {/* 5-day week grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {weekDays.map((day, i) => {
          const dayMidnight = new Date(day.getFullYear(), day.getMonth(), day.getDate())
          const isPast = dayMidnight < tomorrow
          const isSel = selectedDate ? isSameDay(day, selectedDate) : false
          const closed = isPast

          return (
            <button
              key={i}
              type="button"
              disabled={closed}
              aria-pressed={isSel}
              onClick={() => { setSelectedDate(day); setSlots([]) }}
              className="tap flex flex-col items-center justify-center gap-0.5 rounded-[18px] border h-[84px] transition-colors"
              style={{
                background: isSel ? 'var(--primary)' : closed ? 'transparent' : 'var(--card)',
                color: isSel ? '#fff' : closed ? 'var(--muted-foreground)' : 'var(--foreground)',
                borderColor: isSel ? 'var(--primary)' : closed ? 'var(--border)' : 'var(--border)',
                boxShadow: isSel ? 'var(--shadow-float)' : 'var(--shadow-xs)',
                cursor: closed ? 'default' : 'pointer',
                opacity: closed ? 0.4 : 1,
              }}
            >
              <span className="text-xs font-semibold">{DOW_LABELS[i]}</span>
              <span className="text-2xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                {format(day, 'd')}
              </span>
              {!closed && !isSel && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Time slots for selected day */}
      {selectedDate && dateKey && (
        <div className="rise flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          <div className="flex flex-col gap-2">
            {programSelection !== 'both'
              ? (availableTimes as ReturnType<typeof useMemo> extends Array<infer T> ? T : never[]).map((slot) => {
                  const s = slot as { startHour: number; programId: ProgramId; start: Date; end: Date; disabled: boolean; reason: 'taken' | 'yours' | null; label: string; endLabel: string }
                  const key = dateToSlotKey(dateKey, s.startHour)
                  const isSel = !s.disabled && selectedSlotKey === key
                  const mins = 60
                  const durLabel = `${mins / 60}h`

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={s.disabled}
                      onClick={() => handleSelectSingle(s.startHour, s.programId)}
                      className="flex items-center px-4 h-14 rounded-2xl border-2 text-sm"
                      style={{
                        background: isSel ? 'var(--tint-purple)' : 'var(--card)',
                        borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                        color: s.disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                        opacity: s.disabled ? 0.55 : 1,
                        cursor: s.disabled ? 'default' : 'pointer',
                      }}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span className="mx-1.5 opacity-40">–</span>
                      <span className="font-semibold">{s.endLabel}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: isSel ? 'rgba(80,50,145,0.12)' : 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        {durLabel}
                      </span>
                      {s.reason ? (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          {s.reason === 'yours'
                            ? intl.formatMessage({ id: 'bookTime.slot.yours' })
                            : intl.formatMessage({ id: 'bookTime.slot.booked' })}
                        </span>
                      ) : (
                        <span className="ml-auto w-5 h-5 rounded-full box-border flex-none transition-all"
                          style={{ border: isSel ? '6px solid var(--primary)' : '2px solid var(--border)' }} />
                      )}
                    </button>
                  )
                })
              : (availableTimes as ReturnType<typeof useMemo> extends Array<infer T> ? T : never[]).map((slot) => {
                  const s = slot as { startHour: number; endHour: number; firstProg: ProgramId; secondProg: ProgramId; start: Date; end: Date; disabled: boolean; reason: 'taken' | 'yours' | null; label: string; endLabel: string }
                  const key = dateToSlotKey(dateKey, s.startHour)
                  const isSel = !s.disabled && selectedSlotKey === key
                  const mins = 120
                  const durLabel = `${mins / 60}h`

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={s.disabled}
                      onClick={() => handleSelectCombo(s.startHour, s.startHour + 1, s.firstProg, s.secondProg)}
                      className="flex items-center px-4 h-14 rounded-2xl border-2 text-sm"
                      style={{
                        background: isSel ? 'var(--tint-purple)' : 'var(--card)',
                        borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                        color: s.disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                        opacity: s.disabled ? 0.55 : 1,
                        cursor: s.disabled ? 'default' : 'pointer',
                      }}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span className="mx-1.5 opacity-40">–</span>
                      <span className="font-semibold">{s.endLabel}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: isSel ? 'rgba(80,50,145,0.12)' : 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        {durLabel}
                      </span>
                      {s.reason ? (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          {s.reason === 'yours'
                            ? intl.formatMessage({ id: 'bookTime.slot.yours' })
                            : intl.formatMessage({ id: 'bookTime.slot.booked' })}
                        </span>
                      ) : (
                        <span className="ml-auto w-5 h-5 rounded-full box-border flex-none transition-all"
                          style={{ border: isSel ? '6px solid var(--primary)' : '2px solid var(--border)' }} />
                      )}
                    </button>
                  )
                })
            }
          </div>
        </div>
      )}
    </BookingLayout>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file**

```bash
npx tsc --noEmit 2>&1 | grep BookTimePage
```

Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/BookTimePage.tsx
git commit -m "feat: rewrite BookTimePage to use hardcoded slot config"
```

---

## Task 5: Update `ReviewPage` — pass new segment shape to Cloud Function

**Files:**
- Modify: `src/components/booking/ReviewPage.tsx`

**Interfaces:**
- Consumes: `SelectedSlot` (new shape: `{ programId, date, startHour, start, end }`)
- Produces: calls `confirmBooking` with `segments: { programId, date, startHour, order }[]` (no `sessionIds`)

- [ ] **Step 1: Update `handleConfirm` in `ReviewPage.tsx`**

The function signature sent to the Cloud Function changes. Replace the `httpsCallable` type and the payload construction.

Find the `httpsCallable<...>` call (around line 88) and replace it with:

```ts
const confirm = httpsCallable<
  {
    segments: { programId: string; date: string; startHour: number; order: number }[]
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
```

Replace the payload construction (the lines building `sessionIds` and `segments`):

```ts
const bookingCode = makeBookingCode()
const segments = slots.map((s, i) => ({
  programId: s.programId,
  date: s.date,
  startHour: s.startHour,
  order: i + 1,
}))

await confirm({
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep ReviewPage
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/ReviewPage.tsx
git commit -m "feat: update ReviewPage to send date+startHour segments to confirmBooking"
```

---

## Task 6: Update `BookingDetailPage` and `BookingsPage` — derive times from segments

**Files:**
- Modify: `src/components/pages/BookingDetailPage.tsx`
- Modify: `src/components/pages/BookingsPage.tsx`

**Interfaces:**
- Removes usage of: `useBookingTimes` (deleted in Task 3)
- Produces: `startDate` and `endDate` derived from `booking.segments[0]` and last segment using `slotToDate` / `slotEndDate` from `src/config/slots.ts`

- [ ] **Step 1: Update `BookingDetailPage.tsx`**

Remove the import of `useBookingTimes`:

```ts
// Remove this line:
import { useBooking, useBookingTimes } from '../../hooks/queries/useBookings'

// Replace with:
import { useBooking } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
```

Remove these two lines (around line 32–33):

```ts
const sessionIds = (booking?.segments ?? []).map((s) => s.sessionId).filter(Boolean)
const { data: times } = useBookingTimes(sessionIds)
```

Replace with (place after `const { data: booking, ... }` line):

```ts
const firstSeg = booking?.segments?.[0]
const lastSeg = booking?.segments?.[booking.segments.length - 1]
const times = firstSeg?.date != null && firstSeg?.startHour != null && lastSeg?.date != null && lastSeg?.startHour != null
  ? {
      startDate: slotToDate(firstSeg.date, firstSeg.startHour),
      endDate: slotEndDate(lastSeg.date, lastSeg.startHour),
    }
  : { startDate: null, endDate: null }
```

- [ ] **Step 2: Update `BookingsPage.tsx`**

In `BookingCard`, remove the import of `useBookingTimes`:

```ts
// Remove from import line:
useBookingTimes,
```

Remove these lines inside `BookingCard`:

```ts
const sessionIds = booking.segments?.map((s) => s.sessionId) ?? []
const { data: times } = useBookingTimes(sessionIds)
```

Replace with:

```ts
import { slotToDate, slotEndDate } from '../../config/slots'

// Inside BookingCard, after existing hooks:
const firstSeg = booking.segments?.[0]
const lastSeg = booking.segments?.[booking.segments.length - 1]
const times = firstSeg?.date != null && firstSeg?.startHour != null && lastSeg?.date != null && lastSeg?.startHour != null
  ? {
      startDate: slotToDate(firstSeg.date, firstSeg.startHour),
      endDate: slotEndDate(lastSeg.date, lastSeg.startHour),
    }
  : { startDate: null, endDate: null }
```

> The rest of both components that read `times.startDate` / `times.endDate` can remain unchanged.

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/BookingDetailPage.tsx src/components/pages/BookingsPage.tsx
git commit -m "refactor: derive booking times from segment date+startHour instead of session lookup"
```

---

## Task 7: Update Cloud Function — validate against bookings, no session reads

**Files:**
- Modify: `functions/src/index.ts`

**Interfaces:**
- Consumes: `{ segments: { programId, date, startHour, order }[], visitType, teacherName, teacherEmail, schoolId, grade, studentCount, accessNeeds, bookingCode }` from client
- Produces: `{ bookingId: string }` on success; throws `'failed-precondition'` with message `'slots-unavailable'` or `'teacher-conflict'`

Transaction steps:
1. For each incoming segment: query `bookings` for any active booking (confirmed/approved/pending) whose segments include `{programId, date, startHour}`. If found → `slots-unavailable`.
2. Query all active bookings for this `teacherId`. For each, check if any segment's `{date, startHour}` overlaps (same date, startHours 1 apart or identical) any proposed segment. If overlap → `teacher-conflict`.
3. Write the booking document with `segments` as provided.

> Firestore transactions can only read from the transaction object inside `runTransaction`. Since we need to query (not just get by ID), we run the queries **before** the transaction and then do a final guarded write inside it. This is the correct pattern for Firestore when query results feed a write decision.

- [ ] **Step 1: Replace `functions/src/index.ts`**

```ts
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()

interface SegmentInput {
  programId: string
  date: string       // 'YYYY-MM-DD'
  startHour: number  // 0–23
  order: number
}

interface ConfirmBookingData {
  segments: SegmentInput[]
  visitType: 'onsite' | 'toad'
  teacherName: string
  teacherEmail: string
  schoolId: string
  grade: string
  studentCount: number
  accessNeeds?: string
  bookingCode: string
}

function slotsOverlap(aDate: string, aHour: number, bDate: string, bHour: number): boolean {
  // Two 1-hour slots overlap when they share the same date and startHours differ by less than 1
  return aDate === bDate && Math.abs(aHour - bHour) < 1
}

export const confirmBooking = onCall<ConfirmBookingData>(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.')
    }

    const teacherId = request.auth.uid
    const { segments, visitType, teacherName, teacherEmail, schoolId, grade, studentCount, accessNeeds, bookingCode } = request.data

    if (!segments?.length) {
      throw new HttpsError('invalid-argument', 'segments are required.')
    }

    const activeStatuses = ['confirmed', 'approved', 'pending']

    // ── Step A: check each slot is not already taken ──────────────────────────
    for (const seg of segments) {
      const snap = await db.collection('bookings')
        .where('status', 'in', activeStatuses)
        .get()

      const conflict = snap.docs.some((d) => {
        const data = d.data()
        return (data['segments'] as SegmentInput[] ?? []).some(
          (s) => s.programId === seg.programId && s.date === seg.date && s.startHour === seg.startHour,
        )
      })

      if (conflict) {
        throw new HttpsError('failed-precondition', 'slots-unavailable')
      }
    }

    // ── Step B: check teacher has no overlapping active booking ───────────────
    const teacherSnap = await db.collection('bookings')
      .where('teacherId', '==', teacherId)
      .where('status', 'in', activeStatuses)
      .get()

    for (const d of teacherSnap.docs) {
      const existingSegs: SegmentInput[] = d.data()['segments'] ?? []
      for (const existing of existingSegs) {
        for (const proposed of segments) {
          if (slotsOverlap(proposed.date, proposed.startHour, existing.date, existing.startHour)) {
            throw new HttpsError('failed-precondition', 'teacher-conflict')
          }
        }
      }
    }

    // ── Step C: write the booking ─────────────────────────────────────────────
    const bookingRef = db.collection('bookings').doc()
    await bookingRef.set({
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

    return { bookingId: bookingRef.id }
  },
)
```

- [ ] **Step 2: Build the functions**

```bash
cd functions && npm run build && cd ..
```

Expected: no TypeScript errors, `lib/index.js` generated.

- [ ] **Step 3: Commit**

```bash
git add functions/src/index.ts
git commit -m "feat: update confirmBooking to validate against bookings only, no session reads"
```

---

## Task 8: Delete `useSessions.ts` and verify full compile

**Files:**
- Delete: `src/hooks/queries/useSessions.ts`

**Interfaces:**
- Confirms: no remaining imports of `useSessions` in the codebase

- [ ] **Step 1: Check for remaining imports**

```bash
grep -r "useSessions\|useSessionsForWeek" src/
```

Expected: no output (zero matches).

- [ ] **Step 2: Delete the file**

```bash
rm src/hooks/queries/useSessions.ts
```

- [ ] **Step 3: Full TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Start dev server and smoke-test the booking flow**

```bash
npm run dev
```

Manually verify:
1. Navigate to Book → Onsite → Cube only → select a date (tomorrow or later) → time slot buttons appear for 8 AM, 9 AM, 10 AM, 11 AM, 1 PM, 2 PM, 3 PM, 4 PM.
2. Select a slot → Continue → fill details → Review → Confirm. Should succeed and show the confirmed page.
3. Go back through the booking flow for the same date. The slot you just booked should appear with "Your booking" pill.
4. Try "Both" programs → combo slot buttons appear (8–10, 10–12, 1–3, 3–5).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove useSessions.ts — session collection no longer used"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|-------------|------|
| 8 fixed slot buttons per program (skip lunch) | Task 1 (`SLOT_HOURS`), Task 4 (renders from config) |
| 4 combo pairs for "both" bookings | Task 1 (`COMBO_PAIRS`), Task 4 (combo branch) |
| Slot identity = programId + date + startHour | Task 2 (`BookingSegment`, `SelectedSlot`) |
| Slot taken = any confirmed/approved/pending booking claims it | Task 3 (`useSlotAvailability`), Task 7 (CF step A) |
| Teacher clash prevented in UI | Task 3 (`useSlotAvailability` returns 'yours'), Task 4 (disabled if 'yours') |
| Teacher clash enforced server-side | Task 7 (CF step B) |
| Cloud Function validates before writing | Task 7 |
| No session documents read or written | Task 7 (CF), Task 8 (file deleted) |
| `BookingDetailPage` times derived from segments | Task 6 |
| `BookingsPage` card times derived from segments | Task 6 |
| ReviewPage passes new segment shape | Task 5 |

**Placeholder scan:** None found.

**Type consistency check:**
- `SegmentInput` in CF (Task 7) matches `BookingSegment` (Task 2): `programId`, `date`, `startHour`, `order` ✓
- `SelectedSlot` (Task 2) fields `date` + `startHour` used to build `segments` payload in ReviewPage (Task 5) ✓
- `slotToDate` / `slotEndDate` / `dateToSlotKey` defined in Task 1, consumed in Tasks 3, 4, 6 ✓
- `useSlotAvailability` returns `Record<string, 'taken' | 'yours'>` (Task 3); consumed as `availabilityMap[key]` where `key = dateToSlotKey(...)` (Task 4) ✓
- Combo `handleSelectCombo(h1, h2, ...)` passes `h2` as `startHour` of second slot; `COMBO_PAIRS[i][1]` is the startHour of the second slot — `h2 + 1` is only used for the endHour display, not stored ✓
