# Responsive Layout Redesign — Design Spec
**Date:** 2026-10-01  
**Status:** Draft — pending user approval

---

## 1. Overview

Implement the new multi-breakpoint layout system from the "Curiosity Booking — Mobile & Desktop" design file. The design introduces desktop-optimised page layouts and a role-differentiated navigation structure across three breakpoints.

**Core rule:**
- **Teachers (user role):** top bar on all breakpoints — no sidebar ever
- **Coordinators + Admins:** persistent sidebar on desktop (≥1024px), collapsible shadcn sidebar on tablet (768–1023px), bottom tab bar on mobile (<768px)

---

## 2. Breakpoint Strategy

| Breakpoint | Teachers / User role | Coordinators + Admins |
|-----------|---------------------|----------------------|
| Mobile `< 768px` | Top mini-bar + bottom tab bar (current) | Same + Scan tab in centre |
| Tablet `768–1023px` | Sticky top nav bar (current, keep as-is) | Collapsible shadcn `<Sheet>` sidebar triggered from top bar |
| Desktop `≥ 1024px` | Full-width layout, **sticky top bar** only | Persistent 264px left sidebar (shadcn `SidebarProvider`) |

---

## 3. AppShell Restructure (`src/components/layout/AppShell.tsx`)

The current `AppShell` exports one combined shell for all roles. It needs to become role-aware.

### 3a. Teacher shell (user role)

**Mobile:** no change — keep `MobileTopBar` + `MobileTabBar`.

**Tablet:** no change — keep `TabletTopNav`.

**Desktop (new):** Replace the current `<aside className="hidden lg:flex ...">` persistent sidebar with a **full-width sticky top bar** that spans the whole viewport.

Desktop top bar spec (derived from the "Teacher dashboard desktop" design — the header row of that page, without the sidebar):
```
┌─────────────────────────────────────────────────────────────────┐
│  [Merck logo]  Home  Bookings  Kit  Profile    [Search] [Book a visit]  │
└─────────────────────────────────────────────────────────────────┘
height: 64px
background: var(--background) / border-bottom: 1px solid var(--border)
```

Elements left-to-right:
1. **Merck logo** (44×21px) — links to `/home`
2. **Nav links** — Home, Bookings, Kit, Profile — text + icon, active state: `color: var(--brand-purple)` + `background: var(--tint-purple)` pill
3. **Spacer** (`flex-grow: 1`)
4. **Search input** — 280px wide, `border-radius: 12px`, placeholder "Search bookings" — triggers client-side filter on `/bookings` (wire up later; non-blocking for this phase, render as visual element)
5. **"Book a visit" CTA button** — `background: var(--primary)`, `color: #fff`, `border-radius: 12px`, height 44px, Plus icon + label
6. **Theme toggle icon** + **Notification bell**

### 3b. Admin/Coordinator shell

**Mobile:** no change — keep `MobileTopBar` + `MobileTabBar` with Scan in centre.

**Tablet (new):** Add a `<Sheet>` (shadcn) triggered by a hamburger in the top bar. The sheet renders the same `AdminSidebar` content. Current `TabletTopNav` becomes the trigger bar; remove the inline tab links for staff, replace with logo + hamburger + right-side actions.

**Desktop (new):** Replace current `<aside className="hidden lg:flex ...">` with shadcn `SidebarProvider` + `Sidebar`. Width: 264px. No collapsing on desktop.

---

## 4. Desktop Sidebar — Admin/Coordinator (`src/components/layout/AdminSidebar.tsx`)

New component, extracted from the existing `Sidebar` and redesigned to match the `Desktop sidebar` spec page.

### Structure
```
┌──────────────────────────┐
│  [Merck logo] Curiosity  │  ← link to /home, logo 59×28px
│               Admin      │  ← roleLabel: "Admin" | "Coordinator"
│                          │
│  nav items               │  ← flex-col, gap: 2px, padding: 8px 14px
│  ─────────               │
│  [icon] Home             │  ← active: bg var(--tint-purple), color purple
│  [icon] Bookings         │
│  [icon] Kit              │
│  ─ ADMIN ─               │  ← section heading (admin only)
│  [icon] Impact           │
│  [icon] TOAD approvals   │  ← badge: pending count, bg var(--tint-magenta)
│  [icon] Calendar rules   │
│                          │
│  ┌──────────────────────┐│
│  │ [Avatar] Anna Weber  ││  ← user card, bg var(--app-ground)
│  │ Alte Mühle GS        ││
│  │              [→out]  ││
│  └──────────────────────┘│
└──────────────────────────┘
```

### Nav items per role

**Coordinator nav items:**
- Home (`/home`)
- Bookings (`/bookings`) — all bookings, not just own
- Kit (`/kit`)
- *Section heading: ADMIN*
- Impact overview (`/admin`) — default coordinator landing
- TOAD approvals (`/admin/toad`) — with pending badge
- *(no Calendar rules)*

**Admin nav items (superset):**
- Home (`/home`)
- Bookings (`/bookings`)
- Kit (`/kit`)
- *Section heading: ADMIN*
- Impact overview (`/admin`) — default admin landing
- TOAD approvals (`/admin/toad`) — with pending badge
- Calendar rules (`/admin/calendar`)

### Token mapping (sidebar component spec → existing CSS vars)

| Design token | Maps to |
|---|---|
| `var(--background)` | `var(--background)` ✓ |
| `var(--border)` | `var(--border)` ✓ |
| `var(--app-ground)` | `var(--app-ground)` ✓ |
| `var(--muted-foreground)` | `var(--muted-foreground)` ✓ |
| `var(--tint-purple)` | `var(--tint-purple)` ✓ |
| `var(--tint-magenta)` | `var(--tint-magenta)` ✓ |
| `var(--font-display)` | `var(--font-display)` ✓ |

All tokens already exist in `index.css` — no additions needed.

---

## 5. Desktop Page Layouts — Teacher

Pages currently render as mobile-first single-column layouts. On `lg:` they should reflow into the two-column designs from the prototype.

### 5a. HomePage — Desktop layout

The design uses a `1.6fr / 1fr` two-column grid for the hero row and the lower row.

**Row 1 — top header strip** (replaces the mobile greeting block):
- Left: date label (14px muted) + `<h1>` greeting ("Good morning, {name}") — font-display, 34px, weight 800
- Centre: Search input (280px)
- Right: "Book a visit" primary CTA (44px height)

**Row 2 — hero grid** `grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr)` gap 20px:
- **Left: Next visit hero card** — `border-radius: 28px`, `background: var(--brand-purple)`, `color: #fff`
  - Decorative orb circles (absolute positioned): 280px magenta top-right, 140px mint bottom-mid
  - "Confirmed" pill badge (white bg, green text, checkmark icon)
  - "YOUR NEXT VISIT" label uppercase 12px
  - Visit title (font-display 36px weight 800): "Cube + Lab"
  - Date/location/class line (15px)
  - "Days to go" countdown badge — `border-radius: 20px`, `background: rgba(14,14,17,0.28)`, `backdrop-filter: blur(8px)`, number in font-display 44px
  - Program chips row: Cube chip (mint bg) → arrow → Lab chip (yellow bg)
- **Right: Pre-visit kit card** — `border-radius: 28px`, `background: var(--card)`, border
  - SVG ring (68×68): outer circle var(--muted), progress var(--primary), count text in centre
  - "Prepare your class" heading + "Pre-visit kit for {date}" subtext
  - Checklist: 4 tasks with checkbox + strike-through on done

**Row 3 — lower grid** same `1.6fr / 1fr`:
- **Left: My bookings table** — `border-radius: 28px`, card bg
  - Tab switcher: Upcoming / Past
  - Table columns: Date (90px) | Visit (1.3fr) | Class (1fr) | Status (110px) | Action (110px)
  - Row: date+day-of-week; visit title+time with colored left bar; class label; status chip; "View" link
- **Right: Book again quick links** — three colorful cards stacked (Cube mint, Lab yellow, TOAD magenta)
  - Each: icon in frosted circle, title + subtitle, chevron right

**State: no upcoming booking** — replace left hero with an empty-state card that shows the "Book a visit" CTA inline.

### 5b. BookingsPage — Desktop layout

Single-column list on mobile → on `lg:` becomes a two-panel layout:
- Left panel: booking list (scrollable)
- Right panel: inline booking detail — renders the selected booking's detail view in the same page without navigation. On mobile, detail remains a separate route.

*This is a stretch goal for Phase 2 of implementation. Phase 1 delivers the AppShell changes only.*

### 5c. Booking flow — Desktop inline page

The booking modal (current) becomes a full-page inline flow on desktop at `/book`:
- Two-column grid: `minmax(0, 1fr) 380px`
- Left: stacked sections — 1. Programs, 2. Date+calendar, 3. Start time, 4. Class details
- Right: sticky summary aside — "Your visit" purple card + segment chips + class/location/confirmation summary + hold timer + "Confirm booking" CTA + split-class tip

The existing `BookingModal` is kept for mobile/tablet. On desktop (`lg:`), clicking "Book a visit" navigates to `/book` instead of opening the modal.

*Phase 3 of implementation.*

---

## 6. Desktop Page Layouts — Admin/Coordinator

### 6a. Admin: Program Console (`/admin`) — Desktop

Full-page dashboard replacing the current simple booking list.

**Layout: full-width scrollable `<main>` inside the 264px sidebar shell**

Row 1 — page header:
- Subtitle: "Curiosity Cube · Labs · TOAD" (14px muted)
- `<h1>` "Impact overview" (font-display 34px weight 800)
- Right: Month/Term tab switcher + "Export CSV" outline button

Row 2 — KPI tiles: `grid-template-columns: repeat(4, 1fr)` gap 16px
- Tile 1: Students reached — `bg: var(--brand-purple)`, white text, decorative magenta orb, large display number
- Tiles 2–4: other KPIs (sessions held, schools visited, TOAD requests) — card bg, border

Row 3 — two-column `1.2fr / 1fr`:
- Left: "Students reached per month" bar chart — 6 bars, hover tooltip, dashed midline
- Right: "TOAD requests" queue — compact date badge (magenta) + school name + Decline/Approve button pair

Row 4 — two-column `1.2fr / 1fr`:
- Left: "Today's sessions" list — time + school + program color bar + class info + volunteer count
- Right: "Open weekdays" — 5 day toggles (Mon–Fri) per program tab + link to calendar rules

### 6b. Admin: TOAD Approvals (`/admin/toad`) — Desktop

Same sidebar shell. Full-page list of pending/resolved TOAD requests with Decline/Approve actions, undo, decline-reason modal.

### 6c. Admin: Calendar Rules (`/admin/calendar`) — Desktop

Same sidebar shell. Daily start times editor, blackout dates list, save button.

---

## 7. Shadcn Sidebar Usage

The project has Radix UI primitives but not the shadcn `sidebar` component yet. For admin/coordinator:

**On tablet:** use `@radix-ui/react-dialog` (already installed) wrapped as a `<Sheet>` — slide-in from left, width 264px, same `AdminSidebar` content. This avoids adding a new dependency.

**On desktop:** use a plain `<aside>` with `position: sticky; top: 0; height: 100vh` inside the flex shell — the existing pattern. shadcn `SidebarProvider` is not strictly needed; it adds complexity without benefit since we only need one sidebar state. Decision: **use native Radix Dialog as Sheet on tablet, plain aside on desktop**. Re-evaluate if we add collapsing on desktop later.

---

## 8. shadcn components needed

No new packages needed. All primitives already exist via `@radix-ui/*`. We will build:
- `AdminSidebar` — new component (`src/components/layout/AdminSidebar.tsx`)
- `DesktopTopBar` — new component for teacher desktop (`src/components/layout/DesktopTopBar.tsx`)
- Update `AppShell` to branch on role + breakpoint

---

## 9. Files Touched

| File | Change |
|------|--------|
| `src/components/layout/AppShell.tsx` | Role-aware shell: teacher path vs admin path |
| `src/components/layout/AdminSidebar.tsx` | **New** — 264px sidebar for admin/coordinator |
| `src/components/layout/DesktopTopBar.tsx` | **New** — full-width top bar for teacher desktop |
| `src/components/pages/HomePage.tsx` | Desktop two-column layout via `lg:` Tailwind classes |
| `src/index.css` | No changes needed — all tokens exist |
| `src/i18n/en.ts` + `de.ts` | Add any new label keys (roleLabel, searchPlaceholder) |

---

## 10. Implementation Phases

**Phase 1 — AppShell + navigation (this spec)**
- Role-aware AppShell (teacher vs admin path)
- `DesktopTopBar` for teachers on `lg:`
- `AdminSidebar` with Radix Sheet on tablet + plain aside on desktop
- No page content changes yet — existing pages just get the new shells

**Phase 2 — HomePage desktop layout**
- Two-column hero grid on `lg:`
- Hero booking card with orbs, days-to-go badge
- Pre-visit kit ring card
- Bookings table
- Book-again quick links

**Phase 3 — Desktop booking flow**
- `/book` route for desktop
- Two-column inline booking page

**Phase 4 — Admin console desktop**
- Program console full dashboard
- TOAD approvals page
- Calendar rules page

---

## 11. i18n Keys to Add

```
desktop.topbar.search        = "Search bookings"         / "Buchungen suchen"
desktop.topbar.book          = "Book a visit"            / "Besuch buchen"
nav.roleLabel.admin          = "Admin"                   / "Admin"
nav.roleLabel.coordinator    = "Coordinator"             / "Koordinator"
nav.impact                   = "Impact overview"         / "Übersicht"
nav.toadApprovals            = "TOAD approvals"          / "TOAD-Anfragen"
nav.calendarRules            = "Calendar rules"          / "Kalenderregeln"
home.desktop.daysToGo        = "days to go"              / "Tage noch"
home.desktop.bookAgain       = "Book again"              / "Erneut buchen"
home.desktop.yourNextVisit   = "Your next visit"         / "Ihr nächster Besuch"
home.desktop.prepareClass    = "Prepare your class"      / "Klasse vorbereiten"
```

---

## 12. Decisions / Constraints

- **No new npm packages** — use existing Radix UI primitives throughout. shadcn's `sidebar` component is optional later if desktop collapsing is needed.
- **Mobile stays unchanged** — all `< md:` behavior is identical to today; this spec only adds `lg:` (and `md:` for admin tablet) layers on top.
- **Booking modal preserved** — the existing `BookingModal` continues to work on mobile/tablet. Phase 3 adds the desktop `/book` page as an alternative entry; both coexist.
- **Design tokens unchanged** — `index.css` token set already matches the prototype; no CSS variable additions needed for Phase 1 or 2.
- **i18n mandatory** — every new string in both `en` and `de` in the same commit, per RULES.md.
