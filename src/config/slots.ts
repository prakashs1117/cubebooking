export const SLOT_HOURS = [8, 9, 10, 11, 13, 14, 15, 16] as const

export const COMBO_PAIRS: readonly [number, number][] = [
  [8, 9],
  [10, 11],
  [13, 14],
  [15, 16],
]

export function slotToDate(date: string, startHour: number): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, startHour, 0, 0, 0)
}

export function slotEndDate(date: string, startHour: number): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, startHour + 1, 0, 0, 0)
}

export function dateToSlotKey(date: string, startHour: number): string {
  return `${date}T${startHour}`
}

export function toSlotDocId(date: string, programId: string, startHour: number): string {
  return `${date}_${programId}_${String(startHour).padStart(2, '0')}00`
}

export function toTeacherSlotDocId(uid: string, date: string, startHour: number): string {
  return `${uid}_${date}_${String(startHour).padStart(2, '0')}00`
}
