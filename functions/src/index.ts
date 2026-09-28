import { createHash } from 'crypto'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

initializeApp()

const CLOUDINARY_CLOUD_NAME = defineSecret('CLOUDINARY_CLOUD_NAME')
const CLOUDINARY_API_KEY = defineSecret('CLOUDINARY_API_KEY')
const CLOUDINARY_API_SECRET = defineSecret('CLOUDINARY_API_SECRET')

const PROFILE_FOLDER = 'profile-pics'
// Signed into the request, so Cloudinary rejects non-images server-side. The
// client-side check in lib/cloudinary.ts is only a fast-fail for the user.
const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,gif'
const SECRETS = [CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]

/**
 * Cloudinary signs a request by SHA-1 hashing the upload params — sorted by
 * key, joined as `k=v&k=v` — with the API secret appended. `file`, `api_key`
 * and `resource_type` are excluded from the signed string.
 */
function signParams(params: Record<string, string | number | boolean>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(toSign + apiSecret).digest('hex')
}

async function getUserDoc(uid: string) {
  return getFirestore().doc(`users/${uid}`).get()
}

/**
 * Mints a short-lived signature so the browser can upload a profile picture
 * straight to Cloudinary without ever seeing the API secret. public_id is
 * pinned to the caller's uid with overwrite, so each user owns exactly one
 * asset and re-uploads replace rather than accumulate.
 */
export const getCloudinarySignature = onCall({ secrets: SECRETS }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to upload a photo.')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    allowed_formats: ALLOWED_FORMATS,
    folder: PROFILE_FOLDER,
    invalidate: true,
    overwrite: true,
    public_id: uid,
    timestamp,
  }

  return {
    cloudName: CLOUDINARY_CLOUD_NAME.value(),
    apiKey: CLOUDINARY_API_KEY.value(),
    timestamp,
    signature: signParams(params, CLOUDINARY_API_SECRET.value()),
    folder: PROFILE_FOLDER,
    publicId: uid,
    allowedFormats: ALLOWED_FORMATS,
  }
})

/**
 * Deletes a profile picture. Callers may only delete their own asset unless
 * they hold the admin role.
 */
export const deleteCloudinaryImage = onCall<{ publicId: string }>({ secrets: SECRETS }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to remove a photo.')
  }

  const publicId = request.data?.publicId
  if (!publicId || typeof publicId !== 'string') {
    throw new HttpsError('invalid-argument', 'publicId is required.')
  }

  const snap = await getUserDoc(uid)
  const isOwnPhoto = snap.exists && snap.get('photoPublicId') === publicId
  const isAdmin = snap.exists && snap.get('role') === 'admin'
  if (!isOwnPhoto && !isAdmin) {
    throw new HttpsError('permission-denied', 'You can only remove your own photo.')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const signature = signParams({ public_id: publicId, timestamp }, CLOUDINARY_API_SECRET.value())

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    signature,
    api_key: CLOUDINARY_API_KEY.value(),
  })

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME.value()}/image/destroy`,
    { method: 'POST', body },
  )

  const json = (await res.json()) as { result?: string; error?: { message: string } }
  if (!res.ok) {
    throw new HttpsError('internal', json?.error?.message ?? 'Cloudinary delete failed.')
  }

  return { result: json.result ?? 'ok' }
})

/**
 * One-time backfill: creates Firestore profile documents for all Firebase Auth
 * users who don't have a profile yet. Run once via Firebase Console.
 */
export const backfillUserProfiles = onCall({ enforceAppCheck: false }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  const db = getFirestore()
  const auth = getAuth()
  const userDoc = await db.doc(`users/${uid}`).get()
  const userRoles = userDoc.data()?.roles || []

  if (!userRoles.includes('super admin')) {
    throw new HttpsError('permission-denied', 'Only super admins can backfill profiles.')
  }

  let backfilled = 0
  let skipped = 0
  let errors = 0
  let pageToken: string | undefined

  try {
    do {
      const result = await auth.listUsers(1000, pageToken)

      for (const user of result.users) {
        try {
          const docRef = db.doc(`users/${user.uid}`)
          const existing = await docRef.get()

          if (existing.exists()) {
            skipped++
            continue
          }

          await docRef.set({
            uid: user.uid,
            email: user.email ?? '',
            displayName: user.displayName ?? '',
            photoURL: user.photoURL ?? '',
            roles: ['guest'],
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          backfilled++
        } catch (err) {
          console.error(`Failed to backfill ${user.uid}:`, err)
          errors++
        }
      }

      pageToken = result.pageToken
    } while (pageToken)

    return {
      success: true,
      backfilled,
      skipped,
      errors,
      total: backfilled + skipped,
      message: `Backfilled ${backfilled} profiles, skipped ${skipped} existing, ${errors} errors.`,
    }
  } catch (err) {
    console.error('Backfill failed:', err)
    throw new HttpsError('internal', `Backfill failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})
