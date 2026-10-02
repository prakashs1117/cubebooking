export type FeedCategory = 'Healthcare' | 'Learning' | 'Culture';

export interface MCPost {
  id: number;
  name: string;
  role: string;
  timestamp: string;
  content: string;
  category: FeedCategory;
  likes: number;
  comments: number;
  shares: number;
  initials: string;
  gradientIndex: number;
  hasImage: boolean;
  isLiked?: boolean;
}

export const MOCK_FEED: MCPost[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'VP, Clinical Operations',
    timestamp: '2h ago',
    content:
      'Thrilled to share that our Phase III trial for MK-7824 hit its primary endpoint with statistical significance! This is the result of years of dedication from an incredible global team. More details to follow in the upcoming press release. 🎉',
    category: 'Healthcare',
    likes: 489,
    comments: 41,
    shares: 33,
    initials: 'SC',
    gradientIndex: 0,
    hasImage: false,
  },
  {
    id: 2,
    name: 'James Rivera',
    role: 'Senior Research Scientist',
    timestamp: '4h ago',
    content:
      'Just wrapped up an amazing 3-day workshop on generative AI for protein structure prediction. If you\'re working in R&D and haven\'t explored AlphaFold 3 integrations yet, it\'s well worth the time. Happy to share resources in the comments.',
    category: 'Learning',
    likes: 312,
    comments: 28,
    shares: 19,
    initials: 'JR',
    gradientIndex: 1,
    hasImage: false,
  },
  {
    id: 3,
    name: 'Aisha Patel',
    role: 'Director, People & Culture',
    timestamp: '6h ago',
    content:
      'Our 2026 "Culture Matters" employee survey results are in — and they\'re the best we\'ve seen in 5 years! Inclusion score up +8pts, psychological safety at 84%. A huge thank you to every person who responded and leads who acted. You made this happen.',
    category: 'Culture',
    likes: 156,
    comments: 12,
    shares: 8,
    initials: 'AP',
    gradientIndex: 2,
    hasImage: false,
  },
  {
    id: 4,
    name: 'Luca Ferrari',
    role: 'Product Manager, Digital Health',
    timestamp: '8h ago',
    content:
      'Excited to announce that MerckConnect now has over 28,000 active users across 42 countries! We shipped 14 features this quarter alone based on your feedback. Keep the ideas coming — every suggestion goes into our roadmap process.',
    category: 'Culture',
    likes: 241,
    comments: 35,
    shares: 14,
    initials: 'LF',
    gradientIndex: 3,
    hasImage: false,
  },
  {
    id: 5,
    name: 'Maya Goldstein',
    role: 'Principal Scientist, Oncology',
    timestamp: '1d ago',
    content:
      'Our oncology team presented at ASCO this week — proud to see so many years of work come to life on a global stage. The conversations happening around our ADC pipeline were electric. Science is never a solo sport.',
    category: 'Healthcare',
    likes: 378,
    comments: 22,
    shares: 27,
    initials: 'MG',
    gradientIndex: 4,
    hasImage: false,
  },
  {
    id: 6,
    name: 'André Boateng',
    role: 'Global Supply Chain Lead',
    timestamp: '1d ago',
    content:
      'After 6 months of work, our new AI-driven demand forecasting model went live across 18 markets this week. Early results show ~23% reduction in stockouts. Grateful to the cross-functional team that made this a reality.',
    category: 'Learning',
    likes: 193,
    comments: 18,
    shares: 11,
    initials: 'AB',
    gradientIndex: 5,
    hasImage: false,
  },
];
