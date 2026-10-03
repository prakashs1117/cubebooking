import { create } from 'zustand'

export type NotificationType = 'confirmed' | 'reminder' | 'info' | 'error'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  time: Date
  read: boolean
  calendarUrl?: string
  bookingId?: string
}

interface NotificationState {
  notifications: AppNotification[]
  push: (n: Omit<AppNotification, 'id' | 'time' | 'read'> & { id?: string }) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  push: (n) =>
    set((s) => {
      const id = n.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`
      // Deduplicate: if a notification with this id already exists, skip
      if (s.notifications.some((x) => x.id === id)) return s
      return {
        notifications: [
          { ...n, id, time: new Date(), read: false },
          ...s.notifications,
        ].slice(0, 50),
      }
    }),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  clear: () => set({ notifications: [] }),
}))
