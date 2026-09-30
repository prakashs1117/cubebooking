import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useIntl } from 'react-intl'
import { Modal } from '../ui/Modal'
import { useBookingStore, type VisitType } from '../../stores/bookingStore'
import { BookTypeStep } from './steps/BookTypeStep'
import { BookProgramsStep } from './steps/BookProgramsStep'
import { BookTimeStep } from './steps/BookTimeStep'
import { BookDetailsStep } from './steps/BookDetailsStep'
import { BookReviewStep } from './steps/BookReviewStep'
import { BookConfirmedStep } from './steps/BookConfirmedStep'

type Step = 'type' | 'programs' | 'time' | 'details' | 'review' | 'confirmed'

const STEP_ORDER: Step[] = ['type', 'programs', 'time', 'details', 'review', 'confirmed']
const PROGRESS_STEPS: Step[] = ['programs', 'time', 'details', 'review']

const STEP_TITLES: Record<Step, string> = {
  type:      'book.title',
  programs:  'bookPrograms.title',
  time:      'bookTime.title',
  details:   'bookDetails.title',
  review:    'review.title',
  confirmed: 'confirmed.heading',
}

interface BookingModalProps {
  open: boolean
  onClose: () => void
  initialVisitType?: VisitType
}

function StepHeader({
  title,
  progressStep,
  totalSteps,
  showBack,
  onBack,
}: {
  title: string
  progressStep: number
  totalSteps: number
  showBack: boolean
  onBack: () => void
}) {
  const intl = useIntl()
  return (
    <div className="px-5 pt-2 pb-3 flex flex-col gap-3">
      <div className="flex items-center gap-1 min-h-[40px]">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="iconbtn tap"
            aria-label={intl.formatMessage({ id: 'bookingLayout.back' })}
          >
            <ChevronLeft className="i" />
          </button>
        ) : (
          <span className="w-11" />
        )}
        <span className="flex-1 text-center text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>
          {title}
        </span>
        {/* Spacer to balance the back button / close button on right */}
        <span className="w-11" />
      </div>

      {progressStep > 0 && (
        <div
          className="grid gap-1.5 px-1"
          style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-colors duration-300"
              style={{ background: i < progressStep ? 'var(--primary)' : 'var(--border)' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function BookingModal({ open, onClose, initialVisitType }: BookingModalProps) {
  const intl = useIntl()
  const { setVisitType, reset } = useBookingStore()
  const navigate = useNavigate()

  const firstStep: Step = initialVisitType ? 'programs' : 'type'
  const [step, setStep] = useState<Step>(firstStep)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      reset()
      if (initialVisitType) {
        setVisitType(initialVisitType)
        setStep('programs')
      } else {
        setStep('type')
      }
    }
  }, [open, initialVisitType, reset, setVisitType])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleExpired = () => setStep('programs')

  const goTo = (s: Step) => setStep(s)

  const goBack = () => {
    const order = initialVisitType ? STEP_ORDER.filter((s) => s !== 'type') : STEP_ORDER
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const progressIdx = PROGRESS_STEPS.indexOf(step)
  const progressStep = progressIdx >= 0 ? progressIdx + 1 : 0
  const showBack = step !== 'type' && step !== 'programs' && step !== 'confirmed'
  const showProgress = step !== 'type' && step !== 'confirmed'
  const title = intl.formatMessage({ id: STEP_TITLES[step] })
  const scrollKey = STEP_ORDER.indexOf(step)

  if (!open) return null

  return (
    <Modal onClose={handleClose} scrollKey={scrollKey}>
      {step !== 'confirmed' && (
        <StepHeader
          title={title}
          progressStep={showProgress ? progressStep : 0}
          totalSteps={PROGRESS_STEPS.length}
          showBack={showBack}
          onBack={goBack}
        />
      )}

      <div className="px-5 pt-2 pb-8 flex flex-col gap-4">
        {step === 'type' && (
          <BookTypeStep onSelect={(vt) => { void vt; goTo('programs') }} />
        )}
        {step === 'programs' && (
          <BookProgramsStep onContinue={() => goTo('time')} />
        )}
        {step === 'time' && (
          <BookTimeStep onContinue={() => goTo('details')} />
        )}
        {step === 'details' && (
          <BookDetailsStep onContinue={() => goTo('review')} onExpired={handleExpired} />
        )}
        {step === 'review' && (
          <BookReviewStep
            onBack={() => goTo('details')}
            onConfirmed={(id, code) => { setConfirmedBookingId(id); setConfirmedBookingCode(code); goTo('confirmed') }}
            onExpired={handleExpired}
          />
        )}
        {step === 'confirmed' && (
          <BookConfirmedStep
            bookingId={confirmedBookingId}
            bookingCode={confirmedBookingCode}
            onDone={handleClose}
            onViewBooking={() => {
              const id = confirmedBookingId
              handleClose()
              if (id) navigate(`/bookings/${id}`)
            }}
          />
        )}
      </div>
    </Modal>
  )
}
