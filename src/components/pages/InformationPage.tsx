import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import * as Dialog from '@radix-ui/react-dialog'
import MerckLogo from '../auth/MerckLogo'
import UpcomingVisitCard from '../ui/UpcomingVisitCard'
import { Carousel } from '../ui/carousel'
import SchoolIllustration from '../../assets/SchoolIllustration'
import { useAuthContext } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'
import ThemeToggle from '../ui/ThemeToggle'
import NotificationPopover from '../layout/NotificationPopover'
import { Menu, X, MapPin, Plus } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Responsive hook ──────────────────────────────────────────────────────────

function useBreakpoint(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function rand(a: number, b: number) { return a + Math.random() * (b - a) }
function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

// Inject scoped CSS once for things inline styles can't do (hover, media queries)
const SCOPED_CSS = `
.info-page { scroll-padding-top: 76px; }
.info-prog { transition: transform .25s, box-shadow .25s; }
.info-prog:hover { transform: translateY(-4px); box-shadow: 0 12px 32px -12px rgba(80,50,145,.28),0 2px 6px -2px rgba(14,14,17,.08); }
.info-nav-btn:hover { background: var(--accent) !important; }
.info-step-btn:hover { background: var(--background) !important; }
/* FAQ items must always be visible — GSAP animates in from this baseline */
.info-faq-item { visibility: visible !important; opacity: 1 !important; }

/* ── Stats: 2×2 on mobile ── */
@media (max-width: 640px) {
  .info-stats { grid-template-columns: repeat(2,minmax(0,1fr)) !important; row-gap: 20px !important; margin-top: -36px !important; }
  .info-stat:nth-child(odd)  { border-left: none !important; }
  .info-stat:nth-child(n+3)  { border-top: 1px solid var(--border); padding-top: 20px; }
}

/* ── Hero: stack on tablet/mobile ── */
@media (max-width: 900px) {
  .info-hero { grid-template-columns: 1fr !important; text-align: center; }
  .info-hero-copy { max-width: 100% !important; align-items: center; }
  .info-hero-copy p { max-width: 520px !important; text-align: left; align-self: center; }
  .info-hero-copy > div { justify-content: center; }
  .info-hero-flask {
    display: flex !important;
    justify-content: center;
    max-width: 340px !important;
    margin: 8px auto 0 !important;
    width: 100% !important;
  }
}
@media (max-width: 480px) {
  .info-hero-flask { max-width: 260px !important; }
  /* Hide the floating note/visit cards on very small screens — they overlap */
  .info-hero-note, .info-hero-visit { display: none !important; }
}

/* ── How: stack on tablet/mobile ── */
@media (max-width: 900px) {
  .info-how { grid-template-columns: 1fr !important; }
  .info-how-preview { display: none !important; }
}
/* ── How: inline preview shown only on mobile ── */
.info-how-inline { display: none !important; }
@media (max-width: 900px) {
  .info-how-inline { display: flex !important; }
}

/* ── TOAD: stack on tablet/mobile ── */
@media (max-width: 900px) {
  .info-toad { grid-template-columns: 1fr !important; }
  .info-toad-panel { max-width: 560px !important; }
}

/* ── FAQ: stack on mobile ── */
@media (max-width: 768px) {
  .info-faq { grid-template-columns: 1fr !important; }
}

/* ── Periodic strip: smaller tiles on mobile ── */
@media (max-width: 480px) {
  .info-el { width: 80px !important; height: 92px !important; }
  .info-el b { font-size: 26px !important; }
}

/* ── Hero floating cards: hide on tablet (they overlap stacked layout) ── */
@media (max-width: 900px) {
  .info-hero-note, .info-hero-visit { display: none !important; }
}

/* ── Section gutters on small screens ── */
@media (max-width: 480px) {
  .info-section { margin-left: 12px !important; margin-right: 12px !important; }
}

/* ── Impact grid: 2-col on mobile (default), 4-col on desktop ── */
@media (min-width: 640px) {
  .info-impact-grid { grid-template-columns: repeat(4,minmax(0,1fr)) !important; }
}

/* ── What is / Where grids: stack on mobile ── */
@media (max-width: 768px) {
  .info-what-grid, .info-where-grid { grid-template-columns: 1fr !important; }
}

/* ── Footer grid: stack on mobile ── */
@media (max-width: 768px) {
  .info-footer-grid { grid-template-columns: 1fr !important; }
}
`

function ScopedStyles() {
  return <style>{SCOPED_CSS}</style>
}

// ─── Header ───────────────────────────────────────────────────────────────────

function LangPill({ size }: { size: 'sm' | 'md' }) {
  const intl = useIntl()
  const { locale, setLocale } = useLocale()
  const pad = size === 'sm' ? '4px 9px' : '6px 13px'
  const fs = size === 'sm' ? 11 : 13
  return (
    <div
      aria-label={intl.formatMessage({ id: 'info.lang.toggle' })}
      style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}
    >
      {(['en', 'de'] as const).map(l => (
        <button key={l} type="button" onClick={() => setLocale(l)}
          style={{
            padding: pad, border: 'none', fontSize: fs, fontWeight: 600, cursor: 'pointer', lineHeight: 1,
            background: locale === l ? 'var(--primary)' : 'transparent',
            color: locale === l ? '#fff' : 'var(--foreground)',
            fontFamily: 'inherit',
          }}>
          {intl.formatMessage({ id: `info.lang.${l}` })}
        </button>
      ))}
    </div>
  )
}

function PageHeader() {
  const intl = useIntl()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isDesktop = useBreakpoint('(min-width: 768px)')
  const { user } = useAuthContext()

  const navItems = [
    { label: intl.formatMessage({ id: 'programs.nav.programs' }), id: 'programs' },
    { label: intl.formatMessage({ id: 'programs.nav.how' }),      id: 'how' },
    { label: intl.formatMessage({ id: 'programs.nav.toad' }),     id: 'toad' },
    { label: intl.formatMessage({ id: 'programs.nav.faq' }),      id: 'faq' },
  ]

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 clamp(16px,4vw,56px)',
        background: 'var(--surface-glass, rgba(255,255,255,0.92))', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <Link to="/info" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
          <MerckLogo width={52} height={25} />
          {isDesktop && <span>Curiosity</span>}
        </Link>

        {/* Desktop nav — only rendered on ≥768px */}
        {isDesktop && (
          <nav style={{ display: 'flex', gap: 2, flexGrow: 1 }}>
            {navItems.map(({ label, id }) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className="info-nav-btn"
                style={{ padding: '7px 13px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--foreground)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                {label}
              </button>
            ))}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {isDesktop ? (
            <>
              {/* Language pill */}
              <LangPill size="sm" />
              {/* Theme toggle */}
              <ThemeToggle variant="icon" />
              {/* Notification bell — only for signed-in users */}
              {user && <NotificationPopover />}
              <Link to="/signin"
                style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--foreground)', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                {intl.formatMessage({ id: 'programs.signIn' })}
              </Link>
              <Link to="/home?book=1"
                style={{ padding: '7px 16px', borderRadius: 10, background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                {intl.formatMessage({ id: 'programs.book' })}
              </Link>
            </>
          ) : (
            /* Mobile: theme + notification + hamburger */
            <>
              <ThemeToggle variant="icon" />
              {user && <NotificationPopover />}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label={intl.formatMessage({ id: 'info.menu.open' })}
                style={{ width: 40, height: 40, border: 'none', borderRadius: 10, background: 'var(--muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--foreground)' }}
              >
                <Menu size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile drawer — section nav */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(14,14,17,0.45)', backdropFilter: 'blur(2px)', animation: 'lcFade .2s ease both' }}
          />
          <Dialog.Content
            aria-label={intl.formatMessage({ id: 'info.menu.open' })}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'var(--background)',
              display: 'flex', flexDirection: 'column',
              animation: 'lcSlideIn .28s cubic-bezier(.2,.8,.2,1) both',
              outline: 'none',
            }}
          >
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 64, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <Link to="/info" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-display)' }}>
                <MerckLogo width={52} height={25} />
              </Link>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label={intl.formatMessage({ id: 'info.menu.close' })}
                  style={{ width: 40, height: 40, border: 'none', borderRadius: 10, background: 'var(--muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--foreground)' }}
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            {/* Section nav links */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItems.map(({ label, id }) => (
                <button key={id} type="button"
                  onClick={() => { scrollTo(id); setDrawerOpen(false) }}
                  style={{ padding: '14px 12px', border: 'none', borderRadius: 10, background: 'transparent', textAlign: 'left', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--foreground)' }}>
                  {label}
                </button>
              ))}

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

              <Link to="/signin" onClick={() => setDrawerOpen(false)}
                style={{ padding: '14px 12px', fontSize: 15, fontWeight: 500, textDecoration: 'none', color: 'var(--foreground)', borderRadius: 10, display: 'block' }}>
                {intl.formatMessage({ id: 'programs.signIn' })}
              </Link>
              <Link to="/home?book=1" onClick={() => setDrawerOpen(false)}
                style={{ margin: '4px 0', padding: '14px 20px', borderRadius: 12, background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, textAlign: 'center', display: 'block' }}>
                {intl.formatMessage({ id: 'programs.book' })}
              </Link>
            </nav>

            {/* Footer: language + theme */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <LangPill size="md" />
              <ThemeToggle variant="segmented" />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

// ─── Flask SVG ────────────────────────────────────────────────────────────────

function FlaskScene({ motionReady }: { motionReady: boolean }) {
  const flaskRef   = useRef<SVGGElement>(null)
  const waveFRef   = useRef<SVGPathElement>(null)
  const waveBRef   = useRef<SVGPathElement>(null)
  const inbRefs    = useRef<SVGCircleElement[]>([])
  const foamRefs   = useRef<SVGCircleElement[]>([])
  const vapRefs    = useRef<SVGCircleElement[]>([])
  const tlRefs     = useRef<SVGRectElement[]>([])
  const hexRef     = useRef<SVGGElement>(null)
  const atomRef    = useRef<SVGGElement>(null)
  const orbRefs    = useRef<SVGGElement[]>([])
  const chipRefs   = useRef<HTMLDivElement[]>([])
  const colorIdx   = useRef(0)
  const COLORS     = ['#96d7d2','#ffc832','#eb3c96','#a5cd50','#2dbecd']

  function wavePath(y: number, a: number, seg: number, n: number) {
    let d = `M0 ${y} q${seg / 2} ${-a} ${seg} 0`
    for (let i = 1; i < n; i++) d += ` t${seg} 0`
    return d + ' V480 H0Z'
  }

  function react(burst: boolean) {
    if (!motionReady) return
    colorIdx.current = (colorIdx.current + 1) % COLORS.length
    gsap.to(waveFRef.current, { fill: COLORS[colorIdx.current], duration: 0.8 })
    gsap.to(waveBRef.current, { fill: COLORS[(colorIdx.current + 2) % COLORS.length], duration: 1.2 })
    if (!burst) return
    if (flaskRef.current) gsap.fromTo(flaskRef.current, { rotation: -4 }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1,.25)', transformOrigin: '50% 100%' })
    foamRefs.current.forEach((f, i) => gsap.fromTo(f, { x: 0, y: 0, opacity: 1, scale: 0.5 }, { x: rand(-70, 70), y: rand(-200, -110), opacity: 0, scale: rand(1, 1.8), duration: rand(0.9, 1.5), ease: 'power2.out', delay: i * 0.03 }))
  }

  useEffect(() => {
    if (!motionReady) return
    function bubbles(els: Element[], { dist = 120, dur = [2, 4] as [number,number], dx = 0, delay = [0, 3] as [number,number] } = {}) {
      return els.map(b => {
        const d = rand(...dur)
        return gsap.timeline({ repeat: -1, delay: rand(...delay) })
          .fromTo(b, { y: 0, x: 0, scale: 0.5 }, { y: -dist, x: dx * rand(0.5, 1.5), scale: 1, duration: d, ease: 'none' })
          .fromTo(b, { opacity: 0 }, { opacity: 0.9, duration: d * 0.2, ease: 'none' }, 0)
          .to(b, { opacity: 0, duration: d * 0.25, ease: 'none' }, d * 0.75)
      })
    }
    const wfT  = gsap.to(waveFRef.current, { x: -130, duration: 3.2, ease: 'none', repeat: -1 })
    const wbT  = gsap.fromTo(waveBRef.current, { x: -130 }, { x: 0, duration: 4.4, ease: 'none', repeat: -1 })
    const inbT = bubbles(inbRefs.current, { dist: 130, dur: [2, 3.6] })
    const vapT = bubbles(vapRefs.current, { dist: 150, dur: [2.5, 4.5], dx: 22, delay: [1.6, 5] })
    const hexT = hexRef.current ? gsap.to(hexRef.current, { rotation: 360, duration: 40, repeat: -1, ease: 'none', transformOrigin: '50% 50%' }) : null
    const orbT = orbRefs.current.map((o, i) => gsap.to(o, { rotation: 360, duration: 2.6 + i * 1.3, repeat: -1, ease: 'none', transformOrigin: '50% 50%' }))
    const tlT  = tlRefs.current.map((t, i) => gsap.to(t, { attr: { y: '+=6' }, duration: 2 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }))
    const chipT = chipRefs.current.map((c, i) => gsap.to(c, { y: -8, duration: 2.2 + i * 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }))
    let looping = true
    const loop = () => { if (!looping) return; gsap.delayedCall(3.8, () => { react(false); loop() }) }
    loop()
    return () => {
      looping = false
      wfT.kill(); wbT.kill()
      inbT.forEach(t => t.kill()); vapT.forEach(t => t.kill())
      hexT?.kill(); orbT.forEach(t => t.kill()); tlT.forEach(t => t.kill()); chipT.forEach(t => t.kill())
    }
  }, [motionReady])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button type="button" onClick={() => react(true)} style={{ display: 'block', width: '100%', padding: 0, border: 0, background: 'none', cursor: 'pointer' }} aria-label="Mix the flask">
        <svg viewBox="0 0 600 500" overflow="visible" aria-hidden="true" focusable="false" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <clipPath id="flaskClip"><path d="M240 70V200L136 420Q120 456 158 462H442Q480 456 464 420L360 200V70Z"/></clipPath>
            <clipPath id="tubeClip"><path d="M0 0V112a13 13 0 0 0 26 0V0Z"/></clipPath>
            <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".34"/>
              <stop offset="1" stopColor="#fff" stopOpacity=".07"/>
            </linearGradient>
          </defs>
          <rect x="0" y="466" width="600" height="8" rx="4" fill="#fff" fillOpacity=".28"/>
          <g fill="none" stroke="#fff" strokeWidth="2.5">
            {[[292,56,6],[308,56,4],[300,56,8],[314,56,5],[286,56,4]].map(([cx,cy,r],i) => (
              <circle key={i} ref={el => { if (el) vapRefs.current[i] = el }} cx={cx} cy={cy} r={r}/>
            ))}
          </g>
          <g ref={flaskRef}>
            <path fill="url(#glassG)" d="M240 70V200L136 420Q120 456 158 462H442Q480 456 464 420L360 200V70Z"/>
            <g clipPath="url(#flaskClip)">
              <path ref={waveBRef} d={wavePath(300,11,65,12)} fill="#2dbecd" opacity=".55"/>
              <path ref={waveFRef} d={wavePath(304,9,65,12)} fill="#96d7d2"/>
              <g fill="#fff" fillOpacity=".3" stroke="#fff" strokeWidth="2">
                {[[190,440,7],[232,446,4],[280,440,9],[324,448,5],[366,440,8],[408,446,5],[300,452,4]].map(([cx,cy,r],i) => (
                  <circle key={i} ref={el => { if (el) inbRefs.current[i] = el }} cx={cx} cy={cy} r={r}/>
                ))}
              </g>
            </g>
            <path d="M240 70V200L136 420Q120 456 158 462H442Q480 456 464 420L360 200V70Z" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" pathLength={1} strokeDasharray="1"/>
            <rect x="228" y="54" width="144" height="20" rx="10" fill="rgba(255,255,255,.2)" stroke="#fff" strokeWidth="6"/>
            <path d="M254 98V208L168 396" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round"/>
            <g fill="none" stroke="#fff" strokeWidth="2.5">
              {Array.from({length:10},(_,i) => (
                <circle key={i} ref={el => { if (el) foamRefs.current[i] = el }} cx="300" cy="62" r={[6,4,7,5,4,6,5,7,4,6][i]} opacity="0"/>
              ))}
            </g>
          </g>
          {[{tx:14,fill:'#96d7d2',y:48},{tx:50,fill:'#eb3c96',y:34},{tx:86,fill:'#ffc832',y:62}].map(({tx,fill,y},i) => (
            <g key={i} transform={`translate(${tx} 337)`}>
              <g clipPath="url(#tubeClip)">
                <rect ref={el => { if (el) tlRefs.current[i] = el }} x="0" y={y} width="26" height={138-y} fill={fill}/>
              </g>
              <path d="M0 0V112a13 13 0 0 0 26 0V0" fill="rgba(255,255,255,.1)" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
            </g>
          ))}
          <g transform="translate(512 96)">
            <g ref={atomRef}>
              <circle r="10" fill="#ffc832"/>
              {[0,60,120].map((rot,i) => (
                <g key={i} transform={`rotate(${rot})`}>
                  <g transform="scale(1 .38)">
                    <g ref={el => { if (el) orbRefs.current[i] = el }}>
                      <circle r="64" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5"/>
                      <circle cx="64" r="7.5" fill={['#96d7d2','#eb3c96','#a5cd50'][i]}/>
                    </g>
                  </g>
                </g>
              ))}
            </g>
          </g>
          <g transform="translate(84 112)">
            <g ref={hexRef}>
              <polygon points="40,0 20,34.6 -20,34.6 -40,0 -20,-34.6 20,-34.6" fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth="4" strokeLinejoin="round"/>
              <circle r="22" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3"/>
              <g fill="#ffc832"><circle cx="40" r="6"/><circle cx="-40" r="6"/></g>
              <g fill="#a5cd50"><circle cx="20" cy="34.6" r="6"/><circle cx="-20" cy="-34.6" r="6"/></g>
              <g fill="#96d7d2"><circle cx="-20" cy="34.6" r="6"/><circle cx="20" cy="-34.6" r="6"/></g>
            </g>
          </g>
        </svg>
      </button>

      {/* Floating chips */}
      {[
        {label:'H₂O', c:'var(--brand-yellow)', left:'27%', top:0},
        {label:'CO₂', c:'var(--brand-mint)',   left:'71%', top:'38%'},
        {label:'pH 7',c:'var(--brand-lime)',   left:'1%',  top:'35%'},
      ].map(({label,c,left,top},i) => (
        <div key={i} ref={el => { if (el) chipRefs.current[i] = el }}
          style={{position:'absolute', left, top}}>
          <span style={{display:'block',padding:'8px 13px',borderRadius:12,background:c,color:'var(--foreground)',fontWeight:800,fontSize:'clamp(12px,1.3vw,16px)',fontFamily:'var(--font-display)',boxShadow:'0 12px 24px -10px rgba(14,14,17,.45)'}}>
            {label}
          </span>
        </div>
      ))}

      {/* No booking preview card — /info is a public page, no auth context */}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()
  const { user } = useAuthContext()
  const copyRef  = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const blobRefs = useRef<HTMLElement[]>([])

  useEffect(() => {
    if (!motionReady) return
    const st = { trigger: '.info-hero', start: 'top top', end: 'bottom top', scrub: true }
    const t1 = gsap.to(copyRef.current,  { yPercent: 14,  ease: 'none', scrollTrigger: st })
    const t2 = gsap.to(sceneRef.current, { yPercent: -10, ease: 'none', scrollTrigger: st })
    const bT  = blobRefs.current.map(b => gsap.to(b, { y: () => (b.closest('.info-hero') as HTMLElement)?.offsetHeight * +(b.dataset.speed||0), ease: 'none', scrollTrigger: st }))
    return () => { t1.kill(); t2.kill(); bT.forEach(t => t.kill()) }
  }, [motionReady])

  return (
    <section className="info-hero" style={{
      position:'relative', margin:'20px clamp(10px,2vw,24px) 0',
      borderRadius:'clamp(20px,3vw,32px)', background:'var(--brand-purple)', color:'#fff',
      overflow:'hidden', display:'grid',
      gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',
      alignItems:'center', gap:'clamp(16px,3vw,40px)',
      padding:'clamp(36px,5vw,80px) clamp(20px,4vw,64px) clamp(48px,8vw,112px)',
    }}>
      {/* Blobs */}
      {[
        {cls:'b1', w:'clamp(200px,28vw,420px)', style:{background:'var(--brand-mint)',      right:'-6%',  top:'-25%'}, speed:'.35'},
        {cls:'b2', w:'clamp(100px,15vw,230px)', style:{background:'var(--brand-magenta)',   right:'23%',  bottom:'-15%'}, speed:'.18'},
        {cls:'b3', w:'clamp(80px,12vw,180px)',  style:{border:'clamp(12px,2vw,28px) solid var(--brand-lime)', left:'39%', top:'-10%', opacity:0.9}, speed:'.5'},
        {cls:'b4', w:'clamp(44px,6vw,90px)',    style:{background:'var(--brand-yellow)',    right:'12%',  top:'58%'}, speed:'.28'},
      ].map(({cls,w,style,speed},i) => (
        <i key={cls} ref={el => { if (el) blobRefs.current[i] = el }} data-speed={speed}
          style={{position:'absolute',borderRadius:'50%',pointerEvents:'none',width:w,aspectRatio:'1',...style}}/>
      ))}

      {/* Copy */}
      <div ref={copyRef} className="info-hero-copy" style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',gap:20}}>
        <h1 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(32px,5vw,68px)',lineHeight:1.06,letterSpacing:'-0.03em'}}>
          {intl.formatMessage({ id: 'programs.hero.headline' })}
        </h1>
        <p style={{margin:0,fontSize:'clamp(15px,1.5vw,19px)',lineHeight:1.55,color:'rgba(255,255,255,.9)',maxWidth:520}}>
          {intl.formatMessage({ id: 'programs.hero.sub' })}
        </p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:4}}>
          <Link to="/home?book=1" style={{height:50,padding:'0 24px',borderRadius:14,background:'#fff',color:'var(--brand-purple)',fontWeight:700,fontSize:'clamp(14px,1.2vw,16px)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}>
            {intl.formatMessage({ id: 'programs.book' })}
          </Link>
          <button type="button" onClick={() => scrollTo('programs')} style={{height:50,padding:'0 22px',borderRadius:14,background:'rgba(255,255,255,.14)',color:'#fff',fontSize:'clamp(14px,1.2vw,16px)',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
            {intl.formatMessage({ id: 'programs.hero.explore' })}
          </button>
        </div>
        {/* "View all bookings" — only shown when logged in */}
        {user && (
          <Link to="/bookings" style={{alignSelf:'flex-start',display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:'rgba(255,255,255,.75)',textDecoration:'none',marginTop:-4}}>
            {intl.formatMessage({ id: 'nav.bookings' })} →
          </Link>
        )}
      </div>

      {/* Flask scene + real upcoming booking card */}
      <div ref={sceneRef} className="info-hero-flask" style={{position:'relative',zIndex:1,width:'100%',maxWidth:580,justifySelf:'center'}}>
        <FlaskScene motionReady={motionReady}/>
        {/* Floating visit card — only rendered if user is logged in and has upcoming booking */}
        <UpcomingVisitCard
          variant="hero"
          style={{
            position: 'absolute',
            right: '-2%',
            bottom: '-6%',
            width: 'min(250px,43%)',
          }}
          className="info-hero-visit"
        />
      </div>
    </section>
  )
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()
  const facts = [
    {val:45,  suffix:' min',   label: intl.formatMessage({ id: 'programs.stats.duration' })},
    {val:30,  prefix:'Up to ', label: intl.formatMessage({ id: 'programs.stats.capacity' })},
    {val:3,   prefix:'< ', suffix:' min', label:'to book online'},
    {val:null, text:'EU',      label:'data hosting, GDPR-ready'},
  ]
  const numRefs = useRef<HTMLElement[]>([])

  useEffect(() => {
    if (!motionReady) return
    numRefs.current.forEach((el, i) => {
      if (!el || facts[i].val === null) return
      const obj = { v: 0 }
      gsap.to(obj, { v: facts[i].val!, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { el.textContent = String(Math.round(obj.v)) },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
    })
  }, [motionReady])

  return (
    <section className="info-stats" style={{
      position:'relative', zIndex:2,
      margin:'-44px clamp(12px,5vw,80px) 0',
      display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))',
      padding:'22px 8px', borderRadius:20,
      background:'var(--background)', border:'1px solid var(--border)',
      boxShadow:'var(--shadow-float)',
    }}>
      {facts.map((f,i) => (
        <div key={i} className="info-stat" style={{padding:'0 clamp(12px,2vw,24px)',borderLeft:i===0?'none':'1px solid var(--border)',display:'flex',flexDirection:'column',gap:4}}>
          <span style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(22px,2.4vw,34px)',lineHeight:1.15,letterSpacing:'-0.02em'}}>
            {f.prefix}
            {f.val!==null ? <b ref={el => { if (el) numRefs.current[i] = el }}>{f.val}</b> : f.text}
            {f.suffix}
          </span>
          <span style={{fontSize:13,color:'var(--muted-foreground)',lineHeight:1.4}}>{f.label}</span>
        </div>
      ))}
    </section>
  )
}

// ─── Programs ─────────────────────────────────────────────────────────────────

function ProgramsSection({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()

  useEffect(() => {
    if (!motionReady) return
    gsap.fromTo('.info-prog', { clipPath:'inset(100% 0% 0% 0% round 28px)' }, {
      clipPath:'inset(0% 0% 0% 0% round 28px)', duration:1.1, ease:'power3.out',
      stagger:0.16, clearProps:'clipPath',
      scrollTrigger:{ trigger:'.info-progs', start:'top 82%', once:true },
    })
  }, [motionReady])

  const programs = [
    {
      name: intl.formatMessage({ id: 'program.cube' }),
      desc: intl.formatMessage({ id: 'programs.cube.desc' }),
      tag:'Onsite', bg:'var(--brand-mint)', shape:'var(--brand-yellow)',
      meta:['45 min','Up to 30'], cta: intl.formatMessage({ id: 'programs.book' }), href:'/home?book=1',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
    },
    {
      name: intl.formatMessage({ id: 'program.lab' }),
      desc: intl.formatMessage({ id: 'programs.lab.desc' }),
      tag:'Onsite', bg:'var(--brand-yellow)', shape:'var(--brand-lime)',
      meta:['45 min','Up to 30'], cta: intl.formatMessage({ id: 'programs.book' }), href:'/home?book=1',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>,
    },
    {
      name: intl.formatMessage({ id: 'program.toad' }),
      desc: intl.formatMessage({ id: 'programs.toad.desc' }),
      tag:'At your school', bg:'var(--brand-magenta)', shape:'var(--brand-purple)',
      meta:['Darmstadt area','Approval'], cta: intl.formatMessage({ id: 'programs.toad.request' }), href:'/home?book=1',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>,
    },
  ]

  return (
    <section id="programs" className="info-section" style={{margin:'clamp(56px,7vw,96px) clamp(16px,5vw,80px) 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'16px 40px',flexWrap:'wrap',marginBottom:32}}>
        <h2 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(26px,3.5vw,44px)',lineHeight:1.14,letterSpacing:'-0.02em',maxWidth:640}}>
          {intl.formatMessage({ id: 'programs.programs.heading' })}
        </h2>
        <p style={{margin:0,maxWidth:380,fontSize:15,lineHeight:1.6,color:'var(--muted-foreground)'}}>
          {intl.formatMessage({ id: 'programs.programs.sub' })}
        </p>
      </div>
      <div className="info-progs" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:20}}>
        {programs.map(p => (
          <Link key={p.name} to={p.href} className="info-prog"
            style={{display:'flex',flexDirection:'column',borderRadius:24,overflow:'hidden',background:'var(--card)',border:'1px solid var(--border)',textDecoration:'none',color:'inherit'}}>
            <div style={{position:'relative',height:180,overflow:'hidden',background:p.bg}}>
              <i style={{position:'absolute',width:160,height:160,borderRadius:'50%',background:p.shape,right:-36,top:-44,opacity:0.85}}/>
              <span style={{position:'absolute',left:24,bottom:20,display:'grid',placeItems:'center',width:60,height:60,borderRadius:18,background:'var(--background)',boxShadow:'var(--shadow-sm)'}}>
                {p.icon}
              </span>
              <span style={{position:'absolute',right:20,bottom:20,padding:'5px 11px',borderRadius:9999,background:'var(--background)',fontSize:12,fontWeight:700}}>
                {p.tag}
              </span>
            </div>
            <div style={{padding:'20px 24px 24px',display:'flex',flexDirection:'column',gap:10,flexGrow:1}}>
              <h3 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,lineHeight:1.2}}>{p.name}</h3>
              <p style={{margin:0,fontSize:14,lineHeight:1.55,color:'var(--muted-foreground)',flexGrow:1}}>{p.desc}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
                {p.meta.map(m => <span key={m} style={{padding:'4px 10px',borderRadius:9999,background:'var(--muted)',fontSize:12,fontWeight:600}}>{m}</span>)}
              </div>
              <span style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:6,fontSize:14,fontWeight:700}}>{p.cta} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Periodic strip ───────────────────────────────────────────────────────────

const TILES: [number,string,string][] = [
  [1,'H','Hydrogen'],[2,'He','Helium'],[3,'Li','Lithium'],[6,'C','Carbon'],
  [7,'N','Nitrogen'],[8,'O','Oxygen'],[9,'F','Fluorine'],[11,'Na','Sodium'],
  [12,'Mg','Magnesium'],[14,'Si','Silicon'],[16,'S','Sulfur'],[17,'Cl','Chlorine'],
  [19,'K','Potassium'],[20,'Ca','Calcium'],[26,'Fe','Iron'],[29,'Cu','Copper'],
  [47,'Ag','Silver'],[79,'Au','Gold'],
]
const BRAND_COLORS = ['--brand-mint','--brand-yellow','--brand-magenta','--brand-lime','--brand-cyan']

function PeriodicStrip({ motionReady }: { motionReady: boolean }) {
  const row0Ref = useRef<HTMLDivElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionReady) return
    const tweens = [row0Ref,row1Ref].map((r,i) =>
      gsap.fromTo(r.current, {xPercent:i?-22:0}, {xPercent:i?0:-22, ease:'none',
        scrollTrigger:{trigger:'.info-mq',start:'top bottom',end:'bottom top',scrub:0.6}})
    )
    return () => tweens.forEach(t => t.kill())
  }, [motionReady])

  const makeRow = (tiles: typeof TILES, rowIdx: number) =>
    tiles.map(([n,s,name],i) => (
      <div key={i} className="info-el" style={{flexShrink:0,width:104,height:118,padding:'9px 11px',borderRadius:14,background:`var(${BRAND_COLORS[(i+rowIdx*2)%BRAND_COLORS.length]})`,color:'var(--foreground)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <small style={{fontSize:11,fontWeight:600}}>{n}</small>
        <b style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:34,lineHeight:1}}>{s}</b>
        <span style={{fontSize:11,fontWeight:600}}>{name}</span>
      </div>
    ))

  return (
    <div className="info-mq" aria-hidden="true" style={{marginTop:'clamp(48px,6vw,80px)',display:'flex',flexDirection:'column',gap:10,overflow:'hidden'}}>
      <div ref={row0Ref} style={{display:'flex',gap:10,width:'max-content'}}>{makeRow(TILES,0)}</div>
      <div ref={row1Ref} style={{display:'flex',gap:10,width:'max-content'}}>{makeRow([...TILES].reverse(),1)}</div>
    </div>
  )
}

// ─── Video section ────────────────────────────────────────────────────────────

function VideoSection({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionReady) return undefined
    const t = gsap.fromTo(frameRef.current, {scale:0.82,borderRadius:72}, {scale:1,borderRadius:28,ease:'none',
      scrollTrigger:{trigger:frameRef.current,start:'top 92%',end:'top 35%',scrub:true}})
    return () => { t.kill() }
  }, [motionReady])

  return (
    <section style={{
      position:'relative', margin:'clamp(48px,6vw,80px) clamp(10px,2vw,24px) 0',
      padding:'clamp(40px,5vw,80px) clamp(16px,4vw,64px) clamp(48px,6vw,88px)',
      borderRadius:'clamp(20px,3vw,32px)',
      background:'linear-gradient(160deg,var(--brand-purple),#2b1a57)', color:'#fff', overflow:'hidden',
    }}>
      <div style={{position:'relative',zIndex:1,margin:'0 auto 32px',display:'flex',flexDirection:'column',gap:12,alignItems:'center',textAlign:'center'}}>
        <h2 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(26px,3.5vw,44px)',lineHeight:1.14,letterSpacing:'-0.02em'}}>
          {intl.formatMessage({ id: 'info.video.heading' })}
        </h2>
        <p style={{margin:0,fontSize:'clamp(15px,1.4vw,17px)',lineHeight:1.55,color:'rgba(255,255,255,.85)',maxWidth:480}}>
          {intl.formatMessage({ id: 'info.video.sub' })}
        </p>
      </div>
      <div ref={frameRef} style={{position:'relative',zIndex:1,maxWidth:960,margin:'0 auto',aspectRatio:'16/9',borderRadius:28,overflow:'hidden',background:'#000',border:'1px solid rgba(255,255,255,.22)',boxShadow:'0 40px 80px -30px rgba(0,0,0,.6)'}}>
        <video
          controls
          preload="metadata"
          playsInline
          style={{width:'100%',height:'100%',display:'block',objectFit:'cover'}}
        >
          <source src="/Merck-1.mp4" type="video/mp4"/>
        </video>
      </div>
    </section>
  )
}

// ─── How booking works ────────────────────────────────────────────────────────

const HOW_STEPS_DATA = [
  {title:'How would you like to visit?', rows:[['Onsite STEM visit','Instant','var(--brand-mint)',true],['TOAD truck visit','Approval','var(--brand-magenta)',false]]},
  {title:'Thu, 15 Oct · Cube first',     rows:[['09:00 → 10:30','30 seats','var(--brand-mint)',true],['10:30 → 12:00','12 seats','var(--brand-yellow)',false],['12:00 → 13:30','Full','var(--muted)',false]]},
  {title:'Grade 4 · 24 students',        rows:[['Wheelchair access','Added','var(--primary)',true],['Hearing support','','var(--muted)',false]]},
  {title:'You are booked!',              rows:[['Add to calendar','.ics','var(--brand-yellow)',false],['Pre-visit kit','4 steps','var(--brand-purple)',true]]},
]

function HowSection({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()
  const [activeStep, setActiveStep] = useState(0)
  const autoRef  = useRef(true)
  const barRef   = useRef<gsap.core.Tween|null>(null)
  const barEls   = useRef<HTMLElement[]>([])
  const isMobile = useBreakpoint('(max-width: 900px)')

  function gotoStep(i: number, fromUser = false) {
    setActiveStep(i)
    if (fromUser) autoRef.current = false
    barRef.current?.kill()
    barEls.current.forEach(b => gsap.set(b, {scaleX:0}))
    if (autoRef.current && motionReady) {
      barRef.current = gsap.fromTo(barEls.current[i], {scaleX:0}, {
        scaleX:1, duration:4.5, ease:'none',
        onComplete:() => gotoStep((i+1) % HOW_STEPS_DATA.length),
      })
    }
  }

  useEffect(() => {
    if (!motionReady) return
    const st = ScrollTrigger.create({ trigger:'#how', start:'top 85%', end:'bottom 15%',
      onToggle: s => barRef.current && barRef.current.paused(!s.isActive) })
    gotoStep(0)
    return () => { st.kill(); barRef.current?.kill() }
  }, [motionReady])

  const preview = HOW_STEPS_DATA[activeStep]
  const stepBodies = [
    intl.formatMessage({ id: 'programs.how.step1.body' }),
    intl.formatMessage({ id: 'programs.how.step2.body' }),
    intl.formatMessage({ id: 'programs.how.step3.body' }),
    intl.formatMessage({ id: 'programs.how.step4.body' }),
  ]

  // Accent colours per step
  const STEP_ACCENTS = [
    'var(--brand-purple)',
    'linear-gradient(135deg,var(--brand-purple),var(--brand-cyan))',
    'linear-gradient(135deg,var(--brand-cyan),var(--brand-green))',
    'linear-gradient(135deg,var(--brand-green),var(--brand-lime))',
  ]

  // Carousel slides for mobile — each slide is a rich step card
  const carouselSlides = HOW_STEPS_DATA.map((s, i) => ({
    title: s.title,
    accent: STEP_ACCENTS[i],
    content: (
      <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%',padding:'0 4px'}}>
        {/* Step badge + title */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:2}}>
          <span style={{flexShrink:0,display:'grid',placeItems:'center',width:32,height:32,borderRadius:9,background:'rgba(255,255,255,.22)',color:'#fff',fontFamily:'var(--font-display)',fontWeight:800,fontSize:15}}>
            {i+1}
          </span>
          <b style={{fontSize:'clamp(14px,3.5vmin,18px)',fontFamily:'var(--font-display)',fontWeight:800,color:'#fff',lineHeight:1.2,textAlign:'left'}}>
            {s.title}
          </b>
        </div>
        {/* Step body */}
        <p style={{margin:0,fontSize:'clamp(11px,2.5vmin,13px)',lineHeight:1.55,color:'rgba(255,255,255,.82)',textAlign:'left'}}>
          {stepBodies[i]}
        </p>
        {/* Option rows */}
        <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:2}}>
          {s.rows.map(([label,note,dot,sel],ri) => (
            <div key={ri} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,background:sel?'rgba(255,255,255,.22)':'rgba(255,255,255,.10)',border:`1.5px solid ${sel?'rgba(255,255,255,.55)':'rgba(255,255,255,.18)'}`}}>
              <i style={{flexShrink:0,width:10,height:10,borderRadius:'50%',background:dot as string,boxShadow:'0 0 0 2px rgba(255,255,255,.3)'}}/>
              <b style={{flexGrow:1,fontSize:'clamp(10px,2.2vmin,12px)',color:'#fff',textAlign:'left'}}>{label}</b>
              {note ? <span style={{fontSize:'clamp(9px,2vmin,11px)',color:'rgba(255,255,255,.7)',flexShrink:0}}>{note}</span> : null}
            </div>
          ))}
        </div>
      </div>
    ),
  }))

  return (
    <section id="how" style={{
      margin:'clamp(48px,6vw,88px) clamp(10px,2vw,24px) 0',
    }}>
      {/* Section heading — always visible */}
      <h2 style={{margin:'0 clamp(14px,3.5vw,56px) clamp(24px,3vw,40px)',fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(22px,3.5vw,44px)',lineHeight:1.14,letterSpacing:'-0.02em'}}>
        {intl.formatMessage({ id: 'programs.how.heading' })}
      </h2>

      {/* ── Mobile: beautiful carousel ── */}
      {isMobile ? (
        <div style={{
          padding:'clamp(24px,4vw,40px) clamp(14px,3vw,32px) clamp(40px,5vw,56px)',
          borderRadius:'clamp(20px,3vw,32px)',
          background:'var(--app-ground)',
          border:'1px solid var(--border)',
          overflow:'hidden',
        }}>
          <div className="relative overflow-hidden w-full" style={{paddingBottom:'80px'}}>
            <Carousel slides={carouselSlides} />
          </div>
        </div>
      ) : (
        /* ── Desktop: original 2-col layout ── */
        <div className="info-how" style={{
          padding:'clamp(16px,3vw,56px) clamp(14px,3.5vw,56px)',
          borderRadius:'clamp(20px,3vw,32px)',
          background:'var(--app-ground)',
          border:'1px solid var(--border)',
          display:'grid',
          gridTemplateColumns:'repeat(2,minmax(0,1fr))',
          gap:'clamp(24px,4vw,56px)',
          alignItems:'center',
        }}>
          {/* Steps list */}
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <ol style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:4}}>
              {HOW_STEPS_DATA.map((s,i) => {
                const active = i === activeStep
                return (
                  <li key={i}>
                    <button type="button" onClick={() => gotoStep(i,true)} className="info-step-btn"
                      style={{position:'relative',width:'100%',display:'flex',gap:14,alignItems:'flex-start',padding:'12px 14px 14px',borderRadius:14,border:`1px solid ${active?'var(--border)':'transparent'}`,background:active?'var(--background)':'transparent',textAlign:'left',font:'inherit',color:'inherit',cursor:'pointer',overflow:'hidden'}}>
                      <span style={{flexShrink:0,display:'grid',placeItems:'center',width:34,height:34,borderRadius:9,background:active?'var(--foreground)':'var(--muted)',color:active?'var(--background)':undefined,fontFamily:'var(--font-display)',fontWeight:800,fontSize:15}}>{i+1}</span>
                      <span>
                        <b style={{display:'block',fontSize:15,marginBottom:2}}>{s.title}</b>
                        <small style={{fontSize:12,lineHeight:1.5,color:'var(--muted-foreground)'}}>{stepBodies[i]}</small>
                      </span>
                      <i ref={el => { if (el) barEls.current[i] = el }}
                        style={{position:'absolute',left:0,right:0,bottom:0,height:3,background:'var(--primary)',transform:'scaleX(0)',transformOrigin:'0 50%',display:'block'}}/>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Preview card */}
          <div className="info-how-preview" style={{position:'relative',minHeight:'clamp(340px,38vw,500px)',borderRadius:28,background:'var(--brand-mint)',overflow:'hidden',display:'grid',placeItems:'center',padding:20}}>
            <div style={{position:'absolute',width:280,height:280,borderRadius:'50%',background:'var(--brand-yellow)',left:-80,bottom:-90}}/>
            <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',background:'var(--brand-magenta)',right:36,top:32}}/>
            <div style={{position:'relative',width:'min(360px,100%)',padding:24,borderRadius:24,background:'var(--background)',boxShadow:'0 30px 60px -24px rgba(14,14,17,.35)',display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,fontWeight:700,color:'var(--muted-foreground)'}}>
                <span>{intl.formatMessage({ id: 'programs.how.step' })} {activeStep+1} / 4</span>
                <span style={{display:'flex',gap:4}}>
                  {[0,1,2,3].map(i => <span key={i} style={{width:20,height:5,borderRadius:9999,background:i<=activeStep?'var(--primary)':'var(--border)',display:'block'}}/>)}
                </span>
              </div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,lineHeight:1.25}}>{preview.title}</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {preview.rows.map(([label,note,dot,sel],ri) => (
                  <div key={ri} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 13px',borderRadius:12,border:`1.5px solid ${sel?'var(--primary)':'var(--border)'}`,background:sel?'var(--accent)':'var(--card)'}}>
                    <i style={{flexShrink:0,width:13,height:13,borderRadius:'50%',background:dot as string}}/>
                    <b style={{flexGrow:1,fontSize:14}}>{label}</b>
                    <span style={{fontSize:12,color:'var(--muted-foreground)'}}>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── TOAD truck ───────────────────────────────────────────────────────────────

function ToadSection({ motionReady }: { motionReady: boolean }) {
  const intl    = useIntl()
  const truckRef = useRef<SVGGElement>(null)
  const wheel1Ref = useRef<SVGGElement>(null)
  const wheel2Ref = useRef<SVGGElement>(null)
  const roadRef   = useRef<SVGLineElement>(null)
  const puffRefs  = useRef<SVGCircleElement[]>([])
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionReady) return
    const drive = { trigger:'.info-truck-stage', start:'top 88%', end:'bottom 62%', scrub:0.5 }
    const t1 = gsap.fromTo(truckRef.current, {x:-430}, {x:200, ease:'none', scrollTrigger:drive})
    const t2 = gsap.to([wheel1Ref.current,wheel2Ref.current], {rotation:900, transformOrigin:'50% 50%', ease:'none', scrollTrigger:drive})
    const t3 = gsap.fromTo(roadRef.current, {strokeDashoffset:0}, {strokeDashoffset:128, ease:'none', scrollTrigger:drive})
    const puffT = puffRefs.current.map(p => {
      const d = rand(1.2,2.2)
      return gsap.timeline({repeat:-1,delay:rand(0,1)})
        .fromTo(p,{y:0,x:0,scale:0.5},{y:-60,x:-40*rand(0.5,1.5),scale:1,duration:d,ease:'none'})
        .fromTo(p,{opacity:0},{opacity:0.9,duration:d*0.2,ease:'none'},0)
        .to(p,{opacity:0,duration:d*0.25,ease:'none'},d*0.75)
    })
    // Crossfade: magenta overlay fades out in the final 20% of the scroll window
    // revealing the school building photo behind the truck ("arrived at school")
    const arrive = { trigger:'.info-truck-stage', start:'top 72%', end:'bottom 62%', scrub:0.8 }
    const t4 = gsap.fromTo(overlayRef.current, {opacity:1}, {opacity:0, ease:'power1.inOut', scrollTrigger:arrive})
    // Exhaust puffs fade out as the truck parks
    const t5 = gsap.to(puffRefs.current, {opacity:0, ease:'none', scrollTrigger:arrive})
    return () => { t1.kill(); t2.kill(); t3.kill(); t4.kill(); t5.kill(); puffT.forEach(t => t.kill()) }
  }, [motionReady])

  return (
    <section id="toad" className="info-toad info-section" style={{
      margin:'clamp(48px,6vw,88px) clamp(16px,5vw,80px) 0',
      display:'grid', gridTemplateColumns:'minmax(0,480px) minmax(0,1fr)',
      gap:'clamp(24px,4vw,64px)', alignItems:'center',
    }}>
      {/* Truck panel */}
      <div className="info-toad-panel" style={{
        borderRadius:28, overflow:'hidden', display:'flex', flexDirection:'column',
        position:'relative', background:'#3fc4ea',
      }}>
        {/* School illustration — revealed as truck arrives */}
        <SchoolIllustration style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
        {/* Permanent brand-purple tint to keep brand feel after reveal */}
        <div style={{position:'absolute',inset:0,zIndex:0,background:'rgba(80,50,145,0.22)',pointerEvents:'none'}}/>
        {/* Magenta overlay — GSAP fades this out when truck arrives */}
        <div ref={overlayRef} style={{position:'absolute',inset:0,zIndex:1,background:'var(--brand-magenta)',pointerEvents:'none'}}/>
        <svg className="info-truck-stage" viewBox="0 0 520 380" aria-hidden="true" style={{width:'100%',height:'auto',position:'relative',zIndex:2}}>
          <circle cx="440" cy="60" r="150" fill="var(--brand-purple)"/>
          <circle cx="430" cy="200" r="58" fill="var(--brand-yellow)"/>
          <rect x="0" y="336" width="520" height="44" fill="#0e0e11" fillOpacity=".85"/>
          <line ref={roadRef} x1="0" y1="358" x2="560" y2="358" stroke="#fff" strokeWidth="4" strokeDasharray="36 28" strokeLinecap="round"/>
          <g ref={truckRef} transform="translate(80 190)">
            <g fill="none" stroke="#fff" strokeWidth="3">
              {[[-6,108,7],[-2,108,5],[-8,108,9],[0,108,6]].map(([cx,cy,r],i) => (
                <circle key={i} ref={el => { if (el) puffRefs.current[i] = el }} cx={cx} cy={cy} r={r}/>
              ))}
            </g>
            <rect x="0" y="0" width="210" height="112" rx="14" fill="#fff"/>
            <rect x="0" y="86" width="210" height="12" fill="var(--brand-yellow)"/>
            <text textAnchor="middle" fontFamily="var(--font-merck)" fontWeight="800" fill="var(--brand-purple)">
              <tspan x="105" y="40" fontSize="20">CURIOSITY</tspan>
              <tspan x="105" dy="26" fontSize="20">CUBE</tspan>
            </text>
            <path d="M216 28H262L300 76V112H216Z" fill="var(--brand-yellow)"/>
            <path d="M228 40H257L280 70H228Z" fill="var(--brand-mint)"/>
            <rect x="0" y="104" width="300" height="14" rx="4" fill="#0e0e11"/>
            <g transform="translate(52 126)">
              <g ref={wheel1Ref}><circle r="25" fill="#0e0e11"/><circle r="11" fill="#fff"/><path d="M0-11V11M-11 0H11" stroke="#0e0e11" strokeWidth="3"/></g>
            </g>
            <g transform="translate(246 126)">
              <g ref={wheel2Ref}><circle r="25" fill="#0e0e11"/><circle r="11" fill="#fff"/><path d="M0-11V11M-11 0H11" stroke="#0e0e11" strokeWidth="3"/></g>
            </g>
          </g>
        </svg>
        <div style={{margin:'0 20px 20px',padding:'14px 16px',borderRadius:18,background:'var(--background)',display:'flex',gap:10,alignItems:'center',fontSize:14,fontWeight:600,position:'relative',zIndex:2}}>
          <MapPin style={{width:18,height:18,flexShrink:0}}/>
          <span>{intl.formatMessage({ id: 'programs.toad.area' })}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <h2 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(26px,3.5vw,44px)',lineHeight:1.14,letterSpacing:'-0.02em'}}>
          {intl.formatMessage({ id: 'programs.toad.heading' })}
        </h2>
        <p style={{margin:0,fontSize:'clamp(15px,1.4vw,17px)',lineHeight:1.6,color:'var(--muted-foreground)',maxWidth:520}}>
          {intl.formatMessage({ id: 'programs.toad.sub' })}
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>
          {[
            {title:intl.formatMessage({id:'programs.toad.step1.title'}),body:intl.formatMessage({id:'programs.toad.step1.body'}),bg:'var(--card)',border:'1px solid var(--border)'},
            {title:intl.formatMessage({id:'programs.toad.step2.title'}),body:intl.formatMessage({id:'programs.toad.step2.body'}),bg:'var(--tint-yellow)',border:'none'},
            {title:intl.formatMessage({id:'programs.toad.step3.title'}),body:intl.formatMessage({id:'programs.toad.step3.body'}),bg:'var(--accent)',border:'none'},
          ].map(s => (
            <div key={s.title} style={{padding:16,borderRadius:18,background:s.bg,border:s.border}}>
              <b style={{display:'block',fontSize:14,marginBottom:4}}>{s.title}</b>
              <small style={{fontSize:12,lineHeight:1.45,color:'var(--muted-foreground)'}}>{s.body}</small>
            </div>
          ))}
        </div>
        <Link to="/home?book=1" style={{alignSelf:'flex-start',display:'inline-flex',alignItems:'center',gap:8,height:48,padding:'0 24px',borderRadius:12,background:'var(--primary)',color:'#fff',textDecoration:'none',fontSize:15,fontWeight:700}}>
          {intl.formatMessage({ id: 'programs.toad.cta' })}
        </Link>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FaqSection({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()
  const [openId, setOpenId] = useState<string|null>('q1')

  const faqs = [
    {id:'q1',q:'Who can book a visit?',a:'Teachers at approved schools. Your school is approved once by the Merck team, then every teacher at the school can book directly.'},
    {id:'q2',q:'Can we split a large class?',a:'Yes. Each session takes up to 30 students. Book the second group as its own visit; it can run on the other program at the same time.'},
    {id:'q3',q:'What data do you store?',a:'Only your name, school email and class-level details such as grade and class size. No student data. Everything is stored in the EU (Frankfurt).'},
    {id:'q4',q:'Can I reschedule or cancel?',a:'Yes, from My bookings at any time. The freed seats go straight back to other schools.'},
  ]

  useEffect(() => {
    if (!motionReady) return
    // Use autoAlpha so items start truly invisible and GSAP restores visibility on complete
    const t = gsap.from('.info-faq-item', {
      x: 40, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: '.info-faq-list', start: 'top 85%', once: true },
    })
    return () => { t.kill(); gsap.set('.info-faq-item', { clearProps: 'all' }) }
  }, [motionReady])

  return (
    <section id="faq" className="info-faq info-section" style={{
      margin:'clamp(48px,6vw,88px) clamp(16px,5vw,80px) 0',
      marginBottom:'clamp(48px,6vw,88px)',
      display:'grid', gridTemplateColumns:'minmax(0,340px) minmax(0,1fr)',
      gap:'clamp(24px,4vw,64px)',
    }}>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <h2 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(26px,3.5vw,44px)',lineHeight:1.14,letterSpacing:'-0.02em'}}>
          {intl.formatMessage({ id: 'programs.faq.heading' })}
        </h2>
        <p style={{margin:0,fontSize:15,lineHeight:1.6,color:'var(--muted-foreground)'}}>
          {intl.formatMessage({ id: 'programs.faq.sub' })}
        </p>
      </div>
      <div className="info-faq-list" style={{borderTop:'1px solid var(--border)'}}>
        {faqs.map(faq => {
          const isOpen = openId === faq.id
          return (
            <div key={faq.id} className="info-faq-item" style={{borderBottom:'1px solid var(--border)'}}>
              <h3 style={{margin:0,font:'inherit'}}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpenId(isOpen?null:faq.id)}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:16,minHeight:64,padding:0,border:0,background:'transparent',textAlign:'left',font:'600 clamp(15px,1.5vw,18px)/1.35 var(--font-sans)',color:'inherit',cursor:'pointer'}}>
                  <span style={{flexGrow:1}}>{faq.q}</span>
                  <span style={{flexShrink:0,display:'grid',placeItems:'center',width:34,height:34,borderRadius:'50%',background:isOpen?'var(--accent)':'var(--muted)',transition:'transform .3s,background .3s',transform:isOpen?'rotate(45deg)':'none'}}>
                    <Plus style={{width:14,height:14}}/>
                  </span>
                </button>
              </h3>
              <div style={{display:'grid',gridTemplateRows:isOpen?'1fr':'0fr',transition:'grid-template-rows .35s',visibility:isOpen?'visible':'hidden'}}>
                <div style={{overflow:'hidden'}}>
                  <p style={{margin:0,paddingBottom:24,maxWidth:600,fontSize:15,lineHeight:1.6,color:'var(--muted-foreground)'}}>{faq.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Impact stats ─────────────────────────────────────────────────────────────

function ImpactSection({ motionReady }: { motionReady: boolean }) {
  const intl = useIntl()
  const numRefs = useRef<HTMLElement[]>([])

  // Lucide icons — single brand-purple colour, no emoji
  const stats = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
      val: 286075, label: intl.formatMessage({ id: 'info.impact.students' }), suffix: '',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      val: 20, label: intl.formatMessage({ id: 'info.impact.countries' }), suffix: '+',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
      val: 94, label: intl.formatMessage({ id: 'info.impact.titleI' }), suffix: '%',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      val: 55068, label: intl.formatMessage({ id: 'info.impact.hours' }), suffix: '',
    },
  ]

  useEffect(() => {
    if (!motionReady) return
    numRefs.current.forEach((el, i) => {
      if (!el) return
      const obj = { v: 0 }
      gsap.to(obj, { v: stats[i].val, duration: 2, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { el.textContent = stats[i].val > 999 ? Math.round(obj.v).toLocaleString() : String(Math.round(obj.v)) },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
    })
  }, [motionReady])

  return (
    <section style={{ margin: 'clamp(48px,6vw,80px) clamp(16px,5vw,80px) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'info.impact.label' })}
        </span>
        <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,3.5vw,40px)', letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'info.impact.heading' })}
        </h2>
      </div>

      {/* 2-col on mobile, 4-col on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}
        className="info-impact-grid">
        {stats.map((s, i) => (
          <div key={i} style={{ padding: 'clamp(16px,2vw,28px)', borderRadius: 18, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
            {/* Single-colour icon */}
            <span style={{ color: 'var(--brand-purple)', display: 'flex' }}>
              {s.icon}
            </span>
            <span style={{ fontFamily: 'var(--font-merck)', fontWeight: 800, fontSize: 'clamp(22px,2.8vw,36px)', letterSpacing: '0.03em', color: 'var(--brand-purple)', lineHeight: 1 }}>
              <b ref={el => { if (el) numRefs.current[i] = el }}>
                {s.val > 999 ? s.val.toLocaleString() : s.val}
              </b>{s.suffix}
            </span>
            <span style={{ fontSize: 'clamp(11px,1.1vw,14px)', fontWeight: 600, color: 'var(--muted-foreground)', lineHeight: 1.35 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>
        {intl.formatMessage({ id: 'info.impact.titleINote' })}
      </p>
    </section>
  )
}

// ─── What is section ──────────────────────────────────────────────────────────

function WhatIsSection() {
  const intl = useIntl()
  return (
    <section style={{ margin: 'clamp(48px,6vw,80px) clamp(16px,5vw,80px) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'info.what.label' })}
        </span>
        <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,3.5vw,40px)', letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'info.what.heading' })}
        </h2>
      </div>

      {/* Two-column: text + image */}
      <div className="info-what-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(24px,4vw,56px)', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.5vw,30px)', lineHeight: 1.2 }}>
            {intl.formatMessage({ id: 'info.what.sparkHeading' })}
          </h3>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'info.what.body1' })}
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'info.what.body2' })}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            <Link to="/home?book=1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 12, background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
              {intl.formatMessage({ id: 'info.what.ctaBook' })}
            </Link>
            <button type="button" onClick={() => scrollTo('toad')} style={{ height: 44, padding: '0 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {intl.formatMessage({ id: 'info.what.ctaToad' })}
            </button>
          </div>
        </div>
        {/* Real photo */}
        <div style={{ borderRadius: 24, overflow: 'hidden', minHeight: 320, position: 'relative' }}>
          <img
            src="/banner-x1-min-scaled.jpg"
            alt={intl.formatMessage({ id: 'info.what.imgAlt' })}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(80,50,145,.45) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {intl.formatMessage({ id: 'info.what.imgCaption' })}
            </span>
          </div>
        </div>
      </div>

      {/* 98% stat callout */}
      <div style={{ padding: 'clamp(24px,3vw,40px)', borderRadius: 20, background: 'linear-gradient(135deg,var(--brand-purple),#2b1a57)', color: '#fff', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-merck)', fontWeight: 800, fontSize: 'clamp(48px,6vw,72px)', color: 'var(--brand-yellow)', letterSpacing: '0.04em', flexShrink: 0, lineHeight: 1 }}>98%</span>
        <p style={{ margin: 0, fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.6, color: 'rgba(255,255,255,.9)', maxWidth: 560 }}>
          {intl.formatMessage({ id: 'info.what.stat' })}
        </p>
      </div>
    </section>
  )
}

// ─── Where to find us ─────────────────────────────────────────────────────────

function WhereSection() {
  const intl = useIntl()
  return (
    <section style={{ margin: 'clamp(48px,6vw,80px) clamp(16px,5vw,80px) 0' }}>
      <div className="info-where-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(20px,4vw,48px)' }}>
        {/* Where is it? — green Cube (Europe) */}
        <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <img
            src="/europe-cube-image-min.jpg"
            alt={intl.formatMessage({ id: 'info.where.findImgAlt' })}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Dark gradient from bottom so text is legible */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,10,50,.88) 0%, rgba(20,10,50,.3) 55%, transparent 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(20px,3vw,36px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-yellow)' }}>
              {intl.formatMessage({ id: 'info.where.findLabel' })}
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.5vw,30px)', color: '#fff', lineHeight: 1.15 }}>
              {intl.formatMessage({ id: 'info.where.findHeading' })}
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.8)' }}>
              {intl.formatMessage({ id: 'info.where.findBody' })}
            </p>
            <Link to="/home?book=1" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 12, background: 'var(--brand-yellow)', color: 'var(--brand-purple)', textDecoration: 'none', fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              {intl.formatMessage({ id: 'info.where.findCta' })}
            </Link>
          </div>
        </div>

        {/* Request the Cube — blue Cube (North America) */}
        <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <img
            src="/tcb-cube-notus-min.webp"
            alt={intl.formatMessage({ id: 'info.where.hostImgAlt' })}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(80,50,145,.92) 0%, rgba(80,50,145,.35) 55%, transparent 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(20px,3vw,36px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-mint)' }}>
              {intl.formatMessage({ id: 'info.where.hostLabel' })}
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.5vw,30px)', color: '#fff', lineHeight: 1.15 }}>
              {intl.formatMessage({ id: 'info.where.hostHeading' })}
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.8)' }}>
              {intl.formatMessage({ id: 'info.where.hostBody' })}
            </p>
            <Link to="/home?book=1" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 12, background: '#fff', color: 'var(--brand-purple)', textDecoration: 'none', fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              {intl.formatMessage({ id: 'info.where.hostCta' })}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    label: 'Facebook', href: 'https://facebook.com/MilliporeSigma',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'X (Twitter)', href: 'https://twitter.com/MilliporeSigma',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram', href: 'https://www.instagram.com/curiositycube_milliporesigma',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn', href: 'https://www.linkedin.com/company/milliporesigma',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
]

function PageFooter() {
  const intl = useIntl()
  return (
    <footer style={{ position: 'relative', zIndex: 1, background: 'var(--brand-purple)', color: '#fff', marginTop: 'clamp(48px,6vw,80px)' }}>
      {/* Main footer body */}
      <div style={{ padding: 'clamp(40px,5vw,72px) clamp(16px,5vw,80px)', display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(32px,4vw,56px)' }}
        className="info-footer-grid">
        {/* Brand column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MerckLogo width={64} height={30} />
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.75)', maxWidth: 320 }}>
            {intl.formatMessage({ id: 'info.footer.brandDesc' })}
          </p>
          {/* Social links */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {SOCIAL_LINKS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.12)', color: '#fff', textDecoration: 'none', transition: 'background .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.22)') }
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)') }>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>
            {intl.formatMessage({ id: 'programs.footer.quickLinks' })}
          </span>
          {[
            { label: intl.formatMessage({ id: 'programs.nav.programs' }), id: 'programs' },
            { label: intl.formatMessage({ id: 'programs.nav.how' }),      id: 'how' },
            { label: intl.formatMessage({ id: 'programs.nav.toad' }),     id: 'toad' },
            { label: intl.formatMessage({ id: 'programs.nav.faq' }),      id: 'faq' },
            { label: intl.formatMessage({ id: 'programs.book' }),         href: '/home?book=1' },
          ].map(l => (
            l.href
              ? <Link key={l.label} to={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', textDecoration: 'none', fontWeight: 500 }}>{l.label}</Link>
              : <button key={l.label} type="button" onClick={() => scrollTo(l.id!)}
                  style={{ border: 'none', background: 'none', padding: 0, fontSize: 14, color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, textAlign: 'left' }}>
                  {l.label}
                </button>
          ))}
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>
            {intl.formatMessage({ id: 'programs.footer.contact' })}
          </span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.75)' }}>
            {intl.formatMessage({ id: 'programs.footer.contactBody' })}
          </p>
          <a href="mailto:CuriosityCube@milliporesigma.com"
            style={{ fontSize: 14, color: 'var(--brand-yellow)', textDecoration: 'none', fontWeight: 600, wordBreak: 'break-all' }}>
            CuriosityCube@milliporesigma.com
          </a>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.55)' }}>
            {intl.formatMessage({ id: 'programs.footer.merckNote' })}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', padding: '18px clamp(16px,5vw,80px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 20px', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
        <span style={{ flexGrow: 1 }}>{intl.formatMessage({ id: 'programs.footer.copy' })}</span>
        <a href="#" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontWeight: 500 }}>{intl.formatMessage({ id: 'programs.footer.privacy' })}</a>
        <a href="#" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontWeight: 500 }}>{intl.formatMessage({ id: 'programs.footer.imprint' })}</a>
        <a href="#" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontWeight: 500 }}>{intl.formatMessage({ id: 'programs.footer.cookies' })}</a>
      </div>
    </footer>
  )
}

// ─── Background floating bubbles ──────────────────────────────────────────────

function BackgroundFx({ motionReady }: { motionReady: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!motionReady) return
    const container = containerRef.current!
    const count = window.innerWidth < 720 ? 6 : 12
    const colors = ['--brand-mint','--brand-yellow','--brand-magenta','--brand-lime','--brand-cyan']
    const els: HTMLElement[] = []
    for (let i = 0; i < count; i++) {
      const b = document.createElement('i')
      const s = rand(14, 56)
      b.style.cssText = `position:absolute;border-radius:50%;--c:var(${colors[i%colors.length]});width:${s}px;height:${s}px;left:${rand(0,96)}%;top:${rand(0,100)}%;border:2px solid var(--c);background:color-mix(in srgb,var(--c) 10%,transparent);opacity:.45`
      container.appendChild(b)
      els.push(b)
      gsap.to(b, {y:() => -ScrollTrigger.maxScroll(window)*rand(0.05,0.28), ease:'none', scrollTrigger:{start:0,end:'max',scrub:true}})
      gsap.to(b, {x:rand(-20,20), duration:rand(3,6), yoyo:true, repeat:-1, ease:'sine.inOut'})
    }
    return () => els.forEach(e => e.remove())
  }, [motionReady])
  return <div ref={containerRef} aria-hidden="true" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}/>
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ motionReady }: { motionReady: boolean }) {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!motionReady) return undefined
    const t = gsap.to(barRef.current, {scaleX:1, ease:'none', scrollTrigger:{start:0,end:'max',scrub:0.2}})
    return () => { t.kill() }
  }, [motionReady])
  return (
    <div ref={barRef} aria-hidden="true" style={{position:'fixed',left:0,top:0,right:0,height:4,zIndex:60,transform:'scaleX(0)',transformOrigin:'0 50%',background:'linear-gradient(90deg,var(--brand-green),var(--brand-cyan),var(--brand-magenta),var(--brand-yellow))'}}/>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InformationPage() {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [motionReady] = useState(!prefersReduced)

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div className="info-page" style={{minHeight:'100vh',background:'var(--background)',fontFamily:'var(--font-sans)',color:'var(--foreground)',position:'relative',zIndex:1}}>
      <ScopedStyles/>
      <ProgressBar motionReady={motionReady}/>
      <BackgroundFx motionReady={motionReady}/>
      <PageHeader/>
      <main style={{position:'relative',zIndex:1,overflowX:'clip'}}>
        <HeroSection motionReady={motionReady}/>
        <StatsStrip motionReady={motionReady}/>
        <WhatIsSection/>
        <ImpactSection motionReady={motionReady}/>
        <ProgramsSection motionReady={motionReady}/>
        <PeriodicStrip motionReady={motionReady}/>
        <VideoSection motionReady={motionReady}/>
        <HowSection motionReady={motionReady}/>
        <ToadSection motionReady={motionReady}/>
        <WhereSection/>
        <FaqSection motionReady={motionReady}/>
      </main>
      <PageFooter/>
    </div>
  )
}
