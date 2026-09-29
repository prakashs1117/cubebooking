import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../shared/firebase'
import type { BookingDoc } from '../hooks/queries/useBookings'

/**
 * Check if session slots conflict with existing bookings for the user
 * @param teacherId - The teacher's UID
 * @param sessionIds - Array of session IDs to check
 * @returns true if there's a conflict, false if all slots are available
 */
export async function hasBookingConflict(teacherId: string, sessionIds: string[]): Promise<boolean> {
  if (!sessionIds.length) return false

  try {
    // Get all confirmed/approved bookings for this teacher
    const q = query(
      collection(db, 'bookings'),
      where('teacherId', '==', teacherId),
      where('status', 'in', ['confirmed', 'approved', 'pending']),
    )
    const snap = await getDocs(q)
    const existingBookings = snap.docs.map((d) => d.data() as BookingDoc)

    // Check if any existing booking uses the same session IDs
    for (const existing of existingBookings) {
      const existingSessionIds = existing.segments?.map((s) => s.sessionId) ?? []
      for (const sessionId of sessionIds) {
        if (existingSessionIds.includes(sessionId)) {
          return true // Conflict found!
        }
      }
    }

    return false // No conflicts
  } catch (error) {
    console.error('Error checking booking conflicts:', error)
    // Fail open - allow the booking if we can't check
    return false
  }
}

/**
 * Get details about what bookings conflict with the given sessions
 */
export async function getConflictingBookings(
  teacherId: string,
  sessionIds: string[],
): Promise<BookingDoc[]> {
  if (!sessionIds.length) return []

  try {
    const q = query(
      collection(db, 'bookings'),
      where('teacherId', '==', teacherId),
      where('status', 'in', ['confirmed', 'approved', 'pending']),
    )
    const snap = await getDocs(q)
    const existingBookings = snap.docs.map((d) => d.data() as BookingDoc)

    // Return only bookings that conflict
    return existingBookings.filter((existing) => {
      const existingSessionIds = existing.segments?.map((s) => s.sessionId) ?? []
      return sessionIds.some((sessionId) => existingSessionIds.includes(sessionId))
    })
  } catch (error) {
    console.error('Error getting conflicting bookings:', error)
    return []
  }
}

export function slotsOverlapTeacherBookings(
  proposedSlots: { start: Date; end: Date }[],
  existingWindows: { start: Date; end: Date }[],
): boolean {
  for (const proposed of proposedSlots) {
    for (const existing of existingWindows) {
      if (proposed.start < existing.end && proposed.end > existing.start) {
        return true
      }
    }
  }
  return false
}
