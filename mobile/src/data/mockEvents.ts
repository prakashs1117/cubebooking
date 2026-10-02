export interface MCEvent {
  id: number;
  title: string;
  category: 'Townhall' | 'Wellness' | 'Technology' | 'Networking';
  month: string;
  day: string;
  date: string;
  time: string;
  location: string;
  type: 'Virtual' | 'In-Person' | 'Hybrid';
  capacity: number;
  registered: number;
  gradient: [string, string];
  description: string;
  isRegistered?: boolean;
}

export const MOCK_EVENTS: MCEvent[] = [
  {
    id: 1,
    title: 'Q2 Global Townhall',
    category: 'Townhall',
    month: 'JUN',
    day: '15',
    date: 'June 15, 2026',
    time: '10:00 AM – 11:30 AM',
    location: 'Virtual (Zoom)',
    type: 'Virtual',
    capacity: 2500,
    registered: 1872,
    gradient: ['#0ea5e9', '#6366f1'],
    description:
      'Join leadership for a company-wide update on Q2 performance, strategic priorities, and what\'s ahead for the rest of the year. Live Q&A session included.',
  },
  {
    id: 2,
    title: 'Mindfulness & Wellness Workshop',
    category: 'Wellness',
    month: 'JUN',
    day: '20',
    date: 'June 20, 2026',
    time: '12:00 PM – 1:00 PM',
    location: 'Room 3B, HQ Building',
    type: 'In-Person',
    capacity: 40,
    registered: 38,
    gradient: ['#34d399', '#10b981'],
    description:
      'A guided session on mindfulness techniques, stress management, and building resilience. Perfect for anyone looking to recharge mid-year.',
    isRegistered: true,
  },
  {
    id: 3,
    title: 'AI in Drug Discovery Summit',
    category: 'Technology',
    month: 'JUL',
    day: '8',
    date: 'July 8, 2026',
    time: '9:00 AM – 5:00 PM',
    location: 'Innovation Hub, Berlin',
    type: 'Hybrid',
    capacity: 300,
    registered: 187,
    gradient: ['#a855f7', '#ec4899'],
    description:
      'A full-day summit exploring the latest breakthroughs in AI-assisted drug discovery, clinical trial optimization, and regulatory AI applications. Featuring keynotes, panels, and demos.',
  },
  {
    id: 4,
    title: 'Cross-Function Networking Mixer',
    category: 'Networking',
    month: 'JUL',
    day: '14',
    date: 'July 14, 2026',
    time: '5:30 PM – 7:30 PM',
    location: 'Rooftop Lounge, 42F',
    type: 'In-Person',
    capacity: 120,
    registered: 74,
    gradient: ['#f59e0b', '#ec4899'],
    description:
      'An informal evening mixer to connect colleagues across departments. Light refreshments and drinks provided. No agenda — just great conversations.',
  },
];
