import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  label?: string
}

export function DatePicker({ value, onChange, placeholder, label }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = parse(value, 'd MMM yyyy', new Date())
  const selectedDate = isValid(parsed) ? parsed : undefined

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #E6E2DE',
          borderRadius: 10,
          background: '#fff',
          fontSize: 14,
          fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: value ? '#111827' : '#9CA3AF',
          textAlign: 'left',
          boxSizing: 'border-box',
        }}
      >
        <span>{value || placeholder || 'Select date'}</span>
        <CalendarDays size={15} color="#9CA3AF" />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 50,
          background: '#fff',
          border: '1px solid #E6E2DE',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: 8,
        }}>
          <style>{`
            .rdp-day_button:hover { background: #f9e8eb; }
            .rdp-selected .rdp-day_button { background: #772432 !important; color: #fff !important; border-radius: 6px; }
            .rdp-today .rdp-day_button { color: #772432; font-weight: 800; }
          `}</style>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'd MMM yyyy'))
                setOpen(false)
              }
            }}
            captionLayout="dropdown"
          />
        </div>
      )}
    </div>
  )
}
