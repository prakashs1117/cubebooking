/**
 * Set a user's role in both Firestore and Firebase Auth custom claims.
 *
 * Usage:
 *   node scripts/set-user-role.mjs <uid> <role>
 *
 * Roles: teacher | coordinator | admin | volunteer | null
 *
 * Examples:
 *   node scripts/set-user-role.mjs abc123 admin        # make admin
 *   node scripts/set-user-role.mjs abc123 teacher      # downgrade to teacher
 *   node scripts/set-user-role.mjs abc123 null         # remove role
 *
 * Requires service-account.json in the project root.
 * Download from: Firebase Console → Project settings → Service accounts → Generate new private key
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const VALID_ROLES = ['teacher', 'coordinator', 'admin', 'volunteer', 'null']

// Accept either order: <uid> <role>  OR  <role> <uid>
let [,, arg1, arg2] = process.argv
if (!arg1 || !arg2) {
  console.error('\nUsage: node scripts/set-user-role.mjs <uid> <role>')
  console.error('       node scripts/set-user-role.mjs <role> <uid>  (either order works)')
  console.error('\nRoles: teacher | coordinator | admin | volunteer | null')
  console.error('Example: node scripts/set-user-role.mjs HJCsgUeKC6crVtP2EBO338A6Ao12 admin\n')
  process.exit(1)
}

// Figure out which arg is the role and which is the UID
let uid, role
if (VALID_ROLES.includes(arg1) && !VALID_ROLES.includes(arg2)) {
  role = arg1; uid = arg2   // <role> <uid>
} else if (VALID_ROLES.includes(arg2) && !VALID_ROLES.includes(arg1)) {
  uid = arg1; role = arg2   // <uid> <role>
} else {
  console.error(`\n❌  Could not determine which argument is the role.`)
  console.error(`    "${arg1}" and "${arg2}" — one must be a valid role.`)
  console.error(`\nValid roles: ${VALID_ROLES.join(', ')}`)
  console.error(`Example:  node scripts/set-user-role.mjs HJCsgUeKC6crVtP2EBO338A6Ao12 admin\n`)
  process.exit(1)
}

const saPath = resolve(__dirname, '../service-account.json')
if (!existsSync(saPath)) {
  console.error(`\n❌  service-account.json not found at: ${saPath}`)
  console.error('\nDownload it from:')
  console.error('  Firebase Console → mer-booking-tool → Project settings → Service accounts')
  console.error('  → Generate new private key → save as service-account.json in project root\n')
  process.exit(1)
}

// Load firebase-admin from the functions folder
const adminPkg = resolve(__dirname, '../functions/node_modules/firebase-admin')

let initializeApp, cert, getApps, getAuth, getFirestore, FieldValue

try {
  ;({ initializeApp, cert, getApps } = await import(`${adminPkg}/app/index.js`))
  ;({ getAuth } = await import(`${adminPkg}/auth/index.js`))
  ;({ getFirestore } = await import(`${adminPkg}/firestore/index.js`))
} catch {
  // Try alternative paths
  ;({ initializeApp, cert, getApps } = await import(resolve(adminPkg, 'lib/app/index.js')))
  ;({ getAuth } = await import(resolve(adminPkg, 'lib/auth/index.js')))
  ;({ getFirestore } = await import(resolve(adminPkg, 'lib/firestore/index.js')))
}

const sa = JSON.parse(readFileSync(saPath, 'utf8'))
if (!getApps().length) {
  initializeApp({ credential: cert(sa) })
}

const resolvedRole = role === 'null' ? null : role

console.log(`\n🔧  Setting role for user ${uid} → "${resolvedRole}"`)
console.log('    Project: mer-booking-tool\n')

// 1. Update Firestore
try {
  const db = getFirestore()
  await db.doc(`users/${uid}`).update({
    role: resolvedRole,
    updatedAt: new Date(),
  })
  console.log(`✔  Firestore users/${uid}.role = ${resolvedRole}`)
} catch (err) {
  if (err.code === 5 || err.message?.includes('NOT_FOUND')) {
    console.error(`❌  No Firestore document found for uid "${uid}".`)
    console.error('    The user must sign in at least once before their role can be set.\n')
  } else {
    console.error('❌  Firestore error:', err.message)
  }
  process.exit(1)
}

// 2. Update Firebase Auth custom claim
try {
  await getAuth().setCustomUserClaims(uid, { role: resolvedRole })
  console.log(`✔  Auth custom claim role = ${resolvedRole}`)
} catch (err) {
  console.error('❌  Auth custom claim error:', err.message)
  process.exit(1)
}

console.log(`
✅  Done!

${resolvedRole === 'admin'
  ? `⚠️  The user must SIGN OUT and SIGN BACK IN for the admin claim to take
    effect in their JWT token. Until then, Firestore rules may still deny
    admin-only operations.`
  : `The user must sign out and sign back in for the new role to take effect.`}
`)
