import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { addSpeakerFeedback } from '../lib/speakerFeedback'
import type { SpeakerFeedback, RoleGroup } from '../types'

export function useSpeakerFeedback(rosterId: string, currentUid?: string) {
  const [feedbackBySlot, setFeedbackBySlot] = useState<Record<string, SpeakerFeedback[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rosterId) return
    const unsub = onSnapshot(
      collection(db, 'meetings', rosterId, 'speakerFeedback'),
      (snap) => {
        const grouped: Record<string, SpeakerFeedback[]> = {}
        for (const d of snap.docs) {
          const fb = { id: d.id, ...d.data() } as SpeakerFeedback
          if (!grouped[fb.slotId]) grouped[fb.slotId] = []
          grouped[fb.slotId].push(fb)
        }
        setFeedbackBySlot(grouped)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [rosterId])

  const hasReviewed = (slotId: string): boolean => {
    if (!currentUid) return false
    return (feedbackBySlot[slotId] ?? []).some(f => f.reviewerUid === currentUid)
  }

  const submit = async (
    slotId: string,
    speakerName: string,
    speakerUid: string | null,
    slotGroup: RoleGroup,
    rating: number,
    comment: string,
    reviewerName: string,
  ) => {
    if (!currentUid) throw new Error('You must be signed in to submit feedback.')
    await addSpeakerFeedback(rosterId, {
      slotId,
      slotGroup,
      speakerUid,
      speakerName,
      reviewerUid: currentUid,
      reviewerName,
      rating,
      comment,
    })
  }

  return { feedbackBySlot, hasReviewed, submit, loading }
}
