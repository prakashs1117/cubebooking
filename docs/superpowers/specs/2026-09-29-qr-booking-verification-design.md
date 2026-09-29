# QR Booking Verification — Design Spec

**Date:** 2026-09-29  
**Status:** Approved  
**Project:** Curiosity Cube & Labs — School Booking Web App

---

## Overview

Teachers receive a QR code after booking. On the day of the visit, an admin scans the teacher's QR code to instantly verify the booking and mark the class as arrived — no manual lookup required.

---

## Goals

- Replace the fake booking code on `ConfirmedPage` with a real, scannable QR code tied to the Firestore booking ID
- Show the same QR on `BookingDetailPage` so teachers can re-display it at any time
- Give admins a fast `/admin/scan` screen (camera-based) that resolves to a booking verification view
- Write `arrivedAt` + set `status: 'arrived'` on verification

---

## Non-Goals

- QR image is not stored in Firebase Storage — generated client-side on demand
- No email/PDF with the QR code in this iteration
- No push notification to teacher on check-in

---

## New Booking Status

Add `'arrived'` to `BookingStatus` in `src/shared/types/index.ts`:

```ts
export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'confirmed'
  | 'arrived'     // ← new: admin scanned + marked class as checked in
  | 'cancelled'
```

Add `arrivedAt?: Timestamp` optional field to the `Booking` interface.

---

## bookingStore Changes

Add `confirmedBookingId: string | null` to `BookingState`. Set it when the booking is written to Firestore (in `ReviewPage` / `confirmBooking`). Clear it in `reset()`. This gives `ConfirmedPage` access to the real Firestore doc ID without a re-fetch.

---

## Shared Component: `BookingQRCode`

**File:** `src/components/booking/BookingQRCode.tsx`

**Props:**
```ts
interface BookingQRCodeProps {
  bookingId: string
  size?: number        // default 180
  className?: string
}
```

**Behavior:**
- Uses `qrcode` npm package (`toDataURL(text, options)`)
- Encodes: `https://<window.location.origin>/admin/verify/{bookingId}`
- Generates asynchronously in a `useEffect`; shows a skeleton placeholder while generating
- On error: shows a small error message with the raw booking ID as fallback
- Renders as `<img src={dataUrl} alt="Booking QR code" />`
- White background, black modules — no color branding on the QR itself (maximizes scannability)

---

## ConfirmedPage Changes

- Replace the static QR icon placeholder with `<BookingQRCode bookingId={confirmedBookingId} />`
- Replace the fake `CC-XXXX` code with the real Firestore booking ID (first 8 chars uppercased for display)
- `confirmedBookingId` comes from `bookingStore`
- Guard: if `confirmedBookingId` is null (shouldn't happen on this screen), fall back to showing the icon

---

## BookingDetailPage Changes

- Add a "Show QR code" collapsible section below the detail rows (collapsed by default, tap to expand)
- Renders `<BookingQRCode bookingId={booking.id} />` centered in a white card
- Only shown when `booking.status === 'confirmed' || booking.status === 'arrived'`
- Label: "Show this to Merck staff on arrival"

---

## Admin Scan Screen

**Route:** `/admin/scan`  
**File:** `src/components/admin/QRScanPage.tsx`  
**Guard:** `<ProtectedRoute requireAdmin>` — non-admins redirected to `/home`

**Camera flow:**
1. On mount: request `getUserMedia({ video: { facingMode: 'environment' } })`
2. Stream into a `<video>` element (muted, autoPlay, playsInline)
3. Use `BarcodeDetector` API (native browser, no library) with `formats: ['qr_code']`
4. Poll with `requestAnimationFrame` — detect QR in each frame
5. On decode: extract `bookingId` from the URL path, navigate to `/admin/verify/{bookingId}`
6. Stop camera stream on unmount

**BarcodeDetector availability:**
- Check `'BarcodeDetector' in window` on mount
- If unavailable (Safari < 17, some older Android WebView): hide video, show manual fallback input
- Manual fallback: text input labeled "Enter booking ID", submit button → navigate to `/admin/verify/{value.trim()}`

**UI:**
- Full-screen dark background
- Centered video with a square scan-frame overlay (white corner brackets, CSS only)
- "Point camera at the teacher's QR code" instruction text
- Back button (ChevronLeft) → `/home`
- Manual entry link below the frame ("Can't scan? Enter ID manually")

---

## Admin Verification Screen

**Route:** `/admin/verify/:bookingId`  
**File:** `src/components/admin/BookingVerifyPage.tsx`  
**Guard:** `<ProtectedRoute requireAdmin>`

**Data:** Uses existing `useBooking(bookingId)` hook — single Firestore doc read.

**Layout:**
- Header: program color bar (same logic as `BookingDetailPage`) + back arrow to `/admin/scan`
- Status badge: Confirmed / Already Arrived / Cancelled
- Detail rows: School, Teacher, Program, Date & Time, Grade, Students, Access needs
- Primary CTA: "Mark as Arrived" button
  - Disabled if `status === 'arrived'` or `status === 'cancelled'`
  - On tap: writes `{ status: 'arrived', arrivedAt: serverTimestamp() }` to `bookings/{bookingId}`
  - Loading spinner during write
  - On success: status badge updates, button becomes "Arrived ✓" (disabled, green)
  - On error: toast/alert with retry

**Already-arrived state:** If booking already has `status === 'arrived'`, show `arrivedAt` timestamp ("Arrived at 09:42") and a disabled green badge — no action needed.

---

## Route Changes (`App.tsx`)

```tsx
import QRScanPage from './components/admin/QRScanPage'
import BookingVerifyPage from './components/admin/BookingVerifyPage'

// Inside AppRoutes:
<Route path="/admin/scan" element={
  <ProtectedRoute requireAdmin>
    <QRScanPage />
  </ProtectedRoute>
} />
<Route path="/admin/verify/:bookingId" element={
  <ProtectedRoute requireAdmin>
    <BookingVerifyPage />
  </ProtectedRoute>
} />
```

No `AppShell` wrapper on these admin routes — they are standalone full-screen views.

---

## Firestore Rules Change

Allow admins to update `status` and `arrivedAt` on any booking:

```
match /bookings/{bookingId} {
  // existing teacher rules ...

  allow update: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
    && request.resource.data.diff(resource.data).affectedKeys()
         .hasOnly(['status', 'arrivedAt', 'updatedAt']);
}
```

---

## Library

- **`qrcode`** (npm) — used only in `BookingQRCode.tsx`. No other QR library needed.
- **`BarcodeDetector`** — native browser API, no install.

---

## Files Touched

| File | Change |
|---|---|
| `src/shared/types/index.ts` | Add `'arrived'` to `BookingStatus`, add `arrivedAt?: Timestamp` to `Booking` |
| `src/stores/bookingStore.ts` | Add `confirmedBookingId: string \| null`, `setConfirmedBookingId()`, clear in `reset()` |
| `src/components/booking/BookingQRCode.tsx` | **New** — shared QR component |
| `src/components/booking/ConfirmedPage.tsx` | Swap fake QR + code for real ones |
| `src/components/pages/BookingDetailPage.tsx` | Add collapsible QR section |
| `src/components/admin/QRScanPage.tsx` | **New** — camera scan screen |
| `src/components/admin/BookingVerifyPage.tsx` | **New** — admin verification screen |
| `src/App.tsx` | Add `/admin/scan` and `/admin/verify/:bookingId` routes |
| `firestore.rules` | Add admin write permission for `status` + `arrivedAt` |

---

## Open Questions / Deferred

- Firestore rules: the admin write rule above assumes the existing rules file structure allows additive changes without breaking teacher rules — to be confirmed during implementation.
- `confirmedBookingId` in `bookingStore`: the exact place it gets set (inside `ReviewPage`'s confirm function) needs to be identified during implementation since the confirm logic lives there.
