import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CalendarCheck, Package, Plus, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import { useMyBookings, isUpcoming, type BookingDoc } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import type { Timestamp } from 'firebase/firestore'
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { profile } = useAuthContext()
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
      <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-3xl lg:max-w-4xl mx-auto w-full pb-24 lg:pb-8">

        {/* Greeting */}
        <div className="rise flex flex-col gap-0.5">
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

        {/* Next visit hero */}
        <NextVisitHero booking={nextBooking} onOpenModal={() => openBooking()} />

        {/* Quick actions */}
        <QuickActions onNewBooking={() => openBooking()} />

        {/* More upcoming bookings */}
        <UpcomingList bookings={restBookings} />

        {/* Book a visit section */}
        <div className="rise-5 flex flex-col gap-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
            {intl.formatMessage({ id: 'home.bookSection' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
