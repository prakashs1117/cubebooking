import { Link } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { format } from 'date-fns'
import { CalendarCheck, ChevronRight, Menu as MenuIcon } from 'lucide-react'
import { useMyBookings, isUpcoming, type BookingDoc } from '../../hooks/queries/useBookings'
import type { Timestamp } from 'firebase/firestore'

const PROGRAM_COLORS: Record<string, string> = {
  cube: 'var(--cube)',
  lab: 'var(--lab)',
  toad: 'var(--toad)',
  both: 'var(--brand-purple)',
}

function programLabel(booking: BookingDoc): string {
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  if (ids.length === 0) return 'Visit'
  if (ids.length === 1) return ids[0] === 'cube' ? 'Curiosity Cube' : ids[0] === 'lab' ? 'Curiosity Lab' : 'TOAD Truck'
  return 'Cube + Lab'
}

function programColor(booking: BookingDoc): string {
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  if (ids.length > 1) return PROGRAM_COLORS.both
  return PROGRAM_COLORS[ids[0]] ?? 'var(--muted)'
}

function BookingCard({ booking }: { booking: BookingDoc }) {
  const label = programLabel(booking)
  const color = programColor(booking)
  const dateLabel = (() => {
    try {
      const seg = booking.segments?.[0] as unknown as { start?: Timestamp }
      if (seg?.start) return format(seg.start.toDate(), 'EEE d MMM yyyy')
    } catch { /* noop */ }
    return ''
  })()

  const timeLabel = (() => {
    try {
      const firstSeg = booking.segments?.[0] as unknown as { start?: Timestamp }
      const lastSeg = booking.segments?.[booking.segments.length - 1] as unknown as { end?: Timestamp }
      if (firstSeg?.start && lastSeg?.end) {
        const startTime = format(firstSeg.start.toDate(), 'HH:mm')
        const endTime = format(lastSeg.end.toDate(), 'HH:mm')
        return `${startTime}–${endTime}`
      }
    } catch { /* noop */ }
    return ''
  })()

  const statusColor = booking.status === 'confirmed' ? 'var(--brand-green)' : booking.status === 'pending' ? 'var(--brand-orange)' : 'var(--muted-foreground)'
  const statusLabel = booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'pending' ? 'Pending' : booking.status

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
          <span className="text-xs font-semibold flex-none" style={{ color: statusColor }}>{statusLabel}</span>
        </div>
        {dateLabel && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span>{dateLabel}</span>
            {timeLabel && <span>· {timeLabel}</span>}
          </div>
        )}
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {booking.studentCount} students · Grade {booking.grade}
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
          <h1 className="m-0 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            My bookings
          </h1>
          <MenuIcon className="w-5 h-5 lg:hidden" style={{ color: 'var(--muted-foreground)' }} />
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="upcoming" className="flex flex-col gap-4">
          <Tabs.List
            className="grid grid-cols-2 p-1 rounded-xl"
            style={{ background: 'var(--muted)' }}
          >
            <Tabs.Trigger value="upcoming" className="tab-trigger tap">
              Upcoming · {upcoming.length}
            </Tabs.Trigger>
            <Tabs.Trigger value="past" className="tab-trigger tap">
              Past
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="upcoming" className="flex flex-col gap-3 pb-24 lg:pb-6">
            {isLoading ? (
              [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            ) : upcoming.length === 0 ? (
              <EmptyState
                label="No upcoming bookings"
                sub="Book a Cube, Lab, or TOAD visit for your class."
                cta={{ label: 'Book a visit', href: '/book' }}
              />
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </Tabs.Content>

          <Tabs.Content value="past" className="flex flex-col gap-3 pb-24 lg:pb-6">
            {isLoading ? (
              [1, 2].map((n) => <SkeletonCard key={n} />)
            ) : past.length === 0 ? (
              <EmptyState label="No past bookings yet" sub="Your completed visits will appear here." />
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
