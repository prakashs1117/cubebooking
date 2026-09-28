# Curiosity Cube & Labs — School Booking Web App

Sep 28, 2026 · @Prakash

## At a glance

A mobile-first web app where German schools book Merck's Curiosity programs in Darmstadt, in under 3 minutes. Merck's program team controls the calendar, approves truck visits and reports impact from one admin console.

- **Two booking types, two flows:**
  - **Onsite STEM visit:** the class comes to Merck and books the Curiosity Cube, the Curiosity Lab, or both one after the other. Confirmed instantly.
  - **TOAD truck visit:** the truck comes to the school. The school requests a session and Merck approves it before it is confirmed.
- **Cube and Lab never overlap for one booking:** a combined visit takes two back-to-back sessions. A class that wants to split into two groups makes a second booking.
- **Admin-controlled calendar:** any weekday can be switched on or off, for example closing Tuesday, Wednesday and Friday.
- **Defaults, all configurable:** 45-minute sessions, up to 30 students, 0-minute break between Cube and Lab.
- **Built for Germany:** GDPR-compliant with data hosted in the EU, German first and English second, and no student personal data stored.
- **How it ships:** a self-contained module inside your existing React + Firebase app.

## Who uses it

Four roles, one login screen; the role decides what each person sees after sign-in.

| Role | Main job in the app | Signs in with |
| --- | --- | --- |
| Teacher | Book a session for a class, prepare, give feedback | Email magic link or Google / Microsoft |
| School coordinator | Approve teachers, see every booking for the school | Same, plus coordinator role |
| Merck program admin | Run tours, capacity, approvals, reports | Existing Merck SSO / Firebase Auth |
| Merck volunteer | See assigned sessions, check classes in on the day | Existing Merck SSO / Firebase Auth |

## Features

The MVP covers both booking types end to end and gives admins full control of the calendar. Everything in Later ships after the pilot without reworking the data model.

### Teachers and schools

| Feature | What it does | Release |
| --- | --- | --- |
| Choose a visit type | Onsite STEM visit or TOAD truck visit, each with its own flow | MVP |
| Onsite: pick programs | Curiosity Cube only, Curiosity Lab only, or both | MVP |
| Onsite: sequential calendar | For both, shows only start times where Cube and Lab are free back to back (Cube first or Lab first) | MVP |
| Split a class | A second group makes a second booking, which may run in parallel on the other program | MVP |
| Seat hold | The chosen sessions are held for 10 minutes during checkout | MVP |
| Class details | Grade, student count (up to 30 per session), accessibility needs | MVP |
| TOAD: request a visit | Pick an open truck session, give the school address and where the truck can park | MVP |
| Request status | TOAD requests show Pending, Approved or Declined, with an email at each change | MVP |
| My bookings | View, reschedule or cancel; add to Google or Outlook calendar (.ics) | MVP |
| Pre-visit kit | Arrival and parking instructions, what students will do, parent consent template | MVP |
| Reminders | Email at booking, 7 days and 1 day before | MVP |
| Waitlist | Join a full session; the next school is offered the seat when one frees | Later |
| Post-visit | 2-minute feedback form, class certificate, follow-up classroom activities | Later |

### Merck program team

| Feature | What it does | Release |
| --- | --- | --- |
| Weekday switches | Turn each weekday on or off per program, for example close Tuesday, Wednesday and Friday | MVP |
| Session settings | Session length (45 min), capacity (30), break between Cube and Lab (0 min), daily start times | MVP |
| Blackout dates | Block single dates or ranges for holidays, maintenance or events | MVP |
| TOAD approval queue | Approve or decline truck requests, with a reason; the school is emailed either way | MVP |
| TOAD service area | Darmstadt only for now; add cities later from the admin console | MVP |
| School approval | Approve new schools once; their teachers book freely after that | MVP |
| Booking console | Search, edit, move or cancel any booking; every change logged | MVP |
| Impact dashboard | Students reached, schools, fill rate, no-shows, by program and month; CSV export | MVP |
| Distance rules for TOAD | Limit truck visits by distance from Darmstadt | Later |
| Volunteer roster | Volunteers sign up for sessions; admins see gaps before the day | Later |
| QR check-in | Volunteer scans the booking QR on arrival to record attendance | Later |

## Booking journey

Both flows start from the same sign-in and visit-type choice, then split: onsite bookings confirm instantly, while TOAD requests wait for Merck's approval.

&#91;embedded content: teacher booking journey · 5 steps\]

**How a Cube + Lab visit is scheduled.** The second program starts when the first ends, plus the break. With today's settings (45-minute sessions, 0-minute break), a 09:00 visit books:

| Order | First session | Second session |
| --- | --- | --- |
| Cube first | Cube 09:00 to 09:45 | Lab 09:45 to 10:30 |
| Lab first | Lab 09:00 to 09:45 | Cube 09:45 to 10:30 |

- The time picker only offers start times where both sessions are free, on weekdays the admin has switched on.
- Both sessions confirm together or not at all, so a class is never left with half a visit.
- A second group from the same class makes a second booking, for example Lab first while the first group does Cube first.
- If the 10-minute seat hold runs out, the teacher picks a time again.
- A declined TOAD request is emailed with Merck's reason, and the school can request another session.

## Architecture

The booking module lives inside your existing app and Firebase project; the only new infrastructure is Firestore, a handful of Cloud Functions and an email sender.

&#91;embedded content: system architecture · 3 layers\]

Browsers subscribe to Firestore for live seat counts but cannot write to it; Cloud Functions do every write inside a transaction, so two schools can never take the same last seat.

- **Frontend:** a `features/curiosity/` folder with its own routes under `/curiosity/*`, Zustand stores and a Tailwind theme extension, so nothing collides with existing code. German and English text via i18next. Installable as a PWA for teachers on phones.
- **Auth:** reuse your Firebase Auth; add email magic link and Google / Microsoft sign-in for teachers. Roles live in custom claims (`teacher`, `coordinator`, `admin`, `volunteer`).
- **GDPR:** Firestore, Functions and backups in the EU region `europe-west3` (Frankfurt); a privacy notice and consent at sign-up; teachers can export or delete their data.
- **Security:** Firestore rules allow teachers to read only their school's bookings; App Check blocks scripted abuse of the booking functions.
- **Scheduled jobs:** release expired seat holds every minute, send reminders daily, alert admins to TOAD requests waiting more than 2 working days.

## Data model

Eight Firestore collections cover the MVP. Admin settings drive the calendar, so changing a weekday, duration or capacity needs no code change.

| Collection | One document per | Key fields |
| --- | --- | --- |
| `programs` | Cube, Lab, TOAD | name, type (onsite / outreach), sessionMinutes (45), capacity (30), openWeekdays, dailyStartTimes, needsApproval (TOAD only), serviceCities (Darmstadt) |
| `settings` | The whole app | breakBetweenMinutes (0), holdMinutes (10), booking window |
| `sessions` | Bookable slot | programId, start, end, capacity, seatsTaken, seatsHeld, status |
| `blackouts` | Closed date or range | programIds, from, to, reason |
| `schools` | School | name, address, city, status (pending / approved) |
| `users` | Person | role, schoolId, name, email, language |
| `bookings` | Class visit | type (onsite / toad), schoolId, teacherId, segments\[\] (sessionId, order), grade, studentCount, accessNeeds, truckParking, status |
| `auditLog` | Change | who, what, before, after, when |

- **Cube + Lab:** one booking with two ordered `segments[]`. The confirm function checks that the second session starts exactly when the first ends plus the break, then updates both in one transaction.
- **TOAD status:** pending, approved, declined, cancelled. Seats are held while pending so two schools cannot request the same truck session.
- **Weekday switches:** stored per program in `openWeekdays`, so the Cube and the truck can run on different days.
- **No student data:** only class-level counts and grade are stored.
- **Later:** `waitlist`, `feedback` and `volunteerShifts` add on without changing the collections above.

## Delivery plan

Four weeks of build and a one-week pilot, each phase ending in something a user can click through.

&#91;embedded content: delivery roadmap · 5 phases, 2 gates\]

The Later features in the tables above follow the pilot in two-week slices, ordered by what pilot teachers and admins ask for first.

## Success measures

The pilot passes if teachers book on their own and admins stop using spreadsheets.

| Measure | Pilot target |
| --- | --- |
| Time to complete a booking | Under 3 minutes |
| Double bookings | Zero |
| Sessions filled | At least 80% of seats |
| No-shows | Under 10% of bookings |
| Bookings needing admin help | Under 1 in 10 |
| Teacher feedback | 4 out of 5 or better |

## Open decisions

- [ ] TOAD session length, and how many truck sessions run per day.
- [ ] Daily start times for the Cube, the Lab and the truck.
- [ ] For Cube + Lab, may the teacher choose the order, or should Merck set it per day? The plan assumes the teacher chooses.
- [ ] Booking cap per school per term, if any.
- [ ] Email sender: Firebase Trigger Email extension or the Merck-approved provider.
- [ ] How long teacher contact data is kept, for the GDPR privacy notice.

## Sources

- [Curiosity Cube: About](https://thecuriositycube.com/about/)
- [Curiosity Cube 2025 tour and Curiosity Labs STEM Center in Darmstadt (Business Wire)](https://www.businesswire.com/news/home/20250424271266/en/Curiosity-Cube-2025-Mercks-Mobile-Science-Labs-Tour-Globally-to-Bring-STEM-Education-to-Students)
