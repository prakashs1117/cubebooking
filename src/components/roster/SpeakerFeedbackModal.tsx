import { useState } from 'react'
import { Star } from 'lucide-react'
import type { RoleGroup } from '../../types'

const GROUP_COLORS: Record<RoleGroup, string> = {
  roleTakers: '#D64A6A',
  tagl: '#C89A14',
  speakers: '#1A9E60',
  evaluators: '#3B82F6',
  tableTopics: '#D97706',
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.12s, transform 0.1s',
            transform: hovered === n ? 'scale(1.2)' : 'scale(1)',
          }}
          aria-label={`${n} star`}
        >
          <Star size={22} fill={n <= (hovered || value) ? '#f59e0b' : 'none'} />
        </button>
      ))}
    </div>
  )
}

interface SpeakerFeedbackModalProps {
  speakerName: string
  slotId: string
  speakerUid: string | null
  slotGroup: RoleGroup
  onSubmit: (rating: number, comment: string) => Promise<void>
  onClose: () => void
}

export function SpeakerFeedbackModal({
  speakerName,
  slotGroup,
  onSubmit,
  onClose,
}: SpeakerFeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const color = GROUP_COLORS[slotGroup]
  const firstName = speakerName.split(/[\s@._-]+/)[0] || speakerName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) { setError('Please write a comment.'); return }
    if (rating === 0) { setError('Please select a star rating.'); return }
    setBusy(true)
    setError(null)
    try {
      await onSubmit(rating, comment.trim())
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Could not submit feedback.')
      setBusy(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(0,0,0,0.52)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18,
          width: '100%', maxWidth: 380,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          overflow: 'hidden',
        }}
      >
        {/* Fixed header */}
        <div style={{
          flexShrink: 0,
          padding: '16px 16px 12px',
          borderBottom: '1px solid #F3F4F6',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: color,
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: color + '18', border: `1.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              💬
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                Speaker Feedback
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                Feedback for {firstName}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Rating */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Rating <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Your feedback <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <textarea
              value={comment}
              onChange={e => { setComment(e.target.value); setError(null) }}
              placeholder={`What did ${firstName} do well? What could they improve?`}
              rows={4}
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: 8, border: '1.5px solid #E2E8F0',
                fontSize: 13, fontFamily: 'inherit', color: '#111827',
                resize: 'vertical', outline: 'none',
                boxSizing: 'border-box', lineHeight: 1.6,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = color)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FFEBEE', color: '#B3261E', fontSize: 12 }}>
              {error}
            </div>
          )}
        </form>

        {/* Fixed footer */}
        <div style={{
          flexShrink: 0,
          padding: '12px 16px',
          borderTop: '1px solid #F3F4F6',
          display: 'flex', gap: 8,
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: '1.5px solid #E6E2DE', background: '#fff',
              fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={busy}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 10,
              border: 'none', background: busy ? '#D1D5DB' : color,
              fontSize: 12, fontWeight: 700, color: '#fff',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}
