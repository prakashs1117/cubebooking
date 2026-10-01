# Admin Guide — Curiosity Booking

How to assign admin access, manage user roles, and what each role can do.

---

## How roles work

Every user has a single `role` field in their Firestore document (`users/{uid}`).

| Role | Who it's for | What they can do |
|---|---|---|
| `null` | Newly registered user | Sign in, view public content only |
| `teacher` | School teacher | Book sessions, view own bookings, use pre-visit kit |
| `coordinator` | School coordinator | Same as teacher + manage other teachers at their school |
| `volunteer` | Merck volunteer | View assigned sessions (future feature) |
| `admin` | Merck program team | Everything — manage calendar, approve bookings, read all data |

**`isAdmin`** in the app is `true` only when `role === 'admin'`. Firestore security rules also check this via `request.auth.token.role == 'admin'` (custom claim — see step 3 below).

---

## Becoming an admin — step by step

There is no self-service admin signup. Admin access is granted manually through the Firebase console or via a Cloud Function.

### Method 1 — Firebase Console (quickest for the first admin)

1. **Find the user's UID**
   - Go to [Firebase Console → Authentication](https://console.firebase.google.com/project/mer-booking-tool/authentication/users)
   - Find the account by email, copy the **User UID**

2. **Set `role` in Firestore**
   - Go to [Firebase Console → Firestore](https://console.firebase.google.com/project/mer-booking-tool/firestore)
   - Navigate to `users` → click the document with that UID
   - Find the `role` field (currently `null` or `"teacher"`)
   - Click the pencil icon, change the value to `"admin"`, save

3. **Set the Firebase Auth custom claim** *(required for Firestore security rules)*

   The Firestore rules check `request.auth.token.role == 'admin'`, which reads from the **Firebase Auth custom claim** — not the Firestore field. You must set both.

   Open the Firebase Console → Functions → Shell (or use the Admin SDK script below):

   ```bash
   # From the project root — requires service-account.json
   node scripts/set-admin-claim.mjs <USER_UID>
   ```

   Or run this one-off script manually:

   ```js
   // In Firebase Functions shell or a Node.js script with firebase-admin
   const admin = require('firebase-admin')
   admin.auth().setCustomUserClaims('<USER_UID>', { role: 'admin' })
   ```

4. **User must sign out and sign back in** for the new custom claim to take effect in their ID token.

---

### Method 2 — Admin SDK script (recommended)

Create `scripts/set-user-role.mjs` in the project root:

```js
// Usage: node scripts/set-user-role.mjs <uid> <role>
// Roles: teacher | coordinator | admin | volunteer | null
import { readFileSync } from 'fs'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore'

const [,, uid, role] = process.argv
if (!uid || !role) { console.error('Usage: node set-user-role.mjs <uid> <role>'); process.exit(1) }

const sa = JSON.parse(readFileSync('./service-account.json', 'utf8'))
if (!getApps().length) initializeApp({ credential: cert(sa) })

const validRoles = ['teacher', 'coordinator', 'admin', 'volunteer', 'null']
if (!validRoles.includes(role)) { console.error('Invalid role. Use:', validRoles.join(', ')); process.exit(1) }

const resolvedRole = role === 'null' ? null : role

// 1. Update Firestore document
await getFirestore().doc(`users/${uid}`).update({ role: resolvedRole, updatedAt: serverTimestamp() })
console.log(`✔ Firestore users/${uid}.role = ${resolvedRole}`)

// 2. Update Firebase Auth custom claim
await getAuth().setCustomUserClaims(uid, { role: resolvedRole })
console.log(`✔ Auth custom claim role = ${resolvedRole}`)
console.log('\nUser must sign out and sign back in for the claim to take effect.')
```

Run it:

```bash
# Grant admin
node scripts/set-user-role.mjs abc123uid admin

# Downgrade back to teacher
node scripts/set-user-role.mjs abc123uid teacher

# Remove role (new user state)
node scripts/set-user-role.mjs abc123uid null
```

---

## How `isAdmin` is checked in the app

**Frontend (`AuthContext.tsx`):**
```ts
isAdmin: profile?.role === 'admin'
```
This reads the `role` field from the Firestore `users/{uid}` document which is kept in sync via a real-time listener.

**Firestore security rules (`firestore.rules`):**
```
function isAdmin() {
  return isSignedIn() && request.auth.token.role == 'admin';
}
```
This reads the **custom claim** on the JWT token. Both must be set (Firestore field + custom claim) for full access to work.

**Route guard (`ProtectedRoute.tsx`):**
```tsx
<ProtectedRoute requireAdmin>
  <AdminPage />
</ProtectedRoute>
```
Non-admin users are redirected to `/home`.

---

## What admins can access (current + planned)

| Feature | Status | Route |
|---|---|---|
| Admin home dashboard | Planned | `/admin` |
| Calendar management (weekday switches, blackouts) | Planned | `/admin/calendar` |
| TOAD approval queue | Planned | `/admin/approvals` |
| All bookings read access | ✅ Live (Firestore rules) | — |
| Write programs/settings/sessions | ✅ Live (Firestore rules) | — |
| Write schools, blackouts | ✅ Live (Firestore rules) | — |
| Audit log read | ✅ Live (Firestore rules) | — |

---

## Firestore rules summary

| Collection | Teacher | Coordinator | Admin |
|---|---|---|---|
| `users/{own}` | Read + write own doc | Read + write own doc | Read all docs |
| `users/{other}` | ❌ | ❌ | ✅ Read |
| `programs` | ✅ Read | ✅ Read | ✅ Read + Write |
| `settings` | ✅ Read | ✅ Read | ✅ Read + Write |
| `sessions` | ✅ Read (signed-in) | ✅ Read | ✅ Read + Write |
| `bookings` (own) | ✅ Read + Create | ✅ Read + Create | ✅ Full |
| `bookings` (others) | ❌ | ❌ | ✅ Full |
| `schools` | ✅ Read | ✅ Read | ✅ Read + Write |
| `blackouts` | ✅ Read (public) | ✅ Read | ✅ Read + Write |
| `auditLog` | ❌ | ❌ | ✅ Read |

---

## Common admin tasks

### Approve a school
```
Firestore → schools → {schoolId} → status: "approved"
```

### Block a date (blackout)
```
Firestore → blackouts → Add document:
{
  programIds: ["cube", "lab"],   // or ["toad"] or all three
  from: <Timestamp>,
  to: <Timestamp>,
  reason: "Public holiday"
}
```

### Change session capacity or duration
```
Firestore → programs → cube (or lab / toad):
  capacity: 30         ← max students per session
  sessionMinutes: 45   ← session length
```

### Change the booking window
```
Firestore → settings → app:
  bookingWindowDays: 90   ← how far ahead teachers can book
  holdMinutes: 10          ← seat hold during checkout
  breakBetweenMinutes: 0   ← gap between Cube and Lab for combined visits
```

### Switch weekdays on/off for a program
```
Firestore → programs → cube:
  openWeekdays: [1, 2, 3, 4, 5]   ← Mon=1 … Fri=5, Sun=0, Sat=6
  # e.g. [1, 3, 5] = Mon, Wed, Fri only
```

---

## Security notes

- **Never store admin credentials in the app source.** The `service-account.json` is gitignored and must never be committed.
- **Custom claims expire with the token.** If you revoke a user's admin access, they keep it until their current ID token expires (~1 hour). To force immediate revocation, use `admin.auth().revokeRefreshTokens(uid)`.
- **Firestore rules are the security boundary**, not the frontend. Even if a user manipulates the React app, they cannot read or write other users' data without the correct custom claim.
- **Role escalation is not possible from the client.** The `role` field is protected — users can write their own Firestore document, but the rules prevent changing `role` via client SDK (only Cloud Functions / Admin SDK can do this).

---

## Finding a user's UID

**Option A — Firebase Console:**  
Authentication → Users → search by email → copy User UID column

**Option B — Firestore:**  
Firestore → `users` collection → each document ID is the UID

**Option C — From the running app (admin signed in):**  
Open DevTools → Application → IndexedDB → `firebaseLocalStorage` → look for `uid`
