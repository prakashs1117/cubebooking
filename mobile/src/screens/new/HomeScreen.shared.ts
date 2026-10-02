export const mockFeedPosts = [
  {
    id: '1',
    author: {
      name: 'Ananya Rao',
      role: 'Data Science',
      timestamp: '2h ago',
      initials: 'AR',
      gradient: ['#0F69AF', '#2DBECD'] as [string, string],
    },
    type: 'blog' as const,
    title: 'Scaling ML pipelines for clinical trials',
    content:
      'what we learned moving from batch scoring to real-time inference across 3 regions…',
    media: { type: 'video' as const, label: '5 min read · with video' },
    metrics: { likes: 248, comments: 36, shares: 0 },
    userActions: { liked: true, saved: false },
  },
  {
    id: '2',
    author: {
      name: 'People & Culture',
      role: 'Official',
      timestamp: '5h ago',
      initials: 'HR',
      gradient: ['#149B5F', '#0B5A37'] as [string, string],
    },
    type: 'kudos' as const,
    content: 'Celebrating excellence in cross-functional delivery this quarter 🎉',
    kudos: {
      title: 'Frontend Guild — Demand Portal launch',
      description: 'Spot Award · nominated by 6 colleagues',
    },
    metrics: { likes: 512, comments: 74, shares: 0 },
    userActions: { liked: false, saved: false },
  },
  {
    id: '3',
    author: {
      name: 'Corporate Comms',
      role: 'Official',
      timestamp: 'Yesterday',
      initials: 'CM',
      gradient: ['#B07B00', '#FFC832'] as [string, string],
    },
    type: 'news' as const,
    title: 'New Bengaluru hub opens its doors.',
    content:
      '1,200 workstations, wellness floor and a maker lab — take the virtual tour and book your desk orientation.',
    media: { type: 'image' as const, label: 'Hub interior gallery' },
    metrics: { likes: 1100, comments: 203, shares: 0 },
    userActions: { liked: false, saved: false },
  },
  {
    id: '4',
    author: {
      name: 'James Mitchell',
      role: 'Engineering',
      timestamp: '18h ago',
      initials: 'JM',
      gradient: ['#E74C3C', '#C0392B'] as [string, string],
    },
    type: 'blog' as const,
    title: 'Microservices migration — lessons from 2 years in production',
    content:
      '📚 A deep dive into why we chose Kubernetes, how we scaled from 12 to 847 containers, and the gotchas nobody tells you about.',
    media: { type: 'video' as const, label: '8 min video' },
    metrics: { likes: 847, comments: 152, shares: 0 },
    userActions: { liked: false, saved: false },
  },
  {
    id: '5',
    author: {
      name: 'Sarah Khan',
      role: 'Product Management',
      timestamp: '1d ago',
      initials: 'SK',
      gradient: ['#27AE60', '#229954'] as [string, string],
    },
    type: 'news' as const,
    title: 'Demand Portal v3.2 is live!',
    content:
      '🚀 New features: batch submission, API webhooks, custom workflows. Check the release notes and join the Q&A session Thursday 4 PM CET.',
    metrics: { likes: 2300, comments: 461, shares: 0 },
    userActions: { liked: true, saved: false },
  },
];
