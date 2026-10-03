import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Clock, MapPin, Users, GraduationCap, CheckCircle2,
  Truck, School, X, Check, XCircle, AlertCircle,
} from 'lucide-react'
import { useIntl } from 'react-intl'
import { doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import { useBooking } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate, toSlotDocId, toTeacherSlotDocId } from '../../config/slots'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '../../context/AuthContext'
import { notifyUser } from '../../services/notificationService'

// ─── Row component ────────────────────────────────────────────────────────────

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 min-h-[48px] py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <Icon className="w-3.5 h-3.5 flex-none mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
      <span className="w-24 text-xs flex-none mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="flex-1 text-sm font-medium leading-relaxed">{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingVerifyPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const intl = useIntl()
  const queryClient = useQueryClient()
  const { isStaff } = useAuthContext()
  const { data: booking, isLoading, error } = useBooking(bookingId)

  const [marking, setMarking]     = useState(false)
  const [approving, setApproving] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Derived ──────────────────────────────────────────────────────────────────

  const firstSeg = booking?.segments?.[0]
  const lastSeg  = booking?.segments?.[(booking.segments.length ?? 1) - 1]
  const startDate = firstSeg?.date != null && firstSeg?.startHour != null
    ? slotToDate(firstSeg.date, firstSeg.startHour) : null
  const endDate = lastSeg?.date != null && lastSeg?.startHour != null
    ? slotEndDate(lastSeg.date, lastSeg.startHour) : null

  // ── Actions ──────────────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const handleMarkArrived = async () => {
    if (!bookingId) return
    setMarking(true); setActionError(null)
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'arrived', arrivedAt: serverTimestamp(), updatedAt: serverTimestamp() })
      invalidate()
    } catch { setActionError(intl.formatMessage({ id: 'adminVerify.markError' })) }
    finally { setMarking(false) }
  }

  const handleApprove = async () => {
    if (!bookingId || !booking) return
    setApproving(true); setActionError(null)
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'approved', updatedAt: serverTimestamp() })
      notifyUser(booking.teacherId, {
        type: 'confirmed',
        title: intl.formatMessage({ id: 'toad.notification.approved.title' }),
        body: intl.formatMessage({ id: 'toad.notification.approved.body' }, { date: firstSeg?.date ?? '', code: booking.bookingCode ?? '' }),
        bookingId,
      }).catch(() => {})
      invalidate()
    } catch { setActionError(intl.formatMessage({ id: 'adminVerify.markError' })) }
    finally { setApproving(false) }
  }

  const handleDecline = async () => {
    if (!bookingId || !booking) return
    setApproving(true); setActionError(null)
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'declined', declineReason, updatedAt: serverTimestamp() })
      notifyUser(booking.teacherId, {
        type: 'error',
        title: intl.formatMessage({ id: 'toad.notification.declined.title' }),
        body: intl.formatMessage({ id: 'toad.notification.declined.body' }, { date: firstSeg?.date ?? '', reason: declineReason || '—' }),
        bookingId,
      }).catch(() => {})
      setDeclining(false); setDeclineReason(''); invalidate()
    } catch { setActionError(intl.formatMessage({ id: 'adminVerify.markError' })) }
    finally { setApproving(false) }
  }

  const handleCancel = async () => {
    if (!bookingId || !booking) return
    setCancelling(true); setActionError(null)
    try {
      const batch = writeBatch(db)
      batch.update(doc(db, 'bookings', bookingId), { status: 'cancelled', updatedAt: serverTimestamp() })
      if (booking.type !== 'toad') {
        for (const seg of booking.segments ?? []) {
          batch.delete(doc(db, 'slots', toSlotDocId(seg.date, seg.programId, seg.startHour)))
        }
        const uniqueHours = [...new Set((booking.segments ?? []).map((s) => `${s.date}:${s.startHour}`))]
        for (const key of uniqueHours) {
          const [date, hr] = key.split(':')
          batch.delete(doc(db, 'teacherSlots', toTeacherSlotDocId(booking.teacherId, date, Number(hr))))
        }
      }
      await batch.commit()
      setShowCancelConfirm(false); invalidate()
    } catch { setActionError(intl.formatMessage({ id: 'adminVerify.markError' })) }
    finally { setCancelling(false) }
  }

  // ── Loading / error states ────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--app-ground)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
    </div>
  )
  if (error || !booking) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5" style={{ background: 'var(--app-ground)' }}>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'adminVerify.notFound' })}</p>
      <button type="button" onClick={() => navigate('/admin/scan')} className="tap text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        {intl.formatMessage({ id: 'adminVerify.scanAgain' })}
      </button>
    </div>
  )

  // ── Derived display ───────────────────────────────────────────────────────────

  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  const isBoth = ids.length > 1
  const isToad = booking.type === 'toad'
  const headerBg = isBoth ? 'var(--brand-purple)'
    : ids[0] === 'cube' ? 'var(--brand-mint)'
    : ids[0] === 'lab'  ? 'var(--brand-yellow)'
    : 'var(--brand-magenta)'

  const programTitle = isBoth ? intl.formatMessage({ id: 'program.both.visit' })
    : ids[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' })
    : ids[0] === 'lab'  ? intl.formatMessage({ id: 'program.lab' })
    : intl.formatMessage({ id: 'program.toad' })

  const status = booking.status
  const isArrived   = status === 'arrived'
  const isCancelled = status === 'cancelled'
  const isDeclined  = status === 'declined'
  const isPending   = status === 'pending'
  const isApproved  = status === 'approved'
  const isConfirmed = status === 'confirmed'

  const arrivedAtDate = booking.arrivedAt
    ? new Date((booking.arrivedAt as { seconds: number }).seconds * 1000) : null

  const statusLabel = isArrived ? intl.formatMessage({ id: 'adminVerify.status.arrived' })
    : isCancelled ? intl.formatMessage({ id: 'bookingDetail.status.cancelled' })
    : isDeclined  ? intl.formatMessage({ id: 'bookingDetail.status.declined' })
    : isPending   ? intl.formatMessage({ id: 'bookings.status.awaitingApproval' })
    : isApproved  ? intl.formatMessage({ id: 'bookingDetail.status.approved' })
    : intl.formatMessage({ id: 'bookingDetail.status.confirmed' })

  // Staff action visibility
  const canApprove     = isStaff && isToad && isPending
  const canMarkArrived = isStaff && (isConfirmed || isApproved) && !isArrived
  const canCancel      = isStaff && !isCancelled && !isArrived

  return (
    <div className="flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-3 pt-2.5 pb-5" style={{ background: headerBg }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '9999px', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -50, width: 100, height: 100, borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

        {/* Nav row */}
        <div className="relative flex items-center justify-between mb-3">
          <button type="button" onClick={() => navigate(-1)} className="iconbtn tap" aria-label="Back"
            style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', color: '#fff', width: 36, height: 36 }}>
            <ChevronLeft style={{ width: 18, height: 18 }} />
          </button>
          {/* Status pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', color: '#fff' }}>
            {(isArrived || isApproved || isConfirmed) && <CheckCircle2 style={{ width: 11, height: 11 }} />}
            {(isCancelled || isDeclined) && <XCircle style={{ width: 11, height: 11 }} />}
            {isPending && <Clock style={{ width: 11, height: 11 }} />}
            {statusLabel}
            {isArrived && arrivedAtDate && (
              <span className="font-normal opacity-80">
                · {intl.formatDate(arrivedAtDate, { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}
          </span>
        </div>

        {/* Content */}
        <div className="relative flex flex-col gap-1 px-0.5">
          {isToad && <Truck style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }} />}
          <h1 className="m-0 font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '32px', color: '#fff' }}>
            {programTitle}
          </h1>
          <p className="m-0 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
            {booking.teacherName}
            <span style={{ opacity: 0.65 }}> · {booking.teacherEmail}</span>
          </p>
          {startDate && (
            <p className="m-0 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {intl.formatDate(startDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              {endDate && (
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {' · '}{intl.formatDate(startDate, { hour: '2-digit', minute: '2-digit', hour12: false })}–{intl.formatDate(endDate, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </p>
          )}
          {isToad && booking.schoolName && (
            <p className="m-0 text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{booking.schoolName}</p>
          )}
          {booking.bookingCode && (
            <div className="mt-2 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.20)', backdropFilter: 'blur(8px)' }}>
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.65)' }}>CODE</span>
              <span className="font-extrabold" style={{ color: '#fff', fontSize: 16, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                {booking.bookingCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── TOAD status note ─────────────────────────────────────────────────── */}
      {isToad && isPending && !isStaff && (
        <div className="mx-3 mt-3 flex gap-2.5 items-start px-3.5 py-3 rounded-2xl"
          style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.18)' }}>
          <AlertCircle style={{ width: 15, height: 15, color: 'var(--brand-orange)', flexShrink: 0, marginTop: 1 }} />
          <span className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
            {intl.formatMessage({ id: 'adminVerify.toad.pendingWarning' })}
          </span>
        </div>
      )}

      {/* ── Detail card ──────────────────────────────────────────────────────── */}
      <div className="px-3 mt-3">
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {startDate && (
            <Row icon={Clock} label={intl.formatMessage({ id: 'bookingDetail.row.dateTime' })}
              value={`${intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`} />
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
            <Row icon={Users} label={intl.formatMessage({ id: 'bookingDetail.row.access' })} value={booking.accessNeeds} />
          )}
          {isToad && booking.truckParking && (
            <Row icon={MapPin} label={intl.formatMessage({ id: 'bookingDetail.row.parking' })} value={booking.truckParking} />
          )}
        </div>
      </div>

      {/* ── Declined reason ──────────────────────────────────────────────────── */}
      {isDeclined && booking.declineReason && (
        <div className="mx-3 mt-3 flex gap-2.5 items-start px-3.5 py-3 rounded-2xl"
          style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.18)' }}>
          <XCircle style={{ width: 15, height: 15, color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
          <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>"{booking.declineReason}"</p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────────── */}
      {actionError && (
        <div className="mx-3 mt-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
          {actionError}
        </div>
      )}

      {/* ── Staff quick actions ──────────────────────────────────────────────── */}
      {isStaff && (
        <div className="px-3 mt-4 pb-8 flex flex-col gap-2.5">

          {/* TOAD pending: Approve + Decline */}
          {canApprove && !declining && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeclining(true)}
                className="tap flex-1 h-12 rounded-2xl text-sm font-semibold border"
                style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)', fontFamily: 'inherit' }}>
                {intl.formatMessage({ id: 'adminVerify.action.decline' })}
              </button>
              <button type="button" onClick={handleApprove} disabled={approving}
                className="tap flex-1 h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: 'var(--brand-green)', color: '#fff', border: 'none', fontFamily: 'inherit', opacity: approving ? 0.6 : 1 }}>
                {approving
                  ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />
                  : <><Check style={{ width: 16, height: 16 }} />{intl.formatMessage({ id: 'adminVerify.action.approve' })}</>}
              </button>
            </div>
          )}

          {/* Decline form */}
          {declining && (
            <div className="flex flex-col gap-2 p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                {intl.formatMessage({ id: 'adminVerify.action.declineReason' })}
              </label>
              <textarea rows={2} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}
                placeholder={intl.formatMessage({ id: 'toad.approvals.declineReason.placeholder' })}
                className="w-full px-3 py-2 rounded-xl border resize-none text-sm"
                style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }} />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setDeclining(false); setDeclineReason('') }}
                  className="tap flex-none h-10 px-3 rounded-xl text-xs border"
                  style={{ background: 'transparent', borderColor: 'var(--border)', fontFamily: 'inherit' }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
                <button type="button" onClick={handleDecline} disabled={approving}
                  className="tap flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--destructive)', color: '#fff', border: 'none', fontFamily: 'inherit', opacity: approving ? 0.6 : 1 }}>
                  {intl.formatMessage({ id: 'adminVerify.action.declineConfirm' })}
                </button>
              </div>
            </div>
          )}

          {/* Mark arrived */}
          {canMarkArrived && (
            <button type="button" onClick={handleMarkArrived} disabled={marking}
              className="tap w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', fontFamily: 'inherit', opacity: marking ? 0.6 : 1 }}>
              {marking
                ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />
                : <><CheckCircle2 style={{ width: 16, height: 16 }} />{intl.formatMessage({ id: 'adminVerify.cta.markArrived' })}</>}
            </button>
          )}

          {/* Already arrived */}
          {isArrived && (
            <div className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'rgba(1,136,76,0.10)', color: 'var(--brand-green)' }}>
              <CheckCircle2 style={{ width: 16, height: 16 }} />
              {intl.formatMessage({ id: 'adminVerify.cta.arrived' })}
              {arrivedAtDate && (
                <span className="text-xs font-normal opacity-70 ml-1">
                  · {intl.formatDate(arrivedAtDate, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </div>
          )}

          {/* Cancel */}
          {canCancel && !showCancelConfirm && (
            <button type="button" onClick={() => setShowCancelConfirm(true)}
              className="tap w-full h-11 rounded-2xl text-sm font-medium"
              style={{ background: 'var(--tint-red)', color: 'var(--destructive)', border: 'none', fontFamily: 'inherit' }}>
              {intl.formatMessage({ id: 'adminVerify.action.cancel' })}
            </button>
          )}

          {/* Cancel confirm */}
          {showCancelConfirm && (
            <div className="flex gap-2 p-3 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'rgba(220,38,38,0.25)' }}>
              <span className="flex-1 text-sm font-medium self-center" style={{ color: 'var(--foreground)' }}>
                {intl.formatMessage({ id: 'bookingDetail.confirmCancel' })}
              </span>
              <button type="button" onClick={() => setShowCancelConfirm(false)}
                className="tap flex-none h-9 px-3 rounded-xl text-xs border"
                style={{ borderColor: 'var(--border)', fontFamily: 'inherit' }}>
                {intl.formatMessage({ id: 'bookingDetail.cancelDialogNo' })}
              </button>
              <button type="button" onClick={handleCancel} disabled={cancelling}
                className="tap flex-none h-9 px-3 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--destructive)', color: '#fff', border: 'none', fontFamily: 'inherit', opacity: cancelling ? 0.6 : 1 }}>
                {intl.formatMessage({ id: 'adminVerify.action.cancelConfirm' })}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Non-staff: original single CTA */}
      {!isStaff && !isToad && (
        <div className="px-3 mt-4 pb-8">
          <button type="button" onClick={handleMarkArrived} disabled={isArrived || isCancelled || marking}
            className="tap w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-base font-bold"
            style={{
              background: isArrived ? 'rgba(1,136,76,0.10)' : isCancelled ? 'var(--muted)' : 'var(--primary)',
              color: isArrived ? 'var(--brand-green)' : isCancelled ? 'var(--muted-foreground)' : '#fff',
              border: 'none', fontFamily: 'inherit',
            }}>
            <CheckCircle2 style={{ width: 20, height: 20 }} />
            {isArrived ? intl.formatMessage({ id: 'adminVerify.cta.arrived' })
              : isCancelled ? intl.formatMessage({ id: 'adminVerify.cta.cancelled' })
              : intl.formatMessage({ id: 'adminVerify.cta.markArrived' })}
          </button>
        </div>
      )}
    </div>
  )
}
