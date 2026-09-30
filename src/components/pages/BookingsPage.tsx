import { Link } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { CalendarCheck, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useMyBookings, isUpcoming, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { useLocale } from '../../context/LocaleContext'

const PROGRAM_COLORS: Record<string, string> = {
  cube: 'var(--cube)',
  lab: 'var(--lab)',
  toad: 'var(--toad)',
  both: 'var(--brand-purple)',
}

// Get locale and timezone based on user's language preference
function getLocaleConfig(locale: string): { locale: Locale; timezone: string; timeFormat: string } {
  // Germany: de-DE locale, Europe/Berlin timezone, 24-hour format
  // US: en-US locale, America/New_York timezone, 12-hour format
  if (locale === 'de') {
    return {
      locale: de,
      timezone: 'Europe/Berlin',
      timeFormat: 'HH:mm', // 24-hour
    }
  }
  return {
    locale: enUS,
    timezone: 'America/New_York',
    timeFormat: 'h:mm a', // 12-hour with AM/PM
  }
}

type Locale = typeof de

function programLabel(booking: BookingDoc, intl: ReturnType<typeof useIntl>): string {
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  if (ids.length === 0) return '—'
  if (ids.length === 1) return ids[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' }) : ids[0] === 'lab' ? intl.formatMessage({ id: 'program.lab' }) : intl.formatMessage({ id: 'program.toad' })
  return intl.formatMessage({ id: 'program.both' })
}

function programColor(booking: BookingDoc): string {
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  if (ids.length > 1) return PROGRAM_COLORS.both
  return PROGRAM_COLORS[ids[0]] ?? 'var(--muted)'
}

function BookingCard({ booking }: { booking: BookingDoc }) {
  const { locale: userLocale } = useLocale()
  const intl = useIntl()
  const localeConfig = getLocaleConfig(userLocale)

  // Derive times from segment date+startHour
  const firstSeg = booking.segments?.[0]
  const lastSeg = booking.segments?.[booking.segments.length - 1]
  const times = firstSeg?.date != null && firstSeg?.startHour != null && lastSeg?.date != null && lastSeg?.startHour != null
    ? {
        startDate: slotToDate(firstSeg.date, firstSeg.startHour),
        endDate: slotEndDate(lastSeg.date, lastSeg.startHour),
      }
    : { startDate: null, endDate: null }

  const label = programLabel(booking, intl)
  const color = programColor(booking)

  const dateLabel = (() => {
    try {
      if (times?.startDate) {
        return format(times.startDate, 'EEE d MMM yyyy', { locale: localeConfig.locale })
      }
    } catch (e) {
      console.error('Error formatting date:', e)
    }
    return ''
  })()

  const timeLabel = (() => {
    try {
      if (times?.startDate && times?.endDate) {
        const startTime = format(times.startDate, localeConfig.timeFormat, { locale: localeConfig.locale })
        const endTime = format(times.endDate, localeConfig.timeFormat, { locale: localeConfig.locale })
        return `${startTime}–${endTime}`
      }
    } catch (e) {
      console.error('Error formatting time:', e)
    }
    return ''
  })()

  const statusColor = booking.status === 'confirmed' || booking.status === 'arrived'
    ? 'var(--brand-green)'
    : booking.status === 'pending'
    ? 'var(--brand-orange)'
    : 'var(--muted-foreground)'
  const statusLabel = booking.status === 'confirmed'
    ? intl.formatMessage({ id: 'bookings.status.confirmed' })
    : booking.status === 'arrived'
    ? intl.formatMessage({ id: 'bookings.status.arrived' })
    : booking.status === 'pending'
    ? intl.formatMessage({ id: 'bookings.status.pending' })
    : intl.formatMessage({ id: 'bookings.status.cancelled' })

  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="tap flex gap-3.5 p-3.5 rounded-[20px] border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', textDecoration: 'none', color: 'inherit' }}
    >
      {/* Color swatch */}
      <div
        className="flex-none w-14 rounded-2xl flex flex-col items-center justify-center gap-1 py-3"
        style={{ background: color }}
      >
        <CalendarCheck className="w-5 h-5" style={{ color: '#fff' }} />
        {dateLabel && (
          <span className="text-center leading-tight text-white font-bold" style={{ fontSize: 11 }}>
            {dateLabel.split(' ').slice(1, 3).join('\n')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold truncate">{label}</span>
          <span className="text-xs font-semibold flex-none" style={{ color: statusColor }}>
            {(booking.status === 'confirmed' || booking.status === 'arrived') && '✓ '}{statusLabel}
          </span>
        </div>
        {dateLabel && (
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {timeLabel ? `${dateLabel} · ${timeLabel}` : dateLabel}
          </div>
        )}
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'bookings.card.meta' }, { count: booking.studentCount, grade: booking.grade })}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 self-center flex-none" style={{ color: 'var(--muted-foreground)' }} />
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="flex gap-3.5 p-3.5 rounded-[20px] border animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex-none w-14 h-20 rounded-2xl" style={{ background: 'var(--muted)' }} />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <div className="h-3.5 rounded w-2/3" style={{ background: 'var(--muted)' }} />
        <div className="h-3 rounded w-1/2" style={{ background: 'var(--muted)' }} />
      </div>
    </div>
  )
}

export default function BookingsPage() {
  const intl = useIntl()
  const { data: bookings = [], isLoading } = useMyBookings()

  const upcoming = bookings.filter((b) => isUpcoming(b) && b.status !== 'cancelled')
  const past = bookings.filter((b) => !isUpcoming(b) || b.status === 'cancelled')

  return (
    <div
      className="min-h-screen flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      <header className="px-5 pt-12 lg:pt-6 pb-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {intl.formatMessage({ id: 'bookings.title' })}
          </h1>
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="upcoming" className="flex flex-col gap-4">
          <Tabs.List
            className="grid grid-cols-2 p-1 rounded-xl"
            style={{ background: 'var(--muted)' }}
          >
            <Tabs.Trigger value="upcoming" className="tab-trigger tap">
              {intl.formatMessage({ id: 'bookings.tab.upcoming' }, { count: upcoming.length })}
            </Tabs.Trigger>
            <Tabs.Trigger value="past" className="tab-trigger tap">
              {intl.formatMessage({ id: 'bookings.tab.past' })}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="upcoming" className="flex flex-col gap-3 pb-24 lg:pb-6">
            {isLoading ? (
              [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            ) : upcoming.length === 0 ? (
              <EmptyState
                label={intl.formatMessage({ id: 'bookings.empty.upcoming' })}
                sub={intl.formatMessage({ id: 'bookings.empty.upcoming.sub' })}
                cta={{ label: intl.formatMessage({ id: 'bookings.cta.book' }), href: '/book' }}
              />
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </Tabs.Content>

          <Tabs.Content value="past" className="flex flex-col gap-3 pb-24 lg:pb-6">
            {isLoading ? (
              [1, 2].map((n) => <SkeletonCard key={n} />)
            ) : past.length === 0 ? (
              <EmptyState
                label={intl.formatMessage({ id: 'bookings.empty.past' })}
                sub={intl.formatMessage({ id: 'bookings.empty.past.sub' })}
              />
            ) : (
              past.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </Tabs.Content>
        </Tabs.Root>
      </header>
    </div>
  )
}

function EmptyState({ label, sub, cta }: { label: string; sub: string; cta?: { label: string; href: string } }) {
  return (
    <div className="py-12 flex flex-col items-center text-center gap-2">
      <CalendarCheck className="w-10 h-10 mb-1" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
      <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</div>
      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>
      {cta && (
        <Link
          to={cta.href}
          className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold tap"
          style={{ background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}
