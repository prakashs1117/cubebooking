import { Link, useLocation } from 'react-router-dom'
import { Home, CalendarCheck, Package, User, Plus, Search } from 'lucide-react'
import { useIntl } from 'react-intl'
import MerckLogo from '../auth/MerckLogo'
import NotificationPopover from './NotificationPopover'
import ThemeToggle from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { labelKey: 'nav.home',     href: '/home',     Icon: Home },
  { labelKey: 'nav.bookings', href: '/bookings', Icon: CalendarCheck },
  { labelKey: 'nav.kit',      href: '/kit',      Icon: Package },
  { labelKey: 'nav.profile',  href: '/profile',  Icon: User },
] as const

function isActive(href: string, path: string) {
  return path === href || (href !== '/home' && path.startsWith(href + '/'))
}

export default function DesktopTopBar({ onBook }: { onBook: () => void }) {
  const intl = useIntl()
  const location = useLocation()

  return (
    <header
      className="hidden lg:flex sticky top-0 z-30 items-center gap-2 border-b px-6"
      style={{
        height: 64,
        background: 'var(--background)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <Link to="/programs" className="flex items-center gap-3 mr-6 flex-none tap" style={{ textDecoration: 'none' }}>
        <MerckLogo width={44} height={21} />
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ labelKey, href, Icon }) => {
          const active = isActive(href, location.pathname)
          return (
            <Link
              key={href}
              to={href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm tap"
              style={{
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)',
                background: active ? 'var(--tint-purple)' : 'transparent',
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {intl.formatMessage({ id: labelKey })}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search — visual only in Phase 1; wired in a later phase */}
      <div
        role="search"
        className="hidden xl:flex items-center gap-2 px-3.5"
        style={{
          width: 260,
          height: 40,
          borderRadius: 12,
          border: '1px solid var(--input)',
          background: 'var(--background)',
          color: 'var(--muted-foreground)',
          cursor: 'text',
        }}
      >
        <Search style={{ width: 15, height: 15, flexShrink: 0 }} />
        <span className="text-sm">{intl.formatMessage({ id: 'desktop.topbar.search' })}</span>
      </div>

      {/* Book CTA */}
      <button
        type="button"
        onClick={onBook}
        className="flex items-center gap-2 px-4 text-sm font-semibold tap"
        style={{
          height: 40,
          borderRadius: 12,
          background: 'var(--primary)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
        {intl.formatMessage({ id: 'desktop.topbar.book' })}
      </button>

      <ThemeToggle variant="icon" />
      <NotificationPopover />
    </header>
  )
}
