import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../firebase'
import { doc, collection, onSnapshot } from 'firebase/firestore'
import html2canvas from 'html2canvas'
import { Download, Share2, Check, Info, X, Trophy } from 'lucide-react'
import { PosterInner } from './PosterCanvas'
import type { MeetingDetails, RoleSlot } from '../../types'
import { track } from '../../lib/analytics'

const POSTER_SIZE = 1080

const DEFAULT_MEETING: MeetingDetails = {
  club: '', sub: '', meetingNo: '', theme: '', wod: '', pod: '',
  date: '', timing: '', location: '',
}

export default function PosterSharePage() {
  const { rosterId } = useParams<{ rosterId: string }>()
  const [meeting, setMeeting] = useState<MeetingDetails>(DEFAULT_MEETING)
  const [slots, setSlots] = useState<RoleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [wordPopup, setWordPopup] = useState<'wod' | 'pod' | null>(null)

  useEffect(() => {
    if (!rosterId) return
    const unsub = onSnapshot(doc(db, 'meetings', rosterId), (snap) => {
      if (snap.exists()) setMeeting((prev) => ({ ...prev, ...snap.data() }))
    })
    track({ name: 'share_page_viewed', params: { roster_id: rosterId } })
    return unsub
  }, [rosterId])

  useEffect(() => {
    if (!rosterId) { setLoading(false); return }
    const unsub = onSnapshot(collection(db, 'meetings', rosterId, 'roleSlots'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleSlot))
      data.sort((a, b) => (a.order - b.order) || a.group.localeCompare(b.group))
      setSlots(data)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [rosterId])

  const handleShare = async () => {
    const url = window.location.href
    const title = `${meeting.club || 'Meeting'} Poster${meeting.meetingNo ? ` #${meeting.meetingNo}` : ''}`
    const text = meeting.date ? `${title} · ${meeting.date}` : title
    track({ name: 'poster_shared', params: { roster_id: rosterId ?? '' } })
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // user cancelled — do nothing
        return
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // last resort
      window.prompt('Copy this link:', url)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const node = document.getElementById('poster-share-canvas')
      if (!node) return
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        width: POSTER_SIZE,
        height: POSTER_SIZE,
      })
      const link = document.createElement('a')
      link.download = `${(meeting.club || 'poster').replace(/\s+/g, '-').toLowerCase()}-mtg-${meeting.meetingNo || ''}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      track({ name: 'poster_downloaded', params: { roster_id: rosterId ?? '', meeting_no: meeting.meetingNo } })
    } finally {
      setDownloading(false)
    }
  }

  const [vw, setVw] = useState(window.innerWidth)
  const [vh, setVh] = useState(window.innerHeight)
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const padding = 16
  const scale = Math.min((vw - padding * 2) / POSTER_SIZE, (vh - 140) / POSTER_SIZE)
  const posterDisplaySize = POSTER_SIZE * scale

  const parseWordField = (raw: string) => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
    const word = lines[0] ?? ''
    const sections: { heading: string; items: string[] }[] = []
    let current: { heading: string; items: string[] } | null = null
    for (const line of lines.slice(1)) {
      if (line.endsWith(':')) {
        current = { heading: line.slice(0, -1), items: [] }
        sections.push(current)
      } else if (current) {
        current.items.push(line.replace(/^\d+\.\s*/, ''))
      }
    }
    return { word, sections }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0e0e0e', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>🪧</div>
        <div style={{ fontSize: 14, color: '#9CA3AF' }}>Loading poster…</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0e0e0e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: 'env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 24px)',
      boxSizing: 'border-box',
    }}>
      {/* Offscreen full-size node for download */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div id="poster-share-canvas">
          <PosterInner meeting={meeting} slots={slots} />
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: posterDisplaySize,
        display: 'flex',
        flexDirection: vw < 480 ? 'column' : 'row',
        alignItems: vw < 480 ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {meeting.club || 'Meeting Poster'}
            {meeting.meetingNo && (
              <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginLeft: 8 }}>
                #{meeting.meetingNo}
              </span>
            )}
          </div>
          {meeting.date && (
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {meeting.date}{meeting.timing ? ` · ${meeting.timing}` : ''}
            </div>
          )}
          {/* WOD / POD chips with info icons */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {meeting.wod && (
              <button
                onClick={() => setWordPopup('wod')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#1F2937', border: 'none', borderRadius: 6,
                  padding: '3px 8px', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: '#F3D24F' }}>WOD</span>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>
                  {meeting.wod.split('\n')[0]}
                </span>
                <Info size={11} color="#6B7280" />
              </button>
            )}
            {meeting.pod && (
              <button
                onClick={() => setWordPopup('pod')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#1F2937', border: 'none', borderRadius: 6,
                  padding: '3px 8px', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6EE7B7' }}>POD</span>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>
                  {meeting.pod.split('\n')[0]}
                </span>
                <Info size={11} color="#6B7280" />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.href = `/roster/${rosterId}/vote`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: '#772432', color: '#fff',
              fontSize: 13, fontWeight: 700, border: 'none',
              cursor: 'pointer',
              flex: vw < 480 ? 1 : undefined,
            }}
          >
            <Trophy size={13} />
            Vote
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: copied ? '#065F46' : '#1F2937',
              color: '#fff',
              fontSize: 13, fontWeight: 700, border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flex: vw < 480 ? 1 : undefined,
            }}
          >
            {copied ? <Check size={13} /> : <Share2 size={13} />}
            {copied ? 'Copied!' : 'Share'}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: '#772432', color: '#fff',
              fontSize: 13, fontWeight: 700, border: 'none',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.6 : 1,
              flex: vw < 480 ? 1 : undefined,
            }}
          >
            <Download size={13} />
            {downloading ? 'Downloading…' : 'Download PNG'}
          </button>
        </div>
      </div>

      <div style={{
        width: posterDisplaySize,
        height: posterDisplaySize,
        borderRadius: vw < 480 ? 10 : 16,
        overflow: 'hidden',
        boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
        flexShrink: 0,
      }}>
        <div style={{
          width: POSTER_SIZE,
          height: POSTER_SIZE,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <PosterInner meeting={meeting} slots={slots} />
        </div>
      </div>

      {/* Share hint */}
      <div style={{ marginTop: 16, fontSize: 11, color: '#374151', textAlign: 'center' }}>
        Share this page URL to let anyone view this poster
      </div>

      {/* WOD / POD detail popup */}
      {wordPopup && (() => {
        const isWod = wordPopup === 'wod'
        const raw = isWod ? meeting.wod : meeting.pod
        const label = isWod ? 'Word of the Day' : 'Phrase of the Day'
        const accentColor = isWod ? '#F3D24F' : '#6EE7B7'
        const { word, sections } = parseWordField(raw)
        return (
          <div
            onClick={() => setWordPopup(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 80,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#1a1a1a', borderRadius: '16px 16px 0 0',
                padding: '20px 20px 32px',
                width: '100%', maxWidth: 480,
                maxHeight: '70vh', overflowY: 'auto',
              }}
            >
              {/* Handle bar */}
              <div style={{ width: 36, height: 4, background: '#374151', borderRadius: 2, margin: '0 auto 16px' }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                    {word}
                  </div>
                </div>
                <button
                  onClick={() => setWordPopup(null)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#374151', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} color="#9CA3AF" />
                </button>
              </div>

              {sections.length === 0 && (
                <div style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>
                  No additional details added.
                </div>
              )}

              {sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: accentColor,
                    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
                  }}>
                    {sec.heading}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sec.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: accentColor + '22', color: accentColor,
                          fontSize: 10, fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 1,
                        }}>{ii + 1}</span>
                        <span style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
