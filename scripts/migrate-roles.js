/**
 * One-time migration: convert users/{uid}.role (string) → roles (array)
 *
 * Run from the project root:
 *   node scripts/migrate-roles.js
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON, OR
 *   - Run inside a Firebase project environment (firebase emulators, Cloud Shell, etc.)
 *
 * What it does:
 *   - Reads every document in the `users` collection
 *   - For docs that have `role` (string) but NOT `roles` (array): writes roles = [role]
 *   - For docs that have neither: writes roles = ['guest']
 *   - For docs that already have `roles` array: skips (no change)
 *   - After writing `roles`, removes the old `role` field using FieldValue.delete()
 *   - Runs in batches of 400 (Firestore limit is 500 per batch)
 *   - Prints a summary at the end
 */

const admin = require('firebase-admin')

// ── Init ──────────────────────────────────────────────────────────────────────
// If GOOGLE_APPLICATION_CREDENTIALS is set, admin.initializeApp() picks it up
// automatically. Otherwise pass your service account JSON path here:
//   const serviceAccount = require('./path/to/serviceAccount.json')
//   admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
admin.initializeApp()

const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue

const VALID_ROLES = ['guest', 'member', 'club member', 'admin', 'super admin']
const BATCH_SIZE = 400

async function migrate() {
  console.log('Fetching all users…')
  const snap = await db.collection('users').get()
  console.log(`Found ${snap.size} user documents.\n`)

  let skipped = 0
  let migrated = 0
  let defaulted = 0
  let errors = 0

  const docs = snap.docs
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE)
    const batch = db.batch()

    for (const docSnap of chunk) {
      const data = docSnap.data()
      const ref = docSnap.ref

      // Already has roles array — skip
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        skipped++
        continue
      }

      let newRoles

      if (typeof data.role === 'string' && data.role.trim()) {
        const roleStr = data.role.trim()
        if (VALID_ROLES.includes(roleStr)) {
          newRoles = [roleStr]
        } else {
          console.warn(`  [WARN] uid=${docSnap.id} has unknown role="${roleStr}" — defaulting to ['guest']`)
          newRoles = ['guest']
          defaulted++
        }
      } else {
        // No role at all — default to guest
        newRoles = ['guest']
        defaulted++
      }

      try {
        batch.update(ref, {
          roles: newRoles,
          role: FieldValue.delete(), // remove the old field
        })
        migrated++
        console.log(`  [MIGRATE] ${docSnap.id} (${data.email || '?'}) : "${data.role}" → ${JSON.stringify(newRoles)}`)
      } catch (err) {
        console.error(`  [ERROR] ${docSnap.id}: ${err.message}`)
        errors++
      }
    }

    await batch.commit()
    console.log(`  Batch committed (${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length})\n`)
  }

  console.log('─'.repeat(50))
  console.log(`Migration complete.`)
  console.log(`  Already had roles array (skipped): ${skipped}`)
  console.log(`  Migrated from role string:         ${migrated - defaulted}`)
  console.log(`  Defaulted to ['guest']:             ${defaulted}`)
  console.log(`  Errors:                             ${errors}`)
}

migrate().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
