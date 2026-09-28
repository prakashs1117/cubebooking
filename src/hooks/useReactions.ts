import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore'
import { auth, db } from '../firebase'
import type { PostReaction, ReactionEmoji } from '../types'

export function useReactions(postId: string) {
  const [reactions, setReactions] = useState<PostReaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) { setLoading(false); return }
    const unsub = onSnapshot(collection(db, 'posts', postId, 'reactions'), snap => {
      setReactions(snap.docs.map(d => d.data() as PostReaction))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [postId])

  const uid = auth.currentUser?.uid
  const myReaction = reactions.find(r => r.uid === uid) ?? null

  const counts: Record<string, number> = {}
  for (const r of reactions) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1
  }

  const toggle = async (emoji: ReactionEmoji) => {
    const user = auth.currentUser
    if (!user) return

    const reactionRef = doc(db, 'posts', postId, 'reactions', user.uid)
    const postRef = doc(db, 'posts', postId)
    const prev = myReaction?.emoji

    if (prev === emoji) {
      // same emoji — remove
      await deleteDoc(reactionRef)
      await updateDoc(postRef, { [`reactionCounts.${emoji}`]: increment(-1) })
    } else {
      // new or different emoji
      await setDoc(reactionRef, {
        uid: user.uid,
        displayName: user.displayName || user.email || 'Member',
        emoji,
        createdAt: serverTimestamp(),
      })
      await updateDoc(postRef, { [`reactionCounts.${emoji}`]: increment(1) })
      if (prev) {
        await updateDoc(postRef, { [`reactionCounts.${prev}`]: increment(-1) })
      }
    }
  }

  return { reactions, myReaction, counts, loading, toggle }
}
