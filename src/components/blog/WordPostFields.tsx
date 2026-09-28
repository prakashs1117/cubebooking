interface Props {
  word: string
  wordMeaning: string
  wordExample: string
  wordPartOfSpeech: string
  onChange: (field: string, value: string) => void
  accentColor: string
}

const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'other']

export default function WordPostFields({ word, wordMeaning, wordExample, wordPartOfSpeech, onChange, accentColor }: Props) {
  const fieldStyle = (hasValue: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: `1.5px solid ${hasValue ? accentColor : '#E6E2DE'}`,
    fontSize: 14,
    fontFamily: 'Poppins, Inter, system-ui, sans-serif',
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  const label = (text: string, required?: boolean) => (
    <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
      {text}{required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>📖 Word Discussion Fields</div>

      <div>
        {label('Word or Phrase', true)}
        <input
          value={word}
          onChange={e => onChange('word', e.target.value)}
          placeholder="e.g. Ephemeral"
          style={fieldStyle(!!word)}
          onFocus={e => (e.currentTarget.style.borderColor = accentColor)}
          onBlur={e => (e.currentTarget.style.borderColor = word ? accentColor : '#E6E2DE')}
        />
      </div>

      <div>
        {label('Part of Speech')}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PARTS_OF_SPEECH.map(pos => (
            <button
              key={pos}
              type="button"
              onClick={() => onChange('wordPartOfSpeech', wordPartOfSpeech === pos ? '' : pos)}
              style={{
                padding: '4px 12px', borderRadius: 999,
                border: wordPartOfSpeech === pos ? `1.5px solid ${accentColor}` : '1.5px solid #e2e8f0',
                background: wordPartOfSpeech === pos ? '#fffbeb' : '#fff',
                color: wordPartOfSpeech === pos ? '#92400e' : '#64748b',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div>
        {label('Meaning / Definition', true)}
        <textarea
          value={wordMeaning}
          onChange={e => onChange('wordMeaning', e.target.value)}
          placeholder="What does this word mean?"
          rows={3}
          style={{ ...fieldStyle(!!wordMeaning), resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => (e.currentTarget.style.borderColor = accentColor)}
          onBlur={e => (e.currentTarget.style.borderColor = wordMeaning ? accentColor : '#E6E2DE')}
        />
      </div>

      <div>
        {label('Usage Example')}
        <textarea
          value={wordExample}
          onChange={e => onChange('wordExample', e.target.value)}
          placeholder="Use the word in a sentence…"
          rows={2}
          style={{ ...fieldStyle(!!wordExample), resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => (e.currentTarget.style.borderColor = accentColor)}
          onBlur={e => (e.currentTarget.style.borderColor = wordExample ? accentColor : '#E6E2DE')}
        />
      </div>
    </div>
  )
}
