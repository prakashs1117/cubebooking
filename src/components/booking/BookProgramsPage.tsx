import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore, type ProgramSelection, type ProgramOrder } from '../../stores/bookingStore'
import { trackProgramSelected, trackImpressionView } from '../../services/analyticsService'

function useBookProgramOptions() {
  const intl = useIntl()
  const options: { id: ProgramSelection; title: string; sub: string; swatch: string }[] = [
    { id: 'cube', title: intl.formatMessage({ id: 'bookPrograms.cube.title' }), sub: intl.formatMessage({ id: 'bookPrograms.cube.sub' }), swatch: 'var(--brand-mint)' },
    { id: 'lab',  title: intl.formatMessage({ id: 'bookPrograms.lab.title' }),  sub: intl.formatMessage({ id: 'bookPrograms.lab.sub' }),  swatch: 'var(--brand-yellow)' },
    { id: 'both', title: intl.formatMessage({ id: 'bookPrograms.both.title' }), sub: intl.formatMessage({ id: 'bookPrograms.both.sub' }), swatch: 'linear-gradient(135deg, var(--brand-mint) 50%, var(--brand-yellow) 50%)' },
  ]
  const orderOptions: { id: ProgramOrder; label: string; sub: string }[] = [
    {
      id: 'cube-first',
      label: intl.formatMessage({ id: 'bookPrograms.order.cubeFirst.label' }),
      sub: intl.formatMessage({ id: 'bookPrograms.order.sub' }),
    },
    {
      id: 'lab-first',
      label: intl.formatMessage({ id: 'bookPrograms.order.labFirst.label' }),
      sub: intl.formatMessage({ id: 'bookPrograms.order.sub' }),
    },
  ]
  return { options, orderOptions }
}

export default function BookProgramsPage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const { options, orderOptions } = useBookProgramOptions()
  const { programSelection, programOrder, setProgramSelection, setProgramOrder } = useBookingStore()

  useEffect(() => {
    options.forEach(option => {
      trackImpressionView(option.id, 'program', option.title)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectProgram = (programId: ProgramSelection) => {
    const program = options.find(o => o.id === programId)
    if (program) {
      trackProgramSelected(program.id, program.title)
    }
    setProgramSelection(programId)
  }

  const handleNavigateContinue = () => {
    navigate('/book/time')
  }

  return (
    <BookingLayout
      title={intl.formatMessage({ id: 'bookPrograms.title' })}
      step={2}
      totalSteps={4}
      onBack="/book"
      footer={
        <ContinueButton
          disabled={!programSelection}
          onClick={handleNavigateContinue}
        />
      }
    >
      <h1 className="m-0 rise text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'bookPrograms.heading' })}
      </h1>

      {/* Program radio group */}
      <div className="rise-2 flex flex-col gap-2.5" role="radiogroup" aria-label="Programs">
        {options.map((opt) => {
          const selected = programSelection === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelectProgram(opt.id)}
              className="tap flex items-center gap-3.5 p-3.5 rounded-[20px] border-2 text-left"
              style={{
                background: 'var(--card)',
                borderColor: selected ? 'var(--primary)' : 'var(--border)',
                boxShadow: selected ? '0 0 0 3px rgba(20,155,95,0.12)' : 'none',
              }}
            >
              <span className="flex-none w-[52px] h-[52px] rounded-2xl" style={{ background: opt.swatch }} />
              <span className="flex-1 flex flex-col gap-0.5">
                <span className="text-base font-bold">{opt.title}</span>
                <span className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>{opt.sub}</span>
              </span>
              <span
                className="flex-none w-[22px] h-[22px] rounded-full box-border transition-all"
                style={{
                  border: selected ? '7px solid var(--primary)' : '2px solid var(--border)',
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Order picker — only shown when "both" selected */}
      {programSelection === 'both' && (
        <section className="rise flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-base font-bold">{intl.formatMessage({ id: 'bookPrograms.order.heading' })}</h2>
            <p className="m-0 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'bookPrograms.order.sub' })}
            </p>
          </div>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Session order">
            {orderOptions.map((o) => {
              const sel = programOrder === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setProgramOrder(o.id)}
                  className="tap flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left"
                  style={{
                    background: 'var(--card)',
                    borderColor: sel ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  <span className="flex-1 flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{o.label}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.sub}</span>
                  </span>
                  <span
                    className="flex-none w-[20px] h-[20px] rounded-full box-border transition-all"
                    style={{ border: sel ? '6px solid var(--primary)' : '2px solid var(--border)' }}
                  />
                </button>
              )
            })}
          </div>
        </section>
      )}
    </BookingLayout>
  )
}
