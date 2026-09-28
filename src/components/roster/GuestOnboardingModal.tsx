import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../../firebase'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Modal } from '../ui/Modal'
import { buildCalendarUrl } from '../../lib/calendarUrl'
import type { MeetingDetails } from '../../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RosterDoc extends MeetingDetails {
  rosterId: string
}

interface Props {
  roster: RosterDoc
  onClose: () => void
}

// ── Questions ─────────────────────────────────────────────────────────────────

const Q_PAIRS = [
  [
    {
      id: 'goal', kind: 'multi' as const,
      q: 'What brings you here?', sub: 'Pick as many as you like.',
      opts: ['Public speaking', 'Confidence', 'Leadership', 'Networking', 'Just curious'],
    },
    {
      id: 'level', kind: 'single' as const,
      q: 'How much speaking experience do you have?',
      opts: ['Complete beginner', 'Spoken a few times', 'Comfortable already', 'Experienced speaker'],
    },
  ],
  [
    {
      id: 'source', kind: 'single' as const,
      q: 'How did you find us?',
      opts: ['Instagram', 'A friend or colleague', 'Google search', 'LinkedIn', 'Somewhere else'],
    },
    {
      id: 'callTime', kind: 'single' as const,
      q: "What's the best time to reach you?", sub: "We'll call before the meeting.",
      opts: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
    },
  ],
]

type Answers = Record<string, string | string[]>

interface ContactForm { name: string; phone: string; email: string }

const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/dhwani_toastmasters/', emoji: '📸' },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/dhwanitmc/',         emoji: '💼' },
  { label: 'WhatsApp',  href: 'https://wa.me/919738101117',                     emoji: '💬' },
]

// ── Step dots ─────────────────────────────────────────────────────────────────

function StepDots({ total, index }: { total: number; index: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, k) => (
        <div key={k} style={{
          width: k === index ? 20 : 6, height: 6, borderRadius: 3,
          background: k <= index ? '#772432' : '#E6E2DE',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  )
}

// ── Pill chip ─────────────────────────────────────────────────────────────────

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 650,
        cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
        background: on ? '#1A1519' : '#fff',
        color: on ? '#fff' : '#1A1519',
        border: `1.5px solid ${on ? '#1A1519' : '#D6D1CC'}`,
        boxShadow: on ? '0 4px 12px -4px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────

function Field({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
        border: '1.5px solid #E6E2DE', background: '#fff', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box', color: '#1A1519',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
      onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function GuestOnboardingModal({ roster, onClose }: Props) {
  // step: -1=welcome, 0..P-1=questions, P=contact, P+1=thanks
  const P = Q_PAIRS.length
  const [step, setStep] = useState(-1)
  const [dir, setDir] = useState(1)
  const [skipQuestions, setSkipQuestions] = useState(false)
  const [ans, setAns] = useState<Answers>({})
  const [contact, setContact] = useState<ContactForm>({ name: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isContact = step === P
  const isThanks = step === P + 1
  const currentPair = step >= 0 && step < P ? Q_PAIRS[step] : null

  const pairFilled = currentPair
    ? currentPair.every(q => q.kind === 'multi'
        ? ((ans[q.id] as string[]) || []).length > 0
        : !!ans[q.id])
    : true

  const contactOk = contact.name.trim().length > 1
    && contact.phone.replace(/\D/g, '').length >= 10
    && /\S+@\S+/.test(contact.email)

  const go = (next: number, direction = 1) => {
    setDir(direction)
    setStep(next)
  }

  const handleStart = (skip = false) => {
    setSkipQuestions(skip)
    go(skip ? P : 0)
  }

  const handleBack = () => {
    if (step === P && skipQuestions) { go(-1, -1); return }
    if (step === P) { go(P - 1, -1); return }
    if (step === 0) { go(-1, -1); return }
    go(step - 1, -1)
  }

  const handleNext = () => go(step + 1)

  const handleSubmit = async () => {
    if (!contactOk) return
    setSaving(true)
    setError('')
    try {
      const phoneKey = contact.phone.replace(/\D/g, '')
      await addDoc(collection(db, 'toastmaster-onboarding'), {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        answers: ans,
        rsvpIntent: 'attending',
        meetingId: roster.rosterId,
        meetingDate: roster.date,
        submittedAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'meetings', roster.rosterId, 'attendance', phoneKey), {
        uid: phoneKey,
        displayName: contact.name.trim(),
        status: 'attending',
        isGuest: true,
        updatedAt: serverTimestamp(),
      })
      go(P + 1)
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const calendarUrl = buildCalendarUrl(roster)
  const firstName = contact.name.trim().split(' ')[0] || 'there'
  const modeIcon = roster.meetingMode === 'online' ? '💻' : roster.meetingMode === 'hybrid' ? '🔀' : '📍'

  return (
    <Modal onClose={onClose} scrollKey={step}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ x: dir * 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir * -28, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.3, 1] }}
        >

          {/* ── Welcome ── */}
          {step === -1 && (
            <div style={{ padding: '48px 24px 32px' }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #772432, #5A1926)',
                borderRadius: 16, padding: '20px', marginBottom: 24, color: '#fff',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                  Next Meeting
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
                  {roster.date}
                </div>
                {roster.timing && (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{roster.timing}</div>
                )}
                {roster.location && (
                  <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
                    {modeIcon} {roster.location}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 22, fontWeight: 900, color: '#1A1519', letterSpacing: -0.6, lineHeight: 1.2, marginBottom: 10 }}>
                🎉 We'd love to see you there!
              </div>
              <div style={{ fontSize: 14, color: '#6B6470', lineHeight: 1.6, marginBottom: 28 }}>
                Tell us a little about yourself so we can make your first visit special. Takes about a minute.
              </div>

              <button
                onClick={() => handleStart(false)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: '#772432', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'inherit', marginBottom: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                Tell us about yourself <ChevronRight size={16} />
              </button>
              <button
                onClick={() => handleStart(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  background: 'transparent', color: '#6B6470',
                  border: '1.5px solid #E6E2DE',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Maybe later — just save my spot
              </button>
            </div>
          )}

          {/* ── Question pairs ── */}
          {currentPair && (
            <div style={{ padding: '52px 24px 24px', display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <button
                  onClick={handleBack}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#1A1519' }}
                >
                  <ChevronLeft size={20} strokeWidth={2.2} />
                </button>
                <StepDots total={P + 1} index={step} />
                <div style={{ width: 28 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>
                {currentPair.map(q => {
                  const val = ans[q.id]
                  return (
                    <div key={q.id}>
                      <div style={{ fontSize: 16, fontWeight: 750, color: '#1A1519', letterSpacing: -0.3, marginBottom: q.sub ? 4 : 12 }}>
                        {q.q}
                      </div>
                      {q.sub && (
                        <div style={{ fontSize: 12, color: '#A29BA6', marginBottom: 12 }}>{q.sub}</div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {q.opts.map(o => {
                          const on = q.kind === 'multi'
                            ? ((val as string[]) || []).includes(o)
                            : val === o
                          return (
                            <Chip key={o} label={o} on={on} onClick={() => {
                              if (q.kind === 'multi') {
                                const cur = (ans[q.id] as string[]) || []
                                setAns(a => ({ ...a, [q.id]: on ? cur.filter(x => x !== o) : [...cur, o] }))
                              } else {
                                setAns(a => ({ ...a, [q.id]: o }))
                              }
                            }} />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Inline footer — sits inside scroll container, always visible */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 28, paddingBottom: 8 }}>
                <button
                  onClick={handleNext}
                  disabled={!pairFilled}
                  style={{
                    height: 50, borderRadius: 999,
                    background: pairFilled ? '#1A1519' : '#E6E2DE',
                    border: 'none', cursor: pairFilled ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 24px', gap: 8, transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: pairFilled ? '#fff' : '#A29BA6' }}>
                    Next
                  </span>
                  <ChevronRight size={16} color={pairFilled ? '#fff' : '#A29BA6'} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          )}

          {/* ── Contact form ── */}
          {isContact && (
            <div style={{ padding: '52px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <button
                  onClick={handleBack}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#1A1519' }}
                >
                  <ChevronLeft size={20} strokeWidth={2.2} />
                </button>
                {!skipQuestions && <StepDots total={P + 1} index={P} />}
                <div style={{ width: 28 }} />
              </div>

              <div style={{ fontSize: 22, fontWeight: 900, color: '#1A1519', letterSpacing: -0.6, lineHeight: 1.2, marginBottom: 8 }}>
                How do we reach you?
              </div>
              <div style={{ fontSize: 13, color: '#6B6470', marginBottom: 24, lineHeight: 1.5 }}>
                Only the club committee sees this. We'll reach out before the meeting.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field value={contact.name} onChange={v => setContact(c => ({ ...c, name: v }))} placeholder="Full name" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    flexShrink: 0, padding: '12px 14px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                    border: '1.5px solid #E6E2DE', background: '#fff', color: '#1A1519',
                  }}>+91</div>
                  <div style={{ flex: 1 }}>
                    <Field value={contact.phone} onChange={v => setContact(c => ({ ...c, phone: v }))} placeholder="Phone number" type="tel" />
                  </div>
                </div>
                <Field value={contact.email} onChange={v => setContact(c => ({ ...c, email: v }))} placeholder="Email address" type="email" />
              </div>

              {error && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13 }}>
                  {error}
                </div>
              )}

              {/* Inline submit button */}
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={handleSubmit}
                  disabled={!contactOk || saving}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    background: contactOk ? '#772432' : '#E6E2DE',
                    color: contactOk ? '#fff' : '#A29BA6',
                    border: 'none', fontSize: 15, fontWeight: 800,
                    cursor: contactOk && !saving ? 'pointer' : 'default',
                    fontFamily: 'inherit', transition: 'background 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : '✓ Save my spot'}
                </button>
              </div>
            </div>
          )}

          {/* ── Thanks ── */}
          {isThanks && (
            <div style={{ padding: '48px 24px 36px', textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #772432, #5A1926)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 32,
              }}>
                🎉
              </div>

              <div style={{ fontSize: 24, fontWeight: 900, color: '#1A1519', letterSpacing: -0.6, marginBottom: 8 }}>
                You're on the list, {firstName}!
              </div>
              <div style={{ fontSize: 14, color: '#6B6470', lineHeight: 1.6, marginBottom: 24 }}>
                Someone from the club will reach out before the meeting. We can't wait to meet you.
              </div>

              {/* Meeting card */}
              <div style={{
                background: '#fff', border: '1.5px solid #E6E2DE', borderRadius: 14,
                padding: '16px', marginBottom: 16, textAlign: 'left',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>
                  Your meeting
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#1A1519', letterSpacing: -0.3 }}>
                  {roster.date}
                </div>
                {roster.timing && <div style={{ fontSize: 13, color: '#6B6470', marginTop: 3 }}>{roster.timing}</div>}
                {roster.location && <div style={{ fontSize: 12, color: '#A29BA6', marginTop: 2 }}>{modeIcon} {roster.location}</div>}
              </div>

              {calendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px', borderRadius: 12, marginBottom: 20,
                    background: '#1A1519', color: '#fff', textDecoration: 'none',
                    fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  }}
                >
                  📅 Add to Google Calendar
                </a>
              )}

              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1519', marginBottom: 12 }}>
                Follow us for updates
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                {SOCIAL.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10,
                      border: '1.5px solid #E6E2DE', background: '#fff',
                      fontSize: 12, fontWeight: 700, color: '#1A1519',
                      textDecoration: 'none', fontFamily: 'inherit',
                    }}
                  >
                    {s.emoji} {s.label}
                  </a>
                ))}
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  background: 'transparent', border: '1.5px solid #E6E2DE',
                  color: '#6B6470', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}
