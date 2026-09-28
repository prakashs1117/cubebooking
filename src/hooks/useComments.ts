import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore'
import { auth, db } from '../firebase'
import type { PostComment } from '../types'

export interface CommentThread {
  comment: PostComment
  replies: PostComment[]
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) { setLoading(false); return }
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostComment)))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [postId])

  const tree: CommentThread[] = comments
    .filter(c => !c.parentId)
    .map(comment => ({
      comment,
      replies: comments.filter(c => c.parentId === comment.id),
    }))

  const addComment = async (body: string, parentId?: string) => {
    const user = auth.currentUser
    if (!user) throw new Error('Must be signed in')
    const trimmed = body.trim()
    if (!trimmed) throw new Error('Comment cannot be empty')

    const batch = writeBatch(db)
    const commentRef = doc(collection(db, 'posts', postId, 'comments'))
    batch.set(commentRef, {
      postId,
      uid: user.uid,
      displayName: user.displayName || user.email || 'Member',
      photoURL: user.photoURL || null,
      body: trimmed,
      parentId: parentId ?? null,
      likeCount: 0,
      deleted: false,
      createdAt: serverTimestamp(),
    })
    batch.update(doc(db, 'posts', postId), { commentCount: increment(1) })
    await batch.commit()
  }

  return { comments, tree, loading, addComment }
}
