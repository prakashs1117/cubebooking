import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../firebase'
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import type { MeetingDetails, RoleSlot } from '../../types'
import { ChevronDown, ChevronUp, CheckCircle2, Pencil, X, Plus, Trash2, Award, Lock, LockOpen, AlertCircle } from 'lucide-react'
import { track } from '../../lib/analytics'
import { AWARD_CATEGORIES } from '../../lib/awardCategories'
import AppHeader from '../AppHeader'
import { useAttendingProfiles } from './useAttendingProfiles'
import { AttendeeSelector } from './AttendeeSelector'
import { ShareResultsButton } from './ShareResultsCard'
import { GuestNamePrompt } from './GuestNamePrompt'
import { WinnersReveal } from './WinnersReveal'
import { parseMeetingEndDate } from '../../lib/calendarUrl'

function slugifyGuestName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getMeetingStartDate(date: string, timing?: string): Date | null {
  if (!date) return null
  const startTiming = timing ? timing.split(/[–—-]/)[0].trim() : undefined
  return parseMeetingEndDate(date, startTiming ? `${startTiming} – ${startTiming}` : undefined)
}

function getVotingUnlockTime(date: string, timing?: string): Date | null {
  const start = getMeetingStartDate(date, timing)
  if (!start) return null
  return new Date(start.getTime() + 45 * 60 * 1000)
}


function getNomineesFromSlots(cat: typeof AWARD_CATEGORIES[0], slots: RoleSlot[]): string[] {
  if (cat.manualOnly) return []
  return slots
    .filter(s => {
      if (!s.name?.trim()) return false
      if (!cat.slotGroups.includes(s.group)) return false
      if (cat.roleKeywords.length === 0) return true
      const roleLower = (s.role || '').toLowerCase()
      return cat.roleKeywords.some(kw => roleLower.includes(kw))
    })
    .map(s => s.name)
    .filter((name, i, arr) => arr.indexOf(name) === i)
}

interface ExtraNomineesMap { [categoryId: string]: string[] }
interface BlockedNomineesMap { [categoryId: string]: string[] }
interface VotesMap { [categoryId: string]: string }
interface CategoryVoteCounts { [nominee: string]: number }
interface AllVoteCounts { [categoryId: string]: CategoryVoteCounts }

const DEFAULT_MEETING: MeetingDetails = {
  club: '', sub: '', meetingNo: '', theme: '', wod: '', pod: '', date: '', timing: '', location: '',
}

interface NomineeCardProps {
  name: string
  isSelected: boolean
  isWinner: boolean
  isLeader: boolean
  prefixLabel: string | null
  roleLabel: string | undefined
  photoURL: string | undefined
  count: number
  showCount: boolean
  canVote: boolean
  busy: boolean
  onVote: () => void
}

function NomineeCard({ name, isSelected, isWinner, isLeader, prefixLabel, roleLabel, photoURL, count, showCount, canVote, busy, onVote }: NomineeCardProps) {
  const [pressed, setPressed] = useState(false)
  const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
  const accent = isWinner ? '#F59E0B' : isSelected ? '#772432' : '#D1D5DB'
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
        position: 'relative', width: '100%', textAlign: 'left', padding: '8px',
        borderRadius: 12,
        cursor: !canVote ? 'default' : busy ? 'not-allowed' : 'pointer',
        border: `1.5px solid ${isWinner ? '#F59E0B' : isSelected ? '#772432' : '#E6E2DE'}`,
        background: isWinner ? '#FFFBEB' : isSelected ? '#FFF5F6' : '#fff',
        boxShadow: isSelected || isWinner ? '0 2px 8px rgba(119,36,50,0.14)' : 'none',
        transform: `scale(${pressed ? 0.94 : 1})`,
        transition: 'transform 0.12s ease, border-color 0.15s, background 0.15s, box-shadow 0.15s',
        display: 'flex', flexDirection: 'column', gap: 4,
        opacity: !canVote && !isSelected && !isWinner ? 0.75 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {showCount && count > 0 && (
        <div style={{
          position: 'absolute', top: 6, right: 8,
          fontSize: 8, fontWeight: 500, color: isWinner ? '#92400E' : isSelected ? '#772432' : '#6B7280',
          background: isWinner ? '#FEF3C7' : isSelected ? '#FFF5F6' : '#F9FAFB',
          padding: '2px 6px', borderRadius: 4, minWidth: '20px', textAlign: 'center',
        }}>
          {count}
        </div>
      )}
      {(isLeader || roleLabel) && (
        <span style={{
          position: 'absolute', top: 5, left: 5, fontSize: 8, fontWeight: 800,
          padding: '1.5px 5px', borderRadius: 4,
          color: isLeader ? '#F59E0B' : '#6B7280',
          background: isLeader ? '#FEF3C7' : '#F3F4F6',
        }}>
          {isLeader ? 'LEADING' : roleLabel}
        </span>
      )}
      {prefixLabel && (
        <span style={{
          position: 'absolute', top: 5, right: 5, fontSize: 8, fontWeight: 800,
          padding: '1.5px 5px', borderRadius: 4,
          color: prefixLabel === 'Guest' ? '#92400E' : '#166534',
          background: prefixLabel === 'Guest' ? '#FEF3C7' : '#F0FDF4',
        }}>
          {prefixLabel}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${accent}`,
          background: isWinner ? '#F59E0B' : isSelected ? '#772432' : `hsl(${(name.charCodeAt(0) * 47) % 360}, 55%, 52%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 11, overflow: 'hidden',
        }}>
          {photoURL ? (
            <img
              src={photoURL}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { const img = e.currentTarget; img.style.display = 'none'; img.parentElement!.textContent = initials }}
            />
          ) : initials}
        </div>

        <div style={{
          flex: 1, minWidth: 0, height: 28,
          fontSize: 11.5, fontWeight: isSelected || isWinner ? 700 : 600,
          color: isWinner ? '#92400E' : isSelected ? '#772432' : '#111827',
          lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitBoxAlign: 'center', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {name}
          {isWinner && <span> 🏅</span>}
        </div>
      </div>
    </button>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({
  votes,
  missing,
  onConfirm,
  onCancel,
  saving,
}: {
  votes: VotesMap
  missing: string[]
  onConfirm: () => void
  onCancel: () => void
  saving: boolean
}) {
  const voted = AWARD_CATEGORIES.filter(c => votes[c.id])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 480,
        padding: '20px 20px 32px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
          Confirm your votes
        </div>
        <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 14 }}>
          Once submitted, your votes are final and cannot be changed.
        </div>

        {/* Selections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {voted.map(cat => (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 10,
              background: '#F9FAFB', border: '1px solid #E6E2DE',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{cat.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 }}>{cat.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginTop: 1 }}>{votes[cat.id]}</div>
              </div>
              <CheckCircle2 size={14} color="#10B981" />
            </div>
          ))}
        </div>

        {/* Missing categories warning */}
        {missing.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '8px 10px', borderRadius: 10,
            background: '#FEF3C7', border: '1px solid #FCD34D',
            marginBottom: 12,
          }}>
            <AlertCircle size={13} color="#92400E" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
              You haven't voted for: {missing.join(', ')}. You can still submit.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
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
            onClick={onConfirm}
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
  )
}

// ── Post-submit receipt ───────────────────────────────────────────────────────
function VoteReceipt({ votes, meeting }: { votes: VotesMap; meeting: MeetingDetails }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px 80px' }}>
      {/* Success header */}
      <div style={{
        textAlign: 'center', padding: '18px 16px 14px',
        background: '#F0FDF4', border: '1px solid #6EE7B7',
        borderRadius: 14, marginBottom: 14,
      }}>
        <CheckCircle2 size={28} color="#10B981" style={{ margin: '0 auto 6px' }} />
        <div style={{ fontSize: 14, fontWeight: 800, color: '#065F46' }}>Votes submitted!</div>
        <div style={{ fontSize: 11.5, color: '#047857', marginTop: 2 }}>
          {meeting.meetingNo ? `Meeting #${meeting.meetingNo}` : 'Your votes have been recorded.'}
        </div>
      </div>

      {/* Compact vote list */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Your selections
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {AWARD_CATEGORIES.map(cat => {
          const pick = votes[cat.id]
          return (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 10,
              background: pick ? '#fff' : '#F9FAFB',
              border: `1px solid ${pick ? '#E6E2DE' : '#F3F4F6'}`,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{cat.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: 0.3 }}>{cat.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: pick ? '#111827' : '#C4B5C4', marginTop: 1 }}>
                  {pick ?? 'Not voted'}
                </div>
              </div>
              {pick && <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }} />}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: '#C4B5C4', textAlign: 'center' }}>
        Voting is now locked for you. Results will be announced by the admin.
      </div>
    </div>
  )
}

export default function VotingPage() {
  const { rosterId } = useParams<{ rosterId: string }>()
  const { user, isAdmin } = useAuthContext()

  const [meeting, setMeeting] = useState<MeetingDetails>(DEFAULT_MEETING)
  const [slots, setSlots] = useState<RoleSlot[]>([])
  const [extraNominees, setExtraNominees] = useState<ExtraNomineesMap>({})
  const [blockedNominees, setBlockedNominees] = useState<BlockedNomineesMap>({})
  const [myVotes, setMyVotes] = useState<VotesMap>({})
  const [allVoteCounts, setAllVoteCounts] = useState<AllVoteCounts>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newNomineeName, setNewNomineeName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [declaringWinner, setDeclaringWinner] = useState<string | null>(null)
  const [declaredWinners, setDeclaredWinners] = useState<Record<string, string>>({})
  const [votingFrozen, setVotingFrozen] = useState(false)
  const [togglingFreeze, setTogglingFreeze] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [vw, setVw] = useState(window.innerWidth)
  const [guestName, setGuestName] = useState<string | null>(() => localStorage.getItem('votingGuestName'))

  useEffect(() => {
    const fn = () => setVw(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId, 'voting', 'status'), snap => {
      setVotingFrozen(snap.exists() ? (snap.data()?.frozen === true) : false)
    })
  }, [rosterId])

  const isMobile = vw < 640

  const { attendingProfiles, loadingProfiles } = useAttendingProfiles(rosterId ?? '')

  const guestNomineeNames = useMemo(() =>
    attendingProfiles.filter(p => p.isGuest).map(p => p.displayName).filter(Boolean),
    [attendingProfiles]
  )

  const profileByUid = useMemo(() => new Map(attendingProfiles.map(p => [p.uid, p])), [attendingProfiles])
  const profileByName = useMemo(() => new Map(attendingProfiles.map(p => [p.displayName, p])), [attendingProfiles])

  const voterId = user?.uid || (guestName ? `guest_${slugifyGuestName(guestName)}` : null)

  const handleGuestNameSubmit = useCallback((name: string) => {
    localStorage.setItem('votingGuestName', name)
    setGuestName(name)
  }, [])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId), snap => {
      if (snap.exists()) {
        const data = snap.data() as MeetingDetails
        setMeeting(s => ({ ...s, ...data }))
        track({ name: 'voting_page_opened', params: { roster_id: rosterId, meeting_no: data.meetingNo || '' } })
      }
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(collection(db, 'meetings', rosterId, 'roleSlots'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as RoleSlot))
      data.sort((a, b) => (a.order - b.order) || a.group.localeCompare(b.group))
      setSlots(data)
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId, 'voting', 'nominees'), snap => {
      setExtraNominees(snap.exists() ? (snap.data() as ExtraNomineesMap) : {})
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId, 'voting', 'blocked'), snap => {
      setBlockedNominees(snap.exists() ? (snap.data() as BlockedNomineesMap) : {})
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) return
    return onSnapshot(doc(db, 'meetings', rosterId, 'voting', 'winners'), snap => {
      setDeclaredWinners(snap.exists() ? (snap.data() as Record<string, string>) : {})
    })
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) return
    if (!voterId) {
      // Guest hasn't entered name yet; ready to show prompt
      setLoading(false)
      return
    }
    const unsubscribe = onSnapshot(doc(db, 'meetings', rosterId, 'votes', voterId), snap => {
      if (snap.exists()) {
        const data = snap.data()
        const votes: VotesMap = {}
        for (const cat of AWARD_CATEGORIES) {
          if (data[cat.id]) votes[cat.id] = data[cat.id]
        }
        setMyVotes(votes)
        // If they already have a final submittedAt, lock them in
        if (data.submittedAt) setSubmitted(true)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [rosterId, voterId])

  useEffect(() => {
    if (!rosterId || !isAdmin) return
    return onSnapshot(collection(db, 'meetings', rosterId, 'votes'), snap => {
      const counts: AllVoteCounts = {}
      for (const cat of AWARD_CATEGORIES) counts[cat.id] = {}
      snap.docs.forEach(d => {
        const data = d.data()
        for (const cat of AWARD_CATEGORIES) {
          if (data[cat.id]) {
            counts[cat.id][data[cat.id]] = (counts[cat.id][data[cat.id]] || 0) + 1
          }
        }
      })
      setAllVoteCounts(counts)
    })
  }, [rosterId, isAdmin])

  const getNominees = useCallback((cat: typeof AWARD_CATEGORIES[0]): string[] => {
    const fromSlots = getNomineesFromSlots(cat, slots)
    const extras = (extraNominees[cat.id] || []).filter(n => !fromSlots.includes(n))

    if (cat.id === 'bestRoleTaker') {
      const seen = new Set<string>()
      const merged: string[] = []
      for (const name of [...fromSlots, ...extras]) {
        if (name && !seen.has(name)) { seen.add(name); merged.push(name) }
      }
      return merged
    }

    if ((cat as any).guestNominees) {
      const blocked = new Set(blockedNominees[cat.id] || [])
      const seen = new Set<string>()
      const merged: string[] = []
      for (const name of [...fromSlots, ...guestNomineeNames, ...extras]) {
        if (name && !seen.has(name) && !blocked.has(name)) { seen.add(name); merged.push(name) }
      }
      return merged
    }

    return [...fromSlots, ...extras]
  }, [slots, extraNominees, blockedNominees, guestNomineeNames])

  // Categories that have at least one nominee and are not manualOnly
  const requiredCategories = useMemo(() =>
    AWARD_CATEGORIES.filter(cat => !cat.manualOnly && getNominees(cat).length > 0),
    [getNominees]
  )

  const missingCategories = useMemo(() =>
    requiredCategories.filter(cat => !myVotes[cat.id]).map(cat => cat.label),
    [requiredCategories, myVotes]
  )

  const handleVote = useCallback(async (categoryId: string, nominee: string) => {
    if (!rosterId || !voterId || submitted) return
    const newSelection = myVotes[categoryId] === nominee ? undefined : nominee
    const updated = { ...myVotes }
    if (newSelection) {
      updated[categoryId] = newSelection
      track({ name: 'vote_cast', params: { roster_id: rosterId, category_id: categoryId, nominee } })
    } else {
      delete updated[categoryId]
      track({ name: 'vote_removed', params: { roster_id: rosterId, category_id: categoryId } })
    }
    setMyVotes(updated)

    setSaving(categoryId)
    try {
      const ref = doc(db, 'meetings', rosterId, 'votes', voterId)
      const existing = await getDoc(ref)
      const basePayload = {
        [categoryId]: newSelection ?? null,
        uid: voterId,
        displayName: user?.displayName || guestName || null,
        isGuest: !user,
        updatedAt: serverTimestamp(),
      }
      if (existing.exists()) {
        await updateDoc(ref, basePayload)
      } else {
        await setDoc(ref, basePayload)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setSaving(null)
    }
  }, [myVotes, rosterId, voterId, submitted, user, guestName])

  const handleSubmitAll = async () => {
    if (!rosterId || !voterId) return
    setSaving('submit')
    try {
      const ref = doc(db, 'meetings', rosterId, 'votes', voterId)
      const existing = await getDoc(ref)
      const payload = {
        ...myVotes,
        uid: voterId,
        displayName: user?.displayName || guestName || null,
        isGuest: !user,
        submittedAt: serverTimestamp(),
      }
      if (existing.exists()) await updateDoc(ref, payload)
      else await setDoc(ref, payload)
      setSubmitted(true)
      setShowConfirm(false)
      track({ name: 'votes_submitted', params: { roster_id: rosterId, total_votes: Object.keys(myVotes).length } })
    } catch (err) {
      console.error('Submit failed:', err)
    } finally {
      setSaving(null)
    }
  }

  const saveBlockedNominees = async (categoryId: string, list: string[]) => {
    if (!rosterId) return
    const ref = doc(db, 'meetings', rosterId, 'voting', 'blocked')
    const existing = await getDoc(ref)
    if (existing.exists()) await updateDoc(ref, { [categoryId]: list, updatedAt: serverTimestamp() })
    else await setDoc(ref, { [categoryId]: list, updatedAt: serverTimestamp() })
  }

  const blockNominee = async (categoryId: string, name: string) => {
    const updated = [...new Set([...(blockedNominees[categoryId] || []), name])]
    setBlockedNominees(prev => ({ ...prev, [categoryId]: updated }))
    await saveBlockedNominees(categoryId, updated)
  }

  const saveExtraNominees = async (categoryId: string, list: string[]) => {
    if (!rosterId) return
    const ref = doc(db, 'meetings', rosterId, 'voting', 'nominees')
    const existing = await getDoc(ref)
    if (existing.exists()) {
      await updateDoc(ref, { [categoryId]: list, updatedAt: serverTimestamp() })
    } else {
      await setDoc(ref, { [categoryId]: list, updatedAt: serverTimestamp() })
    }
  }

  const addExtraNomineeByName = useCallback(async (categoryId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const cat = AWARD_CATEGORIES.find(c => c.id === categoryId)!
    const allExisting = getNominees(cat)
    if (allExisting.includes(trimmed)) return
    const updated = [...(extraNominees[categoryId] || []), trimmed]
    setExtraNominees(prev => ({ ...prev, [categoryId]: updated }))
    await saveExtraNominees(categoryId, updated)
  }, [extraNominees, getNominees])

  const addExtraNominee = async (categoryId: string) => {
    const name = newNomineeName.trim()
    if (!name) return
    await addExtraNomineeByName(categoryId, name)
    setNewNomineeName('')
  }

  const removeExtraNominee = async (categoryId: string, name: string) => {
    const updated = (extraNominees[categoryId] || []).filter(n => n !== name)
    setExtraNominees(prev => ({ ...prev, [categoryId]: updated }))
    await saveExtraNominees(categoryId, updated)
  }

  const declareWinner = async (cat: typeof AWARD_CATEGORIES[0], winnerName: string) => {
    if (!rosterId) return
    setDeclaringWinner(cat.id)
    try {
      const winnersRef = doc(db, 'meetings', rosterId, 'voting', 'winners')
      const existing = await getDoc(winnersRef)
      if (existing.exists()) {
        await updateDoc(winnersRef, { [cat.id]: winnerName, updatedAt: serverTimestamp() })
      } else {
        await setDoc(winnersRef, { [cat.id]: winnerName, updatedAt: serverTimestamp() })
      }

      const usersSnap = await getDocs(query(collection(db, 'users'), where('displayName', '==', winnerName)))
      const badgeAwarded = !usersSnap.empty
      if (badgeAwarded) {
        const userRef = usersSnap.docs[0].ref
        await updateDoc(userRef, {
          awardBadges: arrayUnion({
            categoryId: cat.id,
            categoryLabel: cat.label,
            emoji: cat.emoji,
            meetingNo: meeting.meetingNo || '',
            rosterId,
            awardedAt: new Date().toISOString(),
          }),
          updatedAt: serverTimestamp(),
        })
      }
      track({ name: 'winner_declared', params: { roster_id: rosterId, category_id: cat.id, winner: winnerName, badge_awarded: badgeAwarded } })
    } catch (err) {
      console.error('Declare winner failed:', err)
    } finally {
      setDeclaringWinner(null)
    }
  }

  const toggleExpand = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const toggleFreeze = async () => {
    if (!rosterId) return
    setTogglingFreeze(true)
    try {
      const ref = doc(db, 'meetings', rosterId, 'voting', 'status')
      const snap = await getDoc(ref)
      const next = !votingFrozen
      if (snap.exists()) await updateDoc(ref, { frozen: next, updatedAt: serverTimestamp() })
      else await setDoc(ref, { frozen: next, updatedAt: serverTimestamp() })
    } finally {
      setTogglingFreeze(false)
    }
  }

  const unlockTime = getMeetingStartDate(meeting.date, meeting.timing)
    ? getVotingUnlockTime(meeting.date, meeting.timing)
    : null
  const timeLocked = unlockTime ? now < unlockTime : false
  const minutesUntilOpen = unlockTime
    ? Math.max(0, Math.ceil((unlockTime.getTime() - now.getTime()) / 60_000))
    : 0

  const canVote = !timeLocked && !votingFrozen && !submitted

  const totalVoted = Object.keys(myVotes).length
  const totalCategories = AWARD_CATEGORIES.length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F3F1' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 80 }}>
      <AppHeader
        backTo={`/roster/${rosterId}`}
        backLabel="Roster"
        title="🏆 Meeting Awards"
        subtitle={meeting.meetingNo ? `#${meeting.meetingNo}${meeting.date ? ` · ${meeting.date}` : ''}` : undefined}
        right={
          !submitted ? (
            <div style={{
              background: totalVoted === totalCategories ? '#D1FAE5' : '#FEF3C7',
              color: totalVoted === totalCategories ? '#065F46' : '#92400E',
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            }}>
              {totalVoted}/{totalCategories} voted
            </div>
          ) : (
            <div style={{
              background: '#D1FAE5', color: '#065F46',
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckCircle2 size={11} /> Submitted
            </div>
          )
        }
      />

      {/* ── Submitted receipt ── */}
      {submitted && (
        <VoteReceipt votes={myVotes} meeting={meeting} />
      )}

      {!submitted && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '12px 10px' : '16px 16px' }}>

          {/* ── Frozen & Winners Reveal (For Everyone) ── */}
          {votingFrozen && !timeLocked && Object.keys(declaredWinners).length > 0 && (
            <WinnersReveal
              winners={declaredWinners}
              profileByName={profileByName as any}
              isMobile={isMobile}
            />
          )}

          {/* ── Time-lock banner ── */}
          {timeLocked && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12,
              padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Lock size={16} color="#92400E" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Voting opens soon</div>
                <div style={{ fontSize: 11, color: '#B45309', marginTop: 1 }}>
                  Opens {minutesUntilOpen > 0 ? `in ${minutesUntilOpen} min` : 'shortly'} — halfway into the meeting.
                </div>
              </div>
            </div>
          )}

          {/* ── Frozen banner ── */}
          {votingFrozen && !timeLocked && (
            <div style={{
              background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 12,
              padding: '12px 14px', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Lock size={16} color="#6B7280" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Voting is closed</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>Results shown below.</div>
              </div>
              {(Object.keys(declaredWinners).length > 0 || isAdmin) && (
                <ShareResultsButton
                  winners={Object.keys(declaredWinners).length > 0 ? declaredWinners : {
                    bestTableTopicSpeaker: 'Test Winner 1',
                    bestSpeaker: 'Test Winner 2',
                    bestEvaluator: 'Test Winner 3',
                  }}
                  meetingNo={meeting.meetingNo || 'Demo'}
                  date={meeting.date || new Date().toLocaleDateString()}
                  clubName={meeting.club || undefined}
                  voteUrl={`${window.location.origin}/roster/${rosterId}/vote`}
                />
              )}
            </div>
          )}

          {/* ── Admin freeze toggle ── */}
          {isAdmin && !timeLocked && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button
                onClick={toggleFreeze}
                disabled={togglingFreeze}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${votingFrozen ? '#6EE7B7' : '#FCA5A5'}`,
                  background: votingFrozen ? '#D1FAE5' : '#FEF2F2',
                  color: votingFrozen ? '#065F46' : '#991B1B',
                  cursor: togglingFreeze ? 'not-allowed' : 'pointer',
                  opacity: togglingFreeze ? 0.6 : 1, transition: 'all 0.2s',
                }}
              >
                {votingFrozen ? <LockOpen size={12} /> : <Lock size={12} />}
                {votingFrozen ? 'Re-open voting' : 'Close voting'}
              </button>
            </div>
          )}

          {/* ── Guest name prompt ── */}
          {!votingFrozen && !user && !guestName && (
            <GuestNamePrompt onSubmit={handleGuestNameSubmit} />
          )}

          {/* ── Voting categories ── */}
          {(!votingFrozen && (user || guestName)) || votingFrozen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AWARD_CATEGORIES.map(cat => {
              const catNominees = getNominees(cat)
              const fromSlots = getNomineesFromSlots(cat, slots)
              const extras = extraNominees[cat.id] || []
              const myVote = myVotes[cat.id]
              const isOpen = expanded[cat.id] !== false
              const voteCounts = allVoteCounts[cat.id] || {}
              const totalVotesForCat = Object.values(voteCounts).reduce((a, b) => a + b, 0)
              const isEditing = editingCategory === cat.id
              const declaredWinner = declaredWinners[cat.id]

              const leader = totalVotesForCat > 0
                ? Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
                : null

              const hasNominees = catNominees.length > 0
              const isRequired = !cat.manualOnly && hasNominees
              const isMissing = isRequired && !myVote && canVote

              return (
                <div key={cat.id} style={{
                  background: '#fff',
                  border: `1.5px solid ${declaredWinner ? '#F59E0B' : myVote ? '#772432' : isMissing ? '#FCA5A5' : '#E6E2DE'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {/* Winner banner */}
                  {declaredWinner && (
                    <div style={{
                      background: 'linear-gradient(90deg, #FEF3C7, #FDE68A)',
                      padding: '6px 14px',
                      display: 'flex', alignItems: 'center', gap: 8,
                      borderBottom: '1px solid #F59E0B',
                    }}>
                      <span style={{ fontSize: 14 }}>🏅</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Winner: {declaredWinner}</span>
                    </div>
                  )}

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', width: '100%' }}>
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      style={{
                        flex: 1, padding: 0,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{cat.label}</div>
                        {myVote ? (
                          <div style={{ fontSize: 10.5, color: '#772432', fontWeight: 600, marginTop: 1 }}>✓ {myVote}</div>
                        ) : (
                          <div style={{ fontSize: 10.5, color: isMissing ? '#EF4444' : '#9CA3AF', marginTop: 1 }}>
                            {catNominees.length === 0 ? 'No nominees yet' : isMissing ? 'Not voted yet' : `${catNominees.length} nominee${catNominees.length !== 1 ? 's' : ''}`}
                          </div>
                        )}
                      </div>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={e => { e.stopPropagation(); setEditingCategory(isEditing ? null : cat.id); setNewNomineeName('') }}
                        style={{
                          background: isEditing ? '#772432' : '#F3F0EE', border: 'none', borderRadius: 6,
                          padding: '4px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                          fontSize: 10, fontWeight: 700, color: isEditing ? '#fff' : '#6B6470', flexShrink: 0,
                        }}
                      >
                        {isEditing ? <><X size={10} /> Done</> : <><Pencil size={10} /> Edit</>}
                      </button>
                    )}
                    {isOpen
                      ? <ChevronUp size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
                      : <ChevronDown size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />}
                  </div>

                  {(isOpen || isEditing) && (
                    <div style={{ borderTop: '1px solid #F3F4F6', padding: '10px 14px 14px' }}>

                      {/* Admin edit panel */}
                      {isEditing && (
                        <div style={{ marginBottom: 12 }}>
                          {!cat.manualOnly && fromSlots.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                                From Roster
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {fromSlots.map(name => (
                                  <div key={name} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '3px 9px', borderRadius: 20,
                                    background: '#F0FDF4', border: '1px solid #6EE7B7',
                                    fontSize: 11, fontWeight: 600, color: '#065F46',
                                  }}>
                                    <span style={{ fontSize: 8 }}>●</span> {name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {cat.id === 'bestTableTopicSpeaker' && getNominees(cat).filter(n => guestNomineeNames.includes(n)).length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                                From Guests
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {getNominees(cat).filter(n => guestNomineeNames.includes(n)).map(name => (
                                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E6E2DE' }}>
                                    <span style={{ flex: 1, fontSize: 12, color: '#111827', fontWeight: 500 }}>{name}</span>
                                    <button
                                      onClick={() => blockNominee(cat.id, name)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 3, display: 'flex' }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(cat.id === 'bestRoleTaker' || cat.id === 'bestTableTopicSpeaker') && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                                Add Attending Member
                              </div>
                              <AttendeeSelector
                                profiles={attendingProfiles}
                                nominatedNames={getNominees(cat)}
                                onSelect={profile => addExtraNomineeByName(cat.id, profile.displayName)}
                                disabled={loadingProfiles}
                              />
                            </div>
                          )}

                          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                            {cat.manualOnly ? 'Add Nominee' : cat.id === 'bestRoleTaker' ? 'Add by Name' : 'Add Extra Nominee'}
                          </div>
                          <div style={{ display: 'flex', gap: 7, marginBottom: extras.length > 0 ? 6 : 0 }}>
                            <input
                              value={newNomineeName}
                              onChange={e => setNewNomineeName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') addExtraNominee(cat.id) }}
                              placeholder="Name"
                              style={{
                                flex: 1, padding: '7px 10px', borderRadius: 8,
                                border: '1.5px solid #E6E2DE', fontSize: 12,
                                fontFamily: 'inherit', outline: 'none',
                              }}
                            />
                            <button
                              onClick={() => addExtraNominee(cat.id)}
                              style={{
                                background: '#772432', color: '#fff', border: 'none', borderRadius: 8,
                                padding: '7px 11px', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, flexShrink: 0,
                              }}
                            >
                              <Plus size={12} /> Add
                            </button>
                          </div>
                          {extras.map(name => (
                            <div key={name} style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                              background: '#F9FAFB', borderRadius: 8, border: '1px solid #E6E2DE', marginTop: 5,
                            }}>
                              <span style={{ flex: 1, fontSize: 12, color: '#111827', fontWeight: 500 }}>{name}</span>
                              {voteCounts[name] !== undefined && voteCounts[name] > 0 && (
                                <span style={{ fontSize: 10, color: '#772432', fontWeight: 700 }}>
                                  {voteCounts[name]}v
                                </span>
                              )}
                              <button
                                onClick={() => removeExtraNominee(cat.id, name)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 3, display: 'flex' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Voting options */}
                      {!isEditing && (
                        catNominees.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '12px 0', color: '#9CA3AF', fontSize: 11 }}>
                            {isAdmin
                              ? cat.manualOnly
                                ? 'Click Edit to add the nominee name.'
                                : 'Nominees pulled from assigned roles. Click Edit to add more.'
                              : 'Nominees will be announced soon.'}
                          </div>
                        ) : (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: 5,
                          }}>
                            {catNominees.map(name => {
                              const isSelected = myVote === name
                              const count = voteCounts[name] || 0
                              const isFromSlot = fromSlots.includes(name)
                              const isWinner = declaredWinner === name
                              const isLeader = leader === name && !declaredWinner && isAdmin
                              const nomineeSlot = isFromSlot ? slots.find(s => s.name === name && cat.slotGroups.includes(s.group)) : undefined
                              const isGuestNominee = (cat.id === 'bestRoleTaker' || (cat as any).guestNominees) && !isFromSlot && guestNomineeNames.includes(name)
                              const prefixLabel = nomineeSlot ? (nomineeSlot.rolePrefix ?? 'TM') : isGuestNominee ? 'Guest' : null
                              const photoURL = (nomineeSlot?.uid ? profileByUid.get(nomineeSlot.uid)?.photoURL : undefined) ?? profileByName.get(name)?.photoURL
                              const showCount = (isAdmin || votingFrozen) && totalVotesForCat > 0

                              return (
                                <div key={name} style={{ position: 'relative' }}>
                                  <NomineeCard
                                    name={name}
                                    isSelected={isSelected}
                                    isWinner={isWinner}
                                    isLeader={isLeader}
                                    prefixLabel={prefixLabel}
                                    roleLabel={nomineeSlot?.role}
                                    photoURL={photoURL}
                                    count={count}
                                    showCount={showCount}
                                    canVote={canVote}
                                    busy={saving === cat.id}
                                    onVote={() => handleVote(cat.id, name)}
                                  />

                                  {isAdmin && votingFrozen && !declaredWinner && totalVotesForCat > 0 && (
                                    <button
                                      onClick={() => declareWinner(cat, name)}
                                      disabled={declaringWinner === cat.id}
                                      style={{
                                        width: '100%', marginTop: 3,
                                        background: '#772432', color: '#fff', border: 'none', borderRadius: 6,
                                        padding: '3px 0', fontSize: 10, fontWeight: 700,
                                        cursor: declaringWinner === cat.id ? 'not-allowed' : 'pointer',
                                        opacity: declaringWinner === cat.id ? 0.6 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                                      }}
                                    >
                                      <Award size={10} />
                                      {declaringWinner === cat.id ? '…' : 'Winner'}
                                    </button>
                                  )}

                                  {isAdmin && votingFrozen && declaredWinner && declaredWinner !== name && totalVotesForCat > 0 && (
                                    <button
                                      onClick={() => declareWinner(cat, name)}
                                      disabled={declaringWinner === cat.id}
                                      style={{
                                        width: '100%', marginTop: 3,
                                        background: 'none', color: '#9CA3AF', border: '1px solid #E6E2DE', borderRadius: 6,
                                        padding: '3px 0', fontSize: 10, fontWeight: 700,
                                        cursor: declaringWinner === cat.id ? 'not-allowed' : 'pointer',
                                      }}
                                    >
                                      Pick
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )
                      )}

                      {(isAdmin || votingFrozen) && !isEditing && catNominees.length > 0 && totalVotesForCat > 0 && (
                        <div style={{ marginTop: 8, fontSize: 10, color: '#9CA3AF', textAlign: 'right' }}>
                          {totalVotesForCat} vote{totalVotesForCat !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          ) : null}

          {/* Submit button */}
          {canVote && (
            <div style={{ marginTop: 20, position: 'sticky', bottom: 16 }}>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={totalVoted === 0}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12,
                  background: totalVoted > 0 ? '#772432' : '#E6E2DE',
                  color: totalVoted > 0 ? '#fff' : '#9CA3AF',
                  fontSize: 13, fontWeight: 700, border: 'none',
                  cursor: totalVoted === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: totalVoted > 0 ? '0 4px 16px rgba(119,36,50,0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {missingCategories.length > 0
                  ? `Submit ${totalVoted} vote${totalVoted !== 1 ? 's' : ''} (${missingCategories.length} skipped)`
                  : `Submit all ${totalVoted} votes`}
              </button>
              {missingCategories.length > 0 && totalVoted > 0 && (
                <div style={{ textAlign: 'center', fontSize: 10.5, color: '#EF4444', marginTop: 5 }}>
                  Not voted: {missingCategories.join(' · ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          votes={myVotes}
          missing={missingCategories}
          onConfirm={handleSubmitAll}
          onCancel={() => setShowConfirm(false)}
          saving={saving === 'submit'}
        />
      )}
    </div>
  )
}
