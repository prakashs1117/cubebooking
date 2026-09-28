import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './OnboardingPage.css';


interface SocialLink {
  id: string;
  label: string;
  handle: string;
  href: string;
  path: string;
}

// Each pair is one view
const J_Q_PAIRS = [
  [
    { id: 'goal', kind: 'multi' as const, q: 'What are you hoping to get better at?', sub: 'Pick as many as you like.',
      opts: ['Public speaking', 'Confidence', 'Leadership', 'Interviews', 'Networking', 'Just curious'] },
    { id: 'level', kind: 'single' as const, q: 'How much speaking experience do you have?',
      opts: ['Complete beginner', 'Spoken a few times', 'Comfortable already', 'Experienced speaker'] },
  ],
  [
    { id: 'when', kind: 'multi' as const, q: 'When could you attend?', sub: 'Saturdays 6 PM · occasional weekdays',
      opts: ['Saturday evenings', 'Sunday mornings', 'Weekday evenings', 'Flexible'] },
    { id: 'mode', kind: 'single' as const, q: 'How would you like to attend?',
      opts: ['In person, Chennai', 'Online', 'Either works'] },
  ],
  [
    { id: 'source', kind: 'single' as const, q: 'How did you find us?',
      opts: ['Instagram', 'A friend or colleague', 'Google search', 'LinkedIn', 'Somewhere else'] },
  ],
];

const J_SOCIAL: SocialLink[] = [
  { id: 'instagram', label: 'Instagram', handle: '@chennaispeakers', href: '#',
    path: 'M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3ZM12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2ZM17.4 6.6h.01' },
  { id: 'linkedin', label: 'LinkedIn', handle: '/chennai-speakers', href: '#',
    path: 'M4.5 3.5h15v17h-15zM8 10.5v6M8 7.6h.01M12 16.5v-3.4a2 2 0 0 1 4 0v3.4' },
  { id: 'facebook', label: 'Facebook', handle: '/chennaispeakers', href: '#',
    path: 'M14.5 21v-8h2.7l.5-3.2h-3.2V7.7c0-.9.3-1.6 1.7-1.6h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H8.5V13h2.7v8z' },
];

const J_PATHS: Record<string, string> = {
  fwd: 'M9 5l7 7-7 7', back: 'M15 5l-7 7 7 7', check: 'M4.5 12.5l5 5 10-11',
  mic: 'M12 14.5a3.2 3.2 0 0 0 3.2-3.2V5.7a3.2 3.2 0 1 0-6.4 0v5.6A3.2 3.2 0 0 0 12 14.5ZM5.5 11.3a6.5 6.5 0 0 0 13 0M12 18v3.2',
  mail: 'M3.5 6h17v12h-17zM3.5 7l8.5 6 8.5-6',
  person: 'M12 11.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4ZM4.8 20.3c0-3.8 3.2-6.4 7.2-6.4s7.2 2.6 7.2 6.4',
  chat: 'M4 5.5h16v10H8.5L4 19z',
  pin: 'M12 21.5s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 13a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 12 13Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.2l3.4 2',
  users: 'M8.5 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM2.8 20c0-3.3 2.6-5.6 5.7-5.6s5.7 2.3 5.7 5.6M16 5.2a3 3 0 0 1 0 5.9M17.4 14.7c2.2.5 3.8 2.4 3.8 5.3',
};

interface JIconProps {
  d: string;
  size?: number;
  color?: string;
  sw?: number;
}

function JIcon({ d, size = 18, color = 'currentColor', sw = 1.7 }: JIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

interface JPressProps {
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
  scale?: number;
}

function JPress({ onClick, children, style, disabled, scale = 0.97 }: JPressProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      role="button" tabIndex={0}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => !disabled && onClick && onClick()}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        transform: pressed ? `scale(${scale})` : 'none',
        transition: 'transform .16s cubic-bezier(.2,.8,.3,1)',
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface JDashesProps {
  n: number;
  i: number;
}

function JDashes({ n, i }: JDashesProps) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: n }).map((_, k) => (
        <div key={k} style={{
          width: k === i ? 22 : 14, height: 2.5, borderRadius: 2,
          background: k <= i ? 'var(--ob-ink)' : 'var(--ob-line2)',
          transition: 'all .3s',
        }} />
      ))}
    </div>
  );
}

interface JInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: string;
  type?: string;
  multiline?: boolean;
}

function JInput({ value, onChange, placeholder, icon, type = 'text', multiline }: JInputProps) {
  const st: React.CSSProperties = {
    width: '100%',
    background: 'var(--ob-surface)',
    border: '1px solid var(--ob-line2)',
    borderRadius: 13,
    padding: icon ? '14px 15px 14px 42px' : '14px 15px',
    fontSize: 15,
    color: 'var(--ob-ink)',
    outline: 'none',
    resize: 'none',
  };
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <div style={{ position: 'absolute', left: 15, top: 15 }}>
          <JIcon d={J_PATHS[icon]} size={16} color="var(--ob-ink3)" />
        </div>
      )}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={st} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={st} />
      }
    </div>
  );
}

interface JHeroProps {
  onStart: () => void;
}

function JHero({ onStart }: JHeroProps) {
  return (
    <div className="ob-jin">
      <div style={{
        background: 'linear-gradient(155deg, var(--ob-brand), var(--ob-brand2))',
        color: '#fff', paddingTop: 46, paddingBottom: 42,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -70, top: -80, width: 260, height: 260,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.16), transparent 70%)',
        }} />
        <div className="ob-wrap" style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
            padding: '6px 13px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F2DF74' }} />
            Now welcoming guests
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 46px)', fontWeight: 800,
            letterSpacing: -1.4, lineHeight: 1.06, margin: '20px 0 0',
          }}>
            Speak like the room is yours.
          </h1>
          <p style={{
            fontSize: 'clamp(15px, 3.6vw, 17px)', lineHeight: 1.55,
            color: 'rgba(255,255,255,.88)', margin: '14px 0 0', maxWidth: 440,
          }}>
            Chennai Speakers Club meets every Saturday. Members practise prepared speeches,
            impromptu speaking and evaluation in a room that is genuinely kind about it.
          </p>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 24 }}>
            {[
              { i: 'clock', t: 'Saturdays, 6:00 PM' },
              { i: 'pin', t: 'Anna Nagar + online' },
              { i: 'users', t: '34 members' },
            ].map(x => (
              <div key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <JIcon d={J_PATHS[x.i]} size={15} color="rgba(255,255,255,.7)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{x.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ob-wrap" style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div style={{ display: 'grid', gap: 11 }}>
          {[
            { n: '01', t: 'Come as a guest, free', d: 'Sit in on a full meeting. No fee, no pressure to speak.' },
            { n: '02', t: 'Take a small role', d: 'Time a speech or count filler words. Two minutes on your feet.' },
            { n: '03', t: 'Give your first speech', d: 'Your Ice Breaker, four to six minutes, whenever you feel ready.' },
          ].map(s => (
            <div key={s.n} style={{
              display: 'flex', gap: 14, padding: 16,
              background: 'var(--ob-surface)', border: '1px solid var(--ob-line)',
              borderRadius: 16, boxShadow: 'var(--ob-shadow)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ob-gold)', letterSpacing: 0.5, flexShrink: 0, paddingTop: 2 }}>{s.n}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 750, letterSpacing: -0.2 }}>{s.t}</div>
                <div style={{ fontSize: 13, color: 'var(--ob-ink2)', marginTop: 3, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <JPress onClick={onStart} style={{ marginTop: 22 }}>
          <div style={{
            height: 56, borderRadius: 999, background: 'var(--ob-ink)', color: 'var(--ob-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 9, fontSize: 15.5, fontWeight: 750,
          }}>
            Tell us about yourself
            <JIcon d={J_PATHS.fwd} size={18} color="var(--ob-surface)" sw={2.2} />
          </div>
        </JPress>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ob-ink3)', marginTop: 12, lineHeight: 1.5 }}>
          Five quick questions · about a minute
        </div>
      </div>
    </div>
  );
}

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  city: string;
  note: string;
}

type Answers = Record<string, string | string[]>;

export default function OnboardingPage() {
  const [step, setStep] = useState(-1);
  const [ans, setAns] = useState<Answers>({});
  const [c, setC] = useState<ContactForm>({ name: '', phone: '', email: '', city: 'Chennai', note: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const setCF = (k: keyof ContactForm) => (v: string) => setC(o => ({ ...o, [k]: v }));

  // steps 0..P-1 = question pairs, step P = contact, step P+1 = thanks
  const P = J_Q_PAIRS.length;
  const isContact = step === P;
  const isThanks = step === P + 1;
  const currentPair = step >= 0 && step < P ? J_Q_PAIRS[step] : null;
  const pairFilled = currentPair
    ? currentPair.every(q => q.kind === 'multi' ? (ans[q.id] as string[] || []).length > 0 : !!ans[q.id])
    : true;
  const filled = pairFilled;
  const contactOk = c.name.trim().length > 1
    && c.phone.replace(/\D/g, '').length === 10
    && /\S+@\S+\.\S+/.test(c.email);

  const next = async () => {
    if (isContact) {
      setSaving(true);
      setSaveError('');
      try {
        const docRef = await addDoc(collection(db, 'toastmaster-onboarding'), {
          name: c.name.trim(),
          phone: c.phone.trim(),
          email: c.email.trim(),
          city: c.city.trim(),
          note: c.note.trim(),
          answers: ans,
          submittedAt: serverTimestamp(),
        });
        console.log('Submission saved:', docRef.id);
        setStep(s => s + 1);
      } catch (e) {
        console.error('Save failed:', e);
        setSaveError('Could not save — please check your connection and try again.');
      } finally {
        setSaving(false);
      }
      return;
    }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  if (step === -1) return <JHero onStart={() => setStep(0)} />;

  // P pairs + contact = P+1 total steps
  const TOTAL_STEPS = P + 1;

  if (isThanks) {
    return (
      <div className="ob-wrap ob-jin" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', paddingTop: 46, paddingBottom: 'calc(46px + 70px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 78, height: 78, borderRadius: '50%', background: 'var(--ob-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', animation: 'obPop .55s both',
          }}>
            <JIcon d={J_PATHS.check} size={34} color="#fff" sw={2.6} />
          </div>
          <h2 style={{
            fontSize: 'clamp(26px, 6.5vw, 33px)', fontWeight: 800,
            letterSpacing: -1, margin: '22px 0 0', lineHeight: 1.14,
          }}>
            Thanks, {c.name.split(' ')[0] || 'friend'} — we'll be in touch.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ob-ink2)', lineHeight: 1.6, margin: '12px auto 0', maxWidth: 400 }}>
            Someone from the club will reach out within two days to invite you to our next meeting as our guest.
          </p>
        </div>

        <div style={{
          background: 'var(--ob-surface)', border: '1px solid var(--ob-line)',
          borderRadius: 18, padding: 18, marginTop: 26, boxShadow: 'var(--ob-shadow)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 750, color: 'var(--ob-ink3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>What we have</div>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {[['person', c.name], ['chat', c.phone], ['mail', c.email], ['pin', c.city]]
              .filter(r => r[1]).map(r => (
                <div key={r[0]} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <JIcon d={J_PATHS[r[0]]} size={15} color="var(--ob-ink3)" />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ob-ink)' }}>{r[1]}</span>
                </div>
              ))}
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 15.5, fontWeight: 750, letterSpacing: -0.2, textAlign: 'center' }}>Follow us for meeting news</div>
          <div style={{ fontSize: 13, color: 'var(--ob-ink2)', textAlign: 'center', marginTop: 5, lineHeight: 1.5 }}>
            Contests, guest nights and speaker highlights.
          </div>
          <div style={{ display: 'grid', gap: 9, marginTop: 16 }}>
            {J_SOCIAL.map(s => (
              <a key={s.id} href={s.href} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: 15,
                background: 'var(--ob-surface)', border: '1px solid var(--ob-line)',
                borderRadius: 15, boxShadow: 'var(--ob-shadow)',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, background: 'var(--ob-brandSoft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <JIcon d={s.path} size={18} color="var(--ob-brand)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 720, color: 'var(--ob-ink)' }}>{s.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ob-ink3)', marginTop: 1 }}>{s.handle}</div>
                </div>
                <JIcon d={J_PATHS.fwd} size={16} color="var(--ob-ink3)" />
              </a>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 30, fontSize: 12.5, color: 'var(--ob-ink3)', lineHeight: 1.6 }}>
          Chennai Speakers Club · Area 12, District 92<br />
          Saturdays 6:00 PM · Anna Nagar Community Hall
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--ob-bg)' }}>
      {/* Header */}
      <div className="ob-wrap" style={{
        paddingTop: 18, paddingBottom: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <JPress onClick={back} scale={0.9} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <JIcon d={J_PATHS.back} size={19} color="var(--ob-ink)" sw={2} />
        </JPress>
        <JDashes n={TOTAL_STEPS} i={step} />
        <div style={{ width: 34 }} />
      </div>

      {/* Scrollable content — bottom padding reserves space for the fixed footer */}
      <div key={step} className="ob-wrap ob-jin" style={{ flex: 1, overflowY: 'auto', paddingTop: 20, paddingBottom: 140 }}>

        {/* ── Question pair steps ── */}
        {currentPair && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {currentPair.map(cq => (
              <div key={cq.id}>
                <div style={{ fontSize: 16, fontWeight: 750, letterSpacing: -0.3, lineHeight: 1.3, marginBottom: cq.sub ? 4 : 12 }}>{cq.q}</div>
                {cq.sub && <div style={{ fontSize: 12, color: 'var(--ob-ink3)', marginBottom: 12 }}>{cq.sub}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cq.opts.map(o => {
                    const on = cq.kind === 'multi'
                      ? (ans[cq.id] as string[] || []).includes(o)
                      : ans[cq.id] === o;
                    return (
                      <JPress key={o} scale={0.96} onClick={() => {
                        if (cq.kind === 'multi') {
                          const cur = ans[cq.id] as string[] || [];
                          setAns(a => ({ ...a, [cq.id]: on ? cur.filter(x => x !== o) : [...cur, o] }));
                        } else {
                          setAns(a => ({ ...a, [cq.id]: o }));
                        }
                      }}>
                        <div style={{
                          padding: '9px 16px', borderRadius: 999, fontSize: 14, fontWeight: 650,
                          letterSpacing: -0.1, transition: 'all .18s',
                          background: on ? 'var(--ob-ink)' : 'var(--ob-surface)',
                          color: on ? 'var(--ob-surface)' : 'var(--ob-ink)',
                          border: `1.5px solid ${on ? 'var(--ob-ink)' : 'var(--ob-line2)'}`,
                          boxShadow: on ? '0 4px 14px -6px rgba(0,0,0,.4)' : 'none',
                        }}>
                          {o}
                        </div>
                      </JPress>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Contact step ── */}
        {isContact && (
          <>
            <h2 style={{ fontSize: 'clamp(23px, 5.6vw, 29px)', fontWeight: 800, letterSpacing: -0.9, lineHeight: 1.2, margin: 0 }}>
              How do we reach you?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ob-ink2)', margin: '9px 0 0', lineHeight: 1.55 }}>
              Only the club committee sees this. We will not add you to any list.
            </p>
            <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
              <JInput value={c.name} onChange={setCF('name')} placeholder="Full name" icon="person" />
              <div style={{ display: 'flex', gap: 9 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '0 15px', borderRadius: 13,
                  background: 'var(--ob-surface)', border: '1px solid var(--ob-line2)',
                  fontSize: 15, fontWeight: 700, flexShrink: 0,
                }}>+91</div>
                <div style={{ flex: 1 }}>
                  <JInput value={c.phone} onChange={setCF('phone')} placeholder="Phone number" icon="chat" type="tel" />
                </div>
              </div>
              <JInput value={c.email} onChange={setCF('email')} placeholder="Email address" icon="mail" type="email" />
              <JInput value={c.city} onChange={setCF('city')} placeholder="City" icon="pin" />
              <JInput value={c.note} onChange={setCF('note')} placeholder="Anything you'd like us to know? (optional)" multiline />
            </div>
          </>
        )}

        {saveError && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13 }}>
            {saveError}
          </div>
        )}
      </div>

      {/* ── Fixed footer: always visible above the tab bar ── */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        left: 0, right: 0,
        padding: '12px 22px',
        background: 'linear-gradient(to top, var(--ob-bg) 70%, transparent)',
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <span style={{ fontSize: 12.5, color: 'var(--ob-ink3)', fontWeight: 600 }}>
            {isContact ? 'We reply within 2 days' : pairFilled ? 'All set!' : 'Answer both questions'}
          </span>
          <JPress onClick={next} disabled={(isContact ? !contactOk : !filled) || saving} scale={0.94}>
            <div style={{
              height: 56, borderRadius: 999,
              padding: isContact ? '0 26px' : 0, minWidth: 56,
              background: (isContact ? contactOk : filled) ? 'var(--ob-ink)' : 'var(--ob-line2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 9, transition: 'background .25s',
            }}>
              {isContact && (
                <span style={{ fontSize: 15, fontWeight: 750, color: 'var(--ob-surface)' }}>
                  {saving ? 'Saving…' : 'Send my details'}
                </span>
              )}
              {!saving && <JIcon d={J_PATHS.fwd} size={19} color="var(--ob-surface)" sw={2.2} />}
            </div>
          </JPress>
        </div>
      </div>
    </div>
  );
}
