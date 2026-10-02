import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '../../../context/AuthContext'
import { useBookingStore } from '../../../stores/bookingStore'
import { useNotificationStore } from '../../../stores/notificationStore'
import { ContinueButton } from '../BookingLayout'
import { createBooking, SlotTakenError } from '../../../services/bookingService'

function programLabel(id: string, intl: ReturnType<typeof useIntl>): string {
  if (id === 'cube') return intl.formatMessage({ id: 'program.cube' })
  if (id === 'lab')  return intl.formatMessage({ id: 'program.lab' })
  return intl.formatMessage({ id: 'program.toad' })
}

function makeBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'CC-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface Props {
  onBack: () => void
  onConfirmed: (bookingId: string, bookingCode: string) => void
  onExpired: () => void
}

export function BookReviewStep({ onBack, onConfirmed, onExpired: _onExpired }: Props) {
  const intl = useIntl()
  const { user, profile } = useAuthContext()
  const { visitType, programSelection, slots, classDetails, confirmSlots } = useBookingStore()
  const queryClient = useQueryClient()
  const pushNotification = useNotificationStore((s) => s.push)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!slots.length || !user) return null

  const firstSlot = slots[0]
  const lastSlot = slots[slots.length - 1]
  const dateStr = intl.formatDate(firstSlot.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeRange = `${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`
  const programTitle = programSelection === 'both'
    ? intl.formatMessage({ id: 'program.both' })
    : programLabel(firstSlot.programId, intl)
  const programColors = programSelection === 'both'
    ? ['var(--brand-mint)', 'var(--brand-yellow)']
    : firstSlot.programId === 'cube' ? ['var(--brand-mint)'] : ['var(--brand-yellow)']

  const rows = [
    { id: 'date',     k: intl.formatMessage({ id: 'review.row.date' }),     v: dateStr,                           onEdit: onBack },
    { id: 'time',     k: intl.formatMessage({ id: 'review.row.time' }),     v: timeRange,                         onEdit: onBack },
    { id: 'grade',    k: intl.formatMessage({ id: 'review.row.grade' }),    v: String(classDetails.grade),        onEdit: onBack },
    { id: 'students', k: intl.formatMessage({ id: 'review.row.students' }), v: String(classDetails.studentCount), onEdit: onBack },
    ...(classDetails.accessNeeds ? [{ id: 'access', k: intl.formatMessage({ id: 'review.row.access' }), v: classDetails.accessNeeds, onEdit: onBack }] : []),
  ]

  const handleConfirm = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      const bookingCode = makeBookingCode()
      const segments = slots.map((s, i) => ({
        programId: s.programId,
        date: s.date,
        startHour: s.startHour,
        order: i + 1,
      }))

      const { bookingId } = await createBooking({
        uid: user.uid,
        teacherName: profile?.displayName ?? '',
        teacherEmail: user.email ?? '',
        schoolId: profile?.schoolId ?? '',
        visitType: visitType ?? 'onsite',
        segments,
        grade: classDetails.grade,
        studentCount: classDetails.studentCount,
        accessNeeds: classDetails.accessNeeds ?? '',
        bookingCode,
      })

      const calFmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
      const calParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Curiosity ${programTitle} – Class ${classDetails.grade}`,
        dates: `${calFmt(firstSlot.start)}/${calFmt(lastSlot.end)}`,
        details: `${classDetails.studentCount} students · Grade ${classDetails.grade} · Code: ${bookingCode}`,
        location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
      })
      const calendarUrl = `https://calendar.google.com/calendar/render?${calParams}`

      pushNotification({
        type: 'confirmed',
        title: intl.formatMessage({ id: 'review.notification.title' }),
        body: `${programTitle} · ${intl.formatDate(firstSlot.start, { weekday: 'short', day: 'numeric', month: 'short' })} · ${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })} · Code ${bookingCode}`,
        calendarUrl,
        bookingId: bookingCode,
      })

      confirmSlots()
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onConfirmed(bookingId, bookingCode)
    } catch (err: unknown) {
      if (err instanceof SlotTakenError) {
        setError(intl.formatMessage({ id: 'review.conflict' }))
      } else {
        setError(intl.formatMessage({ id: 'review.error' }))
      }
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="rise m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'review.heading' })}
      </h1>

      <div className="rise-2 rounded-3xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex h-2.5">
          {programColors.map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <div className="px-[18px] py-[18px] flex flex-col gap-1 border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'review.type' })}
          </span>
          <span className="text-[24px] font-extrabold leading-[30px]" style={{ fontFamily: 'var(--font-display)' }}>
            {programTitle}
          </span>
          <span className="text-[15px] font-medium">{dateStr}</span>
        </div>
        <div className="px-[18px] flex flex-col">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 min-h-[48px] border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="w-[110px] text-[13px]" style={{ color: 'var(--muted-foreground)' }}>{row.k}</span>
              <span className="flex-1 text-sm font-semibold">{row.v}</span>
              <button
                type="button"
                onClick={row.onEdit}
                className="text-[13px] font-medium min-h-[44px] inline-flex items-center tap"
                style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {intl.formatMessage({ id: 'review.row.edit' })}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rise-3 flex gap-2.5 items-start p-3.5 rounded-2xl" style={{ background: 'var(--muted)' }}>
        <ShieldCheck className="i i-sm flex-none mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
        <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'review.privacy' })}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
          {error}
        </div>
      )}

      <ContinueButton loading={submitting} onClick={handleConfirm}>
        {intl.formatMessage({ id: 'review.confirm' })}
      </ContinueButton>
    </>
  )
}
