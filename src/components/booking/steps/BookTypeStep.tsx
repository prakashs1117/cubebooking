import { useEffect } from 'react'
import { Building2, Truck } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useBookingStore, type VisitType } from '../../../stores/bookingStore'
import { trackBookingInitiated, trackImpressionView } from '../../../services/analyticsService'

function useVisitTypes() {
  const intl = useIntl()
  return [
    {
      id: 'onsite' as VisitType,
      label: intl.formatMessage({ id: 'book.type.onsite.label' }),
      sub: intl.formatMessage({ id: 'book.type.onsite.sub' }),
      tag: intl.formatMessage({ id: 'book.type.onsite.tag' }),
      tagColor: 'var(--brand-green)',
      tagBg: 'rgba(1,136,76,0.1)',
      headerBg: 'var(--brand-mint)',
      accentCircle1: { bg: 'var(--brand-yellow)', w: 160, h: 160, r: -30, t: 20 },
      accentCircle2: { bg: 'var(--brand-lime)', w: 70, h: 70, l: 140, t: -20 },
      icon: Building2,
    },
    {
      id: 'toad' as VisitType,
      label: intl.formatMessage({ id: 'book.type.toad.label' }),
      sub: intl.formatMessage({ id: 'book.type.toad.sub' }),
      tag: intl.formatMessage({ id: 'book.type.toad.tag' }),
      tagColor: 'var(--brand-magenta)',
      tagBg: 'rgba(235,60,150,0.1)',
      headerBg: 'var(--brand-magenta)',
      accentCircle1: { bg: 'var(--brand-purple)', w: 160, h: 160, r: -30, t: 20 },
      accentCircle2: { bg: 'var(--brand-yellow)', w: 70, h: 70, l: 140, t: -20 },
      icon: Truck,
    },
  ] as const
}

interface Props {
  onSelect: (vt: VisitType) => void
}

export function BookTypeStep({ onSelect }: Props) {
  const intl = useIntl()
  const visitTypes = useVisitTypes()
  const { visitType, setVisitType } = useBookingStore()

  useEffect(() => {
    trackBookingInitiated('booking_funnel_start', 'Booking Funnel')
    visitTypes.forEach((vt) => {
      trackImpressionView(vt.id, 'visit_type', vt.label)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = (vt: VisitType) => {
    setVisitType(vt)
    trackImpressionView(vt, 'visit_type', intl.formatMessage({ id: `book.type.${vt}.label` }))
    onSelect(vt)
  }

  return (
    <>
      <div className="rise">
        <h1 className="m-0 text-[22px] md:text-[28px] font-extrabold leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'book.heading' })}
        </h1>
        <p className="mt-1 text-sm md:text-[15px]" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'book.sub' })}
        </p>
      </div>

      <div className="rise-2 flex flex-col gap-2.5">
        {visitTypes.map((vt) => {
          const selected = visitType === vt.id
          return (
            <button
              key={vt.id}
              type="button"
              onClick={() => handleSelect(vt.id)}
              aria-pressed={selected}
              className="tap text-left rounded-2xl overflow-hidden border-2 transition-colors"
              style={{
                background: 'var(--card)',
                borderColor: selected ? 'var(--primary)' : 'var(--border)',
                boxShadow: selected ? '0 0 0 3px rgba(20,155,95,0.15)' : 'none',
              }}
            >
              {/* Mobile: single-row layout. Desktop: keeps the coloured header */}
              <div className="flex md:hidden items-center gap-3 px-4 py-3">
                <span
                  className="flex-none grid place-items-center w-10 h-10 rounded-xl"
                  style={{ background: vt.headerBg }}
                >
                  <vt.icon className="w-5 h-5" style={{ color: 'var(--background)' }} />
                </span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="text-sm font-bold">{vt.label}</span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{vt.sub}</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: vt.tagBg, color: vt.tagColor }}>
                  {vt.tag}
                </span>
                {selected && (
                  <span className="flex-none w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--primary)', color: '#fff' }}>✓</span>
                )}
              </div>

              <div className="hidden md:block">
                <div className="relative h-[110px] overflow-hidden" style={{ background: vt.headerBg }}>
                  <div style={{ position: 'absolute', borderRadius: '9999px', background: vt.accentCircle1.bg, width: vt.accentCircle1.w, height: vt.accentCircle1.h, right: vt.accentCircle1.r, top: vt.accentCircle1.t }} />
                  <div style={{ position: 'absolute', borderRadius: '9999px', background: vt.accentCircle2.bg, width: vt.accentCircle2.w, height: vt.accentCircle2.h, left: vt.accentCircle2.l, top: vt.accentCircle2.t }} />
                  <div className="absolute left-5 bottom-4">
                    <span className="grid place-items-center w-[52px] h-[52px] rounded-2xl shadow-sm" style={{ background: 'var(--background)' }}>
                      <vt.icon className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                    </span>
                  </div>
                  {selected && (
                    <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--primary)', color: '#fff' }}>✓</span>
                  )}
                </div>
                <div className="px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[17px] font-bold">{vt.label}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: vt.tagBg, color: vt.tagColor }}>{vt.tag}</span>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{vt.sub}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
