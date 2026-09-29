import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()

interface BookingSegmentInput {
  sessionId: string
  programId: string
  order: number
}

interface ConfirmBookingData {
  sessionIds: string[]
  segments: BookingSegmentInput[]
  visitType: 'onsite' | 'toad'
  teacherName: string
  teacherEmail: string
  schoolId: string
  grade: string
  studentCount: number
  accessNeeds?: string
  bookingCode: string
}

function rangesOverlap(
  aStart: FirebaseFirestore.Timestamp,
  aEnd: FirebaseFirestore.Timestamp,
  bStart: FirebaseFirestore.Timestamp,
  bEnd: FirebaseFirestore.Timestamp,
): boolean {
  return aStart.toMillis() < bEnd.toMillis() && aEnd.toMillis() > bStart.toMillis()
}

export const confirmBooking = onCall<ConfirmBookingData>(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.')
    }

    const teacherId = request.auth.uid
    const { sessionIds, segments, visitType, teacherName, teacherEmail, schoolId, grade, studentCount, accessNeeds, bookingCode } = request.data

    if (!sessionIds?.length || !segments?.length) {
      throw new HttpsError('invalid-argument', 'sessionIds and segments are required.')
    }

    const bookingId = await db.runTransaction(async (tx) => {
      // ── Step A: verify each session is still open and has capacity ──────────
      const sessionRefs = sessionIds.map((id) => db.collection('sessions').doc(id))
      const sessionSnaps = await Promise.all(sessionRefs.map((ref) => tx.get(ref)))

      const proposedWindows: { start: FirebaseFirestore.Timestamp; end: FirebaseFirestore.Timestamp }[] = []

      for (const snap of sessionSnaps) {
        if (!snap.exists) {
          throw new HttpsError('failed-precondition', 'slots-unavailable')
        }
        const data = snap.data()!
        if (data['status'] !== 'open') {
          throw new HttpsError('failed-precondition', 'slots-unavailable')
        }
        const taken: number = data['seatsTaken'] ?? 0
        const held: number = data['seatsHeld'] ?? 0
        const capacity: number = data['capacity'] ?? 0
        if (taken + held >= capacity) {
          throw new HttpsError('failed-precondition', 'slots-unavailable')
        }
        proposedWindows.push({
          start: data['start'] as FirebaseFirestore.Timestamp,
          end: data['end'] as FirebaseFirestore.Timestamp,
        })
      }

      // ── Step B: verify teacher has no overlapping active booking ────────────
      const bookingsSnap = await tx.get(
        db.collection('bookings')
          .where('teacherId', '==', teacherId)
          .where('status', 'in', ['confirmed', 'approved', 'pending']),
      )

      for (const bookingDoc of bookingsSnap.docs) {
        const bData = bookingDoc.data()
        const existingSegments: BookingSegmentInput[] = bData['segments'] ?? []
        for (const seg of existingSegments) {
          const existingSessionSnap = await tx.get(db.collection('sessions').doc(seg.sessionId))
          if (!existingSessionSnap.exists) continue
          const eData = existingSessionSnap.data()!
          const eStart = eData['start'] as FirebaseFirestore.Timestamp
          const eEnd = eData['end'] as FirebaseFirestore.Timestamp
          for (const proposed of proposedWindows) {
            if (rangesOverlap(proposed.start, proposed.end, eStart, eEnd)) {
              throw new HttpsError('failed-precondition', 'teacher-conflict')
            }
          }
        }
      }

      // ── Step C: write the booking ────────────────────────────────────────────
      const bookingRef = db.collection('bookings').doc()
      tx.set(bookingRef, {
        type: visitType,
        teacherId,
        teacherName,
        teacherEmail,
        schoolId,
        segments,
        grade,
        studentCount,
        accessNeeds: accessNeeds ?? '',
        status: visitType === 'toad' ? 'pending' : 'confirmed',
        bookingCode,
        createdAt: FieldValue.serverTimestamp(),
      })

      // ── Step D: increment seatsTaken on each session ─────────────────────────
      for (const ref of sessionRefs) {
        tx.update(ref, { seatsTaken: FieldValue.increment(1) })
      }

      return bookingRef.id
    })

    return { bookingId }
  },
)
