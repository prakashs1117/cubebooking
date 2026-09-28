import { Timestamp } from 'firebase/firestore'

export interface Question {
  id: string
  kind: 'multi' | 'single'
  q: string
  sub?: string
  opts: string[]
}

export interface SocialLink {
  id: string
  label: string
  handle: string
  href: string
  path: string
}

export interface Submission {
  id: string
  name?: string
  email?: string
  phone?: string
  city?: string
  note?: string
  answers?: Record<string, string | string[]>
  submittedAt?: Timestamp
}

export interface ContactForm {
  name: string
  phone: string
  email: string
  city: string
  note: string
}

export interface AdminUser {
  email?: string
}

export type Answers = Record<string, string | string[]>

export interface JIconProps {
  d: string
  size?: number
  color?: string
  sw?: number
}

export interface JPressProps {
  onClick?: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  disabled?: boolean
  scale?: number
}

export interface JInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon?: string
  type?: string
  multiline?: boolean
}

export interface BadgeProps {
  text: string
  color?: string
  textColor?: string
}

export interface ClubDetails {
  id?: string
  clubName: string
  clubNumber: string
  district: string
  division: string
  area: string
  charterDate: string
  meetingDay: string
  meetingTime: string
  meetingMode?: 'in-person' | 'online' | 'hybrid'
  meetingLink?: string
  calendarInviteLink?: string
  phone: string
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  membershipRestriction: string
  website?: string
  facebookPage?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type UserRole = 'guest' | 'member' | 'club member' | 'admin' | 'super admin'

/**
 * Firestore `users/{uid}` document. Only uid, email, roles and createdAt are
 * required — every profile field is optional so members can fill in as much
 * or as little as they like.
 */
export interface UserProfile {
  uid: string
  email: string
  roles: UserRole[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
  deletedAt?: Timestamp    // soft delete timestamp — null/undefined means active

  // identity
  displayName?: string
  photoURL?: string        // Cloudinary secure_url
  photoPublicId?: string   // Cloudinary public_id, needed to replace/delete
  photoVersion?: number    // Cloudinary asset version, used to bust caches

  // mirrors the contact fields ClubInterestPage already collects
  phone?: string
  city?: string
  note?: string
  dateOfBirth?: string     // ISO yyyy-mm-dd

  // Toastmasters details (field names mirror ClubDetails)
  clubName?: string
  clubNumber?: string
  memberSince?: string     // ISO yyyy-mm-dd
  pathway?: string
  level?: string
  rolesHeld?: string[]

  // bio + socials
  bio?: string
  linkedin?: string
  instagram?: string

  // awards won across meetings
  awardBadges?: AwardBadge[]
}

export interface AwardBadge {
  categoryId: string
  categoryLabel: string
  emoji: string
  meetingNo: string
  rosterId: string
  awardedAt: string // ISO date string
}

/** Editable subset of UserProfile — uid/email/roles are never client-writable. */
export type ProfileDraft = Omit<UserProfile, 'uid' | 'email' | 'roles' | 'createdAt' | 'updatedAt'>

export type RoleGroup = 'roleTakers' | 'tagl' | 'speakers' | 'evaluators' | 'tableTopics'

export interface MeetingDetails {
  club: string
  sub: string
  meetingNo: string
  theme: string
  wod: string
  pod: string
  date: string
  timing: string
  location: string
  meetingMode?: 'in-person' | 'online' | 'hybrid'
  meetingLink?: string
  calendarInviteUrl?: string
  logoURL?: string
  logoPublicId?: string
  logoVersion?: number
  updatedAt?: Timestamp
  rosterId?: string
  createdAt?: Timestamp
  createdBy?: string
}

export interface AttendanceDoc {
  uid: string
  displayName: string
  photoURL?: string
  status: 'attending' | 'not-attending'
  updatedAt: Timestamp
}

export interface VoteDoc {
  uid: string
  displayName?: string
  isGuest?: boolean
  [categoryId: string]: string | boolean | undefined | Timestamp | null
  updatedAt?: Timestamp
  submittedAt?: Timestamp | null
}

export interface RoleSlot {
  id: string
  group: RoleGroup
  role: string
  order: number
  name: string
  uid: string | null
  claimedAt?: Timestamp
  pathwaysLevel?: string   // e.g. "L1P2" — speakers only
  speechTopic?: string     // speaker's prepared speech topic
  pairIndex?: number       // links speaker ↔ evaluator by shared index
  rolePrefix?: string      // e.g. "TM", "DTM", "ACB" — shown before name on poster
}

export interface WordEntry {
  id: string
  field: 'wod' | 'pod' | 'theme'
  meaning: string
  example: string
  uid: string
  displayName: string
  createdAt?: Timestamp
}

// ─── Community Blog ───────────────────────────────────────────────────────────

export const REACTION_EMOJIS = ['👏', '🔥', '💡', '❤️', '😂', '🎉', '💪', '🤔'] as const
export type ReactionEmoji = typeof REACTION_EMOJIS[number]
export type PostType = 'blog' | 'word'
export type PostStatus = 'published' | 'pinned' | 'draft' | 'archived'

export interface CommunityPost {
  id: string
  type: PostType
  status: PostStatus

  uid: string
  displayName: string
  photoURL?: string

  title: string
  body: string
  tags: string[]

  imageURL?: string
  imagePublicId?: string
  imageVersion?: number

  // Word-post only
  word?: string
  wordMeaning?: string
  wordExample?: string
  wordPartOfSpeech?: string

  // Optional YouTube embed
  youtubeUrl?: string

  // Denormalised counts
  likeCount: number
  commentCount: number
  reactionCounts: Record<string, number>

  pinnedAt?: Timestamp
  featuredOrder?: number

  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface PostComment {
  id: string
  postId: string
  uid: string
  displayName: string
  photoURL?: string
  body: string
  parentId?: string
  likeCount: number
  createdAt: Timestamp
  updatedAt?: Timestamp
  deleted?: boolean
}

export interface PostReaction {
  uid: string
  displayName: string
  emoji: string
  createdAt: Timestamp
}

export interface Bookmark {
  postId: string
  savedAt: Timestamp
}

// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackEntry {
  id: string
  type: 'feedback' | 'suggestion' | 'bug' | 'other'
  message: string
  rating?: number          // 1-5 star rating, optional
  name?: string            // optional — user may stay anonymous
  email?: string
  uid?: string             // set if the user was signed in
  submittedAt?: Timestamp
}

export interface RoleClaimEvent {
  id: string
  uid: string
  displayName: string
  slotId: string
  group: RoleGroup
  role: string
  action: 'claim' | 'release'
  at: Timestamp
}

export interface SpeakerFeedback {
  id: string
  slotId: string
  slotGroup: RoleGroup
  speakerUid: string | null
  speakerName: string
  reviewerUid: string
  reviewerName: string
  rating: number        // 1–5
  comment: string
  submittedAt: Timestamp
}

export interface ContestDoc {
  title: string           // e.g. "Humorous Speech Contest"
  contestants: string[]   // ordered list of names
  frozen: boolean
  winner: string | null
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface ContestVoteDoc {
  vote: string            // contestant name
  displayName: string | null
  isGuest: boolean
  submittedAt?: Timestamp
}
