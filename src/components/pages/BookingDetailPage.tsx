import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, CalendarPlus, XCircle, MapPin, Clock, Users, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { useBooking } from '../../hooks/queries/useBookings'
import type { Timestamp } from 'firebase/firestore'

function makeCalendarUrl(title: string, start: Date, end: Date) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  const params = new URLSearchParams({
    action: 'TEMPLATE', text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(id)

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-ground)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
    </div>
  )

  if (error || !booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5" style={{ background: 'var(--app-ground)' }}>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Booking not found.</p>
      <button type="button" onClick={() => navigate('/bookings')} className="tap text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        Back to bookings
      </button>
    </div>
  )

  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  const isBoth = ids.length > 1
  const headerBg = isBoth ? 'var(--brand-purple)' : ids[0] === 'cube' ? 'var(--brand-mint)' : ids[0] === 'lab' ? 'var(--brand-yellow)' : 'var(--brand-magenta)'
  const programTitle = isBoth ? 'Cube + Lab visit' : ids[0] === 'cube' ? 'Curiosity Cube' : ids[0] === 'lab' ? 'Curiosity Lab' : 'TOAD Truck'

  const firstSeg = booking.segments?.[0] as unknown as { start?: Timestamp; end?: Timestamp }
  const lastSeg = booking.segments?.[booking.segments.length - 1] as unknown as { end?: Timestamp }
  const startDate = firstSeg?.start?.toDate()
  const endDate = lastSeg?.end?.toDate()

  const statusLabel = booking.status === 'confirmed' ? 'Confirmed'
    : booking.status === 'pending' ? 'Pending approval'
    : booking.status === 'cancelled' ? 'Cancelled'
    : booking.status

  const rows = [
    ...(startDate ? [{ icon: Clock, label: 'Date & time', value: `${format(startDate, 'EEEE, d MMMM yyyy')} · ${format(startDate, 'HH:mm')}–${endDate ? format(endDate, 'HH:mm') : ''}` }] : []),
    { icon: MapPin, label: 'Location', value: 'Merck KGaA, Frankfurter Str. 250, Darmstadt' },
    { icon: GraduationCap, label: 'Grade', value: `Grade ${booking.grade}` },
    { icon: Users, label: 'Students', value: `${booking.studentCount} students` },
    ...(booking.accessNeeds ? [{ icon: Users, label: 'Access needs', value: booking.accessNeeds }] : []),
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
              {format(startDate, 'EEEE, d MMMM yyyy')}
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
              href={makeCalendarUrl(programTitle, startDate, endDate)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border"
              style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)', textDecoration: 'none' }}
            >
              <CalendarPlus className="w-4 h-4" />
              Add to calendar
            </a>
          )}
          {booking.status !== 'cancelled' && (
            <button
              type="button"
              className="tap w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}
            >
              <XCircle className="w-4 h-4" />
              Cancel booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
