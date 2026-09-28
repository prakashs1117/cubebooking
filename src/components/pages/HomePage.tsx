import { Link } from 'react-router-dom'
import { Bell, Menu, MapPin, Calendar, ChevronRight, Home, BookOpen, Package, User } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import MerckLogo from '../auth/MerckLogo'

const PROGRAM_CARDS = [
  {
    id: 'onsite',
    label: 'Onsite STEM Visit',
    description: 'Book the Curiosity Cube, Lab, or both for your class at Merck in Darmstadt.',
    accent: 'var(--cube)',
    tint: 'var(--tint-purple)',
    href: '/book',
    icons: ['🔬', '⚗️'],
    tag: 'Confirmed instantly',
  },
  {
    id: 'toad',
    label: 'TOAD Truck Visit',
    description: 'Request the mobile TOAD lab to come directly to your school.',
    accent: 'var(--toad)',
    tint: 'var(--tint-magenta)',
    href: '/toad',
    icons: ['🚚', '🧪'],
    tag: 'Subject to approval',
  },
] as const

function GreetingByTime() {
  const hour = new Date().getHours()
  if (hour < 12) return <>Good morning</>
  if (hour < 18) return <>Good afternoon</>
  return <>Good evening</>
}

export default function HomePage() {
  const { profile, logout } = useAuthContext()
  const name = profile?.displayName || 'there'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 md:px-6 lg:px-8 pt-12 pb-3 md:pt-6 sticky top-0 z-10"
        style={{ background: 'var(--app-ground)', borderBottom: '1px solid var(--border)' }}
      >
        <button type="button" className="iconbtn tap" aria-label="Open menu">
          <Menu className="i i-lg" />
        </button>

        <MerckLogo />

        <button type="button" className="iconbtn tap relative" aria-label="Notifications">
          <Bell className="i i-lg" />
          <span
            className="pulse absolute"
            style={{ top: 10, right: 11, width: 9, height: 9, borderRadius: '9999px', background: 'var(--brand-magenta)', boxShadow: '0 0 0 2px var(--app-ground)' }}
          />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 scroll px-4 md:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-3xl lg:max-w-5xl mx-auto w-full">
        {/* Greeting */}
        <div className="rise flex flex-col gap-1">
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <GreetingByTime />,
          </div>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {name}
          </h1>
          {profile?.schoolId && (
            <div className="flex items-center gap-1.5 text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              <MapPin className="i i-sm" />
              Darmstadt
            </div>
          )}
        </div>

        {/* Upcoming booking card (placeholder — shows when there's a confirmed booking) */}
        <div
          className="rise-2 tap relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--brand-purple)', color: '#ffffff', boxShadow: 'var(--shadow-float)' }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -60, top: -70, opacity: 0.9 }} />
          <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '9999px', background: 'var(--brand-mint)', right: 40, top: 40, opacity: 0.9 }} />

          <div className="relative flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <span
                className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#ffffff', color: 'var(--brand-green)' }}
              >
                <span>✓</span> Confirmed
              </span>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mt-1.5">Your next visit</div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Book your first session</div>
            </div>
            <div
              className="text-center rounded-2xl px-3 py-2"
              style={{ background: 'rgba(14,14,17,0.28)', backdropFilter: 'blur(8px)' }}
            >
              <div className="text-3xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)' }}>—</div>
              <div className="text-xs font-semibold opacity-80 mt-1">days to go</div>
            </div>
          </div>

          <div className="relative flex flex-col gap-1 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Calendar className="i i-sm" style={{ width: 14, height: 14 }} />
              <span>No upcoming visits yet</span>
            </div>
          </div>
        </div>

        {/* Booking CTA section */}
        <div className="rise-3">
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
            Book a visit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROGRAM_CARDS.map((card) => (
              <Link
                key={card.id}
                to={card.href}
                className="tap flex flex-col gap-4 p-5 rounded-2xl border"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow-xs)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 text-2xl">{card.icons.map((ic) => <span key={ic}>{ic}</span>)}</div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: card.tint, color: 'var(--foreground)' }}
                  >
                    {card.tag}
                  </span>
                </div>
                <div>
                  <div className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>{card.label}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{card.description}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: card.accent === 'var(--toad)' ? 'var(--brand-magenta)' : 'var(--primary)' }}>
                  Book now <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="rise-4 grid grid-cols-2 md:grid-cols-4 gap-3 pb-24 md:pb-6">
          {[
            { label: 'My Bookings', icon: BookOpen, href: '/bookings' },
            { label: 'Pre-visit Kit', icon: Package, href: '/kit' },
            { label: 'Profile', icon: User, href: '/profile' },
            { label: 'Sign out', icon: User, action: logout },
          ].map((item) => (
            item.action ? (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="tap flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href!}
                className="tap flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)', textDecoration: 'none' }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          ))}
        </div>
      </main>

      {/* Bottom tab bar (mobile / tablet) */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around py-3 border-t z-20"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
      >
        {[
          { label: 'Home', icon: Home, href: '/home', active: true },
          { label: 'Bookings', icon: BookOpen, href: '/bookings' },
          { label: 'Kit', icon: Package, href: '/kit' },
          { label: 'Profile', icon: User, href: '/profile' },
        ].map((tab) => (
          <Link
            key={tab.label}
            to={tab.href}
            className="flex flex-col items-center gap-1 px-3 py-1 tap"
            style={{
              color: tab.active ? 'var(--primary)' : 'var(--muted-foreground)',
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: tab.active ? 600 : 400,
            }}
          >
            <tab.icon style={{ width: 22, height: 22 }} />
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
