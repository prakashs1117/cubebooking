import { Link, useSearchParams } from 'react-router-dom'
import PageContainer from '../ui/PageContainer'
import * as Tabs from '@radix-ui/react-tabs'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import {
  CalendarCheck, ChevronRight, Truck, Clock,
  CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react'
import { useIntl } from 'react-intl'
import { useMyBookings, isUpcoming, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { useLocale } from '../../context/LocaleContext'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const PROGRAM_COLOR: Record<string, string> = {
  cube: 'var(--brand-mint)',
  lab:  'var(--brand-yellow)',
  toad: 'var(--brand-magenta)',
  both: 'var(--brand-purple)',
}

type Locale = typeof de

function getLocaleConfig(locale: string): { locale: Locale; timeFormat: string } {
  if (locale === 'de') return { locale: de, timeFormat: 'HH:mm' }
  return { locale: enUS, timeFormat: 'h:mm a' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function progIds(b: BookingDoc) {
  return [...new Set(b.segments?.map((s) => s.programId) ?? [])]
}

function swatchColor(b: BookingDoc) {
  const ids = progIds(b)
  if (ids.length > 1) return PROGRAM_COLOR.both
  return PROGRAM_COLOR[ids[0]] ?? 'var(--muted)'
}

function programLabel(b: BookingDoc, intl: ReturnType<typeof useIntl>) {
  const ids = progIds(b)
  if (!ids.length) return '—'
  if (ids.length > 1) return intl.formatMessage({ id: 'program.both' })
  return ids[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' })
    : ids[0] === 'lab'  ? intl.formatMessage({ id: 'program.lab' })
    : intl.formatMessage({ id: 'program.toad' })
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ booking }: { booking: BookingDoc }) {
  const intl = useIntl()
  const isToad = booking.type === 'toad'
  type Cfg = { label: string; color: string; bg: string; Icon: React.ElementType }
  const cfg: Cfg = (() => {
    switch (booking.status) {
      case 'confirmed': return { label: intl.formatMessage({ id: 'bookings.status.confirmed' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.10)', Icon: CheckCircle2 }
      case 'arrived':   return { label: intl.formatMessage({ id: 'bookings.status.arrived' }),   color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.10)', Icon: CheckCircle2 }
      case 'approved':  return { label: intl.formatMessage({ id: 'bookings.status.approved' }),  color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.10)', Icon: CheckCircle2 }
      case 'pending':   return { label: isToad ? intl.formatMessage({ id: 'bookings.status.awaitingApproval' }) : intl.formatMessage({ id: 'bookings.status.pending' }), color: 'var(--brand-orange)', bg: 'rgba(217,119,6,0.10)', Icon: Clock }
      case 'declined':  return { label: intl.formatMessage({ id: 'bookings.status.declined' }),  color: 'var(--destructive)', bg: 'rgba(220,38,38,0.08)', Icon: XCircle }
      default:          return { label: intl.formatMessage({ id: 'bookings.status.cancelled' }), color: 'var(--muted-foreground)', bg: 'transparent', Icon: XCircle }
    }
  })()
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold flex-none"
      style={{ background: cfg.bg, color: cfg.color }}>
      <cfg.Icon style={{ width: 10, height: 10 }} />
      {cfg.label}
    </span>
  )
}

// ─── Unified booking card ──────────────────────────────────────────────────────

function BookingCard({ booking }: { booking: BookingDoc }) {
  const { locale: userLocale } = useLocale()
  const intl = useIntl()
  const { locale, timeFormat } = getLocaleConfig(userLocale)

  const isToad = booking.type === 'toad'
  const seg0 = booking.segments?.[0]
  const segN = booking.segments?.[booking.segments.length - 1]

  // Date/time — onsite has startHour; TOAD is date-only
  const hasTime = seg0?.date && seg0?.startHour != null
  const startDate = hasTime ? slotToDate(seg0!.date, seg0!.startHour) : null
  const endDate   = hasTime && segN ? slotEndDate(segN.date, segN.startHour) : null
  const toadDate  = !hasTime && seg0?.date ? new Date(seg0.date + 'T12:00:00') : null

  const dateStr = startDate
    ? format(startDate, 'EEE d MMM', { locale })
    : toadDate
    ? format(toadDate, 'EEE d MMM yyyy', { locale })
    : ''
  const timeStr = startDate && endDate
    ? `${format(startDate, timeFormat, { locale })}–${format(endDate, timeFormat, { locale })}`
    : ''

  const isDeclined = booking.status === 'declined'
  const isPending  = isToad && booking.status === 'pending'
  const isApproved = booking.status === 'approved'

  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="tap flex flex-col rounded-[20px] border overflow-hidden"
      style={{
        background: 'var(--card)',
        borderColor: isDeclined ? 'rgba(220,38,38,0.22)' : 'var(--border)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Main row */}
      <div className="flex gap-3 p-3.5">
        {/* Swatch */}
        <div className="flex-none w-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 py-3"
          style={{ background: isDeclined ? 'rgba(220,38,38,0.10)' : isApproved && isToad ? 'rgba(1,136,76,0.12)' : swatchColor(booking) }}>
          {isToad
            ? <Truck style={{ width: 17, height: 17, color: isDeclined ? 'var(--destructive)' : isApproved ? 'var(--brand-green)' : '#fff' }} />
            : <CalendarCheck style={{ width: 17, height: 17, color: '#fff' }} />}
          {dateStr && (
            <span className="text-center font-bold leading-tight" style={{
              fontSize: 10,
              color: isDeclined ? 'var(--destructive)' : isApproved && isToad ? 'var(--brand-green)' : '#fff',
            }}>
              {isToad
                ? format(toadDate ?? new Date(), 'd MMM', { locale })
                : dateStr.split(' ').slice(1).join('\n')}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold truncate">{programLabel(booking, intl)}</span>
            <StatusBadge booking={booking} />
          </div>
          {isToad && booking.schoolName && (
            <div className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
              {booking.schoolName}
            </div>
          )}
          {dateStr && (
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {timeStr ? `${dateStr} · ${timeStr}` : dateStr}
            </div>
          )}
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'bookings.card.meta' }, { count: booking.studentCount, grade: booking.grade })}
          </div>
          {booking.bookingCode && (
            <span className="self-start text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
              {booking.bookingCode}
            </span>
          )}
        </div>

        <ChevronRight style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} className="self-center flex-none" />
      </div>

      {/* Context strip — TOAD only */}
      {isPending && (
        <div className="px-4 py-2 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--border)', background: 'rgba(217,119,6,0.06)' }}>
          <Clock style={{ width: 12, height: 12, color: 'var(--brand-orange)', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: 'var(--brand-orange)' }}>
            {intl.formatMessage({ id: 'bookings.toad.pendingHint' })}
          </span>
        </div>
      )}
      {isApproved && isToad && (
        <div className="px-4 py-2 border-t flex items-center gap-2"
          style={{ borderColor: 'rgba(1,136,76,0.15)', background: 'rgba(1,136,76,0.05)' }}>
          <CheckCircle2 style={{ width: 12, height: 12, color: 'var(--brand-green)', flexShrink: 0 }} />
          <span className="text-xs font-medium" style={{ color: 'var(--brand-green)' }}>
            {intl.formatMessage({ id: 'bookings.toad.approvedHint' })}
          </span>
        </div>
      )}
      {isDeclined && (
        <div className="px-4 py-2 border-t flex items-center justify-between gap-2"
          style={{ borderColor: 'rgba(220,38,38,0.12)', background: 'rgba(220,38,38,0.04)' }}>
          <span className="text-xs truncate" style={{ color: 'var(--destructive)' }}>
            {booking.declineReason
              ? intl.formatMessage({ id: 'bookings.toad.declinedReason' }, { reason: booking.declineReason })
              : intl.formatMessage({ id: 'bookings.toad.declinedHint' })}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold flex-none" style={{ color: 'var(--primary)' }}>
            <RefreshCw style={{ width: 10, height: 10 }} />
            {intl.formatMessage({ id: 'bookings.toad.tryAnother' })}
          </span>
        </div>
      )}
    </Link>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex gap-3 p-3.5 rounded-[20px] border animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex-none w-[52px] h-[72px] rounded-2xl" style={{ background: 'var(--muted)' }} />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <div className="h-3.5 rounded w-2/3" style={{ background: 'var(--muted)' }} />
        <div className="h-3 rounded w-1/2" style={{ background: 'var(--muted)' }} />
        <div className="h-3 rounded w-1/3" style={{ background: 'var(--muted)' }} />
      </div>
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, label, sub, cta }: {
  icon?: React.ElementType; label: string; sub: string
  cta?: { label: string; href: string }
}) {
  const Ic = Icon ?? CalendarCheck
  return (
    <div className="py-12 flex flex-col items-center text-center gap-2">
      <Ic className="w-10 h-10 mb-1" style={{ color: 'var(--muted-foreground)', opacity: 0.35 }} />
      <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</div>
      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>
      {cta && (
        <Link to={cta.href} className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold tap"
          style={{ background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}>
          {cta.label}
        </Link>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const intl = useIntl()
  const [searchParams] = useSearchParams()
  const { data: bookings = [], isLoading } = useMyBookings()

  const defaultTab = searchParams.get('tab') ?? 'upcoming'

  // All — every booking, newest first
  const all = [...bookings].sort((a, b) => {
    const aTs = (a.createdAt as { seconds: number } | undefined)?.seconds ?? 0
    const bTs = (b.createdAt as { seconds: number } | undefined)?.seconds ?? 0
    return bTs - aTs
  })

  // Upcoming — active future bookings of both types
  const upcoming = bookings.filter((b) => {
    if (b.status === 'cancelled' || b.status === 'declined') return false
    if (b.type === 'toad') return b.status === 'pending' || b.status === 'approved'
    return isUpcoming(b)
  }).sort((a, b) => {
    const aTs = (a.segments?.[0]?.date ?? '') + String(a.segments?.[0]?.startHour ?? 0)
    const bTs = (b.segments?.[0]?.date ?? '') + String(b.segments?.[0]?.startHour ?? 0)
    return aTs.localeCompare(bTs)
  })

  // Past — completed, cancelled, declined, arrived, or past-date confirmed
  const past = bookings.filter((b) => {
    if (b.status === 'arrived' || b.status === 'cancelled' || b.status === 'declined') return true
    if (b.type === 'toad') return false // pending/approved TOAD goes to upcoming
    return !isUpcoming(b)
  }).sort((a, b) => {
    const aTs = (a.createdAt as { seconds: number } | undefined)?.seconds ?? 0
    const bTs = (b.createdAt as { seconds: number } | undefined)?.seconds ?? 0
    return bTs - aTs
  })

  const pendingToadCount = bookings.filter((b) => b.type === 'toad' && b.status === 'pending').length

  return (
    <PageContainer className="gap-4">
      <h1 className="m-0 text-2xl font-extrabold tracking-tight hidden lg:block" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'bookings.title' })}
      </h1>

      <Tabs.Root defaultValue={defaultTab} className="flex flex-col gap-4">
        <Tabs.List className="grid grid-cols-3 p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
          <Tabs.Trigger value="all" className="tab-trigger tap">
            {intl.formatMessage({ id: 'bookings.tab.all' })}
          </Tabs.Trigger>
          <Tabs.Trigger value="upcoming" className="tab-trigger tap relative">
            {intl.formatMessage({ id: 'bookings.tab.upcoming' })}
            {pendingToadCount > 0 && (
              <span className="absolute" style={{ top: 4, right: 6, width: 7, height: 7, borderRadius: '9999px', background: 'var(--brand-magenta)' }} />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="past" className="tab-trigger tap">
            {intl.formatMessage({ id: 'bookings.tab.past' })}
          </Tabs.Trigger>
        </Tabs.List>

        {/* All */}
        <Tabs.Content value="all" className="flex flex-col gap-3">
          {isLoading
            ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            : all.length === 0
            ? <EmptyState label={intl.formatMessage({ id: 'bookings.empty.all' })} sub={intl.formatMessage({ id: 'bookings.empty.upcoming.sub' })} cta={{ label: intl.formatMessage({ id: 'bookings.cta.book' }), href: '/home?book=1' }} />
            : all.map((b) => <BookingCard key={b.id} booking={b} />)
          }
        </Tabs.Content>

        {/* Upcoming */}
        <Tabs.Content value="upcoming" className="flex flex-col gap-3">
          {isLoading
            ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            : upcoming.length === 0
            ? <EmptyState label={intl.formatMessage({ id: 'bookings.empty.upcoming' })} sub={intl.formatMessage({ id: 'bookings.empty.upcoming.sub' })} cta={{ label: intl.formatMessage({ id: 'bookings.cta.book' }), href: '/home?book=1' }} />
            : upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
          }
        </Tabs.Content>

        {/* Past */}
        <Tabs.Content value="past" className="flex flex-col gap-3">
          {isLoading
            ? [1, 2].map((n) => <SkeletonCard key={n} />)
            : past.length === 0
            ? <EmptyState label={intl.formatMessage({ id: 'bookings.empty.past' })} sub={intl.formatMessage({ id: 'bookings.empty.past.sub' })} />
            : past.map((b) => <BookingCard key={b.id} booking={b} />)
          }
        </Tabs.Content>
      </Tabs.Root>
    </PageContainer>
  )
}
