# i18n — react-intl EN/DE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English/German localization to every screen using `react-intl`, driven by `profile.language` (persisted in Firestore), with a `LocaleContext` that also reads `localStorage` for pre-auth screens.

**Architecture:** A `LocaleContext` wraps the entire app (outside `AuthProvider`) and exposes `{ locale, setLocale }`. It hydrates from `localStorage` on first load, then syncs from `profile.language` once the user is authenticated. All UI strings are replaced with `intl.formatMessage({ id })` calls; date formatting uses `intl.formatDate()` instead of raw `date-fns` format strings.

**Tech Stack:** `react-intl` v7, TypeScript, React 19, Vite, Firebase Auth + Firestore (profile already has `language: 'de' | 'en'`)

**Spec:** Brainstorming conversation 2026-09-28 (no separate spec file — design was approved in chat)

## Global Constraints

- `react-intl` version: `^7.x` (install via `npm install react-intl`)
- Only two locales: `en` and `de`. No dynamic locale loading — both catalogs bundled.
- Message IDs use dot-notation namespacing: `auth.signIn.title`, `booking.programs.title`, etc.
- No JSX `<FormattedMessage>` components — use `intl.formatMessage()` hook exclusively (keeps JSX clean)
- `date-fns` stays for date arithmetic; `intl.formatDate()` replaces all `format()` display calls
- `localStorage` key for pre-auth locale: `'curiosity-locale'`
- Default locale: `'de'`
- The language toggle in `ProfilePage` already calls `updateProfile({ language })` — `LocaleContext` listens to `profile.language` and calls `setLocale` reactively
- No URL-based routing (`/de/...`) — context-level switch only

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Install | `package.json` | add `react-intl` dep |
| Create | `src/i18n/en.ts` | English message catalog (flat Record<string,string>) |
| Create | `src/i18n/de.ts` | German message catalog |
| Create | `src/i18n/index.ts` | exports `messages: Record<'en'\|'de', Record<string,string>>` |
| Create | `src/context/LocaleContext.tsx` | `LocaleProvider`, `useLocale()` hook |
| Modify | `src/main.tsx` | wrap tree with `<LocaleProvider><IntlProvider>` |
| Modify | `src/context/AuthContext.tsx` | call `setLocale(profile.language)` when profile loads |
| Modify | `src/components/auth/SignInPage.tsx` | replace strings; wire language toggle to `setLocale` |
| Modify | `src/components/auth/ForgotPasswordPage.tsx` | replace strings |
| Modify | `src/components/auth/AuthLayout.tsx` | replace subtitle string |
| Modify | `src/components/layout/AppShell.tsx` | replace nav labels + sidebar strings |
| Modify | `src/components/pages/HomePage.tsx` | replace all strings + greeting |
| Modify | `src/components/pages/BookingsPage.tsx` | replace tab labels + empty states |
| Modify | `src/components/pages/BookingDetailPage.tsx` | replace labels + status text + date |
| Modify | `src/components/pages/KitPage.tsx` | replace section titles + content strings |
| Modify | `src/components/pages/ProfilePage.tsx` | replace all labels; language toggle already wired |
| Modify | `src/components/booking/BookingLayout.tsx` | replace step counter label |
| Modify | `src/components/booking/BookPage.tsx` | replace visit-type card strings |
| Modify | `src/components/booking/BookProgramsPage.tsx` | replace program option strings |
| Modify | `src/components/booking/BookTimePage.tsx` | replace DOW_LABELS + UI strings + date display |
| Modify | `src/components/booking/BookDetailsPage.tsx` | replace all form labels + timer string |
| Modify | `src/components/booking/ReviewPage.tsx` | replace review row keys + confirm strings |
| Modify | `src/components/booking/ConfirmedPage.tsx` | replace hero text + action labels |

---

### Task 1: Install react-intl and create message catalogs

**Files:**
- Modify: `package.json`
- Create: `src/i18n/en.ts`
- Create: `src/i18n/de.ts`
- Create: `src/i18n/index.ts`

**Interfaces:**
- Produces: `messages` — `Record<'en' | 'de', Record<string, string>>` exported from `src/i18n/index.ts`
- Produces: locale type alias `export type Locale = 'en' | 'de'`

- [ ] **Step 1: Install react-intl**

```bash
npm install react-intl
```

Expected: `react-intl` appears in `package.json` dependencies.

- [ ] **Step 2: Create `src/i18n/en.ts`**

```typescript
const en: Record<string, string> = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  'auth.tagline': 'Curiosity Cube · Labs · TOAD',
  'auth.hero.title': 'Book a STEM\nexperience',
  'auth.hero.sub': 'Schools in the Darmstadt area can book the Curiosity Cube, Lab, or TOAD truck in under 3 minutes.',
  'auth.signIn.emailLabel': 'Email',
  'auth.signIn.emailPlaceholder': 'you@school.de',
  'auth.signIn.passwordLabel': 'Password',
  'auth.signIn.passwordPlaceholder': 'Your password',
  'auth.signIn.forgotPassword': 'Forgot?',
  'auth.signIn.submit': 'Sign in',
  'auth.signIn.submitMagic': 'Send sign-in link',
  'auth.signIn.switchToMagic': 'Sign in with magic link instead',
  'auth.signIn.switchToPassword': 'Use password instead',
  'auth.signIn.google': 'Continue with Google',
  'auth.signIn.gdpr': 'All data hosted in the EU · GDPR compliant',
  'auth.magicSent.title': 'Check your inbox',
  'auth.magicSent.body': 'We sent a sign-in link to {email}. Click it to continue — no password needed.',
  'auth.magicSent.different': 'Use a different address',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
  // ── Forgot password ────────────────────────────────────────────────────────
  'forgot.title': 'Reset password',
  'forgot.subtitle': "We'll email you a link to choose a new one.",
  'forgot.emailLabel': 'Email',
  'forgot.submit': 'Send reset link',
  'forgot.sent': 'If an account exists for {email}, a reset link is on its way. Check your inbox and spam folder.',
  'forgot.backToSignIn': 'Back to sign in',
  // ── App shell / nav ────────────────────────────────────────────────────────
  'nav.home': 'Home',
  'nav.bookings': 'Bookings',
  'nav.kit': 'Kit',
  'nav.profile': 'Profile',
  'nav.book': 'Book a visit',
  'nav.bookShort': 'Book',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close',
  'nav.signOut': 'Sign out',
  'nav.schoolApproved': 'School approved',
  // ── Home ──────────────────────────────────────────────────────────────────
  'home.greeting.morning': 'Good morning',
  'home.greeting.afternoon': 'Good afternoon',
  'home.greeting.evening': 'Good evening',
  'home.nextVisit.label': 'Your next visit',
  'home.nextVisit.confirmed': '✓ Confirmed',
  'home.nextVisit.bookNow': '→ Book now',
  'home.nextVisit.none': 'No upcoming visits yet',
  'home.nextVisit.bookFirst': 'Book your first session',
  'home.bookSection': 'Book a visit',
  'home.card.onsite.label': 'Onsite STEM Visit',
  'home.card.onsite.desc': 'Book the Curiosity Cube, Lab, or both for your class at Merck in Darmstadt.',
  'home.card.onsite.tag': 'Confirmed instantly',
  'home.card.toad.label': 'TOAD Truck Visit',
  'home.card.toad.desc': 'Request the mobile TOAD lab to come directly to your school.',
  'home.card.toad.tag': 'Subject to approval',
  'home.card.bookNow': 'Book now',
  // ── Bookings list ─────────────────────────────────────────────────────────
  'bookings.title': 'My bookings',
  'bookings.tab.upcoming': 'Upcoming · {count}',
  'bookings.tab.past': 'Past',
  'bookings.empty.upcoming': 'No upcoming bookings',
  'bookings.empty.upcoming.sub': 'Book a Cube, Lab, or TOAD visit for your class.',
  'bookings.empty.past': 'No past bookings yet',
  'bookings.empty.past.sub': 'Your completed visits will appear here.',
  'bookings.cta.book': 'Book a visit',
  'bookings.status.confirmed': 'Confirmed',
  'bookings.status.pending': 'Pending',
  'bookings.status.cancelled': 'Cancelled',
  // ── Booking detail ────────────────────────────────────────────────────────
  'bookingDetail.loading': 'Loading…',
  'bookingDetail.notFound': 'Booking not found.',
  'bookingDetail.backToBookings': 'Back to bookings',
  'bookingDetail.status.confirmed': 'Confirmed',
  'bookingDetail.status.pending': 'Pending approval',
  'bookingDetail.status.cancelled': 'Cancelled',
  'bookingDetail.row.dateTime': 'Date & time',
  'bookingDetail.row.location': 'Location',
  'bookingDetail.row.grade': 'Grade',
  'bookingDetail.row.students': 'Students',
  'bookingDetail.row.access': 'Access needs',
  'bookingDetail.location.value': 'Merck KGaA, Frankfurter Str. 250, Darmstadt',
  'bookingDetail.grade.value': 'Grade {grade}',
  'bookingDetail.students.value': '{count} students',
  'bookingDetail.addToCalendar': 'Add to calendar',
  'bookingDetail.cancel': 'Cancel booking',
  // ── Pre-visit kit ─────────────────────────────────────────────────────────
  'kit.title': 'Pre-visit kit',
  'kit.progress.label': 'Kit ready',
  'kit.progress.almostThere': 'Almost there!',
  'kit.progress.noVisit': 'No upcoming visits',
  'kit.progress.review': 'Review all sections before your visit.',
  'kit.progress.bookFirst': 'Book a visit to unlock the full kit.',
  'kit.download': 'Download full kit (PDF)',
  'kit.section.arrival.title': 'Arrival & parking',
  'kit.section.programme.title': 'What students will do',
  'kit.section.consent.title': 'Parent consent template',
  'kit.section.students.title': 'Preparing your class',
  // ── Profile ───────────────────────────────────────────────────────────────
  'profile.title': 'Profile',
  'profile.field.name': 'Name',
  'profile.field.email': 'Email',
  'profile.field.school': 'School',
  'profile.field.name.placeholder': 'Your name',
  'profile.field.school.placeholder': 'Your school name',
  'profile.field.name.edit': 'Edit Name',
  'profile.field.school.edit': 'Edit School',
  'profile.language': 'Language',
  'profile.theme': 'Theme',
  'profile.privacy.title': 'Privacy & security',
  'profile.privacy.gdpr': 'Data stored in EU (Frankfurt)',
  'profile.privacy.changePassword': 'Change password',
  'profile.privacy.passwordSent': 'Reset link sent ✓',
  'profile.privacy.exportData': 'Export my data',
  'profile.privacy.deleteAccount': 'Delete my account',
  'profile.signOut': 'Sign out',
  'profile.footer': 'Curiosity Booking · Merck KGaA, Darmstadt · No student data stored',
  // ── Booking layout ────────────────────────────────────────────────────────
  'bookingLayout.back': 'Back',
  'bookingLayout.close': 'Close',
  'bookingLayout.stepOf': '{step} / {total}',
  'bookingLayout.continue': 'Continue',
  // ── Book — visit type ─────────────────────────────────────────────────────
  'book.title': 'Book a visit',
  'book.heading': 'How would you like to visit?',
  'book.sub': 'Choose where the science happens.',
  'book.type.onsite.label': 'Onsite STEM visit',
  'book.type.onsite.sub': 'Your class visits Merck in Darmstadt',
  'book.type.onsite.tag': 'Confirmed instantly',
  'book.type.toad.label': 'TOAD truck visit',
  'book.type.toad.sub': 'The mobile lab comes to your school',
  'book.type.toad.tag': 'Subject to approval',
  // ── Book — programs ───────────────────────────────────────────────────────
  'bookPrograms.title': 'Onsite STEM visit',
  'bookPrograms.heading': 'Choose your programs',
  'bookPrograms.cube.title': 'Curiosity Cube',
  'bookPrograms.cube.sub': '45 min · hands-on science exhibits',
  'bookPrograms.lab.title': 'Curiosity Lab',
  'bookPrograms.lab.sub': '45 min · guided lab experiments',
  'bookPrograms.both.title': 'Cube + Lab',
  'bookPrograms.both.sub': '90 min total · two back-to-back sessions',
  'bookPrograms.order.heading': 'Which order?',
  'bookPrograms.order.sub': 'The second session starts right when the first ends.',
  'bookPrograms.order.cubeFirst.label': 'Cube first, then Lab',
  'bookPrograms.order.labFirst.label': 'Lab first, then Cube',
  // ── Book — time ───────────────────────────────────────────────────────────
  'bookTime.title': 'Choose time',
  'bookTime.dow.mon': 'Mon',
  'bookTime.dow.tue': 'Tue',
  'bookTime.dow.wed': 'Wed',
  'bookTime.dow.thu': 'Thu',
  'bookTime.dow.fri': 'Fri',
  'bookTime.noSlots': 'No available slots this week.',
  'bookTime.selectDate': 'Select a date to see available times.',
  'bookTime.seatsLeft': '{count} left',
  'bookTime.full': 'Full',
  // ── Book — details ────────────────────────────────────────────────────────
  'bookDetails.title': 'Class details',
  'bookDetails.heading': 'Tell us about your class',
  'bookDetails.timer.held': 'Your sessions are held',
  'bookDetails.grade.label': 'Grade',
  'bookDetails.grade.option': 'Grade {grade}',
  'bookDetails.students.label': 'Number of students',
  'bookDetails.students.max': 'max {max}',
  'bookDetails.students.add': 'Add student',
  'bookDetails.students.remove': 'Remove student',
  'bookDetails.access.label': 'Accessibility or mobility needs',
  'bookDetails.access.optional': '(optional)',
  'bookDetails.access.placeholder': 'e.g. wheelchair access needed, hearing loop required…',
  // ── Review ────────────────────────────────────────────────────────────────
  'review.title': 'Review',
  'review.heading': 'Check and confirm',
  'review.type': 'Onsite STEM visit',
  'review.row.date': 'Date',
  'review.row.time': 'Time',
  'review.row.grade': 'Grade',
  'review.row.students': 'Students',
  'review.row.access': 'Access needs',
  'review.row.edit': 'Edit',
  'review.privacy': 'No personal student data is stored — only class grade and count. Data is hosted in the EU and processed under GDPR.',
  'review.confirm': 'Confirm booking',
  'review.error': 'Could not confirm your booking. Please try again.',
  // ── Confirmed ─────────────────────────────────────────────────────────────
  'confirmed.heading': "You're booked!",
  'confirmed.sub': '{programTitle} for class {grade}\n{date} · {time}',
  'confirmed.code.label': 'Booking code',
  'confirmed.code.sub': 'Show this on arrival',
  'confirmed.addCalendar': 'Add to calendar',
  'confirmed.backHome': 'Back to home',
  // ── Program labels (shared) ───────────────────────────────────────────────
  'program.cube': 'Curiosity Cube',
  'program.lab': 'Curiosity Lab',
  'program.toad': 'TOAD Truck',
  'program.both': 'Cube + Lab',
}

export default en
```

- [ ] **Step 3: Create `src/i18n/de.ts`**

```typescript
const de: Record<string, string> = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  'auth.tagline': 'Curiosity Cube · Labs · TOAD',
  'auth.hero.title': 'MINT-Erlebnis\nbuchen',
  'auth.hero.sub': 'Schulen im Raum Darmstadt können den Curiosity Cube, das Labor oder den TOAD-Truck in unter 3 Minuten buchen.',
  'auth.signIn.emailLabel': 'E-Mail',
  'auth.signIn.emailPlaceholder': 'sie@schule.de',
  'auth.signIn.passwordLabel': 'Passwort',
  'auth.signIn.passwordPlaceholder': 'Ihr Passwort',
  'auth.signIn.forgotPassword': 'Vergessen?',
  'auth.signIn.submit': 'Anmelden',
  'auth.signIn.submitMagic': 'Magic-Link senden',
  'auth.signIn.switchToMagic': 'Stattdessen mit Magic-Link anmelden',
  'auth.signIn.switchToPassword': 'Passwort verwenden',
  'auth.signIn.google': 'Mit Google fortfahren',
  'auth.signIn.gdpr': 'Alle Daten in der EU gehostet · DSGVO-konform',
  'auth.magicSent.title': 'Posteingang prüfen',
  'auth.magicSent.body': 'Wir haben einen Anmeldelink an {email} gesendet. Klicken Sie darauf, um fortzufahren — kein Passwort erforderlich.',
  'auth.magicSent.different': 'Andere Adresse verwenden',
  'auth.showPassword': 'Passwort anzeigen',
  'auth.hidePassword': 'Passwort ausblenden',
  // ── Forgot password ────────────────────────────────────────────────────────
  'forgot.title': 'Passwort zurücksetzen',
  'forgot.subtitle': 'Wir senden Ihnen einen Link zum Festlegen eines neuen Passworts.',
  'forgot.emailLabel': 'E-Mail',
  'forgot.submit': 'Link senden',
  'forgot.sent': 'Falls ein Konto für {email} existiert, ist ein Link unterwegs. Prüfen Sie Posteingang und Spam.',
  'forgot.backToSignIn': 'Zurück zur Anmeldung',
  // ── App shell / nav ────────────────────────────────────────────────────────
  'nav.home': 'Start',
  'nav.bookings': 'Buchungen',
  'nav.kit': 'Materialien',
  'nav.profile': 'Profil',
  'nav.book': 'Besuch buchen',
  'nav.bookShort': 'Buchen',
  'nav.openMenu': 'Menü öffnen',
  'nav.closeMenu': 'Schließen',
  'nav.signOut': 'Abmelden',
  'nav.schoolApproved': 'Schule freigegeben',
  // ── Home ──────────────────────────────────────────────────────────────────
  'home.greeting.morning': 'Guten Morgen',
  'home.greeting.afternoon': 'Guten Tag',
  'home.greeting.evening': 'Guten Abend',
  'home.nextVisit.label': 'Ihr nächster Besuch',
  'home.nextVisit.confirmed': '✓ Bestätigt',
  'home.nextVisit.bookNow': '→ Jetzt buchen',
  'home.nextVisit.none': 'Noch keine bevorstehenden Besuche',
  'home.nextVisit.bookFirst': 'Erste Session buchen',
  'home.bookSection': 'Besuch buchen',
  'home.card.onsite.label': 'Besuch vor Ort',
  'home.card.onsite.desc': 'Buchen Sie den Curiosity Cube, das Labor oder beides für Ihre Klasse bei Merck in Darmstadt.',
  'home.card.onsite.tag': 'Sofort bestätigt',
  'home.card.toad.label': 'TOAD-Truck-Besuch',
  'home.card.toad.desc': 'Das mobile TOAD-Labor kommt direkt zu Ihrer Schule.',
  'home.card.toad.tag': 'Genehmigung erforderlich',
  'home.card.bookNow': 'Jetzt buchen',
  // ── Bookings list ─────────────────────────────────────────────────────────
  'bookings.title': 'Meine Buchungen',
  'bookings.tab.upcoming': 'Bevorstehend · {count}',
  'bookings.tab.past': 'Vergangen',
  'bookings.empty.upcoming': 'Keine bevorstehenden Buchungen',
  'bookings.empty.upcoming.sub': 'Buchen Sie einen Cube-, Labor- oder TOAD-Besuch für Ihre Klasse.',
  'bookings.empty.past': 'Noch keine vergangenen Buchungen',
  'bookings.empty.past.sub': 'Ihre abgeschlossenen Besuche erscheinen hier.',
  'bookings.cta.book': 'Besuch buchen',
  'bookings.status.confirmed': 'Bestätigt',
  'bookings.status.pending': 'Ausstehend',
  'bookings.status.cancelled': 'Storniert',
  // ── Booking detail ────────────────────────────────────────────────────────
  'bookingDetail.loading': 'Wird geladen…',
  'bookingDetail.notFound': 'Buchung nicht gefunden.',
  'bookingDetail.backToBookings': 'Zurück zu Buchungen',
  'bookingDetail.status.confirmed': 'Bestätigt',
  'bookingDetail.status.pending': 'Genehmigung ausstehend',
  'bookingDetail.status.cancelled': 'Storniert',
  'bookingDetail.row.dateTime': 'Datum & Uhrzeit',
  'bookingDetail.row.location': 'Ort',
  'bookingDetail.row.grade': 'Klasse',
  'bookingDetail.row.students': 'Schüler',
  'bookingDetail.row.access': 'Barrierefreiheit',
  'bookingDetail.location.value': 'Merck KGaA, Frankfurter Str. 250, Darmstadt',
  'bookingDetail.grade.value': 'Klasse {grade}',
  'bookingDetail.students.value': '{count} Schüler',
  'bookingDetail.addToCalendar': 'Zum Kalender hinzufügen',
  'bookingDetail.cancel': 'Buchung stornieren',
  // ── Pre-visit kit ─────────────────────────────────────────────────────────
  'kit.title': 'Vor-Besuch-Materialien',
  'kit.progress.label': 'Kit bereit',
  'kit.progress.almostThere': 'Fast geschafft!',
  'kit.progress.noVisit': 'Keine bevorstehenden Besuche',
  'kit.progress.review': 'Alle Abschnitte vor dem Besuch durchsehen.',
  'kit.progress.bookFirst': 'Buchen Sie einen Besuch, um das vollständige Kit freizuschalten.',
  'kit.download': 'Vollständiges Kit herunterladen (PDF)',
  'kit.section.arrival.title': 'Ankunft & Parken',
  'kit.section.programme.title': 'Was die Schüler erleben',
  'kit.section.consent.title': 'Einwilligungsvorlage für Eltern',
  'kit.section.students.title': 'Ihre Klasse vorbereiten',
  // ── Profile ───────────────────────────────────────────────────────────────
  'profile.title': 'Profil',
  'profile.field.name': 'Name',
  'profile.field.email': 'E-Mail',
  'profile.field.school': 'Schule',
  'profile.field.name.placeholder': 'Ihr Name',
  'profile.field.school.placeholder': 'Name Ihrer Schule',
  'profile.field.name.edit': 'Name bearbeiten',
  'profile.field.school.edit': 'Schule bearbeiten',
  'profile.language': 'Sprache',
  'profile.theme': 'Design',
  'profile.privacy.title': 'Datenschutz & Sicherheit',
  'profile.privacy.gdpr': 'Daten in der EU gespeichert (Frankfurt)',
  'profile.privacy.changePassword': 'Passwort ändern',
  'profile.privacy.passwordSent': 'Reset-Link gesendet ✓',
  'profile.privacy.exportData': 'Meine Daten exportieren',
  'profile.privacy.deleteAccount': 'Konto löschen',
  'profile.signOut': 'Abmelden',
  'profile.footer': 'Curiosity Booking · Merck KGaA, Darmstadt · Keine Schülerdaten gespeichert',
  // ── Booking layout ────────────────────────────────────────────────────────
  'bookingLayout.back': 'Zurück',
  'bookingLayout.close': 'Schließen',
  'bookingLayout.stepOf': '{step} / {total}',
  'bookingLayout.continue': 'Weiter',
  // ── Book — visit type ─────────────────────────────────────────────────────
  'book.title': 'Besuch buchen',
  'book.heading': 'Wie möchten Sie uns besuchen?',
  'book.sub': 'Wählen Sie, wo die Wissenschaft stattfindet.',
  'book.type.onsite.label': 'Besuch vor Ort',
  'book.type.onsite.sub': 'Ihre Klasse besucht Merck in Darmstadt',
  'book.type.onsite.tag': 'Sofort bestätigt',
  'book.type.toad.label': 'TOAD-Truck-Besuch',
  'book.type.toad.sub': 'Das mobile Labor kommt zu Ihrer Schule',
  'book.type.toad.tag': 'Genehmigung erforderlich',
  // ── Book — programs ───────────────────────────────────────────────────────
  'bookPrograms.title': 'Besuch vor Ort',
  'bookPrograms.heading': 'Programme auswählen',
  'bookPrograms.cube.title': 'Curiosity Cube',
  'bookPrograms.cube.sub': '45 Min. · interaktive Wissenschaftsausstellung',
  'bookPrograms.lab.title': 'Curiosity Lab',
  'bookPrograms.lab.sub': '45 Min. · geführte Laborexperimente',
  'bookPrograms.both.title': 'Cube + Lab',
  'bookPrograms.both.sub': '90 Min. gesamt · zwei aufeinanderfolgende Sessions',
  'bookPrograms.order.heading': 'Welche Reihenfolge?',
  'bookPrograms.order.sub': 'Die zweite Session beginnt direkt nach Ende der ersten.',
  'bookPrograms.order.cubeFirst.label': 'Erst Cube, dann Lab',
  'bookPrograms.order.labFirst.label': 'Erst Lab, dann Cube',
  // ── Book — time ───────────────────────────────────────────────────────────
  'bookTime.title': 'Zeit wählen',
  'bookTime.dow.mon': 'Mo',
  'bookTime.dow.tue': 'Di',
  'bookTime.dow.wed': 'Mi',
  'bookTime.dow.thu': 'Do',
  'bookTime.dow.fri': 'Fr',
  'bookTime.noSlots': 'Keine verfügbaren Termine diese Woche.',
  'bookTime.selectDate': 'Datum auswählen, um verfügbare Zeiten zu sehen.',
  'bookTime.seatsLeft': 'Noch {count}',
  'bookTime.full': 'Ausgebucht',
  // ── Book — details ────────────────────────────────────────────────────────
  'bookDetails.title': 'Klassendetails',
  'bookDetails.heading': 'Erzählen Sie uns von Ihrer Klasse',
  'bookDetails.timer.held': 'Ihre Sessions sind reserviert',
  'bookDetails.grade.label': 'Klasse',
  'bookDetails.grade.option': 'Klasse {grade}',
  'bookDetails.students.label': 'Anzahl der Schüler',
  'bookDetails.students.max': 'max. {max}',
  'bookDetails.students.add': 'Schüler hinzufügen',
  'bookDetails.students.remove': 'Schüler entfernen',
  'bookDetails.access.label': 'Barriere- oder Mobilitätsbedürfnisse',
  'bookDetails.access.optional': '(optional)',
  'bookDetails.access.placeholder': 'z.B. Rollstuhlzugang erforderlich, Hörschleife benötigt…',
  // ── Review ────────────────────────────────────────────────────────────────
  'review.title': 'Überprüfen',
  'review.heading': 'Prüfen und bestätigen',
  'review.type': 'Besuch vor Ort',
  'review.row.date': 'Datum',
  'review.row.time': 'Uhrzeit',
  'review.row.grade': 'Klasse',
  'review.row.students': 'Schüler',
  'review.row.access': 'Barrierefreiheit',
  'review.row.edit': 'Bearbeiten',
  'review.privacy': 'Es werden keine persönlichen Schülerdaten gespeichert — nur Klassenstufe und Anzahl. Daten werden in der EU unter der DSGVO verarbeitet.',
  'review.confirm': 'Buchung bestätigen',
  'review.error': 'Buchung konnte nicht bestätigt werden. Bitte erneut versuchen.',
  // ── Confirmed ─────────────────────────────────────────────────────────────
  'confirmed.heading': 'Gebucht!',
  'confirmed.sub': '{programTitle} für Klasse {grade}\n{date} · {time}',
  'confirmed.code.label': 'Buchungscode',
  'confirmed.code.sub': 'Bei der Ankunft vorzeigen',
  'confirmed.addCalendar': 'Zum Kalender hinzufügen',
  'confirmed.backHome': 'Zur Startseite',
  // ── Program labels (shared) ───────────────────────────────────────────────
  'program.cube': 'Curiosity Cube',
  'program.lab': 'Curiosity Lab',
  'program.toad': 'TOAD-Truck',
  'program.both': 'Cube + Lab',
}

export default de
```

- [ ] **Step 4: Create `src/i18n/index.ts`**

```typescript
import en from './en'
import de from './de'

export type Locale = 'en' | 'de'

export const messages: Record<Locale, Record<string, string>> = { en, de }
```

- [ ] **Step 5: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ package.json package-lock.json
git commit -m "feat(i18n): install react-intl and add EN/DE message catalogs"
```

---

### Task 2: LocaleContext + IntlProvider wiring

**Files:**
- Create: `src/context/LocaleContext.tsx`
- Modify: `src/main.tsx`
- Modify: `src/context/AuthContext.tsx`

**Interfaces:**
- Consumes: `messages`, `Locale` from `src/i18n/index.ts`
- Produces:
  - `useLocale(): { locale: Locale; setLocale: (l: Locale) => void }` — exported from `LocaleContext.tsx`
  - `LocaleProvider` — React component, wraps children, exported default

- [ ] **Step 1: Create `src/context/LocaleContext.tsx`**

```typescript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { messages, type Locale } from '../i18n'

const STORAGE_KEY = 'curiosity-locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'de') return stored
    } catch { /* noop */ }
    return 'de'
  })

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* noop */ }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        defaultLocale="de"
        onError={() => { /* suppress missing-translation warnings in prod */ }}
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  )
}
```

- [ ] **Step 2: Modify `src/main.tsx` — wrap with LocaleProvider**

Replace the current render call:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import LocaleProvider from './context/LocaleContext.tsx'

// Apply stored theme immediately before first paint to avoid flash
;(() => {
  try {
    const stored = localStorage.getItem('curiosity-theme') ?? 'system'
    const resolved = stored === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : stored
    document.documentElement.setAttribute('data-theme', resolved)
  } catch { /* noop */ }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 3: Modify `src/context/AuthContext.tsx` — sync locale when profile loads**

Add the import at the top of `AuthContext.tsx`:

```typescript
import { useEffect } from 'react'  // already imported — skip if present
import { useLocale } from './LocaleContext'
```

Inside `AuthProvider`, after the existing state declarations, add a `useEffect` that syncs the locale whenever `profile.language` changes:

```typescript
// Inside AuthProvider function body, after `const [profile, setProfile] = useState...`
const { setLocale } = useLocale()

useEffect(() => {
  if (profile?.language) setLocale(profile.language)
}, [profile?.language, setLocale])
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual smoke test**

Start the dev server (`npm run dev`), open the app, open browser DevTools → Application → Local Storage → set `curiosity-locale` to `en`, reload. The app should not crash (strings will still be in English until components are wired in Task 3+, but no runtime errors).

- [ ] **Step 6: Commit**

```bash
git add src/context/LocaleContext.tsx src/main.tsx src/context/AuthContext.tsx
git commit -m "feat(i18n): add LocaleContext, IntlProvider, and profile→locale sync"
```

---

### Task 3: Wire auth screens (SignInPage, ForgotPasswordPage, AuthLayout)

**Files:**
- Modify: `src/components/auth/SignInPage.tsx`
- Modify: `src/components/auth/ForgotPasswordPage.tsx`
- Modify: `src/components/auth/AuthLayout.tsx`

**Interfaces:**
- Consumes: `useIntl` from `react-intl`; `useLocale` from `src/context/LocaleContext`

The language toggle in `SignInPage` currently sets local `useState` only. It must also call `setLocale` from `useLocale()` so the switch takes effect before the user is authenticated.

- [ ] **Step 1: Modify `src/components/auth/SignInPage.tsx`**

Add imports:
```typescript
import { useIntl } from 'react-intl'
import { useLocale } from '../../context/LocaleContext'
```

Inside the component, add:
```typescript
const intl = useIntl()
const { locale, setLocale } = useLocale()
```

Remove the existing `const [language, setLanguage] = useState<Mode>('password')` language state (keep `mode` state). The active language is now `locale` from context.

Replace the language toggle buttons:
```tsx
{(['de', 'en'] as const).map((lang) => (
  <button
    key={lang}
    type="button"
    onClick={() => setLocale(lang)}
    className="tap px-3 py-1 rounded-full text-xs font-bold transition-colors"
    style={lang === locale
      ? { background: 'rgba(255,255,255,0.92)', color: 'var(--brand-purple)' }
      : { background: 'transparent', color: 'rgba(255,255,255,0.7)' }}
  >
    {lang.toUpperCase()}
  </button>
))}
```

Replace hero text block:
```tsx
<div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-mint)', letterSpacing: '0.14em' }}>
  {intl.formatMessage({ id: 'auth.tagline' })}
</div>
<h1 className="m-0 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
  {intl.formatMessage({ id: 'auth.hero.title' }).split('\n').map((line, i) => (
    <span key={i}>{line}{i === 0 && <br />}</span>
  ))}
</h1>
<p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 280 }}>
  {intl.formatMessage({ id: 'auth.hero.sub' })}
</p>
```

Replace form labels and buttons:
```tsx
// Email label
{intl.formatMessage({ id: 'auth.signIn.emailLabel' })}
// Email placeholder
placeholder={intl.formatMessage({ id: 'auth.signIn.emailPlaceholder' })}
// Password label
{intl.formatMessage({ id: 'auth.signIn.passwordLabel' })}
// Password placeholder
placeholder={intl.formatMessage({ id: 'auth.signIn.passwordPlaceholder' })}
// Forgot
{intl.formatMessage({ id: 'auth.signIn.forgotPassword' })}
// Submit button text
{mode === 'magic-link'
  ? intl.formatMessage({ id: 'auth.signIn.submitMagic' })
  : intl.formatMessage({ id: 'auth.signIn.submit' })}
// Toggle mode button
{mode === 'password'
  ? intl.formatMessage({ id: 'auth.signIn.switchToMagic' })
  : intl.formatMessage({ id: 'auth.signIn.switchToPassword' })}
// Google button label prop
label={intl.formatMessage({ id: 'auth.signIn.google' })}
// GDPR footer
{intl.formatMessage({ id: 'auth.signIn.gdpr' })}
// Magic-sent title
{intl.formatMessage({ id: 'auth.magicSent.title' })}
// Magic-sent body
{intl.formatMessage({ id: 'auth.magicSent.body' }, { email: <strong>{email.trim()}</strong> })}
// Magic-sent different address
{intl.formatMessage({ id: 'auth.magicSent.different' })}
// Show/hide password aria-label
aria-label={showPassword
  ? intl.formatMessage({ id: 'auth.hidePassword' })
  : intl.formatMessage({ id: 'auth.showPassword' })}
```

- [ ] **Step 2: Modify `src/components/auth/ForgotPasswordPage.tsx`**

Add imports:
```typescript
import { useIntl } from 'react-intl'
```

Inside component:
```typescript
const intl = useIntl()
```

Replace strings:
```tsx
// Page title
{intl.formatMessage({ id: 'forgot.title' })}
// Subtitle
{intl.formatMessage({ id: 'forgot.subtitle' })}
// Email label
{intl.formatMessage({ id: 'forgot.emailLabel' })}
// Submit button
{intl.formatMessage({ id: 'forgot.submit' })}
// Sent message
{intl.formatMessage({ id: 'forgot.sent' }, { email: <strong style={{ color: 'var(--foreground)' }}>{email.trim()}</strong> })}
// Back to sign in link
{intl.formatMessage({ id: 'forgot.backToSignIn' })}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Manual test**

Open `/signin`. Toggle language between DE and EN. Confirm all visible strings switch language. Open `/forgot-password`. Confirm strings are translated.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/
git commit -m "feat(i18n): localize auth screens"
```

---

### Task 4: Wire AppShell navigation

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `useIntl` from `react-intl`

The `NAV` array is defined as a module-level constant. It must become a function that returns translated items so it re-renders with the current locale.

- [ ] **Step 1: Modify `src/components/layout/AppShell.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Replace the module-level `NAV` constant with a hook:
```typescript
function useNav() {
  const intl = useIntl()
  return [
    { label: intl.formatMessage({ id: 'nav.home' }),     href: '/home',     icon: Home },
    { label: intl.formatMessage({ id: 'nav.bookings' }), href: '/bookings', icon: CalendarCheck },
    { label: intl.formatMessage({ id: 'nav.kit' }),      href: '/kit',      icon: Package },
    { label: intl.formatMessage({ id: 'nav.profile' }),  href: '/profile',  icon: User },
  ]
}
```

In `Sidebar`, `TabletTopNav`, and `MobileTabBar` — replace `NAV` with `const nav = useNav()` and update all `.map((item)` references to iterate over `nav`.

Replace other strings in `Sidebar`:
```tsx
// "Book a visit" link text
{intl.formatMessage({ id: 'nav.book' })}
// "Sign out" button
{intl.formatMessage({ id: 'nav.signOut' })}
// "School approved" badge
{intl.formatMessage({ id: 'nav.schoolApproved' })}
// Close button aria-label
aria-label={intl.formatMessage({ id: 'nav.closeMenu' })}
```

In `TabletTopNav`:
```tsx
// "Book" link
{intl.formatMessage({ id: 'nav.bookShort' })}
```

In `MobileTopBar`:
```tsx
// Open menu aria-label
aria-label={intl.formatMessage({ id: 'nav.openMenu' })}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Manual test**

Switch locale via DevTools localStorage. Confirm nav labels switch between EN and DE at all breakpoints (mobile bottom bar, tablet top nav, desktop sidebar).

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "feat(i18n): localize AppShell navigation"
```

---

### Task 5: Wire HomePage and BookingsPage

**Files:**
- Modify: `src/components/pages/HomePage.tsx`
- Modify: `src/components/pages/BookingsPage.tsx`

**Interfaces:**
- Consumes: `useIntl` from `react-intl`

- [ ] **Step 1: Modify `src/components/pages/HomePage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside `GreetingByTime`, return translated greeting based on time:
```typescript
function GreetingByTime() {
  const intl = useIntl()
  const hour = new Date().getHours()
  if (hour < 12) return <>{intl.formatMessage({ id: 'home.greeting.morning' })}</>
  if (hour < 18) return <>{intl.formatMessage({ id: 'home.greeting.afternoon' })}</>
  return <>{intl.formatMessage({ id: 'home.greeting.evening' })}</>
}
```

Replace `PROGRAM_CARDS` constant with a hook so descriptions are reactive:
```typescript
function useProgramCards() {
  const intl = useIntl()
  return [
    {
      id: 'onsite',
      label: intl.formatMessage({ id: 'home.card.onsite.label' }),
      description: intl.formatMessage({ id: 'home.card.onsite.desc' }),
      tag: intl.formatMessage({ id: 'home.card.onsite.tag' }),
      accent: 'var(--cube)',
      tint: 'var(--tint-purple)',
      href: '/book',
      icons: ['🔬', '⚗️'],
      tagColor: 'var(--brand-green)',
      tagBg: 'rgba(1,136,76,0.1)',
    },
    {
      id: 'toad',
      label: intl.formatMessage({ id: 'home.card.toad.label' }),
      description: intl.formatMessage({ id: 'home.card.toad.desc' }),
      tag: intl.formatMessage({ id: 'home.card.toad.tag' }),
      accent: 'var(--toad)',
      tint: 'var(--tint-magenta)',
      href: '/book',
      icons: ['🚚', '🧪'],
      tagColor: 'var(--brand-magenta)',
      tagBg: 'rgba(235,60,150,0.1)',
    },
  ] as const
}
```

Inside `HomePage`:
```typescript
const intl = useIntl()
const programCards = useProgramCards()
```

Replace remaining strings:
```tsx
// Section heading
{intl.formatMessage({ id: 'home.bookSection' })}
// Booking card labels
{intl.formatMessage({ id: 'home.nextVisit.label' })}
{nextBooking ? intl.formatMessage({ id: 'home.nextVisit.confirmed' }) : intl.formatMessage({ id: 'home.nextVisit.bookNow' })}
{nextLabel ?? intl.formatMessage({ id: 'home.nextVisit.bookFirst' })}
{nextStart ? intl.formatDate(nextStart, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : intl.formatMessage({ id: 'home.nextVisit.none' })}
// "Book now" in program cards
{intl.formatMessage({ id: 'home.card.bookNow' })}
```

Note: replace `format(nextStart, 'EEE, d MMM yyyy')` with `intl.formatDate(nextStart, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })`.

- [ ] **Step 2: Modify `src/components/pages/BookingsPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside `BookingsPage`:
```typescript
const intl = useIntl()
```

Replace tab labels:
```tsx
{intl.formatMessage({ id: 'bookings.tab.upcoming' }, { count: upcoming.length })}
{intl.formatMessage({ id: 'bookings.tab.past' })}
```

Page title:
```tsx
{intl.formatMessage({ id: 'bookings.title' })}
```

In `EmptyState` props calls:
```tsx
// Upcoming empty
label={intl.formatMessage({ id: 'bookings.empty.upcoming' })}
sub={intl.formatMessage({ id: 'bookings.empty.upcoming.sub' })}
cta={{ label: intl.formatMessage({ id: 'bookings.cta.book' }), href: '/book' }}
// Past empty
label={intl.formatMessage({ id: 'bookings.empty.past' })}
sub={intl.formatMessage({ id: 'bookings.empty.past.sub' })}
```

In `BookingCard`, replace status labels:
```typescript
const statusLabel = booking.status === 'confirmed'
  ? intl.formatMessage({ id: 'bookings.status.confirmed' })
  : booking.status === 'pending'
  ? intl.formatMessage({ id: 'bookings.status.pending' })
  : intl.formatMessage({ id: 'bookings.status.cancelled' })
```

Replace date display:
```typescript
// Replace: format(seg.start.toDate(), 'EEE d MMM yyyy')
intl.formatDate(seg.start.toDate(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
```

Pass `intl` down into `BookingCard` — add `intl` as a prop or call `useIntl()` inside `BookingCard` directly (preferred — keeps it self-contained):
```typescript
function BookingCard({ booking }: { booking: BookingDoc }) {
  const intl = useIntl()
  // ... rest of component
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Manual test**

Switch locale. Confirm home page greeting, program card text, and bookings page tabs/status labels all switch language. Confirm date format respects locale (German: `Mo., 1. Jan. 2026` / English: `Mon, 1 Jan 2026`).

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/HomePage.tsx src/components/pages/BookingsPage.tsx
git commit -m "feat(i18n): localize HomePage and BookingsPage"
```

---

### Task 6: Wire BookingDetailPage, KitPage, and ProfilePage

**Files:**
- Modify: `src/components/pages/BookingDetailPage.tsx`
- Modify: `src/components/pages/KitPage.tsx`
- Modify: `src/components/pages/ProfilePage.tsx`

**Interfaces:**
- Consumes: `useIntl` from `react-intl`; `useLocale` from `src/context/LocaleContext`

- [ ] **Step 1: Modify `src/components/pages/BookingDetailPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside component:
```typescript
const intl = useIntl()
```

Replace `rows` array:
```typescript
const rows = [
  ...(startDate ? [{
    icon: Clock,
    label: intl.formatMessage({ id: 'bookingDetail.row.dateTime' }),
    value: `${intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${intl.formatDate(startDate, { hour: '2-digit', minute: '2-digit', hour12: false })}–${endDate ? intl.formatDate(endDate, { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}`,
  }] : []),
  { icon: MapPin, label: intl.formatMessage({ id: 'bookingDetail.row.location' }), value: intl.formatMessage({ id: 'bookingDetail.location.value' }) },
  { icon: GraduationCap, label: intl.formatMessage({ id: 'bookingDetail.row.grade' }), value: intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade }) },
  { icon: Users, label: intl.formatMessage({ id: 'bookingDetail.row.students' }), value: intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount }) },
  ...(booking.accessNeeds ? [{ icon: Users, label: intl.formatMessage({ id: 'bookingDetail.row.access' }), value: booking.accessNeeds }] : []),
]
```

Replace status label:
```typescript
const statusLabel = booking.status === 'confirmed'
  ? intl.formatMessage({ id: 'bookingDetail.status.confirmed' })
  : booking.status === 'pending'
  ? intl.formatMessage({ id: 'bookingDetail.status.pending' })
  : intl.formatMessage({ id: 'bookingDetail.status.cancelled' })
```

Replace action buttons:
```tsx
{intl.formatMessage({ id: 'bookingDetail.addToCalendar' })}
{intl.formatMessage({ id: 'bookingDetail.cancel' })}
```

Replace loading/error states:
```tsx
// Loading spinner screen — no string needed (just spinner)
// Error screen
{intl.formatMessage({ id: 'bookingDetail.notFound' })}
{intl.formatMessage({ id: 'bookingDetail.backToBookings' })}
```

Replace the header date display:
```tsx
{startDate && (
  <div className="text-sm font-medium" ...>
    {intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
  </div>
)}
```

- [ ] **Step 2: Modify `src/components/pages/KitPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

The `KIT_SECTIONS` constant has static English content strings. These should remain as-is for now (Kit content is long-form and would need a full copywriting pass in German). Only the `title` field per section and the page header/progress strings are wired to i18n.

Replace module-level `KIT_SECTIONS` with a hook:
```typescript
function useKitSections() {
  const intl = useIntl()
  return [
    { id: 'arrival',   icon: MapPin,     title: intl.formatMessage({ id: 'kit.section.arrival.title' }),   color: 'var(--brand-mint)',    content: [ /* keep English content unchanged */ ] },
    { id: 'programme', icon: Clock,      title: intl.formatMessage({ id: 'kit.section.programme.title' }), color: 'var(--brand-yellow)',  content: [ /* keep English content unchanged */ ] },
    { id: 'consent',   icon: FileText,   title: intl.formatMessage({ id: 'kit.section.consent.title' }),   color: 'var(--brand-purple)',  content: [ /* keep English content unchanged */ ] },
    { id: 'students',  icon: Users,      title: intl.formatMessage({ id: 'kit.section.students.title' }),  color: 'var(--brand-cyan)',    content: [ /* keep English content unchanged */ ] },
  ]
}
```

Copy the existing `content` arrays verbatim into each section above (they are the original English strings from the file — do not replace them, just move them into the hook).

Inside `KitPage`:
```typescript
const intl = useIntl()
const kitSections = useKitSections()
```

Replace heading and progress strings:
```tsx
{intl.formatMessage({ id: 'kit.title' })}
{intl.formatMessage({ id: 'kit.progress.label' })}
{nextBooking ? intl.formatMessage({ id: 'kit.progress.almostThere' }) : intl.formatMessage({ id: 'kit.progress.noVisit' })}
{nextBooking ? intl.formatMessage({ id: 'kit.progress.review' }) : intl.formatMessage({ id: 'kit.progress.bookFirst' })}
{intl.formatMessage({ id: 'kit.download' })}
```

Replace `KIT_SECTIONS` reference with `kitSections` in the render.

Replace date display in booking selector:
```typescript
// Replace: format(seg.start.toDate(), 'd MMM yyyy')
intl.formatDate(seg.start.toDate(), { day: 'numeric', month: 'short', year: 'numeric' })
```

- [ ] **Step 3: Modify `src/components/pages/ProfilePage.tsx`**

Add imports:
```typescript
import { useIntl } from 'react-intl'
import { useLocale } from '../../context/LocaleContext'
```

Inside `ProfilePage`:
```typescript
const intl = useIntl()
const { locale, setLocale } = useLocale()
```

Remove the existing `const [language, setLanguage] = useState<'de' | 'en'>` — use `locale` from `useLocale()` instead.

Update the language toggle to call both `setLocale` and `updateProfile`:
```typescript
const handleLanguageChange = async (lang: 'de' | 'en') => {
  setLocale(lang)
  try { await updateProfile({ language: lang }) } catch { /* noop — locale already switched locally */ }
}
```

Replace toggle buttons:
```tsx
{(['de', 'en'] as const).map((lang) => {
  const active = locale === lang
  return (
    <button
      key={lang}
      type="button"
      onClick={() => handleLanguageChange(lang)}
      className="tap px-3 py-1 rounded-full text-xs font-bold transition-colors"
      style={{
        background: active ? 'var(--background)' : 'transparent',
        color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)',
        boxShadow: active ? 'var(--shadow-xs)' : 'none',
      }}
    >
      {lang.toUpperCase()}
    </button>
  )
})}
```

Replace all field labels and section headings:
```tsx
{intl.formatMessage({ id: 'profile.title' })}
// In editableRow calls:
// label arg for 'name' row: intl.formatMessage({ id: 'profile.field.name' })
// placeholder arg: intl.formatMessage({ id: 'profile.field.name.placeholder' })
// aria-label: intl.formatMessage({ id: 'profile.field.name.edit' })
// label arg for 'school' row: intl.formatMessage({ id: 'profile.field.school' })
// placeholder arg: intl.formatMessage({ id: 'profile.field.school.placeholder' })
// Email row label: intl.formatMessage({ id: 'profile.field.email' })
// Language section label: intl.formatMessage({ id: 'profile.language' })
// Theme section label: intl.formatMessage({ id: 'profile.theme' })
// Privacy section heading: intl.formatMessage({ id: 'profile.privacy.title' })
// GDPR row: intl.formatMessage({ id: 'profile.privacy.gdpr' })
// Change password: intl.formatMessage({ id: passwordSent ? 'profile.privacy.passwordSent' : 'profile.privacy.changePassword' })
// Export: intl.formatMessage({ id: 'profile.privacy.exportData' })
// Delete: intl.formatMessage({ id: 'profile.privacy.deleteAccount' })
// Sign out: intl.formatMessage({ id: 'profile.signOut' })
// Footer: intl.formatMessage({ id: 'profile.footer' })
```

Also update the `editableRow` function signature so it accepts translated `label`, `placeholder`, and `ariaLabel` strings as parameters rather than hardcoded strings.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Manual test**

Navigate to `/profile`. Switch language with the toggle. Confirm all profile labels change instantly. Confirm changing language here also changes AppShell nav labels.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/BookingDetailPage.tsx src/components/pages/KitPage.tsx src/components/pages/ProfilePage.tsx
git commit -m "feat(i18n): localize BookingDetailPage, KitPage, and ProfilePage"
```

---

### Task 7: Wire booking funnel (BookingLayout, BookPage, BookProgramsPage)

**Files:**
- Modify: `src/components/booking/BookingLayout.tsx`
- Modify: `src/components/booking/BookPage.tsx`
- Modify: `src/components/booking/BookProgramsPage.tsx`

**Interfaces:**
- Consumes: `useIntl` from `react-intl`

- [ ] **Step 1: Modify `src/components/booking/BookingLayout.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside `BookingLayout`:
```typescript
const intl = useIntl()
```

Replace aria-labels and step counter:
```tsx
// Back button
aria-label={intl.formatMessage({ id: 'bookingLayout.back' })}
// Close button (left side, step 1)
aria-label={intl.formatMessage({ id: 'bookingLayout.close' })}
// Close button (right side, steps 2+)
aria-label={intl.formatMessage({ id: 'bookingLayout.close' })}
// Step counter span
{intl.formatMessage({ id: 'bookingLayout.stepOf' }, { step, total: totalSteps })}
```

Inside `ContinueButton`:
```typescript
const intl = useIntl()
// Default children
children = intl.formatMessage({ id: 'bookingLayout.continue' })
```

Wait — `ContinueButton` receives `children` as a prop with a default. The default cannot use a hook directly in the prop default. Change the approach:

```typescript
export function ContinueButton({
  disabled,
  loading,
  onClick,
  children,
}: {
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children?: React.ReactNode
}) {
  const intl = useIntl()
  return (
    <button ...>
      {loading ? <spinner /> : (children ?? intl.formatMessage({ id: 'bookingLayout.continue' }))}
    </button>
  )
}
```

- [ ] **Step 2: Modify `src/components/booking/BookPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Replace `VISIT_TYPES` constant with a hook:
```typescript
function useVisitTypes() {
  const intl = useIntl()
  return [
    {
      id: 'onsite' as VisitType,
      label: intl.formatMessage({ id: 'book.type.onsite.label' }),
      sub: intl.formatMessage({ id: 'book.type.onsite.sub' }),
      tag: intl.formatMessage({ id: 'book.type.onsite.tag' }),
      tagColor: 'var(--brand-green)',
      tagBg: 'rgba(1,136,76,0.1)',
      headerBg: 'var(--brand-mint)',
      accentCircle1: { bg: 'var(--brand-yellow)', w: 160, h: 160, r: -30, t: 20 },
      accentCircle2: { bg: 'var(--brand-lime)', w: 70, h: 70, l: 140, t: -20 },
      icon: Building2,
    },
    {
      id: 'toad' as VisitType,
      label: intl.formatMessage({ id: 'book.type.toad.label' }),
      sub: intl.formatMessage({ id: 'book.type.toad.sub' }),
      tag: intl.formatMessage({ id: 'book.type.toad.tag' }),
      tagColor: 'var(--brand-magenta)',
      tagBg: 'rgba(235,60,150,0.1)',
      headerBg: 'var(--brand-magenta)',
      accentCircle1: { bg: 'var(--brand-purple)', w: 160, h: 160, r: -30, t: 20 },
      accentCircle2: { bg: 'var(--brand-yellow)', w: 70, h: 70, l: 140, t: -20 },
      icon: Truck,
    },
  ] as const
}
```

Inside `BookPage`:
```typescript
const intl = useIntl()
const visitTypes = useVisitTypes()
```

Replace title and heading passed to `BookingLayout`:
```tsx
title={intl.formatMessage({ id: 'book.title' })}
```

Replace heading and sub:
```tsx
{intl.formatMessage({ id: 'book.heading' })}
{intl.formatMessage({ id: 'book.sub' })}
```

Replace `VISIT_TYPES.map` with `visitTypes.map`.

- [ ] **Step 3: Modify `src/components/booking/BookProgramsPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Replace `OPTIONS` and `ORDER_OPTIONS` constants with a hook:
```typescript
function useBookProgramOptions() {
  const intl = useIntl()
  const options = [
    { id: 'cube' as ProgramSelection, title: intl.formatMessage({ id: 'bookPrograms.cube.title' }), sub: intl.formatMessage({ id: 'bookPrograms.cube.sub' }), swatch: 'var(--brand-mint)' },
    { id: 'lab'  as ProgramSelection, title: intl.formatMessage({ id: 'bookPrograms.lab.title' }),  sub: intl.formatMessage({ id: 'bookPrograms.lab.sub' }),  swatch: 'var(--brand-yellow)' },
    { id: 'both' as ProgramSelection, title: intl.formatMessage({ id: 'bookPrograms.both.title' }), sub: intl.formatMessage({ id: 'bookPrograms.both.sub' }), swatch: 'linear-gradient(135deg, var(--brand-mint) 50%, var(--brand-yellow) 50%)' },
  ]
  const orderOptions = [
    { id: 'cube-first' as ProgramOrder, label: intl.formatMessage({ id: 'bookPrograms.order.cubeFirst.label' }), sub: 'Cube 09:00 → Lab 09:45' },
    { id: 'lab-first'  as ProgramOrder, label: intl.formatMessage({ id: 'bookPrograms.order.labFirst.label' }),  sub: 'Lab 09:00 → Cube 09:45' },
  ]
  return { options, orderOptions }
}
```

Inside `BookProgramsPage`:
```typescript
const intl = useIntl()
const { options, orderOptions } = useBookProgramOptions()
```

Replace title, heading, and order section heading:
```tsx
title={intl.formatMessage({ id: 'bookPrograms.title' })}
{intl.formatMessage({ id: 'bookPrograms.heading' })}
{intl.formatMessage({ id: 'bookPrograms.order.heading' })}
{intl.formatMessage({ id: 'bookPrograms.order.sub' })}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/booking/BookingLayout.tsx src/components/booking/BookPage.tsx src/components/booking/BookProgramsPage.tsx
git commit -m "feat(i18n): localize booking funnel steps 1-2 and BookingLayout"
```

---

### Task 8: Wire BookTimePage, BookDetailsPage, ReviewPage, ConfirmedPage

**Files:**
- Modify: `src/components/booking/BookTimePage.tsx`
- Modify: `src/components/booking/BookDetailsPage.tsx`
- Modify: `src/components/booking/ReviewPage.tsx`
- Modify: `src/components/booking/ConfirmedPage.tsx`

**Interfaces:**
- Consumes: `useIntl` from `react-intl`

- [ ] **Step 1: Modify `src/components/booking/BookTimePage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Replace `DOW_LABELS` constant with a hook value:
```typescript
const intl = useIntl()
const DOW_LABELS = [
  intl.formatMessage({ id: 'bookTime.dow.mon' }),
  intl.formatMessage({ id: 'bookTime.dow.tue' }),
  intl.formatMessage({ id: 'bookTime.dow.wed' }),
  intl.formatMessage({ id: 'bookTime.dow.thu' }),
  intl.formatMessage({ id: 'bookTime.dow.fri' }),
]
```

Replace `getStepTitle` function — it currently returns static English strings. Replace with a translated version using message IDs for program names (use `program.*` keys):
```typescript
function getStepTitle(selection: string | null, order: string, intl: ReturnType<typeof useIntl>): string {
  if (selection === 'cube') return intl.formatMessage({ id: 'program.cube' })
  if (selection === 'lab')  return intl.formatMessage({ id: 'program.lab' })
  if (selection === 'both') return `${intl.formatMessage({ id: 'program.both' })} · ${order === 'cube-first' ? intl.formatMessage({ id: 'bookPrograms.order.cubeFirst.label' }) : intl.formatMessage({ id: 'bookPrograms.order.labFirst.label' })}`
  return intl.formatMessage({ id: 'bookTime.title' })
}
```

Call it: `getStepTitle(programSelection, programOrder, intl)`

Replace "No available slots" and "Select a date" text (find in JSX and replace with message IDs `bookTime.noSlots` and `bookTime.selectDate`).

Replace seat availability display (find `seatsLeft`/`Full` strings):
```tsx
// Available seats
{intl.formatMessage({ id: 'bookTime.seatsLeft' }, { count: available })}
// Full
{intl.formatMessage({ id: 'bookTime.full' })}
```

Replace date formatting calls for displayed dates in the calendar:
```typescript
// Day-of-month number display — keep numeric, no change needed
// Month header — if present, use intl.formatDate(date, { month: 'long' })
```

- [ ] **Step 2: Modify `src/components/booking/BookDetailsPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside component:
```typescript
const intl = useIntl()
```

Replace `slotSummary` build (uses `format()` for time — replace with `intl.formatDate()`):
```typescript
const slotSummary = slots.length > 0
  ? slots.map((s) => {
      const programName = intl.formatMessage({ id: `program.${s.programId}` })
      const time = intl.formatDate(s.start, { hour: '2-digit', minute: '2-digit', hour12: false })
      return `${programName} ${time}`
    }).join(' → ')
  : ''

const dateSummary = slots.length > 0
  ? intl.formatDate(slots[0].start, { weekday: 'short', day: 'numeric', month: 'short' })
  : ''
```

Replace title passed to `BookingLayout`:
```tsx
title={intl.formatMessage({ id: 'bookDetails.title' })}
```

Replace heading, timer text, form labels, grade options:
```tsx
{intl.formatMessage({ id: 'bookDetails.heading' })}
// Timer "Your sessions are held"
{intl.formatMessage({ id: 'bookDetails.timer.held' })}
// Grade label
{intl.formatMessage({ id: 'bookDetails.grade.label' })}
// Grade option
<option key={g} value={g}>{intl.formatMessage({ id: 'bookDetails.grade.option' }, { grade: g })}</option>
// Students label
{intl.formatMessage({ id: 'bookDetails.students.label' })}
// Max students
{intl.formatMessage({ id: 'bookDetails.students.max' }, { max: MAX_STUDENTS })}
// Add/remove aria-labels
aria-label={intl.formatMessage({ id: 'bookDetails.students.add' })}
aria-label={intl.formatMessage({ id: 'bookDetails.students.remove' })}
// Accessibility label
{intl.formatMessage({ id: 'bookDetails.access.label' })} <span>{intl.formatMessage({ id: 'bookDetails.access.optional' })}</span>
// Accessibility placeholder
placeholder={intl.formatMessage({ id: 'bookDetails.access.placeholder' })}
```

- [ ] **Step 3: Modify `src/components/booking/ReviewPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside component:
```typescript
const intl = useIntl()
```

Replace `programLabel` helper to use message IDs:
```typescript
function programLabel(id: string, intl: ReturnType<typeof useIntl>): string {
  if (id === 'cube') return intl.formatMessage({ id: 'program.cube' })
  if (id === 'lab')  return intl.formatMessage({ id: 'program.lab' })
  return intl.formatMessage({ id: 'program.toad' })
}
```

Replace `rows` array:
```typescript
const rows = [
  { k: intl.formatMessage({ id: 'review.row.date' }),     v: intl.formatDate(firstSlot.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), href: '/book/time' },
  { k: intl.formatMessage({ id: 'review.row.time' }),     v: `${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`, href: '/book/time' },
  { k: intl.formatMessage({ id: 'review.row.grade' }),    v: `${intl.formatMessage({ id: 'review.row.grade' })} ${classDetails.grade}`, href: '/book/details' },
  { k: intl.formatMessage({ id: 'review.row.students' }), v: String(classDetails.studentCount), href: '/book/details' },
  ...(classDetails.accessNeeds ? [{ k: intl.formatMessage({ id: 'review.row.access' }), v: classDetails.accessNeeds, href: '/book/details' }] : []),
]
```

Replace title, heading, type label, "Edit" links, privacy note, confirm button, error message:
```tsx
title={intl.formatMessage({ id: 'review.title' })}
{intl.formatMessage({ id: 'review.heading' })}
{intl.formatMessage({ id: 'review.type' })}
// Edit link text
{intl.formatMessage({ id: 'review.row.edit' })}
// Privacy note
{intl.formatMessage({ id: 'review.privacy' })}
// Error
{intl.formatMessage({ id: 'review.error' })}
```

In `ContinueButton`:
```tsx
{intl.formatMessage({ id: 'review.confirm' })}
```

Also replace `programTitle` build:
```typescript
const programTitle = programSelection === 'both'
  ? intl.formatMessage({ id: 'program.both' })
  : programLabel(firstSlot.programId, intl)
```

Replace `dateStr` and `timeRange`:
```typescript
const dateStr = intl.formatDate(firstSlot.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const timeRange = `${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`
```

- [ ] **Step 4: Modify `src/components/booking/ConfirmedPage.tsx`**

Add import:
```typescript
import { useIntl } from 'react-intl'
```

Inside component:
```typescript
const intl = useIntl()
```

Replace `programTitle` build:
```typescript
const programTitle = programSelection === 'both'
  ? intl.formatMessage({ id: 'program.both' })
  : firstSlot.programId === 'cube'
  ? intl.formatMessage({ id: 'program.cube' })
  : intl.formatMessage({ id: 'program.lab' })
```

Replace `dateLabel` and `timeRange`:
```typescript
const dateLabel = intl.formatDate(firstSlot.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const timeRange = `${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`
```

Replace heading, sub-text, code labels, action buttons:
```tsx
{intl.formatMessage({ id: 'confirmed.heading' })}
// Sub-text
{intl.formatMessage({ id: 'confirmed.sub' }, { programTitle, grade: classDetails.grade, date: dateLabel, time: timeRange }).split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
// Booking code label
{intl.formatMessage({ id: 'confirmed.code.label' })}
{intl.formatMessage({ id: 'confirmed.code.sub' })}
// Actions
{intl.formatMessage({ id: 'confirmed.addCalendar' })}
{intl.formatMessage({ id: 'confirmed.backHome' })}
```

Also update `makeCalendarUrl` call — the title arg should use the already-translated `programTitle`.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: End-to-end manual test**

1. Open app in EN locale (`curiosity-locale = en` in localStorage).
2. Walk through the full booking funnel: Book → Programs → Time → Details → Review → Confirmed. Confirm every string is in English.
3. Switch locale to DE (via Profile → Language).
4. Walk the funnel again. Confirm every string is in German. Confirm dates are formatted in German style.
5. Sign out and back in. Confirm the locale is restored from localStorage on the auth screens before sign-in.

- [ ] **Step 7: Commit**

```bash
git add src/components/booking/
git commit -m "feat(i18n): localize full booking funnel (time, details, review, confirmed)"
```

---

### Task 9: Final cleanup — remove all remaining hardcoded UI strings

**Files:**
- All files modified in Tasks 3–8 (audit pass)

- [ ] **Step 1: Grep for remaining hardcoded English strings**

```bash
grep -rn '"Good morning"\|"Good afternoon"\|"Good evening"\|"Sign in"\|"Sign out"\|"My bookings"\|"Pre-visit"\|"Book a visit"\|"Confirm booking"\|"Back to home"\|"Grade "\|"students"\|"No upcoming"' src/components/ --include="*.tsx"
```

Expected: zero results. If any appear, trace the file and message ID, add the message to both catalogs, and replace with `intl.formatMessage()`.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: build completes with no TypeScript or Vite errors.

- [ ] **Step 3: Full locale smoke test**

Start dev server (`npm run dev`). Switch locale to `en` and `de` via Profile → Language. Navigate through every page. Confirm no UI string appears in the wrong language or falls back to a message ID key.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(i18n): complete EN/DE localization across all screens"
```
