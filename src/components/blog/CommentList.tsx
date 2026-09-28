import { Link, useLocation } from 'react-router-dom'
import { useComments } from '../../hooks/useComments'
import CommentItem from './CommentItem'
import CommentComposer from './CommentComposer'
import { MessageCircle } from 'lucide-react'

interface Props {
  postId: string
  uid: string | null
}

export default function CommentList({ postId, uid }: Props) {
  const { tree, loading, addComment } = useComments(postId)
  const location = useLocation()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <MessageCircle size={16} color="#772432" />
        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
          {tree.reduce((acc, t) => acc + 1 + t.replies.length, 0)} Comments
        </span>
      </div>

      {uid ? (
        <div style={{ marginBottom: 20 }}>
          <CommentComposer
            placeholder="Share your thoughts…"
            onSubmit={body => addComment(body)}
          />
        </div>
      ) : (
        <div style={{
          background: '#f8fafc', border: '1px solid #E6E2DE',
          borderRadius: 10, padding: '12px 14px', marginBottom: 20,
          fontSize: 13, color: '#6b7280', textAlign: 'center',
        }}>
          <Link
            to={`/signin?returnTo=${encodeURIComponent(location.pathname)}`}
            style={{ color: '#772432', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign in
          </Link>
          {' '}to join the discussion
        </div>
      )}

      {loading ? (
        <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading comments…</div>
      ) : tree.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 13 }}>
          No comments yet. Be the first!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tree.map(({ comment, replies }) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies}
              uid={uid}
              onReply={(body, parentId) => addComment(body, parentId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
