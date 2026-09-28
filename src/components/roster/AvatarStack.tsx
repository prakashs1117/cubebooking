import type { AttendanceDoc } from '../../types'

interface AvatarStackProps {
  attendees: AttendanceDoc[]
  size?: number
  max?: number
  borderColor?: string
}

function initials(name: string) {
  return (name || '?').split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function hue(uid: string) {
  return (uid.charCodeAt(0) * 47) % 360
}

export function AvatarStack({ attendees, size = 26, max = 6, borderColor = '#fff' }: AvatarStackProps) {
  const visible = attendees.slice(0, max)
  const overflow = attendees.length - visible.length

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((a, i) => (
        <div
          key={a.uid}
          title={a.displayName || 'Member'}
          style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${hue(a.uid)}, 60%, 55%)`,
            border: `2px solid ${borderColor}`,
            marginLeft: i === 0 ? 0 : -(size * 0.35),
            zIndex: visible.length - i,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: size * 0.34,
            boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          }}
        >
          {a.photoURL ? (
            <img
              src={a.photoURL}
              alt={a.displayName || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => {
                const img = e.currentTarget
                img.style.display = 'none'
                img.parentElement!.textContent = initials(a.displayName)
              }}
            />
          ) : initials(a.displayName)}
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          background: '#e5e7eb', border: `2px solid ${borderColor}`,
          marginLeft: -(size * 0.35),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6b7280', fontWeight: 700, fontSize: size * 0.3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          zIndex: 0, position: 'relative',
        }}>
          +{overflow}
        </div>
      )}
    </div>
  )
}
