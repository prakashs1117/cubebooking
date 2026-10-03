import { useEffect, useState } from 'react'
import {
  doc, setDoc, deleteDoc,
  collection, onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../shared/firebase'

export type ToadSlotStatus = 'held' | 'confirmed'

export interface ToadSlotDoc {
  date: string
  status: ToadSlotStatus
  teacherId: string
  bookingId?: string
  heldAt: Timestamp
  expiresAt: Timestamp   // heldAt + 10 min; meaningful only when status === 'held'
}

const HOLD_MINUTES = 10

// ── Write a 10-minute hold for a given date ──────────────────────────────────
// Uses setDoc (not addDoc) so the doc ID is the date string — atomic: fails if
// another teacher's non-expired hold or confirmed booking already exists for
// the same date (Firestore 'allow create' semantics: no existing doc).
export async function holdToadDate(date: string, uid: string): Promise<void> {
  const now = Date.now()
  const expiresAt = new Date(now + HOLD_MINUTES * 60 * 1000)
  await setDoc(doc(db, 'toadSlots', date), {
    date,
    status: 'held',
    teacherId: uid,
    heldAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  })
}

// ── Release a hold (called on modal close / back navigation) ─────────────────
export async function releaseToadHold(date: string, _uid: string): Promise<void> {
  try {
    // Only delete if we own it — Firestore rule enforces this server-side too
    await deleteDoc(doc(db, 'toadSlots', date))
  } catch {
    // Best-effort; ignore permission errors (e.g. already confirmed by race)
  }
}

// ── Upgrade held → confirmed (called inside createBooking batch) ──────────────
// Returns the doc ref so the caller can include it in a writeBatch.
export function toadSlotDocRef(date: string) {
  return doc(db, 'toadSlots', date)
}

// ── React hook: live map of date → ToadSlotStatus for the calendar ───────────
export type ToadDateMap = Record<string, ToadSlotStatus | 'expired'>

export function useToadDateAvailability(): ToadDateMap {
  const [map, setMap] = useState<ToadDateMap>({})

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'toadSlots'), (snap) => {
      const now = Date.now()
      const next: ToadDateMap = {}
      snap.docs.forEach((d) => {
        const data = d.data() as ToadSlotDoc
        if (data.status === 'confirmed') {
          next[data.date] = 'confirmed'
        } else {
          // 'held' — check if still within 10-min window
          const expiresMs = data.expiresAt?.toMillis?.() ?? 0
          next[data.date] = expiresMs > now ? 'held' : 'expired'
        }
      })
      setMap(next)
    })
    return unsub
  }, [])

  return map
}
