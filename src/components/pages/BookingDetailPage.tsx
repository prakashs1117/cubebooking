import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, CalendarPlus, MapPin, Clock, Users, GraduationCap } from 'lucide-react'
import { useIntl } from 'react-intl'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import { useBooking } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { trackBookingCancelled } from '../../services/analyticsService'
import { CancelBookingDialog } from '../booking/CancelBookingDialog'

function makeCalendarUrl(title: string, start: Date, end: Date, details = '') {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
    location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const intl = useIntl()
  const { data: booking, isLoading, error } = useBooking(id)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Derive times from segment date+startHour
  const firstSeg = booking?.segments?.[0]
  const lastSeg = booking?.segments?.[booking.segments.length - 1]
  const times = firstSeg?.date != null && firstSeg?.startHour != null && lastSeg?.date != null && lastSeg?.startHour != null
    ? {
        startDate: slotToDate(firstSeg.date, firstSeg.startHour),
        endDate: slotEndDate(lastSeg.date, lastSeg.startHour),
      }
    : { startDate: null, endDate: null }

  const handleConfirmCancel = async () => {
    if (!id || !booking) return

    setCancelling(true)
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status: 'cancelled',
        updatedAt: new Date(),
      })
      trackBookingCancelled(id, 'user_cancelled')
      setCancelDialogOpen(false)
      navigate('/bookings', { replace: true })
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      alert(intl.formatMessage({ id: 'bookingDetail.cancelError' }) || 'Failed to cancel booking. Please try again.')
      setCancelling(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-ground)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
    </div>
  )

  if (error || !booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5" style={{ background: 'var(--app-ground)' }}>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        {intl.formatMessage({ id: 'bookingDetail.notFound' })}
      </p>
      <button type="button" onClick={() => navigate('/bookings')} className="tap text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        {intl.formatMessage({ id: 'bookingDetail.backToBookings' })}
      </button>
    </div>
  )

  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  const isBoth = ids.length > 1
  const headerBg = isBoth ? 'var(--brand-purple)' : ids[0] === 'cube' ? 'var(--brand-mint)' : ids[0] === 'lab' ? 'var(--brand-yellow)' : 'var(--brand-magenta)'
  const programTitle = isBoth
    ? intl.formatMessage({ id: 'program.both.visit' })
    : ids[0] === 'cube'
    ? intl.formatMessage({ id: 'program.cube' })
    : ids[0] === 'lab'
    ? intl.formatMessage({ id: 'program.lab' })
    : intl.formatMessage({ id: 'program.toad' })

  const startDate = times?.startDate ?? null
  const endDate   = times?.endDate   ?? null

  const statusLabel = booking.status === 'confirmed'
    ? intl.formatMessage({ id: 'bookingDetail.status.confirmed' })
    : booking.status === 'pending'
    ? intl.formatMessage({ id: 'bookingDetail.status.pending' })
    : intl.formatMessage({ id: 'bookingDetail.status.cancelled' })

  const rows = [
    ...(startDate ? [{
      icon: Clock,
      label: intl.formatMessage({ id: 'bookingDetail.row.dateTime' }),
      value: `${intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${intl.formatDate(startDate, { hour: '2-digit', minute: '2-digit', hour12: false })}–${endDate ? intl.formatDate(endDate, { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}`,
    }] : []),
    { icon: MapPin, label: intl.formatMessage({ id: 'bookingDetail.row.location' }), value: intl.formatMessage({ id: 'bookingDetail.location.value' }) },
    { icon: GraduationCap, label: intl.formatMessage({ id: 'bookingDetail.row.grade' }), value: intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade }) },
    { icon: Users, label: intl.formatMessage({ id: 'bookingDetail.row.students' }), value: intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount }) },
    ...(booking.accessNeeds ? [{ icon: Users, label: intl.formatMessage({ id: 'bookingDetail.row.access' }), value: booking.accessNeeds }] : []),
  ]

  return (
    <div
      className="min-h-screen flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      {/* Mint hero header */}
      <div className="relative overflow-hidden px-3 pt-11 pb-5" style={{ background: headerBg }}>
        <div style={{ position: 'absolute', right: -40, bottom: -80, width: 220, height: 220, borderRadius: '9999px', background: 'var(--brand-yellow)', opacity: 0.7 }} />
        <div style={{ position: 'absolute', right: 120, top: -30, width: 90, height: 90, borderRadius: '9999px', border: '14px solid rgba(255,255,255,0.55)', boxSizing: 'border-box' }} />

        <div className="relative flex justify-between mb-4">
          <button type="button" onClick={() => navigate(-1)} className="iconbtn tap" aria-label="Back" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <ChevronLeft className="i" />
          </button>
          <button type="button" className="iconbtn tap" aria-label="Share booking" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <Share2 className="i" />
          </button>
        </div>

        <div className="relative flex flex-col gap-1.5 px-2">
          <span
            className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'var(--background)',
              color: booking.status === 'confirmed' ? 'var(--brand-green)' : booking.status === 'pending' ? 'var(--brand-orange)' : 'var(--muted-foreground)',
            }}
          >
            {booking.status === 'confirmed' && '✓'} {statusLabel}
          </span>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: isBoth ? '#fff' : 'var(--foreground)' }}>
            {programTitle}
          </h1>
          {startDate && (
            <div className="text-sm font-medium" style={{ color: isBoth ? 'rgba(255,255,255,0.85)' : 'var(--muted-foreground)' }}>
              {intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Detail rows */}
      <div className="flex-1 scroll overflow-y-auto px-5 py-5 flex flex-col gap-4 pb-24 lg:pb-6">
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-4 min-h-[52px] border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <row.icon className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              <span className="w-28 text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
              <span className="flex-1 text-sm font-semibold">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {startDate && endDate && (
            <a
              href={makeCalendarUrl(
                `Curiosity ${programTitle} – Class ${booking.grade}`,
                startDate,
                endDate,
                `${booking.studentCount} students · Grade ${booking.grade} · ${intl.formatDate(startDate, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(endDate, { hour: '2-digit', minute: '2-digit', hour12: false })}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="tap w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}
            >
              <CalendarPlus className="w-4 h-4" />
              {intl.formatMessage({ id: 'bookingDetail.addToCalendar' })}
            </a>
          )}
          {booking.status !== 'cancelled' && (
            <CancelBookingDialog
              open={cancelDialogOpen}
              onOpenChange={setCancelDialogOpen}
              onConfirm={handleConfirmCancel}
              isLoading={cancelling}
            />
          )}
        </div>
      </div>
    </div>
  )
}
