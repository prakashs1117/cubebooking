import { useState, useEffect } from 'react'
import { Timer, ShieldCheck } from 'lucide-react'
import { useIntl } from 'react-intl'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../shared/firebase'
import { useAuthContext } from '../../../context/AuthContext'
import { useBookingStore } from '../../../stores/bookingStore'
import { useNotificationStore } from '../../../stores/notificationStore'
import { ContinueButton } from '../BookingLayout'

function useCountdown(expiresAt: Date | null) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)) : 600
  )
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => setRemaining(Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  return { remaining, label: `${mins}:${secs.toString().padStart(2, '0')}` }
}

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
  onConfirmed: () => void
  onExpired: () => void
}

export function BookReviewStep({ onBack, onConfirmed, onExpired }: Props) {
  const intl = useIntl()
  const { user, profile } = useAuthContext()
  const { visitType, programSelection, slots, holdExpiresAt, classDetails, reset } = useBookingStore()
  const pushNotification = useNotificationStore((s) => s.push)
  const { remaining, label: timerLabel } = useCountdown(holdExpiresAt)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (holdExpiresAt && remaining === 0 && holdExpiresAt.getTime() < Date.now()) {
      reset()
      onExpired()
    }
  }, [remaining, holdExpiresAt, reset, onExpired])

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
    { k: intl.formatMessage({ id: 'review.row.date' }),     v: dateStr,                          onEdit: onBack },
    { k: intl.formatMessage({ id: 'review.row.time' }),     v: timeRange,                        onEdit: onBack },
    { k: intl.formatMessage({ id: 'review.row.grade' }),    v: String(classDetails.grade),       onEdit: onBack },
    { k: intl.formatMessage({ id: 'review.row.students' }), v: String(classDetails.studentCount), onEdit: onBack },
    ...(classDetails.accessNeeds ? [{ k: intl.formatMessage({ id: 'review.row.access' }), v: classDetails.accessNeeds, onEdit: onBack }] : []),
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

      await addDoc(collection(db, 'bookings'), {
        type: visitType ?? 'onsite',
        teacherId: user.uid,
        teacherName: profile?.displayName ?? '',
        teacherEmail: user.email ?? '',
        schoolId: profile?.schoolId ?? '',
        segments,
        grade: classDetails.grade,
        studentCount: classDetails.studentCount,
        accessNeeds: classDetails.accessNeeds ?? '',
        status: visitType === 'toad' ? 'pending' : 'confirmed',
        bookingCode,
        createdAt: serverTimestamp(),
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

      reset()
      onConfirmed()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? ''
      const code = (err as { code?: string })?.code ?? ''
      if (message.includes('teacher-conflict')) {
        setError(intl.formatMessage({ id: 'review.teacherConflict' }))
      } else if (message.includes('slots-unavailable') || code === 'failed-precondition') {
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
      {holdExpiresAt && (
        <div className="flex items-center gap-2 text-sm font-semibold tabular-nums" style={{ color: remaining < 120 ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
          <Timer className="i i-sm" />
          {timerLabel}
        </div>
      )}

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
            <div key={row.k} className="flex items-center gap-3 min-h-[48px] border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
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
