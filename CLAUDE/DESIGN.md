# Design System

## Style
Clean, trustworthy, and playful-but-scientific — this is a corporate STEM outreach product for teachers, not a consumer app. Think "credible lab, welcoming classroom."

- Modern
- Minimal
- Accessible
- Bilingual-ready (German text runs ~15-20% longer than English — layouts must not break)

## Typography
- **Primary (UI/body)**: Inter
- **Utility (captions, data, timestamps, QR labels)**: Inter (same family, lighter weight + smaller size) — keep one type family for consistency across EN/DE

## Colors

| Token | Hex | Usage |
|---|---|---|
| Primary | `#6366F1` | Primary actions, active states, links |
| Background | `#F8FAFC` | App background (light theme) |
| Surface | `#FFFFFF` | Cards, modals |
| Text | `#0F172A` | Primary text |
| Muted | `#64748B` | Secondary text, captions |
| Success | `#16A34A` | Confirmed / Arrived status |
| Warning | `#D97706` | Pending / awaiting approval (TOAD) |
| Danger | `#DC2626` | Cancelled status, destructive actions |

Dark theme: invert surface/background using CSS custom properties (`--color-bg`, `--color-surface`, `--color-text`, etc.) so components never hardcode hex values directly.

## Program Color-Coding (Admin Dashboard)
Each program gets a consistent accent color used for chips/badges across the app:
- Curiosity Cube → Indigo (`#6366F1`)
- Curiosity Lab → Teal (`#0D9488`)
- Cube + Lab Combo → Violet (`#7C3AED`)
- TOAD Truck → Amber (`#D97706`)

## Status Chips
- Confirmed → Success green
- Pending (TOAD approval) → Warning amber
- Arrived → Primary indigo, filled
- Cancelled → Danger red, muted/outline style

## Components

### Buttons
- Primary — filled, primary color, used for main CTAs (e.g. "Book a visit", "Confirm")
- Secondary — outline, used for secondary actions (e.g. "Cancel", "Back")
- Destructive — filled red, used only for irreversible actions (e.g. "Cancel booking")

### Cards
- Border radius: 12px
- Subtle shadow, no heavy borders
- Hero card (next upcoming visit) gets a distinct treatment: larger padding, countdown timer, QR toggle button

### Modals / Dialogs
- Built on Radix Dialog
- The 6-step booking flow lives in a single modal with a persistent step indicator (this IS a real sequence — numbering here is appropriate and meaningful)

### Step Indicator (Booking Flow)
Since booking is a genuine 6-step sequence, use numbered steps: `1 Visit type → 2 Program → 3 Time slot → 4 Class details → 5 Review → 6 Confirmed`. Show current step highlighted, completed steps checked, future steps muted.

## UX Requirements
- Mobile, tablet, and desktop responsive (375 / 768 / 1440px checkpoints)
- Loading states for every async view (skeletons, not spinners, for list/card content)
- Empty states: "No upcoming visits yet — book your first visit" style, action-oriented, not just "No data"
- Error states: plain-language, tell the teacher what happened and what to do next (never raw error codes in the UI)
- Accessible forms: labeled inputs, visible focus rings, keyboard navigable, sufficient color contrast (WCAG AA minimum)
- Respect `prefers-reduced-motion` — countdown timers and progress rings must have a reduced-motion fallback (no easing/animation, just value updates)

## Signature Element
**The Pre-Visit Kit readiness ring** on the Home page — a circular progress indicator that fills as the teacher completes arrival info review, parking info, consent template download, and class prep guide. It turns the abstract "are we ready?" question into one glanceable, satisfying visual, and reinforces the brand's STEM/instrument aesthetic (think a lab gauge or dial, not a generic loading spinner).

## Voice & Tone (copy)
- Plain, active verbs: "Book a visit," not "Submit booking request."
- Status labels describe what happened, not system internals: "Awaiting Merck approval," not "Pending sync."
- Errors explain what went wrong and the fix: "This time slot just filled up — pick another slot," not "Error 409."
- Empty states invite action: "No bookings yet — book your first visit" with a button, not a bare "No data."
