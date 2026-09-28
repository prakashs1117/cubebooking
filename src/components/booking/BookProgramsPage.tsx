import { useNavigate } from 'react-router-dom'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore, type ProgramSelection, type ProgramOrder } from '../../stores/bookingStore'

const OPTIONS: { id: ProgramSelection; title: string; sub: string; swatch: string }[] = [
  {
    id: 'cube',
    title: 'Curiosity Cube',
    sub: '45 min · hands-on science exhibits',
    swatch: 'var(--brand-mint)',
  },
  {
    id: 'lab',
    title: 'Curiosity Lab',
    sub: '45 min · guided lab experiments',
    swatch: 'var(--brand-yellow)',
  },
  {
    id: 'both',
    title: 'Cube + Lab',
    sub: '90 min total · two back-to-back sessions',
    swatch: 'linear-gradient(135deg, var(--brand-mint) 50%, var(--brand-yellow) 50%)',
  },
]

const ORDER_OPTIONS: { id: ProgramOrder; label: string; sub: string }[] = [
  { id: 'cube-first', label: 'Cube first, then Lab', sub: 'Cube 09:00 → Lab 09:45' },
  { id: 'lab-first', label: 'Lab first, then Cube', sub: 'Lab 09:00 → Cube 09:45' },
]

export default function BookProgramsPage() {
  const navigate = useNavigate()
  const { programSelection, programOrder, setProgramSelection, setProgramOrder } = useBookingStore()

  return (
    <BookingLayout
      title="Onsite STEM visit"
      step={2}
      totalSteps={4}
      onBack="/book"
      footer={
        <ContinueButton
          disabled={!programSelection}
          onClick={() => navigate('/book/time')}
        />
      }
    >
      <h1 className="m-0 rise text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Choose your programs
      </h1>

      {/* Program radio group */}
      <div className="rise-2 flex flex-col gap-2.5" role="radiogroup" aria-label="Programs">
        {OPTIONS.map((opt) => {
          const selected = programSelection === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setProgramSelection(opt.id)}
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
            <h2 className="m-0 text-base font-bold">Which order?</h2>
            <p className="m-0 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
              The second session starts right when the first ends.
            </p>
          </div>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Session order">
            {ORDER_OPTIONS.map((o) => {
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
