# OTP Input Visual Preview

## 📱 What You'll See

### 1. Empty State (Initial Load)

```
╔══════════════════════════════════════════════════════╗
║                                                      ║
║              VERIFY YOUR EMAIL                       ║
║         Code sent to user@example.com                ║
║                                                      ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │        │ │        │ │        │               ║
║    │   |    │ │        │ │        │  ← Cursor     ║
║    │        │ │        │ │        │               ║
║    └────────┘ └────────┘ └────────┘               ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │        │ │        │ │        │               ║
║    │        │ │        │ │        │               ║
║    │        │ │        │ │        │               ║
║    └────────┘ └────────┘ └────────┘               ║
║                                                      ║
║     Enter the 6-digit code sent to your email       ║
║                                                      ║
║         ┌─────────────────────────┐                ║
║         │        VERIFY           │  ← Button       ║
║         └─────────────────────────┘                ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

### 2. Partially Filled (User Typing)

```
╔══════════════════════════════════════════════════════╗
║                                                      ║
║              VERIFY YOUR EMAIL                       ║
║         Code sent to user@example.com                ║
║                                                      ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │        │ │        │ │        │               ║
║    │   1    │ │   2    │ │   3    │  ← Filled     ║
║    │        │ │        │ │        │               ║
║    └────────┘ └────────┘ └────────┘               ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │        │ │        │ │        │               ║
║    │   4    │ │   |    │ │        │  ← Focused    ║
║    │        │ │        │ │        │               ║
║    └────────┘ └────────┘ └────────┘               ║
║       ▲          ▲                                  ║
║    Filled     Typing                                ║
║                                                      ║
║     Enter the 6-digit code sent to your email       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

### 3. Fully Filled (Ready to Verify)

```
╔══════════════════════════════════════════════════════╗
║                                                      ║
║              VERIFY YOUR EMAIL                       ║
║         Code sent to user@example.com                ║
║                                                      ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │        │ │        │ │        │               ║
║    │   1    │ │   2    │ │   3    │               ║
║    │        │ │        │ │        │               ║
║    └────────┘ └────────┘ └────────┘               ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │        │ │        │ │        │               ║
║    │   4    │ │   5    │ │   6    │  ← Complete   ║
║    │        │ │        │ │        │               ║
║    └────────┘ └────────┘ └────────┘               ║
║                                                      ║
║     Enter the 6-digit code sent to your email       ║
║                                                      ║
║         ┌─────────────────────────┐                ║
║         │        VERIFY           │  ← Active       ║
║         └─────────────────────────┘                ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

### 4. Error State (Invalid Code)

```
╔══════════════════════════════════════════════════════╗
║                                                      ║
║              VERIFY YOUR EMAIL                       ║
║         Code sent to user@example.com                ║
║                                                      ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │ RED    │ │ RED    │ │ RED    │               ║
║    │   1    │ │   2    │ │   3    │  ← Red Border ║
║    │ BORDER │ │ BORDER │ │ BORDER │               ║
║    └────────┘ └────────┘ └────────┘               ║
║    ┌────────┐ ┌────────┐ ┌────────┐               ║
║    │ RED    │ │ RED    │ │ RED    │               ║
║    │   4    │ │   5    │ │   6    │               ║
║    │ BORDER │ │ BORDER │ │ BORDER │               ║
║    └────────┘ └────────┘ └────────┘               ║
║                                                      ║
║     ❌ Invalid verification code. Try again.        ║
║                                                      ║
║         ┌─────────────────────────┐                ║
║         │        VERIFY           │                ║
║         └─────────────────────────┘                ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

## 🎨 Detailed Box States

### Empty Box

```
┌────────────┐
│            │  ← Light gray border (1px)
│            │     Card background
│            │     No content
│            │
└────────────┘
```

### Focused Box (With Cursor)

```
┌────────────┐
│ ┏━━━━━━━┓  │  ← Blue border (2px)
│ ┃   |   ┃  │     Glow shadow effect
│ ┃       ┃  │     Blinking cursor
│ ┗━━━━━━━┛  │     Scaled 1.05x
└────────────┘
```

### Filled Box

```
┌────────────┐
│            │  ← Primary border (1px)
│     5      │     Large number (24px)
│            │     Bold font (700)
│            │
└────────────┘
```

### Error Box

```
┌────────────┐
│ ┏━━━━━━━┓  │  ← Red border (1px)
│ ┃   5   ┃  │     Error color
│ ┗━━━━━━━┛  │     No shadow
└────────────┘
```

---

## 📐 Exact Measurements

### Box Dimensions

```
Width:  52px  ████████
Height: 60px  ██
              ██
              ██
              ██
              ██
```

### Gap Between Boxes

```
[BOX] ←12px→ [BOX] ←12px→ [BOX]
```

### Typography

```
Font:   Urbanist
Size:   24px
Weight: 700 (Bold)
Color:  Theme primary text
```

---

## 🌈 Color Variations

### Light Mode

```
┌──────────┐
│ Empty    │ → Border: #E5E7EB (light gray)
└──────────┘

┌──────────┐
│ Filled   │ → Border: #6366F1 (primary)
└──────────┘

┌──────────┐
│ Focused  │ → Border: #6366F1 (primary, 2px)
└──────────┘   Shadow: #6366F1 glow

┌──────────┐
│ Error    │ → Border: #EF4444 (red)
└──────────┘
```

### Dark Mode

```
┌──────────┐
│ Empty    │ → Border: #374151 (dark gray)
└──────────┘

┌──────────┐
│ Filled   │ → Border: #8B5CF6 (purple)
└──────────┘

┌──────────┐
│ Focused  │ → Border: #8B5CF6 (purple, 2px)
└──────────┘   Shadow: #8B5CF6 glow

┌──────────┐
│ Error    │ → Border: #EF4444 (red)
└──────────┘
```

---

## 🎬 Animation Flow

### Focus Animation

```
State: unfocused → focusing → focused

Scale:  1.0  →  1.05  →  1.05
        ▭        ▬        ▬

Duration: 300ms spring animation
```

### Typing Flow

```
User Action:     Type "1"
                    ↓
Box 1:          Shows "1"
                    ↓
Focus:          Moves to Box 2
                    ↓
Animation:      Box 1 scales down
                Box 2 scales up
                    ↓
Ready:          Box 2 focused
```

---

## 📱 Responsive Layout

### Mobile (Width < 400px)

```
╔══════════════════════╗
║  ┌───┐ ┌───┐ ┌───┐  ║
║  │ 1 │ │ 2 │ │ 3 │  ║
║  └───┘ └───┘ └───┘  ║
║  ┌───┐ ┌───┐ ┌───┐  ║
║  │ 4 │ │ 5 │ │ 6 │  ║
║  └───┘ └───┘ └───┘  ║
╚══════════════════════╝
```

### Tablet (Width >= 768px)

```
╔═══════════════════════════════════╗
║    ┌────┐ ┌────┐ ┌────┐         ║
║    │ 1  │ │ 2  │ │ 3  │         ║
║    └────┘ └────┘ └────┘         ║
║    ┌────┐ ┌────┐ ┌────┐         ║
║    │ 4  │ │ 5  │ │ 6  │         ║
║    └────┘ └────┘ └────┘         ║
╚═══════════════════════════════════╝
```

---

## 🎯 Touch Targets

Each box is tappable:

```
┌────────────────┐
│                │  ← Full area clickable
│   Tap Area     │     52px × 60px
│   (52 × 60)    │     Easy to touch
│                │
└────────────────┘
```

---

## 🔢 Number Display

### How Numbers Appear

```
Input:  1        Display in Box:
        ↓           ┌────────┐
                    │        │
        1    →      │   1    │  ← Centered
                    │        │
                    └────────┘
```

### All Digits Example

```
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 0 │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 6 │ │ 7 │ │ 8 │ │ 9 │
└───┘ └───┘ └───┘ └───┘
```

---

## 💡 Visual Hints

### Cursor Indicator

```
┌────────┐
│        │
│   |    │  ← Blinking cursor
│        │     Shows current focus
└────────┘
```

### Hover State (Web)

```
┌────────┐      ┌────────┐
│        │  →   │░░░░░░░░│  ← Slight highlight
│        │      │░░░░░░░░│
└────────┘      └────────┘
```

---

## 🎨 Complete Screen Layout

```
╔══════════════════════════════════════════════════════╗
║                     [← Back]                         ║
║                                                      ║
║                VERIFY YOUR EMAIL                     ║
║           Code sent to user@example.com              ║
║                                                      ║
║           ┌────┐ ┌────┐ ┌────┐                     ║
║           │    │ │    │ │    │                     ║
║           │ 1  │ │ 2  │ │ 3  │                     ║
║           │    │ │    │ │    │                     ║
║           └────┘ └────┘ └────┘                     ║
║           ┌────┐ ┌────┐ ┌────┐                     ║
║           │    │ │    │ │    │                     ║
║           │ 4  │ │ 5  │ │ 6  │                     ║
║           │    │ │    │ │    │                     ║
║           └────┘ └────┘ └────┘                     ║
║                                                      ║
║      Enter the 6-digit code sent to your email      ║
║                                                      ║
║              ┌────────────────────┐                 ║
║              │      VERIFY        │                 ║
║              └────────────────────┘                 ║
║                                                      ║
║  ─────────────────────────────────────────────      ║
║                                                      ║
║           Didn't receive the code?                   ║
║                                                      ║
║              [Resend Code]                           ║
║              or                                      ║
║           Resend in 60 seconds                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

## ✨ Key Visual Features

1. **Large, Bold Numbers**

   - Easy to read
   - 24px size
   - 700 weight

2. **Clean Square Boxes**

   - Perfect squares
   - Rounded corners (12px)
   - Consistent spacing

3. **Visual Feedback**

   - Blue border on focus
   - Red border on error
   - Scale animation

4. **Center Alignment**

   - Perfectly centered
   - Balanced layout
   - Professional look

5. **Theme Integration**
   - Dark mode support
   - Light mode support
   - Consistent colors

---

## 🎬 User Interaction Flow

```
1. Screen Loads
   └→ First box auto-focuses
      └→ Keyboard appears

2. User Types "1"
   └→ "1" appears in box
      └→ Focus moves to box 2

3. User Types "2"
   └→ "2" appears in box
      └→ Focus moves to box 3

4. Continue...
   └→ All 6 boxes filled

5. User Taps "Verify"
   └→ API call
      ├→ Success: Navigate to app
      └→ Error: Show red borders + message
```

---

## 🎯 Final Result

**You get a beautiful, modern OTP input that:**

- ✅ Looks professional and clean
- ✅ Has clear, visible numbers
- ✅ Uses square boxes (52x60px)
- ✅ Is perfectly center-aligned
- ✅ Works great for email authentication
- ✅ Provides excellent user experience

**Ready to test!** 🚀

---

**Visual Style**: Modern, Clean, Professional
**Best For**: Email OTP Verification
**Status**: ✅ Production Ready
