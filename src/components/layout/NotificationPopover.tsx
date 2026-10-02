import { useState, useDebugValue, useSyncExternalStore } from 'react'
import * as Popover from '@radix-ui/react-popover'
import * as Dialog from '@radix-ui/react-dialog'
import { Bell, CalendarCheck, Clock, Check, AlertCircle, Info, CalendarPlus, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore, type NotificationType } from '../../stores/notificationStore'

// useSyncExternalStore is the correct hook for subscribing to external browser APIs
// (window.matchMedia). It avoids the useState+useEffect pattern which can cause
// a brief hydration mismatch on first render.
const mobileQuery = window.matchMedia('(max-width: 767px)')

function useIsMobile() {
  const isMobile = useSyncExternalStore(
    (cb) => {
      mobileQuery.addEventListener('change', cb)
      return () => mobileQuery.removeEventListener('change', cb)
    },
    () => mobileQuery.matches,
    () => false, // server snapshot
  )
  useDebugValue(isMobile, (v) => `useIsMobile: ${v ? 'mobile' : 'desktop'}`)
  return isMobile
}

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  confirmed: Check,
  reminder:  Clock,
  info:      Info,
  error:     AlertCircle,
}

const TYPE_COLOR: Record<NotificationType, string> = {
  confirmed: 'var(--primary)',
  reminder:  'var(--brand-yellow)',
  info:      'var(--brand-mint)',
  error:     'var(--destructive)',
}

const TYPE_BG: Record<NotificationType, string> = {
  confirmed: 'rgba(20,155,95,0.12)',
  reminder:  'rgba(255,200,50,0.18)',
  info:      'rgba(150,215,210,0.18)',
  error:     'rgba(231,0,11,0.08)',
}

// ─── Shared notification list content ────────────────────────────────────────

function NotificationList({ onClose }: { onClose?: () => void }) {
  const { notifications, markRead, markAllRead } = useNotificationStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Notifications{unread > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--brand-magenta)', color: '#fff' }}>
              {unread}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="text-xs font-medium tap" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Mark all read
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="iconbtn tap" style={{ width: 32, height: 32 }} aria-label="Close">
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'min(24rem, 60dvh)', scrollbarWidth: 'none' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <CalendarCheck className="w-8 h-8 opacity-20" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = TYPE_ICON[n.type]
            return (
              <div
                key={n.id}
                className="flex gap-3 px-4 py-3 border-b last:border-b-0 tap cursor-pointer"
                style={{
                  borderColor: 'var(--border)',
                  background: n.read ? 'transparent' : 'color-mix(in srgb, var(--brand-purple) 5%, var(--background))',
                }}
                onClick={() => markRead(n.id)}
              >
                <span className="flex-none grid place-items-center w-9 h-9 rounded-xl mt-0.5" style={{ background: TYPE_BG[n.type] }}>
                  <Icon className="w-4 h-4" style={{ color: TYPE_COLOR[n.type] }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>{n.title}</span>
                    <span className="text-xs flex-none" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDistanceToNow(n.time, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                  {n.calendarUrl && (
                    <a
                      href={n.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold tap"
                      style={{ color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      <CalendarPlus className="w-3 h-3" />
                      Add to calendar
                    </a>
                  )}
                </div>
                {!n.read && (
                  <span className="flex-none w-2 h-2 rounded-full self-center" style={{ background: 'var(--brand-magenta)' }} />
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function NotificationPopover() {
  const { notifications } = useNotificationStore()
  const unread = notifications.filter((n) => !n.read).length
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)

  const bellLabel = `Notifications${unread > 0 ? `, ${unread} unread` : ''}`
  const dot = unread > 0 && (
    <span
      className="pulse absolute"
      style={{ top: 9, right: 10, width: 9, height: 9, borderRadius: '9999px', background: 'var(--brand-magenta)', boxShadow: '0 0 0 2px var(--background)' }}
    />
  )

  const contentStyle = {
    background: 'var(--background)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow-float)',
    fontFamily: 'var(--font-sans)',
  }

  // ── Mobile: full-width Dialog sheet ──────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="iconbtn tap relative"
          aria-label={bellLabel}
        >
          <Bell style={{ width: 22, height: 22 }} />
          {dot}
        </button>

        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(14,14,17,0.4)', backdropFilter: 'blur(2px)' }}
            />
            <Dialog.Content
              className="fixed z-50 left-0 right-0 rounded-t-2xl border-t border-x overflow-hidden focus:outline-none"
              style={{ ...contentStyle, top: 52 }}
              aria-label="Notifications"
            >
              <NotificationList onClose={() => setMobileOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    )
  }

  // ── Desktop / tablet: standard Popover ───────────────────────────────────
  return (
    <Popover.Root>
      <Popover.Trigger
        className="iconbtn tap relative"
        aria-label={bellLabel}
      >
        <Bell style={{ width: 22, height: 22 }} />
        {dot}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          avoidCollisions
          collisionPadding={16}
          className="z-50 w-80 rounded-2xl border shadow-lg overflow-hidden focus:outline-none"
          style={contentStyle}
        >
          <NotificationList />
          <Popover.Arrow style={{ fill: 'var(--border)' }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
