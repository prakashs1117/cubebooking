import { useState, useRef } from 'react'
import { Send, Smile } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import type { ReactionEmoji } from '../../types'

interface Props {
  onSubmit: (body: string) => Promise<void>
  placeholder?: string
  autoFocus?: boolean
  onCancel?: () => void
}

export default function CommentComposer({ onSubmit, placeholder = 'Add a comment…', autoFocus, onCancel }: Props) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)

  const handleSubmit = async () => {
    const trimmed = body.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setBody('')
    } catch {}
    setSubmitting(false)
  }

  const insertEmoji = (emoji: ReactionEmoji) => {
    setBody(b => b + emoji)
    setEmojiOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
          style={{
            width: '100%',
            padding: '10px 44px 10px 12px',
            borderRadius: 10,
            border: '1.5px solid #E6E2DE',
            fontSize: 13,
            fontFamily: 'Poppins, Inter, system-ui, sans-serif',
            color: '#0f172a',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.6,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
          onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
        />
        <button
          ref={emojiBtnRef}
          type="button"
          onClick={() => setEmojiOpen(o => !o)}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: 2,
          }}
        >
          <Smile size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1.5px solid #E6E2DE', background: '#fff',
              fontSize: 12, fontWeight: 700, color: '#6b7280',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!body.trim() || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 8,
            background: !body.trim() || submitting ? '#e5e7eb' : '#772432',
            color: !body.trim() || submitting ? '#9ca3af' : '#fff',
            border: 'none', fontSize: 12, fontWeight: 700,
            cursor: !body.trim() || submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          <Send size={12} />
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>

      {emojiOpen && (
        <EmojiPicker
          onSelect={insertEmoji}
          onClose={() => setEmojiOpen(false)}
          anchorEl={emojiBtnRef.current}
        />
      )}
    </div>
  )
}
