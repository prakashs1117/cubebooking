import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useMyBookings, isUpcoming, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { useLocale } from '../../context/LocaleContext'

// ─── helpers ──────────────────────────────────────────────────────────────────

const PROGRAM_COLOR: Record<string, string> = {
  cube: 'var(--brand-mint)',
  lab:  'var(--brand-yellow)',
  toad: 'var(--brand-magenta)',
}

function nearestUpcoming(bookings: BookingDoc[]): BookingDoc | null {
  const upcoming = bookings.filter(isUpcoming)
  if (!upcoming.length) return null
  // Sort ascending by first segment start date — closest visit first
  return upcoming.sort((a, b) => {
    const aDate = a.segments?.[0] ? slotToDate(a.segments[0].date, a.segments[0].startHour).getTime() : 0
    const bDate = b.segments?.[0] ? slotToDate(b.segments[0].date, b.segments[0].startHour).getTime() : 0
    return aDate - bDate
  })[0]
}

// ─── Card variants ─────────────────────────────────────────────────────────────

interface Props {
  /** 'hero' = larger card for the /info hero overlay, 'panel' = compact for auth left panel */
  variant?: 'hero' | 'panel'
  style?: React.CSSProperties
  className?: string
}

export default function UpcomingVisitCard({ variant = 'hero', style, className }: Props) {
  const { user } = useAuthContext()
  const { data: bookings, isLoading } = useMyBookings()
  const intl = useIntl()
  const { locale } = useLocale()
  const dateFnsLocale = locale === 'de' ? de : enUS

  // Only render for logged-in users with an upcoming booking
  if (!user || isLoading || !bookings?.length) return null

  const booking = nearestUpcoming(bookings)
  if (!booking) return null

  const seg0  = booking.segments?.[0]
  const segLast = booking.segments?.[booking.segments.length - 1]

  const startDate = seg0 ? slotToDate(seg0.date, seg0.startHour) : null
  const endDate   = segLast ? slotEndDate(segLast.date, segLast.startHour) : null
  const dateLabel = startDate ? format(startDate, 'EEE, d MMM', { locale: dateFnsLocale }) : '—'
  const timeLabel = startDate && endDate
    ? `${format(startDate, 'HH:mm')}–${format(endDate, 'HH:mm')}`
    : null

  const segments = booking.segments ?? []
  const uniqueProgs = [...new Set(segments.map(s => s.programId))]

  const statusColor = booking.status === 'confirmed' || booking.status === 'approved'
    ? 'var(--brand-green)'
    : booking.status === 'pending'
    ? 'var(--brand-orange)'
    : 'var(--muted-foreground)'

  const statusBg = booking.status === 'confirmed' || booking.status === 'approved'
    ? 'var(--accent)'
    : booking.status === 'pending'
    ? 'var(--tint-yellow)'
    : 'var(--muted)'

  const statusLabel = booking.status === 'confirmed'
    ? `✓ ${intl.formatMessage({ id: 'bookings.status.confirmed' })}`
    : booking.status === 'approved'
    ? `✓ ${intl.formatMessage({ id: 'bookings.status.confirmed' })}`
    : booking.status === 'pending'
    ? intl.formatMessage({ id: 'bookings.status.pending' })
    : booking.status

  const isPanel = variant === 'panel'
  const padding  = isPanel ? 14 : 16
  const radius   = isPanel ? 18 : 22
  const fontSize = isPanel ? 17 : 21
  const smallFs  = isPanel ? 10 : 11.5
  const labelFs  = isPanel ? 11 : 12

  return (
    <Link
      to={`/bookings/${booking.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isPanel ? 8 : 10,
        padding,
        borderRadius: radius,
        background: 'var(--background)',
        color: 'var(--foreground)',
        boxShadow: '0 20px 48px rgba(0,0,0,.45)',
        textDecoration: 'none',
        width: isPanel ? 200 : undefined,
        ...style,
      }}
      className={className}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: labelFs, fontWeight: 700, color: 'var(--muted-foreground)' }}>
        <span>{intl.formatMessage({ id: 'programs.hero.card.yourVisit' })}</span>
        <span style={{ padding: '2px 8px', borderRadius: 9999, background: statusBg, color: statusColor, fontSize: labelFs }}>
          {statusLabel}
        </span>
      </div>

      {/* Date */}
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize, lineHeight: 1.1 }}>
        {dateLabel}
      </div>

      {/* Time */}
      {timeLabel && (
        <div style={{ fontSize: labelFs, color: 'var(--muted-foreground)', fontWeight: 600 }}>
          {timeLabel}
        </div>
      )}

      {/* Program slots */}
      {uniqueProgs.length > 0 && (
        <div style={{ display: 'flex', gap: isPanel ? 4 : 6, flexWrap: 'wrap' }}>
          {uniqueProgs.map(progId => (
            <div key={progId} style={{ flex: 1, minWidth: 0, padding: `${isPanel ? 6 : 8}px ${isPanel ? 8 : 10}px`, borderRadius: isPanel ? 10 : 12, background: PROGRAM_COLOR[progId] ?? 'var(--muted)' }}>
              <b style={{ display: 'block', fontSize: isPanel ? 11 : 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {progId === 'cube' ? intl.formatMessage({ id: 'program.cube' })
                  : progId === 'lab' ? intl.formatMessage({ id: 'program.lab' })
                  : intl.formatMessage({ id: 'program.toad' })}
              </b>
              {!isPanel && (
                <small style={{ fontSize: smallFs }}>
                  {(() => {
                    const segs = segments.filter(s => s.programId === progId)
                    if (!segs.length) return null
                    const s = slotToDate(segs[0].date, segs[0].startHour)
                    const e = slotEndDate(segs[segs.length - 1].date, segs[segs.length - 1].startHour)
                    return `${format(s, 'HH:mm')}–${format(e, 'HH:mm')}`
                  })()}
                </small>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Class details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: labelFs, color: 'var(--muted-foreground)' }}>
        <span>{booking.grade} · {intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount })}</span>
        <ArrowRight style={{ width: 12, height: 12, flexShrink: 0 }} />
      </div>
    </Link>
  )
}
