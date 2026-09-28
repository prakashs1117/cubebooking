import type { MeetingDetails } from '../types'

const MONTH_MAP: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  January: '01', February: '02', March: '03', April: '04', June: '06',
  July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
}

function parseDate(dateStr: string): string | null {
  // "2025-01-25"
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`
  // Normalise: strip commas, collapse whitespace
  const clean = dateStr.replace(/,/g, '').trim().replace(/\s+/g, ' ')
  const parts = clean.split(' ')
  if (parts.length === 3) {
    const [d, m, y] = parts
    const mm = MONTH_MAP[m] ?? MONTH_MAP[m.slice(0, 3)]
    if (mm) return `${y}${mm}${d.padStart(2, '0')}`
    // Try "Month D YYYY" order (e.g. "August 29 2026")
    const mm2 = MONTH_MAP[d] ?? MONTH_MAP[d.slice(0, 3)]
    if (mm2) return `${y}${mm2}${m.padStart(2, '0')}`
  }
  return null
}

function parseTime(timeStr: string): string | null {
  // Accepts "3:00 pm", "15:00", "3pm"
  const m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(timeStr)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = m[2] ? m[2] : '00'
  const ampm = m[3]?.toLowerCase()
  if (ampm === 'pm' && h < 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}${min}00`
}

function parseTiming(timing: string): { start: string; end: string } | null {
  // "3:00 pm – 5:00 pm" or "3:00 PM - 5:00 PM"
  const parts = timing.split(/[–—-]/)
  const t1 = parseTime(parts[0]?.trim() ?? '')
  const t2 = parts[1] ? parseTime(parts[1].trim()) : null
  if (!t1) return null
  return { start: t1, end: t2 ?? t1 }
}

/** Returns a JS Date for the meeting end time (or start if no end), or null if unparseable. */
export function parseMeetingEndDate(dateStr: string, timingStr?: string): Date | null {
  const ymd = parseDate(dateStr)
  if (!ymd) return null
  const year = parseInt(ymd.slice(0, 4))
  const month = parseInt(ymd.slice(4, 6)) - 1
  const day = parseInt(ymd.slice(6, 8))
  if (timingStr) {
    const parts = timingStr.split(/[–—-]/)
    // Use end time if available, else start
    const tStr = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim()
    const t = parseTime(tStr)
    if (t) {
      const h = parseInt(t.slice(0, 2))
      const m = parseInt(t.slice(2, 4))
      return new Date(year, month, day, h, m)
    }
  }
  // No timing — treat midnight as end of day
  return new Date(year, month, day, 23, 59)
}

export function buildCalendarUrl(meeting: MeetingDetails): string | null {
  const ymd = meeting.date ? parseDate(meeting.date) : null
  const times = meeting.timing ? parseTiming(meeting.timing) : null

  const title = encodeURIComponent(
    `${meeting.club || 'Toastmasters'} Meeting #${meeting.meetingNo}`
  )
  const locationEnc = encodeURIComponent(meeting.location || '')

  const detailParts: string[] = []
  if (meeting.theme) detailParts.push(`Theme: ${meeting.theme}`)
  if (meeting.meetingLink) detailParts.push(`Join: ${meeting.meetingLink}`)
  const detailsEnc = encodeURIComponent(detailParts.join('\n'))

  let datesParam = ''
  if (ymd && times) {
    datesParam = `${ymd}T${times.start}/${ymd}T${times.end}`
  } else if (ymd) {
    datesParam = `${ymd}/${ymd}`
  } else {
    return null
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${detailsEnc}&location=${locationEnc}`
}
