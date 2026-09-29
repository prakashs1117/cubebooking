import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()

interface SegmentInput {
  programId: string
  date: string       // 'YYYY-MM-DD'
  startHour: number  // 0–23
  order: number
}

interface ConfirmBookingData {
  segments: SegmentInput[]
  visitType: 'onsite' | 'toad'
  teacherName: string
  teacherEmail: string
  schoolId: string
  grade: string
  studentCount: number
  accessNeeds?: string
  bookingCode: string
}

function slotsOverlap(aDate: string, aHour: number, bDate: string, bHour: number): boolean {
  // Two 1-hour slots overlap when they share the same date and startHours differ by less than 1
  return aDate === bDate && Math.abs(aHour - bHour) < 1
}

export const confirmBooking = onCall<ConfirmBookingData>(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.')
    }

    const teacherId = request.auth.uid
    const { segments, visitType, teacherName, teacherEmail, schoolId, grade, studentCount, accessNeeds, bookingCode } = request.data

    if (!segments?.length) {
      throw new HttpsError('invalid-argument', 'segments are required.')
    }

    const activeStatuses = ['confirmed', 'approved', 'pending']

    // ── Step A: check each slot is not already taken ──────────────────────────
    for (const seg of segments) {
      const snap = await db.collection('bookings')
        .where('status', 'in', activeStatuses)
        .get()

      const conflict = snap.docs.some((d) => {
        const data = d.data()
        return (data['segments'] as SegmentInput[] ?? []).some(
          (s) => s.programId === seg.programId && s.date === seg.date && s.startHour === seg.startHour,
        )
      })

      if (conflict) {
        throw new HttpsError('failed-precondition', 'slots-unavailable')
      }
    }

    // ── Step B: check teacher has no overlapping active booking ───────────────
    const teacherSnap = await db.collection('bookings')
      .where('teacherId', '==', teacherId)
      .where('status', 'in', activeStatuses)
      .get()

    for (const d of teacherSnap.docs) {
      const existingSegs: SegmentInput[] = d.data()['segments'] ?? []
      for (const existing of existingSegs) {
        for (const proposed of segments) {
          if (slotsOverlap(proposed.date, proposed.startHour, existing.date, existing.startHour)) {
            throw new HttpsError('failed-precondition', 'teacher-conflict')
          }
        }
      }
    }

    // ── Step C: write the booking ─────────────────────────────────────────────
    const bookingRef = db.collection('bookings').doc()
    await bookingRef.set({
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

    return { bookingId: bookingRef.id }
  },
)
