export interface AwardCategory {
  id: string
  label: string
  emoji: string
  slotGroups: string[]
  roleKeywords: string[]
  manualOnly: boolean
  guestNominees?: boolean
}

export const AWARD_CATEGORIES: AwardCategory[] = [
  {
    id: 'bestTableTopicSpeaker',
    label: 'Best Table Topic Speaker',
    emoji: '🎤',
    slotGroups: ['tableTopics'] as string[],
    roleKeywords: [],
    manualOnly: false,
    guestNominees: true,
  },
  {
    id: 'bestSpeaker',
    label: 'Best Speaker',
    emoji: '🏆',
    slotGroups: ['speakers'] as string[],
    roleKeywords: [],
    manualOnly: false,
  },
  {
    id: 'bestEvaluator',
    label: 'Best Evaluator',
    emoji: '🌟',
    slotGroups: ['evaluators'] as string[],
    roleKeywords: [],
    manualOnly: false,
  },
  {
    id: 'haHaInvoker',
    label: 'HaHa Invoker',
    emoji: '😂',
    slotGroups: [] as string[],
    roleKeywords: [],
    manualOnly: true,
  },
  {
    id: 'bestRoleTaker',
    label: 'Best Role Taker',
    emoji: '🎭',
    slotGroups: ['roleTakers'] as string[],
    roleKeywords: [],
    manualOnly: false,
  },
  {
    id: 'bestTagTeam',
    label: 'Best Tag Team',
    emoji: '🏷️',
    slotGroups: ['tagl'] as string[],
    roleKeywords: [],
    manualOnly: false,
  },
]
