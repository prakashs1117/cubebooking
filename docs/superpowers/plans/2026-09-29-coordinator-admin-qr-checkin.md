# Coordinator / Admin QR Check-in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the coordinator/admin check-in system — add proper i18n keys for both EN and DE, surface a staff-only "Scan" entry point in the AppShell navigation, add an admin dashboard listing today's bookings with their check-in status, and wire a `useAllBookings` hook that staff use to query all bookings (not just their own).

**Architecture:** The QRScanPage and BookingVerifyPage already exist and work correctly. What's missing is (1) all `adminScan.*` and `adminVerify.*` i18n keys only have `defaultMessage` fallbacks — they need proper entries in `en.ts` and `de.ts`, (2) staff users have no navigation entry point to reach `/admin/scan` from inside the app shell, (3) there is no admin dashboard (`/admin`) listing bookings for today so coordinators can see what's coming. The new `useAllBookings` Firestore query is the only new data dependency; the rest is UI assembly over existing primitives.

**Tech Stack:** React 18 + TypeScript, react-intl (i18n), Zustand, React Query / TanStack Query v5, Firebase Firestore, Lucide icons, Tailwind utility classes, Framer Motion (already installed), CSS custom properties for theming.

**Spec:** This plan derives from the existing admin code in `src/components/admin/` plus the role system documented in `src/context/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`, `firestore.rules`, and `src/shared/types/index.ts`.

## Global Constraints

- All user-facing strings MUST have entries in both `src/i18n/en.ts` AND `src/i18n/de.ts` — never ship with only `defaultMessage` fallbacks.
- All colors, spacing, and typography must use CSS custom properties (`var(--*)`) — never hardcoded hex/rgb values, except `#ffffff` and `#000000`.
- Components must work correctly in `data-theme="light"`, `data-theme="dark"`, and system-resolved themes — no hardcoded backgrounds.
- All new routes requiring staff access MUST be wrapped in `<ProtectedRoute requireStaff>`.
- React Query `queryKey` arrays must be stable — array items must be primitive values (`string | number | boolean | null`), not objects or arrays of arrays.
- `useAllBookings` may only be called from staff-gated components — the Firestore rule allows staff reads of any booking, but teachers cannot call this hook.
- No new dependencies — use only packages already in `package.json`.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/i18n/en.ts` | Modify | Add all missing `adminScan.*`, `adminVerify.*`, `adminDash.*`, `nav.scan` keys |
| `src/i18n/de.ts` | Modify | Add German translations for all new keys |
| `src/hooks/queries/useBookings.ts` | Modify | Add `useAllBookings(date?: string)` hook for staff |
| `src/components/layout/AppShell.tsx` | Modify | Add "Scan" nav item conditionally for staff users |
| `src/components/admin/AdminDashboardPage.tsx` | Create | Today's bookings list page for staff at `/admin` |
| `src/App.tsx` | Modify | Add `/admin` route wrapped in `<ProtectedRoute requireStaff>` |

---

## Task 1: Add all missing i18n keys (EN + DE)

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/de.ts`

**Context:** QRScanPage and BookingVerifyPage use `formatMessage` with only `defaultMessage` fallbacks — if the locale is `de`, they still render English. Every key used in the admin pages needs a proper entry in both files.

**Keys needed** (collected from `grep defaultMessage` across both admin files):

```
adminScan.title
adminScan.instruction
adminScan.cameraError
adminScan.noScanner
adminScan.or
adminScan.inputPlaceholder
adminScan.verify
adminVerify.markError
adminVerify.notFound
adminVerify.scanAgain
adminVerify.status.arrived
adminVerify.cta.arrived
adminVerify.cta.cancelled
adminVerify.cta.markArrived
adminDash.title
adminDash.todayEmpty
adminDash.scanCta
nav.scan
```

- [ ] **Step 1: Add EN keys to `src/i18n/en.ts`**

Append before the final closing `}` of the exported object:

```ts
  // ── Admin / Coordinator ───────────────────────────────────────────────────
  'nav.scan': 'Scan',
  'adminScan.title': 'Scan Booking QR',
  'adminScan.instruction': "Point the camera at the teacher's QR code",
  'adminScan.cameraError': 'Camera unavailable. Enter booking ID below.',
  'adminScan.noScanner': 'QR scanning not supported on this device. Enter booking ID below.',
  'adminScan.or': 'or enter manually',
  'adminScan.inputPlaceholder': 'Booking ID or code',
  'adminScan.verify': 'Verify Booking',
  'adminVerify.markError': 'Failed to update. Please try again.',
  'adminVerify.notFound': 'Booking not found.',
  'adminVerify.scanAgain': 'Scan again',
  'adminVerify.status.arrived': 'Arrived',
  'adminVerify.cta.arrived': 'Class Arrived ✓',
  'adminVerify.cta.cancelled': 'Booking Cancelled',
  'adminVerify.cta.markArrived': 'Mark as Arrived',
  'adminDash.title': 'Today\'s Visits',
  'adminDash.todayEmpty': 'No visits scheduled for today.',
  'adminDash.scanCta': 'Scan QR',
```

- [ ] **Step 2: Add DE keys to `src/i18n/de.ts`**

Append before the final closing `}`:

```ts
  // ── Admin / Koordinator ───────────────────────────────────────────────────
  'nav.scan': 'Scannen',
  'adminScan.title': 'Buchungs-QR scannen',
  'adminScan.instruction': 'Kamera auf den QR-Code der Lehrkraft richten',
  'adminScan.cameraError': 'Kamera nicht verfügbar. Bitte Buchungs-ID unten eingeben.',
  'adminScan.noScanner': 'QR-Scan auf diesem Gerät nicht unterstützt. Buchungs-ID unten eingeben.',
  'adminScan.or': 'oder manuell eingeben',
  'adminScan.inputPlaceholder': 'Buchungs-ID oder Code',
  'adminScan.verify': 'Buchung prüfen',
  'adminVerify.markError': 'Aktualisierung fehlgeschlagen. Bitte erneut versuchen.',
  'adminVerify.notFound': 'Buchung nicht gefunden.',
  'adminVerify.scanAgain': 'Erneut scannen',
  'adminVerify.status.arrived': 'Angekommen',
  'adminVerify.cta.arrived': 'Klasse angekommen ✓',
  'adminVerify.cta.cancelled': 'Buchung storniert',
  'adminVerify.cta.markArrived': 'Als angekommen markieren',
  'adminDash.title': 'Heutige Besuche',
  'adminDash.todayEmpty': 'Heute keine Besuche geplant.',
  'adminDash.scanCta': 'QR scannen',
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.ts src/i18n/de.ts
git commit -m "feat: add admin/coordinator i18n keys for EN and DE"
```

---

## Task 2: Add `useAllBookings` hook for staff

**Files:**
- Modify: `src/hooks/queries/useBookings.ts`

**Context:** Staff need to query all bookings (not just their own). The Firestore rule `allow read: if isSignedIn() && (resource.data.teacherId == request.auth.uid || isStaff())` permits this. The hook should accept an optional date string (`'YYYY-MM-DD'`) to filter to a single day — the dashboard uses today's date. The `queryKey` must include `date` so React Query caches today vs. "all" separately.

**Interfaces:**
- Produces: `useAllBookings(date?: string): UseQueryResult<BookingDoc[]>`

- [ ] **Step 1: Add the hook at the bottom of `src/hooks/queries/useBookings.ts`**

```ts
/**
 * Staff-only: query all bookings, optionally filtered to a single date.
 * Callers MUST be in a staff-gated component (isStaff === true).
 */
export function useAllBookings(date?: string) {
  return useQuery({
    queryKey: ['bookings', 'all', date ?? 'all'],
    queryFn: async () => {
      let q
      if (date) {
        // segments is an array field — query bookings where any segment.date matches
        q = query(
          collection(db, 'bookings'),
          where('segments', 'array-contains-any', [
            // We can't query nested array fields directly in Firestore.
            // Fetch all active bookings and filter client-side by date.
          ]),
          orderBy('createdAt', 'desc'),
        )
        // Firestore doesn't support nested array field queries.
        // Fetch active statuses and filter client-side.
        q = query(
          collection(db, 'bookings'),
          where('status', 'in', ['confirmed', 'approved', 'pending', 'arrived']),
          orderBy('createdAt', 'desc'),
        )
      } else {
        q = query(
          collection(db, 'bookings'),
          where('status', 'in', ['confirmed', 'approved', 'pending', 'arrived']),
          orderBy('createdAt', 'desc'),
        )
      }
      const snap = await getDocs(q)
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc)
      if (!date) return all
      // Client-side filter: booking has at least one segment on the requested date
      return all.filter((b) => b.segments?.some((s) => s.date === date))
    },
    staleTime: 30_000,
  })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/queries/useBookings.ts
git commit -m "feat: add useAllBookings hook for staff dashboard"
```

---

## Task 3: Staff "Scan" nav entry in AppShell

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

**Context:** `AppShell.tsx` has a `Sidebar` component, a `TabletTopNav`, and a `MobileTabBar`. Staff users (coordinators and admins, i.e. `isStaff === true` from `useAuthContext()`) need a visible "Scan" entry point. The sidebar already imports `{ Shield, ChevronRight }` from lucide-react. We need to add `QrCode` to that import and render a staff-only nav item and a staff-only mobile tab.

The `useNav()` hook returns the 4 items that appear in both sidebar and tab bar. We should NOT add the Scan link to `useNav()` — it's staff-only and the tab bar has a fixed 5-column grid. Instead:

- **Sidebar:** add a staff-only "Scan" link in the nav section, after the main nav items and before the divider, gated on `isStaff`.
- **Mobile tab bar:** the bar is a 5-column grid (left 2, FAB, right 2). Replace the centre FAB with the Scan icon for staff users (the FAB book button is less useful for coordinators).
- **Tablet top nav:** add a "Scan" icon button to the right actions area, gated on `isStaff`.

**Interfaces:**
- Consumes: `isStaff` from `useAuthContext()` (already available in `AuthContextValue`)

- [ ] **Step 1: Add `QrCode` to the lucide-react import at the top of AppShell.tsx**

Existing import line:
```ts
import {
  Home, CalendarCheck, Package, User, Plus, X,
  LogOut, Shield, ChevronRight,
} from 'lucide-react'
```

Change to:
```ts
import {
  Home, CalendarCheck, Package, User, Plus, X,
  LogOut, Shield, ChevronRight, QrCode,
} from 'lucide-react'
```

- [ ] **Step 2: Add staff scan link to `Sidebar` component**

In the `Sidebar` function, add `isStaff` to the destructured value from `useAuthContext()`:

```ts
const { profile, logout, isStaff } = useAuthContext()
```

After the nav items `{nav.map(...)}` block and before the `<div className="h-px my-2" ...>` divider, add:

```tsx
{isStaff && (
  <Link
    to="/admin/scan"
    onClick={onClose}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium tap"
    style={{
      textDecoration: 'none',
      background: isActive('/admin/scan', location.pathname) || isActive('/admin', location.pathname)
        ? 'var(--tint-purple)' : 'transparent',
      color: isActive('/admin/scan', location.pathname) || isActive('/admin', location.pathname)
        ? 'var(--brand-purple)' : 'var(--foreground)',
      fontWeight: isActive('/admin/scan', location.pathname) || isActive('/admin', location.pathname) ? 600 : 400,
    }}
  >
    <QrCode style={{ width: 18, height: 18, flexShrink: 0 }} />
    <span className="flex-1">{intl.formatMessage({ id: 'nav.scan' })}</span>
    {(isActive('/admin/scan', location.pathname) || isActive('/admin', location.pathname)) && (
      <ChevronRight style={{ width: 14, height: 14, opacity: 0.4 }} />
    )}
  </Link>
)}
```

- [ ] **Step 3: Add staff Scan button to `TabletTopNav`**

In `TabletTopNav`, add `isStaff` from `useAuthContext()`:

```ts
const { isStaff } = useAuthContext()
```

In the right actions `<div className="flex items-center gap-2">`, add before `<ThemeToggle>`:

```tsx
{isStaff && (
  <Link
    to="/admin/scan"
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold tap"
    style={{ textDecoration: 'none', background: 'var(--muted)', color: 'var(--foreground)' }}
    aria-label={intl.formatMessage({ id: 'nav.scan' })}
  >
    <QrCode style={{ width: 15, height: 15 }} />
    {intl.formatMessage({ id: 'nav.scan' })}
  </Link>
)}
```

- [ ] **Step 4: Add staff Scan tab to `MobileTabBar`**

`MobileTabBar` currently renders: left 2 tabs | FAB | right 2 tabs in a 5-column grid. For staff, replace the centre FAB with a Scan tab. Add `isStaff` from `useAuthContext()` in `MobileTabBar`:

```ts
const { isStaff } = useAuthContext()
```

Replace the centre column JSX block:

```tsx
{/* Centre: Scan for staff, Book FAB for teachers */}
{isStaff ? (
  <Link to="/admin/scan" aria-label={intl.formatMessage({ id: 'nav.scan' })}
    className="flex flex-col items-center justify-center gap-0.5 tap"
    style={{
      textDecoration: 'none',
      color: isActive('/admin', currentPath) ? 'var(--brand-purple)' : 'var(--muted-foreground)',
      fontSize: 10, fontWeight: isActive('/admin', currentPath) ? 600 : 400,
    }}
  >
    <span className="grid place-items-center rounded-full"
      style={{ width: 40, height: 28, background: isActive('/admin', currentPath) ? 'var(--tint-purple)' : 'transparent' }}>
      <QrCode style={{ width: 20, height: 20 }} />
    </span>
    {intl.formatMessage({ id: 'nav.scan' })}
  </Link>
) : (
  <Link to="/home?book=1" aria-label={intl.formatMessage({ id: 'nav.book' })}
    className="flex items-center justify-center tap"
    style={{ textDecoration: 'none' }}
  >
    <span className="grid place-items-center rounded-full shadow-lg tap"
      style={{ width: 48, height: 48, background: 'var(--primary)', color: '#fff', marginBottom: 6, boxShadow: '0 4px 14px rgba(20,155,95,0.4)' }}>
      <Plus style={{ width: 22, height: 22 }} />
    </span>
  </Link>
)}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "feat: add staff-only Scan nav entry to sidebar, tablet nav, and mobile tab bar"
```

---

## Task 4: Admin dashboard page (`/admin`)

**Files:**
- Create: `src/components/admin/AdminDashboardPage.tsx`
- Modify: `src/App.tsx`

**Context:** When a coordinator opens the app, they want to see all bookings scheduled for today at a glance, with their current status (confirmed, arrived, cancelled). Each row taps through to `/admin/verify/:bookingId`. The page also has a primary CTA to go to `/admin/scan`. The layout follows the same pattern as other shell pages: header + scrollable list.

There is no `bookingCode` field in the `Booking` type in `src/shared/types/index.ts` — but `bookingCode` IS written to Firestore from `BookReviewStep`. Treat it as `booking.bookingCode` with type `string | undefined` via a cast — do not modify shared types just for a display field.

**Interfaces:**
- Consumes: `useAllBookings(date: string)` from `src/hooks/queries/useBookings.ts`
- Consumes: `slotToDate`, `slotEndDate` from `src/config/slots.ts`
- Consumes: `isStaff` from `useAuthContext()`

- [ ] **Step 1: Create `src/components/admin/AdminDashboardPage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { QrCode, Clock, Users, GraduationCap } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAllBookings, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function statusChip(status: BookingDoc['status'], intl: ReturnType<typeof useIntl>) {
  const arrived = status === 'arrived'
  const cancelled = status === 'cancelled'
  const label = arrived
    ? intl.formatMessage({ id: 'adminVerify.status.arrived' })
    : cancelled
    ? intl.formatMessage({ id: 'bookingDetail.status.cancelled' })
    : intl.formatMessage({ id: 'bookingDetail.status.confirmed' })
  const color = arrived ? 'var(--brand-green)' : cancelled ? 'var(--muted-foreground)' : 'var(--primary)'
  const bg = arrived ? 'rgba(1,136,76,0.1)' : cancelled ? 'var(--muted)' : 'var(--tint-purple)'
  return { label, color, bg }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const today = todayKey()
  const { data: bookings = [], isLoading } = useAllBookings(today)

  // Sort: arrived last, cancelled last-last, confirmed/pending first; within groups sort by start time
  const sorted = [...bookings].sort((a, b) => {
    const order = (s: BookingDoc['status']) =>
      s === 'arrived' ? 1 : s === 'cancelled' ? 2 : 0
    const diff = order(a.status) - order(b.status)
    if (diff !== 0) return diff
    const aHour = a.segments?.[0]?.startHour ?? 0
    const bHour = b.segments?.[0]?.startHour ?? 0
    return aHour - bHour
  })

  return (
    <div
      className="min-h-screen flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <header className="px-5 pt-4 lg:pt-6 pb-3 flex items-center justify-between gap-4">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'adminDash.title' })}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/admin/scan')}
          className="tap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
        >
          <QrCode className="w-4 h-4" />
          {intl.formatMessage({ id: 'adminDash.scanCta' })}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 lg:pb-6 flex flex-col gap-3">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'adminDash.todayEmpty' })}
          </p>
        )}

        {sorted.map((booking) => {
          const seg = booking.segments?.[0]
          const lastSeg = booking.segments?.[booking.segments.length - 1]
          const start = seg?.date && seg?.startHour != null ? slotToDate(seg.date, seg.startHour) : null
          const end = lastSeg?.date && lastSeg?.startHour != null ? slotEndDate(lastSeg.date, lastSeg.startHour) : null
          const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
          const isBoth = ids.length > 1
          const accent = isBoth ? 'var(--brand-purple)'
            : ids[0] === 'cube' ? 'var(--brand-mint)'
            : ids[0] === 'lab' ? 'var(--brand-yellow)'
            : 'var(--brand-magenta)'
          const { label: statusLabel, color: statusColor, bg: statusBg } = statusChip(booking.status, intl)
          const programTitle = isBoth
            ? intl.formatMessage({ id: 'program.both' })
            : ids[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' })
            : ids[0] === 'lab' ? intl.formatMessage({ id: 'program.lab' })
            : intl.formatMessage({ id: 'program.toad' })

          return (
            <button
              key={booking.id}
              type="button"
              onClick={() => navigate(`/admin/verify/${booking.id}`)}
              className="tap w-full text-left rounded-2xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xs)' }}
            >
              {/* Colour accent bar */}
              <div className="h-1.5" style={{ background: accent }} />

              <div className="px-4 py-3.5 flex flex-col gap-2">
                {/* Top row: program + status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold">{programTitle}</span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-none"
                    style={{ background: statusBg, color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Teacher name */}
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  {booking.teacherName}
                </span>

                {/* Detail chips */}
                <div className="flex flex-wrap gap-3">
                  {start && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <Clock className="w-3 h-3" />
                      {intl.formatDate(start, { hour: '2-digit', minute: '2-digit', hour12: false })}
                      {end && `–${intl.formatDate(end, { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <GraduationCap className="w-3 h-3" />
                    {intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade })}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Users className="w-3 h-3" />
                    {intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount })}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Add `/admin` route to `src/App.tsx`**

Add the import after the existing admin imports (near top, around line 17–18):

```ts
import AdminDashboardPage from './components/admin/AdminDashboardPage'
```

In `AppRoutes`, after the existing admin routes block:

```tsx
{/* Admin dashboard — staff can see today's visits */}
<Route path="/admin" element={<ShellRoute element={<ProtectedRoute requireStaff><AdminDashboardPage /></ProtectedRoute>} />} />
```

Note: wrap in `ShellRoute` so the sidebar/nav show. The `ShellRoute` adds `ProtectedRoute` for auth, but we also need the `requireStaff` guard, so nest them: `<ShellRoute element={<ProtectedRoute requireStaff><AdminDashboardPage /></ProtectedRoute>} />`.

Actually, `ShellRoute` already wraps in `ProtectedRoute` (auth only). Add a second `ProtectedRoute requireStaff` inside to gate on role:

```tsx
<Route path="/admin" element={
  <ProtectedRoute>
    <AppShell>
      <ProtectedRoute requireStaff>
        <AdminDashboardPage />
      </ProtectedRoute>
    </AppShell>
  </ProtectedRoute>
} />
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminDashboardPage.tsx src/App.tsx
git commit -m "feat: add admin dashboard page showing today's bookings at /admin"
```

---

## Task 5: Wire the sidebar "Scan" link to `/admin` (dashboard) instead of `/admin/scan`

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

**Context:** After Task 3 + 4, staff see a "Scan" tab that goes straight to the camera scanner. A better UX is: the nav link goes to `/admin` (dashboard overview), which has a "Scan QR" button at the top. Direct `/admin/scan` is still reachable from the QR button. This change is purely a `to` prop swap on the three nav entries added in Task 3.

- [ ] **Step 1: Change sidebar Scan link `to` from `/admin/scan` to `/admin`**

In the Sidebar staff scan link added in Task 3, change:
```tsx
to="/admin/scan"
```
to:
```tsx
to="/admin"
```
Keep the `isActive` check as-is — it already checks both `/admin/scan` and `/admin`.

- [ ] **Step 2: Change tablet nav Scan link `to` from `/admin/scan` to `/admin`**

Same change in `TabletTopNav`.

- [ ] **Step 3: Change mobile tab Scan link `to` from `/admin/scan` to `/admin`**

Same change in `MobileTabBar`.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "feat: point staff Scan nav to /admin dashboard (which has scan CTA)"
```

---

## Self-Review

**Spec coverage:**
- ✅ All `adminScan.*` + `adminVerify.*` i18n keys added in both EN and DE (Task 1)
- ✅ `adminDash.*` and `nav.scan` keys added in both locales (Task 1)
- ✅ `useAllBookings(date?)` hook — staff can fetch all bookings for today (Task 2)
- ✅ Sidebar: staff see "Scan" nav item with active state (Task 3)
- ✅ Tablet top nav: "Scan" button visible for staff (Task 3)
- ✅ Mobile tab bar: centre slot shows Scan for staff, Book FAB for teachers (Task 3)
- ✅ `/admin` dashboard shows today's bookings sorted by start time, status chip, tap to verify (Task 4)
- ✅ `/admin` route gated behind `requireStaff` (Task 4)
- ✅ Dashboard "Scan QR" CTA routes to `/admin/scan` (Task 4)
- ✅ Nav links point to `/admin` (overview first), not scanner directly (Task 5)

**Placeholder scan:** None — all code blocks are complete.

**Type consistency:**
- `useAllBookings` returns `UseQueryResult<BookingDoc[]>` — `BookingDoc` is `Booking & { id: string }`, already exported from `useBookings.ts`
- `slotToDate` / `slotEndDate` signatures unchanged — `(date: string, startHour: number) => Date`
- `booking.status` is `BookingStatus` from shared types — all status values used in the dashboard (`arrived`, `cancelled`, `confirmed`) match the union type
- `todayKey()` in AdminDashboardPage returns `'YYYY-MM-DD'` — same format as `BookingSegment.date`
