import type { RoleGroup } from '../types'

export type { RoleGroup }

export interface CatalogueEntry {
  code: string
  name: string
  group: RoleGroup
  description: string
  emoji: string
  responsibilities: string[]
  /** Fixed roles always appear for members to claim and cannot be removed by admins. */
  fixed: boolean
}

export const ROLE_CATALOGUE: CatalogueEntry[] = [
  {
    code: 'SAA', name: 'Sergeant at Arms', group: 'roleTakers', emoji: '🪑', fixed: true,
    description: 'Sets up the room, manages equipment and attendance.',
    responsibilities: [
      'Set up room & arrange chairs before the meeting',
      'Manage attendance register & name tags',
      'Control equipment — projector, mic, timer lights',
      'Welcome members at the door',
      'Announce the opening of the meeting to the Presiding Officer',
    ],
  },
  {
    code: 'PO', name: 'Presiding Officer', group: 'roleTakers', emoji: '🎩', fixed: true,
    description: 'Opens and closes the meeting, presides over all business items.',
    responsibilities: [
      'Call the meeting to order and welcome everyone',
      'Introduce the Toastmaster of the Day',
      'Preside over voting and business items',
      'Handle any agenda deviations',
      'Close the meeting officially',
    ],
  },
  {
    code: 'TMOD', name: 'Toastmaster of the Day', group: 'roleTakers', emoji: '🎙️', fixed: true,
    description: 'Master of ceremonies who sets the theme and runs the full meeting.',
    responsibilities: [
      'Set and announce the meeting theme',
      'Introduce every speaker and role-taker',
      'Keep the meeting running on schedule',
      'Energise the room between segments',
      'Hand over to evaluators and close the main session',
    ],
  },
  {
    code: 'TTM', name: 'Table Topics Master', group: 'roleTakers', emoji: '💬', fixed: true,
    description: 'Runs the impromptu speaking segment with spontaneous topic questions.',
    responsibilities: [
      'Prepare 5–7 spontaneous topic questions',
      'Call on members randomly for 1–2 min impromptu speeches',
      'Time and signal speakers during their responses',
      'Give a brief summary of the table topics segment',
      'Invite the Timer to report all times',
    ],
  },
  {
    code: 'GE', name: 'General Evaluator', group: 'roleTakers', emoji: '🔍', fixed: true,
    description: 'Evaluates the meeting quality and leads the evaluation segment.',
    responsibilities: [
      'Observe the entire meeting for quality and flow',
      'Evaluate the TMOD, TTM, and functional roles',
      "Summarise the meeting's highlights and areas to improve",
      'Lead the evaluation section of the meeting',
      'Announce the Best Evaluator vote',
    ],
  },
  {
    code: 'TIMER', name: 'Timer', group: 'tagl', emoji: '⏱️', fixed: true,
    description: 'Times every segment and signals speakers with green / amber / red.',
    responsibilities: [
      'Time every prepared and impromptu speech',
      'Signal green (min time), amber (target), red (max) with lights or cards',
      'Record all times accurately throughout the meeting',
      'Report all times clearly at the end of each segment',
    ],
  },
  {
    code: 'AHC', name: 'Ah-Counter', group: 'tagl', emoji: '🔢', fixed: true,
    description: 'Counts filler words and crutch sounds used by each speaker.',
    responsibilities: [
      'Listen for filler words: um, ah, er, "you know", "like", etc.',
      'Count every instance per speaker during the meeting',
      'Report counts clearly at the end of the meeting',
      'Offer a brief tip on how to reduce filler words',
    ],
  },
  {
    code: 'GRAM', name: 'Grammarian', group: 'tagl', emoji: '📖', fixed: true,
    description: 'Tracks word usage and introduces the Word of the Day.',
    responsibilities: [
      'Introduce the Word of the Day at the start of the meeting',
      'Encourage members to use it naturally in speeches',
      'Track elegant or poor word usage throughout',
      'Present the Word of the Day usage report at the end',
      'Announce members who used the word correctly',
    ],
  },
  {
    code: 'LISTEN', name: 'Listening Post', group: 'tagl', emoji: '👂', fixed: true,
    description: 'Quizzes the audience on meeting content to encourage active listening.',
    responsibilities: [
      'Pay close attention to every speech and segment',
      'Prepare 5 quiz questions from the meeting content',
      'Quiz the audience at the end of the meeting',
      'Award points for correct answers',
      'Announce the winner of the listening quiz',
    ],
  },
  {
    code: 'TTS', name: 'Table Topics Speaker', group: 'tableTopics', emoji: '🎤', fixed: true,
    description: 'Responds to an impromptu Table Topics question with a short unprepared speech.',
    responsibilities: [
      'Listen carefully to the question from the Table Topics Master',
      'Speak for 1–2 minutes without preparation',
      'Stay on topic and structure a clear beginning, middle and end',
      'Watch the timer lights and wrap up within time',
    ],
  },
  {
    code: 'SPKR', name: 'Speaker', group: 'speakers', emoji: '🗣️', fixed: true,
    description: 'Delivers a Pathways-aligned prepared speech within the allotted time.',
    responsibilities: [
      'Deliver a Pathways-aligned prepared speech',
      'Stay within the allotted time — watch green / amber / red signals',
      'Incorporate feedback from previous evaluations',
      'Introduce yourself and your Pathways project to the audience',
      'Thank your evaluator after the session',
    ],
  },
  {
    code: 'EVAL', name: 'Evaluator', group: 'evaluators', emoji: '✍️', fixed: true,
    description: 'Gives verbal and written feedback on one assigned prepared speech.',
    responsibilities: [
      "Study your assigned speaker's Pathways project objectives",
      'Listen carefully and take notes during the speech',
      'Provide a 2–3 min verbal evaluation immediately after',
      'Submit a written evaluation form to the speaker',
      'Focus on commendations first, then recommendations',
    ],
  },
]

export const ROLE_ALIASES: Record<string, string> = {
  'listener': 'LISTEN',
  'listening post': 'LISTEN',
}

export function matchesEntry(slotRole: string, entry: CatalogueEntry): boolean {
  const r = slotRole.trim().toLowerCase()
  const resolved = ROLE_ALIASES[r] ?? slotRole.trim()
  return resolved.toLowerCase() === entry.code.toLowerCase() || r === entry.name.toLowerCase()
}
