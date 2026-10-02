# Employee Connect — Home Page Design Specification

**Date:** 2026-06-11  
**Platform:** Mobile (React Native) & iPad (Web Dashboard)  
**Design Reference:** `mobile/design/employee-connect-design.html`  
**Status:** Design Ready for Implementation

---

## Overview

This document specifies the implementation of the Employee Connect Home page across two platforms:

1. **Mobile** (React Native, 392×844px) — tab-based layout with greeting header, announcement banner, quick actions, upcoming events carousel, and company feed
2. **iPad** (Web dashboard, 880×660px landscape) — sidebar navigation with hero strip, KPI cards, company feed panel, mini calendar, and engagement chart

Both share design tokens (Merck Liquid Design System) and reusable components but differ significantly in layout and component density.

---

## Design System Reference

### Brand Colors

| Token | Light Value | Dark Value | Usage |
|-------|-------------|-----------|-------|
| Primary (Vibrant Green) | `#149B5F` | `#34C383` | CTAs, active states, highlights |
| Secondary (Vibrant Cyan) | `#2DBECD` | `#5ED0DE` | Accents, secondary buttons |
| Tertiary (Vibrant Yellow) | `#FFC832` | `#FFD75E` | Warnings, tertiary accents |
| Accent (Green tint) | `#ECFDF3` (light) | `rgba(20,155,95,.16)` (dark) | Background fill |
| Accent Cyan | `#E9FAFC` (light) | `rgba(45,190,205,.14)` (dark) | Cyan tint backgrounds |
| Accent Yellow | `#FFF8E1` (light) | `rgba(255,200,50,.12)` (dark) | Yellow tint backgrounds |
| Background | `#FFFFFF` (light) | `#09090B` (dark) | Page background |
| Card | `#FFFFFF` (light) | `#18181B` (dark) | Card/section background |
| Text Primary | `#09090B` (light) | `#FAFAFA` (dark) | Main text |
| Text Secondary | `#71717B` (light) | `#A1A1AA` (dark) | Muted text |
| Border | `#E4E4E7` (light) | `rgba(255,255,255,.10)` (dark) | Divider lines |

### Typography

- **Font Family:** Noto Sans, -apple-system, Segoe UI, sans-serif
- **Base Size:** 16px (1rem)
- **Heading 1:** 30px, weight 900, letter-spacing -0.02em
- **Heading 2:** 16px, weight 800, letter-spacing -0.01em
- **Heading 3:** 17px, weight 800, letter-spacing -0.01em
- **Body Text:** 13px, weight 400
- **Small Text:** 11px, weight 600

### Spacing & Radius

- **Border Radius:** 0.625rem (10px)
- **Padding Base:** 16px
- **Margin Base:** 16px
- **Gap Base:** 8px

### Shadows

- **Shadow SM:** `0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)`
- **Shadow LG:** `0 10px 30px -6px rgba(9,9,11,.14)`

---

## Mobile (React Native) Implementation

### Layout Structure

```
StatusBar (54px)
├── App Header (greeting, notifications, avatar)
├── Scroll Body
│   ├── Search bar
│   ├── Announcement banner
│   ├── Quick action grid (4 buttons)
│   ├── Upcoming events section (horizontal scroll)
│   └── Feed posts section (vertical list)
└── Bottom tab bar (66px)
```

### Components Breakdown

#### 1. **Status Bar**
- Height: 54px
- Time, WiFi, battery indicators (platform native)
- Dark background matching app chrome

#### 2. **App Header**
- Height: ~52px
- Layout: flex, justify-space-between, align-center
- Left: Hamburger menu button (icon-btn, 42×42px, rounded 14px)
- Center: Greeting section (flex: 1)
  - "Good morning ☀️" (12px, muted color)
  - "Prakash Kumar" (17px, weight 800)
- Right: Notification bell (icon-btn with yellow badge-dot at top-right), user avatar (42×42px, gradient bg)

**Component to Create:** `MobileAppHeader.tsx`

#### 3. **Search Bar**
- Height: 46px
- Margin: 0 18px 4px
- Background: muted color
- Border: transparent, changes to ring color on focus
- Contents: search icon + input placeholder "Search news, people, events…"
- No kbd shortcut (mobile)

**Reuse:** CustomInput with icon wrapper

#### 4. **Announcement Banner**
- Margin: 6px 18px 22px
- Border-radius: 10px
- Background: linear gradient (green → cyan, 118deg angle)
- Color: white text
- Box-shadow: LG
- Padding: 18px

**Structure:**
- Tag: "Priority · Leadership" (10px, white bg with opacity, rounded 99px, uppercase)
- Heading: "Q3 Townhall — Innovation Day 2026" (17px, weight 800)
- Description: "Join the EMEA leadership stream..." (12.5px, opacity 0.88)
- CTA button: white bg, green text, "Read & acknowledge" + chevron (rounded 99px, 12.5px font)

**Decorative Elements:**
- ::after pseudo-element: radial gradient yellow circle (top-right, semi-transparent)
- ::before pseudo-element: cyan circle border (bottom-right, blurred)

**Component to Create:** `AnnouncementBanner.tsx` (with decorative SVG fallback for React Native)

#### 5. **Quick Action Grid**
- 4-column grid (grid-template-columns: repeat(4, 1fr))
- Gap: 10px
- Margin: 0 18px
- Each button: 
  - Background: card color
  - Border: 1px solid, border color
  - Border-radius: 10px
  - Padding: 13px 6px 11px
  - Hover: translateY(-2px), shadow-sm
  - Contents: icon (40×40px, rounded 13px, colored bg) + label (10.5px, muted)

**Buttons:**
1. Book seat (ticket icon, green bg)
2. Check-in (QR icon, cyan bg)
3. Recognize (award icon, yellow bg)
4. Write blog (document icon, gray bg)

**Component to Create:** `QuickActionGrid.tsx` with individual `QuickActionButton.tsx`

#### 6. **Upcoming Events Section**
- Header: "Upcoming events" title + "See all" link
- Horizontal scrollable carousel of 3 event cards
- Each card: 236px min-width (fixed), scroll-snap-align

**Event Card Structure:**
- Cover: 86px height with gradient bg + 25% opacity dot pattern
  - Date badge (top-left): day (16px, weight 900), month (9px, uppercase)
  - 3 gradient options: ec1 (green-cyan), ec2 (blue-cyan), ec3 (orange-yellow)
- Body: 
  - Title: "AI in Pharma — Tech Conference" (13.5px, weight 800)
  - Meta: icon + "Innovation Center, Hall B" (11px)
  - Footer: avatar stack + seat count + register button

**Component to Create:** `EventCard.tsx` and `EventCarousel.tsx`

#### 7. **Feed Posts Section**
- Margin: 0 18px
- Section title + Filter link header
- 6 post articles (vertical stack, scrollable)

**Post Structure:**
- Post head (flex, align-center, gap 11px):
  - Avatar (38×38px, gradient, initials)
  - Who: name (13.5px), role + time (11px, muted)
  - Chip: "Blog" / "Recognition" / "News" (9.5px, uppercase, colored bg)
- Content: paragraph (13px)
- Post media (optional): 120px height, gradient or image placeholder
  - If blog: play icon + "5 min read · with video"
  - If kudos: medal icon + recognition detail
  - If news: image with text overlay or gallery icon
- Actions: like (with count), comment, share, save (11.5px, muted, hover: bg-muted)
  - .liked state: green color + filled icon

**Component to Create:** `FeedPost.tsx` with `PostActions.tsx`, `PostMedia.tsx`

#### 8. **Bottom Tab Bar**
- Position: absolute, bottom 0, z-index 40
- Height: 66px (including safe area padding)
- Background: semi-transparent card color with blur (backdrop-filter: blur(18px))
- Border: 1px solid, border color
- Border-radius: 24px
- Box-shadow: LG
- 5 tabs: Home (active), Events, Center FAB, Calendar, Profile
- Active tab indicator: top line (3.5px, green-cyan gradient)

**FAB (Center):**
- Width/height: 54px
- Border-radius: 19px
- Margin-top: -26px (overlaps tab bar)
- Background: green gradient (135deg)
- Plus icon (24px)
- Box-shadow: strong green drop shadow
- Hover: scale(1.06) rotate(90deg)

**Component to Create:** `BottomTabBar.tsx` or reuse React Navigation bottom tabs with custom styling

---

### Mobile Screen Hierarchy

```typescript
// HomeScreen.tsx (the main screen users see)
export default function HomeScreen() {
  return (
    <SafeAreaView>
      <MobileAppHeader />
      <ScrollView>
        <SearchBar />
        <AnnouncementBanner />
        <QuickActionGrid />
        <EventCarousel />
        <FeedPostsList />
      </ScrollView>
      {/* Tab bar handled by navigation */}
    </SafeAreaView>
  );
}
```

---

## iPad (Web Dashboard) Implementation

### Layout Structure

```
Sidebar (236px fixed) | Main content
├── Brand mark + nav    │ ├── Header (64px) - search, notifications
├── Drawer nav items    │ ├── Hero strip
├── Storage card        │ ├── KPI grid (4 columns)
├── Sidebar footer      │ └── Content grid (1.55:1)
│                       │     ├── Company feed panel
│                       │     └── Side stack
│                       │         ├── Mini calendar
│                       │         └── Engagement chart
```

### Components Breakdown

#### 1. **Sidebar**
- Width: 236px (fixed)
- Background: sidebar color
- Border-right: 1px solid, border color
- Padding: 20px 12px 16px

**Elements:**

**Brand Mark:**
- 38×38px, rounded 12px
- Conic gradient (green → cyan → yellow)
- Inner donut with sidebar bg
- Letter "EC" (white, weight 900, 15px)

**Brand Text:**
- "Employee Connect" (14.5px, weight 900)
- "Merck · EMEA" (9.5px, uppercase, muted)

**Drawer Nav:**
- Items same as mobile drawer
- "Dashboard" active (first item)
- Section labels: "Workspace", "Community"

**Storage Card:**
- Margin: 10px 4px 12px
- Padding: 13px
- Background: gradient accent + cyan
- Border: 1px solid, rounded 14px
- Title: "Innovation Day 2026" (12px)
- Description: "Seat booking opens Friday 09:00 CET. 420 seats · 3 tracks." (10.5px, muted)
- Button: "Set reminder" (10.5px)

**Footer:**
- Settings + Sign out items

**Component to Create:** `DashboardSidebar.tsx`

#### 2. **Header**
- Height: 64px
- Border-bottom: 1px solid
- Display: flex, align-center, gap 14px
- Title: "Dashboard" (17px, weight 900)
- Search: 340px max-width, flex-grow (same as mobile but taller: 40px)
- Notifications bell + avatar

**Reuse:** CustomInput for search

#### 3. **Hero Strip**
- Border-radius: 10px
- Padding: 20px 22px
- Background: green gradient (112deg angle, 3 stops)
- Color: white
- Box-shadow: LG
- Display: flex, align-center, gap 18px
- Margin-bottom: 18px

**Structure:**
- Text section (flex: 1):
  - Heading: "Good morning, Prakash 👋" (19px, weight 900)
  - Paragraph: "3 announcements... AI in Pharma... Frontend Guild..." (12.5px, opacity 0.88)
- CTA button: white bg, green text, "Review now" + chevron

**Decorative:**
- ::after: yellow circle, top-right, large, semi-transparent
- ::before: cyan circle, bottom-right, blurred

**Component to Create:** `HeroStrip.tsx`

#### 4. **KPI Grid**
- Grid: 4 columns, 14px gap
- Margin-bottom: 18px

**Each KPI Card:**
- Background: card color
- Border: 1px solid
- Border-radius: 10px
- Padding: 15px 16px
- Position: relative (for trend badge)

**Structure:**
- Icon container (34×34px, rounded 11px, colored):
  - Users (green accent), Ticket (cyan accent), Announcement (yellow accent), Heart (green accent)
- Number: 21px, weight 900, large value
- Label: 11px, muted, uppercase
- Trend badge (top-right): "±X%", 10px, rounded 99px, colored bg

**Examples:**
- 2,847 Active employees today (+12%, green)
- 14 Events this month (+8%, green)
- 92% Announcement reach (3 new, yellow/warn)
- 6.4k Reactions this week (+21%, green)

**Component to Create:** `KPIGrid.tsx` with `KPICard.tsx`

#### 5. **Content Grid (1.55:1 ratio)**
- Display: grid, grid-template-columns: 1.55fr 1fr
- Gap: 16px
- Align-items: start

**Left Column: Company Feed Panel**
- Card container (panel class)
- Header: "Company feed" title + "Open feed" link
- Inner: 3 feed posts (truncated, no full body)
  - Each post: border-bottom (except last)
  - Reduced spacing
- Click entire panel to expand feed

**Post variants in feed:**
1. Blog post: avatar + name + chip(blog) + preview + heart count + actions
2. Recognition: avatar + P&C team + chip(kudos) + medal strip
3. Blog with media: avatar + name + chip(blog) + description + video media + actions

**Right Column: Side Stack**
- 2 panels stacked vertically

**Mini Calendar:**
- Header: "June 2026" + Calendar link
- 7×7 grid (days of week + calendar days)
- Today (10th): highlighted with primary bg + box-shadow
- Event dots on relevant dates (colored: green, cyan, yellow)
- Font: 10.5px for day numbers

**Engagement Chart:**
- Header: "Engagement · last 7 days" + Report link
- Bar chart (height-based visualization)
- 7 columns (Thu–Wed)
- Bars: cyan/green gradient, peak day (Tue) highlighted in yellow
- Labels: 9px, uppercase

**Component to Create:** `CompanyFeedPanel.tsx`, `MiniCalendar.tsx`, `EngagementChart.tsx`

#### 6. **Feed Post (Tablet Version)**
- Variant of mobile post but denser
- Border: 0 (top/bottom borders only between posts)
- Padding: less vertical
- No post media if text-only
- Actions: inline, smaller font

**Component to Create:** `TabletFeedPost.tsx` (variant of FeedPost.tsx)

---

## Shared Components

These components will be used by both mobile and web implementations:

| Component | Mobile Usage | iPad Usage | Notes |
|-----------|--------------|-----------|-------|
| CustomText | All text elements | All text elements | Already exists, reuse |
| CustomButton | Search, CTA buttons | All buttons | Exists, reuse |
| CustomInput | Search bar | Search bar | Exists, reuse with icon wrapper |
| Avatar | User avatars, post avatars | Sidebar brand, post avatars | Simple gradient circle, create `Avatar.tsx` |
| IconButton | Header buttons | Header buttons | Rounded square with icon, create `IconButton.tsx` |
| Chip | Post type indicators | Post type indicators | Small colored badge, create `Chip.tsx` |

---

## New Components to Create

### Mobile-Specific
1. **MobileAppHeader.tsx** — greeting + notifications
2. **AnnouncementBanner.tsx** — gradient banner with CTA
3. **QuickActionButton.tsx** — individual quick action
4. **QuickActionGrid.tsx** — 4-button grid
5. **EventCard.tsx** — horizontal scroll card
6. **EventCarousel.tsx** — container for horizontal scroll
7. **FeedPost.tsx** — post article with actions
8. **PostActions.tsx** — like, comment, share, save buttons
9. **PostMedia.tsx** — media/gallery section variant
10. **HomeScreen.tsx** — main screen orchestrator

### iPad-Specific
1. **DashboardSidebar.tsx** — left navigation sidebar
2. **HeroStrip.tsx** — greeting hero section
3. **KPICard.tsx** — single KPI metric
4. **KPIGrid.tsx** — 4-column KPI grid
5. **CompanyFeedPanel.tsx** — feed panel container
6. **MiniCalendar.tsx** — calendar widget
7. **EngagementChart.tsx** — bar chart
8. **DashboardScreen.tsx** — main screen orchestrator (web)

### Shared/Utility
1. **Avatar.tsx** — gradient circle avatar
2. **IconButton.tsx** — rounded button with icon
3. **Chip.tsx** — colored badge/chip
4. **SearchBar.tsx** — search input with icon
5. **useTheme.ts** — already exists, reuse

---

## Data Structure & Mock Data

### Feed Post
```typescript
interface FeedPost {
  id: string;
  author: {
    name: string;
    role: string;
    timestamp: string; // "2h ago"
    avatar: {
      initials: string;
      gradient: [string, string]; // e.g., ["#0F69AF", "#2DBECD"]
    };
  };
  type: 'blog' | 'recognition' | 'news';
  title?: string;
  content: string;
  media?: {
    type: 'image' | 'video' | 'none';
    url?: string;
    placeholder?: 'play' | 'gallery' | 'checkmark';
  };
  kudos?: {
    title: string;
    description: string;
  };
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  userActions: {
    liked: boolean;
    saved: boolean;
  };
}
```

### Event
```typescript
interface Event {
  id: string;
  date: {
    day: number;
    month: string;
  };
  title: string;
  location: string;
  time?: string;
  icon: 'pin' | 'video' | 'users';
  gradient: 'ec1' | 'ec2' | 'ec3';
  seats: {
    available: number;
    registered: number;
    status: 'available' | 'low' | 'waitlist' | 'full';
  };
  attendees?: Array<{ initials: string; gradient: string }>;
}
```

---

## Navigation Flow

### Mobile Navigation
- **Root:** Auth check → Main app
- **Main:** Bottom tab bar navigation (Home is default)
- **Home Tab** (this spec) shows greeting + announcement + events + feed
- **Other Tabs:** Events list, Calendar, Profile (existing placeholders)

### iPad Navigation
- **Root:** Auth check → Dashboard
- **Dashboard:** Sidebar + main content area
- **Home/Dashboard:** This spec (sidebar always visible)

---

## Styling Approach

### Mobile (React Native)
- Use existing theme system (`useTheme()` hook)
- StyleSheet for all styles (no Tailwind in mobile)
- Flexbox layouts throughout
- Colors from `theme` context

### iPad (Web/React)
- Tailwind v4 for styling (if web component)
- CSS custom properties for Merck tokens (already defined in design file)
- Grid layouts for multi-column
- Colors from CSS vars or Tailwind

---

## Performance Considerations

### Mobile
- FlatList for feed posts (with key={post.id}, not index)
- EventCarousel: use horizontal FlatList with scroll-snap-type
- Memoize components that receive static props
- Image placeholders (no heavy images in feed media)

### iPad
- MiniCalendar: render only visible month
- Feed panel: virtualized scroll (if many posts)
- KPI cards: static, no animation needed

---

## Accessibility

- Semantic HTML structure (web)
- ARIA labels for icon buttons
- Color contrast meets WCAG AA (all text on colored backgrounds)
- Focus states for all interactive elements
- Tab key navigation support

---

## Testing Strategy

### Unit Tests
- Each component renders with mock props
- User interactions (button clicks) trigger callbacks
- Conditional rendering (empty states, loading)

### Integration Tests
- HomeScreen renders all sections in correct order
- Tab navigation switches screens
- Drawer opens/closes on hamburger click

### Visual Tests
- Component screenshots match design
- Light/dark theme variants
- Responsive layouts (mobile vs iPad)

---

## Implementation Order

1. **Phase 1: Shared Components** (Avatar, IconButton, Chip, SearchBar)
2. **Phase 2: Mobile Components** (MobileAppHeader, AnnouncementBanner, QuickActionGrid, EventCarousel, FeedPost, HomeScreen)
3. **Phase 3: iPad Components** (DashboardSidebar, HeroStrip, KPIGrid, CompanyFeedPanel, MiniCalendar, EngagementChart, DashboardScreen)
4. **Phase 4: Integration** (Wire up navigation, mock data, theme switching)
5. **Phase 5: Polish** (Animations, accessibility, performance optimization)

---

## Open Questions / Decisions

- [ ] Will iPad dashboard be a separate React web app or part of React Native web?
- [ ] Feed posts API endpoint structure (what fields does backend return)?
- [ ] Real data for KPI metrics or mock for now?
- [ ] Notification badge on bell icon — static or real-time?
- [ ] FAB button action (create new post, start chat, etc.)?
- [ ] Drawer nav items all clickable or some disabled?
- [ ] Event registration flow (in-app or external link)?

---

## Notes

- Design tokens are defined in `mobile/design/employee-connect-design.html` (CSS custom properties)
- All components should support dark/light theme via context
- No external state management needed beyond React Context (for now)
- Use existing icon system (`@components/icons/`)
- Merck green (#149B5F) is primary CTA color throughout

