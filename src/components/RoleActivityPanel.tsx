import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import type { RoleClaimEvent } from '../types'

export default function RoleActivityPanel({ rosterId }: { rosterId?: string }) {
  const [events, setEvents] = useState<RoleClaimEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rosterId) {
      setLoading(false)
      return
    }
    const q = query(collection(db, 'meetings', rosterId, 'roleClaimEvents'), orderBy('at', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleClaimEvent))
        setEvents(data)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [rosterId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
        Loading activity…
      </div>
    )
  }

  if (!rosterId && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          No roster selected
        </div>
        <div style={{ fontSize: 14, color: '#9CA3AF' }}>
          Select a roster to view its activity.
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          No activity yet
        </div>
        <div style={{ fontSize: 14, color: '#9CA3AF' }}>
          Members will appear here as they claim or release roles.
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 700 }}>
        {events.map((event) => {
          const date = event.at?.toDate?.()?.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) ?? '—'

          const actionLabel = event.action === 'claim' ? 'claimed' : 'released'
          const roleLabel = event.role || 'Member'

          return (
            <div
              key={event.id}
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {event.displayName}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B6470', marginTop: 4 }}>
                    {actionLabel}{' '}
                    <span style={{ fontWeight: 600, color: '#374151' }}>
                      {roleLabel}
                    </span>{' '}
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      in {event.group === 'roleTakers' ? 'Role Takers' : event.group === 'tagl' ? 'TAGL' : event.group === 'speakers' ? 'Speakers' : 'Evaluators'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {date}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
