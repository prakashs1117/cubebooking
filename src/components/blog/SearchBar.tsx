import { useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (q: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search posts, words, tags…' }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(v), 250)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        size={15}
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}
      />
      <input
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 36px 10px 36px',
          borderRadius: 12,
          border: '1.5px solid #E6E2DE',
          fontSize: 13,
          fontFamily: 'Poppins, Inter, system-ui, sans-serif',
          color: '#0f172a',
          background: '#fff',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
        onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2,
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
