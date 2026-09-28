import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Timer, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import { useAuthContext } from '../../context/AuthContext'
import { useBookingStore } from '../../stores/bookingStore'
import { useNotificationStore } from '../../stores/notificationStore'
import BookingLayout, { ContinueButton } from './BookingLayout'

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

function programLabel(id: string) {
  if (id === 'cube') return 'Curiosity Cube'
  if (id === 'lab') return 'Curiosity Lab'
  return 'TOAD Truck'
}

function makeBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'CC-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthContext()
  const { visitType, programSelection, slots, holdExpiresAt, classDetails, reset } = useBookingStore()
  const pushNotification = useNotificationStore((s) => s.push)
  const { remaining, label: timerLabel } = useCountdown(holdExpiresAt)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (holdExpiresAt && remaining === 0 && holdExpiresAt.getTime() < Date.now()) {
      reset()
      navigate('/book', { replace: true })
    }
  }, [remaining, holdExpiresAt, reset, navigate])

  if (!slots.length || !user) {
    navigate('/book', { replace: true })
    return null
  }

  const firstSlot = slots[0]
  const lastSlot = slots[slots.length - 1]
  const dateStr = format(firstSlot.start, 'EEEE, d MMMM yyyy')
  const timeRange = `${format(firstSlot.start, 'HH:mm')}–${format(lastSlot.end, 'HH:mm')}`
  const programTitle = programSelection === 'both' ? 'Cube + Lab'
    : programLabel(firstSlot.programId)
  const programColors = programSelection === 'both'
    ? ['var(--brand-mint)', 'var(--brand-yellow)']
    : firstSlot.programId === 'cube'
    ? ['var(--brand-mint)']
    : ['var(--brand-yellow)']

  const rows = [
    { k: 'Date', v: dateStr, href: '/book/time' },
    { k: 'Time', v: timeRange, href: '/book/time' },
    { k: 'Grade', v: `Grade ${classDetails.grade}`, href: '/book/details' },
    { k: 'Students', v: String(classDetails.studentCount), href: '/book/details' },
    ...(classDetails.accessNeeds ? [{ k: 'Access needs', v: classDetails.accessNeeds, href: '/book/details' }] : []),
  ]

  const handleConfirm = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      const bookingCode = makeBookingCode()
      await addDoc(collection(db, 'bookings'), {
        type: visitType,
        teacherId: user.uid,
        teacherName: profile?.displayName ?? '',
        teacherEmail: user.email ?? '',
        schoolId: profile?.schoolId ?? '',
        segments: slots.map((s, i) => ({
          sessionId: s.sessionId,
          programId: s.programId,
          order: i + 1,
        })),
        grade: classDetails.grade,
        studentCount: classDetails.studentCount,
        accessNeeds: classDetails.accessNeeds,
        // Onsite visits confirm instantly; TOAD requires Merck approval
        status: visitType === 'toad' ? 'pending' : 'confirmed',
        bookingCode,
        createdAt: serverTimestamp(),
      })
      // Build calendar URL
      const calFmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
      const calParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Curiosity ${programTitle} – Class ${classDetails.grade}`,
        dates: `${calFmt(firstSlot.start)}/${calFmt(lastSlot.end)}`,
        details: `${classDetails.studentCount} students · Grade ${classDetails.grade} · Code: ${bookingCode}`,
        location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
      })
      const calendarUrl = `https://calendar.google.com/calendar/render?${calParams}`

      // Push real notification
      pushNotification({
        type: 'confirmed',
        title: '🎉 Booking confirmed!',
        body: `${programTitle} · ${format(firstSlot.start, 'EEE d MMM')} · ${format(firstSlot.start, 'HH:mm')}–${format(lastSlot.end, 'HH:mm')} · Code ${bookingCode}`,
        calendarUrl,
        bookingId: bookingCode,
      })

      navigate('/book/confirmed', { replace: true })
    } catch (err) {
      setError('Could not confirm your booking. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BookingLayout
      title="Review"
      step={4}
      totalSteps={4}
      onBack="/book/details"
      footer={
        <ContinueButton loading={submitting} onClick={handleConfirm}>
          Confirm booking
        </ContinueButton>
      }
    >
      {/* Timer */}
      {holdExpiresAt && (
        <div className="flex items-center gap-2 text-sm font-semibold tabular-nums" style={{ color: remaining < 120 ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
          <Timer className="i i-sm" />
          {timerLabel}
        </div>
      )}

      <h1 className="rise m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Check and confirm
      </h1>

      {/* Booking summary card */}
      <div className="rise-2 rounded-3xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Colour band */}
        <div className="flex h-2.5">
          {programColors.map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>

        {/* Header */}
        <div className="px-[18px] py-[18px] flex flex-col gap-1 border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Onsite STEM visit
          </span>
          <span className="text-[24px] font-extrabold leading-[30px]" style={{ fontFamily: 'var(--font-display)' }}>
            {programTitle}
          </span>
          <span className="text-[15px] font-medium">{dateStr}</span>
        </div>

        {/* Rows */}
        <div className="px-[18px] flex flex-col">
          {rows.map((row) => (
            <div key={row.k} className="flex items-center gap-3 min-h-[48px] border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="w-[110px] text-[13px]" style={{ color: 'var(--muted-foreground)' }}>{row.k}</span>
              <span className="flex-1 text-sm font-semibold">{row.v}</span>
              <Link to={row.href} className="text-[13px] font-medium min-h-[44px] inline-flex items-center" style={{ color: 'var(--primary)' }}>
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="rise-3 flex gap-2.5 items-start p-3.5 rounded-2xl" style={{ background: 'var(--muted)' }}>
        <ShieldCheck className="i i-sm flex-none mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
        <p className="m-0 text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          No personal student data is stored — only class grade and count. Data is hosted in the EU and processed under GDPR.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
          {error}
        </div>
      )}
    </BookingLayout>
  )
}
