import { useNavigate } from 'react-router-dom'
import { QrCode, Clock, Users, GraduationCap, Truck, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAllBookings, useAllToadBookings, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function statusChip(status: BookingDoc['status'], intl: ReturnType<typeof useIntl>) {
  const arrived = status === 'arrived'
  const cancelled = status === 'cancelled'
  const label = arrived
    ? intl.formatMessage({ id: 'adminVerify.status.arrived' })
    : cancelled
    ? intl.formatMessage({ id: 'bookingDetail.status.cancelled' })
    : intl.formatMessage({ id: 'bookingDetail.status.confirmed' })
  const color = arrived ? 'var(--brand-green)' : cancelled ? 'var(--muted-foreground)' : 'var(--primary)'
  const bg = arrived ? 'rgba(1,136,76,0.1)' : cancelled ? 'var(--muted)' : 'var(--tint-purple)'
  return { label, color, bg }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const today = todayKey()
  const { data: bookings = [], isLoading } = useAllBookings(today)
  const toadBookings = useAllToadBookings()
  const pendingToad = toadBookings.filter((b) => b.status === 'pending').length

  // Sort: arrived last, cancelled last-last, confirmed/pending first; within groups sort by start time
  const sorted = [...bookings].sort((a, b) => {
    const order = (s: BookingDoc['status']) =>
      s === 'arrived' ? 1 : s === 'cancelled' ? 2 : 0
    const diff = order(a.status) - order(b.status)
    if (diff !== 0) return diff
    const aHour = a.segments?.[0]?.startHour ?? 0
    const bHour = b.segments?.[0]?.startHour ?? 0
    return aHour - bHour
  })

  return (
    <div
      className="min-h-screen flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <header className="px-5 pt-4 lg:pt-6 pb-3 flex items-center justify-between gap-4">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'adminDash.title' })}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/admin/scan')}
          className="tap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
        >
          <QrCode className="w-4 h-4" />
          {intl.formatMessage({ id: 'adminDash.scanCta' })}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 lg:pb-6 flex flex-col gap-3">

        {/* TOAD approvals shortcut */}
        <button
          type="button"
          onClick={() => navigate('/admin/toad')}
          className="tap w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <span className="grid place-items-center rounded-xl flex-none" style={{ width: 40, height: 40, background: 'var(--tint-magenta)' }}>
            <Truck style={{ width: 18, height: 18, color: 'var(--brand-magenta)' }} />
          </span>
          <span className="flex-1 flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{intl.formatMessage({ id: 'toad.approvals.title' })}</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {pendingToad > 0
                ? intl.formatMessage({ id: 'toad.approvals.pending' }, { count: pendingToad })
                : intl.formatMessage({ id: 'toad.approvals.empty' })}
            </span>
          </span>
          {pendingToad > 0 && (
            <span
              className="flex-none text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--tint-magenta)', color: 'var(--brand-magenta)' }}
            >
              {pendingToad}
            </span>
          )}
          <ChevronRight style={{ width: 16, height: 16, color: 'var(--muted-foreground)', flexShrink: 0 }} />
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'adminDash.todayEmpty' })}
          </p>
        )}

        {(() => {
          let shownCompletedDivider = false
          return sorted.map((booking) => {
            const isArrived = booking.status === 'arrived'
            const showDivider = isArrived && !shownCompletedDivider
            if (showDivider) shownCompletedDivider = true

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
            const programTitle = isBoth
              ? intl.formatMessage({ id: 'program.both' })
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
                <button
                  type="button"
                  onClick={() => navigate(`/admin/verify/${booking.id}`)}
                  className="tap w-full text-left rounded-2xl border overflow-hidden"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow-xs)',
                    opacity: isArrived ? 0.72 : 1,
                  }}
                >
                  {/* Colour accent bar */}
                  <div className="h-1.5" style={{ background: accent }} />

                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    {/* Top row: program + status */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold">{programTitle}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-none"
                        style={{ background: statusBg, color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {/* Teacher name */}
                    <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      {booking.teacherName}
                    </span>

                    {/* Detail chips */}
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
          })
        })()}
      </main>
    </div>
  )
}
