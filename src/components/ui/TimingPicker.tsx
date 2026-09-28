import { useState, useEffect, useRef } from 'react'

interface TimingPickerProps {
  value: string
  onChange: (val: string) => void
  label?: string
}

interface TimeState {
  hour: string
  min: string
  ampm: 'AM' | 'PM'
}

const parseTime = (t: string): TimeState => {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
  if (m) return { hour: m[1], min: m[2], ampm: m[3] as 'AM' | 'PM' }
  return { hour: '2', min: '00', ampm: 'PM' }
}

const buildOutput = (s: TimeState, e: TimeState) =>
  `${s.hour}:${s.min} ${s.ampm} – ${e.hour}:${e.min} ${e.ampm}`

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #E6E2DE',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'inherit',
  background: '#fff',
  cursor: 'pointer',
  outline: 'none',
  color: '#111827',
}

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const MINS = ['00', '15', '30', '45']

export function TimingPicker({ value, onChange, label }: TimingPickerProps) {
  const parts = value ? value.split(' – ') : []
  const [start, setStart] = useState<TimeState>(() => parseTime(parts[0] ?? ''))
  const [end, setEnd] = useState<TimeState>(() => parseTime(parts[1] ?? ''))
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      if (!value) return
    }
    onChange(buildOutput(start, end))
  }, [start, end])

  return (
    <div>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#F9FAFB', border: '1px solid #E6E2DE', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', width: 32, flexShrink: 0 }}>FROM</span>
          <select value={start.hour} onChange={e => setStart(s => ({ ...s, hour: e.target.value }))} style={selectStyle}>
            {HOURS.map(h => <option key={h}>{h}</option>)}
          </select>
          <span style={{ color: '#9CA3AF', fontWeight: 700 }}>:</span>
          <select value={start.min} onChange={e => setStart(s => ({ ...s, min: e.target.value }))} style={selectStyle}>
            {MINS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={start.ampm} onChange={e => setStart(s => ({ ...s, ampm: e.target.value as 'AM' | 'PM' }))} style={selectStyle}>
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', width: 32, flexShrink: 0 }}>TO</span>
          <select value={end.hour} onChange={e => setEnd(s => ({ ...s, hour: e.target.value }))} style={selectStyle}>
            {HOURS.map(h => <option key={h}>{h}</option>)}
          </select>
          <span style={{ color: '#9CA3AF', fontWeight: 700 }}>:</span>
          <select value={end.min} onChange={e => setEnd(s => ({ ...s, min: e.target.value }))} style={selectStyle}>
            {MINS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={end.ampm} onChange={e => setEnd(s => ({ ...s, ampm: e.target.value as 'AM' | 'PM' }))} style={selectStyle}>
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>
      </div>
    </div>
  )
}
