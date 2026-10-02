import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import * as Accordion from '@radix-ui/react-accordion'
import { ArrowRight, MapPin, Menu, Plus, Truck, X } from 'lucide-react'
import MerckLogo from '../auth/MerckLogo'
import ThemeToggle from '../ui/ThemeToggle'

// ─── Scroll helper ────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PageHeader() {
  const intl = useIntl()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: intl.formatMessage({ id: 'programs.nav.programs' }), id: 'programs' },
    { label: intl.formatMessage({ id: 'programs.nav.how' }),      id: 'how' },
    { label: intl.formatMessage({ id: 'programs.nav.toad' }),     id: 'toad' },
    { label: intl.formatMessage({ id: 'programs.nav.faq' }),      id: 'faq' },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-20 flex items-center gap-4 md:gap-8 px-4 md:px-10 lg:px-16 border-b"
        style={{
          height: 64,
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
        }}
      >
        <Link to="/programs" className="flex items-center gap-2.5 tap flex-none" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MerckLogo width={52} height={25} />
          <span className="font-extrabold hidden sm:block" style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>Curiosity</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Page sections" className="hidden md:flex gap-1 flex-1">
          {navItems.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="tap text-sm font-medium px-3.5 py-2 rounded-xl"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--foreground)' }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle variant="icon" />
          <Link
            to="/signin"
            className="tap px-3 py-1.5 rounded-lg text-sm font-semibold hidden sm:inline-flex"
            style={{ textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            {intl.formatMessage({ id: 'programs.signIn' })}
          </Link>
          <Link
            to="/home?book=1"
            className="tap px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{ textDecoration: 'none', background: 'var(--primary)', color: '#fff' }}
          >
            {intl.formatMessage({ id: 'programs.book' })}
          </Link>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden tap grid place-items-center rounded-lg"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Menu"
            style={{ width: 36, height: 36, background: 'var(--muted)', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-16 z-10 flex flex-col p-4 gap-1 border-b"
          style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
        >
          {navItems.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => { scrollTo(id); setMobileMenuOpen(false) }}
              className="tap text-left text-sm font-medium px-4 py-3 rounded-xl"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--foreground)' }}
            >
              {label}
            </button>
          ))}
          <Link
            to="/signin"
            className="tap text-sm font-semibold px-4 py-3 rounded-xl"
            style={{ textDecoration: 'none', color: 'var(--foreground)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            {intl.formatMessage({ id: 'programs.signIn' })}
          </Link>
        </div>
      )}
    </>
  )
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const intl = useIntl()
  return (
    <section
      className="relative overflow-hidden mx-3 sm:mx-5 lg:mx-8 mt-5 flex-none"
      style={{ minHeight: 420, borderRadius: 28, background: 'var(--brand-purple)', color: '#ffffff' }}
    >
      {/* Decorative orbs — scale down on mobile */}
      <div className="hidden sm:block" style={{ position: 'absolute', width: 420, height: 420, borderRadius: '9999px', background: 'var(--brand-mint)', right: -90, top: -150 }} />
      <div style={{ position: 'absolute', width: 230, height: 230, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -60, bottom: -90, opacity: 0.7 }} />
      <div className="hidden lg:block" style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', border: '28px solid var(--brand-lime)', boxSizing: 'border-box', left: 560, top: -70, opacity: 0.9 }} />
      <div className="hidden sm:block" style={{ position: 'absolute', width: 90, height: 90, borderRadius: '9999px', background: 'var(--brand-yellow)', right: 180, top: 330 }} />

      {/* Text content — fluid padding */}
      <div className="relative flex flex-col gap-5 lg:gap-6 p-6 sm:p-14 lg:pt-20 lg:pl-16" style={{ maxWidth: 680 }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-mint)', letterSpacing: '0.16em' }}>
          Curiosity Cube · Curiosity Lab · TOAD
        </span>
        <h1
          className="m-0 font-extrabold"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw + 1rem, 4.25rem)', lineHeight: 1.04, letterSpacing: '-0.03em' }}
        >
          {intl.formatMessage({ id: 'programs.hero.headline' })}
        </h1>
        <p className="m-0" style={{ fontSize: 'clamp(1rem, 1.5vw + 0.5rem, 1.2rem)', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)', maxWidth: 520 }}>
          {intl.formatMessage({ id: 'programs.hero.sub' })}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/home?book=1"
            className="tap inline-flex items-center gap-2.5"
            style={{ height: 50, padding: '0 22px', borderRadius: 14, background: 'var(--background)', color: 'var(--brand-purple)', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}
          >
            {intl.formatMessage({ id: 'programs.book' })}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <button
            type="button"
            onClick={() => scrollTo('programs')}
            className="tap inline-flex items-center"
            style={{ height: 50, padding: '0 22px', borderRadius: 14, background: 'rgba(255,255,255,0.14)', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }}
          >
            {intl.formatMessage({ id: 'programs.hero.explore' })}
          </button>
        </div>
      </div>

      {/* Floating booking preview — only on lg: */}
      <div className="hidden lg:flex absolute flex-col gap-3.5" style={{ right: 96, top: 80, width: 400 }}>
        <div
          className="self-end flex flex-col gap-3.5"
          style={{ width: 300, padding: 20, borderRadius: 26, background: 'var(--background)', color: 'var(--foreground)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'programs.hero.card.yourVisit' })}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'var(--accent)', color: 'var(--brand-green)' }}
            >
              ✓ {intl.formatMessage({ id: 'programs.hero.card.confirmed' })}
            </span>
          </div>
          <div className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Thu, 15 Oct</div>
          <div className="flex gap-1.5">
            <div className="flex-1 px-3 py-2.5 rounded-2xl" style={{ background: 'var(--brand-mint)' }}>
              <div className="text-sm font-bold">Cube</div>
              <div className="text-xs">09:00–09:45</div>
            </div>
            <div className="flex-1 px-3 py-2.5 rounded-2xl" style={{ background: 'var(--brand-yellow)' }}>
              <div className="text-sm font-bold">Lab</div>
              <div className="text-xs">09:45–10:30</div>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Class 4b · 24 students</div>
        </div>

        <div
          className="flex items-center gap-3"
          style={{ width: 260, padding: '16px 18px', borderRadius: 22, background: 'var(--brand-yellow)', color: 'var(--foreground)', boxShadow: '0 24px 48px -20px rgba(0,0,0,0.4)', transform: 'rotate(-3deg)' }}
        >
          <span className="grid place-items-center flex-none rounded-xl" style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.7)' }}>🕙</span>
          <div>
            <div className="text-sm font-bold">{intl.formatMessage({ id: 'programs.hero.card.held' })}</div>
            <div className="text-xs">{intl.formatMessage({ id: 'programs.hero.card.heldSub' })}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── At-a-glance stats ────────────────────────────────────────────────────────

function StatsSection() {
  const intl = useIntl()
  const facts = [
    { v: '3',    k: intl.formatMessage({ id: 'programs.stats.programs' }) },
    { v: '45 min', k: intl.formatMessage({ id: 'programs.stats.duration' }) },
    { v: '30',   k: intl.formatMessage({ id: 'programs.stats.capacity' }) },
    { v: intl.formatMessage({ id: 'programs.stats.freeValue' }), k: intl.formatMessage({ id: 'programs.stats.free' }) },
  ]
  return (
    <section
      className="grid mx-4 sm:mx-8 md:mx-12 lg:mx-24 -mt-8 relative z-10"
      style={{
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        padding: '20px 8px',
        borderRadius: 20,
        background: 'var(--background)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-float)',
      }}
    >
      {facts.map((f, i) => (
        <div
          key={i}
          className="flex flex-col gap-0.5"
          style={{
            padding: '8px 20px',
            borderLeft: i % 2 === 0 ? 'none' : '1px solid var(--border)',
            borderTop: i >= 2 ? '1px solid var(--border)' : 'none',
          }}
        >
          <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', lineHeight: '40px', letterSpacing: '-0.02em' }}>
            {f.v}
          </span>
          <span className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>{f.k}</span>
        </div>
      ))}
    </section>
  )
}

// ─── Programs cards ───────────────────────────────────────────────────────────

function ProgramsSection() {
  const intl = useIntl()
  const programs = [
    {
      name: intl.formatMessage({ id: 'program.cube' }),
      desc: intl.formatMessage({ id: 'programs.cube.desc' }),
      tag:  intl.formatMessage({ id: 'home.card.onsite.tag' }),
      bg: 'var(--brand-mint)', shape: 'var(--brand-yellow)',
      meta: [intl.formatMessage({ id: 'programs.meta.45min' }), intl.formatMessage({ id: 'programs.meta.30students' })],
      cta: intl.formatMessage({ id: 'programs.book' }),
      href: '/home?book=1',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
    },
    {
      name: intl.formatMessage({ id: 'program.lab' }),
      desc: intl.formatMessage({ id: 'programs.lab.desc' }),
      tag:  intl.formatMessage({ id: 'home.card.onsite.tag' }),
      bg: 'var(--brand-yellow)', shape: 'var(--brand-magenta)',
      meta: [intl.formatMessage({ id: 'programs.meta.45min' }), intl.formatMessage({ id: 'programs.meta.30students' })],
      cta: intl.formatMessage({ id: 'programs.book' }),
      href: '/home?book=1',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}><path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/></svg>,
    },
    {
      name: intl.formatMessage({ id: 'program.toad' }),
      desc: intl.formatMessage({ id: 'programs.toad.desc' }),
      tag:  intl.formatMessage({ id: 'home.card.toad.tag' }),
      bg: 'var(--brand-magenta)', shape: 'var(--brand-purple)',
      meta: [intl.formatMessage({ id: 'programs.meta.darmstadt' }), intl.formatMessage({ id: 'programs.meta.approval' })],
      cta: intl.formatMessage({ id: 'programs.toad.request' }),
      href: '/home?book=1',
      icon: <Truck style={{ width: 32, height: 32 }} />,
    },
  ]

  return (
    <section id="programs" className="flex flex-col gap-8 px-4 sm:px-10 lg:px-24" style={{ paddingTop: 80 }}>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 lg:gap-10">
        <div style={{ maxWidth: 640 }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
            {intl.formatMessage({ id: 'programs.nav.programs' })}
          </span>
          <h2 className="m-0 mt-2 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {intl.formatMessage({ id: 'programs.programs.heading' })}
          </h2>
        </div>
        <p className="m-0 text-base leading-relaxed lg:text-right" style={{ maxWidth: 380, color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'programs.programs.sub' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((p) => (
          <Link
            key={p.name}
            to={p.href}
            className="flex flex-col tap"
            style={{ borderRadius: 24, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
          >
            <div className="relative flex-none overflow-hidden" style={{ height: 180, background: p.bg }}>
              <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', background: p.shape, right: -40, top: -50, opacity: 0.85 }} />
              <span className="absolute grid place-items-center" style={{ left: 24, bottom: 20, width: 60, height: 60, borderRadius: 18, background: 'var(--background)', boxShadow: 'var(--shadow-sm)' }}>
                {p.icon}
              </span>
              <span className="absolute text-xs font-bold px-3 py-1.5 rounded-full" style={{ right: 20, bottom: 20, background: 'var(--background)' }}>
                {p.tag}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 flex-1" style={{ padding: '20px 24px 24px' }}>
              <h3 className="m-0 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: '28px' }}>
                {p.name}
              </h3>
              <p className="m-0 flex-1 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {p.meta.map((m) => (
                  <span key={m} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}>{m}</span>
                ))}
              </div>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold">
                {p.cta} <ArrowRight style={{ width: 14, height: 14 }} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── How booking works ────────────────────────────────────────────────────────

function HowSection() {
  const intl = useIntl()
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { title: intl.formatMessage({ id: 'programs.how.step1.title' }), body: intl.formatMessage({ id: 'programs.how.step1.body' }) },
    { title: intl.formatMessage({ id: 'programs.how.step2.title' }), body: intl.formatMessage({ id: 'programs.how.step2.body' }) },
    { title: intl.formatMessage({ id: 'programs.how.step3.title' }), body: intl.formatMessage({ id: 'programs.how.step3.body' }) },
    { title: intl.formatMessage({ id: 'programs.how.step4.title' }), body: intl.formatMessage({ id: 'programs.how.step4.body' }) },
  ]

  const previews = [
    { title: intl.formatMessage({ id: 'programs.how.step1.title' }), rows: [
      { label: 'Onsite STEM visit', note: intl.formatMessage({ id: 'home.card.onsite.tag' }), bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--brand-purple)' },
      { label: 'TOAD truck visit',  note: intl.formatMessage({ id: 'home.card.toad.tag' }),   bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-magenta)' },
    ]},
    { title: intl.formatMessage({ id: 'programs.how.step2.title' }), rows: [
      { label: 'Cube + Lab',     note: '90 min', bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--brand-purple)' },
      { label: 'Curiosity Cube', note: '45 min', bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-mint)' },
      { label: 'Curiosity Lab',  note: '45 min', bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-yellow)' },
    ]},
    { title: intl.formatMessage({ id: 'programs.how.step3.title' }), rows: [
      { label: 'Thu 15 Oct · 09:00', note: 'Seats free', bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--primary)' },
      { label: 'Thu 15 Oct · 10:30', note: 'Few left',   bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-orange)' },
    ]},
    { title: intl.formatMessage({ id: 'programs.how.step4.title' }), rows: [
      { label: 'Grade 4b · 24 students', note: '', bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--brand-purple)' },
      { label: 'Wheelchair access',      note: '', bg: 'transparent',        border: 'var(--border)',       dot: 'var(--muted-foreground)' },
    ]},
  ]

  const preview = previews[activeStep]

  return (
    <section
      id="how"
      className="mx-3 sm:mx-5 lg:mx-8 flex flex-col lg:grid lg:items-center"
      style={{
        marginTop: 80,
        padding: 'clamp(32px, 5vw, 72px) clamp(24px, 5vw, 64px)',
        borderRadius: 28,
        background: 'var(--app-ground)',
        border: '1px solid var(--border)',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 48,
      }}
    >
      {/* Steps */}
      <div className="flex flex-col gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
            {intl.formatMessage({ id: 'programs.nav.how' })}
          </span>
          <h2 className="m-0 mt-2 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {intl.formatMessage({ id: 'programs.how.heading' })}
          </h2>
        </div>
        <ol className="m-0 p-0 flex flex-col gap-1.5" style={{ listStyle: 'none' }}>
          {steps.map((s, i) => {
            const active = i === activeStep
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className="tap w-full flex gap-3.5 items-start text-left"
                  style={{ padding: '14px 16px', borderRadius: 16, border: `1px solid ${active ? 'var(--brand-purple)' : 'transparent'}`, background: active ? 'var(--background)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}
                >
                  <span className="flex-none grid place-items-center font-extrabold" style={{ width: 36, height: 36, borderRadius: 10, background: active ? 'var(--brand-purple)' : 'var(--muted)', color: active ? '#fff' : 'var(--muted-foreground)', fontFamily: 'var(--font-display)', fontSize: 16 }}>
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-bold">{s.title}</span>
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{s.body}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Preview card — hidden on mobile, shown on lg: */}
      <div className="hidden lg:grid relative overflow-hidden place-items-center flex-none" style={{ height: 480, borderRadius: 28, background: 'var(--brand-mint)' }}>
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '9999px', background: 'var(--brand-yellow)', left: -80, bottom: -90 }} />
        <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '9999px', background: 'var(--brand-magenta)', right: 40, top: 36 }} />
        <div className="relative flex flex-col gap-4" style={{ width: 340, padding: 24, borderRadius: 24, background: 'var(--background)', boxShadow: '0 30px 60px -24px rgba(0,0,0,0.4)' }}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'programs.how.step' })} {activeStep + 1} / 4
            </span>
            <span className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ width: 20, height: 5, borderRadius: '9999px', background: i === activeStep ? 'var(--brand-purple)' : 'var(--muted)' }} />
              ))}
            </span>
          </div>
          <div className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: '30px' }}>{preview.title}</div>
          <div className="flex flex-col gap-2">
            {preview.rows.map((r, i) => (
              <div key={i} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${r.border}`, background: r.bg }}>
                <span style={{ width: 12, height: 12, borderRadius: '9999px', background: r.dot, flexShrink: 0 }} />
                <span className="flex-1 text-sm font-semibold">{r.label}</span>
                {r.note && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── TOAD section ─────────────────────────────────────────────────────────────

function ToadSection() {
  const intl = useIntl()
  return (
    <section
      id="toad"
      className="flex flex-col lg:grid lg:items-center px-4 sm:px-10 lg:px-24"
      style={{ marginTop: 80, gridTemplateColumns: '480px minmax(0, 1fr)', gap: 56 }}
    >
      {/* Illustration */}
      <div className="relative overflow-hidden flex-none" style={{ height: 320, borderRadius: 28, background: 'var(--brand-magenta)' }}>
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '9999px', background: 'var(--brand-purple)', right: -80, top: -90 }} />
        <div style={{ position: 'absolute', width: 110, height: 110, borderRadius: '9999px', background: 'var(--brand-yellow)', right: 60, top: 130 }} />
        <span className="absolute grid place-items-center" style={{ left: 40, top: 40, width: 96, height: 96, borderRadius: 28, background: 'var(--background)', boxShadow: 'var(--shadow-float)' }}>
          <Truck style={{ width: 48, height: 48, strokeWidth: 1.6 }} />
        </span>
        <div className="absolute flex items-center gap-2.5" style={{ left: 40, right: 40, bottom: 40, padding: '14px 16px', borderRadius: 16, background: 'var(--background)' }}>
          <MapPin style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span className="text-sm font-semibold">{intl.formatMessage({ id: 'programs.toad.area' })}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 mt-6 lg:mt-0">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
          {intl.formatMessage({ id: 'programs.nav.toad' })}
        </span>
        <h2 className="m-0 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'programs.toad.heading' })}
        </h2>
        <p className="m-0 leading-relaxed" style={{ fontSize: 16, lineHeight: '26px', color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'programs.toad.sub' })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: intl.formatMessage({ id: 'programs.toad.step1.title' }), body: intl.formatMessage({ id: 'programs.toad.step1.body' }), bg: 'var(--card)', border: '1px solid var(--border)' },
            { title: intl.formatMessage({ id: 'programs.toad.step2.title' }), body: intl.formatMessage({ id: 'programs.toad.step2.body' }), bg: 'var(--tint-yellow)', border: 'none' },
            { title: intl.formatMessage({ id: 'programs.toad.step3.title' }), body: intl.formatMessage({ id: 'programs.toad.step3.body' }), bg: 'var(--accent)', border: 'none' },
          ].map((s) => (
            <div key={s.title} className="flex flex-col gap-1.5" style={{ padding: 16, borderRadius: 18, background: s.bg, border: s.border }}>
              <div className="text-sm font-bold">{s.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)', marginTop: 2 }}>{s.body}</div>
            </div>
          ))}
        </div>
        <Link
          to="/home?book=1"
          className="tap self-start inline-flex items-center gap-2 text-sm font-bold px-5"
          style={{ height: 42, borderRadius: 12, background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}
        >
          {intl.formatMessage({ id: 'programs.toad.cta' })}
        </Link>
      </div>
    </section>
  )
}

// ─── FAQ section ─────────────────────────────────────────────────────────────

function FaqSection() {
  const intl = useIntl()
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    q: intl.formatMessage({ id: `faq.q${n}` }),
    a: intl.formatMessage({ id: `faq.a${n}` }),
    id: `faq-${n}`,
  }))

  return (
    <section
      id="faq"
      className="flex flex-col lg:grid px-4 sm:px-10 lg:px-24"
      style={{ marginTop: 80, marginBottom: 80, gridTemplateColumns: '320px minmax(0, 1fr)', gap: 56 }}
    >
      <div className="mb-6 lg:mb-0">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
          {intl.formatMessage({ id: 'programs.nav.faq' })}
        </span>
        <h2 className="m-0 mt-2 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'programs.faq.heading' })}
        </h2>
        <p className="m-0 mt-3 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'programs.faq.sub' })}
        </p>
      </div>

      <Accordion.Root type="multiple" className="flex flex-col" style={{ borderTop: '1px solid var(--border)' }}>
        {faqs.map((faq) => (
          <Accordion.Item key={faq.id} value={faq.id} style={{ borderBottom: '1px solid var(--border)' }}>
            <Accordion.Trigger
              className="tap w-full flex items-center gap-4 text-left"
              style={{ minHeight: 64, padding: 0, border: 0, background: 'transparent', fontFamily: 'inherit', color: 'inherit', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              <span className="flex-1">{faq.q}</span>
              <span className="grid place-items-center flex-none rounded-full" style={{ width: 32, height: 32, background: 'var(--muted)', flexShrink: 0 }}>
                <Plus style={{ width: 14, height: 14 }} />
              </span>
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="m-0 pb-5 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {faq.a}
              </p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function PageFooter() {
  const intl = useIntl()
  return (
    <footer
      className="flex flex-wrap items-center gap-4 border-t px-4 sm:px-10 lg:px-24"
      style={{ padding: '28px 0', borderColor: 'var(--border)', background: 'var(--app-ground)' }}
    >
      <MerckLogo width={52} height={25} />
      <span className="flex-1 min-w-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {intl.formatMessage({ id: 'programs.footer.copy' })}
      </span>
      <a href="#" className="text-xs font-medium tap" style={{ textDecoration: 'none', color: 'inherit' }}>
        {intl.formatMessage({ id: 'programs.footer.privacy' })}
      </a>
      <a href="#" className="text-xs font-medium tap" style={{ textDecoration: 'none', color: 'inherit' }}>
        {intl.formatMessage({ id: 'programs.footer.imprint' })}
      </a>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100vh', background: 'var(--background)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      <PageHeader />
      <HeroSection />
      <StatsSection />
      <ProgramsSection />
      <HowSection />
      <ToadSection />
      <FaqSection />
      <PageFooter />
    </div>
  )
}
