import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, CalendarPlus, MapPin, Clock, Users, GraduationCap,
  QrCode, CheckCircle2, AlertCircle, Truck, RefreshCw, XCircle, School,
  X,
} from 'lucide-react'
import { useIntl } from 'react-intl'
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import { useBooking } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate, toSlotDocId, toTeacherSlotDocId } from '../../config/slots'
import { trackBookingCancelled } from '../../services/analyticsService'
import { CancelBookingDialog } from '../booking/CancelBookingDialog'
import { BookingQRCode } from '../ui/BookingQRCode'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCalendarUrl(title: string, start: Date, end: Date, location: string, details = '') {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE', text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details, location,
  })}`
}

type BookingStatus = 'pending' | 'approved' | 'declined' | 'confirmed' | 'arrived' | 'cancelled'

interface StatusCfg { label: string; color: string; bg: string; icon: React.ElementType }

function getStatusCfg(status: BookingStatus, isToad: boolean, intl: ReturnType<typeof useIntl>): StatusCfg {
  switch (status) {
    case 'confirmed': return { label: intl.formatMessage({ id: 'bookingDetail.status.confirmed' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.15)', icon: CheckCircle2 }
    case 'arrived':   return { label: intl.formatMessage({ id: 'bookingDetail.status.arrived' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.15)', icon: CheckCircle2 }
    case 'approved':  return { label: intl.formatMessage({ id: 'bookingDetail.status.approved' }), color: 'var(--brand-green)', bg: 'rgba(1,136,76,0.15)', icon: CheckCircle2 }
    case 'pending':   return { label: isToad ? intl.formatMessage({ id: 'bookings.status.awaitingApproval' }) : intl.formatMessage({ id: 'bookingDetail.status.pending' }), color: 'var(--brand-orange)', bg: 'rgba(217,119,6,0.15)', icon: Clock }
    case 'declined':  return { label: intl.formatMessage({ id: 'bookingDetail.status.declined' }), color: 'var(--destructive)', bg: 'rgba(220,38,38,0.12)', icon: XCircle }
    default:          return { label: intl.formatMessage({ id: 'bookingDetail.status.cancelled' }), color: 'var(--muted-foreground)', bg: 'rgba(100,116,139,0.10)', icon: XCircle }
  }
}

// ─── Detail row — compact for mobile ─────────────────────────────────────────

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-3.5 min-h-[44px] py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <Icon className="w-3.5 h-3.5 flex-none mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
      <span className="w-24 text-xs flex-none leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="flex-1 text-sm font-medium leading-relaxed" style={{ color: 'var(--foreground)' }}>{value}</span>
    </div>
  )
}

// ─── Quick action pill ────────────────────────────────────────────────────────

function ActionPill({ icon: Icon, label, onClick, active, color }: {
  icon: React.ElementType
  label: string
  onClick?: () => void
  active?: boolean
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl"
      style={{
        background: active ? 'rgba(99,102,241,0.10)' : 'var(--card)',
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        color: color ?? (active ? 'var(--primary)' : 'var(--foreground)'),
      }}
    >
      <Icon style={{ width: 20, height: 20 }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.01em' }}>{label}</span>
    </button>
  )
}

// ─── QR Sheet (full-width panel that slides in below quick actions) ───────────

function QRSheet({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Sheet header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <QrCode style={{ width: 16, height: 16, color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Entry QR Code</span>
        </div>
        <button type="button" onClick={onClose} className="iconbtn tap" style={{ width: 28, height: 28, color: 'var(--muted-foreground)' }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {/* QR */}
      <div className="flex flex-col items-center gap-3 px-5 py-5">
        <div className="p-3.5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
          <BookingQRCode bookingId={bookingId} size={200} />
        </div>
        <p className="m-0 text-xs text-center leading-relaxed" style={{ color: 'var(--muted-foreground)', maxWidth: 220 }}>
          Show this code at the venue entrance for quick check-in
        </p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const intl = useIntl()
  const { data: booking, isLoading, error } = useBooking(id)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const firstSeg = booking?.segments?.[0]
  const lastSeg  = booking?.segments?.[(booking.segments.length ?? 1) - 1]
  const times = firstSeg?.date && firstSeg?.startHour != null
    ? { startDate: slotToDate(firstSeg.date, firstSeg.startHour), endDate: slotEndDate(lastSeg!.date, lastSeg!.startHour) }
    : { startDate: null, endDate: null }

  // Must be called unconditionally before any early returns (Rules of Hooks)
  const isToadEarly = booking?.type === 'toad'
  const statusEarly = (booking?.status ?? 'cancelled') as BookingStatus
  const scfg = getStatusCfg(statusEarly, isToadEarly, intl)
  const StatusIcon = scfg.icon

  const handleConfirmCancel = async () => {
    if (!id || !booking) return
    setCancelling(true)
    try {
      const batch = writeBatch(db)
      batch.update(doc(db, 'bookings', id), { status: 'cancelled', updatedAt: serverTimestamp() })
      if (booking.type !== 'toad') {
        for (const seg of booking.segments ?? []) {
          batch.delete(doc(db, 'slots', toSlotDocId(seg.date, seg.programId, seg.startHour)))
        }
        const uniqueHours = [...new Set((booking.segments ?? []).map((s) => `${s.date}:${s.startHour}`))]
        for (const key of uniqueHours) {
          const [date, hourStr] = key.split(':')
          batch.delete(doc(db, 'teacherSlots', toTeacherSlotDocId(booking.teacherId, date, Number(hourStr))))
        }
      }
      await batch.commit()
      trackBookingCancelled(id, 'user_cancelled')
      setCancelDialogOpen(false)
      navigate('/bookings', { replace: true })
    } catch {
      alert(intl.formatMessage({ id: 'bookingDetail.cancelError' }) || 'Failed to cancel. Please try again.')
      setCancelling(false)
    }
  }

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--app-ground)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
    </div>
  )
  if (error || !booking) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5" style={{ background: 'var(--app-ground)' }}>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'bookingDetail.notFound' })}</p>
      <button type="button" onClick={() => navigate('/bookings')} className="tap text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        {intl.formatMessage({ id: 'bookingDetail.backToBookings' })}
      </button>
    </div>
  )

  const isToad   = booking.type === 'toad'
  const progIds  = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  const isBoth   = progIds.length > 1
  const accentBg = isBoth ? 'var(--brand-purple)'
    : progIds[0] === 'cube' ? 'var(--brand-mint)'
    : progIds[0] === 'lab'  ? 'var(--brand-yellow)'
    : 'var(--brand-magenta)'

  const programTitle = isBoth
    ? intl.formatMessage({ id: 'program.both.visit' })
    : progIds[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' })
    : progIds[0] === 'lab'  ? intl.formatMessage({ id: 'program.lab' })
    : intl.formatMessage({ id: 'program.toad' })

  const status = booking.status as BookingStatus

  const startDate = times.startDate
  const endDate   = times.endDate

  const arrivedAtDate = booking.arrivedAt
    ? new Date((booking.arrivedAt as unknown as { seconds: number }).seconds * 1000)
    : null

  const calendarLocation = isToad
    ? (booking.truckParking ?? booking.schoolName ?? '')
    : 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt'

  const canShowQr  = !!id && status !== 'cancelled' && status !== 'declined' && !(isToad && status === 'pending')
  const canCalendar = !!startDate && !!endDate && (status === 'confirmed' || status === 'arrived' || (isToad && status === 'approved'))
  const canCancel  = status !== 'cancelled' && status !== 'declined'
  const hasActions = canShowQr || canCalendar || (isToad && status === 'declined')

  return (
    <div
      className="flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full pb-24 lg:pb-8"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-3 pt-2.5 pb-5" style={{ background: accentBg }}>
        {/* Subtle decorative circle */}
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '9999px', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -50, width: 100, height: 100, borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

        {/* Nav row */}
        <div className="relative flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="iconbtn tap"
            aria-label="Back"
            style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', color: '#fff', width: 36, height: 36 }}
          >
            <ChevronLeft style={{ width: 18, height: 18 }} />
          </button>

          {/* Status pill — top right */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', color: '#fff' }}
          >
            <StatusIcon style={{ width: 11, height: 11 }} />
            {scfg.label}
          </span>
        </div>

        {/* Content */}
        <div className="relative flex flex-col gap-1 px-0.5">
          {isToad && <Truck style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }} />}

          <h1 className="m-0 font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '32px', color: '#fff' }}>
            {programTitle}
          </h1>

          {startDate && (
            <p className="m-0 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {intl.formatDate(startDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              {endDate && (
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {' · '}{intl.formatDate(startDate, { hour: '2-digit', minute: '2-digit', hour12: false })}–{intl.formatDate(endDate, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </p>
          )}

          {isToad && booking.schoolName && (
            <p className="m-0 text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>{booking.schoolName}</p>
          )}

          {/* Booking code — prominent, scannable */}
          {booking.bookingCode && (
            <div className="mt-2 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.20)', backdropFilter: 'blur(8px)' }}>
              <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.18em', fontSize: 9, textTransform: 'uppercase' }}>CODE</span>
              <span className="font-extrabold" style={{ color: '#fff', fontSize: 16, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                {booking.bookingCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACTIONS ───────────────────────────────────────────────────── */}
      {hasActions && (
        <div className="px-3 pt-3 flex gap-2.5">
          {canShowQr && (
            <ActionPill
              icon={QrCode}
              label="QR Code"
              onClick={() => setQrOpen((o) => !o)}
              active={qrOpen}
            />
          )}
          {canCalendar && (
            <a
              href={makeCalendarUrl(
                `${programTitle} – Class ${booking.grade}`,
                startDate!, endDate!, calendarLocation,
                `${booking.studentCount} students · Grade ${booking.grade}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="tap flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl"
              style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--foreground)', textDecoration: 'none' }}
            >
              <CalendarPlus style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{intl.formatMessage({ id: 'bookingDetail.addToCalendar' })}</span>
            </a>
          )}
          {isToad && status === 'declined' && (
            <Link
              to="/home?book=1"
              className="tap flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl"
              style={{ background: 'var(--tint-magenta)', border: '1.5px solid rgba(217,70,239,0.25)', color: 'var(--brand-magenta)', textDecoration: 'none' }}
            >
              <RefreshCw style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{intl.formatMessage({ id: 'bookingDetail.toad.bookAnother' })}</span>
            </Link>
          )}
        </div>
      )}

      {/* ── QR SHEET (inline, below quick actions) ──────────────────────────── */}
      {qrOpen && id && (
        <div className="px-3 pt-2.5">
          <QRSheet bookingId={id} onClose={() => setQrOpen(false)} />
        </div>
      )}

      {/* ── TOAD CONTEXT NOTE ───────────────────────────────────────────────── */}
      {isToad && status === 'pending' && (
        <div className="mx-3 mt-3 flex gap-2.5 items-start px-3.5 py-3 rounded-2xl"
          style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.18)' }}>
          <Clock style={{ width: 16, height: 16, color: 'var(--brand-orange)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="m-0 text-xs font-semibold" style={{ color: 'var(--brand-orange)' }}>
              {intl.formatMessage({ id: 'bookingDetail.toad.pendingTitle' })}
            </p>
            <p className="m-0 text-xs leading-relaxed mt-0.5" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              {intl.formatMessage({ id: 'bookingDetail.toad.pendingNote' })}
            </p>
          </div>
        </div>
      )}
      {isToad && status === 'approved' && (
        <div className="mx-3 mt-3 flex gap-2.5 items-start px-3.5 py-3 rounded-2xl"
          style={{ background: 'rgba(1,136,76,0.07)', border: '1px solid rgba(1,136,76,0.18)' }}>
          <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--brand-green)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="m-0 text-xs font-semibold" style={{ color: 'var(--brand-green)' }}>
              {intl.formatMessage({ id: 'bookingDetail.toad.approvedTitle' })}
            </p>
            <p className="m-0 text-xs leading-relaxed mt-0.5" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              {intl.formatMessage({ id: 'bookingDetail.toad.approvedNote' })}
            </p>
          </div>
        </div>
      )}
      {isToad && status === 'declined' && (
        <div className="mx-3 mt-3 flex gap-2.5 items-start px-3.5 py-3 rounded-2xl"
          style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.18)' }}>
          <XCircle style={{ width: 16, height: 16, color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="m-0 text-xs font-semibold" style={{ color: 'var(--destructive)' }}>
              {intl.formatMessage({ id: 'bookingDetail.toad.declinedTitle' })}
            </p>
            <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              {intl.formatMessage({ id: 'bookingDetail.toad.declinedNote' })}
            </p>
            {booking.declineReason && (
              <p className="m-0 text-xs font-medium px-2.5 py-1.5 rounded-lg mt-0.5" style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--destructive)' }}>
                "{booking.declineReason}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── DETAIL CARD ─────────────────────────────────────────────────────── */}
      <div className="px-3 mt-3">
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {startDate && (
            <Row icon={Clock}
              label={intl.formatMessage({ id: 'bookingDetail.row.dateTime' })}
              value={`${intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
            />
          )}
          {isToad && booking.schoolName && (
            <Row icon={School} label={intl.formatMessage({ id: 'toadDetails.school.label' })} value={booking.schoolName} />
          )}
          {!isToad && (
            <Row icon={MapPin} label={intl.formatMessage({ id: 'bookingDetail.row.location' })} value={intl.formatMessage({ id: 'bookingDetail.location.value' })} />
          )}
          <Row icon={GraduationCap} label={intl.formatMessage({ id: 'bookingDetail.row.grade' })} value={intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: booking.grade })} />
          <Row icon={Users} label={intl.formatMessage({ id: 'bookingDetail.row.students' })} value={intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: booking.studentCount })} />
          {booking.accessNeeds && (
            <Row icon={AlertCircle} label={intl.formatMessage({ id: 'bookingDetail.row.access' })} value={booking.accessNeeds} />
          )}
          {isToad && booking.truckParking && (
            <Row icon={MapPin} label={intl.formatMessage({ id: 'bookingDetail.row.parking' })} value={booking.truckParking} />
          )}
        </div>
      </div>

      {/* ── ATTENDED BANNER ─────────────────────────────────────────────────── */}
      {arrivedAtDate && (
        <div className="mx-3 mt-3 flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
          style={{ background: 'rgba(1,136,76,0.08)', border: '1px solid rgba(1,136,76,0.15)' }}>
          <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--brand-green)', flexShrink: 0 }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--brand-green)' }}>
            {intl.formatMessage({ id: 'bookingDetail.arrivedAt' },
              { time: intl.formatDate(arrivedAtDate, { hour: '2-digit', minute: '2-digit', hour12: false }) })}
          </span>
        </div>
      )}

      {/* ── CANCEL (bottom, secondary) ──────────────────────────────────────── */}
      {canCancel && (
        <div className="px-3 mt-4">
          <CancelBookingDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={handleConfirmCancel}
            isLoading={cancelling}
          />
        </div>
      )}
    </div>
  )
}
