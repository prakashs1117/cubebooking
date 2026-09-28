/** Formats an ISO `yyyy-mm-dd` date of birth as "Month Day" — the year is never shown. */
export function formatDobNoYear(dob: string | undefined | null): string {
  if (!dob) return ''
  const parts = dob.split('-')
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (!month || !day) return ''
  return new Date(2000, month - 1, day).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })
}

/** True when `dob`'s month and day match `now` — ignores year entirely. */
export function isBirthdayToday(dob: string | undefined | null, now: Date = new Date()): boolean {
  if (!dob) return false
  const parts = dob.split('-')
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (!month || !day) return false
  return now.getMonth() + 1 === month && now.getDate() === day
}
