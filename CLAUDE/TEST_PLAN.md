# Test Plan

## Authentication
- [ ] Teacher can sign up with email/password
- [ ] Teacher can sign in with Google
- [ ] Teacher can sign in via magic link
- [ ] Invalid credentials show a clear, plain-language error
- [ ] Logged-out users cannot access `/`, `/my-bookings`, `/profile`, `/admin*`

## Booking Flow (6 steps)
- [ ] Step 1 → 6 completes for Curiosity Cube
- [ ] Step 1 → 6 completes for Curiosity Lab
- [ ] Step 1 → 6 completes for Cube + Lab Combo, including order selection
- [ ] Step 1 → 6 completes for TOAD Truck, resulting in `pending` status
- [ ] Student count validation blocks > 30 for Cube/Lab/Combo
- [ ] Accessibility needs field is optional and saved correctly
- [ ] Booking flow total time is under 3 minutes in a manual timed run
- [ ] Confirmed bookings (Cube/Lab/Combo) appear instantly with status `confirmed`
- [ ] TOAD bookings appear with status `pending` and an approval deadline (+3 working days)
- [ ] Closing the modal mid-flow discards the draft (Zustand resets) without creating a Firestore document

## My Bookings
- [ ] Upcoming tab shows only future, non-cancelled bookings
- [ ] Past tab shows only past bookings
- [ ] Booking detail shows correct status, QR code, and program info
- [ ] Add-to-calendar produces a valid `.ics` / calendar link with correct date/time
- [ ] Cancel flow requires confirmation and updates status to `cancelled`
- [ ] A teacher cannot view or cancel another teacher's booking (authorization test)

## Pre-Visit Kit
- [ ] Readiness ring starts at 0% for a new booking
- [ ] Ring updates as each kit item (arrival info, parking, consent template, prep guide) is marked reviewed/downloaded
- [ ] Ring reaches 100% when all items are complete
- [ ] Consent template download works and is the correct file

## Profile
- [ ] Name/school edits persist
- [ ] Language toggle switches all UI strings EN ↔ DE immediately
- [ ] Theme toggle (light/dark/system) applies immediately and persists across reload
- [ ] Privacy settings save correctly
- [ ] FAQ, feedback form, Terms of Use, Privacy Policy pages render

## Notifications
- [ ] New booking status changes (e.g. TOAD approved) trigger an in-app notification
- [ ] Notification bell shows unread count
- [ ] Marking notifications as read clears the count

## QR Code (Teacher)
- [ ] Confirmed booking generates a valid QR code
- [ ] QR toggle on Home page hero card shows/hides the code
- [ ] QR payload is not a plain readable booking ID (verify it's a signed token)

## Admin Dashboard (`/admin`)
- [ ] Only accessible to `coordinator`/`admin` roles
- [ ] Today's bookings list sorted by time, then status
- [ ] Bookings are colour-coded by program correctly
- [ ] Status chips (confirmed/arrived/cancelled) render with correct colors
- [ ] A `user`-role account is correctly redirected/blocked from `/admin`

## QR Scanner (`/admin/scan`)
- [ ] Camera permission prompt appears and scanning works on a valid QR
- [ ] Scanning a valid QR marks the booking "Arrived" and reflects it on the dashboard immediately
- [ ] Scanning an invalid/expired QR shows a clear error, does not check in
- [ ] Manual booking ID fallback entry works and goes through the same verification path
- [ ] A `user`-role account cannot access this route directly by URL

## Verify Booking (`/admin/verify/:id`)
- [ ] Marks the specified booking "Arrived"
- [ ] Rejects the action for non-existent or already-cancelled bookings
- [ ] Restricted to `coordinator`/`admin` server-side, not just hidden client-side

## Responsive
Test all core flows at:
- [ ] 375px (mobile)
- [ ] 768px (tablet)
- [ ] 1440px (desktop)

## i18n
- [ ] Every screen in this plan is verified in both English and German
- [ ] No layout breakage from longer German strings (spot-check buttons, chips, step indicator)

## Accessibility
- [ ] All interactive elements are keyboard-navigable
- [ ] Visible focus rings throughout
- [ ] Color contrast meets WCAG AA on both light and dark themes
- [ ] `prefers-reduced-motion` disables countdown/progress-ring animation

## PWA / Offline
- [ ] App is installable (manifest + service worker present)
- [ ] Previously loaded bookings are viewable offline
- [ ] Booking creation/cancellation is disabled gracefully (clear messaging) when offline
