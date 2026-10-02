import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, CalendarCheck, Package, BarChart2, Truck, CalendarCog, LogOut, X,
} from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import MerckLogo from '../auth/MerckLogo'
import ThemeToggle from '../ui/ThemeToggle'

function isActive(href: string, path: string) {
  return path === href || (href !== '/home' && path.startsWith(href + '/'))
}

type NavItem =
  | { type: 'heading'; labelKey: string }
  | { type: 'link'; labelKey: string; href: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }

function useAdminNav(isAdmin: boolean): NavItem[] {
  // Coordinator sees: Home, Bookings, Kit, Impact, TOAD approvals
  // Admin sees all of those plus Calendar rules
  const base: NavItem[] = [
    { type: 'link', labelKey: 'nav.home',     href: '/home',     Icon: Home },
    { type: 'link', labelKey: 'nav.bookings', href: '/bookings', Icon: CalendarCheck },
    { type: 'link', labelKey: 'nav.kit',      href: '/kit',      Icon: Package },
    { type: 'heading', labelKey: 'nav.roleLabel.admin' },
    { type: 'link', labelKey: 'nav.impact',        href: '/admin',          Icon: BarChart2 },
    { type: 'link', labelKey: 'nav.toadApprovals', href: '/admin/toad',     Icon: Truck },
  ]
  if (isAdmin) {
    base.push({ type: 'link', labelKey: 'nav.calendarRules', href: '/admin/calendar', Icon: CalendarCog })
  }
  return base
}

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const { profile, isAdmin, isStaff, logout } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const intl = useIntl()

  // isCoordinator = isStaff but not admin
  const roleKey = isAdmin ? 'nav.roleLabel.admin' : 'nav.roleLabel.coordinator'
  const navItems = useAdminNav(isAdmin)

  const handleLogout = async () => {
    onClose?.()
    await logout()
    navigate('/signin', { replace: true })
  }

  if (!isStaff) return null

  return (
    <aside
      aria-label={intl.formatMessage({ id: 'nav.ariaNavigation' })}
      className="flex flex-col h-full"
      style={{
        width: 264,
        background: 'var(--background)',
        borderRight: '1px solid var(--border)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--foreground)',
      }}
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5 flex-none">
        <Link to="/programs" className="tap flex-none" style={{ textDecoration: 'none' }} onClick={onClose}>
          <MerckLogo width={59} height={28} />
        </Link>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div className="font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>
            Curiosity
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: roleKey })}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="iconbtn tap flex-none"
            aria-label={intl.formatMessage({ id: 'nav.closeMenu' })}
            style={{ width: 32, height: 32 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3.5 flex flex-col gap-0.5 pb-2">
        {navItems.map((item, i) => {
          if (item.type === 'heading') {
            return (
              <div
                key={i}
                className="px-2.5 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}
              >
                {intl.formatMessage({ id: item.labelKey })}
              </div>
            )
          }
          const active = isActive(item.href, location.pathname)
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 tap"
              style={{
                height: 42,
                padding: '0 12px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                background: active ? 'var(--tint-purple)' : 'transparent',
                color: 'var(--foreground)',
              }}
            >
              <item.Icon
                style={{ width: 18, height: 18, flexShrink: 0, color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)' }}
              />
              <span className="flex-1">{intl.formatMessage({ id: item.labelKey })}</span>
            </Link>
          )
        })}
      </nav>

      {/* User card + theme + sign out */}
      <div className="flex-none p-3.5 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2.5 p-3 rounded-2xl"
          style={{ background: 'var(--app-ground)', border: '1px solid var(--border)' }}
        >
          {/* Avatar initials */}
          <div
            className="flex-none w-8 h-8 rounded-full grid place-items-center text-xs font-bold"
            style={{ background: 'var(--tint-purple)', color: 'var(--brand-purple)' }}
          >
            {(profile?.displayName || profile?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{profile?.displayName || 'Admin'}</div>
            <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              {profile?.schoolName || profile?.email || ''}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="iconbtn tap flex-none"
            aria-label={intl.formatMessage({ id: 'nav.signOut' })}
            style={{ width: 32, height: 32, color: 'var(--muted-foreground)' }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        </div>
        <ThemeToggle variant="segmented" />
      </div>
    </aside>
  )
}
