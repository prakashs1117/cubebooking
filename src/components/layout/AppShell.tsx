import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { useAuthContext } from '../../context/AuthContext'

import DesktopTopBar from './DesktopTopBar'
import AdminSidebar from './AdminSidebar'
import { MobileTopBar, MobileTabBar, TabletTopNav, TeacherDrawerContent } from './AppShellMobile'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isStaff } = useAuthContext()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleBook = () => navigate('/home?book=1')

  if (isStaff) {
    // ── Staff shell ──────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen flex" style={{ background: 'var(--app-ground)' }}>

        {/* Desktop: persistent 264px sidebar */}
        <aside className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden"
          style={{ width: 264, borderRight: '1px solid var(--border)' }}
        >
          <AdminSidebar />
        </aside>

        {/* Tablet: Radix Dialog sheet — slide from left */}
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(14,14,17,0.45)', backdropFilter: 'blur(2px)', animation: 'lcFade .2s ease both' }}
            />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 lg:hidden overflow-hidden focus:outline-none"
              style={{
                width: 264,
                background: 'var(--background)',
                borderRadius: '0 24px 24px 0',
                boxShadow: '8px 0 32px -8px rgba(14,14,17,0.35)',
                animation: 'lcSlideIn .32s cubic-bezier(.2,.8,.2,1) both',
              }}
              aria-label="Navigation"
            >
              <AdminSidebar onClose={() => setDrawerOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <MobileTopBar />
          {/* Tablet top bar — has hamburger to open the sheet */}
          <TabletTopNav onMenuOpen={() => setDrawerOpen(true)} showBookCta={false} />

          {/* Page scroll area */}
          <div className="flex-1 pb-14 md:pb-0">
            {children}
          </div>
        </div>

        {/* Mobile bottom tab bar */}
        <MobileTabBar currentPath={location.pathname} />
      </div>
    )
  }

  // ── Teacher shell ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--app-ground)' }}>

      {/* Desktop: full-width top bar (hidden on mobile/tablet) */}
      <DesktopTopBar onBook={handleBook} />

      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Tablet top bar */}
      <TabletTopNav onMenuOpen={() => setDrawerOpen(true)} showBookCta />

      {/* Mobile drawer (teacher — same as today) */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(14,14,17,0.45)', backdropFilter: 'blur(2px)', animation: 'lcFade .2s ease both' }}
          />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] lg:hidden overflow-hidden focus:outline-none"
            style={{
              background: 'var(--background)',
              borderRadius: '0 24px 24px 0',
              boxShadow: '8px 0 32px -8px rgba(14,14,17,0.35)',
              animation: 'lcSlideIn .32s cubic-bezier(.2,.8,.2,1) both',
            }}
            aria-label="Navigation"
          >
            <TeacherDrawerContent onClose={() => setDrawerOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Page content */}
      <div className="flex-1 pb-14 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar currentPath={location.pathname} />
    </div>
  )
}
