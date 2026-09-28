# Contest Poll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone contest voting poll (e.g. Humorous Speech Contest) to any meeting roster, separate from the regular awards poll, open to members and guests.

**Architecture:** A single Firestore doc `meetings/{rosterId}/contest` holds the contest config (title, contestants, frozen, winner). Votes live in `meetings/{rosterId}/contestVotes/{voterId}`. Three new components handle admin management (`AdminContestPanel`), voting (`ContestPollPage`), and the feed banner (`ContestBanner`). `MeetingPosterPage` gets a third admin tab; `CommunityFeedPage` renders the banner; `App.tsx` gets one new public route.

**Tech Stack:** React 18, TypeScript, Firebase Firestore (onSnapshot), React Router v6, Lucide icons, Framer Motion (already installed), inline styles (project convention)

**Spec:** `docs/superpowers/specs/2026-09-19-contest-poll-design.md`

## Global Constraints

- Inline styles only — no CSS modules, no Tailwind classes
- Brand colour: `#772432` (primary), `#F4F3F1` (page background), `#E6E2DE` (border)
- Font family: `Inter, system-ui, sans-serif`
- No new npm dependencies
- Public route `/roster/:rosterId/contest` — no auth required (guests can vote)
- One contest doc per meeting; one vote per voterId; votes locked after `submittedAt`
- Guest voterId format: `guest_<slugified-name>` (same as VotingPage)
- No badge awards for contest winners (separate from awardBadges system)
- No time-lock on contest polls — admin manually opens/closes

---

### Task 1: Firestore types + slugify helper

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces:
  - `ContestDoc` interface (used by Tasks 2, 3, 4)
  - `ContestVoteDoc` interface (used by Tasks 2, 3)
  - `slugifyName(name: string): string` exported from `src/types/index.ts` — NO, keep helpers out of types
  - Actually: add types to `src/types/index.ts`; `slugifyName` goes in Task 2 as a local utility

- [ ] **Step 1: Add ContestDoc and ContestVoteDoc to src/types/index.ts**

Open `src/types/index.ts` and append at the end of the file:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add ContestDoc and ContestVoteDoc types"
```

---

### Task 2: AdminContestPanel component

**Files:**
- Create: `src/components/roster/AdminContestPanel.tsx`

**Interfaces:**
- Consumes:
  - `ContestDoc` from `src/types/index.ts`
  - `useAttendingProfiles(rosterId)` → `{ attendingProfiles, loadingProfiles }` from `./useAttendingProfiles`
  - `AttendeeSelector` from `./AttendeeSelector` — props: `{ profiles, nominatedNames, onSelect, disabled }`
- Produces: `<AdminContestPanel rosterId={string} />` (used by Task 5)

- [ ] **Step 1: Create AdminContestPanel.tsx**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { db } from '../../firebase'
import {
  doc, onSnapshot, setDoc, updateDoc, getDoc,
  collection, getDocs, serverTimestamp,
} from 'firebase/firestore'
import { Plus, Trash2, Lock, LockOpen, Copy, Check, Award } from 'lucide-react'
import { useAttendingProfiles } from './useAttendingProfiles'
import { AttendeeSelector } from './AttendeeSelector'
import type { ContestDoc } from '../../types'
import type { AttendingProfile } from './useAttendingProfiles'

const CONTEST_TYPES = [
  'Humorous Speech Contest',
  'Table Topics Contest',
  'Evaluation Contest',
  'International Speech Contest',
]

function slugifyName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

interface Props {
  rosterId: string
}

export function AdminContestPanel({ rosterId }: Props) {
  const [contest, setContest] = useState<ContestDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState(CONTEST_TYPES[0])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [declaringWinner, setDeclaringWinner] = useState(false)
  const [togglingFreeze, setTogglingFreeze] = useState(false)
  const [copied, setCopied] = useState(false)
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})

  const { attendingProfiles, loadingProfiles } = useAttendingProfiles(rosterId)

  // Listen to contest doc
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'meetings', rosterId, 'contest', 'config'), snap => {
      setContest(snap.exists() ? (snap.data() as ContestDoc) : null)
      setLoading(false)
    })
    return unsub
  }, [rosterId])

  // Listen to vote counts (admin only)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'meetings', rosterId, 'contestVotes'), snap => {
      const counts: Record<string, number> = {}
      snap.docs.forEach(d => {
        const vote = d.data().vote as string | undefined
        if (vote) counts[vote] = (counts[vote] || 0) + 1
      })
      setVoteCounts(counts)
    })
    return unsub
  }, [rosterId])

  const contestRef = doc(db, 'meetings', rosterId, 'contest', 'config')

  const createContest = async () => {
    setCreating(true)
    try {
      await setDoc(contestRef, {
        title: selectedType,
        contestants: [],
        frozen: false,
        winner: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } finally {
      setCreating(false)
    }
  }

  const addContestantByName = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || !contest) return
    if (contest.contestants.includes(trimmed)) return
    const updated = [...contest.contestants, trimmed]
    await updateDoc(contestRef, { contestants: updated, updatedAt: serverTimestamp() })
  }, [contest, contestRef])

  const addContestantFromProfile = useCallback(async (profile: AttendingProfile) => {
    await addContestantByName(profile.displayName)
  }, [addContestantByName])

  const removeContestant = async (name: string) => {
    if (!contest) return
    const updated = contest.contestants.filter(c => c !== name)
    await updateDoc(contestRef, { contestants: updated, updatedAt: serverTimestamp() })
  }

  const toggleFreeze = async () => {
    if (!contest) return
    setTogglingFreeze(true)
    try {
      await updateDoc(contestRef, { frozen: !contest.frozen, updatedAt: serverTimestamp() })
    } finally {
      setTogglingFreeze(false)
    }
  }

  const declareWinner = async (name: string) => {
    setDeclaringWinner(true)
    try {
      await updateDoc(contestRef, { winner: name, updatedAt: serverTimestamp() })
    } finally {
      setDeclaringWinner(false)
    }
  }

  const copyLink = async () => {
    const url = `${window.location.origin}/roster/${rosterId}/contest`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return <div style={{ padding: '16px 0', fontSize: 12, color: '#9CA3AF' }}>Loading contest…</div>
  }

  // ── No contest yet ────────────────────────────────────────────────────────
  if (!contest) {
    return (
      <div style={{
        background: '#fff', border: '1.5px solid #E6E2DE', borderRadius: 12,
        padding: '16px 14px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>🎭 Contest Poll</div>
        <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 14 }}>
          Create a contest poll for this meeting. Members and guests can vote.
        </div>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 9,
            border: '1.5px solid #E6E2DE', fontSize: 12,
            fontFamily: 'inherit', marginBottom: 10, outline: 'none',
            background: '#fff', color: '#111827',
          }}
        >
          {CONTEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={createContest}
          disabled={creating}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 9,
            background: '#772432', color: '#fff', border: 'none',
            fontSize: 12, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer',
            opacity: creating ? 0.6 : 1, fontFamily: 'inherit',
          }}
        >
          {creating ? 'Creating…' : '+ Create Contest Poll'}
        </button>
      </div>
    )
  }

  // ── Contest exists ────────────────────────────────────────────────────────
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #E6E2DE', borderRadius: 12,
      padding: '14px 14px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>🎭 {contest.title}</div>
          <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1 }}>
            {contest.contestants.length} contestant{contest.contestants.length !== 1 ? 's' : ''}
            {totalVotes > 0 ? ` · ${totalVotes} vote${totalVotes !== 1 ? 's' : ''}` : ''}
          </div>
        </div>
        <button
          onClick={copyLink}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            border: '1.5px solid #E6E2DE', background: '#fff',
            color: copied ? '#166534' : '#6B7280', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      {/* Contestant list */}
      {contest.contestants.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
          {contest.contestants.map(name => {
            const count = voteCounts[name] || 0
            const isWinner = contest.winner === name
            return (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 9,
                background: isWinner ? '#FFFBEB' : '#F9FAFB',
                border: `1px solid ${isWinner ? '#F59E0B' : '#E6E2DE'}`,
              }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#111827' }}>
                  {isWinner && '🏅 '}{name}
                </span>
                {totalVotes > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#772432',
                    background: '#FFF5F6', padding: '2px 7px', borderRadius: 4,
                  }}>
                    {count}v
                  </span>
                )}
                {/* Declare winner button (only when frozen, no winner yet) */}
                {contest.frozen && !contest.winner && count > 0 && (
                  <button
                    onClick={() => declareWinner(name)}
                    disabled={declaringWinner}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: '#772432', color: '#fff', border: 'none',
                      cursor: declaringWinner ? 'not-allowed' : 'pointer',
                      opacity: declaringWinner ? 0.6 : 1, fontFamily: 'inherit',
                    }}
                  >
                    <Award size={10} /> Winner
                  </button>
                )}
                {/* Change winner button (when frozen + winner already declared but not this one) */}
                {contest.frozen && contest.winner && contest.winner !== name && (
                  <button
                    onClick={() => declareWinner(name)}
                    disabled={declaringWinner}
                    style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: 'none', color: '#9CA3AF',
                      border: '1px solid #E6E2DE',
                      cursor: declaringWinner ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Pick
                  </button>
                )}
                {/* Remove button (only when not frozen) */}
                {!contest.frozen && (
                  <button
                    onClick={() => removeContestant(name)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#EF4444', padding: 3, display: 'flex', flexShrink: 0,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add contestants (only when not frozen) */}
      {!contest.frozen && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Add from Attendees
          </div>
          <AttendeeSelector
            profiles={attendingProfiles}
            nominatedNames={contest.contestants}
            onSelect={addContestantFromProfile}
            disabled={loadingProfiles}
          />
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 6px' }}>
            Add by Name
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { addContestantByName(newName); setNewName('') } }}
              placeholder="Name"
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8,
                border: '1.5px solid #E6E2DE', fontSize: 12,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              onClick={() => { addContestantByName(newName); setNewName('') }}
              style={{
                background: '#772432', color: '#fff', border: 'none', borderRadius: 8,
                padding: '7px 11px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, flexShrink: 0,
                fontFamily: 'inherit',
              }}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      )}

      {/* Freeze toggle */}
      <button
        onClick={toggleFreeze}
        disabled={togglingFreeze}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 700,
          border: `1.5px solid ${contest.frozen ? '#6EE7B7' : '#FCA5A5'}`,
          background: contest.frozen ? '#D1FAE5' : '#FEF2F2',
          color: contest.frozen ? '#065F46' : '#991B1B',
          cursor: togglingFreeze ? 'not-allowed' : 'pointer',
          opacity: togglingFreeze ? 0.6 : 1, fontFamily: 'inherit',
        }}
      >
        {contest.frozen ? <LockOpen size={13} /> : <Lock size={13} />}
        {contest.frozen ? 'Re-open Voting' : 'Close Voting'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/roster/AdminContestPanel.tsx
git commit -m "feat: add AdminContestPanel for contest poll management"
```

---

### Task 3: ContestPollPage — public voting UI

**Files:**
- Create: `src/components/roster/ContestPollPage.tsx`

**Interfaces:**
- Consumes:
  - `ContestDoc`, `ContestVoteDoc` from `src/types/index.ts`
  - `GuestNamePrompt` from `./GuestNamePrompt` — props: `{ onSubmit: (name: string) => void }`
  - `AppHeader` from `../AppHeader` — props: `{ backTo, backLabel, title, subtitle }`
  - `useAuthContext()` → `{ user, isAdmin }` from `../../context/AuthContext`
  - `useParams<{ rosterId: string }>()` from `react-router-dom`
- Produces: `export default function ContestPollPage()` (used by Task 6 in App.tsx)

- [ ] **Step 1: Create ContestPollPage.tsx**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../firebase'
import {
  doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { CheckCircle2, Award } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { GuestNamePrompt } from './GuestNamePrompt'
import AppHeader from '../AppHeader'
import type { ContestDoc, ContestVoteDoc, MeetingDetails } from '../../types'

function slugifyName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Contestant card ───────────────────────────────────────────────────────────
function ContestantCard({
  name,
  isSelected,
  isWinner,
  count,
  showCount,
  canVote,
  busy,
  onVote,
}: {
  name: string
  isSelected: boolean
  isWinner: boolean
  count: number
  showCount: boolean
  canVote: boolean
  busy: boolean
  onVote: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
  const release = () => setPressed(false)

  return (
    <button
      onClick={() => canVote ? onVote() : undefined}
      onMouseDown={() => setPressed(true)}
      onMouseUp={release}
      onMouseLeave={release}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={release}
      disabled={!canVote || busy}
      style={{
        position: 'relative', width: '100%', textAlign: 'left', padding: '12px 14px',
        borderRadius: 12,
        cursor: !canVote ? 'default' : busy ? 'not-allowed' : 'pointer',
        border: `1.5px solid ${isWinner ? '#F59E0B' : isSelected ? '#772432' : '#E6E2DE'}`,
        background: isWinner ? '#FFFBEB' : isSelected ? '#FFF5F6' : '#fff',
        boxShadow: isSelected || isWinner ? '0 2px 8px rgba(119,36,50,0.14)' : 'none',
        transform: `scale(${pressed ? 0.97 : 1})`,
        transition: 'transform 0.12s ease, border-color 0.15s, background 0.15s',
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: !canVote && !isSelected && !isWinner ? 0.75 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${isWinner ? '#F59E0B' : isSelected ? '#772432' : '#D1D5DB'}`,
        background: isWinner ? '#F59E0B' : isSelected ? '#772432' : `hsl(${(name.charCodeAt(0) * 47) % 360}, 55%, 52%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 14,
      }}>
        {initials}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: isSelected || isWinner ? 700 : 600,
          color: isWinner ? '#92400E' : isSelected ? '#772432' : '#111827',
        }}>
          {name}{isWinner && ' 🏅'}
        </div>
        {showCount && count > 0 && (
          <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1 }}>
            {count} vote{count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Selected checkmark */}
      {isSelected && !isWinner && (
        <CheckCircle2 size={16} color="#772432" style={{ flexShrink: 0 }} />
      )}
    </button>
  )
}

// ── Vote receipt ──────────────────────────────────────────────────────────────
function VoteReceipt({ vote, contestTitle }: { vote: string; contestTitle: string }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px 80px' }}>
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        background: '#F0FDF4', border: '1px solid #6EE7B7',
        borderRadius: 14, marginBottom: 14,
      }}>
        <CheckCircle2 size={28} color="#10B981" style={{ margin: '0 auto 8px' }} />
        <div style={{ fontSize: 14, fontWeight: 800, color: '#065F46' }}>Vote submitted!</div>
        <div style={{ fontSize: 12, color: '#047857', marginTop: 4 }}>
          You voted for <strong>{vote}</strong>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{contestTitle}</div>
      </div>
      <div style={{ fontSize: 11, color: '#C4B5C4', textAlign: 'center' }}>
        Voting is now locked for you. Results will be announced by the admin.
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ContestPollPage() {
  const { rosterId } = useParams<{ rosterId: string }>()
  const { user, isAdmin } = useAuthContext()

  const [meeting, setMeeting] = useState<Partial<MeetingDetails>>({})
  const [contest, setContest] = useState<ContestDoc | null | undefined>(undefined) // undefined = loading
  const [myVote, setMyVote] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingVote, setPendingVote] = useState<string | null>(null)
  const [guestName, setGuestName] = useState<string | null>(() => localStorage.getItem('contestGuestName'))

  const voterId = user?.uid || (guestName ? `guest_${slugifyName(guestName)}` : null)

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId), snap => {
      if (snap.exists()) setMeeting(snap.data() as Partial<MeetingDetails>)
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId, 'contest', 'config'), snap => {
      setContest(snap.exists() ? (snap.data() as ContestDoc) : null)
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId || !voterId) return
    return onSnapshot(doc(db, 'meetings', rosterId, 'contestVotes', voterId), snap => {
      if (snap.exists()) {
        const data = snap.data() as ContestVoteDoc
        setMyVote(data.vote)
        if (data.submittedAt) setSubmitted(true)
      }
    })
  }, [rosterId, voterId])

  // Admin sees vote counts live
  useEffect(() => {
    if (!rosterId || !isAdmin) return
    const { collection: col, onSnapshot: ons } = require('firebase/firestore')
    return ons(col(db, 'meetings', rosterId, 'contestVotes'), (snap: any) => {
      const counts: Record<string, number> = {}
      snap.docs.forEach((d: any) => {
        const vote = d.data().vote as string | undefined
        if (vote) counts[vote] = (counts[vote] || 0) + 1
      })
      setVoteCounts(counts)
    })
  }, [rosterId, isAdmin])

  const handleGuestNameSubmit = useCallback((name: string) => {
    localStorage.setItem('contestGuestName', name)
    setGuestName(name)
  }, [])

  const selectVote = (name: string) => {
    if (!contest || contest.frozen || submitted) return
    setPendingVote(myVote === name ? null : name)
    setShowConfirm(true)
  }

  const confirmVote = async () => {
    if (!rosterId || !voterId || !pendingVote) return
    setSaving(true)
    try {
      const ref = doc(db, 'meetings', rosterId, 'contestVotes', voterId)
      const payload: ContestVoteDoc = {
        vote: pendingVote,
        displayName: user?.displayName || guestName || null,
        isGuest: !user,
        submittedAt: serverTimestamp() as any,
      }
      const existing = await getDoc(ref)
      if (existing.exists()) await updateDoc(ref, payload as any)
      else await setDoc(ref, payload)
      setMyVote(pendingVote)
      setSubmitted(true)
      setShowConfirm(false)
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setSaving(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (contest === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F3F1' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
      </div>
    )
  }

  const canVote = !!contest && !contest.frozen && !submitted

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 80 }}>
      <AppHeader
        backTo={`/roster/${rosterId}`}
        backLabel="Roster"
        title={contest ? `🎭 ${contest.title}` : '🎭 Contest Poll'}
        subtitle={meeting.meetingNo ? `#${meeting.meetingNo}${meeting.date ? ` · ${meeting.date}` : ''}` : undefined}
        right={
          submitted ? (
            <div style={{
              background: '#D1FAE5', color: '#065F46',
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckCircle2 size={11} /> Voted
            </div>
          ) : undefined
        }
      />

      {/* No contest set up */}
      {!contest && (
        <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No contest poll yet</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>The admin hasn't set up a contest poll for this meeting.</div>
        </div>
      )}

      {/* Vote receipt */}
      {contest && submitted && (
        <VoteReceipt vote={myVote!} contestTitle={contest.title} />
      )}

      {/* Voting UI */}
      {contest && !submitted && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 14px' }}>

          {/* Frozen banner */}
          {contest.frozen && (
            <div style={{
              background: contest.winner ? '#FFFBEB' : '#F9FAFB',
              border: `1px solid ${contest.winner ? '#FCD34D' : '#E5E7EB'}`,
              borderRadius: 12, padding: '12px 14px', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Award size={16} color={contest.winner ? '#92400E' : '#6B7280'} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: contest.winner ? '#92400E' : '#374151' }}>
                  {contest.winner ? `🏆 Winner: ${contest.winner}` : 'Voting is closed'}
                </div>
                {!contest.winner && (
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>Results coming soon.</div>
                )}
              </div>
            </div>
          )}

          {/* Guest name prompt */}
          {!contest.frozen && !user && !guestName && (
            <GuestNamePrompt onSubmit={handleGuestNameSubmit} />
          )}

          {/* Contestant cards */}
          {(contest.frozen || user || guestName) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contest.contestants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 12 }}>
                  No contestants added yet.
                </div>
              ) : (
                contest.contestants.map(name => (
                  <ContestantCard
                    key={name}
                    name={name}
                    isSelected={myVote === name}
                    isWinner={contest.winner === name}
                    count={voteCounts[name] || 0}
                    showCount={(isAdmin || contest.frozen) && totalVotes > 0}
                    canVote={canVote}
                    busy={saving}
                    onVote={() => selectVote(name)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && pendingVote && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            width: '100%', maxWidth: 480, padding: '20px 20px 32px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
              Confirm your vote
            </div>
            <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 14 }}>
              Once submitted, your vote is final and cannot be changed.
            </div>
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: '#F9FAFB', border: '1px solid #E6E2DE',
              fontSize: 13, fontWeight: 700, color: '#111827',
              marginBottom: 16,
            }}>
              🎭 {pendingVote}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={saving}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 11,
                  border: '1.5px solid #E6E2DE', background: '#fff',
                  fontSize: 13, fontWeight: 700, color: '#6B7280',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Go back
              </button>
              <button
                onClick={confirmVote}
                disabled={saving}
                style={{
                  flex: 2, padding: '11px 0', borderRadius: 11,
                  border: 'none', background: '#772432',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
                }}
              >
                {saving ? 'Submitting…' : 'Yes, submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

> **Note:** The `require('firebase/firestore')` pattern in the admin vote-count effect is wrong — fix it in Step 2 below.

- [ ] **Step 2: Fix the admin vote-count useEffect — replace the require() with a proper import**

The admin vote-count `useEffect` used `require()` which won't work in ESM. Replace the entire admin vote-count `useEffect` block with:

```typescript
useEffect(() => {
  if (!rosterId || !isAdmin) return
  const { collection } = await import('firebase/firestore')
  // Actually, do it inline without dynamic import:
}, [rosterId, isAdmin])
```

Actually the cleanest fix: add `collection` and `onSnapshot` to the existing top-level import from `'firebase/firestore'` (they're already imported), then rewrite the effect:

```typescript
// Replace the admin vote-count useEffect with:
useEffect(() => {
  if (!rosterId || !isAdmin) return
  return onSnapshot(collection(db, 'meetings', rosterId, 'contestVotes'), snap => {
    const counts: Record<string, number> = {}
    snap.docs.forEach(d => {
      const vote = d.data().vote as string | undefined
      if (vote) counts[vote] = (counts[vote] || 0) + 1
    })
    setVoteCounts(counts)
  })
}, [rosterId, isAdmin])
```

Also add `collection` to the import at the top:
```typescript
import {
  doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp, collection,
} from 'firebase/firestore'
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/roster/ContestPollPage.tsx
git commit -m "feat: add ContestPollPage voting UI"
```

---

### Task 4: ContestBanner — community feed banner

**Files:**
- Create: `src/components/roster/ContestBanner.tsx`

**Interfaces:**
- Consumes:
  - `ContestDoc` from `src/types/index.ts`
  - `isMeetingDay` logic — copy the same function from `VotingBanner.tsx:34-42` (same logic, same signature)
  - `useAuthContext()` → `{ user }` — banner only shown to logged-in users (same as VotingBanner)
- Produces: `export function ContestBanner()` (used by Task 7)

- [ ] **Step 1: Create ContestBanner.tsx**

```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import { parseMeetingEndDate } from '../../lib/calendarUrl'
import type { MeetingDetails } from '../../types'
import type { ContestDoc } from '../../types'
import type { Timestamp } from 'firebase/firestore'
import { Award, ChevronRight, Copy, Check } from 'lucide-react'

interface RosterDoc extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
}

function getMeetingStart(date: string, timing?: string): Date | null {
  if (!date) return null
  const startStr = timing ? timing.split(/[–—-]/)[0].trim() : undefined
  return parseMeetingEndDate(date, startStr ? `${startStr} – ${startStr}` : undefined)
}

function isMeetingDay(date: string, timing?: string): boolean {
  const start = getMeetingStart(date, timing)
  if (!start) return false
  const now = new Date()
  const endOfNextDay = new Date(start)
  endOfNextDay.setDate(endOfNextDay.getDate() + 1)
  endOfNextDay.setHours(23, 59, 59, 999)
  return now >= start && now <= endOfNextDay
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
        border: '1.5px solid #E6E2DE', background: '#fff',
        color: copied ? '#166534' : '#6B7280',
        cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
        fontFamily: 'inherit',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

export function ContestBanner() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [roster, setRoster] = useState<RosterDoc | null>(null)
  const [contest, setContest] = useState<ContestDoc | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Only show to logged-in users
  if (!user) return null

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const found = snap.docs
        .map(d => ({ rosterId: d.id, ...d.data() } as RosterDoc))
        .find(r => r.date && isMeetingDay(r.date, r.timing))
      setRoster(found ?? null)
      setLoaded(true)
    }, () => setLoaded(true))
    return unsub
  }, [])

  useEffect(() => {
    if (!roster) return
    return onSnapshot(
      doc(db, 'meetings', roster.rosterId, 'contest', 'config'),
      snap => setContest(snap.exists() ? (snap.data() as ContestDoc) : null)
    )
  }, [roster?.rosterId])

  if (!loaded || !roster || !contest || contest.contestants.length === 0) return null

  const voteUrl = `${window.location.origin}/roster/${roster.rosterId}/contest`

  type BannerState = 'open' | 'frozen-no-result' | 'frozen-result'
  const state: BannerState = !contest.frozen
    ? 'open'
    : contest.winner ? 'frozen-result' : 'frozen-no-result'

  const colors: Record<BannerState, { bg: string; border: string; accent: string; pill: string }> = {
    'open':             { bg: '#F0FDF4', border: '#6EE7B7', accent: '#065F46', pill: '#10B981' },
    'frozen-no-result': { bg: '#F9FAFB', border: '#E5E7EB', accent: '#374151', pill: '#6B7280' },
    'frozen-result':    { bg: '#FFFBEB', border: '#FCD34D', accent: '#92400E', pill: '#F59E0B' },
  }
  const c = colors[state]

  const label: Record<BannerState, string> = {
    'open':             '🗳 Contest voting is open',
    'frozen-no-result': '🔒 Contest voting closed',
    'frozen-result':    `🏆 Winner: ${contest.winner}`,
  }

  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 16, padding: '14px 16px', marginBottom: 16,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: c.pill, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Award size={17} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label[state]}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
            {contest.title}{roster.meetingNo ? ` · #${roster.meetingNo}` : ''}
          </div>
        </div>
        <CopyLink url={voteUrl} />
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate(`/roster/${roster.rosterId}/contest`)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          background: state === 'open' ? '#772432' : '#1A1519',
          color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Award size={14} />
        {state === 'open' ? 'Vote now' : 'View results'}
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/roster/ContestBanner.tsx
git commit -m "feat: add ContestBanner for community feed"
```

---

### Task 5: Wire AdminContestPanel into MeetingPosterPage

**Files:**
- Modify: `src/components/roster/MeetingPosterPage.tsx`

**Interfaces:**
- Consumes: `AdminContestPanel` from `./AdminContestPanel` — props: `{ rosterId: string }`
- The existing `AdminTab` type is `'controls' | 'roles'` — extend to `'controls' | 'roles' | 'contest'`

- [ ] **Step 1: Add import at the top of MeetingPosterPage.tsx**

Find the existing imports block. Add:
```typescript
import { AdminContestPanel } from './AdminContestPanel'
```

- [ ] **Step 2: Extend AdminTab type**

Find:
```typescript
type AdminTab = 'controls' | 'roles'
```
Replace with:
```typescript
type AdminTab = 'controls' | 'roles' | 'contest'
```

- [ ] **Step 3: Add Contest tab to TAB_DEFS**

Find:
```typescript
const TAB_DEFS: { key: AdminTab; label: string }[] = [
    { key: 'controls', label: 'Admin Controls' },
    { key: 'roles', label: 'Role Assignments' },
  ]
```
Replace with:
```typescript
const TAB_DEFS: { key: AdminTab; label: string }[] = [
    { key: 'controls', label: 'Admin Controls' },
    { key: 'roles', label: 'Role Assignments' },
    { key: 'contest', label: '🎭 Contest' },
  ]
```

- [ ] **Step 4: Add contest tab panel content**

Find the closing of the roles tab content — the `</>` after the `</RoleBoard>` block:
```typescript
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Role Assignments</div>
                  <RoleBoard
```
The full else branch ends with:
```typescript
                </>
              )}
```

Replace the entire `adminTab === 'controls' ? ... : ( <> ... </> )` ternary with a three-way check:

```typescript
              {adminTab === 'controls' ? (
                <AdminEditorPanel
                  meeting={meeting}
                  slots={slots}
                  rosterId={rosterId}
                  isSuperAdmin={isSuperAdmin}
                  users={clubUsers}
                  onUpdateMeeting={updateMeeting}
                  onAddSlot={addSlot}
                  onRemoveSlot={removeSlot}
                  onUpdateSlotName={updateSlotName}
                  onAdminOverride={adminOverrideSlot}
                  onAddSpeakerPair={addSpeakerWithEvaluator}
                  onUpdateSlotField={updateSlotField}
                  onResetForNewWeek={resetForNewWeek}
                />
              ) : adminTab === 'roles' ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Role Assignments</div>
                  <RoleBoard
                    slots={slots}
                    currentUid={user?.uid}
                    onClaim={claimSlot}
                    onRelease={releaseSlot}
                    isSuperAdmin={isSuperAdmin}
                    onAdminOverride={adminOverrideSlot}
                    users={clubUsers}
                  />
                </>
              ) : (
                <AdminContestPanel rosterId={rosterId} />
              )}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/roster/MeetingPosterPage.tsx
git commit -m "feat: add Contest tab to MeetingPosterPage admin panel"
```

---

### Task 6: Add public route in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ContestPollPage` from `./components/roster/ContestPollPage` — default export
- Route: `/roster/:rosterId/contest` — public, no auth wrapper (same as the existing `/roster/:rosterId/vote` route)

- [ ] **Step 1: Add import**

Find:
```typescript
import VotingPage from './components/roster/VotingPage'
```
Add below it:
```typescript
import ContestPollPage from './components/roster/ContestPollPage'
```

- [ ] **Step 2: Add route**

Find:
```typescript
      <Route path="/roster/:rosterId/vote" element={<VotingPage />} />
```
Add immediately after it:
```typescript
      <Route path="/roster/:rosterId/contest" element={<ContestPollPage />} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add public /roster/:rosterId/contest route"
```

---

### Task 7: Add ContestBanner to CommunityFeedPage

**Files:**
- Modify: `src/components/blog/CommunityFeedPage.tsx`

**Interfaces:**
- Consumes: `ContestBanner` from `../roster/ContestBanner`
- The existing `VotingBanner` import is already present — `ContestBanner` follows the same pattern

- [ ] **Step 1: Add import**

Find the existing imports in `CommunityFeedPage.tsx`. Add:
```typescript
import { VotingBanner } from '../roster/VotingBanner'
import { ContestBanner } from '../roster/ContestBanner'
```

> **Check first:** if `VotingBanner` is not yet imported in this file, add both. If it is already imported, add only `ContestBanner` on a new line.

- [ ] **Step 2: Render ContestBanner below VotingBanner**

Find where `VotingBanner` is rendered in the JSX. It will look like:
```typescript
<VotingBanner />
```

Replace it with:
```typescript
<VotingBanner />
<ContestBanner />
```

If `VotingBanner` is not yet in the JSX either, find the `{/* Featured pinned strip */}` comment and insert both banners just above it:
```typescript
        <VotingBanner />
        <ContestBanner />

        {/* Featured pinned strip */}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/blog/CommunityFeedPage.tsx
git commit -m "feat: show ContestBanner on community feed"
```

---

### Task 8: Manual smoke test

No automated tests exist in this project (no test runner configured). Verify the full flow manually.

- [ ] **Step 1: Start dev server**

```bash
cd /Users/M324550/Documents/POC/merck-toast/toaster && npm run dev
```

- [ ] **Step 2: Admin flow — create contest**

1. Sign in as admin
2. Open any meeting roster (`/roster/<id>`)
3. Click the **🎭 Contest** tab
4. Select "Humorous Speech Contest" → click "Create Contest Poll"
5. Use the attendee picker to add 2–3 contestants
6. Use the free-text input to add one more name (e.g. "Guest User")
7. Verify all names appear in the list with remove buttons
8. Click "Copy link" → paste in a new tab to confirm the URL is `/roster/<id>/contest`

- [ ] **Step 3: Member voting flow**

1. Open `/roster/<id>/contest` while signed in
2. Verify contestant cards appear
3. Tap a card → confirm dialog appears → click "Yes, submit"
4. Verify vote receipt shown, card is locked

- [ ] **Step 4: Guest voting flow**

1. Open `/roster/<id>/contest` in an incognito / signed-out browser
2. Verify "Before you vote" name prompt appears
3. Enter a name → click "Continue to vote"
4. Tap a contestant → confirm → verify receipt

- [ ] **Step 5: Admin close voting + declare winner**

1. Back in the admin 🎭 Contest tab — click "Close Voting"
2. Verify "Declare Winner" button appears next to vote counts
3. Click "Winner" on a contestant
4. Navigate to `/roster/<id>/contest` — verify winner is highlighted with 🏅

- [ ] **Step 6: Community feed banner**

1. Go to `/blog`
2. Verify `ContestBanner` appears below `VotingBanner` (or in its place if no VotingBanner)
3. Verify "Vote now" CTA navigates to contest poll page

- [ ] **Step 7: Final commit (if any lint/minor fixes applied during smoke test)**

```bash
git add -p
git commit -m "fix: contest poll smoke test fixes"
```
