import { getAnalytics, logEvent as firebaseLogEvent, setUserId, setUserProperties, isSupported } from 'firebase/analytics'
import app from '../firebase'

// Lazily resolved — analytics may not be supported in all environments
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null

async function getAnalyticsInstance() {
  if (analyticsInstance) return analyticsInstance
  const supported = await isSupported()
  if (!supported) return null
  analyticsInstance = getAnalytics(app)
  return analyticsInstance
}

// ─── Event catalogue ────────────────────────────────────────────────────────
// Every meaningful action in the app gets a typed entry here so call sites
// stay consistent and the Firebase console sees clean, queryable event names.

export type AnalyticsEvent =
  // Auth
  | { name: 'login';                params: { method: 'email' | 'google' } }
  | { name: 'sign_up';              params: { method: 'email' | 'google' } }
  | { name: 'logout';               params?: Record<string, never> }
  | { name: 'password_reset_sent';  params?: Record<string, never> }

  // Profile
  | { name: 'profile_saved';        params: { fields_filled: number } }
  | { name: 'photo_uploaded';       params?: Record<string, never> }
  | { name: 'photo_removed';        params?: Record<string, never> }

  // Roster
  | { name: 'roster_viewed';        params: { roster_id: string; meeting_no: string } }
  | { name: 'roster_created';       params: { roster_id: string; meeting_mode: string; speaker_count: number } }
  | { name: 'role_claimed';         params: { roster_id: string; role: string; group: string } }
  | { name: 'role_released';        params: { roster_id: string; role: string; group: string } }
  | { name: 'poster_downloaded';    params: { roster_id: string; meeting_no: string } }
  | { name: 'poster_shared';        params: { roster_id: string } }
  | { name: 'poster_previewed';     params: { roster_id: string } }

  // Attendance / RSVP
  | { name: 'rsvp_set';             params: { roster_id: string; status: 'attending' | 'not-attending' } }

  // Calendar & joining
  | { name: 'calendar_add_clicked'; params: { roster_id: string; source: 'list' | 'detail' } }
  | { name: 'join_meeting_clicked'; params: { roster_id: string; source: 'list' | 'detail' } }

  // Words (WOD / POD / Theme)
  | { name: 'word_detail_viewed';   params: { field: 'wod' | 'pod' | 'theme'; word: string; roster_id: string } }
  | { name: 'word_meaning_added';   params: { field: 'wod' | 'pod' | 'theme'; roster_id: string } }

  // Voting
  | { name: 'voting_page_opened';   params: { roster_id: string; meeting_no: string } }
  | { name: 'vote_cast';            params: { roster_id: string; category_id: string; nominee: string } }
  | { name: 'vote_removed';         params: { roster_id: string; category_id: string } }
  | { name: 'votes_submitted';      params: { roster_id: string; total_votes: number } }
  | { name: 'winner_declared';      params: { roster_id: string; category_id: string; winner: string; badge_awarded: boolean } }

  // Onboarding / interest form
  | { name: 'interest_form_started';  params?: Record<string, never> }
  | { name: 'interest_form_submitted'; params: { city?: string } }

  // Public poster share page
  | { name: 'share_page_viewed';    params: { roster_id: string } }

/** Fire a typed analytics event. Silently no-ops if analytics isn't supported. */
export async function track(event: AnalyticsEvent): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance()
    if (!analytics) return
    // Firebase's logEvent accepts (analytics, eventName, params?)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firebaseLogEvent(analytics, event.name as any, (event as any).params ?? {})
  } catch {
    // Never crash the app over an analytics failure
  }
}

/** Identify the signed-in user so events are grouped by person in the console. */
export async function identifyUser(uid: string, props?: {
  role?: string
  roles?: string
  display_name?: string
}): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance()
    if (!analytics) return
    setUserId(analytics, uid)
    if (props) setUserProperties(analytics, props)
  } catch { /* silent */ }
}

/** Clear identity on sign-out. */
export async function clearUser(): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance()
    if (!analytics) return
    setUserId(analytics, '')
  } catch { /* silent */ }
}
