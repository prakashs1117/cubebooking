import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { Download, Share2, Trophy, CalendarPlus, Video } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useAuthContext } from '../../context/AuthContext'
import { isGuestOnly } from '../../lib/roles'
import { PosterCanvas, PosterLightbox, PosterCanvasWithPhotos, PosterLightboxWithPhotos } from './PosterCanvas'
import { RoleBoard } from './RoleBoard'
import { RolePickerView } from './RolePickerView'
import { AdminEditorPanel } from './AdminEditorPanel'
import { AdminContestPanel } from './AdminContestPanel'
import { useMeetingPoster } from './useMeetingPoster'
import { useAttendance } from './useAttendance'
import { AvatarStack } from './AvatarStack'
import { buildCalendarUrl } from '../../lib/calendarUrl'
import { WordDetailPopup } from './WordDetailPopup'
import { track } from '../../lib/analytics'
import AppHeader from '../AppHeader'
import { useSpeakerFeedback } from '../../hooks/useSpeakerFeedback'
import { SpeakerFeedbackModal } from './SpeakerFeedbackModal'
import type { RoleSlot } from '../../types'

type AdminTab = 'controls' | 'roles' | 'contest'
type WordField = 'wod' | 'pod' | 'theme'

export default function MeetingPosterPage() {
  const { user, isAdmin, isSuperAdmin, profile } = useAuthContext()
  const { rosterId } = useParams<{ rosterId: string }>()
  const navigate = useNavigate()
  const isClubMember = !!(profile && !isGuestOnly(profile))
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [photoDownloading, setPhotoDownloading] = useState(false)
  const [adminTab, setAdminTab] = useState<AdminTab>('controls')
  const [showLightbox, setShowLightbox] = useState(false)
  const [showPhotoLightbox, setShowPhotoLightbox] = useState(false)
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'done'>('idle')
  const [photoShareState, setPhotoShareState] = useState<'idle' | 'sharing' | 'done'>('idle')
  const [activeWord, setActiveWord] = useState<{ field: WordField; word: string; label: string } | null>(null)
  const [vw, setVw] = useState(window.innerWidth)
  const [clubUsers, setClubUsers] = useState<{ uid: string; displayName: string; photoURL?: string }[]>([])

  useEffect(() => {
    const fn = () => setVw(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setClubUsers(
        snap.docs
          .map((d) => ({
            uid: d.id,
            displayName: (d.data().displayName as string | undefined) || (d.data().email as string | undefined) || d.id,
            photoURL: d.data().photoURL as string | undefined,
          }))
          .filter((u) => u.displayName),
      )
    })
  }, [isAdmin])
  const isMobile = vw < 768

  const shareNode = async (nodeId: string, filenameSuffix: string, setState: (s: 'idle' | 'sharing' | 'done') => void) => {
    const url = `${window.location.origin}/poster/${rosterId}`
    track({ name: 'poster_shared', params: { roster_id: rosterId ?? '' } })

    // Build a rich share message
    const openRoles = slots.filter(s => !s.uid && !s.name && s.group !== 'evaluators')
    const openCount = openRoles.length
    const openList  = openRoles.slice(0, 4).map(s => s.role).join(', ')
    const theme     = meeting.theme ? `🎯 Theme: "${meeting.theme}"` : ''
    const wod       = meeting.wod   ? `📖 WOD: ${meeting.wod.split('\n')[0]}` : ''

    const lines: string[] = [
      `🎙️ ${meeting.club} — Meeting #${meeting.meetingNo}`,
      `📅 ${meeting.date}${meeting.timing ? '  ·  ' + meeting.timing : ''}`,
      meeting.location ? `📍 ${meeting.location}` : '',
      theme,
      wod,
      openCount > 0
        ? `\n⚡ ${openCount} role${openCount > 1 ? 's' : ''} still open — ${openList}${openCount > 4 ? '…' : ''}. Claim yours!`
        : '\n✅ All roles filled — see you there!',
      `\n🔗 ${url}`,
    ].filter(Boolean)

    const shareText = lines.join('\n')

    setState('sharing')
    try {
      // Try to render poster as image for sharing
      const node = document.getElementById(nodeId)
      let files: File[] | undefined

      if (node && typeof window !== 'undefined') {
        try {
          const canvas = await html2canvas(node, {
            scale: 2, backgroundColor: null, useCORS: true, logging: false,
            width: 1080, height: 1080,
          })
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
          if (blob) {
            const fileName = `${(meeting.club || 'poster').replace(/\s+/g, '-').toLowerCase()}-mtg-${meeting.meetingNo || ''}${filenameSuffix}.png`
            files = [new File([blob], fileName, { type: 'image/png' })]
          }
        } catch {
          // poster render failed — share without image
        }
      }

      // Web Share API with image (Level 2 — supported on iOS/Android Chrome)
      if (navigator.share && navigator.canShare && files && navigator.canShare({ files })) {
        await navigator.share({
          title: `${meeting.club} Meeting #${meeting.meetingNo}`,
          text: shareText,
          files,
        })
      } else if (navigator.share) {
        // Web Share Level 1 — text + url only
        await navigator.share({
          title: `${meeting.club} Meeting #${meeting.meetingNo}`,
          text: shareText,
          url,
        })
      } else {
        // Desktop fallback — copy text to clipboard
        await navigator.clipboard.writeText(shareText)
      }

      setState('done')
      setTimeout(() => setState('idle'), 2500)
    } catch (err: any) {
      // User cancelled or share failed — silently reset
      setState('idle')
    }
  }

  const handleShare = () => shareNode('poster-download', '', setShareState)
  const handlePhotoShare = () => shareNode('poster-photo-download', '-photos', setPhotoShareState)

  const [feedbackTargetSlot, setFeedbackTargetSlot] = useState<RoleSlot | null>(null)

  const { meeting, slots, loading, claimSlot, claimOrCreateSlot, releaseSlot, updateMeeting, addSlot, addSpeakerWithEvaluator, updateSlotField, removeSlot, updateSlotName, adminOverrideSlot, resetForNewWeek } = useMeetingPoster(rosterId ?? '')
  const { feedbackBySlot, hasReviewed, submit: submitFeedback } = useSpeakerFeedback(rosterId ?? '', user?.uid)
  const { myStatus, attending, notAttending, saving: rsvpSaving, setStatus: setRsvpStatus } = useAttendance(
    rosterId ?? '',
    user?.uid,
    profile?.displayName || user?.email || '',
    profile?.photoURL,
  )

  // Track roster view once meeting data loads
  useEffect(() => {
    if (!loading && rosterId && meeting.meetingNo) {
      track({ name: 'roster_viewed', params: { roster_id: rosterId, meeting_no: meeting.meetingNo } })
    }
  }, [loading, rosterId, meeting.meetingNo])

  const downloadNode = async (nodeId: string, filenameSuffix: string, setBusy: (b: boolean) => void) => {
    setBusy(true)
    setDownloadError(null)
    try {
      const node = document.getElementById(nodeId)
      if (!node) throw new Error('Poster not found')
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        width: 1080,
        height: 1080,
      })
      const link = document.createElement('a')
      link.download = `${(meeting.club || 'poster').replace(/\s+/g, '-').toLowerCase()}-mtg-${meeting.meetingNo || ''}${filenameSuffix}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      track({ name: 'poster_downloaded', params: { roster_id: rosterId ?? '', meeting_no: meeting.meetingNo } })
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = () => downloadNode('poster-download', '', setDownloading)
  const handlePhotoDownload = () => downloadNode('poster-photo-download', '-photos', setPhotoDownloading)

  if (!rosterId) {
    navigate('/roster', { replace: true })
    return null
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F3F1' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
      </div>
    )
  }

  const TAB_DEFS: { key: AdminTab; label: string }[] = [
    { key: 'controls', label: 'Admin Controls' },
    { key: 'roles', label: 'Role Assignments' },
    { key: 'contest', label: '🎭 Contest' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 64 }}>
      {/* Offscreen posters for PNG export */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div id="poster-download">
          <PosterCanvas meeting={meeting} slots={slots} />
        </div>
        <div id="poster-photo-download">
          <PosterCanvasWithPhotos meeting={meeting} slots={slots} profiles={clubUsers} />
        </div>
      </div>

      <AppHeader
        backTo="/roster"
        backLabel="All Rosters"
        title={meeting.meetingNo ? `Meeting #${meeting.meetingNo}` : (meeting.club || 'Meeting Roster')}
        subtitle={meeting.date && meeting.timing ? `${meeting.date} · ${meeting.timing}` : 'Live poster & role assignments'}
      />

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '12px 10px' : '20px 20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 380px', gap: isMobile ? 12 : 20, alignItems: 'start', boxSizing: 'border-box', width: '100%' }}>

        {/* Left column */}
        <div style={{ minWidth: 0, width: '100%' }}>
          {isAdmin ? (
            <>
              {/* Tab bar */}
              <div style={{
                display: 'flex',
                background: '#fff',
                border: '1px solid #E6E2DE',
                borderRadius: 12,
                padding: 3,
                marginBottom: 14,
                gap: 4,
              }}>
                {TAB_DEFS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAdminTab(key)}
                    style={{
                      flex: 1,
                      padding: isMobile ? '7px 0' : '8px 0',
                      borderRadius: 9,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                      transition: 'background 0.15s, color 0.15s',
                      background: adminTab === key ? '#772432' : 'none',
                      color: adminTab === key ? '#fff' : '#6B7280',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
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
                <AdminContestPanel rosterId={rosterId!} />
              )}
            </>
          ) : isClubMember ? (
            <RolePickerView
              slots={slots}
              currentUid={user?.uid}
              displayName={profile?.displayName || user?.email || ''}
              meetingDate={[meeting.date, meeting.timing].filter(Boolean).join(' · ')}
              onClaim={claimSlot}
              onClaimByCode={claimOrCreateSlot}
              onRelease={releaseSlot}
              onUpdateMeeting={updateMeeting}
              onMarkAttending={() => setRsvpStatus('attending')}
              onAddSlot={addSlot}
              onAddSpeakerPair={addSpeakerWithEvaluator}
              onUpdateSlotField={updateSlotField}
              isAdmin={isAdmin}
              onGiveFeedback={setFeedbackTargetSlot}
              hasReviewedSlot={hasReviewed}
              mySlotFeedback={(() => {
                const mySlot = slots.find(s => s.uid === user?.uid)
                return mySlot ? (feedbackBySlot[mySlot.id] ?? []) : []
              })()}
            />
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Available roles</div>
              <RoleBoard
                slots={slots}
                currentUid={user?.uid}
                onClaim={claimSlot}
                onRelease={releaseSlot}
              />
            </>
          )}

          {downloadError && (
            <div style={{ marginTop: 16, padding: 10, borderRadius: 10, background: '#FFEBEE', color: '#B3261E', fontSize: 11, fontWeight: 600 }}>
              {downloadError}
            </div>
          )}
        </div>

        {feedbackTargetSlot && (
          <SpeakerFeedbackModal
            speakerName={feedbackTargetSlot.name}
            slotId={feedbackTargetSlot.id}
            speakerUid={feedbackTargetSlot.uid}
            slotGroup={feedbackTargetSlot.group}
            onSubmit={async (rating, comment) => {
              await submitFeedback(
                feedbackTargetSlot.id,
                feedbackTargetSlot.name,
                feedbackTargetSlot.uid,
                feedbackTargetSlot.group,
                rating,
                comment,
                profile?.displayName || user?.email || 'Anonymous',
              )
            }}
            onClose={() => setFeedbackTargetSlot(null)}
          />
        )}

        {/* Right: poster actions */}
        <div style={{ position: isMobile ? 'static' : 'sticky', top: isMobile ? undefined : 80, minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Meeting Poster
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #E6E2DE',
            padding: isMobile ? 12 : 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Poster icon placeholder */}
            <div style={{
              background: 'linear-gradient(135deg, #7C0C2E 0%, #6A0A27 100%)',
              borderRadius: 10,
              height: 90,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              <img src="/favicon.svg" alt="logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' }}>
                {meeting.club || 'Meeting Poster'}
              </div>
              {meeting.meetingNo && (
                <div style={{ fontSize: 10, color: '#F3D24F', fontWeight: 600 }}>#{meeting.meetingNo}</div>
              )}
            </div>

            {/* Mode badge + meeting/calendar links */}
            {(() => {
              const mode = meeting.meetingMode ?? 'in-person'
              const modeLabel = mode === 'in-person' ? '📍 In-person' : mode === 'online' ? '💻 Online' : '🔀 Hybrid'
              const modeColor = mode === 'online' ? '#1e40af' : mode === 'hybrid' ? '#92400e' : '#166534'
              const modeBg = mode === 'online' ? '#eff6ff' : mode === 'hybrid' ? '#fff7ed' : '#f0fdf4'
              const calUrl = buildCalendarUrl(meeting) ?? meeting.calendarInviteUrl
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: modeBg, color: modeColor, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6 }}>
                      {modeLabel}
                    </span>
                    {meeting.timing && <span style={{ fontSize: 11, color: '#6b7280' }}>{meeting.timing}</span>}
                  </div>
                  {(mode === 'online' || mode === 'hybrid') && meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track({ name: 'join_meeting_clicked', params: { roster_id: rosterId ?? '', source: 'detail' } })}
                      style={{
                        width: '100%', padding: '8px 0', borderRadius: 9,
                        background: '#1e40af', color: '#fff',
                        fontSize: 12, fontWeight: 700, border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        textDecoration: 'none',
                      }}
                    >
                      <Video size={13} /> Join Meeting
                    </a>
                  )}
                  {calUrl && (
                    <a
                      href={calUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track({ name: 'calendar_add_clicked', params: { roster_id: rosterId ?? '', source: 'detail' } })}
                      style={{
                        width: '100%', padding: '8px 0', borderRadius: 9,
                        border: '1.5px solid #e5e7eb', background: '#fff',
                        color: '#374151', fontSize: 12, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        textDecoration: 'none',
                      }}
                    >
                      <CalendarPlus size={13} /> Add to Calendar
                    </a>
                  )}
                </div>
              )
            })()}

            {/* RSVP */}
            {user && (
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                  Your attendance
                </div>
                <div style={{ marginBottom: 8 }}>
                  {myStatus === 'attending' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: '#dcfce7', border: '1.5px solid #bbf7d0', color: '#166534',
                      }}>✓ See you on {meeting.date}!</span>
                      <button
                        onClick={() => setRsvpStatus('not-attending')}
                        disabled={rsvpSaving}
                        style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                          border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
                          cursor: rsvpSaving ? 'default' : 'pointer', opacity: rsvpSaving ? 0.5 : 1,
                        }}
                      >✎ Change</button>
                    </div>
                  ) : myStatus === 'not-attending' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: '#fee2e2', border: '1.5px solid #fecaca', color: '#991b1b',
                      }}>✗ Not attending</span>
                      <button
                        onClick={() => setRsvpStatus('attending')}
                        disabled={rsvpSaving}
                        style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                          border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
                          cursor: rsvpSaving ? 'default' : 'pointer', opacity: rsvpSaving ? 0.5 : 1,
                        }}
                      >✎ Change</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setRsvpStatus('attending')}
                        disabled={rsvpSaving}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
                          cursor: rsvpSaving ? 'default' : 'pointer',
                        }}
                      >✓ I'll be there</button>
                      <button
                        onClick={() => setRsvpStatus('not-attending')}
                        disabled={rsvpSaving}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
                          cursor: rsvpSaving ? 'default' : 'pointer',
                        }}
                      >✗ Can't make it</button>
                    </div>
                  )}
                </div>
                {(attending.length > 0 || notAttending.length > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {attending.length > 0 && <AvatarStack attendees={attending} size={26} max={6} borderColor='#fff' />}
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {attending.length > 0 && <span style={{ color: '#166534', fontWeight: 700 }}>{attending.length} attending</span>}
                      {attending.length > 0 && notAttending.length > 0 && ' · '}
                      {notAttending.length > 0 && <span style={{ color: '#991b1b', fontWeight: 700 }}>{notAttending.length} can't make it</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { setShowLightbox(true); track({ name: 'poster_previewed', params: { roster_id: rosterId ?? '' } }) }}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 10,
                background: '#772432',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Preview Poster
            </button>

            <button
              onClick={() => { setShowPhotoLightbox(true); track({ name: 'poster_previewed', params: { roster_id: rosterId ?? '' } }) }}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 10,
                background: 'none', color: '#772432', fontSize: 12, fontWeight: 700,
                border: '1.5px solid #772432', cursor: 'pointer',
              }}
            >
              Preview Photo Poster
            </button>

            <button
              onClick={() => navigate(`/roster/${rosterId}/vote`)}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 10,
                background: 'none',
                color: '#772432',
                fontSize: 12,
                fontWeight: 700,
                border: '1.5px solid #772432',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Trophy size={14} />
              Vote / Awards
            </button>

            <button
              onClick={handleShare}
              disabled={shareState === 'sharing'}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 10,
                background: shareState === 'done' ? '#DCFCE7' : 'none',
                color: shareState === 'done' ? '#166534' : '#772432',
                fontSize: 12,
                fontWeight: 700,
                border: `1.5px solid ${shareState === 'done' ? '#86EFAC' : '#772432'}`,
                cursor: shareState === 'sharing' ? 'not-allowed' : 'pointer',
                opacity: shareState === 'sharing' ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
              }}
            >
              <Share2 size={14} />
              {shareState === 'sharing' ? 'Sharing…' : shareState === 'done' ? '✓ Shared!' : 'Share Poster'}
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 10,
                background: 'none',
                color: '#6B7280',
                fontSize: 12,
                fontWeight: 700,
                border: '1.5px solid #E6E2DE',
                cursor: downloading ? 'not-allowed' : 'pointer',
                opacity: downloading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Download size={14} />
              {downloading ? 'Downloading…' : 'Download PNG'}
            </button>

            {downloadError && (
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#FFEBEE', color: '#B3261E', fontSize: 12, fontWeight: 600 }}>
                {downloadError}
              </div>
            )}

            {/* WOD / Theme / POD clickable chips */}
            {(meeting.theme || meeting.wod || meeting.pod) && (
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Tap to see meanings
                </div>
                {[
                  { field: 'theme' as WordField, label: 'Theme', value: meeting.theme },
                  { field: 'wod' as WordField, label: 'WOD', value: meeting.wod },
                  { field: 'pod' as WordField, label: 'POD', value: meeting.pod },
                ].filter(item => item.value).map(item => {
                  const display = item.value.split('\n')[0] ?? item.value
                  const hasDetails = item.value.includes('\n')
                  return (
                    <button
                      key={item.field}
                      onClick={() => setActiveWord({ field: item.field, word: display, label: item.label })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: '1px solid #E6E2DE',
                        background: '#F9FAFB',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.15s, background 0.15s',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#772432'; e.currentTarget.style.background = '#FFF5F6' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E6E2DE'; e.currentTarget.style.background = '#F9FAFB' }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#772432', textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0 }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {display}
                      </span>
                      {hasDetails && (
                        <span style={{ fontSize: 10, color: '#772432', fontWeight: 700, flexShrink: 0 }}>ⓘ</span>
                      )}
                      {!hasDetails && (
                        <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>›</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {showLightbox && (
          <PosterLightbox
            meeting={meeting}
            slots={slots}
            onClose={() => setShowLightbox(false)}
            onDownload={handleDownload}
            downloading={downloading}
            onShare={handleShare}
            shareState={shareState}
          />
        )}

        {/* Photo Poster Lightbox */}
        {showPhotoLightbox && (
          <PosterLightboxWithPhotos
            meeting={meeting}
            slots={slots}
            profiles={clubUsers}
            onClose={() => setShowPhotoLightbox(false)}
            onDownload={handlePhotoDownload}
            downloading={photoDownloading}
            onShare={handlePhotoShare}
            shareState={photoShareState}
          />
        )}

        {/* Word detail popup */}
        {activeWord && rosterId && (
          <WordDetailPopup
            rosterId={rosterId}
            field={activeWord.field}
            word={activeWord.word}
            label={activeWord.label}
            rawValue={activeWord.field === 'wod' ? meeting.wod : activeWord.field === 'pod' ? meeting.pod : meeting.theme}
            currentUid={user?.uid}
            onClose={() => setActiveWord(null)}
          />
        )}
      </div>
    </div>
  )
}
