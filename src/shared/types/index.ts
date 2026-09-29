import type { Timestamp } from 'firebase/firestore'

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export type UserRole = 'teacher' | 'coordinator' | 'admin' | 'volunteer'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole | null
  schoolId?: string
  schoolName?: string
  language: 'de' | 'en'
  agreedAt?: Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export interface FeedbackDoc {
  uid: string
  displayName: string
  schoolName?: string
  rating: number
  category: string
  message: string
  createdAt: Timestamp
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export type ProgramType = 'onsite' | 'outreach'
export type ProgramId = 'cube' | 'lab' | 'toad'

export interface Program {
  id: ProgramId
  name: string
  type: ProgramType
  sessionMinutes: number
  capacity: number
  openWeekdays: number[]       // 0=Sun … 6=Sat
  dailyStartTimes: string[]    // 'HH:MM'
  needsApproval: boolean
  serviceCities?: string[]
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export type SessionStatus = 'open' | 'full' | 'closed' | 'blackout'

export interface Session {
  id: string
  programId: ProgramId
  start: Timestamp
  end: Timestamp
  capacity: number
  seatsTaken: number
  seatsHeld: number
  status: SessionStatus
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingType = 'onsite' | 'toad'
export type BookingStatus =
  | 'pending'       // TOAD awaiting Merck approval
  | 'approved'      // TOAD approved by Merck
  | 'declined'      // TOAD declined
  | 'confirmed'     // onsite confirmed instantly
  | 'cancelled'

export interface BookingSegment {
  programId: ProgramId
  order: number               // 1 = first, 2 = second (Cube+Lab combo)
  date: string                // 'YYYY-MM-DD'
  startHour: number           // 0–23
}

export interface Booking {
  id: string
  type: BookingType
  schoolId: string
  teacherId: string
  teacherName: string
  teacherEmail: string
  segments: BookingSegment[]
  grade: string
  studentCount: number
  accessNeeds?: string
  truckParking?: string       // TOAD only
  status: BookingStatus
  declineReason?: string
  holdExpiresAt?: Timestamp   // set during checkout
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// ─── Schools ──────────────────────────────────────────────────────────────────

export type SchoolStatus = 'pending' | 'approved'

export interface School {
  id: string
  name: string
  address: string
  city: string
  status: SchoolStatus
  createdAt?: Timestamp
}

// ─── Admin Settings ───────────────────────────────────────────────────────────

export interface AppSettings {
  breakBetweenMinutes: number
  holdMinutes: number
  bookingWindowDays: number
}

export interface Blackout {
  id: string
  programIds: ProgramId[]
  from: Timestamp
  to: Timestamp
  reason?: string
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string
  who: string
  what: string
  before?: unknown
  after?: unknown
  when: Timestamp
}
