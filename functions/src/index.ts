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
  return aDate === bDate && aHour === bHour
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

    const VALID_SLOT_HOURS = new Set([8, 9, 10, 11, 13, 14, 15, 16])
    const VALID_PROGRAM_IDS = new Set(['cube', 'lab', 'toad'])

    for (const seg of segments) {
      if (!VALID_PROGRAM_IDS.has(seg.programId)) {
        throw new HttpsError('invalid-argument', `Invalid programId: ${seg.programId}`)
      }
      if (!Number.isInteger(seg.startHour) || !VALID_SLOT_HOURS.has(seg.startHour)) {
        throw new HttpsError('invalid-argument', `Invalid startHour: ${seg.startHour}`)
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(seg.date)) {
        throw new HttpsError('invalid-argument', `Invalid date format: ${seg.date}`)
      }
    }

    const bookingId = await db.runTransaction(async (tx) => {
      // ── Step A: check each slot is not already taken ──────────────────────────
      const activeStatuses = ['confirmed', 'approved', 'pending']
      const allBookingsSnap = await tx.get(
        db.collection('bookings').where('status', 'in', activeStatuses)
      )
      const allBookings = allBookingsSnap.docs.map((d) => d.data())

      for (const seg of segments) {
        const conflict = allBookings.some((data) =>
          (data['segments'] as SegmentInput[] ?? []).some(
            (s) => s.programId === seg.programId && s.date === seg.date && s.startHour === seg.startHour
          )
        )
        if (conflict) throw new HttpsError('failed-precondition', 'slots-unavailable')
      }

      // ── Step B: check teacher has no overlapping active booking ───────────────
      const teacherBookings = allBookings.filter((data) => data['teacherId'] === teacherId)
      for (const data of teacherBookings) {
        const existingSegs: SegmentInput[] = data['segments'] ?? []
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

      return bookingRef.id
    })

    return { bookingId }
  },
)
