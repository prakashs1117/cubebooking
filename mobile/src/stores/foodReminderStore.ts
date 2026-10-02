import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FoodReminderState {
  reminderTime: string | null;   // ISO string (Date serializes cleanly)
  notifeeId: string | null;
  isReminderActive: boolean;
  setReminder: (time: Date, notifeeId: string) => void;
  clearReminder: () => void;
}

export const useFoodReminderStore = create<FoodReminderState>()(
  persist(
    (set) => ({
      reminderTime: null,
      notifeeId: null,
      isReminderActive: false,

      setReminder: (time, notifeeId) =>
        set({
          reminderTime: time.toISOString(),
          notifeeId,
          isReminderActive: true,
        }),

      clearReminder: () =>
        set({
          reminderTime: null,
          notifeeId: null,
          isReminderActive: false,
        }),
    }),
    {
      name: 'food-reminder-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
