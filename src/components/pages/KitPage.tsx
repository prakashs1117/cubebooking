import * as Accordion from '@radix-ui/react-accordion'
import PageContainer from '../ui/PageContainer'
import { ChevronDown, MapPin, Clock, FileText, Users, Download } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useMyBookings, type BookingDoc } from '../../hooks/queries/useBookings'
import type { Timestamp } from 'firebase/firestore'

function useKitSections() {
  const intl = useIntl()
  return [
    {
      id: 'arrival',
      icon: MapPin,
      title: intl.formatMessage({ id: 'kit.section.arrival.title' }),
      color: 'var(--brand-mint)',
      content: [
        'Main entrance: Frankfurter Str. 250, 64293 Darmstadt.',
        'Bus parking in front of the main gate — inform security 24 h in advance.',
        'Public transport: S-Bahn S3 to Darmstadt Hbf, then Bus 670 to "Merck Haupteingang".',
        'Check-in at the visitor centre. You will receive visitor badges for all students.',
        'Arrive 10 minutes early to complete sign-in before your session starts.',
      ],
    },
    {
      id: 'programme',
      icon: Clock,
      title: intl.formatMessage({ id: 'kit.section.programme.title' }),
      color: 'var(--brand-yellow)',
      content: [
        'Curiosity Cube (45 min): hands-on science exhibits exploring chemistry, biology, and physics.',
        'Curiosity Lab (45 min): guided lab experiments supervised by Merck scientists.',
        'Groups of up to 30 students per session.',
        'All safety equipment is provided. No prior science knowledge required.',
        'Photography permitted in exhibit areas only, not in the lab.',
      ],
    },
    {
      id: 'consent',
      icon: FileText,
      title: intl.formatMessage({ id: 'kit.section.consent.title' }),
      color: 'var(--brand-purple)',
      content: [
        'Send this notice to parents at least one week before the visit:',
        '"Dear Parents, your child\'s class has been booked for a STEM visit to Merck\'s Curiosity Cube & Lab on [DATE]. This is an educational trip during school hours. No personal information about students will be collected. Please contact your class teacher if you have any questions."',
        'No individual student data is stored — only class-level counts and grade.',
      ],
    },
    {
      id: 'students',
      icon: Users,
      title: intl.formatMessage({ id: 'kit.section.students.title' }),
      color: 'var(--brand-cyan)',
      content: [
        'Suggested pre-visit activities: introduce the periodic table, discuss the scientific method.',
        'Recommended reading: any age-appropriate science magazine or website.',
        'Dress code: closed-toe shoes required for lab sessions. No loose jewellery.',
        'Students with mobility needs: the building is fully wheelchair accessible. Please note any requirements during booking.',
      ],
    },
  ]
}

function BookingSelector({ booking }: { booking: BookingDoc }) {
  const intl = useIntl()
  const seg = booking.segments?.[0] as unknown as { start?: Timestamp }
  const ids = [...new Set(booking.segments?.map((s) => s.programId) ?? [])]
  const label = ids.length > 1 ? 'Cube + Lab' : ids[0] === 'cube' ? 'Curiosity Cube' : 'Curiosity Lab'
  const date = seg?.start ? intl.formatDate(seg.start.toDate(), { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <Clock className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
      <span className="flex-1">{label} · {date}</span>
    </div>
  )
}

export default function KitPage() {
  const intl = useIntl()
  const kitSections = useKitSections()
  const { data: bookings = [] } = useMyBookings()

  const nextBooking = bookings.find((b) => {
    if (b.status === 'cancelled') return false
    try {
      const seg = b.segments?.[0] as unknown as { start?: Timestamp }
      return seg?.start ? seg.start.toDate() > new Date() : false
    } catch { return false }
  })

  const progressPercent = nextBooking ? 72 : 0
  const circumference = 2 * Math.PI * 30
  const dash = circumference * (progressPercent / 100)

  return (
    <PageContainer className="gap-4">
      <h1 className="m-0 text-3xl font-extrabold tracking-tight hidden lg:block" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'kit.title' })}
      </h1>

      {nextBooking && <BookingSelector booking={nextBooking} />}

      {/* Progress card */}
        <section
          className="relative overflow-hidden flex gap-4 items-center p-[18px] rounded-[22px]"
          style={{ background: 'var(--brand-purple)', color: '#ffffff' }}
        >
          <div style={{ position: 'absolute', right: -40, top: -40, width: 130, height: 130, borderRadius: '9999px', background: 'var(--brand-mint)', opacity: 0.9 }} />
          {/* Progress ring */}
          <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" style={{ position: 'relative', flexShrink: 0 }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="var(--brand-yellow)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 36 36)"
            />
            <text x="36" y="36" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="800" fill="white" fontFamily="var(--font-display)">
              {progressPercent}%
            </text>
          </svg>
          <div className="relative flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-widest opacity-70">
              {intl.formatMessage({ id: 'kit.progress.label' })}
            </div>
            <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {nextBooking ? intl.formatMessage({ id: 'kit.progress.almostThere' }) : intl.formatMessage({ id: 'kit.progress.noVisit' })}
            </div>
            <div className="text-xs opacity-80">
              {nextBooking ? intl.formatMessage({ id: 'kit.progress.review' }) : intl.formatMessage({ id: 'kit.progress.bookFirst' })}
            </div>
          </div>
        </section>

        {/* Accordion sections */}
        <Accordion.Root type="multiple" className="flex flex-col gap-3">
          {kitSections.map((section) => (
            <Accordion.Item
              key={section.id}
              value={section.id}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className="tap w-full flex items-center gap-3 px-4 py-4 text-left group"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
                >
                  <span
                    className="flex-none grid place-items-center w-9 h-9 rounded-xl"
                    style={{ background: section.color + '22' }}
                  >
                    <section.icon className="w-4 h-4" style={{ color: section.color }} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{section.title}</span>
                  <ChevronDown
                    className="w-4 h-4 flex-none transition-transform duration-200 group-data-[state=open]:rotate-180"
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-none">
                <div className="px-4 pb-4 flex flex-col gap-2" style={{ borderTop: `1px solid var(--border)`, paddingTop: 12 }}>
                  {section.content.map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed m-0" style={{ color: 'var(--muted-foreground)' }}>
                      {line}
                    </p>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {/* Download kit button */}
        <button
          type="button"
          className="tap w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border"
          style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
        >
          <Download className="w-4 h-4" />
          {intl.formatMessage({ id: 'kit.download' })}
        </button>
    </PageContainer>
  )
}
