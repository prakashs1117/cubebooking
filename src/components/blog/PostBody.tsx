import type { CommunityPost } from '../../types'

export default function PostBody({ post }: { post: CommunityPost }) {
  const paragraphs = (post.body ?? '').split(/\n{2,}/).filter(Boolean)

  return (
    <div>
      {/* Word definition block */}
      {post.type === 'word' && (post.wordMeaning || post.wordExample) && (
        <div style={{
          background: '#fafaf9',
          border: '1px solid #e7e5e4',
          borderLeft: '4px solid #C89A14',
          borderRadius: '0 10px 10px 0',
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          {post.wordMeaning && (
            <div style={{ marginBottom: post.wordExample ? 10 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Meaning</div>
              <div style={{ fontSize: 14, color: '#1c1917', lineHeight: 1.65 }}>{post.wordMeaning}</div>
            </div>
          )}
          {post.wordExample && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Example</div>
              <div style={{ fontSize: 14, color: '#44403c', lineHeight: 1.65, fontStyle: 'italic' }}>"{post.wordExample}"</div>
            </div>
          )}
        </div>
      )}

      {/* YouTube embed */}
      {post.youtubeUrl && (
        <div style={{
          position: 'relative', paddingBottom: '56.25%', height: 0,
          borderRadius: 12, overflow: 'hidden', marginBottom: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}>
          <iframe
            src={post.youtubeUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded video"
          />
        </div>
      )}

      {/* Body paragraphs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ margin: 0, fontSize: 15, color: '#1c1917', lineHeight: 1.75 }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
