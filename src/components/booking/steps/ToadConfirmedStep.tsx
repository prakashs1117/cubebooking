import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { Truck, CalendarDays, School, GraduationCap, Users, MapPin, ChevronRight, Clock } from 'lucide-react'
import { useBookingStore } from '../../../stores/bookingStore'

interface Props {
  bookingId: string | null
  bookingCode: string | null
  onDone: () => void
}

export function ToadConfirmedStep({ bookingId, bookingCode, onDone }: Props) {
  const intl = useIntl()
  const { slots, classDetails } = useBookingStore()

  const seg = slots[0]
  const dateLabel = seg?.start
    ? intl.formatDate(seg.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const rows = [
    ...(dateLabel ? [{ icon: CalendarDays, label: intl.formatMessage({ id: 'toad.review.row.date' }), value: dateLabel }] : []),
    ...(classDetails.schoolName ? [{ icon: School, label: intl.formatMessage({ id: 'toadDetails.school.label' }), value: classDetails.schoolName }] : []),
    { icon: GraduationCap, label: intl.formatMessage({ id: 'review.row.grade' }), value: `${intl.formatMessage({ id: 'bookingDetail.grade.value' }, { grade: classDetails.grade })}` },
    { icon: Users, label: intl.formatMessage({ id: 'review.row.students' }), value: intl.formatMessage({ id: 'bookingDetail.students.value' }, { count: classDetails.studentCount }) },
    ...(classDetails.truckParking ? [{ icon: MapPin, label: intl.formatMessage({ id: 'toad.review.row.parking' }), value: classDetails.truckParking }] : []),
  ]

  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="grid place-items-center rounded-full" style={{ width: 72, height: 72, background: 'var(--tint-magenta)' }}>
          <Truck style={{ width: 34, height: 34, color: 'var(--brand-magenta)' }} />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {intl.formatMessage({ id: 'toad.confirmed.heading' })}
          </h1>
          <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.confirmed.sub' })}
          </p>
        </div>
      </div>

      {/* Booking code */}
      {bookingCode && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{ background: 'var(--tint-magenta)', border: '1.5px solid rgba(217,70,239,0.2)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--brand-magenta)', opacity: 0.75 }}>
            {intl.formatMessage({ id: 'toad.confirmed.code' })}
          </span>
          <span className="text-2xl font-extrabold tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-magenta)', letterSpacing: '0.08em' }}>
            {bookingCode}
          </span>
        </div>
      )}

      {/* Pending approval notice */}
      <div className="flex gap-2.5 items-start px-3.5 py-3 rounded-2xl"
        style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.18)' }}>
        <Clock style={{ width: 15, height: 15, color: 'var(--brand-orange)', flexShrink: 0, marginTop: 1 }} />
        <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'toad.review.pending.note' })}
        </p>
      </div>

      {/* Booking details */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-3 px-4 min-h-[44px] py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <row.icon style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 2 }} />
            <span className="w-20 text-xs flex-none leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
            <span className="flex-1 text-sm font-medium leading-relaxed" style={{ color: 'var(--foreground)' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        {bookingId && (
          <Link
            to={`/bookings/${bookingId}`}
            onClick={onDone}
            className="tap w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
            style={{ background: 'var(--brand-magenta)', color: '#fff', textDecoration: 'none' }}
          >
            {intl.formatMessage({ id: 'toad.confirmed.viewBooking' })}
            <ChevronRight style={{ width: 16, height: 16 }} />
          </Link>
        )}
        <button type="button" onClick={onDone}
          className="tap w-full h-11 rounded-2xl text-sm font-medium"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', cursor: 'pointer', fontFamily: 'inherit' }}>
          {intl.formatMessage({ id: 'toad.confirmed.goBookings' })}
        </button>
      </div>
    </div>
  )
}
