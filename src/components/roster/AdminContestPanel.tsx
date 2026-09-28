import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { Copy, Trash2, Plus } from 'lucide-react'
import type { ContestDoc, ContestVoteDoc } from '../../types'
import { AttendeeSelector } from './AttendeeSelector'

interface AdminContestPanelProps {
  rosterId: string
}

const CONTEST_TYPES = [
  'Humorous Speech Contest',
  'Table Topics Contest',
  'Evaluation Contest',
  'International Speech Contest',
]

export function AdminContestPanel({ rosterId }: AdminContestPanelProps) {
  const [contest, setContest] = useState<ContestDoc | null>(null)
  const [voteCount, setVoteCount] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [createMode, setCreateMode] = useState(false)
  const [selectedType, setSelectedType] = useState(CONTEST_TYPES[0])
  const [newContestantName, setNewContestantName] = useState('')
  const [attendees, setAttendees] = useState<{ uid: string; displayName: string; photoURL?: string }[]>([])
  const [copied, setCopied] = useState(false)
  const [changingWinner, setChangingWinner] = useState<string | null>(null)

  // Load contest and vote counts
  useEffect(() => {
    const loadContest = async () => {
      try {
        const contestRef = doc(db, `meetings/${rosterId}/contest`)
        const contestSnap = await getDoc(contestRef)
        setContest(contestSnap.exists() ? (contestSnap.data() as ContestDoc) : null)

        // Load vote counts
        const votesRef = collection(db, `meetings/${rosterId}/contestVotes`)
        const votesSnap = await getDocs(votesRef)
        const counts: Record<string, number> = {}
        votesSnap.docs.forEach((doc) => {
          const vote = (doc.data() as ContestVoteDoc).vote
          counts[vote] = (counts[vote] || 0) + 1
        })
        setVoteCount(counts)
      } catch (err) {
        console.error('Failed to load contest:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContest()
  }, [rosterId])

  // Load attending members for selector
  useEffect(() => {
    const loadAttendees = async () => {
      try {
        const attendanceRef = collection(db, `meetings/${rosterId}/attendance`)
        const q = query(attendanceRef, where('status', '==', 'attending'))
        const snap = await getDocs(q)
        const members = snap.docs
          .map((doc) => {
            const data = doc.data()
            return {
              uid: doc.id,
              displayName: data.displayName || '',
              photoURL: data.photoURL,
            }
          })
          .filter((m) => m.displayName)
        setAttendees(members)
      } catch (err) {
        console.error('Failed to load attendees:', err)
      }
    }

    loadAttendees()
  }, [rosterId])

  const handleCreateContest = async () => {
    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      const newContest: ContestDoc = {
        title: selectedType,
        contestants: [],
        frozen: false,
        winner: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      await setDoc(contestRef, newContest)
      setContest(newContest)
      setCreateMode(false)
    } catch (err) {
      console.error('Failed to create contest:', err)
    }
  }

  const handleAddContestant = async (name: string) => {
    if (!contest || !name.trim()) return
    if (contest.contestants.includes(name.trim())) return // Silently ignore duplicates

    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      const updated: ContestDoc = {
        ...contest,
        contestants: [...contest.contestants, name.trim()],
        updatedAt: Timestamp.now(),
      }
      await setDoc(contestRef, updated)
      setContest(updated)
      setNewContestantName('')
    } catch (err) {
      console.error('Failed to add contestant:', err)
    }
  }

  const handleAddAttendee = async (attendeeId: string) => {
    const attendee = attendees.find((a) => a.uid === attendeeId)
    if (attendee) {
      await handleAddContestant(attendee.displayName)
    }
  }

  const handleRemoveContestant = async (name: string) => {
    if (!contest || contest.frozen) return

    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      const updated: ContestDoc = {
        ...contest,
        contestants: contest.contestants.filter((c) => c !== name),
        updatedAt: Timestamp.now(),
      }
      await setDoc(contestRef, updated)
      setContest(updated)
    } catch (err) {
      console.error('Failed to remove contestant:', err)
    }
  }

  const handleCloseVoting = async () => {
    if (!contest) return

    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      const updated: ContestDoc = {
        ...contest,
        frozen: true,
        updatedAt: Timestamp.now(),
      }
      await setDoc(contestRef, updated)
      setContest(updated)
    } catch (err) {
      console.error('Failed to close voting:', err)
    }
  }

  const handleReopenVoting = async () => {
    if (!contest) return

    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      const updated: ContestDoc = {
        ...contest,
        frozen: false,
        updatedAt: Timestamp.now(),
      }
      await setDoc(contestRef, updated)
      setContest(updated)
    } catch (err) {
      console.error('Failed to reopen voting:', err)
    }
  }

  const handleDeclareWinner = async (name: string) => {
    if (!contest) return

    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      const updated: ContestDoc = {
        ...contest,
        winner: name,
        updatedAt: Timestamp.now(),
      }
      await setDoc(contestRef, updated)
      setContest(updated)
      setChangingWinner(null)
    } catch (err) {
      console.error('Failed to declare winner:', err)
    }
  }

  const handleDeleteContest = async () => {
    if (!confirm('Delete this contest? This cannot be undone.')) return

    try {
      const contestRef = doc(db, `meetings/${rosterId}/contest`)
      await deleteDoc(contestRef)
      setContest(null)
      setVoteCount({})
    } catch (err) {
      console.error('Failed to delete contest:', err)
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/roster/${rosterId}/contest`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nominatedNames = useMemo(() => contest?.contestants || [], [contest?.contestants])

  if (loading) {
    return <div style={{ fontSize: 14, color: '#9CA3AF' }}>Loading contest…</div>
  }

  if (!contest) {
    return (
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E6E2DE', padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Create a Contest Poll
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6470' }}>Contest Type</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #E6E2DE',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          >
            {CONTEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={handleCreateContest}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 10,
            background: '#772432',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Create Contest Poll
        </button>
      </div>
    )
  }

  // Contest exists
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Contest title and open/closed status */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E6E2DE', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{contest.title}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
              {contest.frozen ? (contest.winner ? '✓ Winner declared' : 'Voting closed') : 'Voting open'}
            </div>
          </div>
          <button
            onClick={handleDeleteContest}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #FEE2E2',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
            Delete
          </button>
        </div>

        {/* Shareable link */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={`${window.location.origin}/roster/${rosterId}/contest`}
            readOnly
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #E6E2DE',
              fontSize: 12,
              background: '#F9FAFB',
              color: '#6B7280',
            }}
          />
          <button
            onClick={copyShareLink}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #E6E2DE',
              background: copied ? '#DCFCE7' : '#fff',
              color: copied ? '#166534' : '#6B7280',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <Copy size={14} style={{ display: 'inline' }} />
          </button>
        </div>
      </div>

      {/* Contestants list */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E6E2DE', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          Contestants ({contest.contestants.length})
        </div>

        {contest.contestants.length === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>No contestants yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {contest.contestants.map((name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#F9FAFB',
                  borderRadius: 8,
                  border: '1px solid #E6E2DE',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    {voteCount[name] || 0} vote{voteCount[name] !== 1 ? 's' : ''}
                  </div>
                </div>

                {!contest.frozen && (
                  <button
                    onClick={() => handleRemoveContestant(name)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                {contest.frozen && changingWinner === name && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleDeclareWinner(name)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#DCFCE7',
                        color: '#166534',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setChangingWinner(null)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: '1px solid #E6E2DE',
                        background: '#fff',
                        color: '#6B7280',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {contest.frozen && changingWinner !== name && (
                  <button
                    onClick={() => setChangingWinner(name)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #E6E2DE',
                      background: contest.winner === name ? '#FEF3C7' : '#fff',
                      color: contest.winner === name ? '#92400E' : '#6B7280',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {contest.winner === name ? '🏅 Winner' : 'Set as winner'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add contestant section */}
        {!contest.frozen && (
          <div style={{ borderTop: '1px solid #E6E2DE', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B6470', marginBottom: 10, textTransform: 'uppercase' }}>
              Add Contestant
            </div>

            {/* Member picker */}
            <div style={{ marginBottom: 12 }}>
              <AttendeeSelector
                profiles={attendees}
                nominatedNames={nominatedNames}
                onSelect={handleAddAttendee}
                disabled={false}
              />
            </div>

            {/* Free-text input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newContestantName}
                onChange={(e) => setNewContestantName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddContestant(newContestantName)
                  }
                }}
                placeholder="Guest name or non-member"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #E6E2DE',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleAddContestant(newContestantName)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#772432',
                  color: '#fff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voting control buttons */}
      {!contest.frozen ? (
        <button
          onClick={handleCloseVoting}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 10,
            background: '#772432',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Close Voting
        </button>
      ) : (
        <button
          onClick={handleReopenVoting}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 10,
            background: '#fff',
            color: '#772432',
            fontSize: 14,
            fontWeight: 700,
            border: '1.5px solid #772432',
            cursor: 'pointer',
          }}
        >
          Re-open Voting
        </button>
      )}
    </div>
  )
}
