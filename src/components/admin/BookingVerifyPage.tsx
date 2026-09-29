import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, MapPin, Users, GraduationCap, CheckCircle2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import { useBooking } from '../../hooks/queries/useBookings'
import { slotToDate, slotEndDate } from '../../config/slots'
import { useQueryClient } from '@tanstack/react-query'

export default function BookingVerifyPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const intl = useIntl()
  const queryClient = useQueryClient()
  const { data: booking, isLoading, error } = useBooking(bookingId)
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState<string | null>(null)

  const firstSeg = booking?.segments?.[0]
  const lastSeg = booking?.segments?.[booking.segments.length - 1]
  const startDate = firstSeg?.date != null && firstSeg?.startHour != null
    ? slotToDate(firstSeg.date, firstSeg.startHour) : null
  const endDate = lastSeg?.date != null && lastSeg?.startHour != null
    ? slotEndDate(lastSeg.date, lastSeg.startHour) : null

  const handleMarkArrived = async () => {
    if (!bookingId) return
    setMarking(true)
    setMarkError(null)
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'arrived',
        arrivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    } catch {
      setMarkError(intl.formatMessage({ id: 'adminVerify.markError' }, { defaultMessage: 'Failed to update. Try again.' }))
    } finally {
      setMarking(false)
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
        {intl.formatMessage({ id: 'adminVerify.notFound' }, { defaultMessage: 'Booking not found.' })}
      </p>
      <button type="button" onClick={() => navigate('/admin/scan')} className="tap text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        {intl.formatMessage({ id: 'adminVerify.scanAgain' }, { defaultMessage: 'Scan again' })}
      </button>
    </div>
  )

  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  const isBoth = ids.length > 1
  const headerBg = isBoth
    ? 'var(--brand-purple)'
    : ids[0] === 'cube' ? 'var(--brand-mint)'
    : ids[0] === 'lab' ? 'var(--brand-yellow)'
    : 'var(--brand-magenta)'

  const programTitle = isBoth
    ? intl.formatMessage({ id: 'program.both.visit' })
    : ids[0] === 'cube' ? intl.formatMessage({ id: 'program.cube' })
    : ids[0] === 'lab' ? intl.formatMessage({ id: 'program.lab' })
    : intl.formatMessage({ id: 'program.toad' })

  const isArrived = booking.status === 'arrived'
  const isCancelled = booking.status === 'cancelled'
  const canMarkArrived = !isArrived && !isCancelled && !marking

  const statusLabel = isArrived
    ? intl.formatMessage({ id: 'adminVerify.status.arrived' }, { defaultMessage: 'Arrived' })
    : isCancelled
    ? intl.formatMessage({ id: 'bookingDetail.status.cancelled' })
    : intl.formatMessage({ id: 'bookingDetail.status.confirmed' })

  const statusColor = isArrived ? 'var(--brand-green, #16a34a)'
    : isCancelled ? 'var(--muted-foreground)'
    : 'var(--brand-green, #16a34a)'

  const arrivedAtDate = booking.arrivedAt
    ? new Date((booking.arrivedAt as { seconds: number }).seconds * 1000)
    : null

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
      {/* Header */}
      <div className="relative overflow-hidden px-3 pt-3 pb-5" style={{ background: headerBg }}>
        <div style={{ position: 'absolute', right: -40, bottom: -80, width: 220, height: 220, borderRadius: '9999px', background: 'var(--brand-yellow)', opacity: 0.7 }} />
        <div style={{ position: 'absolute', right: 120, top: -30, width: 90, height: 90, borderRadius: '9999px', border: '14px solid rgba(255,255,255,0.55)', boxSizing: 'border-box' }} />

        <div className="relative flex justify-between mb-4">
          <button type="button" onClick={() => navigate('/admin/scan')} className="iconbtn tap" aria-label="Back to scanner" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <ChevronLeft className="i" />
          </button>
        </div>

        <div className="relative flex flex-col gap-1.5 px-2">
          <span
            className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'var(--background)', color: statusColor }}
          >
            {isArrived && '✓'} {statusLabel}
            {isArrived && arrivedAtDate && (
              <span className="font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>
                · {intl.formatDate(arrivedAtDate, { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}
          </span>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: isBoth ? '#fff' : 'var(--foreground)' }}>
            {programTitle}
          </h1>
          <div className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {booking.teacherName} · {booking.teacherEmail}
          </div>
          {startDate && (
            <div className="text-sm font-medium" style={{ color: isBoth ? 'rgba(255,255,255,0.85)' : 'var(--muted-foreground)' }}>
              {intl.formatDate(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Detail rows */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 pb-32">
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-4 min-h-[52px] border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <row.icon className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              <span className="w-28 text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
              <span className="flex-1 text-sm font-semibold">{row.value}</span>
            </div>
          ))}
        </div>

        {markError && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
            {markError}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'var(--app-ground)', borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={handleMarkArrived}
          disabled={!canMarkArrived}
          className="tap w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-base font-bold"
          style={{
            background: isArrived ? 'var(--tint-green, #dcfce7)' : canMarkArrived ? 'var(--primary)' : 'var(--muted)',
            color: isArrived ? 'var(--brand-green, #16a34a)' : canMarkArrived ? '#ffffff' : 'var(--muted-foreground)',
            cursor: canMarkArrived ? 'pointer' : 'default',
          }}
        >
          {marking ? (
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#ffffff' }} />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              {isArrived
                ? intl.formatMessage({ id: 'adminVerify.cta.arrived' }, { defaultMessage: 'Class Arrived ✓' })
                : isCancelled
                ? intl.formatMessage({ id: 'adminVerify.cta.cancelled' }, { defaultMessage: 'Booking Cancelled' })
                : intl.formatMessage({ id: 'adminVerify.cta.markArrived' }, { defaultMessage: 'Mark as Arrived' })}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
