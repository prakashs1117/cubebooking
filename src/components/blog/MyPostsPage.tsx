import { useNavigate } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import AppHeader from '../AppHeader'
import { useAuthContext } from '../../context/AuthContext'
import { useMyPosts } from '../../hooks/useMyPosts'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'

export default function MyPostsPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { posts, loading } = useMyPosts(user?.uid)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Poppins, Inter, system-ui, sans-serif', paddingBottom: 80 }}>
      <AppHeader
        backTo="/blog"
        backLabel="Community"
        title="My Posts"
        right={
          <button
            onClick={() => navigate('/blog/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: '#772432', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <PenLine size={13} /> New Post
          </button>
        }
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[0, 1, 2].map(i => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#374151', marginBottom: 8 }}>
              No posts yet
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
              Share your thoughts, vocabulary discoveries, or insights with the club
            </div>
            <button
              onClick={() => navigate('/blog/new')}
              style={{
                padding: '11px 28px', borderRadius: 12,
                background: '#772432', color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Write your first post
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </div>
            {posts.map(post => (
              <div key={post.id} style={{ position: 'relative' }}>
                <PostCard post={post} />
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/blog/${post.id}/edit`) }}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 7,
                    background: '#fff', border: '1.5px solid #E6E2DE',
                    color: '#374151', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
