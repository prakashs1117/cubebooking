import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../shared/firebase'
import { toSlotDocId, toTeacherSlotDocId } from '../config/slots'
import { toadSlotDocRef } from './toadSlotService'
import type { BookingSegment } from '../shared/types'

export class SlotTakenError extends Error {
  constructor() {
    super('SLOT_TAKEN')
    this.name = 'SlotTakenError'
  }
}

export interface CreateBookingParams {
  uid: string
  teacherName: string
  teacherEmail: string
  schoolId: string
  schoolName?: string
  visitType: 'onsite' | 'toad'
  segments: BookingSegment[]
  grade: string
  studentCount: number
  accessNeeds: string
  bookingCode: string
  truckParking?: string
}

export async function createBooking(params: CreateBookingParams): Promise<{ bookingId: string }> {
  const { uid, teacherName, teacherEmail, schoolId, schoolName, visitType, segments, grade, studentCount, accessNeeds, bookingCode, truckParking } = params

  const batch = writeBatch(db)
  const bookingRef = doc(collection(db, 'bookings'))

  batch.set(bookingRef, {
    type: visitType,
    teacherId: uid,
    teacherName,
    teacherEmail,
    schoolId,
    ...(schoolName ? { schoolName } : {}),
    segments,
    grade,
    studentCount,
    accessNeeds,
    status: visitType === 'toad' ? 'pending' : 'confirmed',
    bookingCode,
    ...(truckParking ? { truckParking } : {}),
    createdAt: serverTimestamp(),
  })

  if (visitType === 'toad') {
    // Mark the toadSlots date as confirmed atomically with the booking.
    // Use set+merge so it works whether or not a hold doc exists (hold may
    // have expired or not been acquired if the teacher navigated directly).
    const toadDate = segments[0]?.date
    if (toadDate) {
      batch.set(toadSlotDocRef(toadDate), {
        date: toadDate,
        status: 'confirmed',
        teacherId: uid,
        bookingId: bookingRef.id,
      }, { merge: true })
    }
  }

  if (visitType !== 'toad') {
    for (const seg of segments) {
      const slotId = toSlotDocId(seg.date, seg.programId, seg.startHour)
      batch.set(doc(db, 'slots', slotId), {
        teacherId: uid,
        bookingId: bookingRef.id,
        programId: seg.programId,
        date: seg.date,
        startHour: seg.startHour,
        createdAt: serverTimestamp(),
      })
    }

    // One teacherSlots lock per unique hour (prevents teacher double-booking across programs)
    const uniqueHours = [...new Set(segments.map((s) => `${s.date}:${s.startHour}`))]
    for (const key of uniqueHours) {
      const [date, hourStr] = key.split(':')
      const startHour = Number(hourStr)
      const teacherSlotId = toTeacherSlotDocId(uid, date, startHour)
      batch.set(doc(db, 'teacherSlots', teacherSlotId), {
        teacherId: uid,
        bookingId: bookingRef.id,
        date,
        startHour,
        createdAt: serverTimestamp(),
      })
    }
  }

  try {
    await batch.commit()
    return { bookingId: bookingRef.id }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? ''
    if (code === 'permission-denied') throw new SlotTakenError()
    throw err
  }
}
