import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Pencil } from 'lucide-react'
import AppHeader from '../AppHeader'
import { useAuthContext } from '../../context/AuthContext'
import { usePost } from '../../hooks/usePost'
import PostHero from './PostHero'
import PostBody from './PostBody'
import ReactionBar from './ReactionBar'
import LikeButton from './LikeButton'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'
import CommentList from './CommentList'

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const { user, isAdmin } = useAuthContext()
  const navigate = useNavigate()
  const { post, loading, notFound } = usePost(postId ?? '')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
        <AppHeader backTo="/blog" backLabel="Community" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={28} color="#772432" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
        <AppHeader backTo="/blog" backLabel="Community" />
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#374151' }}>Post not found</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Poppins, Inter, system-ui, sans-serif', paddingBottom: 80 }}>
      <AppHeader backTo="/blog" backLabel="Community" title={post.title} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <PostHero post={post} />

        {/* Body */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #E6E2DE',
          padding: '20px 22px', marginBottom: 16,
        }}>
          <PostBody post={post} />
        </div>

        {/* Interaction bar */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E6E2DE',
          padding: '14px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <LikeButton postId={post.id} initialCount={post.likeCount} uid={user?.uid ?? null} />
          <div style={{ width: 1, height: 16, background: '#E6E2DE' }} />
          <ReactionBar postId={post.id} uid={user?.uid ?? null} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookmarkButton postId={post.id} uid={user?.uid ?? null} />
            <ShareButton postId={post.id} title={post.title} post={post} />
            {(user?.uid === post.uid || isAdmin) && (
              <button
                onClick={() => navigate(`/blog/${post.id}/edit`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 8,
                  border: '1.5px solid #E6E2DE', background: '#fff',
                  color: '#374151', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#772432'; e.currentTarget.style.color = '#772432' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6E2DE'; e.currentTarget.style.color = '#374151' }}
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #E6E2DE', margin: '20px 0' }} />

        {/* Comments */}
        <CommentList postId={post.id} uid={user?.uid ?? null} />
      </div>
    </div>
  )
}
