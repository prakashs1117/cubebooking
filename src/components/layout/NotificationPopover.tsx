import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Bell, CalendarCheck, Clock, Check } from 'lucide-react'

interface Notification {
  id: string
  type: 'reminder' | 'confirmed' | 'info'
  title: string
  body: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Visit in 7 days',
    body: 'Cube + Lab on Thu 15 Oct · 09:00–10:30',
    time: '2h ago',
    read: false,
  },
  {
    id: '2',
    type: 'confirmed',
    title: 'Booking confirmed',
    body: 'Your visit to Curiosity Lab is confirmed.',
    time: '3d ago',
    read: false,
  },
]

const TYPE_ICON: Record<Notification['type'], React.ElementType> = {
  reminder: Clock,
  confirmed: Check,
  info: CalendarCheck,
}

const TYPE_COLOR: Record<Notification['type'], string> = {
  reminder: 'var(--brand-yellow)',
  confirmed: 'var(--primary)',
  info: 'var(--brand-mint)',
}

export default function NotificationPopover() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="iconbtn tap relative" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
          <Bell className="i i-lg" />
          {unreadCount > 0 && (
            <span
              className="pulse absolute"
              style={{
                top: 10, right: 11,
                width: 9, height: 9,
                borderRadius: '9999px',
                background: 'var(--brand-magenta)',
                boxShadow: '0 0 0 2px var(--background)',
              }}
            />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-2xl border shadow-lg overflow-hidden"
          style={{
            background: 'var(--background)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-float)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium tap"
                style={{ color: 'var(--primary)' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                No notifications
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type]
                return (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 tap cursor-pointer"
                    style={{ background: n.read ? 'transparent' : 'var(--tint-purple)' }}
                    onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <span
                      className="flex-none grid place-items-center w-9 h-9 rounded-xl mt-0.5"
                      style={{ background: TYPE_COLOR[n.type] + '22' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: TYPE_COLOR[n.type] }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{n.title}</span>
                        <span className="text-xs flex-none" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                    </div>
                    {!n.read && (
                      <span className="flex-none w-2 h-2 rounded-full self-center" style={{ background: 'var(--brand-magenta)' }} />
                    )}
                  </div>
                )
              })
            )}
          </div>
          <Popover.Arrow style={{ fill: 'var(--border)' }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
