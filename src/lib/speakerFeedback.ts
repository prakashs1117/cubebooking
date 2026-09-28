import {
  collection, doc, getDoc, setDoc, getDocs,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { SpeakerFeedback, RoleGroup } from '../types'

interface AddFeedbackPayload {
  slotId: string
  slotGroup: RoleGroup
  speakerUid: string | null
  speakerName: string
  reviewerUid: string
  reviewerName: string
  rating: number
  comment: string
}

export async function addSpeakerFeedback(rosterId: string, payload: AddFeedbackPayload): Promise<void> {
  const docId = `${payload.slotId}_${payload.reviewerUid}`
  const ref = doc(db, 'meetings', rosterId, 'speakerFeedback', docId)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    throw new Error('You have already submitted feedback for this speaker.')
  }
  await setDoc(ref, {
    slotId: payload.slotId,
    slotGroup: payload.slotGroup,
    speakerUid: payload.speakerUid,
    speakerName: payload.speakerName,
    reviewerUid: payload.reviewerUid,
    reviewerName: payload.reviewerName,
    rating: payload.rating,
    comment: payload.comment,
    submittedAt: serverTimestamp(),
  })
}

export async function getAllSpeakerFeedbackForMeeting(rosterId: string): Promise<SpeakerFeedback[]> {
  const q = query(
    collection(db, 'meetings', rosterId, 'speakerFeedback'),
    orderBy('submittedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SpeakerFeedback))
}
