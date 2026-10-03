import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { QrCode, Clock, Users, GraduationCap, Truck, Check, X, RotateCcw, MapPin, School } from 'lucide-react'
import { useIntl } from 'react-intl'
import * as Tabs from '@radix-ui/react-tabs'
import { useAllBookings, useAllToadBookings, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { db } from '../../shared/firebase'
import { notifyUser } from '../../services/notificationService'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysSince(ts: { seconds: number } | undefined): number {
  if (!ts) return 0
  return Math.floor((Date.now() / 1000 - ts.seconds) / 86400)
}

function statusChip(status: BookingDoc['status'], intl: ReturnType<typeof useIntl>) {
  switch (status) {
    case 'arrived':   return { label: intl.formatMessage({ id: 'adminVerify.status.arrived' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.1)' }
    case 'cancelled': return { label: intl.formatMessage({ id: 'bookingDetail.status.cancelled' }), color: 'var(--muted-foreground)', bg: 'var(--muted)' }
    case 'pending':   return { label: intl.formatMessage({ id: 'bookings.status.awaitingApproval' }), color: 'var(--brand-orange)', bg: 'rgba(217,119,6,0.1)' }
    case 'approved':  return { label: intl.formatMessage({ id: 'bookingDetail.status.approved' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.1)' }
    case 'declined':  return { label: intl.formatMessage({ id: 'bookingDetail.status.declined' }), color: 'var(--destructive)', bg: 'rgba(220,38,38,0.08)' }
    default:          return { label: intl.formatMessage({ id: 'bookingDetail.status.confirmed' }), color: 'var(--primary)', bg: 'var(--tint-purple)' }
  }
}

// ─── TOAD approval card ───────────────────────────────────────────────────────

function ToadApprovalCard({
  booking, onApprove, onDecline, submitting,
}: {
  booking: BookingDoc
  onApprove: () => void
  onDecline: (reason: string) => void
  submitting?: boolean
}) {
  const intl = useIntl()
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')

  const seg = booking.segments?.[0]
  const days = daysSince(booking.createdAt as { seconds: number } | undefined)

  const dateLabel = seg?.date
    ? new Date(seg.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {/* Magenta top strip */}
      <div className="h-1" style={{ background: 'var(--brand-magenta)' }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-none flex flex-col items-center justify-center rounded-2xl text-white px-3 py-2.5 gap-0.5"
            style={{ background: 'var(--brand-magenta)', minWidth: 52 }}>
            <Truck style={{ width: 16, height: 16 }} />
            {seg?.date && (
              <>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>
                  {new Date(seg.date + 'T12:00:00').toLocaleString('en', { month: 'short' }).toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
                  {new Date(seg.date + 'T12:00:00').getDate()}
                </span>
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="text-sm font-bold truncate">{booking.teacherName}</span>
            <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{booking.teacherEmail}</span>
            {booking.schoolName && (
              <span className="text-xs font-medium flex items-center gap-1 truncate" style={{ color: 'var(--foreground)' }}>
                <School style={{ width: 11, height: 11, flexShrink: 0, color: 'var(--muted-foreground)' }} />
                {booking.schoolName}
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade })}
              {' · '}
              {intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount })}
            </span>
            {dateLabel && (
              <span className="text-xs font-medium" style={{ color: 'var(--brand-magenta)' }}>{dateLabel}</span>
            )}
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {days === 0
                ? intl.formatMessage({ id: 'toad.approvals.today' })
                : intl.formatMessage({ id: 'toad.approvals.daysAgo' }, { days })}
            </span>
          </div>
        </div>

        {/* Parking / address */}
        {booking.truckParking && (
          <div className="flex gap-2 text-xs px-3 py-2.5 rounded-xl" style={{ background: 'var(--app-ground)' }}>
            <MapPin style={{ width: 12, height: 12, color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 1 }} />
            <span style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{booking.truckParking}</span>
          </div>
        )}

        {/* Actions */}
        {!declining ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setDeclining(true)} disabled={submitting}
              className="tap flex-1 h-10 rounded-xl text-xs font-semibold border"
              style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)', fontFamily: 'inherit', opacity: submitting ? 0.5 : 1 }}>
              {intl.formatMessage({ id: 'toad.approvals.decline' })}
            </button>
            <button type="button" onClick={onApprove} disabled={submitting}
              className="tap flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: 'var(--brand-green)', color: '#fff', border: 'none', fontFamily: 'inherit', opacity: submitting ? 0.5 : 1 }}>
              <Check style={{ width: 14, height: 14 }} />
              {intl.formatMessage({ id: 'toad.approvals.approve' })}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium">{intl.formatMessage({ id: 'toad.approvals.declineReason.label' })}</label>
            <textarea rows={2} placeholder={intl.formatMessage({ id: 'toad.approvals.declineReason.placeholder' })}
              value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border resize-none text-sm"
              style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }} />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setDeclining(false); setReason('') }}
                className="tap flex-none h-10 px-3 rounded-xl text-xs border"
                style={{ background: 'transparent', borderColor: 'var(--border)', fontFamily: 'inherit' }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
              <button type="button" onClick={() => onDecline(reason)}
                className="tap flex-1 h-10 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--destructive)', color: '#fff', border: 'none', fontFamily: 'inherit' }}>
                {intl.formatMessage({ id: 'toad.approvals.declineAndNotify' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Recent TOAD card (approved/declined) ─────────────────────────────────────

function ToadRecentCard({ booking }: { booking: BookingDoc }) {
  const intl = useIntl()
  const seg = booking.segments?.[0]
  const chip = statusChip(booking.status, intl)
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(`/bookings/${booking.id}`)}
      className="tap w-full flex gap-3 items-center p-3.5 rounded-2xl border text-left"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', opacity: 0.85, fontFamily: 'inherit' }}>
      <div className="flex-none flex flex-col items-center justify-center rounded-2xl text-white px-2.5 py-2 gap-0.5"
        style={{ background: booking.status === 'approved' ? 'rgba(1,136,76,0.15)' : 'rgba(220,38,38,0.10)', minWidth: 46 }}>
        <Truck style={{ width: 14, height: 14, color: booking.status === 'approved' ? 'var(--brand-green)' : 'var(--destructive)' }} />
        {seg?.date && (
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: booking.status === 'approved' ? 'var(--brand-green)' : 'var(--destructive)', lineHeight: 1 }}>
            {new Date(seg.date + 'T12:00:00').getDate()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{booking.teacherName}</div>
        {booking.schoolName && <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{booking.schoolName}</div>}
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade })} · {intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount })}
        </div>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-none" style={{ background: chip.bg, color: chip.color }}>
        {chip.label}
      </span>
    </button>
  )
}

// ─── Today tab ────────────────────────────────────────────────────────────────

function TodayTab({ bookings, isLoading }: { bookings: BookingDoc[]; isLoading: boolean }) {
  const intl = useIntl()
  const navigate = useNavigate()

  const sorted = [...bookings].sort((a, b) => {
    const order = (s: BookingDoc['status']) => s === 'arrived' ? 1 : s === 'cancelled' ? 2 : 0
    const diff = order(a.status) - order(b.status)
    if (diff !== 0) return diff
    return (a.segments?.[0]?.startHour ?? 0) - (b.segments?.[0]?.startHour ?? 0)
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
    </div>
  )

  if (sorted.length === 0) return (
    <p className="text-sm py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
      {intl.formatMessage({ id: 'adminDash.todayEmpty' })}
    </p>
  )

  let shownDivider = false
  return (
    <div className="flex flex-col gap-3">
      {sorted.map((booking) => {
        const isArrived = booking.status === 'arrived'
        const showDivider = isArrived && !shownDivider
        if (showDivider) shownDivider = true

        const seg = booking.segments?.[0]
        const lastSeg = booking.segments?.[booking.segments.length - 1]
        const start = seg?.date && seg?.startHour != null ? slotToDate(seg.date, seg.startHour) : null
        const end = lastSeg?.date && lastSeg?.startHour != null ? slotEndDate(lastSeg.date, lastSeg.startHour) : null
        const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
        const isBoth = ids.length > 1
        const accent = isBoth ? 'var(--brand-purple)'
          : ids[0] === 'cube' ? 'var(--brand-mint)'
          : ids[0] === 'lab' ? 'var(--brand-yellow)'
          : 'var(--brand-magenta)'
        const { label: statusLabel, color: statusColor, bg: statusBg } = statusChip(booking.status, intl)
        const programTitle = isBoth ? intl.formatMessage({ id: 'program.both' })
          : ids[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' })
          : ids[0] === 'lab' ? intl.formatMessage({ id: 'program.lab' })
          : intl.formatMessage({ id: 'program.toad' })

        return (
          <div key={booking.id}>
            {showDivider && (
              <div className="flex items-center gap-2 mt-1 mb-1">
                <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                  {intl.formatMessage({ id: 'adminDash.completedToday' })}
                </span>
                <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
            )}
            <button type="button" onClick={() => navigate(`/admin/verify/${booking.id}`)}
              className="tap w-full text-left rounded-2xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xs)', opacity: isArrived ? 0.72 : 1, fontFamily: 'inherit' }}>
              <div className="h-1.5" style={{ background: accent }} />
              <div className="px-4 py-3.5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold">{programTitle}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-none" style={{ background: statusBg, color: statusColor }}>{statusLabel}</span>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{booking.teacherName}</span>
                <div className="flex flex-wrap gap-3">
                  {start && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <Clock className="w-3 h-3" />
                      {intl.formatDate(start, { hour: '2-digit', minute: '2-digit', hour12: false })}
                      {end && `–${intl.formatDate(end, { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <GraduationCap className="w-3 h-3" />
                    {intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade })}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Users className="w-3 h-3" />
                    {intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount })}
                  </span>
                </div>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── TOAD approvals tab ───────────────────────────────────────────────────────

function ToadTab() {
  const intl = useIntl()
  const bookings = useAllToadBookings()
  const [undoQueue, setUndoQueue] = useState<Record<string, BookingDoc['status']>>({})
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set())

  const pending = [...bookings.filter((b) => b.status === 'pending')]
    .sort((a, b) => ((a.createdAt as { seconds: number })?.seconds ?? 0) - ((b.createdAt as { seconds: number })?.seconds ?? 0))
  const recent = [...bookings.filter((b) => b.status === 'approved' || b.status === 'declined')]
    .sort((a, b) => ((b.updatedAt as { seconds: number } | undefined)?.seconds ?? 0) - ((a.updatedAt as { seconds: number } | undefined)?.seconds ?? 0))
    .slice(0, 20)

  const approve = async (booking: BookingDoc) => {
    if (submittingIds.has(booking.id)) return
    setSubmittingIds((s) => new Set(s).add(booking.id))
    try {
      setUndoQueue((q) => ({ ...q, [booking.id]: 'pending' }))
      await updateDoc(doc(db, 'bookings', booking.id), { status: 'approved', updatedAt: serverTimestamp() })
      notifyUser(booking.teacherId, {
        type: 'confirmed',
        title: intl.formatMessage({ id: 'toad.notification.approved.title' }),
        body: intl.formatMessage({ id: 'toad.notification.approved.body' }, { date: booking.segments?.[0]?.date ?? '', code: booking.bookingCode ?? '' }),
        bookingId: booking.id,
      }).catch(() => {})
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
      notifyUser(booking.teacherId, {
        type: 'error',
        title: intl.formatMessage({ id: 'toad.notification.declined.title' }),
        body: intl.formatMessage({ id: 'toad.notification.declined.body' }, { date: booking.segments?.[0]?.date ?? '', reason: reason || '—' }),
        bookingId: booking.id,
      }).catch(() => {})
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
    <div className="flex flex-col gap-4">
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

      {/* Pending */}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'toad.approvals.pending' }, { count: pending.length })}
        </h2>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <Check style={{ width: 28, height: 28, color: 'var(--primary)' }} />
            <span className="text-sm font-bold">{intl.formatMessage({ id: 'toad.approvals.empty' })}</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'toad.approvals.emptySub' })}</span>
          </div>
        ) : (
          pending.map((b) => (
            <ToadApprovalCard key={b.id} booking={b}
              onApprove={() => approve(b)}
              onDecline={(r) => decline(b, r)}
              submitting={submittingIds.has(b.id)} />
          ))
        )}
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.approvals.recent' })}
          </h2>
          {recent.map((b) => <ToadRecentCard key={b.id} booking={b} />)}
        </section>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const today = todayKey()
  const { data: bookings = [], isLoading } = useAllBookings(today)
  const toadBookings = useAllToadBookings()
  const pendingToad = toadBookings.filter((b) => b.status === 'pending').length

  return (
    <div className="flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}>

      <header className="px-4 pt-4 lg:pt-6 pb-3 flex items-center justify-between gap-3">
        <h1 className="m-0 text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'adminDash.title' })}
        </h1>
        <button type="button" onClick={() => navigate('/admin/scan')}
          className="tap flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold flex-none"
          style={{ background: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
          <QrCode className="w-4 h-4" />
          {intl.formatMessage({ id: 'adminDash.scanCta' })}
        </button>
      </header>

      <div className="flex-1 px-4 pb-24 lg:pb-6">
        <Tabs.Root defaultValue="today" className="flex flex-col gap-4">
          <Tabs.List className="grid grid-cols-2 p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
            <Tabs.Trigger value="today" className="tab-trigger tap">
              {intl.formatMessage({ id: 'adminDash.tab.today' })}
            </Tabs.Trigger>
            <Tabs.Trigger value="toad" className="tab-trigger tap relative">
              {intl.formatMessage({ id: 'adminDash.tab.toad' })}
              {pendingToad > 0 && (
                <span className="inline-flex items-center justify-center ml-1.5 text-[10px] font-bold rounded-full"
                  style={{ width: 16, height: 16, background: 'var(--brand-magenta)', color: '#fff', verticalAlign: 'middle' }}>
                  {pendingToad}
                </span>
              )}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="today">
            <TodayTab bookings={bookings} isLoading={isLoading} />
          </Tabs.Content>

          <Tabs.Content value="toad">
            <ToadTab />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}
