import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Home, CalendarCheck, Package, User, Plus, X,
  Menu, LogOut, Shield, ChevronRight,
} from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import MerckLogo from '../auth/MerckLogo'
import NotificationPopover from './NotificationPopover'

const NAV_ITEMS = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Bookings', href: '/bookings', icon: CalendarCheck },
  { label: 'Pre-visit Kit', href: '/kit', icon: Package },
  { label: 'Profile', href: '/profile', icon: User },
]

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { profile, logout } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Purple header with user info */}
      <div
        className="relative overflow-hidden flex flex-col gap-3.5 px-5 pb-5 pt-14"
        style={{ background: 'var(--brand-purple)', color: '#ffffff' }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -50, top: -50 }} />
        <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '9999px', background: 'var(--brand-yellow)', right: 70, top: 70 }} />

        <div className="relative flex justify-between items-start">
          <MerckLogo width={48} height={23} />
          <button type="button" onClick={onClose} className="iconbtn tap" aria-label="Close menu" style={{ color: '#fff' }}>
            <X className="i" />
          </button>
        </div>

        <div className="relative flex flex-col gap-0.5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
            {(profile?.displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="text-base font-bold mt-2">{profile?.displayName || 'Teacher'}</div>
          <div className="text-xs opacity-70">{profile?.email}</div>
          {profile?.schoolId && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <Shield className="w-3 h-3" />
              School approved
            </div>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className="nav-item flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium tap"
                style={{
                  background: active ? 'var(--tint-purple)' : 'transparent',
                  color: active ? 'var(--brand-purple)' : 'var(--foreground)',
                  textDecoration: 'none',
                }}
              >
                <item.icon className="w-5 h-5 flex-none" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-3 h-px" style={{ background: 'var(--border)' }} />

        {/* Book CTA */}
        <Link
          to="/book"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold tap"
          style={{ background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}
        >
          <Plus className="w-5 h-5 flex-none" />
          Book a visit
        </Link>
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium tap"
          style={{ color: 'var(--destructive)' }}
        >
          <LogOut className="w-5 h-5 flex-none" />
          Sign out
        </button>
      </div>
    </div>
  )
}

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-72 shrink-0 border-r sticky top-0 h-screen overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
      >
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile/tablet sidebar — Radix Dialog used as drawer */}
      <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(14,14,17,0.5)', backdropFilter: 'blur(3px)', animation: 'lcFade .25s ease both' }}
          />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 w-[318px] max-w-[85vw] overflow-hidden focus:outline-none"
            style={{
              background: 'var(--background)',
              borderRadius: '0 28px 28px 0',
              boxShadow: '12px 0 40px -12px rgba(14,14,17,0.4)',
              animation: 'lcSlideIn .38s cubic-bezier(.2,.8,.2,1) both',
            }}
            aria-label="Navigation menu"
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header — shown on mobile/tablet, hidden on desktop (sidebar handles it) */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b"
          style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="iconbtn tap"
            aria-label="Open menu"
          >
            <Menu className="i i-lg" />
          </button>

          <MerckLogo width={48} height={23} />

          <NotificationPopover />
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Bottom tab bar — mobile only, hidden on desktop */}
        <BottomTabBar currentPath={location.pathname} />
      </div>
    </div>
  )
}

function BottomTabBar({ currentPath }: { currentPath: string }) {
  const tabs = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Bookings', href: '/bookings', icon: CalendarCheck },
    { label: 'Book', href: '/book', icon: Plus, fab: true },
    { label: 'Kit', href: '/kit', icon: Package },
    { label: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <nav
      className="lg:hidden sticky bottom-0 z-30 border-t"
      style={{
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Main navigation"
    >
      <div className="grid h-14" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}>
        {tabs.map((tab) => {
          const active = currentPath === tab.href || currentPath.startsWith(tab.href + '/')
          if (tab.fab) {
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className="flex items-center justify-center tap"
                aria-label="Book a visit"
                style={{ textDecoration: 'none' }}
              >
                <span
                  className="grid place-items-center w-14 h-9 rounded-full"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  <tab.icon className="w-5 h-5" />
                </span>
              </Link>
            )
          }
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 tap"
              style={{
                color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                textDecoration: 'none',
                fontSize: 11,
                fontWeight: active ? 600 : 400,
              }}
            >
              <span
                className="grid place-items-center w-13 h-8 rounded-full transition-colors"
                style={{ background: active ? 'var(--tint-purple)' : 'transparent', width: 52 }}
              >
                <tab.icon style={{ width: 22, height: 22 }} />
              </span>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
