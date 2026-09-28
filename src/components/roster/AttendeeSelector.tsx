import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, ChevronDown, Search } from 'lucide-react'
import type { AttendingProfile } from './useAttendingProfiles'

interface AttendeeSelectorProps {
  profiles: AttendingProfile[]
  nominatedNames: string[]
  onSelect: (profile: AttendingProfile) => void
  disabled?: boolean
}

const ROLE_PILL_STYLES: Record<string, { bg: string; color: string }> = {
  Guest: { bg: '#f3f4f6', color: '#6b7280' },
  Member: { bg: '#f3f4f6', color: '#374151' },
  'Club Member': { bg: '#dbeafe', color: '#1e40af' },
  Admin: { bg: '#fef3c7', color: '#92400e' },
  'Super Admin': { bg: '#ede9fe', color: '#5b21b6' },
}

export function AttendeeSelector({ profiles, nominatedNames, onSelect, disabled }: AttendeeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // Focus the search input when opening
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const filtered = profiles.filter(p =>
    p.displayName.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (profile: AttendingProfile) => {
    if (nominatedNames.includes(profile.displayName)) return
    onSelect(profile)
    setOpen(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setSearch('') }
    if (e.key === 'Enter' && filtered.length > 0) {
      const first = filtered.find(p => !nominatedNames.includes(p.displayName))
      if (first) handleSelect(first)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Single search input (not a button) */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 8,
        border: `1.5px solid ${open ? '#772432' : '#E6E2DE'}`,
        background: disabled ? '#F9FAFB' : '#fff',
        cursor: disabled ? 'not-allowed' : 'text',
        fontSize: 13,
        fontFamily: 'inherit',
        transition: 'border-color 0.15s',
      }}>
        <Search size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={search}
          onChange={e => { setSearch(e.target.value); if (!open) setOpen(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={disabled ? 'Loading attendees…' : 'Search attendees…'}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#111827',
            background: 'transparent',
            fontFamily: 'inherit',
          }}
        />
        {open && <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0, transform: 'rotate(180deg)', transition: 'transform 0.15s' }} />}
      </div>

      {/* Dropdown panel (list only, no duplicate input) */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#fff',
          border: '1.5px solid #E6E2DE',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>

          {/* List */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {profiles.length === 0 ? (
              <div style={{ padding: '14px 12px', textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
                No attendees yet
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '14px 12px', textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
                No attendees found
              </div>
            ) : (
              filtered.map(profile => {
                const isNominated = nominatedNames.includes(profile.displayName)
                const pillStyle = ROLE_PILL_STYLES[profile.roleLabel] ?? ROLE_PILL_STYLES.Guest

                return (
                  <button
                    key={profile.uid}
                    type="button"
                    onClick={() => handleSelect(profile)}
                    disabled={isNominated}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      background: 'none',
                      border: 'none',
                      cursor: isNominated ? 'default' : 'pointer',
                      textAlign: 'left',
                      opacity: isNominated ? 0.6 : 1,
                      fontFamily: 'inherit',
                      borderBottom: '1px solid #F9FAFB',
                    }}
                    onMouseEnter={e => {
                      if (!isNominated) (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'none'
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111827' }}>
                      {profile.displayName}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 7px', borderRadius: 5,
                      background: pillStyle.bg, color: pillStyle.color,
                      flexShrink: 0,
                    }}>
                      {profile.roleLabel}
                    </span>
                    {isNominated && (
                      <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
