import { useNavigate } from 'react-router-dom'
import { Building2, Truck } from 'lucide-react'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore, type VisitType } from '../../stores/bookingStore'

const VISIT_TYPES = [
  {
    id: 'onsite' as VisitType,
    label: 'Onsite STEM visit',
    sub: 'Your class visits Merck in Darmstadt',
    tag: 'Confirmed instantly',
    tagColor: 'var(--brand-green)',
    tagBg: 'rgba(1,136,76,0.1)',
    headerBg: 'var(--brand-mint)',
    accentCircle1: { bg: 'var(--brand-yellow)', w: 160, h: 160, r: -30, t: 20 },
    accentCircle2: { bg: 'var(--brand-lime)', w: 70, h: 70, l: 140, t: -20 },
    icon: Building2,
  },
  {
    id: 'toad' as VisitType,
    label: 'TOAD truck visit',
    sub: 'The mobile lab comes to your school',
    tag: 'Subject to approval',
    tagColor: 'var(--brand-magenta)',
    tagBg: 'rgba(235,60,150,0.1)',
    headerBg: 'var(--brand-magenta)',
    accentCircle1: { bg: 'var(--brand-purple)', w: 160, h: 160, r: -30, t: 20 },
    accentCircle2: { bg: 'var(--brand-yellow)', w: 70, h: 70, l: 140, t: -20 },
    icon: Truck,
  },
] as const

export default function BookPage() {
  const navigate = useNavigate()
  const { visitType, setVisitType } = useBookingStore()

  const handleContinue = () => {
    if (visitType === 'onsite') navigate('/book/programs')
    else if (visitType === 'toad') navigate('/toad')
  }

  return (
    <BookingLayout
      title="Book a visit"
      step={1}
      totalSteps={4}
      onClose="/home"
      footer={<ContinueButton disabled={!visitType} onClick={handleContinue} />}
    >
      <div className="rise">
        <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          How would you like to visit?
        </h1>
        <p className="mt-1.5 text-[15px] leading-[22px]" style={{ color: 'var(--muted-foreground)' }}>
          Choose where the science happens.
        </p>
      </div>

      <div className="rise-2 flex flex-col gap-3">
        {VISIT_TYPES.map((vt) => {
          const selected = visitType === vt.id
          return (
            <button
              key={vt.id}
              type="button"
              onClick={() => setVisitType(vt.id)}
              aria-pressed={selected}
              className="tap text-left rounded-3xl overflow-hidden border-2 transition-colors"
              style={{
                background: 'var(--card)',
                borderColor: selected ? 'var(--primary)' : 'var(--border)',
                boxShadow: selected ? '0 0 0 3px rgba(20,155,95,0.15)' : 'none',
              }}
            >
              {/* Coloured header band */}
              <div className="relative h-[110px] overflow-hidden" style={{ background: vt.headerBg }}>
                <div style={{
                  position: 'absolute', borderRadius: '9999px',
                  background: vt.accentCircle1.bg,
                  width: vt.accentCircle1.w, height: vt.accentCircle1.h,
                  right: vt.accentCircle1.r, top: vt.accentCircle1.t,
                }} />
                <div style={{
                  position: 'absolute', borderRadius: '9999px',
                  background: vt.accentCircle2.bg,
                  width: vt.accentCircle2.w, height: vt.accentCircle2.h,
                  left: vt.accentCircle2.l, top: vt.accentCircle2.t,
                }} />
                <div className="absolute left-5 bottom-4 flex gap-2">
                  <span className="grid place-items-center w-[52px] h-[52px] rounded-2xl shadow-sm" style={{ background: 'var(--background)' }}>
                    <vt.icon className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                  </span>
                </div>
                {selected && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--primary)', color: '#fff' }}>
                    ✓
                  </span>
                )}
              </div>

              {/* Card body */}
              <div className="px-5 py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[17px] font-bold">{vt.label}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: vt.tagBg, color: vt.tagColor }}>
                    {vt.tag}
                  </span>
                </div>
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{vt.sub}</span>
              </div>
            </button>
          )
        })}
      </div>
    </BookingLayout>
  )
}
