import { useState } from 'react'

interface Props {
  onSubmit: (name: string) => void
}

export function GuestNamePrompt({ onSubmit }: Props) {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed.length >= 2) {
      onSubmit(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: '40px auto',
      padding: '24px 16px',
      background: '#fff',
      border: '1px solid #E6E2DE',
      borderRadius: 16,
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 8,
      }}>
        Before you vote
      </div>
      <div style={{
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        lineHeight: 1.5,
      }}>
        Please enter your name so we can record your vote.
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Your name"
        autoFocus
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: 14,
          border: `1.5px solid ${name.trim().length >= 2 ? '#772432' : '#E6E2DE'}`,
          borderRadius: 10,
          fontFamily: 'inherit',
          marginBottom: 14,
          boxSizing: 'border-box',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={name.trim().length < 2}
        style={{
          width: '100%',
          padding: '11px 16px',
          borderRadius: 10,
          border: 'none',
          fontSize: 13,
          fontWeight: 700,
          background: name.trim().length < 2 ? '#E6E2DE' : '#772432',
          color: '#fff',
          cursor: name.trim().length < 2 ? 'not-allowed' : 'pointer',
          opacity: name.trim().length < 2 ? 0.6 : 1,
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >
        Continue to vote
      </button>
    </div>
  )
}
