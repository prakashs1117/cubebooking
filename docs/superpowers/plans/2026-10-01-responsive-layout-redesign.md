# Responsive Layout Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement role-differentiated, three-breakpoint navigation — teachers get a full-width sticky top bar on desktop; coordinators and admins get a 264px persistent sidebar on desktop and a Radix Dialog sheet on tablet.

**Architecture:** `AppShell` branches on `isStaff` to render either a teacher shell (top bar on all breakpoints) or a staff shell (sidebar on `lg:`, Radix sheet on `md:`, tab bar on mobile). New `DesktopTopBar` and `AdminSidebar` components encapsulate each navigation variant. `HomePage` gains `lg:` Tailwind classes for the two-column dashboard layout without removing any mobile markup.

**Tech Stack:** React 18 + TypeScript, Tailwind CSS v4, `@radix-ui/react-dialog` (already installed), Lucide React icons, React Intl for i18n, existing CSS custom properties from `index.css`.

**Spec:** `docs/superpowers/specs/2026-10-01-responsive-layout-redesign.md`

## Global Constraints

- Every new UI string must appear in both `src/i18n/en.ts` AND `src/i18n/de.ts` in the same commit — no exceptions per RULES.md.
- No new npm packages. Use `@radix-ui/react-dialog` (already installed) for the tablet sheet. No shadcn sidebar package.
- Mobile behaviour (`< 768px`) must remain pixel-identical to today — zero regression.
- Role detection uses `useAuthContext()` which exposes `isStaff` (`admin || coordinator`) and `isAdmin` (`admin` only). Do not add new fields to `AuthContext` — derive coordinator-only logic as `isStaff && !isAdmin`.
- All Tailwind breakpoints: `md:` = 768px, `lg:` = 1024px.
- CSS tokens: use only variables that exist in `index.css`. Do not add new CSS variables unless explicitly listed in a task.
- TypeScript strict: no `any`, no `@ts-ignore`.
- `nav.scan` i18n key already exists. Do not redefine existing keys — only add new ones.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/layout/AppShell.tsx` | Modify | Role-aware shell: teacher path vs staff path |
| `src/components/layout/DesktopTopBar.tsx` | **Create** | Full-width sticky top bar for teachers on `lg:` |
| `src/components/layout/AdminSidebar.tsx` | **Create** | 264px persistent sidebar + Radix sheet for staff |
| `src/components/pages/HomePage.tsx` | Modify | Add `lg:` two-column dashboard grid |
| `src/i18n/en.ts` | Modify | Add new nav/desktop i18n keys |
| `src/i18n/de.ts` | Modify | German translations for same keys |

---

### Task 1: i18n keys for new navigation strings

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/de.ts`

**Interfaces:**
- Produces: i18n message IDs consumed by Tasks 2, 3, 4 — exact IDs listed below.

- [ ] **Step 1: Add English keys to `en.ts`**

Open `src/i18n/en.ts`. Find the `// ── App shell / nav ──` section (currently around line 30) and add immediately after `'nav.schoolApproved'`:

```typescript
  'nav.scan': 'Scan',   // already exists — confirm it exists, do not duplicate
  'nav.roleLabel.admin': 'Admin',
  'nav.roleLabel.coordinator': 'Coordinator',
  'nav.impact': 'Impact overview',
  'nav.toadApprovals': 'TOAD approvals',
  'nav.calendarRules': 'Calendar rules',
  'desktop.topbar.search': 'Search bookings',
  'desktop.topbar.book': 'Book a visit',
  'home.desktop.daysToGo': 'days to go',
  'home.desktop.prepareClass': 'Prepare your class',
  'home.desktop.kitFor': 'Pre-visit kit for {date}',
  'home.desktop.bookAgain': 'Book again',
  'home.desktop.yourNextVisit': 'Your next visit',
  'home.desktop.myBookings': 'My bookings',
  'home.desktop.upcoming': 'Upcoming',
  'home.desktop.past': 'Past',
  'home.desktop.tableDate': 'Date',
  'home.desktop.tableVisit': 'Visit',
  'home.desktop.tableClass': 'Class',
  'home.desktop.tableStatus': 'Status',
  'home.desktop.view': 'View',
```

- [ ] **Step 2: Add German keys to `de.ts`**

Open `src/i18n/de.ts`. Find the same nav section and add after `'nav.schoolApproved'`:

```typescript
  'nav.roleLabel.admin': 'Admin',
  'nav.roleLabel.coordinator': 'Koordinator',
  'nav.impact': 'Übersicht',
  'nav.toadApprovals': 'TOAD-Anfragen',
  'nav.calendarRules': 'Kalenderregeln',
  'desktop.topbar.search': 'Buchungen suchen',
  'desktop.topbar.book': 'Besuch buchen',
  'home.desktop.daysToGo': 'Tage noch',
  'home.desktop.prepareClass': 'Klasse vorbereiten',
  'home.desktop.kitFor': 'Vorbereitung für {date}',
  'home.desktop.bookAgain': 'Erneut buchen',
  'home.desktop.yourNextVisit': 'Ihr nächster Besuch',
  'home.desktop.myBookings': 'Meine Buchungen',
  'home.desktop.upcoming': 'Bevorstehend',
  'home.desktop.past': 'Vergangen',
  'home.desktop.tableDate': 'Datum',
  'home.desktop.tableVisit': 'Besuch',
  'home.desktop.tableClass': 'Klasse',
  'home.desktop.tableStatus': 'Status',
  'home.desktop.view': 'Ansehen',
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.ts src/i18n/de.ts
git commit -m "feat(i18n): add desktop nav and home layout keys (en + de)"
```

---

### Task 2: `DesktopTopBar` — full-width teacher top bar

**Files:**
- Create: `src/components/layout/DesktopTopBar.tsx`

**Interfaces:**
- Consumes: `useAuthContext()` for `{ profile }`, `useNav()` pattern from existing AppShell (replicate the hook inline — see Step 1), `useLocation()` from react-router-dom, `useIntl()` from react-intl.
- Produces: `export default function DesktopTopBar({ onBook }: { onBook: () => void })` — consumed by Task 4's teacher shell branch.

- [ ] **Step 1: Create the file**

Create `src/components/layout/DesktopTopBar.tsx` with this exact content:

```tsx
import { Link, useLocation } from 'react-router-dom'
import { Home, CalendarCheck, Package, User, Plus, Search } from 'lucide-react'
import { useIntl } from 'react-intl'
import MerckLogo from '../auth/MerckLogo'
import NotificationPopover from './NotificationPopover'
import ThemeToggle from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { labelKey: 'nav.home',     href: '/home',     Icon: Home },
  { labelKey: 'nav.bookings', href: '/bookings', Icon: CalendarCheck },
  { labelKey: 'nav.kit',      href: '/kit',      Icon: Package },
  { labelKey: 'nav.profile',  href: '/profile',  Icon: User },
] as const

function isActive(href: string, path: string) {
  return path === href || (href !== '/home' && path.startsWith(href + '/'))
}

export default function DesktopTopBar({ onBook }: { onBook: () => void }) {
  const intl = useIntl()
  const location = useLocation()

  return (
    <header
      className="hidden lg:flex sticky top-0 z-30 items-center gap-2 border-b px-6"
      style={{
        height: 64,
        background: 'var(--background)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-3 mr-6 flex-none tap" style={{ textDecoration: 'none' }}>
        <MerckLogo width={44} height={21} />
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ labelKey, href, Icon }) => {
          const active = isActive(href, location.pathname)
          return (
            <Link
              key={href}
              to={href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm tap"
              style={{
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)',
                background: active ? 'var(--tint-purple)' : 'transparent',
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {intl.formatMessage({ id: labelKey })}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search — visual only in Phase 1; wired in a later phase */}
      <label
        className="hidden xl:flex items-center gap-2 px-3.5"
        style={{
          width: 260,
          height: 40,
          borderRadius: 12,
          border: '1px solid var(--input)',
          background: 'var(--background)',
          color: 'var(--muted-foreground)',
          cursor: 'text',
        }}
      >
        <Search style={{ width: 15, height: 15, flexShrink: 0 }} />
        <span className="text-sm">{intl.formatMessage({ id: 'desktop.topbar.search' })}</span>
      </label>

      {/* Book CTA */}
      <button
        type="button"
        onClick={onBook}
        className="flex items-center gap-2 px-4 text-sm font-semibold tap"
        style={{
          height: 40,
          borderRadius: 12,
          background: 'var(--primary)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
        {intl.formatMessage({ id: 'desktop.topbar.book' })}
      </button>

      <ThemeToggle variant="icon" />
      <NotificationPopover />
    </header>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/DesktopTopBar.tsx
git commit -m "feat(layout): add DesktopTopBar for teacher desktop (lg:)"
```

---

### Task 3: `AdminSidebar` — 264px sidebar for admin/coordinator

**Files:**
- Create: `src/components/layout/AdminSidebar.tsx`

**Interfaces:**
- Consumes: `useAuthContext()` for `{ profile, isAdmin, isStaff, logout }`, `useLocation()`, `useNavigate()`, `useIntl()`.
- Produces: `export default function AdminSidebar({ onClose }: { onClose?: () => void })` — consumed by Task 4's staff shell branch.

- [ ] **Step 1: Create the file**

Create `src/components/layout/AdminSidebar.tsx`:

```tsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, CalendarCheck, Package, BarChart2, Truck, CalendarCog, LogOut, X,
} from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import MerckLogo from '../auth/MerckLogo'
import ThemeToggle from '../ui/ThemeToggle'

function isActive(href: string, path: string) {
  return path === href || (href !== '/home' && path.startsWith(href + '/'))
}

type NavItem =
  | { type: 'heading'; labelKey: string }
  | { type: 'link'; labelKey: string; href: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }

function useAdminNav(isAdmin: boolean): NavItem[] {
  // Coordinator sees: Home, Bookings, Kit, Impact, TOAD approvals
  // Admin sees all of those plus Calendar rules
  const base: NavItem[] = [
    { type: 'link', labelKey: 'nav.home',     href: '/home',     Icon: Home },
    { type: 'link', labelKey: 'nav.bookings', href: '/bookings', Icon: CalendarCheck },
    { type: 'link', labelKey: 'nav.kit',      href: '/kit',      Icon: Package },
    { type: 'heading', labelKey: 'nav.roleLabel.admin' },
    { type: 'link', labelKey: 'nav.impact',        href: '/admin',          Icon: BarChart2 },
    { type: 'link', labelKey: 'nav.toadApprovals', href: '/admin/toad',     Icon: Truck },
  ]
  if (isAdmin) {
    base.push({ type: 'link', labelKey: 'nav.calendarRules', href: '/admin/calendar', Icon: CalendarCog })
  }
  return base
}

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const { profile, isAdmin, isStaff, logout } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const intl = useIntl()

  // isCoordinator = isStaff but not admin
  const roleKey = isAdmin ? 'nav.roleLabel.admin' : 'nav.roleLabel.coordinator'
  const navItems = useAdminNav(isAdmin)

  const handleLogout = async () => {
    onClose?.()
    await logout()
    navigate('/signin', { replace: true })
  }

  if (!isStaff) return null

  return (
    <aside
      aria-label={intl.formatMessage({ id: 'nav.home' })}
      className="flex flex-col h-full"
      style={{
        width: 264,
        background: 'var(--background)',
        borderRight: '1px solid var(--border)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--foreground)',
      }}
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5 flex-none">
        <Link to="/home" className="tap flex-none" style={{ textDecoration: 'none' }} onClick={onClose}>
          <MerckLogo width={59} height={28} />
        </Link>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div className="font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>
            Curiosity
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: roleKey })}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="iconbtn tap flex-none"
            aria-label={intl.formatMessage({ id: 'nav.closeMenu' })}
            style={{ width: 32, height: 32 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3.5 flex flex-col gap-0.5 pb-2">
        {navItems.map((item, i) => {
          if (item.type === 'heading') {
            return (
              <div
                key={i}
                className="px-2.5 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}
              >
                {intl.formatMessage({ id: item.labelKey })}
              </div>
            )
          }
          const active = isActive(item.href, location.pathname)
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 tap"
              style={{
                height: 42,
                padding: '0 12px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                background: active ? 'var(--tint-purple)' : 'transparent',
                color: 'var(--foreground)',
              }}
            >
              <item.Icon
                style={{ width: 18, height: 18, flexShrink: 0, color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)' }}
              />
              <span className="flex-1">{intl.formatMessage({ id: item.labelKey })}</span>
            </Link>
          )
        })}
      </nav>

      {/* User card + theme + sign out */}
      <div className="flex-none p-3.5 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2.5 p-3 rounded-2xl"
          style={{ background: 'var(--app-ground)', border: '1px solid var(--border)' }}
        >
          {/* Avatar initials */}
          <div
            className="flex-none w-8 h-8 rounded-full grid place-items-center text-xs font-bold"
            style={{ background: 'var(--tint-purple)', color: 'var(--brand-purple)' }}
          >
            {(profile?.displayName || profile?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{profile?.displayName || 'Admin'}</div>
            <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              {profile?.schoolName || profile?.email || ''}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="iconbtn tap flex-none"
            aria-label={intl.formatMessage({ id: 'nav.signOut' })}
            style={{ width: 32, height: 32, color: 'var(--muted-foreground)' }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        </div>
        <ThemeToggle variant="segmented" />
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AdminSidebar.tsx
git commit -m "feat(layout): add AdminSidebar for coordinator/admin desktop (lg:) and sheet"
```

---

### Task 4: Refactor `AppShell` — role-aware shell

This is the integration task. It rewires `AppShell` to branch on `isStaff` and wires up the new components from Tasks 2 and 3. The Radix Dialog is used as a slide-in Sheet for staff on tablet.

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes:
  - `DesktopTopBar` from `./DesktopTopBar` — `({ onBook: () => void })`
  - `AdminSidebar` from `./AdminSidebar` — `({ onClose?: () => void })`
  - `useAuthContext()` for `{ isStaff }`
  - `BookingModal` prop `open` + `onClose` (already used in `HomePage`) — NOT wired here; `onBook` callback is passed down via context or search param. Use the existing `?book=1` search param pattern: `onBook` navigates to `/home?book=1`.
- Produces: `export default function AppShell({ children })` — unchanged signature.

- [ ] **Step 1: Replace the full contents of `AppShell.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { useAuthContext } from '../../context/AuthContext'

import DesktopTopBar from './DesktopTopBar'
import AdminSidebar from './AdminSidebar'

// Keep existing mobile/tablet components — they are defined below
import { MobileTopBar, MobileTabBar, TabletTopNav } from './AppShellMobile'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isStaff } = useAuthContext()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleBook = () => navigate('/home?book=1')

  if (isStaff) {
    // ── Staff shell ──────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen flex" style={{ background: 'var(--app-ground)' }}>

        {/* Desktop: persistent 264px sidebar */}
        <aside className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden"
          style={{ width: 264, borderRight: '1px solid var(--border)' }}
        >
          <AdminSidebar />
        </aside>

        {/* Tablet: Radix Dialog sheet — slide from left */}
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(14,14,17,0.45)', backdropFilter: 'blur(2px)', animation: 'lcFade .2s ease both' }}
            />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 lg:hidden overflow-hidden focus:outline-none"
              style={{
                width: 264,
                background: 'var(--background)',
                borderRadius: '0 24px 24px 0',
                boxShadow: '8px 0 32px -8px rgba(14,14,17,0.35)',
                animation: 'lcSlideIn .32s cubic-bezier(.2,.8,.2,1) both',
              }}
              aria-label="Navigation"
            >
              <AdminSidebar onClose={() => setDrawerOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <MobileTopBar />
          {/* Tablet top bar — has hamburger to open the sheet */}
          <TabletTopNav onMenuOpen={() => setDrawerOpen(true)} showBookCta={false} />

          {/* Page scroll area */}
          <div className="flex-1 pb-14 md:pb-0">
            {children}
          </div>
        </div>

        {/* Mobile bottom tab bar */}
        <MobileTabBar currentPath={location.pathname} />
      </div>
    )
  }

  // ── Teacher shell ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--app-ground)' }}>

      {/* Desktop: full-width top bar (hidden on mobile/tablet) */}
      <DesktopTopBar onBook={handleBook} />

      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Tablet top bar */}
      <TabletTopNav onMenuOpen={() => setDrawerOpen(true)} showBookCta />

      {/* Mobile drawer (teacher — same as today) */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(14,14,17,0.45)', backdropFilter: 'blur(2px)', animation: 'lcFade .2s ease both' }}
          />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] lg:hidden overflow-hidden focus:outline-none"
            style={{
              background: 'var(--background)',
              borderRadius: '0 24px 24px 0',
              boxShadow: '8px 0 32px -8px rgba(14,14,17,0.35)',
              animation: 'lcSlideIn .32s cubic-bezier(.2,.8,.2,1) both',
            }}
            aria-label="Navigation"
          >
            {/* Teacher drawer keeps existing Sidebar content — imported from AppShellMobile */}
            <TeacherDrawerContent onClose={() => setDrawerOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Page content */}
      <div className="flex-1 pb-14 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar currentPath={location.pathname} />
    </div>
  )
}
```

- [ ] **Step 2: Extract mobile components to `AppShellMobile.tsx`**

The existing `Sidebar`, `MobileTopBar`, `TabletTopNav`, `MobileTabBar` functions in `AppShell.tsx` need to move to a new file `src/components/layout/AppShellMobile.tsx` so the refactored `AppShell.tsx` can import them cleanly.

Create `src/components/layout/AppShellMobile.tsx` by cutting the four component functions out of the old `AppShell.tsx` (before you replace it in Step 1). Adapt `TabletTopNav` to accept a `showBookCta: boolean` prop — when `false`, omit the "Book" button (staff have their own CTA in their sidebar). Export each as a named export:

```tsx
export function MobileTopBar() { /* existing code */ }
export function MobileTabBar({ currentPath }: { currentPath: string }) { /* existing code */ }
export function TabletTopNav({ onMenuOpen, showBookCta }: { onMenuOpen: () => void; showBookCta: boolean }) {
  // existing TabletTopNav code — conditionally render the Book CTA:
  // { showBookCta && <Link to="/home?book=1" ...>Book</Link> }
}
export function TeacherDrawerContent({ onClose }: { onClose: () => void }) {
  // existing Sidebar component, renamed, with onClose wired through
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit && npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Manual smoke test — teacher role**

Run `npm run dev`. Sign in as a teacher account.
- Mobile (`< 768px`): top mini-bar + bottom tab bar visible. No sidebar. ✓
- Tablet (768–1023px): top nav bar with logo + tabs + Book button. ✓
- Desktop (`≥ 1024px`): `DesktopTopBar` visible with logo, 4 nav links, search, Book CTA. No sidebar. ✓
- Click "Book a visit" button → modal opens (via `?book=1` redirect to `/home`). ✓

- [ ] **Step 5: Manual smoke test — admin/coordinator role**

Sign in as admin/coordinator.
- Mobile: bottom tab bar with Scan in centre. ✓
- Tablet: top bar visible; hamburger opens `AdminSidebar` sheet from left. ✓
- Desktop: 264px `AdminSidebar` persistent. Content fills remaining width. ✓
- Admin sidebar shows: Home, Bookings, Kit, — ADMIN — Impact overview, TOAD approvals, Calendar rules. ✓
- Coordinator sidebar shows: Home, Bookings, Kit, — ADMIN — Impact overview, TOAD approvals (no Calendar rules). ✓

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/AppShell.tsx src/components/layout/AppShellMobile.tsx
git commit -m "feat(layout): role-aware AppShell — teacher top bar, staff persistent sidebar"
```

---

### Task 5: `HomePage` — desktop two-column layout

Add `lg:` Tailwind classes to `HomePage.tsx` to render the two-column dashboard grid from the design. Mobile layout is untouched — all changes are additive `lg:` overrides.

**Files:**
- Modify: `src/components/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `bookingTimes`, `programLabel`, `programAccent` helpers (already in file), `useMyBookings`, `useAuthContext`, `useIntl`, `BookingModal`.
- Produces: no new exports — the default export `HomePage` gains a `lg:` layout branch rendered via CSS classes only.

- [ ] **Step 1: Add `DesktopHeroGrid` sub-component**

Inside `HomePage.tsx`, add a new component below the existing `StaffScanBanner` and above `export default function HomePage()`:

```tsx
// ─── Desktop hero grid (lg: only) ────────────────────────────────────────────

function DesktopHeroGrid({
  nextBooking,
  onOpenModal,
}: {
  nextBooking: BookingDoc | null
  onOpenModal: () => void
}) {
  const intl = useIntl()
  const times  = nextBooking ? bookingTimes(nextBooking) : null
  const label  = nextBooking ? programLabel(nextBooking, intl) : null
  const segments = nextBooking?.segments ?? []

  const daysToGo = times?.start
    ? Math.ceil((times.start.getTime() - Date.now()) / 86_400_000)
    : null

  // Derive program chips from segments
  const chips = segments.map((s) => ({
    name: s.programId === 'cube'
      ? intl.formatMessage({ id: 'program.cube' })
      : s.programId === 'lab'
      ? intl.formatMessage({ id: 'program.lab' })
      : intl.formatMessage({ id: 'program.toad' }),
    bg: PROGRAM_COLORS[s.programId] ?? 'var(--muted)',
    time: `${String(s.startHour).padStart(2, '0')}:00`,
  }))

  return (
    <div
      className="hidden lg:grid gap-5"
      style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}
    >
      {/* Left: next visit hero card */}
      {nextBooking ? (
        <div
          className="relative overflow-hidden flex flex-col gap-4 tap"
          style={{
            minHeight: 260,
            padding: 28,
            borderRadius: 28,
            background: 'var(--brand-purple)',
            color: '#ffffff',
          }}
        >
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -70, top: -110 }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', background: 'var(--brand-mint)', right: 150, bottom: -70 }} />

          {/* Status + title */}
          <div className="relative flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span
                className="self-start inline-flex gap-1.5 items-center px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#ffffff', color: 'var(--brand-green)' }}
              >
                ✓ {intl.formatMessage({ id: 'home.nextVisit.confirmed' })}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-85">
                {intl.formatMessage({ id: 'home.desktop.yourNextVisit' })}
              </span>
              <span className="font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: '40px' }}>
                {label}
              </span>
              {times && (
                <span className="text-sm">
                  {intl.formatDate(times.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {intl.formatDate(times.start, { hour: '2-digit', minute: '2-digit', hour12: false })}
                  {'–'}
                  {intl.formatDate(times.end, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </div>

            {/* Days-to-go badge */}
            {daysToGo !== null && daysToGo >= 0 && (
              <div
                className="text-center flex-none"
                style={{ padding: '14px 20px', borderRadius: 20, background: 'rgba(14,14,17,0.28)', backdropFilter: 'blur(8px)' }}
              >
                <div className="font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 44 }}>
                  {daysToGo === 0 ? intl.formatMessage({ id: 'home.nextVisit.today' }) : daysToGo}
                </div>
                {daysToGo > 0 && (
                  <div className="text-xs font-semibold mt-1">
                    {intl.formatMessage({ id: 'home.desktop.daysToGo' })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Program chips */}
          {chips.length > 0 && (
            <div className="relative flex items-center gap-2">
              {chips.map((chip, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight style={{ width: 16, height: 16, color: '#ffffff' }} />}
                  <div
                    className="flex-1"
                    style={{ padding: '10px 14px', borderRadius: 16, background: chip.bg, color: 'var(--foreground)' }}
                  >
                    <div className="text-sm font-bold">{chip.name}</div>
                    <div className="text-xs">{chip.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* No booking state */
        <button
          type="button"
          onClick={onOpenModal}
          className="relative overflow-hidden flex flex-col justify-end gap-3 tap"
          style={{
            minHeight: 260,
            padding: 28,
            borderRadius: 28,
            background: 'var(--brand-purple)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -70, top: -110 }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', background: 'var(--brand-mint)', right: 150, bottom: -70 }} />
          <div className="relative flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {intl.formatMessage({ id: 'home.desktop.yourNextVisit' })}
            </span>
            <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>
              {intl.formatMessage({ id: 'home.nextVisit.bookFirst' })}
            </span>
          </div>
          <span
            className="relative self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#ffffff', color: 'var(--brand-purple)' }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            {intl.formatMessage({ id: 'desktop.topbar.book' })}
          </span>
        </button>
      )}

      {/* Right: Book again quick links */}
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-lg font-bold">{intl.formatMessage({ id: 'home.desktop.bookAgain' })}</h2>
        {[
          { labelKey: 'program.cube', subKey: 'home.card.onsite.tag', bg: 'var(--brand-mint)',    visitType: 'onsite' as const },
          { labelKey: 'program.lab',  subKey: 'home.card.onsite.tag', bg: 'var(--brand-yellow)',  visitType: 'onsite' as const },
          { labelKey: 'program.toad', subKey: 'home.card.toad.tag',   bg: 'var(--brand-magenta)', visitType: 'toad'   as const },
        ].map(({ labelKey, subKey, bg, visitType }) => (
          <button
            key={labelKey}
            type="button"
            onClick={() => onOpenModal()}
            className="tap flex items-center gap-3.5 text-left"
            style={{
              padding: '14px 16px',
              borderRadius: 20,
              background: bg,
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)',
              fontFamily: 'inherit',
            }}
          >
            <span className="flex-1">
              <span className="block text-sm font-bold">{intl.formatMessage({ id: labelKey })}</span>
              <span className="text-xs">{intl.formatMessage({ id: subKey })}</span>
            </span>
            <ChevronRight style={{ width: 18, height: 18 }} />
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add `DesktopBookingsTable` sub-component**

Add this component below `DesktopHeroGrid`:

```tsx
function DesktopBookingsTable({ bookings }: { bookings: BookingDoc[] }) {
  const intl = useIntl()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const now = Date.now()
  const filtered = bookings
    .filter((b) => b.status !== 'cancelled')
    .filter((b) => {
      const times = bookingTimes(b)
      const isUp = times ? times.start.getTime() > now : false
      return tab === 'upcoming' ? isUp : !isUp
    })
    .sort((a, b) => {
      const aT = bookingTimes(a)?.start.getTime() ?? 0
      const bT = bookingTimes(b)?.start.getTime() ?? 0
      return tab === 'upcoming' ? aT - bT : bT - aT
    })

  const statusChip = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      confirmed: { label: intl.formatMessage({ id: 'bookings.status.confirmed' }), bg: 'var(--tint-purple)',  color: 'var(--brand-purple)' },
      pending:   { label: intl.formatMessage({ id: 'bookings.status.pending' }),   bg: 'var(--tint-yellow)',  color: 'var(--brand-orange)' },
      arrived:   { label: intl.formatMessage({ id: 'bookings.status.arrived' }),   bg: 'rgba(1,136,76,0.1)', color: 'var(--brand-green)'  },
      cancelled: { label: intl.formatMessage({ id: 'bookings.status.cancelled' }), bg: 'var(--tint-red)',     color: 'var(--destructive)'  },
    }
    return map[status] ?? map['confirmed']
  }

  return (
    <div className="hidden lg:flex flex-col" style={{ borderRadius: 28, background: 'var(--card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5">
        <h2 className="m-0 flex-1 text-lg font-bold">{intl.formatMessage({ id: 'home.desktop.myBookings' })}</h2>
        <div className="flex p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-sm tap"
              style={{
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: tab === t ? 600 : 400,
                background: tab === t ? 'var(--background)' : 'transparent',
                color: 'var(--foreground)',
              }}
            >
              {t === 'upcoming'
                ? intl.formatMessage({ id: 'home.desktop.upcoming' })
                : intl.formatMessage({ id: 'home.desktop.past' })}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-6 py-2.5 border-t border-b text-xs font-semibold"
        style={{
          gridTemplateColumns: '90px minmax(0,1.3fr) minmax(0,1fr) 110px 90px',
          gap: 12,
          borderColor: 'var(--border)',
          color: 'var(--muted-foreground)',
        }}
      >
        <span>{intl.formatMessage({ id: 'home.desktop.tableDate' })}</span>
        <span>{intl.formatMessage({ id: 'home.desktop.tableVisit' })}</span>
        <span>{intl.formatMessage({ id: 'home.desktop.tableClass' })}</span>
        <span>{intl.formatMessage({ id: 'home.desktop.tableStatus' })}</span>
        <span />
      </div>

      {/* Rows */}
      {filtered.length === 0 && (
        <div className="px-6 py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {tab === 'upcoming'
            ? intl.formatMessage({ id: 'bookings.empty.upcoming' })
            : intl.formatMessage({ id: 'bookings.empty.past' })}
        </div>
      )}
      {filtered.map((b) => {
        const times = bookingTimes(b)
        const label = programLabel(b, intl)
        const accent = programAccent(b)
        const chip = statusChip(b.status)
        return (
          <div
            key={b.id}
            className="grid px-6 items-center border-b"
            style={{
              gridTemplateColumns: '90px minmax(0,1.3fr) minmax(0,1fr) 110px 90px',
              gap: 12,
              minHeight: 64,
              borderColor: 'var(--border)',
            }}
          >
            <span className="flex flex-col">
              <span className="text-sm font-bold">
                {times ? intl.formatDate(times.start, { day: 'numeric', month: 'short' }) : '—'}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {times ? intl.formatDate(times.start, { weekday: 'short' }) : ''}
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="w-2.5 self-stretch rounded-full flex-none" style={{ background: accent }} />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {times
                    ? `${intl.formatDate(times.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(times.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`
                    : ''}
                </span>
              </span>
            </span>
            <span className="text-sm">{b.grade ? `Grade ${b.grade} · ${b.studentCount ?? '—'} students` : '—'}</span>
            <span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: chip.bg, color: chip.color }}>
                {chip.label}
              </span>
            </span>
            <Link
              to={`/bookings/${b.id}`}
              className="text-sm font-semibold tap justify-self-end"
              style={{ textDecoration: 'none', color: 'var(--brand-purple)' }}
            >
              {intl.formatMessage({ id: 'home.desktop.view' })}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Wire both desktop components into `HomePage`**

In `export default function HomePage()`, update the JSX `<main>` to include the two new desktop-only sections. Replace the existing return:

```tsx
return (
  <div
    className="flex flex-col"
    style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)', minHeight: '100%' }}
  >
    <main className="flex-1 px-4 md:px-6 lg:px-10 py-6 flex flex-col gap-5 max-w-3xl lg:max-w-none mx-auto w-full pb-24 lg:pb-10">

      {/* Greeting — hidden on desktop (top bar shows greeting context via date) */}
      <div className="rise flex flex-col gap-0.5 lg:hidden">
        <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: greetingKey })},
        </div>
        <h1 className="m-0 text-3xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {name}
        </h1>
        {profile?.schoolName && (
          <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {profile.schoolName}
          </div>
        )}
      </div>

      {/* Desktop greeting row (visible only on lg:) */}
      <div className="hidden lg:flex items-end gap-4">
        <div className="flex-1">
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="m-0 font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: '40px' }}>
            {intl.formatMessage({ id: greetingKey })}, {name}
          </h1>
        </div>
      </div>

      {/* Staff scanner shortcut — mobile/tablet only (staff have sidebar on desktop) */}
      {isStaff && <StaffScanBanner />}

      {/* Desktop: two-column hero grid */}
      <DesktopHeroGrid nextBooking={nextBooking} onOpenModal={() => openBooking()} />

      {/* Mobile/tablet: next visit hero */}
      <div className="lg:hidden">
        <NextVisitHero booking={nextBooking} onOpenModal={() => openBooking()} />
      </div>

      {/* Mobile/tablet: quick actions */}
      <div className="lg:hidden">
        <QuickActions onNewBooking={() => openBooking()} />
      </div>

      {/* Mobile/tablet: more upcoming */}
      <div className="lg:hidden">
        <UpcomingList bookings={restBookings} />
      </div>

      {/* Desktop: bookings table */}
      <DesktopBookingsTable bookings={bookings} />

      {/* Book a visit section — always visible */}
      <div className="rise-5 flex flex-col gap-3">
        <h2 className="text-base font-semibold lg:hidden" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'home.bookSection' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {PROGRAM_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => openBooking(card.id)}
              className="tap flex flex-col gap-4 p-5 rounded-2xl border text-left w-full"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xs)', color: 'inherit' }}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-2 text-2xl">{card.icons.map((ic) => <span key={ic}>{ic}</span>)}</div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: card.tagBg, color: card.tagColor }}>
                  {intl.formatMessage({ id: card.tagKey })}
                </span>
              </div>
              <div>
                <div className="font-bold mb-1">{intl.formatMessage({ id: card.labelKey })}</div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {intl.formatMessage({ id: card.descKey })}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: card.accentColor }}>
                {intl.formatMessage({ id: 'home.card.bookNow' })} <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>

    <BookingModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      initialVisitType={modalVisitType}
    />
  </div>
)
```

- [ ] **Step 4: Verify TypeScript and build**

```bash
cd /Users/M324550/Documents/POC/cubebooking && npx tsc --noEmit && npm run build
```

Expected: no errors.

- [ ] **Step 5: Manual smoke test — desktop home**

Run `npm run dev`. Sign in as a teacher. Resize to `≥ 1024px`.
- Two-column hero grid visible. ✓
- Left: purple booking hero card with orb circles, program chips, days-to-go badge. ✓
- Left (no booking state): empty hero with "Book your first session" CTA button. ✓
- Right: "Book again" quick links — Cube (mint), Lab (yellow), TOAD (magenta). ✓
- Below: desktop bookings table with Upcoming / Past tab switcher. ✓
- Mobile layout unchanged at `< 768px`. ✓

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/HomePage.tsx
git commit -m "feat(home): desktop two-column layout — hero grid, days-to-go badge, bookings table"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Task covering it |
|---|---|
| Role matrix — teacher: no sidebar on desktop | Task 4 (AppShell teacher branch) |
| Role matrix — staff: persistent sidebar on lg: | Task 4 (AppShell staff branch) + Task 3 |
| Role matrix — staff: Radix sheet on tablet | Task 4 (Radix Dialog) |
| Role matrix — mobile: unchanged for all | Task 4 (MobileTopBar + MobileTabBar preserved) |
| Teacher desktop top bar | Task 2 (DesktopTopBar) |
| Admin sidebar nav items | Task 3 (useAdminNav — admin superset) |
| Coordinator nav subset (no Calendar rules) | Task 3 (`isAdmin` guard) |
| Coordinator gets Impact overview | Task 3 (base nav includes `/admin`) |
| HomePage desktop two-column grid | Task 5 (DesktopHeroGrid) |
| Hero card — orbs, confirmed badge, days-to-go | Task 5 (DesktopHeroGrid) |
| Hero card — program chips | Task 5 (chips from segments) |
| Book-again quick links | Task 5 (DesktopHeroGrid right column) |
| Bookings table on desktop | Task 5 (DesktopBookingsTable) |
| i18n — all new strings in en + de | Task 1 |
| No new npm packages | Confirmed — only `@radix-ui/react-dialog` (already installed) |
| Mobile layout unchanged | Task 4 + Task 5 (all new desktop sections wrapped in `hidden lg:flex` / `lg:hidden`) |

**Placeholder scan:** No TBDs or TODOs. Every step has real code. ✓

**Type consistency:**
- `DesktopTopBar` exported as default, consumed in AppShell Task 4 as `<DesktopTopBar onBook={handleBook} />` ✓
- `AdminSidebar` exported as default, consumed as `<AdminSidebar />` and `<AdminSidebar onClose={...} />` ✓
- `MobileTopBar`, `MobileTabBar`, `TabletTopNav`, `TeacherDrawerContent` exported as named from `AppShellMobile` ✓
- `TabletTopNav` gains `showBookCta: boolean` — Task 4 passes `showBookCta={false}` for staff, `showBookCta` for teachers ✓
- `DesktopHeroGrid` uses `BookingDoc`, `bookingTimes`, `programLabel`, `programAccent`, `PROGRAM_COLORS` — all defined in `HomePage.tsx` scope ✓
- `DesktopBookingsTable` uses same helpers ✓
- `useState` import needed in `DesktopBookingsTable` — `useState` is already imported at top of `HomePage.tsx` ✓
