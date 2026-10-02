import { useState } from 'react'
import { Truck } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '../../../context/AuthContext'
import { useBookingStore } from '../../../stores/bookingStore'
import { ContinueButton } from '../BookingLayout'
import { createBooking } from '../../../services/bookingService'

function makeToadCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'TC-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface Props {
  onBack: () => void
  onConfirmed: (bookingId: string, bookingCode: string) => void
}

export function ToadReviewStep({ onBack, onConfirmed }: Props) {
  const intl = useIntl()
  const { user, profile } = useAuthContext()
  const { slots, classDetails } = useBookingStore()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!slots.length || !user) return null

  const slot = slots[0]
  const dateStr = intl.formatDate(slot.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const rows = [
    { k: intl.formatMessage({ id: 'toad.review.row.date' }),     v: dateStr },
    { k: intl.formatMessage({ id: 'review.row.grade' }),          v: classDetails.grade },
    { k: intl.formatMessage({ id: 'review.row.students' }),       v: String(classDetails.studentCount) },
    { k: intl.formatMessage({ id: 'toad.review.row.parking' }),   v: classDetails.truckParking },
    ...(classDetails.accessNeeds ? [{ k: intl.formatMessage({ id: 'review.row.access' }), v: classDetails.accessNeeds }] : []),
  ]

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const bookingCode = makeToadCode()
      const { bookingId } = await createBooking({
        uid: user.uid,
        teacherName: profile?.displayName ?? '',
        teacherEmail: user.email ?? '',
        schoolId: profile?.schoolId ?? '',
        visitType: 'toad',
        segments: [{ programId: 'toad', date: slot.date, startHour: 9, order: 1 }],
        grade: classDetails.grade,
        studentCount: classDetails.studentCount,
        accessNeeds: classDetails.accessNeeds ?? '',
        truckParking: classDetails.truckParking,
        bookingCode,
      })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onConfirmed(bookingId, bookingCode)
    } catch {
      setError(intl.formatMessage({ id: 'review.error' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'toad.review.heading' })}
      </h1>

      <div className="rounded-3xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="h-2.5" style={{ background: 'var(--brand-magenta)' }} />
        <div className="px-[18px] py-[18px] flex flex-col gap-1 border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.review.type' })}
          </span>
          <span className="flex items-center gap-2 text-[22px] font-extrabold leading-[28px]" style={{ fontFamily: 'var(--font-display)' }}>
            <Truck style={{ width: 22, height: 22, color: 'var(--brand-magenta)' }} />
            {intl.formatMessage({ id: 'program.toad' })}
          </span>
          <span className="text-[15px] font-medium">{dateStr}</span>
        </div>
        <div className="px-[18px] flex flex-col">
          {rows.map((row) => (
            <div key={row.k} className="flex items-start gap-3 min-h-[48px] py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="w-[110px] text-[13px] mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{row.k}</span>
              <span className="flex-1 text-sm font-semibold leading-relaxed">{row.v}</span>
              <button type="button" onClick={onBack} className="text-[13px] font-medium min-h-[44px] inline-flex items-center tap shrink-0" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {intl.formatMessage({ id: 'review.row.edit' })}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending note */}
      <div className="flex gap-2.5 items-start p-3.5 rounded-2xl" style={{ background: 'var(--tint-magenta)' }}>
        <Truck className="flex-none mt-0.5" style={{ width: 16, height: 16, color: 'var(--brand-magenta)' }} />
        <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'toad.review.pending.note' })}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
          {error}
        </div>
      )}

      <ContinueButton loading={submitting} onClick={handleSubmit}>
        {intl.formatMessage({ id: 'toad.review.submit' })}
      </ContinueButton>
    </>
  )
}
