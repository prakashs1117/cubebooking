import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuthContext } from '../../context/AuthContext'
import AppHeader from '../AppHeader'
import WordPostFields from './WordPostFields'
import type { PostType } from '../../types'

const TYPE_TABS: { id: PostType; label: string; icon: string }[] = [
  { id: 'blog', label: 'Blog Post', icon: '✍️' },
  { id: 'word', label: 'Word Discussion', icon: '📖' },
]

const ACCENT = '#772432'

function extractYouTubeId(url: string): string | null {
  if (!url.trim()) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, color: '#374151',
  textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 7,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 13px', borderRadius: 10,
  border: '1.5px solid #E6E2DE', fontSize: 14,
  fontFamily: 'Poppins, Inter, system-ui, sans-serif', color: '#0f172a',
  outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.15s',
}

export default function CreatePostPage() {
  const { user, profile, isAdmin } = useAuthContext()
  const navigate = useNavigate()
  const { postId } = useParams<{ postId: string }>()
  const isEdit = !!postId

  const [type, setType] = useState<PostType>('blog')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')
  const [word, setWord] = useState('')
  const [wordMeaning, setWordMeaning] = useState('')
  const [wordExample, setWordExample] = useState('')
  const [wordPartOfSpeech, setWordPartOfSpeech] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingPost, setLoadingPost] = useState(isEdit)
  const [error, setError] = useState('')

  const youtubeId = extractYouTubeId(youtubeUrl)
  const youtubeInvalid = !!youtubeUrl.trim() && !youtubeId

  // Pre-fill fields when editing
  useEffect(() => {
    if (!isEdit || !postId) return
    getDoc(doc(db, 'posts', postId)).then(snap => {
      if (!snap.exists()) { navigate('/blog'); return }
      const d = snap.data() as any
      // Only owner or admin can edit
      if (d.uid !== user?.uid && !isAdmin) { navigate(`/blog/${postId}`); return }
      setType(d.type ?? 'blog')
      setTitle(d.title ?? '')
      setBody(d.body ?? '')
      setTagsRaw((d.tags ?? []).join(', '))
      setWord(d.word ?? '')
      setWordMeaning(d.wordMeaning ?? '')
      setWordExample(d.wordExample ?? '')
      setWordPartOfSpeech(d.wordPartOfSpeech ?? '')
      // Convert embed URL back to watch URL for display
      if (d.youtubeUrl) {
        const id = extractYouTubeId(d.youtubeUrl)
        setYoutubeUrl(id ? `https://www.youtube.com/watch?v=${id}` : d.youtubeUrl)
      }
      setLoadingPost(false)
    }).catch(() => { navigate('/blog'); })
  }, [postId, isEdit])

  const handleWordField = (field: string, value: string) => {
    if (field === 'word') setWord(value)
    else if (field === 'wordMeaning') setWordMeaning(value)
    else if (field === 'wordExample') setWordExample(value)
    else if (field === 'wordPartOfSpeech') setWordPartOfSpeech(value)
  }

  const parseTags = (raw: string) =>
    raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  const validate = () => {
    if (!title.trim()) return 'Title is required'
    if (!body.trim()) return 'Post content is required'
    if (type === 'word' && !word.trim()) return 'Word or phrase is required'
    if (type === 'word' && !wordMeaning.trim()) return 'Meaning is required'
    if (youtubeUrl.trim() && !youtubeId) return 'Invalid YouTube URL'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    if (!user) return
    setError('')
    setSubmitting(true)
    try {
      const tags = parseTags(tagsRaw)
      const payload: Record<string, unknown> = {
        type,
        title: title.trim(),
        body: body.trim(),
        tags,
        youtubeUrl: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null,
      }
      if (type === 'word') {
        payload.word = word.trim()
        payload.wordMeaning = wordMeaning.trim()
        payload.wordExample = wordExample.trim()
        payload.wordPartOfSpeech = wordPartOfSpeech
      } else {
        // Clear word fields if switching type
        payload.word = null
        payload.wordMeaning = null
        payload.wordExample = null
        payload.wordPartOfSpeech = null
      }

      if (isEdit && postId) {
        await updateDoc(doc(db, 'posts', postId), {
          ...payload,
          updatedAt: serverTimestamp(),
        })
        navigate(`/blog/${postId}`)
      } else {
        const newPayload = {
          ...payload,
          status: 'published',
          uid: user.uid,
          displayName: profile?.displayName || user.displayName || user.email || 'Member',
          photoURL: profile?.photoURL || user.photoURL || null,
          likeCount: 0,
          commentCount: 0,
          reactionCounts: {},
          createdAt: serverTimestamp(),
        }
        const ref = await addDoc(collection(db, 'posts'), newPayload)
        navigate(`/blog/${ref.id}`)
      }
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPost) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F3F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E6E2DE', borderTopColor: ACCENT, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const publishBtn = (
    <button
      onClick={handleSubmit}
      disabled={submitting}
      style={{
        padding: '7px 18px', borderRadius: 8,
        background: submitting ? '#e5e7eb' : ACCENT,
        color: submitting ? '#9ca3af' : '#fff',
        border: 'none', fontSize: 13, fontWeight: 800,
        cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      }}
    >
      {submitting ? (isEdit ? 'Saving…' : 'Publishing…') : isEdit ? 'Save changes' : 'Publish'}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Poppins, Inter, system-ui, sans-serif', paddingBottom: 80 }}>
      <AppHeader
        backTo={isEdit ? `/blog/${postId}` : '/blog'}
        backLabel={isEdit ? 'Post' : 'Community'}
        title={isEdit ? 'Edit Post' : 'New Post'}
        right={publishBtn}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>

        {/* Type toggle — locked when editing */}
        <div style={{
          display: 'inline-flex', gap: 4, background: '#fff',
          borderRadius: 12, padding: 4, border: '1px solid #E6E2DE', marginBottom: 22,
          opacity: isEdit ? 0.5 : 1,
          pointerEvents: isEdit ? 'none' : 'auto',
        }}>
          {TYPE_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 9, border: 'none',
                background: type === t.id ? ACCENT : 'transparent',
                color: type === t.id ? '#fff' : '#6b7280',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {isEdit && (
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: -14, marginBottom: 18 }}>
            Post type cannot be changed after publishing.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'word' ? 'Discussion title…' : 'Post title…'}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
          </div>

          {/* Word fields */}
          {type === 'word' && (
            <WordPostFields
              word={word}
              wordMeaning={wordMeaning}
              wordExample={wordExample}
              wordPartOfSpeech={wordPartOfSpeech}
              onChange={handleWordField}
              accentColor="#C89A14"
            />
          )}

          {/* Body */}
          <div>
            <label style={labelStyle}>
              {type === 'word' ? 'Discussion / Further Notes' : 'Content'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={
                type === 'word'
                  ? 'Share more context, etymology, or invite discussion…'
                  : 'Write your post here. Use blank lines to separate paragraphs.'
              }
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
              onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
              {body.length}/5000
            </div>
          </div>

          {/* YouTube URL */}
          <div>
            <label style={labelStyle}>
              YouTube Video <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af', textTransform: 'none' }}>(optional)</span>
            </label>
            <input
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=… or youtu.be/…"
              style={{ ...inputStyle, borderColor: youtubeInvalid ? '#ef4444' : '#E6E2DE' }}
              onFocus={e => (e.currentTarget.style.borderColor = youtubeInvalid ? '#ef4444' : ACCENT)}
              onBlur={e => (e.currentTarget.style.borderColor = youtubeInvalid ? '#ef4444' : '#E6E2DE')}
            />
            {youtubeInvalid && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                Paste a valid YouTube link (youtube.com/watch?v=… or youtu.be/…)
              </div>
            )}
            {youtubeId && (
              <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube preview"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af', textTransform: 'none' }}>(comma-separated)</span></label>
            <input
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
              placeholder="e.g. grammar, vocabulary, humour"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
            {tagsRaw && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {parseTags(tagsRaw).map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 999,
                    background: '#f1f5f9', color: '#475569', fontWeight: 600,
                  }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#ef4444',
            }}>
              {error}
            </div>
          )}

          {/* Bottom submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '13px', borderRadius: 12,
              background: submitting ? '#e5e7eb' : ACCENT,
              color: submitting ? '#9ca3af' : '#fff',
              border: 'none', fontSize: 15, fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            {submitting
              ? (isEdit ? 'Saving…' : 'Publishing…')
              : isEdit ? '💾 Save Changes' : '🚀 Publish Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
