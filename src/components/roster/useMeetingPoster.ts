import { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc, onSnapshot, collection, addDoc, deleteDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import type { MeetingDetails, RoleSlot, RoleGroup } from '../../types'
import { ROLE_CATALOGUE, matchesEntry } from '../../lib/roleCatalogue'
import { track } from '../../lib/analytics'

function capitalizeName(name: string): string {
  return name.replace(/\b\w/g, c => c.toUpperCase())
}

/** Best-effort lookup of a member's profile photo for the attendance doc. */
async function lookupPhotoURL(uid: string): Promise<string | undefined> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? (snap.data().photoURL as string | undefined) : undefined
  } catch {
    return undefined
  }
}

const DEFAULT_MEETING: MeetingDetails = {
  club: '', sub: '', meetingNo: '', theme: '', wod: '', pod: '',
  date: '', timing: '', location: '',
}

export function useMeetingPoster(rosterId: string) {
  const [meeting, setMeeting] = useState<MeetingDetails>(DEFAULT_MEETING)
  const [slots, setSlots] = useState<RoleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, _setError] = useState<string | null>(null)

  // Subscribe to meeting doc
  useEffect(() => {
    if (!rosterId) return
    const meetingRef = doc(db, 'meetings', rosterId)
    const unsub = onSnapshot(
      meetingRef,
      (snap) => {
        if (snap.exists()) {
          setMeeting((prev) => ({ ...prev, ...snap.data() }))
        }
      },
      (err) => console.error('Meeting listener error:', err),
    )
    return unsub
  }, [rosterId])

  // Subscribe to role slots
  useEffect(() => {
    if (!rosterId) {
      setLoading(false)
      return
    }
    const slotsRef = collection(db, 'meetings', rosterId, 'roleSlots')
    const unsub = onSnapshot(
      slotsRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleSlot))
        data.sort((a, b) => (a.order - b.order) || a.group.localeCompare(b.group))
        setSlots(data)
        setLoading(false)
      },
      (err) => {
        console.error('Slots listener error:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [rosterId])

  const claimSlot = async (slotId: string, pathwaysLevel?: string, speechTopic?: string) => {
    if (!auth.currentUser) throw new Error('Must be signed in')
    const currentUser = auth.currentUser

    try {
      const slot = slots.find((s) => s.id === slotId)
      if (!slot) throw new Error('Slot not found')
      if (slot.uid !== null) throw new Error('Slot is already claimed')

      // Check 2-role limit for roleTakers
      if (slot.group === 'roleTakers') {
        const myRoles = slots.filter((s) => s.group === 'roleTakers' && s.uid === currentUser.uid)
        if (myRoles.length >= 2) {
          throw new Error('Maximum 2 roles allowed. Release a role first.')
        }
      }

      const photoURL = await lookupPhotoURL(currentUser.uid)

      const batch = writeBatch(db)

      const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
      batch.update(slotRef, {
        uid: currentUser.uid,
        name: capitalizeName(currentUser.displayName || currentUser.email || 'Member'),
        claimedAt: serverTimestamp(),
        ...(pathwaysLevel ? { pathwaysLevel } : {}),
        ...(speechTopic ? { speechTopic } : {}),
      })

      const eventRef = doc(collection(db, 'meetings', rosterId, 'roleClaimEvents'))
      batch.set(eventRef, {
        uid: currentUser.uid,
        displayName: capitalizeName(currentUser.displayName || currentUser.email || 'Member'),
        slotId,
        group: slot.group,
        role: slot.role,
        action: 'claim',
        at: serverTimestamp(),
      })

      // Claiming a role means you're attending — mark it automatically
      const attendanceRef = doc(db, 'meetings', rosterId, 'attendance', currentUser.uid)
      batch.set(attendanceRef, {
        uid: currentUser.uid,
        displayName: capitalizeName(currentUser.displayName || currentUser.email || 'Member'),
        ...(photoURL ? { photoURL } : {}),
        status: 'attending',
        updatedAt: serverTimestamp(),
      }, { merge: true })

      await batch.commit()
      track({ name: 'role_claimed', params: { roster_id: rosterId, role: slot.role, group: slot.group } })
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not claim slot')
    }
  }

  // For fixed catalogue roles: finds an open slot or creates one, then claims it.
  const claimOrCreateSlot = async (roleCode: string, pathwaysLevel?: string, speechTopic?: string) => {
    if (!auth.currentUser) throw new Error('Must be signed in')
    const currentUser = auth.currentUser

    const entry = ROLE_CATALOGUE.find(e => e.code === roleCode)
    if (!entry) throw new Error(`Unknown role: ${roleCode}`)

    let slot = slots.find(s => matchesEntry(s.role, entry) && !s.uid && !s.name)
    let slotId: string

    if (slot) {
      slotId = slot.id
    } else {
      // Slot was deleted — recreate it
      const groupSlots = slots.filter(s => s.group === entry.group)
      const maxOrder = groupSlots.length > 0 ? Math.max(...groupSlots.map(s => s.order)) : -1
      const slotsRef = collection(db, 'meetings', rosterId, 'roleSlots')
      const newSlotRef = await addDoc(slotsRef, {
        group: entry.group,
        role: roleCode,
        order: maxOrder + 1,
        name: '',
        uid: null,
        claimedAt: null,
      })
      slotId = newSlotRef.id
      slot = { id: slotId, group: entry.group, role: roleCode, order: maxOrder + 1, name: '', uid: null }
    }

    const photoURL = await lookupPhotoURL(currentUser.uid)

    const batch = writeBatch(db)
    const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
    batch.update(slotRef, {
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email || 'Member',
      claimedAt: serverTimestamp(),
      ...(pathwaysLevel ? { pathwaysLevel } : {}),
      ...(speechTopic ? { speechTopic } : {}),
    })
    const eventRef = doc(collection(db, 'meetings', rosterId, 'roleClaimEvents'))
    batch.set(eventRef, {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email || 'Member',
      slotId,
      group: entry.group,
      role: roleCode,
      action: 'claim',
      at: serverTimestamp(),
    })

    // Claiming a role means you're attending — mark it automatically
    const attendanceRef = doc(db, 'meetings', rosterId, 'attendance', currentUser.uid)
    batch.set(attendanceRef, {
      uid: currentUser.uid,
      displayName: capitalizeName(currentUser.displayName || currentUser.email || 'Member'),
      ...(photoURL ? { photoURL } : {}),
      status: 'attending',
      updatedAt: serverTimestamp(),
    }, { merge: true })

    await batch.commit()
    track({ name: 'role_claimed', params: { roster_id: rosterId, role: roleCode, group: entry.group } })
    return slotId
  }

  const releaseSlot = async (slotId: string) => {
    if (!auth.currentUser) throw new Error('Must be signed in')

    try {
      const slot = slots.find((s) => s.id === slotId)
      if (!slot) throw new Error('Slot not found')
      if (slot.uid !== auth.currentUser.uid) throw new Error('Only the slot owner can release')

      const batch = writeBatch(db)

      const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
      batch.update(slotRef, {
        uid: null,
        name: '',
        claimedAt: null,
        pathwaysLevel: null,
        speechTopic: null,
      })

      const eventRef = doc(collection(db, 'meetings', rosterId, 'roleClaimEvents'))
      batch.set(eventRef, {
        uid: auth.currentUser.uid,
        displayName: capitalizeName(auth.currentUser.displayName || auth.currentUser.email || 'Member'),
        slotId,
        group: slot.group,
        role: slot.role,
        action: 'release',
        at: serverTimestamp(),
      })

      await batch.commit()
      track({ name: 'role_released', params: { roster_id: rosterId, role: slot.role, group: slot.group } })
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not release slot')
    }
  }

  const updateMeeting = async (patch: Partial<MeetingDetails>) => {
    try {
      const meetingRef = doc(db, 'meetings', rosterId)
      await updateDoc(meetingRef, { ...patch, updatedAt: serverTimestamp() })
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not update meeting')
    }
  }

  const addSlot = async (group: RoleGroup, role: string = '') => {
    try {
      const groupSlots = slots.filter((s) => s.group === group)
      const maxOrder = groupSlots.length > 0 ? Math.max(...groupSlots.map((s) => s.order)) : -1

      const slotsRef = collection(db, 'meetings', rosterId, 'roleSlots')
      await addDoc(slotsRef, {
        group,
        role,
        order: maxOrder + 1,
        name: '',
        uid: null,
        claimedAt: null,
      })
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not add slot')
    }
  }

  const addSpeakerWithEvaluator = async () => {
    try {
      const speakerSlots = slots.filter((s) => s.group === 'speakers')
      const evalSlots    = slots.filter((s) => s.group === 'evaluators')
      const nextPairIndex = Math.max(
        speakerSlots.length > 0 ? Math.max(...speakerSlots.map(s => s.pairIndex ?? 0)) + 1 : 0,
        evalSlots.length    > 0 ? Math.max(...evalSlots.map(s => s.pairIndex ?? 0))    + 1 : 0,
        speakerSlots.length,
      )
      const maxSpeakerOrder = speakerSlots.length > 0 ? Math.max(...speakerSlots.map(s => s.order)) : -1
      const maxEvalOrder    = evalSlots.length    > 0 ? Math.max(...evalSlots.map(s => s.order))    : -1

      const slotsRef = collection(db, 'meetings', rosterId, 'roleSlots')
      const batch = writeBatch(db)

      const speakerRef = doc(slotsRef)
      batch.set(speakerRef, {
        group: 'speakers', role: 'SPKR',
        order: maxSpeakerOrder + 1,
        pairIndex: nextPairIndex,
        name: '', uid: null, claimedAt: null,
      })

      const evalRef = doc(slotsRef)
      batch.set(evalRef, {
        group: 'evaluators', role: 'EVAL',
        order: maxEvalOrder + 1,
        pairIndex: nextPairIndex,
        name: '', uid: null, claimedAt: null,
      })

      await batch.commit()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not add speaker pair')
    }
  }

  const removeSlot = async (slotId: string) => {
    try {
      const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
      await deleteDoc(slotRef)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not remove slot')
    }
  }

  const updateSlotName = async (slotId: string, name: string) => {
    try {
      const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
      await updateDoc(slotRef, { name: capitalizeName(name) })
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not update slot name')
    }
  }

  const updateSlotField = async (slotId: string, fields: Partial<Pick<import('../../types').RoleSlot, 'speechTopic' | 'pathwaysLevel' | 'rolePrefix'>>) => {
    try {
      const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
      await updateDoc(slotRef, fields as Record<string, unknown>)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not update slot')
    }
  }

  const adminOverrideSlot = async (slotId: string, name: string, uid: string | null, rolePrefix?: string) => {
    try {
      const photoURL = uid ? await lookupPhotoURL(uid) : undefined

      const batch = writeBatch(db)

      const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slotId)
      batch.update(slotRef, {
        name: capitalizeName(name),
        uid,
        claimedAt: uid ? serverTimestamp() : null,
        ...(rolePrefix !== undefined ? { rolePrefix } : {}),
      })

      // Assigning a known club member to a role means they're attending
      if (uid) {
        const attendanceRef = doc(db, 'meetings', rosterId, 'attendance', uid)
        batch.set(attendanceRef, {
          uid,
          displayName: capitalizeName(name),
          ...(photoURL ? { photoURL } : {}),
          status: 'attending',
          updatedAt: serverTimestamp(),
        }, { merge: true })
      }

      await batch.commit()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not override slot')
    }
  }

  const resetForNewWeek = async () => {
    try {
      const batch = writeBatch(db)

      // Reset all slots: clear name, uid, claimedAt
      for (const slot of slots) {
        const slotRef = doc(db, 'meetings', rosterId, 'roleSlots', slot.id)
        batch.update(slotRef, {
          name: '',
          uid: null,
          claimedAt: null,
        })
      }

      await batch.commit()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Could not reset for new week')
    }
  }

  return {
    meeting,
    slots,
    loading,
    error,
    claimSlot,
    claimOrCreateSlot,
    releaseSlot,
    updateMeeting,
    addSlot,
    addSpeakerWithEvaluator,
    updateSlotField,
    removeSlot,
    updateSlotName,
    adminOverrideSlot,
    resetForNewWeek,
  }
}
