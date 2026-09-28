import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CornerDownRight } from 'lucide-react'
import type { PostComment } from '../../types'
import CommentComposer from './CommentComposer'
import LikeButton from './LikeButton'

function initials(name: string) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function avatarColor(uid: string) {
  let hash = 0
  for (const c of uid) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`
}

interface Props {
  comment: PostComment
  replies?: PostComment[]
  uid: string | null
  onReply: (body: string, parentId: string) => Promise<void>
  isReply?: boolean
}

export default function CommentItem({ comment, replies = [], uid, onReply, isReply }: Props) {
  const [replyOpen, setReplyOpen] = useState(false)

  if (comment.deleted) {
    return (
      <div style={{ padding: '8px 0', color: '#9ca3af', fontSize: 12, fontStyle: 'italic' }}>
        [Comment removed]
      </div>
    )
  }

  const timeAgo = comment.createdAt?.toDate
    ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })
    : ''

  return (
    <div style={{ marginLeft: isReply ? 36 : 0 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Avatar */}
        {comment.photoURL ? (
          <img src={comment.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 1 }} />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginTop: 1,
            background: avatarColor(comment.uid),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 800,
          }}>
            {initials(comment.displayName)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: '#f8fafc', borderRadius: '0 12px 12px 12px',
            padding: '10px 13px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{comment.displayName}</span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>{timeAgo}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#1c1917', lineHeight: 1.65 }}>{comment.body}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, paddingLeft: 4 }}>
            <LikeButton postId={comment.postId} initialCount={comment.likeCount} uid={uid} size="sm" />
            {!isReply && uid && (
              <button
                onClick={() => setReplyOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', padding: 0,
                }}
              >
                <CornerDownRight size={11} /> Reply
              </button>
            )}
          </div>

          {replyOpen && (
            <div style={{ marginTop: 10 }}>
              <CommentComposer
                placeholder={`Reply to ${comment.displayName}…`}
                autoFocus
                onCancel={() => setReplyOpen(false)}
                onSubmit={async (body) => {
                  await onReply(body, comment.id)
                  setReplyOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} uid={uid} onReply={onReply} isReply />
          ))}
        </div>
      )}
    </div>
  )
}
