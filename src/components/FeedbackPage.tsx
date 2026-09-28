import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthContext } from '../context/AuthContext'
import AppHeader from './AppHeader'
import { MessageSquare, Lightbulb, Bug, HelpCircle, Star, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type FeedbackType = 'feedback' | 'suggestion' | 'bug' | 'other'

const TYPE_OPTIONS: { value: FeedbackType; label: string; icon: React.ReactNode; description: string; color: string; bg: string }[] = [
  {
    value: 'feedback',
    label: 'General Feedback',
    icon: <MessageSquare size={20} />,
    description: 'Share your experience or thoughts',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    value: 'suggestion',
    label: 'Suggestion',
    icon: <Lightbulb size={20} />,
    description: 'Propose a new feature or improvement',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    value: 'bug',
    label: 'Report a Bug',
    icon: <Bug size={20} />,
    description: 'Something not working as expected',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    value: 'other',
    label: 'Other',
    icon: <HelpCircle size={20} />,
    description: 'Anything else on your mind',
    color: '#64748b',
    bg: '#f8fafc',
  },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.12s, transform 0.1s',
            transform: hovered === n ? 'scale(1.2)' : 'scale(1)',
          }}
          aria-label={`${n} star`}
        >
          <Star size={26} fill={n <= (hovered || value) ? '#f59e0b' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const { user, profile } = useAuthContext()
  const navigate = useNavigate()

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feedback')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [name, setName] = useState(profile?.displayName ?? '')
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const selected = TYPE_OPTIONS.find(t => t.value === feedbackType)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please enter your message.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        type: feedbackType,
        message: message.trim(),
        rating: rating || null,
        name: name.trim() || null,
        email: email.trim() || null,
        uid: user?.uid ?? null,
        submittedAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
        <AppHeader />
        <div style={{
          maxWidth: 520, margin: '0 auto', padding: '60px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <CheckCircle2 size={40} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
            Thank you!
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: '0 0 32px' }}>
            Your {feedbackType} has been received. We appreciate you taking the time to share — it helps us improve the experience for everyone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setSubmitted(false); setMessage(''); setRating(0) }}
              style={{
                padding: '10px 22px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', background: '#fff',
                fontSize: 14, fontWeight: 700, color: '#374151',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 22px', borderRadius: 10,
                border: 'none', background: '#772432',
                fontSize: 14, fontWeight: 700, color: '#fff',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
      <AppHeader />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px 100px' }}>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', marginBottom: 20, padding: 0,
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Feedback & Suggestions
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Help us improve — your input shapes the experience for the entire club.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Type selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 10 }}>
              What kind of feedback?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {TYPE_OPTIONS.map(opt => {
                const active = feedbackType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFeedbackType(opt.value)}
                    style={{
                      textAlign: 'left', padding: '12px 14px',
                      borderRadius: 12,
                      border: active ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                      background: active ? opt.bg : '#fff',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: active ? opt.color : '#94a3b8', display: 'flex', transition: 'color 0.15s' }}>
                        {opt.icon}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: active ? opt.color : '#374151', transition: 'color 0.15s' }}>
                        {opt.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                      {opt.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 10 }}>
              Overall Experience <span style={{ fontWeight: 400, color: '#94a3b8', textTransform: 'none' }}>(optional)</span>
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>
              Your Message <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setError('') }}
              placeholder={
                feedbackType === 'feedback' ? 'Share what you think about the app, meetings, or your experience…'
                : feedbackType === 'suggestion' ? 'Describe your idea or improvement in detail…'
                : feedbackType === 'bug' ? 'What happened? What were you trying to do? Which page/feature?'
                : 'Type your message here…'
              }
              rows={5}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: 10, border: error ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                fontSize: 14, fontFamily: 'inherit', color: '#0f172a',
                resize: 'vertical', outline: 'none',
                background: '#fff', lineHeight: 1.6,
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = selected.color)}
              onBlur={e => (e.currentTarget.style.borderColor = error ? '#ef4444' : '#e2e8f0')}
            />
            {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
          </div>

          {/* Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>
                Name <span style={{ fontWeight: 400, color: '#94a3b8', textTransform: 'none' }}>(optional)</span>
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 8, border: '1.5px solid #e2e8f0',
                  fontSize: 13, fontFamily: 'inherit', color: '#0f172a',
                  outline: 'none', background: '#fff', boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = selected.color)}
                onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>
                Email <span style={{ fontWeight: 400, color: '#94a3b8', textTransform: 'none' }}>(optional)</span>
              </label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 8, border: '1.5px solid #e2e8f0',
                  fontSize: 13, fontFamily: 'inherit', color: '#0f172a',
                  outline: 'none', background: '#fff', boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = selected.color)}
                onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>

          {/* Anonymous note */}
          {!user && (
            <div style={{
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 12, color: '#64748b', lineHeight: 1.5,
            }}>
              You're submitting anonymously. Sign in to have your name pre-filled and for us to follow up if needed.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '13px 28px', borderRadius: 10,
              background: submitting ? '#94a3b8' : '#772432',
              color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              alignSelf: 'flex-start',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>

        </form>
      </div>
    </div>
  )
}
