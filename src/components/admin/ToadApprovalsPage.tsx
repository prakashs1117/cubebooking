import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Check, X, RotateCcw } from 'lucide-react'
import { useIntl } from 'react-intl'
import { db } from '../../shared/firebase'
import { useAllToadBookings, type BookingDoc } from '../../hooks/queries/useBookings'

function daysSince(ts: { seconds: number } | undefined): number {
  if (!ts) return 0
  return Math.floor((Date.now() / 1000 - ts.seconds) / 86400)
}

function DateBadge({ dateStr }: { dateStr?: string }) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00')
  const mon = d.toLocaleString('en', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  return (
    <div className="flex-none flex flex-col items-center justify-center rounded-2xl text-white" style={{ width: 52, minHeight: 60, background: 'var(--brand-magenta)', padding: '8px 0' }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>{mon}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{day}</span>
    </div>
  )
}

function BookingCard({ booking, onApprove, onDecline, submitting }: { booking: BookingDoc; onApprove: () => void; onDecline: (reason: string) => void; submitting?: boolean }) {
  const intl = useIntl()
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')

  const date = booking.segments?.[0]?.date
  const days = daysSince(booking.createdAt as { seconds: number } | undefined)

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex gap-3 items-start">
        <DateBadge dateStr={date} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-sm font-bold truncate">{booking.teacherName}</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{booking.teacherEmail}</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'review.row.grade' })} {booking.grade} · {booking.studentCount} {intl.formatMessage({ id: 'review.row.students' }).toLowerCase()}
          </span>
          {days === 0
            ? <span className="text-xs font-medium" style={{ color: 'var(--brand-magenta)' }}>{intl.formatMessage({ id: 'toad.approvals.today' })}</span>
            : <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'toad.approvals.daysAgo' }, { days })}</span>
          }
        </div>
      </div>

      {booking.truckParking && (
        <div className="flex gap-2 text-xs p-2.5 rounded-xl" style={{ background: 'var(--app-ground)', color: 'var(--muted-foreground)' }}>
          <span className="font-semibold shrink-0">{intl.formatMessage({ id: 'toad.approvals.parking' })}:</span>
          <span className="leading-relaxed">{booking.truckParking}</span>
        </div>
      )}

      {!declining ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDeclining(true)}
            disabled={submitting}
            className="tap flex-1 h-9 rounded-xl text-xs font-semibold border"
            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.5 : 1 }}
          >
            {intl.formatMessage({ id: 'toad.approvals.decline' })}
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={submitting}
            className="tap flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.5 : 1 }}
          >
            <Check style={{ width: 14, height: 14 }} />
            {intl.formatMessage({ id: 'toad.approvals.approve' })}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium">{intl.formatMessage({ id: 'toad.approvals.declineReason.label' })}</label>
          <textarea
            rows={2}
            placeholder={intl.formatMessage({ id: 'toad.approvals.declineReason.placeholder' })}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border resize-none text-sm"
            style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setDeclining(false); setReason('') }} className="tap flex-none h-9 px-3 rounded-xl text-xs border" style={{ background: 'transparent', borderColor: 'var(--border)', cursor: 'pointer', fontFamily: 'inherit' }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
            <button type="button" onClick={() => onDecline(reason)} className="tap flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: 'var(--destructive)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {intl.formatMessage({ id: 'toad.approvals.declineAndNotify' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RecentCard({ booking }: { booking: BookingDoc }) {
  const intl = useIntl()
  const date = booking.segments?.[0]?.date
  const isApproved = booking.status === 'approved'
  return (
    <div className="flex gap-3 items-center p-3.5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)', opacity: 0.85 }}>
      <DateBadge dateStr={date} />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold truncate block">{booking.teacherName}</span>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'review.row.grade' })} {booking.grade} · {booking.studentCount} {intl.formatMessage({ id: 'review.row.students' }).toLowerCase()}</span>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: isApproved ? 'rgba(1,136,76,0.12)' : 'var(--tint-red)', color: isApproved ? 'var(--brand-green)' : 'var(--destructive)' }}>
        {isApproved ? intl.formatMessage({ id: 'bookingDetail.status.approved' }) : intl.formatMessage({ id: 'bookings.status.cancelled' })}
      </span>
    </div>
  )
}

export default function ToadApprovalsPage() {
  const intl = useIntl()
  const bookings = useAllToadBookings()
  const [undoQueue, setUndoQueue] = useState<Record<string, BookingDoc['status']>>({})
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set())

  const pending = bookings.filter((b) => b.status === 'pending')
    .sort((a, b) => ((a.createdAt as { seconds: number })?.seconds ?? 0) - ((b.createdAt as { seconds: number })?.seconds ?? 0))
  const recent = bookings
    .filter((b) => b.status === 'approved' || b.status === 'declined')
    .sort((a, b) => {
      const aTs = (a.updatedAt as { seconds: number } | undefined)?.seconds ?? 0
      const bTs = (b.updatedAt as { seconds: number } | undefined)?.seconds ?? 0
      return bTs - aTs
    })
    .slice(0, 20)

  const approve = async (booking: BookingDoc) => {
    if (submittingIds.has(booking.id)) return
    setSubmittingIds((s) => new Set(s).add(booking.id))
    try {
      setUndoQueue((q) => ({ ...q, [booking.id]: 'pending' }))
      await updateDoc(doc(db, 'bookings', booking.id), { status: 'approved', updatedAt: serverTimestamp() })
      setTimeout(() => setUndoQueue((q) => { const n = { ...q }; delete n[booking.id]; return n }), 5000)
    } finally {
      setSubmittingIds((s) => { const n = new Set(s); n.delete(booking.id); return n })
    }
  }

  const decline = async (booking: BookingDoc, reason: string) => {
    if (submittingIds.has(booking.id)) return
    setSubmittingIds((s) => new Set(s).add(booking.id))
    try {
      setUndoQueue((q) => ({ ...q, [booking.id]: 'pending' }))
      await updateDoc(doc(db, 'bookings', booking.id), { status: 'declined', declineReason: reason, updatedAt: serverTimestamp() })
      setTimeout(() => setUndoQueue((q) => { const n = { ...q }; delete n[booking.id]; return n }), 5000)
    } finally {
      setSubmittingIds((s) => { const n = new Set(s); n.delete(booking.id); return n })
    }
  }

  const undo = async (bookingId: string) => {
    const prev = undoQueue[bookingId]
    if (!prev) return
    setUndoQueue((q) => { const n = { ...q }; delete n[bookingId]; return n })
    await updateDoc(doc(db, 'bookings', bookingId), { status: prev, updatedAt: serverTimestamp() })
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto flex flex-col gap-6" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>
      <h1 className="m-0 text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'toad.approvals.title' })}
      </h1>

      {/* Undo toasts */}
      {Object.keys(undoQueue).map((id) => (
        <div key={id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
          <span className="flex-1 text-sm font-medium">{intl.formatMessage({ id: 'toad.approvals.actionDone' })}</span>
          <button type="button" onClick={() => undo(id)} className="tap flex items-center gap-1.5 text-sm font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--background)', fontFamily: 'inherit' }}>
            <RotateCcw style={{ width: 14, height: 14 }} />
            {intl.formatMessage({ id: 'toad.approvals.undo' })}
          </button>
        </div>
      ))}

      {/* Pending section */}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'toad.approvals.pending' }, { count: pending.length })}
        </h2>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <Check style={{ width: 32, height: 32, color: 'var(--primary)' }} />
            <span className="text-base font-bold">{intl.formatMessage({ id: 'toad.approvals.empty' })}</span>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'toad.approvals.emptySub' })}</span>
          </div>
        ) : (
          pending.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onApprove={() => approve(b)}
              onDecline={(reason) => decline(b, reason)}
              submitting={submittingIds.has(b.id)}
            />
          ))
        )}
      </section>

      {/* Recent section */}
      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.approvals.recent' })}
          </h2>
          {recent.map((b) => <RecentCard key={b.id} booking={b} />)}
        </section>
      )}
    </div>
  )
}
