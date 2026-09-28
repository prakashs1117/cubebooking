/**
 * Seed script — writes programs, settings, and sessions to Firestore.
 * Uses firebase-admin from the functions/ folder.
 *
 * Usage (from project root):
 *   node --experimental-specifier-resolution=node scripts/seed-curiosity.mjs
 *
 * Before running, download a service account key:
 *   Firebase Console → Project settings → Service accounts → Generate new private key
 *   Save as: service-account.json  (in the project root — already in .gitignore)
 *
 * OR run with the emulator (no key needed):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed-curiosity.mjs
 */

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Load firebase-admin from the functions node_modules
const adminPkg = resolve(__dirname, '../functions/node_modules/firebase-admin')
const { initializeApp, cert, getApps } = await import(`${adminPkg}/app/index.js`).catch(() =>
  import(resolve(adminPkg, 'lib/app/index.js'))
)
const { getFirestore, Timestamp, FieldValue } = await import(`${adminPkg}/firestore/index.js`).catch(() =>
  import(resolve(adminPkg, 'lib/firestore/index.js'))
)

// ── Init ──────────────────────────────────────────────────────────────────────
if (!getApps().length) {
  const saPath = resolve(__dirname, '../service-account.json')
  if (existsSync(saPath)) {
    const sa = JSON.parse(readFileSync(saPath, 'utf8'))
    initializeApp({ credential: cert(sa) })
    console.log('✔ Using service account:', saPath)
  } else if (process.env.FIRESTORE_EMULATOR_HOST) {
    initializeApp({ projectId: 'mer-booking-tool' })
    console.log('✔ Using emulator at', process.env.FIRESTORE_EMULATOR_HOST)
  } else {
    console.error(`
❌  No credentials found.

To run this seed script you need ONE of:

  Option A — Service account (recommended for one-time seed):
    1. Go to: https://console.firebase.google.com/project/mer-booking-tool/settings/serviceaccounts/adminsdk
    2. Click "Generate new private key"
    3. Save the file as: service-account.json  (project root)
    4. Run:  node scripts/seed-curiosity.mjs

  Option B — Emulator:
    firebase emulators:start --only firestore
    FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed-curiosity.mjs
`)
    process.exit(1)
  }
}

const db = getFirestore()

// ── Data ──────────────────────────────────────────────────────────────────────
const programs = {
  cube: {
    name: 'Curiosity Cube',
    type: 'onsite',
    sessionMinutes: 45,
    capacity: 30,
    openWeekdays: [1, 2, 3, 4, 5],
    dailyStartTimes: ['09:00', '10:00', '11:00', '13:00', '14:00'],
    needsApproval: false,
    serviceCities: [],
  },
  lab: {
    name: 'Curiosity Lab',
    type: 'onsite',
    sessionMinutes: 45,
    capacity: 30,
    openWeekdays: [1, 2, 3, 4, 5],
    dailyStartTimes: ['09:00', '10:00', '11:00', '13:00', '14:00'],
    needsApproval: false,
    serviceCities: [],
  },
  toad: {
    name: 'TOAD Truck',
    type: 'outreach',
    sessionMinutes: 90,
    capacity: 30,
    openWeekdays: [2, 4],
    dailyStartTimes: ['09:00', '13:00'],
    needsApproval: true,
    serviceCities: ['Darmstadt'],
  },
}

function addMinutes(date, mins) {
  return new Date(date.getTime() + mins * 60_000)
}

function nextWeekdays(count) {
  const days = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1) // start tomorrow
  while (days.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function generateSessions(programId, prog, days) {
  const sessions = []
  for (const day of days) {
    if (!prog.openWeekdays.includes(day.getDay())) continue
    for (const timeStr of prog.dailyStartTimes) {
      const [hh, mm] = timeStr.split(':').map(Number)
      const start = new Date(day)
      start.setHours(hh, mm, 0, 0)
      sessions.push({
        programId,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(addMinutes(start, prog.sessionMinutes)),
        capacity: prog.capacity,
        seatsTaken: 0,
        seatsHeld: 0,
        status: 'open',
      })
    }
  }
  return sessions
}

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Seeding Curiosity Booking — project: mer-booking-tool\n')

  // Programs
  console.log('📦 Writing programs...')
  for (const [id, data] of Object.entries(programs)) {
    await db.doc(`programs/${id}`).set(data)
    console.log(`   ✔ programs/${id}`)
  }

  // Settings
  console.log('\n⚙️  Writing settings...')
  await db.doc('settings/app').set({
    breakBetweenMinutes: 0,
    holdMinutes: 10,
    bookingWindowDays: 90,
  })
  console.log('   ✔ settings/app')

  // Sessions
  console.log('\n📅 Generating sessions for next 60 weekdays...')
  const days = nextWeekdays(60)
  let total = 0

  for (const [programId, prog] of Object.entries(programs)) {
    const sessions = generateSessions(programId, prog, days)
    // Batch writes: max 500 per batch
    for (let i = 0; i < sessions.length; i += 400) {
      const batch = db.batch()
      for (const s of sessions.slice(i, i + 400)) {
        batch.set(db.collection('sessions').doc(), s)
      }
      await batch.commit()
      process.stdout.write('.')
    }
    console.log(` ✔ ${sessions.length} sessions for ${programId}`)
    total += sessions.length
  }

  console.log(`\n✅ Seed complete!`)
  console.log(`   • ${Object.keys(programs).length} programs`)
  console.log(`   • 1 settings document`)
  console.log(`   • ${total} sessions (60 weekdays)`)
  console.log('\nYou can now run the app — the booking flow will have real availability data.')
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
