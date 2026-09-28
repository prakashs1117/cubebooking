import type { Question, SocialLink } from '../types'

export const J_Q: Question[] = [
  {
    id: 'goal',
    kind: 'multi',
    q: 'What are you hoping to get better at?',
    sub: 'Pick as many as you like.',
    opts: ['Public speaking', 'Confidence', 'Leadership', 'Interviews', 'Networking', 'Just curious'],
  },
  {
    id: 'level',
    kind: 'single',
    q: 'How much speaking experience do you have?',
    opts: ['Complete beginner', 'Spoken a few times', 'Comfortable already', 'Experienced speaker'],
  },
  {
    id: 'when',
    kind: 'multi',
    q: 'When could you attend?',
    sub: 'We meet Saturdays at 6 PM, and run occasional weekday sessions.',
    opts: ['Saturday evenings', 'Sunday mornings', 'Weekday evenings', 'Flexible'],
  },
  {
    id: 'mode',
    kind: 'single',
    q: 'How would you like to attend?',
    opts: ['In person, Chennai', 'Online', 'Either works'],
  },
  {
    id: 'source',
    kind: 'single',
    q: 'How did you find us?',
    opts: ['Instagram', 'A friend or colleague', 'Google search', 'LinkedIn', 'Somewhere else'],
  },
]

export const J_SOCIAL: SocialLink[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@chennaispeakers',
    href: '#',
    path: 'M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3ZM12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2ZM17.4 6.6h.01',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: '/chennai-speakers',
    href: '#',
    path: 'M4.5 3.5h15v17h-15zM8 10.5v6M8 7.6h.01M12 16.5v-3.4a2 2 0 0 1 4 0v3.4',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: '/chennaispeakers',
    href: '#',
    path: 'M14.5 21v-8h2.7l.5-3.2h-3.2V7.7c0-.9.3-1.6 1.7-1.6h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H8.5V13h2.7v8z',
  },
]

export const J_PATHS: Record<string, string> = {
  fwd: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  check: 'M4.5 12.5l5 5 10-11',
  mic: 'M12 14.5a3.2 3.2 0 0 0 3.2-3.2V5.7a3.2 3.2 0 1 0-6.4 0v5.6A3.2 3.2 0 0 0 12 14.5ZM5.5 11.3a6.5 6.5 0 0 0 13 0M12 18v3.2',
  mail: 'M3.5 6h17v12h-17zM3.5 7l8.5 6 8.5-6',
  person: 'M12 11.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4ZM4.8 20.3c0-3.8 3.2-6.4 7.2-6.4s7.2 2.6 7.2 6.4',
  chat: 'M4 5.5h16v10H8.5L4 19z',
  pin: 'M12 21.5s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 13a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 12 13Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.2l3.4 2',
  users: 'M8.5 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM2.8 20c0-3.3 2.6-5.6 5.7-5.6s5.7 2.3 5.7 5.6M16 5.2a3 3 0 0 1 0 5.9M17.4 14.7c2.2.5 3.8 2.4 3.8 5.3',
}

export const ANSWER_LABELS: Record<string, string> = {
  goal: 'Goals',
  level: 'Experience',
  when: 'Availability',
  mode: 'Attendance',
  source: 'How they found us',
}
