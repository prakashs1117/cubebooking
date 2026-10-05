// ============================================================================
// FluentEdge — Domain Type Skeletons
// ============================================================================
// Interface-only contracts shared by web + mobile. No implementation.
// Service factories (create*Service(apiClient)) that use these arrive with
// the feature phases (Phase 1+); Phase 0 only establishes the shapes.
// ============================================================================

import type { FEPillarId, FETierId } from '../design/constants';

/** Per-pillar score 0..100, keyed by pillar id. */
export type PillarScores = Record<FEPillarId, number>;

export interface Score {
  /** Overall confidence score 0..100. */
  overall: number;
  pillars: PillarScores;
  /** Assigned persona id (see FE_PERSONAS). */
  personaId?: string;
  createdAt: string;
}

export interface FEUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatarSeed?: string;
  /** Current subscription tier. */
  tier: FETierId;
  /** Trial end ISO date, if on a trial. */
  trialEndsAt?: string;
  createdAt: string;
}

export interface Streak {
  /** Current consecutive-day streak. */
  current: number;
  longest: number;
  /** ISO date of the last completed day. */
  lastActiveAt?: string;
}

export interface Recording {
  id: string;
  userId: string;
  sessionId?: string;
  /** Remote URL or local URI. */
  uri: string;
  durationSec: number;
  createdAt: string;
}

/** A completed speaking session (Daily Speak, practice drill, etc.). */
export interface SpeakSession {
  id: string;
  userId: string;
  kind: SpeakSessionKind;
  recording?: Recording;
  score?: Score;
  /** Coach notes returned by the AI scorecard. */
  coachNotes?: string[];
  durationSec: number;
  createdAt: string;
}

export type SpeakSessionKind =
  | 'daily-speak'
  | 'assessment'
  | 'rapid-response'
  | 'shadow'
  | 'framework'
  | 'voice-journal'
  | 'ai-partner'
  | 'room';

export interface Subscription {
  tier: FETierId;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  startedAt: string;
  renewsAt?: string;
  /** Store the receipt was validated against. */
  platform?: 'apple' | 'google' | 'stripe';
}
