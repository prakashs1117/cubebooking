import { useRef, useState } from 'react'
import { Share2, Check, Loader } from 'lucide-react'
import html2canvas from 'html2canvas'
import type { CommunityPost } from '../../types'

interface Props {
  postId: string
  title: string
  post?: CommunityPost
}

const CLUB_NAME = 'Dhwani Toastmasters'

// ── Word post card ────────────────────────────────────────────────────────────

function WordCard({ post, url }: { post: CommunityPost; url: string }) {
  const tags = post.tags?.slice(0, 4) ?? []

  return (
    <div style={{
      width: 600,
      background: 'linear-gradient(145deg, #1c1108 0%, #2d1f08 40%, #1c1108 100%)',
      borderRadius: 24, overflow: 'hidden',
      fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: -80, left: '30%', width: 360, height: 240,
        background: 'radial-gradient(ellipse, rgba(200,154,20,0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -50, right: -50, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(200,154,20,0.07)',
        border: '1px solid rgba(200,154,20,0.12)',
      }} />

      <div style={{ position: 'relative', padding: '40px 44px 36px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(200,154,20,0.15)', border: '1px solid rgba(200,154,20,0.35)',
          borderRadius: 999, padding: '4px 13px', marginBottom: 26,
        }}>
          <span style={{ fontSize: 13 }}>📖</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#C89A14', letterSpacing: 1, textTransform: 'uppercase' }}>
            Word of the Day
          </span>
        </div>

        {/* Word */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: -1.5, lineHeight: 1 }}>
            {post.word}
          </span>
          {post.wordPartOfSpeech && (
            <span style={{ marginLeft: 12, fontSize: 14, fontStyle: 'italic', color: 'rgba(200,154,20,0.8)', fontWeight: 500, verticalAlign: 'middle' }}>
              {post.wordPartOfSpeech}
            </span>
          )}
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 24, letterSpacing: -0.2 }}>
          {post.title}
        </div>

        {post.wordMeaning && (
          <div style={{
            background: 'rgba(200,154,20,0.1)', border: '1px solid rgba(200,154,20,0.2)',
            borderRadius: 14, padding: '16px 20px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#C89A14', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Meaning</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, fontWeight: 500 }}>{post.wordMeaning}</div>
          </div>
        )}

        {post.wordExample && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '14px 20px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Example</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>"{post.wordExample}"</div>
          </div>
        )}

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {tags.map(tag => (
              <span key={tag} style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>#{tag}</span>
            ))}
          </div>
        )}

        <Footer displayName={post.displayName} url={url} />
      </div>
    </div>
  )
}

// ── Blog post card ────────────────────────────────────────────────────────────

function BlogCard({ post, url }: { post: CommunityPost; url: string }) {
  const tags = post.tags?.slice(0, 4) ?? []
  const excerpt = (post.body ?? '').replace(/\n+/g, ' ').trim().slice(0, 220)
  const hasImage = !!post.imageURL

  return (
    <div style={{
      width: 600,
      background: 'linear-gradient(145deg, #1A1519 0%, #2a1e27 50%, #1A1519 100%)',
      borderRadius: 24, overflow: 'hidden',
      fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Top glow */}
      <div style={{
        position: 'absolute', top: -70, right: -40, width: 320, height: 200,
        background: 'radial-gradient(ellipse, rgba(119,36,50,0.5) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -40, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(119,36,50,0.1)',
        border: '1px solid rgba(119,36,50,0.15)',
      }} />

      {/* Cover image strip */}
      {hasImage && (
        <div style={{ width: '100%', height: 180, overflow: 'hidden', position: 'relative' }}>
          <img
            src={post.imageURL}
            alt=""
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Dark gradient over image */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, transparent, #1A1519)',
          }} />
        </div>
      )}

      <div style={{ position: 'relative', padding: hasImage ? '24px 44px 36px' : '40px 44px 36px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(119,36,50,0.25)', border: '1px solid rgba(119,36,50,0.45)',
          borderRadius: 999, padding: '4px 13px', marginBottom: 20,
        }}>
          <span style={{ fontSize: 12 }}>✍️</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#F2A0A0', letterSpacing: 1, textTransform: 'uppercase' }}>
            Blog Post
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 26, fontWeight: 900, color: '#fff',
          lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 14,
        }}>
          {post.title}
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              {excerpt}{post.body && post.body.length > 220 ? '…' : ''}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {tags.map(tag => (
              <span key={tag} style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>#{tag}</span>
            ))}
          </div>
        )}

        <Footer displayName={post.displayName} url={url} />
      </div>
    </div>
  )
}

// ── Shared footer ─────────────────────────────────────────────────────────────

function Footer({ displayName, url }: { displayName: string; url: string }) {
  return (
    <div style={{
      paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(145deg, #772432, #5A1926)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 15 }}>🎙</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>{displayName}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{CLUB_NAME}</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 500, textAlign: 'right', maxWidth: 200, wordBreak: 'break-all' }}>
        {url}
      </div>
    </div>
  )
}

// ── Share logic ───────────────────────────────────────────────────────────────

async function captureAndShare(
  cardEl: HTMLElement,
  fileName: string,
  shareTitle: string,
  shareText: string,
  url: string,
) {
  const canvas = await html2canvas(cardEl, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  })

  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png', 1.0))
  if (!blob) return false

  const file = new File([blob], fileName, { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: shareTitle, text: shareText, files: [file] })
  } else if (navigator.share) {
    await navigator.share({ title: shareTitle, text: shareText, url })
  } else {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = fileName
    a.click()
  }
  return true
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareButton({ postId, title, post }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'generating' | 'done'>('idle')

  const url = `${window.location.origin}/blog/${postId}`
  const isWord = post?.type === 'word'
  const isBlog = post?.type === 'blog'

  const shareText = isWord && post
    ? [
        `📖 ${post.word}${post.wordPartOfSpeech ? ` (${post.wordPartOfSpeech})` : ''}`,
        post.wordMeaning ?? '',
        post.wordExample ? `"${post.wordExample}"` : '',
        post.tags?.length ? post.tags.map(t => `#${t}`).join(' ') : '',
        `Read more → ${url}`,
      ].filter(Boolean).join('\n\n')
    : `${title}\n\n${url}`

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!post || (!isWord && !isBlog)) {
      // No post data — plain link share
      if (navigator.share) {
        try { await navigator.share({ title, url }) } catch { /* cancelled */ }
      } else {
        await navigator.clipboard.writeText(url).catch(() => {})
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      }
      return
    }

    setState('generating')
    try {
      const fileName = isWord
        ? `word-${post.word ?? postId}.png`
        : `post-${postId}.png`
      const shareTitle = isWord
        ? `${post.word} — Word of the Day`
        : post.title

      await captureAndShare(cardRef.current!, fileName, shareTitle, shareText, url)
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Share failed:', err)
      setState('idle')
    }
  }

  return (
    <>
      {/* Off-screen canvas — rendered for both post types */}
      {post && (isWord || isBlog) && (
        <div style={{
          position: 'fixed', top: '-9999px', left: '-9999px',
          pointerEvents: 'none', zIndex: -1,
        }}>
          <div ref={cardRef}>
            {isWord
              ? <WordCard post={post} url={url} />
              : <BlogCard post={post} url={url} />}
          </div>
        </div>
      )}

      <button
        onClick={handleShare}
        disabled={state === 'generating'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none',
          cursor: state === 'generating' ? 'not-allowed' : 'pointer',
          padding: 0,
          color: state === 'done' ? '#16a34a' : '#9ca3af',
          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          transition: 'color 0.15s',
          opacity: state === 'generating' ? 0.6 : 1,
        }}
        aria-label="Share"
      >
        {state === 'generating'
          ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          : state === 'done'
          ? <Check size={15} />
          : <Share2 size={15} />}
        {state === 'generating' ? 'Generating…' : state === 'done' ? 'Shared!' : 'Share'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
