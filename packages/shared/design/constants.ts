// ============================================================================
// FluentEdge — Product Constants
// ============================================================================
// Ported verbatim from the design prototype:
//   design/fe/fe-onboarding.jsx (pillars, personas, goals)
//   design/fe/fe-profile.jsx    (subscription tiers)
// ============================================================================

import type { FETone } from './tokens';

// ----------------------------------------------------------------------------
// Six pillars (the assessment / scoring model)
// ----------------------------------------------------------------------------
export interface FEPillar {
  id: string;
  /** Short label (chips, radar axes) */
  short: string;
  /** Full descriptive title */
  full: string;
  /** FEGlyph icon name */
  icon: string;
  tone: FETone;
}

export const FE_PILLARS: FEPillar[] = [
  { id: 'confidence', short: 'Confidence', full: 'Speaking Comfort & Confidence', icon: 'flame', tone: 'orange' },
  { id: 'clarity', short: 'Clarity', full: 'Sentence Formation & Clarity', icon: 'bulb', tone: 'gold' },
  { id: 'fluency', short: 'Fluency', full: 'Fluency Flow & Response Speed', icon: 'zap', tone: 'blue' },
  { id: 'listening', short: 'Listening', full: 'Listening & Conversational Depth', icon: 'headphones', tone: 'teal' },
  { id: 'mindset', short: 'Mindset', full: 'Emotional Blocks & Insecurity', icon: 'heart', tone: 'pink' },
  { id: 'structure', short: 'Structure', full: 'Structured Expression & Influence', icon: 'layers', tone: 'iris' },
];

export type FEPillarId = (typeof FE_PILLARS)[number]['id'];

// ----------------------------------------------------------------------------
// Personas (assigned at assessment)
// ----------------------------------------------------------------------------
export interface FEPersona {
  id: string;
  name: string;
  tone: FETone;
  line: string;
}

export const FE_PERSONAS: Record<string, FEPersona> = {
  silent: { id: 'silent', name: 'The Silent Expert', tone: 'iris', line: 'You know your stuff — but you freeze when the room turns to you.' },
  over: { id: 'over', name: 'The Overthinker', tone: 'blue', line: 'You rehearse every sentence twice, so the moment passes you by.' },
  rusher: { id: 'rusher', name: 'The Rusher', tone: 'orange', line: 'Nerves speed you up. Slowing down is your superpower waiting to happen.' },
};

// ----------------------------------------------------------------------------
// Onboarding goals
// ----------------------------------------------------------------------------
export interface FEGoal {
  id: string;
  icon: string;
  tone: FETone;
  title: string;
  sub: string;
}

export const FE_GOALS: FEGoal[] = [
  { id: 'meetings', icon: 'megaphone', tone: 'orange', title: 'Speak up in meetings', sub: 'Be heard without overthinking' },
  { id: 'interviews', icon: 'person', tone: 'blue', title: 'Ace interviews', sub: 'Answer with clarity & calm' },
  { id: 'calls', icon: 'chat', tone: 'teal', title: 'Client & sales calls', sub: 'Lead the conversation' },
  { id: 'stage', icon: 'trophy', tone: 'pink', title: 'Public speaking', sub: 'Own the stage & the room' },
  { id: 'everyday', icon: 'users', tone: 'green', title: 'Everyday conversations', sub: 'Small talk to deep talk' },
  { id: 'anxiety', icon: 'heart', tone: 'iris', title: 'Beat speaking anxiety', sub: 'Quiet the inner critic' },
];

// ----------------------------------------------------------------------------
// Onboarding situations ("when do you freeze up?")
// ----------------------------------------------------------------------------
export interface FESituation {
  id: string;
  icon: string;
  tone: FETone;
  title: string;
}

export const FE_SITUATIONS: FESituation[] = [
  { id: 'groups', icon: 'users', tone: 'iris', title: 'Large groups' },
  { id: 'oneone', icon: 'chat', tone: 'blue', title: 'One-on-one talks' },
  { id: 'seniors', icon: 'crown', tone: 'gold', title: 'Presenting to seniors' },
  { id: 'calls', icon: 'headphones', tone: 'teal', title: 'Phone & video calls' },
  { id: 'network', icon: 'megaphone', tone: 'pink', title: 'Networking events' },
  { id: 'impromptu', icon: 'zap', tone: 'orange', title: 'On-the-spot moments' },
];

// ----------------------------------------------------------------------------
// Welcome slides + assessment prompts
// ----------------------------------------------------------------------------
export interface FEWelcomeSlide {
  /** [iconName, tone, size] triples for the floating cluster. */
  icons: [string, FETone, number][];
  title: string;
  sub: string;
}

export const FE_WELCOME_SLIDES: FEWelcomeSlide[] = [
  {
    icons: [['mic', 'iris', 92], ['wave', 'blue', 52], ['sparkle', 'gold', 46]],
    title: 'A stage in your pocket',
    sub: 'Duolingo teaches words. FluentEdge builds the confidence to actually speak — 90 seconds a day, wherever you are.',
  },
  {
    icons: [['users', 'teal', 92], ['shield', 'blue', 46], ['flame', 'orange', 52]],
    title: 'Grow with real people',
    sub: 'AI feedback that feels human, daily live speaking rooms, and a practice buddy who keeps you going.',
  },
];

export const FE_ASSESSMENT_PROMPTS: string[] = [
  'Tell me about a time you changed your mind about something.',
  'What is one piece of advice you wish you had ignored?',
  'Describe your ideal weekend in under a minute.',
  'If you could master one skill instantly, what would it be and why?',
];

// ----------------------------------------------------------------------------
// Subscription tiers
// ----------------------------------------------------------------------------
export interface FETier {
  id: string;
  name: string;
  tone: FETone;
  /** Display price (e.g. '₹0', '₹299'). */
  price: string;
  /** Period suffix (e.g. '/mo'); omitted for free. */
  per?: string;
  sub: string;
  current?: boolean;
  popular?: boolean;
  perks: string[];
}

export const FE_TIERS: FETier[] = [
  { id: 'free', name: 'Starter', tone: 'slate', price: '₹0', sub: 'Free forever', current: true, perks: ['1 daily challenge', '2 rooms / week', 'Voice journal'] },
  { id: 'silver', name: 'Foundation', tone: 'blue', price: '₹299', per: '/mo', sub: 'Starting fresh', perks: ['Unlimited challenges + full AI', 'Unlimited rooms + Anonymous', 'Practice buddy'] },
  { id: 'gold', name: 'Professional', tone: 'gold', price: '₹599', per: '/mo', sub: 'Workplace & client calls', popular: true, perks: ['AI Conversation Partner', 'Scenario packs + Framework', 'Certificates → LinkedIn'] },
  { id: 'diamond', name: 'Transformation', tone: 'iris', price: '₹1,499', per: '/mo', sub: 'Executive presence', perks: ['2 human coach sessions/mo', 'Coach-reviewed curriculum', 'Diamond cohort'] },
];

export type FETierId = (typeof FE_TIERS)[number]['id'];
