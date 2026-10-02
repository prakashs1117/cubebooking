import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import * as Accordion from '@radix-ui/react-accordion'
import { ArrowRight, MapPin, Plus, Truck } from 'lucide-react'
import MerckLogo from '../auth/MerckLogo'

// ─── Section anchor nav ───────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PageHeader() {
  const intl = useIntl()
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-8 px-16 border-b"
      style={{
        height: 76,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <Link to="/programs" className="flex items-center gap-3 tap flex-none" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MerckLogo width={59} height={28} />
        <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Curiosity</span>
      </Link>

      <nav aria-label="Page sections" className="flex gap-1 flex-1">
        {[
          { label: intl.formatMessage({ id: 'programs.nav.programs' }), id: 'programs' },
          { label: intl.formatMessage({ id: 'programs.nav.how' }),      id: 'how' },
          { label: intl.formatMessage({ id: 'programs.nav.toad' }),     id: 'toad' },
          { label: intl.formatMessage({ id: 'programs.nav.faq' }),      id: 'faq' },
        ].map(({ label, id }) => (
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

      <div className="flex items-center gap-3">
        <Link
          to="/signin"
          className="tap px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          {intl.formatMessage({ id: 'programs.signIn' })}
        </Link>
        <Link
          to="/home?book=1"
          className="tap px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ textDecoration: 'none', background: 'var(--primary)', color: '#fff' }}
        >
          {intl.formatMessage({ id: 'programs.book' })}
        </Link>
      </div>
    </header>
  )
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const intl = useIntl()
  return (
    <section
      className="relative overflow-hidden mx-8 mt-6 flex-none"
      style={{ height: 600, borderRadius: 36, background: 'var(--brand-purple)', color: '#ffffff' }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '9999px', background: 'var(--brand-mint)', right: -90, top: -150 }} />
      <div style={{ position: 'absolute', width: 230, height: 230, borderRadius: '9999px', background: 'var(--brand-magenta)', right: 330, bottom: -90 }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', border: '28px solid var(--brand-lime)', boxSizing: 'border-box', left: 560, top: -70, opacity: 0.9 }} />
      <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '9999px', background: 'var(--brand-yellow)', right: 180, top: 330 }} />

      {/* Text */}
      <div className="relative flex flex-col gap-6" style={{ padding: '88px 0 0 72px', width: 620 }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-mint)', letterSpacing: '0.16em' }}>
          Curiosity Cube · Curiosity Lab · TOAD
        </span>
        <h1
          className="m-0 font-extrabold"
          style={{ fontFamily: 'var(--font-display)', fontSize: 68, lineHeight: '70px', letterSpacing: '-0.03em' }}
        >
          {intl.formatMessage({ id: 'programs.hero.headline' })}
        </h1>
        <p className="m-0" style={{ fontSize: 19, lineHeight: '29px', color: 'rgba(255,255,255,0.88)', maxWidth: 520 }}>
          {intl.formatMessage({ id: 'programs.hero.sub' })}
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            to="/home?book=1"
            className="tap inline-flex items-center gap-2.5"
            style={{ height: 54, padding: '0 26px', borderRadius: 16, background: '#ffffff', color: 'var(--brand-purple)', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}
          >
            {intl.formatMessage({ id: 'programs.book' })}
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
          <button
            type="button"
            onClick={() => scrollTo('programs')}
            className="tap inline-flex items-center"
            style={{ height: 54, padding: '0 24px', borderRadius: 16, background: 'rgba(255,255,255,0.14)', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}
          >
            {intl.formatMessage({ id: 'programs.hero.explore' })}
          </button>
        </div>
      </div>

      {/* Floating booking preview card */}
      <div className="absolute flex flex-col gap-3.5" style={{ right: 96, top: 96, width: 400 }}>
        <div
          className="self-end flex flex-col gap-3.5"
          style={{ width: 300, padding: 20, borderRadius: 26, background: 'var(--background)', color: 'var(--foreground)', boxShadow: '0 30px 60px -20px rgba(14,14,17,0.45)' }}
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

        {/* Hold timer card */}
        <div
          className="flex items-center gap-3"
          style={{ width: 260, padding: '16px 18px', borderRadius: 22, background: 'var(--brand-yellow)', color: 'var(--foreground)', boxShadow: '0 24px 48px -20px rgba(14,14,17,0.45)', transform: 'rotate(-3deg)' }}
        >
          <span className="grid place-items-center flex-none rounded-xl" style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.7)' }}>
            🕙
          </span>
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
    { v: '3', k: intl.formatMessage({ id: 'programs.stats.programs' }) },
    { v: '45 min', k: intl.formatMessage({ id: 'programs.stats.duration' }) },
    { v: '30', k: intl.formatMessage({ id: 'programs.stats.capacity' }) },
    { v: intl.formatMessage({ id: 'programs.stats.freeValue' }), k: intl.formatMessage({ id: 'programs.stats.free' }) },
  ]
  return (
    <section
      className="grid mx-24 -mt-11 relative z-10"
      style={{
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        padding: '28px 12px',
        borderRadius: 24,
        background: 'var(--background)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-float)',
      }}
    >
      {facts.map((f, i) => (
        <div key={i} className="flex flex-col gap-1" style={{ padding: '0 28px', borderLeft: i === 0 ? 'none' : '1px solid var(--border)' }}>
          <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: '40px', letterSpacing: '-0.02em' }}>
            {f.v}
          </span>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{f.k}</span>
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
      tag: intl.formatMessage({ id: 'home.card.onsite.tag' }),
      bg: 'var(--brand-mint)',
      shape: 'var(--brand-yellow)',
      meta: [intl.formatMessage({ id: 'programs.meta.45min' }), intl.formatMessage({ id: 'programs.meta.30students' })],
      cta: intl.formatMessage({ id: 'programs.book' }),
      href: '/home?book=1',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
    },
    {
      name: intl.formatMessage({ id: 'program.lab' }),
      desc: intl.formatMessage({ id: 'programs.lab.desc' }),
      tag: intl.formatMessage({ id: 'home.card.onsite.tag' }),
      bg: 'var(--brand-yellow)',
      shape: 'var(--brand-magenta)',
      meta: [intl.formatMessage({ id: 'programs.meta.45min' }), intl.formatMessage({ id: 'programs.meta.30students' })],
      cta: intl.formatMessage({ id: 'programs.book' }),
      href: '/home?book=1',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}><path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/></svg>,
    },
    {
      name: intl.formatMessage({ id: 'program.toad' }),
      desc: intl.formatMessage({ id: 'programs.toad.desc' }),
      tag: intl.formatMessage({ id: 'home.card.toad.tag' }),
      bg: 'var(--brand-magenta)',
      shape: 'var(--brand-purple)',
      meta: [intl.formatMessage({ id: 'programs.meta.darmstadt' }), intl.formatMessage({ id: 'programs.meta.approval' })],
      cta: intl.formatMessage({ id: 'programs.toad.request' }),
      href: '/home?book=1',
      icon: <Truck style={{ width: 32, height: 32 }} />,
    },
  ]

  return (
    <section id="programs" className="flex flex-col gap-9" style={{ padding: '104px 96px 0' }}>
      <div className="flex justify-between items-end gap-10">
        <div style={{ maxWidth: 640 }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
            {intl.formatMessage({ id: 'programs.nav.programs' })}
          </span>
          <h2 className="m-0 mt-2 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: '50px', letterSpacing: '-0.02em' }}>
            {intl.formatMessage({ id: 'programs.programs.heading' })}
          </h2>
        </div>
        <p className="m-0 text-base leading-relaxed" style={{ maxWidth: 380, color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'programs.programs.sub' })}
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {programs.map((p) => (
          <Link
            key={p.name}
            to={p.href}
            className="flex flex-col tap"
            style={{ borderRadius: 28, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
          >
            {/* Card image area */}
            <div className="relative flex-none overflow-hidden" style={{ height: 200, background: p.bg }}>
              <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', background: p.shape, right: -40, top: -50, opacity: 0.85 }} />
              <span className="absolute grid place-items-center" style={{ left: 28, bottom: 24, width: 68, height: 68, borderRadius: 20, background: 'var(--background)', boxShadow: 'var(--shadow-sm)' }}>
                {p.icon}
              </span>
              <span className="absolute text-xs font-bold px-3 py-1.5 rounded-full" style={{ right: 24, bottom: 24, background: 'var(--background)' }}>
                {p.tag}
              </span>
            </div>

            {/* Card body */}
            <div className="flex flex-col gap-2.5 flex-1" style={{ padding: '24px 28px 28px' }}>
              <h3 className="m-0 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '32px' }}>
                {p.name}
              </h3>
              <p className="m-0 flex-1 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {p.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {p.meta.map((m) => (
                  <span key={m} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}>{m}</span>
                ))}
              </div>
              <span className="mt-2.5 inline-flex items-center gap-2 text-sm font-bold">
                {p.cta}
                <ArrowRight style={{ width: 16, height: 16 }} />
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
    {
      title: intl.formatMessage({ id: 'programs.how.step1.title' }),
      body:  intl.formatMessage({ id: 'programs.how.step1.body' }),
    },
    {
      title: intl.formatMessage({ id: 'programs.how.step2.title' }),
      body:  intl.formatMessage({ id: 'programs.how.step2.body' }),
    },
    {
      title: intl.formatMessage({ id: 'programs.how.step3.title' }),
      body:  intl.formatMessage({ id: 'programs.how.step3.body' }),
    },
    {
      title: intl.formatMessage({ id: 'programs.how.step4.title' }),
      body:  intl.formatMessage({ id: 'programs.how.step4.body' }),
    },
  ]

  const previews = [
    {
      title: intl.formatMessage({ id: 'programs.how.step1.title' }),
      rows: [
        { label: 'Onsite STEM visit', note: intl.formatMessage({ id: 'home.card.onsite.tag' }), bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--brand-purple)' },
        { label: 'TOAD truck visit',  note: intl.formatMessage({ id: 'home.card.toad.tag' }),   bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-magenta)' },
      ],
    },
    {
      title: intl.formatMessage({ id: 'programs.how.step2.title' }),
      rows: [
        { label: 'Cube + Lab',       note: '90 min', bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--brand-purple)' },
        { label: 'Curiosity Cube',   note: '45 min', bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-mint)' },
        { label: 'Curiosity Lab',    note: '45 min', bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-yellow)' },
      ],
    },
    {
      title: intl.formatMessage({ id: 'programs.how.step3.title' }),
      rows: [
        { label: 'Thu 15 Oct · 09:00', note: 'Seats free', bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--primary)' },
        { label: 'Thu 15 Oct · 10:30', note: 'Few left',   bg: 'transparent',        border: 'var(--border)',       dot: 'var(--brand-orange)' },
      ],
    },
    {
      title: intl.formatMessage({ id: 'programs.how.step4.title' }),
      rows: [
        { label: 'Grade 4b · 24 students', note: '', bg: 'var(--tint-purple)', border: 'var(--brand-purple)', dot: 'var(--brand-purple)' },
        { label: 'Wheelchair access',      note: '', bg: 'transparent',        border: 'var(--border)',       dot: 'var(--muted-foreground)' },
      ],
    },
  ]

  const preview = previews[activeStep]

  return (
    <section
      id="how"
      className="grid items-center"
      style={{
        margin: '104px 32px 0',
        padding: '72px 64px',
        borderRadius: 36,
        background: 'var(--app-ground)',
        border: '1px solid var(--border)',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 64,
      }}
    >
      {/* Left: steps */}
      <div className="flex flex-col gap-7">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
            {intl.formatMessage({ id: 'programs.nav.how' })}
          </span>
          <h2 className="m-0 mt-2 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: '50px', letterSpacing: '-0.02em' }}>
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
                  className="tap w-full flex gap-4 items-start text-left"
                  style={{
                    padding: '16px 18px',
                    borderRadius: 18,
                    border: `1px solid ${active ? 'var(--brand-purple)' : 'transparent'}`,
                    background: active ? 'var(--background)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: 'inherit',
                  }}
                >
                  <span
                    className="flex-none grid place-items-center font-extrabold"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: active ? 'var(--brand-purple)' : 'var(--muted)',
                      color: active ? '#fff' : 'var(--muted-foreground)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 17,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-bold">{s.title}</span>
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{s.body}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Right: preview card */}
      <div
        className="relative overflow-hidden grid place-items-center flex-none"
        style={{ height: 520, borderRadius: 32, background: 'var(--brand-mint)' }}
      >
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '9999px', background: 'var(--brand-yellow)', left: -80, bottom: -90 }} />
        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', background: 'var(--brand-magenta)', right: 40, top: 36 }} />
        <div
          className="relative flex flex-col gap-4"
          style={{ width: 380, padding: 26, borderRadius: 28, background: 'var(--background)', boxShadow: '0 30px 60px -24px rgba(14,14,17,0.35)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'programs.how.step' })} {activeStep + 1} / 4
            </span>
            <span className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ width: 22, height: 5, borderRadius: '9999px', background: i === activeStep ? 'var(--brand-purple)' : 'var(--muted)' }} />
              ))}
            </span>
          </div>
          <div className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '32px' }}>
            {preview.title}
          </div>
          <div className="flex flex-col gap-2">
            {preview.rows.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${r.border}`, background: r.bg }}
              >
                <span style={{ width: 14, height: 14, borderRadius: '9999px', background: r.dot, flexShrink: 0 }} />
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
      className="grid items-center"
      style={{ margin: '104px 96px 0', gridTemplateColumns: '520px minmax(0, 1fr)', gap: 72 }}
    >
      {/* Left illustration */}
      <div className="relative flex-none overflow-hidden" style={{ height: 420, borderRadius: 32, background: 'var(--brand-magenta)' }}>
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '9999px', background: 'var(--brand-purple)', right: -100, top: -110 }} />
        <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '9999px', background: 'var(--brand-yellow)', right: 60, top: 150 }} />
        <span className="absolute grid place-items-center" style={{ left: 48, top: 48, width: 112, height: 112, borderRadius: 32, background: 'var(--background)', boxShadow: 'var(--shadow-float)' }}>
          <Truck style={{ width: 56, height: 56, strokeWidth: 1.6 }} />
        </span>
        <div
          className="absolute flex items-center gap-3"
          style={{ left: 48, right: 48, bottom: 48, padding: '18px 20px', borderRadius: 20, background: 'var(--background)' }}
        >
          <MapPin style={{ width: 20, height: 20, flexShrink: 0 }} />
          <span className="text-sm font-semibold">{intl.formatMessage({ id: 'programs.toad.area' })}</span>
        </div>
      </div>

      {/* Right content */}
      <div className="flex flex-col gap-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
          {intl.formatMessage({ id: 'programs.nav.toad' })}
        </span>
        <h2 className="m-0 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: '50px', letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'programs.toad.heading' })}
        </h2>
        <p className="m-0 leading-relaxed" style={{ fontSize: 17, lineHeight: '27px', color: 'var(--muted-foreground)', maxWidth: 560 }}>
          {intl.formatMessage({ id: 'programs.toad.sub' })}
        </p>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {[
            { title: intl.formatMessage({ id: 'programs.toad.step1.title' }), body: intl.formatMessage({ id: 'programs.toad.step1.body' }), bg: 'var(--card)', border: '1px solid var(--border)' },
            { title: intl.formatMessage({ id: 'programs.toad.step2.title' }), body: intl.formatMessage({ id: 'programs.toad.step2.body' }), bg: 'var(--tint-yellow)', border: 'none' },
            { title: intl.formatMessage({ id: 'programs.toad.step3.title' }), body: intl.formatMessage({ id: 'programs.toad.step3.body' }), bg: 'var(--accent)', border: 'none' },
          ].map((s) => (
            <div key={s.title} className="flex flex-col gap-1.5" style={{ padding: 18, borderRadius: 20, background: s.bg, border: s.border }}>
              <div className="text-sm font-bold">{s.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)', marginTop: 4 }}>{s.body}</div>
            </div>
          ))}
        </div>
        <Link
          to="/home?book=1"
          className="tap self-start inline-flex items-center gap-2 text-sm font-bold px-6"
          style={{ height: 44, borderRadius: 12, background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}
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
    <section id="faq" className="grid" style={{ margin: '104px 96px 96px', gridTemplateColumns: '380px minmax(0, 1fr)', gap: 72 }}>
      <div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.14em' }}>
          {intl.formatMessage({ id: 'programs.nav.faq' })}
        </span>
        <h2 className="m-0 mt-2 font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: '50px', letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'programs.faq.heading' })}
        </h2>
        <p className="m-0 mt-3 text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'programs.faq.sub' })}
        </p>
      </div>

      <Accordion.Root type="multiple" className="flex flex-col" style={{ borderTop: '1px solid var(--border)' }}>
        {faqs.map((faq) => (
          <Accordion.Item key={faq.id} value={faq.id} style={{ borderBottom: '1px solid var(--border)' }}>
            <Accordion.Trigger
              className="tap w-full flex items-center gap-4 text-left"
              style={{ minHeight: 72, padding: 0, border: 0, background: 'transparent', fontFamily: 'inherit', color: 'inherit', cursor: 'pointer', fontSize: 19, fontWeight: 600 }}
            >
              <span className="flex-1">{faq.q}</span>
              <span
                className="grid place-items-center flex-none rounded-full"
                style={{ width: 36, height: 36, background: 'var(--muted)', transition: 'background 0.25s' }}
              >
                <Plus style={{ width: 16, height: 16 }} />
              </span>
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="m-0 pb-6 text-base leading-relaxed" style={{ maxWidth: 640, color: 'var(--muted-foreground)' }}>
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
      className="flex items-center gap-6 border-t mt-auto"
      style={{ padding: '36px 96px', borderColor: 'var(--border)', background: 'var(--app-ground)' }}
    >
      <MerckLogo width={59} height={28} />
      <span className="flex-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
