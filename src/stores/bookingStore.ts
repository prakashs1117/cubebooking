import { create } from 'zustand'
import type { ProgramId } from '../shared/types'
import { dateToSlotKey } from '../config/slots'

export type VisitType = 'onsite' | 'toad'
export type ProgramSelection = 'cube' | 'lab' | 'both'
export type ProgramOrder = 'cube-first' | 'lab-first'

export interface SelectedSlot {
  programId: ProgramId
  date: string       // 'YYYY-MM-DD'
  startHour: number  // 0–23
  start: Date
  end: Date
}

export interface ClassDetails {
  grade: string
  studentCount: number
  accessNeeds: string
}

interface BookingState {
  // Step 1
  visitType: VisitType | null
  // Step 2
  programSelection: ProgramSelection | null
  programOrder: ProgramOrder
  // Step 3
  selectedDate: Date | null
  slots: SelectedSlot[]        // 1 slot for single program, 2 for both
  holdExpiresAt: Date | null   // 10-minute hold timer start
  // Step 4
  classDetails: ClassDetails
  // Optimistic cache: slot keys confirmed by this user in this session
  bookedSlotKeys: Set<string>

  // Actions
  setVisitType: (t: VisitType) => void
  setProgramSelection: (s: ProgramSelection) => void
  setProgramOrder: (o: ProgramOrder) => void
  setSelectedDate: (d: Date) => void
  setSlots: (slots: SelectedSlot[]) => void
  startHold: () => void
  setClassDetails: (d: Partial<ClassDetails>) => void
  /** Call before reset() after a successful booking to lock slots immediately. */
  confirmSlots: () => void
  reset: () => void
}

const DEFAULT_CLASS_DETAILS: ClassDetails = {
  grade: '4',
  studentCount: 25,
  accessNeeds: '',
}

export const useBookingStore = create<BookingState>((set, get) => ({
  visitType: null,
  programSelection: null,
  programOrder: 'cube-first',
  selectedDate: null,
  slots: [],
  holdExpiresAt: null,
  classDetails: DEFAULT_CLASS_DETAILS,
  bookedSlotKeys: new Set(),

  setVisitType: (visitType) => set({ visitType }),
  setProgramSelection: (programSelection) => set({ programSelection }),
  setProgramOrder: (programOrder) => set({ programOrder }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSlots: (slots) => set({ slots }),
  startHold: () => set({ holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000) }),
  setClassDetails: (patch) =>
    set((s) => ({ classDetails: { ...s.classDetails, ...patch } })),
  confirmSlots: () => {
    const { slots, bookedSlotKeys } = get()
    const next = new Set(bookedSlotKeys)
    for (const s of slots) next.add(dateToSlotKey(s.date, s.startHour))
    set({ bookedSlotKeys: next })
  },
  reset: () =>
    set({
      visitType: null,
      programSelection: null,
      programOrder: 'cube-first',
      selectedDate: null,
      slots: [],
      holdExpiresAt: null,
      classDetails: DEFAULT_CLASS_DETAILS,
    }),
}))
