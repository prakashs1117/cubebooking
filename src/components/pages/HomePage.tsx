import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CalendarCheck, Package, Plus, ChevronRight, QrCode } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import { useMyBookings, isUpcoming, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { BookingModal } from '../booking/BookingModal'
import { BookingQRCode } from '../ui/BookingQRCode'
import type { VisitType } from '../../stores/bookingStore'

// ─── Program colours ──────────────────────────────────────────────────────────

const PROGRAM_COLORS: Record<string, string> = {
  cube: 'var(--brand-mint)',
  lab:  'var(--brand-yellow)',
  toad: 'var(--brand-magenta)',
}

function programAccent(booking: BookingDoc): string {
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  if (ids.length > 1) return 'var(--brand-purple)'
  return PROGRAM_COLORS[ids[0]] ?? 'var(--muted)'
}

function programLabel(booking: BookingDoc, intl: ReturnType<typeof useIntl>): string {
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  if (ids.length === 0) return '—'
  if (ids.length > 1) return intl.formatMessage({ id: 'program.both' })
  return ids[0] === 'cube'
    ? intl.formatMessage({ id: 'program.cube' })
    : ids[0] === 'lab'
    ? intl.formatMessage({ id: 'program.lab' })
    : intl.formatMessage({ id: 'program.toad' })
}

function bookingTimes(booking: BookingDoc) {
  const first = booking.segments?.[0]
  const last  = booking.segments?.[booking.segments.length - 1]
  if (!first?.date || first.startHour == null) return null
  return {
    start: slotToDate(first.date, first.startHour),
    end:   slotEndDate(last!.date, last!.startHour),
  }
}

// ─── Book visit cards ─────────────────────────────────────────────────────────

const PROGRAM_CARDS = [
  {
    id: 'onsite' as VisitType,
    labelKey:  'home.card.onsite.label',
    descKey:   'home.card.onsite.desc',
    tagKey:    'home.card.onsite.tag',
    tagColor:  'var(--brand-green)',
    tagBg:     'rgba(1,136,76,0.1)',
    accentColor: 'var(--primary)',
    icons: ['🔬', '⚗️'],
  },
  {
    id: 'toad' as VisitType,
    labelKey:  'home.card.toad.label',
    descKey:   'home.card.toad.desc',
    tagKey:    'home.card.toad.tag',
    tagColor:  'var(--brand-magenta)',
    tagBg:     'rgba(235,60,150,0.1)',
    accentColor: 'var(--brand-magenta)',
    icons: ['🚚', '🧪'],
  },
] as const

// ─── Next Visit hero card ─────────────────────────────────────────────────────

function NextVisitHero({
  booking,
  onOpenModal,
}: {
  booking: BookingDoc | null
  onOpenModal: () => void
}) {
  const intl = useIntl()
  const [qrOpen, setQrOpen] = useState(false)

  const times    = booking ? bookingTimes(booking) : null
  const label    = booking ? programLabel(booking, intl) : null
  const isArrived = booking?.status === 'arrived'

  const daysToGo = times?.start
    ? Math.ceil((times.start.getTime() - Date.now()) / 86_400_000)
    : null

  const isToday = daysToGo === 0
  const isPast  = daysToGo !== null && daysToGo < 0

  // Don't show QR for past / arrived bookings
  const canShowQr = booking && !isArrived && !isPast

  if (!booking) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="rise-2 tap relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4 text-left w-full"
        style={{ background: 'var(--brand-purple)', color: '#ffffff', boxShadow: 'var(--shadow-float)', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '9999px', background: 'var(--brand-mint)', right: 40, top: 40, opacity: 0.8 }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -60, top: -70, opacity: 0.9 }} />
        <div className="relative flex flex-col gap-1.5">
          <span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#ffffff', color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'home.nextVisit.bookNow' })}
          </span>
          <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mt-1">{intl.formatMessage({ id: 'home.nextVisit.label' })}</div>
          <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {intl.formatMessage({ id: 'home.nextVisit.bookFirst' })}
          </div>
        </div>
        <div className="relative text-sm opacity-75">
          {intl.formatMessage({ id: 'home.nextVisit.none' })}
        </div>
      </button>
    )
  }

  return (
    <div className="rise-2 relative overflow-hidden rounded-3xl" style={{ background: 'var(--brand-purple)', color: '#ffffff', boxShadow: 'var(--shadow-float)' }}>
      <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '9999px', background: 'var(--brand-mint)', right: 40, top: 40, opacity: 0.8 }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -60, top: -70, opacity: 0.9 }} />

      {/* Main tappable row → booking detail */}
      <Link
        to={`/bookings/${booking.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="tap relative px-5 pt-5 pb-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <span
                className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#ffffff', color: isArrived ? 'var(--brand-green)' : 'var(--brand-green)' }}
              >
                {isArrived
                  ? intl.formatMessage({ id: 'home.nextVisit.attended' })
                  : intl.formatMessage({ id: 'home.nextVisit.confirmed' })}
              </span>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mt-0.5">
                {intl.formatMessage({ id: 'home.nextVisit.label' })}
              </div>
              <div className="text-2xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {label}
              </div>
            </div>

            {/* Countdown / attended badge */}
            {!isArrived && daysToGo !== null && !isPast && (
              <div className="text-center rounded-2xl px-3 py-2 flex-none" style={{ background: 'rgba(14,14,17,0.28)', backdropFilter: 'blur(8px)' }}>
                {isToday ? (
                  <div className="text-base font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                    {intl.formatMessage({ id: 'home.nextVisit.today' })}
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)' }}>{daysToGo}</div>
                    <div className="text-[10px] font-semibold opacity-80 mt-1">days to go</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Date + time row */}
          {times && (
            <div className="flex items-center gap-2 text-sm opacity-90">
              <CalendarCheck className="w-3.5 h-3.5 flex-none" />
              <span>
                {intl.formatDate(times.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {intl.formatDate(times.start, { hour: '2-digit', minute: '2-digit', hour12: false })}
                {'–'}
                {intl.formatDate(times.end, { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
          )}

          {/* Booking code */}
          {booking.bookingCode && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest opacity-60">
                {intl.formatMessage({ id: 'home.nextVisit.code' })}
              </span>
              <span className="text-sm font-extrabold tracking-widest" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                {booking.bookingCode}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* QR expand toggle */}
      {canShowQr && (
        <div className="relative border-t mx-5" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
          <button
            type="button"
            onClick={() => setQrOpen((o) => !o)}
            className="tap w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer' }}
          >
            <span>{qrOpen ? intl.formatMessage({ id: 'home.nextVisit.hideQr' }) : intl.formatMessage({ id: 'home.nextVisit.showQr' })}</span>
            <ChevronRight
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: qrOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </button>

          {qrOpen && (
            <div className="flex flex-col items-center gap-3 pb-5 px-5 pt-1">
              <div className="p-3 rounded-2xl" style={{ background: '#ffffff' }}>
                <BookingQRCode bookingId={booking.id} size={160} />
              </div>
              <p className="m-0 text-xs text-center opacity-70">
                {intl.formatMessage({ id: 'bookingDetail.qr.hint' })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Quick actions row ────────────────────────────────────────────────────────

function QuickActions({ onNewBooking }: { onNewBooking: () => void }) {
  const intl = useIntl()
  return (
    <div className="rise-3 grid grid-cols-3 gap-3">
      <Link
        to="/bookings"
        className="tap flex flex-col items-center gap-2 py-4 rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', textDecoration: 'none', color: 'inherit' }}
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl" style={{ background: 'var(--tint-purple)' }}>
          <CalendarCheck className="w-5 h-5" style={{ color: 'var(--brand-purple)' }} />
        </span>
        <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'home.quickActions.bookings' })}
        </span>
      </Link>

      <Link
        to="/kit"
        className="tap flex flex-col items-center gap-2 py-4 rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', textDecoration: 'none', color: 'inherit' }}
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl" style={{ background: 'rgba(150,215,210,0.18)' }}>
          <Package className="w-5 h-5" style={{ color: 'var(--brand-mint)' }} />
        </span>
        <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'home.quickActions.kit' })}
        </span>
      </Link>

      <button
        type="button"
        onClick={onNewBooking}
        className="tap flex flex-col items-center gap-2 py-4 rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', cursor: 'pointer' }}
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl" style={{ background: 'rgba(20,155,95,0.12)' }}>
          <Plus className="w-5 h-5" style={{ color: 'var(--primary)' }} />
        </span>
        <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'home.quickActions.newBooking' })}
        </span>
      </button>
    </div>
  )
}

// ─── Upcoming mini-list (2nd+ bookings) ───────────────────────────────────────

function UpcomingList({ bookings }: { bookings: BookingDoc[] }) {
  const intl = useIntl()
  if (bookings.length === 0) return null

  return (
    <div className="rise-4 flex flex-col gap-2">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
        {intl.formatMessage({ id: 'home.upcoming.title' })}
      </h2>
      <div className="flex flex-col gap-2">
        {bookings.map((booking) => {
          const times  = bookingTimes(booking)
          const label  = programLabel(booking, intl)
          const accent = programAccent(booking)
          return (
            <Link
              key={booking.id}
              to={`/bookings/${booking.id}`}
              className="tap flex items-center gap-3 px-3.5 py-3 rounded-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', textDecoration: 'none', color: 'inherit' }}
            >
              <span
                className="flex-none w-2 self-stretch rounded-full"
                style={{ background: accent }}
              />
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold truncate">{label}</span>
                {times && (
                  <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                    {intl.formatDate(times.start, { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {intl.formatDate(times.start, { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {'–'}
                    {intl.formatDate(times.end, { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                )}
              </div>
              {booking.bookingCode && (
                <span className="flex-none text-[11px] font-bold tracking-wider" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-display)' }}>
                  {booking.bookingCode}
                </span>
              )}
              <ChevronRight className="flex-none w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Desktop hero grid (lg: only) ────────────────────────────────────────────

function DesktopHeroGrid({
  nextBooking,
  onOpenModal,
}: {
  nextBooking: BookingDoc | null
  onOpenModal: () => void
}) {
  const intl = useIntl()
  const times  = nextBooking ? bookingTimes(nextBooking) : null
  const label  = nextBooking ? programLabel(nextBooking, intl) : null
  const segments = nextBooking?.segments ?? []

  const daysToGo = times?.start
    ? Math.ceil((times.start.getTime() - Date.now()) / 86_400_000)
    : null

  // Derive program chips from segments
  const chips = segments.map((s) => ({
    name: s.programId === 'cube'
      ? intl.formatMessage({ id: 'program.cube' })
      : s.programId === 'lab'
      ? intl.formatMessage({ id: 'program.lab' })
      : intl.formatMessage({ id: 'program.toad' }),
    bg: PROGRAM_COLORS[s.programId] ?? 'var(--muted)',
    time: `${String(s.startHour).padStart(2, '0')}:00`,
  }))

  return (
    <div
      className="hidden lg:grid gap-5"
      style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}
    >
      {/* Left: next visit hero card */}
      {nextBooking ? (
        <div
          className="relative overflow-hidden flex flex-col gap-4 tap"
          style={{
            minHeight: 260,
            padding: 28,
            borderRadius: 28,
            background: 'var(--brand-purple)',
            color: '#ffffff',
          }}
        >
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -70, top: -110 }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', background: 'var(--brand-mint)', right: 150, bottom: -70 }} />

          {/* Status + title */}
          <div className="relative flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span
                className="self-start inline-flex gap-1.5 items-center px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#ffffff', color: 'var(--brand-green)' }}
              >
                ✓ {intl.formatMessage({ id: 'home.nextVisit.confirmed' })}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-85">
                {intl.formatMessage({ id: 'home.desktop.yourNextVisit' })}
              </span>
              <span className="font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: '40px' }}>
                {label}
              </span>
              {times && (
                <span className="text-sm">
                  {intl.formatDate(times.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {intl.formatDate(times.start, { hour: '2-digit', minute: '2-digit', hour12: false })}
                  {'–'}
                  {intl.formatDate(times.end, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </div>

            {/* Days-to-go badge */}
            {daysToGo !== null && daysToGo >= 0 && (
              <div
                className="text-center flex-none"
                style={{ padding: '14px 20px', borderRadius: 20, background: 'rgba(14,14,17,0.28)', backdropFilter: 'blur(8px)' }}
              >
                <div className="font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 44 }}>
                  {daysToGo === 0 ? intl.formatMessage({ id: 'home.nextVisit.today' }) : daysToGo}
                </div>
                {daysToGo > 0 && (
                  <div className="text-xs font-semibold mt-1">
                    {intl.formatMessage({ id: 'home.desktop.daysToGo' })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Program chips */}
          {chips.length > 0 && (
            <div className="relative flex items-center gap-2">
              {chips.map((chip, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight style={{ width: 16, height: 16, color: '#ffffff' }} />}
                  <div
                    className="flex-1"
                    style={{ padding: '10px 14px', borderRadius: 16, background: chip.bg, color: 'var(--foreground)' }}
                  >
                    <div className="text-sm font-bold">{chip.name}</div>
                    <div className="text-xs">{chip.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* No booking state */
        <button
          type="button"
          onClick={onOpenModal}
          className="relative overflow-hidden flex flex-col justify-end gap-3 tap"
          style={{
            minHeight: 260,
            padding: 28,
            borderRadius: 28,
            background: 'var(--brand-purple)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -70, top: -110 }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', background: 'var(--brand-mint)', right: 150, bottom: -70 }} />
          <div className="relative flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {intl.formatMessage({ id: 'home.desktop.yourNextVisit' })}
            </span>
            <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>
              {intl.formatMessage({ id: 'home.nextVisit.bookFirst' })}
            </span>
          </div>
          <span
            className="relative self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#ffffff', color: 'var(--brand-purple)' }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            {intl.formatMessage({ id: 'desktop.topbar.book' })}
          </span>
        </button>
      )}

      {/* Right: Book again quick links */}
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-lg font-bold">{intl.formatMessage({ id: 'home.desktop.bookAgain' })}</h2>
        {[
          { labelKey: 'program.cube', subKey: 'home.card.onsite.tag', bg: 'var(--brand-mint)',    visitType: 'onsite' as const },
          { labelKey: 'program.lab',  subKey: 'home.card.onsite.tag', bg: 'var(--brand-yellow)',  visitType: 'onsite' as const },
          { labelKey: 'program.toad', subKey: 'home.card.toad.tag',   bg: 'var(--brand-magenta)', visitType: 'toad'   as const },
        ].map(({ labelKey, subKey, bg }) => (
          <button
            key={labelKey}
            type="button"
            onClick={() => onOpenModal()}
            className="tap flex items-center gap-3.5 text-left"
            style={{
              padding: '14px 16px',
              borderRadius: 20,
              background: bg,
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)',
              fontFamily: 'inherit',
            }}
          >
            <span className="flex-1">
              <span className="block text-sm font-bold">{intl.formatMessage({ id: labelKey })}</span>
              <span className="text-xs">{intl.formatMessage({ id: subKey })}</span>
            </span>
            <ChevronRight style={{ width: 18, height: 18 }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop bookings table (lg: only) ───────────────────────────────────────

function DesktopBookingsTable({ bookings }: { bookings: BookingDoc[] }) {
  const intl = useIntl()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const now = Date.now()
  const filtered = bookings
    .filter((b) => b.status !== 'cancelled')
    .filter((b) => {
      const times = bookingTimes(b)
      const isUp = times ? times.start.getTime() > now : false
      return tab === 'upcoming' ? isUp : !isUp
    })
    .sort((a, b) => {
      const aT = bookingTimes(a)?.start.getTime() ?? 0
      const bT = bookingTimes(b)?.start.getTime() ?? 0
      return tab === 'upcoming' ? aT - bT : bT - aT
    })

  const statusChip = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      confirmed: { label: intl.formatMessage({ id: 'bookings.status.confirmed' }), bg: 'var(--tint-purple)',  color: 'var(--brand-purple)' },
      pending:   { label: intl.formatMessage({ id: 'bookings.status.pending' }),   bg: 'var(--tint-yellow)',  color: 'var(--brand-orange)' },
      arrived:   { label: intl.formatMessage({ id: 'bookings.status.arrived' }),   bg: 'rgba(1,136,76,0.1)', color: 'var(--brand-green)'  },
      cancelled: { label: intl.formatMessage({ id: 'bookings.status.cancelled' }), bg: 'var(--tint-red)',     color: 'var(--destructive)'  },
    }
    return map[status] ?? map['confirmed']
  }

  return (
    <div className="hidden lg:flex flex-col" style={{ borderRadius: 28, background: 'var(--card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5">
        <h2 className="m-0 flex-1 text-lg font-bold">{intl.formatMessage({ id: 'home.desktop.myBookings' })}</h2>
        <div className="flex p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-sm tap"
              style={{
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: tab === t ? 600 : 400,
                background: tab === t ? 'var(--background)' : 'transparent',
                color: 'var(--foreground)',
              }}
            >
              {t === 'upcoming'
                ? intl.formatMessage({ id: 'home.desktop.upcoming' })
                : intl.formatMessage({ id: 'home.desktop.past' })}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-6 py-2.5 border-t border-b text-xs font-semibold"
        style={{
          gridTemplateColumns: '90px minmax(0,1.3fr) minmax(0,1fr) 110px 90px',
          gap: 12,
          borderColor: 'var(--border)',
          color: 'var(--muted-foreground)',
        }}
      >
        <span>{intl.formatMessage({ id: 'home.desktop.tableDate' })}</span>
        <span>{intl.formatMessage({ id: 'home.desktop.tableVisit' })}</span>
        <span>{intl.formatMessage({ id: 'home.desktop.tableClass' })}</span>
        <span>{intl.formatMessage({ id: 'home.desktop.tableStatus' })}</span>
        <span />
      </div>

      {/* Rows */}
      {filtered.length === 0 && (
        <div className="px-6 py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {tab === 'upcoming'
            ? intl.formatMessage({ id: 'bookings.empty.upcoming' })
            : intl.formatMessage({ id: 'bookings.empty.past' })}
        </div>
      )}
      {filtered.map((b) => {
        const times = bookingTimes(b)
        const label = programLabel(b, intl)
        const accent = programAccent(b)
        const chip = statusChip(b.status)
        return (
          <div
            key={b.id}
            className="grid px-6 items-center border-b"
            style={{
              gridTemplateColumns: '90px minmax(0,1.3fr) minmax(0,1fr) 110px 90px',
              gap: 12,
              minHeight: 64,
              borderColor: 'var(--border)',
            }}
          >
            <span className="flex flex-col">
              <span className="text-sm font-bold">
                {times ? intl.formatDate(times.start, { day: 'numeric', month: 'short' }) : '—'}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {times ? intl.formatDate(times.start, { weekday: 'short' }) : ''}
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="w-2.5 self-stretch rounded-full flex-none" style={{ background: accent }} />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {times
                    ? `${intl.formatDate(times.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(times.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`
                    : ''}
                </span>
              </span>
            </span>
            <span className="text-sm">{b.grade ? `Grade ${b.grade} · ${b.studentCount ?? '—'} students` : '—'}</span>
            <span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: chip.bg, color: chip.color }}>
                {chip.label}
              </span>
            </span>
            <Link
              to={`/bookings/${b.id}`}
              className="text-sm font-semibold tap justify-self-end"
              style={{ textDecoration: 'none', color: 'var(--brand-purple)' }}
            >
              {intl.formatMessage({ id: 'home.desktop.view' })}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// ─── Staff scan banner ────────────────────────────────────────────────────────

function StaffScanBanner() {
  const intl = useIntl()
  return (
    <Link
      to="/admin"
      className="rise tap flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: 'var(--brand-purple)',
        color: '#ffffff',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-float)',
      }}
    >
      <span
        className="grid place-items-center rounded-xl flex-none"
        style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.18)' }}
      >
        <QrCode style={{ width: 24, height: 24 }} />
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-bold">
          {intl.formatMessage({ id: 'adminDash.scanCta' })}
        </span>
        <span className="text-xs opacity-70">
          {intl.formatMessage({ id: 'adminDash.title' })}
        </span>
      </div>
      <ChevronRight style={{ width: 18, height: 18, opacity: 0.7, flexShrink: 0 }} />
    </Link>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { profile, isStaff } = useAuthContext()
  const intl = useIntl()
  const { data: bookings = [] } = useMyBookings()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVisitType, setModalVisitType] = useState<VisitType | undefined>(undefined)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const openBooking = (visitType?: VisitType) => {
    setModalVisitType(visitType)
    setModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get('book') === '1') {
      openBooking()
      navigate('/home', { replace: true })
    }
  }, [searchParams, navigate])

  const name = profile?.displayName || 'there'

  const hour = new Date().getHours()
  const greetingKey = hour < 12 ? 'home.greeting.morning' : hour < 18 ? 'home.greeting.afternoon' : 'home.greeting.evening'

  // All active upcoming bookings sorted by start time
  const upcomingAll = bookings
    .filter((b) => isUpcoming(b) && b.status !== 'cancelled')
    .sort((a, b) => {
      const aT = bookingTimes(a)?.start.getTime() ?? 0
      const bT = bookingTimes(b)?.start.getTime() ?? 0
      return aT - bT
    })

  const nextBooking = upcomingAll[0] ?? null
  const restBookings = upcomingAll.slice(1, 4) // show up to 3 more

  return (
    <div
      className="flex flex-col"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)', minHeight: '100%' }}
    >
      <main className="flex-1 px-4 md:px-6 lg:px-10 py-6 flex flex-col gap-5 max-w-3xl lg:max-w-none mx-auto w-full pb-24 lg:pb-10">

        {/* Greeting — hidden on desktop (desktop shows its own greeting row below) */}
        <div className="rise flex flex-col gap-0.5 lg:hidden">
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: greetingKey })},
          </div>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {name}
          </h1>
          {profile?.schoolName && (
            <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {profile.schoolName}
            </div>
          )}
        </div>

        {/* Desktop greeting row (visible only on lg:) */}
        <div className="hidden lg:flex items-end gap-4">
          <div className="flex-1">
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 className="m-0 font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: '40px' }}>
              {intl.formatMessage({ id: greetingKey })}, {name}
            </h1>
          </div>
        </div>

        {/* Staff scanner shortcut — mobile/tablet only (staff have sidebar on desktop) */}
        {isStaff && <StaffScanBanner />}

        {/* Desktop: two-column hero grid */}
        <DesktopHeroGrid nextBooking={nextBooking} onOpenModal={() => openBooking()} />

        {/* Mobile/tablet: next visit hero */}
        <div className="lg:hidden">
          <NextVisitHero booking={nextBooking} onOpenModal={() => openBooking()} />
        </div>

        {/* Mobile/tablet: quick actions */}
        <div className="lg:hidden">
          <QuickActions onNewBooking={() => openBooking()} />
        </div>

        {/* Mobile/tablet: more upcoming */}
        <div className="lg:hidden">
          <UpcomingList bookings={restBookings} />
        </div>

        {/* Desktop: bookings table */}
        <DesktopBookingsTable bookings={bookings} />

        {/* Book a visit section — mobile/tablet only */}
        <div className="rise-5 flex flex-col gap-3">
          <h2 className="text-base font-semibold lg:hidden" style={{ color: 'var(--foreground)' }}>
            {intl.formatMessage({ id: 'home.bookSection' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {PROGRAM_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => openBooking(card.id)}
                className="tap flex flex-col gap-4 p-5 rounded-2xl border text-left w-full"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xs)', color: 'inherit' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 text-2xl">{card.icons.map((ic) => <span key={ic}>{ic}</span>)}</div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: card.tagBg, color: card.tagColor }}>
                    {intl.formatMessage({ id: card.tagKey })}
                  </span>
                </div>
                <div>
                  <div className="font-bold mb-1">{intl.formatMessage({ id: card.labelKey })}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {intl.formatMessage({ id: card.descKey })}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: card.accentColor }}>
                  {intl.formatMessage({ id: 'home.card.bookNow' })} <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialVisitType={modalVisitType}
      />
    </div>
  )
}
