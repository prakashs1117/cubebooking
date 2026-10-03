import { useEffect, useRef, useState } from 'react'
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
import { ToadDateStep } from './steps/ToadDateStep'
import { ToadDetailsStep } from './steps/ToadDetailsStep'
import { ToadReviewStep } from './steps/ToadReviewStep'
import { ToadConfirmedStep } from './steps/ToadConfirmedStep'

type Step = 'type' | 'programs' | 'time' | 'details' | 'review' | 'confirmed'
          | 'toad-date' | 'toad-details' | 'toad-review' | 'toad-confirmed'

const STEP_ORDER: Step[] = ['type', 'programs', 'time', 'details', 'review', 'confirmed']
const PROGRESS_STEPS: Step[] = ['programs', 'time', 'details', 'review']
const TOAD_STEP_ORDER: Step[] = ['type', 'toad-date', 'toad-details', 'toad-review', 'toad-confirmed']
const TOAD_PROGRESS_STEPS: Step[] = ['toad-date', 'toad-details', 'toad-review']

const STEP_TITLES: Record<Step, string> = {
  type:           'book.title',
  programs:       'bookPrograms.title',
  time:           'bookTime.title',
  details:        'bookDetails.title',
  review:         'review.title',
  confirmed:      'confirmed.heading',
  'toad-date':      'book.title',
  'toad-details':   'bookDetails.title',
  'toad-review':    'toad.review.heading',
  'toad-confirmed': 'toad.confirmed.heading',
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
    <div className="px-4 md:px-5 pt-1 md:pt-2 pb-2 md:pb-3 flex flex-col gap-2 md:gap-3">
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
  const { setVisitType, reset, visitType } = useBookingStore()
  const navigate = useNavigate()

  const firstStep: Step = initialVisitType === 'toad' ? 'toad-date' : initialVisitType ? 'programs' : 'type'
  const [step, setStep] = useState<Step>(firstStep)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null)
  // Signals ToadDateStep not to release its hold on unmount once booking is committed
  const toadConfirmedRef = useRef(false)

  useEffect(() => {
    if (open) {
      reset()
      if (initialVisitType) {
        setVisitType(initialVisitType)
        setStep(initialVisitType === 'toad' ? 'toad-date' : 'programs')
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

  const isToadStep = (s: Step) => s.startsWith('toad-')

  const goBack = () => {
    const isToad = visitType === 'toad'
    const baseOrder = isToad ? TOAD_STEP_ORDER : STEP_ORDER
    const order = initialVisitType ? baseOrder.filter((s) => s !== 'type') : baseOrder
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const progressIdx = isToadStep(step)
    ? TOAD_PROGRESS_STEPS.indexOf(step)
    : PROGRESS_STEPS.indexOf(step)
  const progressStep = progressIdx >= 0 ? progressIdx + 1 : 0
  const showBack = step !== 'type' && step !== 'programs' && step !== 'confirmed' && step !== 'toad-confirmed' && step !== 'toad-date'
  const showProgress = step !== 'type' && step !== 'confirmed' && step !== 'toad-confirmed'
  const totalSteps = isToadStep(step) ? TOAD_PROGRESS_STEPS.length : PROGRESS_STEPS.length
  const title = intl.formatMessage({ id: STEP_TITLES[step] })
  const scrollKey = isToadStep(step) ? TOAD_STEP_ORDER.indexOf(step) : STEP_ORDER.indexOf(step)

  if (!open) return null

  return (
    <Modal onClose={handleClose} scrollKey={scrollKey}>
      {step !== 'confirmed' && step !== 'toad-confirmed' && (
        <StepHeader
          title={title}
          progressStep={showProgress ? progressStep : 0}
          totalSteps={totalSteps}
          showBack={showBack}
          onBack={goBack}
        />
      )}

      <div className="px-4 md:px-5 pt-1 md:pt-2 pb-6 md:pb-8 flex flex-col gap-3 md:gap-4">
        {step === 'type' && (
          <BookTypeStep onSelect={(vt) => {
            goTo(vt === 'toad' ? 'toad-date' : 'programs')
          }} />
        )}
        {step === 'toad-date' && (
          <ToadDateStep onContinue={() => goTo('toad-details')} confirmedRef={toadConfirmedRef} />
        )}
        {step === 'toad-details' && (
          <ToadDetailsStep onContinue={() => goTo('toad-review')} />
        )}
        {step === 'toad-review' && (
          <ToadReviewStep
            onBack={() => goTo('toad-details')}
            onConfirmed={(id, code) => {
              toadConfirmedRef.current = true
              setConfirmedBookingId(id)
              setConfirmedBookingCode(code)
              goTo('toad-confirmed')
            }}
          />
        )}
        {step === 'toad-confirmed' && (
          <ToadConfirmedStep
            bookingId={confirmedBookingId}
            bookingCode={confirmedBookingCode}
            onDone={handleClose}
          />
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
