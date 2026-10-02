import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, CalendarCheck, Package, User, Plus, X,
  LogOut, Shield, ChevronRight, QrCode,
} from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import MerckLogo from '../auth/MerckLogo'
import NotificationPopover from './NotificationPopover'
import ThemeToggle from '../ui/ThemeToggle'

// ─── Nav hook — returns translated items on each render ──────────────────────
function useNav() {
  const intl = useIntl()
  return [
    { label: intl.formatMessage({ id: 'nav.home' }),     href: '/home',     icon: Home },
    { label: intl.formatMessage({ id: 'nav.bookings' }), href: '/bookings', icon: CalendarCheck },
    { label: intl.formatMessage({ id: 'nav.kit' }),      href: '/kit',      icon: Package },
    { label: intl.formatMessage({ id: 'nav.profile' }),  href: '/profile',  icon: User },
  ]
}

function isActive(href: string, path: string) {
  return path === href || (href !== '/home' && path.startsWith(href + '/'))
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
export function MobileTopBar() {
  return (
    <header
      className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 border-b"
      style={{
        height: 52,
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <MerckLogo width={44} height={21} />
      <div className="flex items-center gap-1">
        <ThemeToggle variant="icon" />
        <NotificationPopover />
      </div>
    </header>
  )
}

// ─── Mobile bottom tab bar ────────────────────────────────────────────────────
export function MobileTabBar({ currentPath }: { currentPath: string }) {
  const intl = useIntl()
  const nav = useNav()
  const { isStaff } = useAuthContext()
  // Split nav into left 2 and right 2, with Book FAB in centre
  const left  = nav.slice(0, 2)   // Home, Bookings
  const right = nav.slice(2)      // Kit, Profile

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Main navigation"
    >
      <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', height: 58 }}>
        {/* Left tabs */}
        {left.map((item) => {
          const active = isActive(item.href, currentPath)
          return (
            <Link key={item.href} to={item.href}
              className="flex flex-col items-center justify-center gap-0.5 tap"
              style={{ textDecoration: 'none', color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)', fontSize: 10, fontWeight: active ? 600 : 400 }}
            >
              <span className="grid place-items-center rounded-full transition-all"
                style={{ width: 40, height: 28, background: active ? 'var(--tint-purple)' : 'transparent' }}>
                <item.icon style={{ width: 20, height: 20 }} />
              </span>
              {item.label}
            </Link>
          )
        })}

        {/* Centre: Scan for staff, Book FAB for teachers */}
        {isStaff ? (
          <Link to="/admin" aria-label={intl.formatMessage({ id: 'nav.scan' })}
            className="flex flex-col items-center justify-center gap-0.5 tap"
            style={{
              textDecoration: 'none',
              color: isActive('/admin', currentPath) ? 'var(--brand-purple)' : 'var(--muted-foreground)',
              fontSize: 10, fontWeight: isActive('/admin', currentPath) ? 600 : 400,
            }}
          >
            <span className="grid place-items-center rounded-full"
              style={{ width: 40, height: 28, background: isActive('/admin', currentPath) ? 'var(--tint-purple)' : 'transparent' }}>
              <QrCode style={{ width: 20, height: 20 }} />
            </span>
            {intl.formatMessage({ id: 'nav.scan' })}
          </Link>
        ) : (
          <Link to="/home?book=1" aria-label={intl.formatMessage({ id: 'nav.book' })}
            className="flex items-center justify-center tap"
            style={{ textDecoration: 'none' }}
          >
            <span className="grid place-items-center rounded-full shadow-lg tap"
              style={{ width: 48, height: 48, background: 'var(--primary)', color: '#fff', marginBottom: 6, boxShadow: '0 4px 14px rgba(20,155,95,0.4)' }}>
              <Plus style={{ width: 22, height: 22 }} />
            </span>
          </Link>
        )}

        {/* Right tabs */}
        {right.map((item) => {
          const active = isActive(item.href, currentPath)
          return (
            <Link key={item.href} to={item.href}
              className="flex flex-col items-center justify-center gap-0.5 tap"
              style={{ textDecoration: 'none', color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)', fontSize: 10, fontWeight: active ? 600 : 400 }}
            >
              <span className="grid place-items-center rounded-full transition-all"
                style={{ width: 40, height: 28, background: active ? 'var(--tint-purple)' : 'transparent' }}>
                <item.icon style={{ width: 20, height: 20 }} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Tablet top nav bar ───────────────────────────────────────────────────────
export function TabletTopNav({ onMenuOpen, showBookCta }: { onMenuOpen: () => void; showBookCta: boolean }) {
  const location = useLocation()
  const intl = useIntl()
  const nav = useNav()
  return (
    <header
      className="hidden md:flex lg:hidden sticky top-0 z-30 items-center border-b px-4"
      style={{
        height: 56,
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo / hamburger */}
      <button type="button" onClick={onMenuOpen} className="flex items-center gap-2.5 tap mr-4" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <MerckLogo width={44} height={21} />
      </button>

      {/* Tab links — hidden for staff (they use the sidebar instead) */}
      {showBookCta && (
        <nav className="flex items-center gap-1 flex-1">
          {nav.map((item) => {
            const active = isActive(item.href, location.pathname)
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm tap"
                style={{
                  textDecoration: 'none',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)',
                  background: active ? 'var(--tint-purple)' : 'transparent',
                }}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
      {!showBookCta && <div className="flex-1" />}

      {/* Right: optional Book CTA + theme toggle + notification */}
      <div className="flex items-center gap-2">
        {showBookCta && (
          <Link
            to="/home?book=1"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold tap"
            style={{ textDecoration: 'none', background: 'var(--primary)', color: '#fff' }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            {intl.formatMessage({ id: 'nav.bookShort' })}
          </Link>
        )}
        <ThemeToggle variant="icon" />
        <NotificationPopover />
      </div>
    </header>
  )
}

// ─── Teacher drawer content (renamed from Sidebar) ────────────────────────────
export function TeacherDrawerContent({ onClose }: { onClose: () => void }) {
  const { profile, logout } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const intl = useIntl()
  const nav = useNav()

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div
        className="relative overflow-hidden flex flex-col gap-4 px-5 pb-6 pt-12"
        style={{ background: 'var(--brand-purple)', color: '#fff', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -40, top: -40, opacity: 0.85 }} />
        <div style={{ position: 'absolute', width: 56, height: 56, borderRadius: '9999px', background: 'var(--brand-yellow)', right: 68, top: 72 }} />

        <div className="relative flex items-start justify-between">
          <MerckLogo width={52} height={25} />
          <button type="button" onClick={onClose} className="iconbtn tap" aria-label={intl.formatMessage({ id: 'nav.closeMenu' })} style={{ color: '#fff', marginRight: -8 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full grid place-items-center text-sm font-semibold flex-none"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            {(profile?.displayName || profile?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{profile?.displayName || 'Teacher'}</div>
            <div className="text-xs truncate opacity-60">{profile?.email}</div>
          </div>
        </div>

        {profile?.schoolId && (
          <div className="relative inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Shield style={{ width: 11, height: 11 }} />
            {intl.formatMessage({ id: 'nav.schoolApproved' })}
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5" style={{ background: 'var(--background)' }}>
        {nav.map((item) => {
          const active = isActive(item.href, location.pathname)
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium tap"
              style={{
                textDecoration: 'none',
                background: active ? 'var(--tint-purple)' : 'transparent',
                color: active ? 'var(--brand-purple)' : 'var(--foreground)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight style={{ width: 14, height: 14, opacity: 0.4 }} />}
            </Link>
          )
        })}

        <div className="h-px my-2" style={{ background: 'var(--border)' }} />

        <Link
          to="/home?book=1"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tap"
          style={{ textDecoration: 'none', background: 'var(--primary)', color: '#fff' }}
        >
          <Plus style={{ width: 18, height: 18, flexShrink: 0 }} />
          {intl.formatMessage({ id: 'nav.book' })}
        </Link>
      </nav>

      {/* Theme + Sign out */}
      <div className="p-3 border-t flex-none flex flex-col gap-1" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
        <ThemeToggle variant="segmented" />
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm tap mt-1"
          style={{ background: 'transparent', border: 'none', color: 'var(--destructive)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          {intl.formatMessage({ id: 'nav.signOut' })}
        </button>
      </div>
    </div>
  )
}
