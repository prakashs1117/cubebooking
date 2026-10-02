// import eventsData from '../../config/assets/events.json';

// Types for Event Data
export interface Speaker {
  name: string;
  role: string;
  company: string;
  bio?: string;
  image_url?: string;
  linkedin?: string;
  twitter?: string;
}

export interface SessionCapacity {
  filled: number;
  total: number;
  availability_percentage: number;
}

export interface Material {
  title: string;
  type: string;
  url: string;
  available_after?: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  type:
    | 'KEYNOTE'
    | 'WORKSHOP'
    | 'PANEL'
    | 'BREAK'
    | 'SOCIAL'
    | 'CEREMONY'
    | 'SPECIAL';
  time_start: string;
  time_end: string;
  timestamp_start: string;
  timestamp_end: string;
  duration_minutes: number;
  speaker?: Speaker;
  co_speakers?: Speaker[];
  moderator?: Speaker;
  panelists?: Speaker[];
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'FULL';
  capacity?: SessionCapacity;
  location: string;
  floor: string;
  tags: string[];
  requirements?: string[];
  materials?: Material[];
  cme_credits?: number;
}

export interface DaySchedule {
  date: string;
  day_number: number;
  label: string;
  sessions: Session[];
}

export interface EventData {
  id: string;
  name: string;
  theme: string;
  organizer: string;
  description: string;
  venue: {
    name: string;
    address: string;
    location: { lat: number; lng: number };
    distance_km: number;
    facilities: string[];
  };
  event_dates: {
    start_date: string;
    end_date: string;
    registration_deadline: string;
    timezone: string;
    timezone_offset: string;
  };
  contact: {
    email: string;
    phone: string;
    support_hours: string;
  };
  schedule: DaySchedule[];
  statistics: {
    total_sessions: number;
    total_speakers: number;
    total_workshops: number;
    total_keynotes: number;
    total_panels: number;
    total_cme_credits: number;
    expected_attendees: number;
    participating_companies: number;
    countries_represented: number;
  };
}

// Simulate API delay
const simulateNetworkDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Fetch all events data
 */
export const fetchEventsData = async (): Promise<EventData> => {
  try {
    await simulateNetworkDelay();
    console.log('@123 eventsData ', eventsData.event);
    return eventsData.event as EventData;
  } catch (error) {
    console.error('Error fetching events data:', error);
    throw new Error('Failed to load events data');
  }
};

/**
 * Fetch specific day schedule
 */
export const fetchDaySchedule = async (
  dayNumber: number,
): Promise<DaySchedule | null> => {
  try {
    await simulateNetworkDelay(400);
    const event = eventsData.event as EventData;
    const day = event.schedule.find(d => d.day_number === dayNumber);
    return day || null;
  } catch (error) {
    console.error('Error fetching day schedule:', error);
    throw new Error('Failed to load day schedule');
  }
};

/**
 * Fetch specific session details
 */
export const fetchSessionDetails = async (
  sessionId: string,
): Promise<Session | null> => {
  try {
    await simulateNetworkDelay(300);
    const event = eventsData.event as EventData;

    for (const day of event.schedule) {
      const session = day.sessions.find(s => s.id === sessionId);
      if (session) {
        return session;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw new Error('Failed to load session details');
  }
};

/**
 * Get session type color
 */
export const getSessionTypeColor = (type: Session['type']): string => {
  const colors: Record<Session['type'], string> = {
    KEYNOTE: '#8B5CF6',
    WORKSHOP: '#3B82F6',
    PANEL: '#10B981',
    BREAK: '#6B7280',
    SOCIAL: '#F59E0B',
    CEREMONY: '#EF4444',
    SPECIAL: '#EC4899',
  };
  return colors[type] || '#6B7280';
};

/**
 * Format session time range
 */
export const formatSessionTime = (session: Session): string => {
  return `${session.time_start} - ${session.time_end}`;
};

/**
 * Calculate capacity percentage color
 */
export const getCapacityColor = (percentage: number): string => {
  if (percentage >= 90) return '#EF4444';
  if (percentage >= 70) return '#F59E0B';
  return '#10B981';
};

/**
 * Get session status badge color
 */
export const getStatusColor = (status: Session['status']): string => {
  const colors: Record<Session['status'], string> = {
    UPCOMING: '#3B82F6',
    LIVE: '#10B981',
    COMPLETED: '#6B7280',
    CANCELLED: '#EF4444',
    FULL: '#F59E0B',
  };
  return colors[status] || '#6B7280';
};

const eventsData = {
  event: {
    id: 'PHARMA-CONNECT-2026',
    name: 'Pharma Connect 2026',
    theme: 'The Future of Medical Innovation and Pharmaceutical Excellence',
    organizer: 'Merck KGaA, Darmstadt, Germany',
    description:
      'Join industry leaders, researchers, and pharmaceutical professionals for three days of groundbreaking insights, networking, and innovation in medical science.',
    venue: {
      name: 'Grand Hyatt Convention Center',
      address: '123 Luxury Way, Berlin, Germany',
      location: {
        lat: 52.5101,
        lng: 13.3734,
      },
      distance_km: 4.2,
      facilities: ['WiFi', 'Parking', 'Catering', 'Medical Support'],
    },
    event_dates: {
      start_date: '2026-03-01',
      end_date: '2026-03-03',
      registration_deadline: '2026-02-22',
      timezone: 'Europe/Berlin',
      timezone_offset: '+01:00',
    },
    contact: {
      email: 'pharmaconnect@merckgroup.com',
      phone: '+49 30 1234 5678',
      support_hours: '08:00 AM - 06:00 PM CET',
    },
    schedule: [
      {
        date: '2026-03-01',
        day_number: 1,
        label: 'Day 1 - Innovation & Discovery',
        sessions: [
          {
            id: 'S101',
            title: 'Opening Ceremony & Welcome Address',
            description:
              'Official opening of Pharma Connect 2026 with welcome remarks from Merck KGaA leadership',
            type: 'CEREMONY',
            time_start: '08:30 AM',
            time_end: '09:00 AM',
            timestamp_start: '2026-03-01T08:30:00+01:00',
            timestamp_end: '2026-03-01T09:00:00+01:00',
            duration_minutes: 30,
            speaker: {
              name: 'Belén Garijo',
              role: 'CEO and Chairwoman of the Executive Board',
              company: 'Merck KGaA, Darmstadt, Germany',
              bio: "Leading Merck's global strategy in healthcare and life sciences",
              image_url: '/speakers/belen-garijo.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 450,
              total: 500,
              availability_percentage: 90,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#Opening', '#Leadership', '#Merck'],
            requirements: ['Registration Badge Required'],
            materials: [],
          },
          {
            id: 'S102',
            title: 'Keynote: Global Trends in Pharmaceutical Innovation 2026',
            description:
              'Explore the latest global trends shaping the pharmaceutical industry, from regulatory changes to breakthrough therapies',
            type: 'KEYNOTE',
            time_start: '09:00 AM',
            time_end: '10:30 AM',
            timestamp_start: '2026-03-01T09:00:00+01:00',
            timestamp_end: '2026-03-01T10:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Sarah Jenkins',
              role: 'Chief Medical Officer',
              company: 'Pfizer',
              bio: '25+ years in clinical research and drug development with focus on oncology and rare diseases',
              image_url: '/speakers/sarah-jenkins.jpg',
              linkedin: 'linkedin.com/in/sarahjenkins',
              twitter: '@DrSarahJenkins',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 92,
              total: 100,
              availability_percentage: 92,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#GlobalTrends', '#Innovation', '#Keynote'],
            requirements: ['Pre-registration Required', 'Limited Seating'],
            materials: [
              {
                title: 'Keynote Presentation Slides',
                type: 'PDF',
                url: '/materials/s102-slides.pdf',
                available_after: '10:30 AM',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S103',
            title: 'Coffee Break & Networking',
            description:
              'Refreshments and networking opportunity with fellow attendees',
            type: 'BREAK',
            time_start: '10:30 AM',
            time_end: '11:00 AM',
            timestamp_start: '2026-03-01T10:30:00+01:00',
            timestamp_end: '2026-03-01T11:00:00+01:00',
            duration_minutes: 30,
            status: 'UPCOMING',
            location: 'Grand Foyer',
            floor: 'Ground Floor',
            tags: ['#Networking', '#Break'],
            requirements: [],
          },
          {
            id: 'S104',
            title: 'Oncology Workshop: Q4 Clinical Trials Review',
            description:
              'In-depth analysis of recent oncology clinical trials, regulatory submissions, and breakthrough designations',
            type: 'WORKSHOP',
            time_start: '11:00 AM',
            time_end: '12:30 PM',
            timestamp_start: '2026-03-01T11:00:00+01:00',
            timestamp_end: '2026-03-01T12:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Marcus Thorne',
              role: 'Senior Clinical Research Scientist',
              company: 'Novartis',
              bio: 'Expert in immuno-oncology with 15+ publications in Nature and Lancet',
              image_url: '/speakers/marcus-thorne.jpg',
            },
            co_speakers: [
              {
                name: 'Dr. Emily Chen',
                role: 'Head of Oncology Research',
                company: 'Merck KGaA, Darmstadt, Germany',
              },
            ],
            status: 'UPCOMING',
            capacity: {
              filled: 45,
              total: 60,
              availability_percentage: 75,
            },
            location: 'Workshop Suite B',
            floor: '2nd Floor',
            tags: ['#Oncology', '#ClinicalTrials', '#Workshop'],
            requirements: [
              'Advanced Registration',
              'Oncology Background Preferred',
            ],
            materials: [
              {
                title: 'Clinical Trials Data Summary',
                type: 'PDF',
                url: '/materials/s104-trials-summary.pdf',
              },
              {
                title: 'Q4 Regulatory Updates',
                type: 'PDF',
                url: '/materials/s104-regulatory.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S105',
            title: 'Parallel Session: AI in Drug Discovery',
            description:
              'Machine learning and artificial intelligence applications in pharmaceutical research and development',
            type: 'WORKSHOP',
            time_start: '11:00 AM',
            time_end: '12:30 PM',
            timestamp_start: '2026-03-01T11:00:00+01:00',
            timestamp_end: '2026-03-01T12:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Raj Patel',
              role: 'Director of AI & Data Science',
              company: 'AstraZeneca',
              bio: 'Pioneer in applying deep learning to molecular design and target identification',
              image_url: '/speakers/raj-patel.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 55,
              total: 60,
              availability_percentage: 92,
            },
            location: 'Workshop Suite C',
            floor: '2nd Floor',
            tags: ['#AIPharma', '#DrugDiscovery', '#MachineLearning'],
            requirements: [
              'Laptop Recommended',
              'Basic Python Knowledge Helpful',
            ],
            materials: [
              {
                title: 'AI Workshop Code Repository',
                type: 'GitHub',
                url: 'github.com/pharmaconnect/ai-workshop',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S106',
            title: 'Industry Networking Lunch',
            description:
              'Catered lunch with opportunities to connect with speakers and industry peers',
            type: 'BREAK',
            time_start: '12:30 PM',
            time_end: '02:00 PM',
            timestamp_start: '2026-03-01T12:30:00+01:00',
            timestamp_end: '2026-03-01T14:00:00+01:00',
            duration_minutes: 90,
            status: 'UPCOMING',
            location: 'Grand Foyer & Terrace',
            floor: 'Ground Floor',
            tags: ['#Networking', '#Lunch'],
            requirements: ['Meal Ticket Included with Registration'],
            catering: {
              menu_type: 'Buffet',
              dietary_options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'],
            },
          },
          {
            id: 'S107',
            title: 'Panel Discussion: Precision Medicine and Genomics',
            description:
              'Expert panel discussing personalized medicine, genetic testing, and targeted therapies',
            type: 'PANEL',
            time_start: '02:00 PM',
            time_end: '03:30 PM',
            timestamp_start: '2026-03-01T14:00:00+01:00',
            timestamp_end: '2026-03-01T15:30:00+01:00',
            duration_minutes: 90,
            moderator: {
              name: 'Dr. Linda Morrison',
              role: 'Chief Science & Technology Officer',
              company: 'Roche',
            },
            panelists: [
              {
                name: 'Dr. Ahmed Hassan',
                role: 'Director of Genomics',
                company: 'Illumina',
              },
              {
                name: 'Dr. Sofia Rodriguez',
                role: 'Precision Medicine Lead',
                company: 'Merck KGaA, Darmstadt, Germany',
              },
              {
                name: 'Prof. James Liu',
                role: 'Professor of Molecular Biology',
                company: 'MIT',
              },
            ],
            status: 'UPCOMING',
            capacity: {
              filled: 78,
              total: 100,
              availability_percentage: 78,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#PrecisionMedicine', '#Genomics', '#Panel'],
            requirements: [],
            cme_credits: 1.5,
          },
          {
            id: 'S108',
            title: 'Afternoon Coffee Break',
            description: 'Refreshments available in the exhibition area',
            type: 'BREAK',
            time_start: '03:30 PM',
            time_end: '04:00 PM',
            timestamp_start: '2026-03-01T15:30:00+01:00',
            timestamp_end: '2026-03-01T16:00:00+01:00',
            duration_minutes: 30,
            status: 'UPCOMING',
            location: 'Exhibition Hall',
            floor: '1st Floor',
            tags: ['#Break', '#Exhibition'],
          },
          {
            id: 'S109',
            title: 'Regulatory Affairs: Navigating FDA & EMA Approvals',
            description:
              'Latest regulatory pathways, submission strategies, and compliance requirements',
            type: 'WORKSHOP',
            time_start: '04:00 PM',
            time_end: '05:30 PM',
            timestamp_start: '2026-03-01T16:00:00+01:00',
            timestamp_end: '2026-03-01T17:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Michael Schneider',
              role: 'VP Regulatory Affairs',
              company: 'Boehringer Ingelheim',
              bio: '30+ successful drug approvals across US and European markets',
              image_url: '/speakers/michael-schneider.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 42,
              total: 80,
              availability_percentage: 53,
            },
            location: 'Conference Room A',
            floor: '3rd Floor',
            tags: ['#RegulatoryAffairs', '#FDA', '#EMA'],
            requirements: ['Regulatory Background Preferred'],
            materials: [
              {
                title: 'FDA Approval Pathway Guide 2026',
                type: 'PDF',
                url: '/materials/s109-fda-guide.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S110',
            title: 'Welcome Reception & Poster Session',
            description:
              'Evening networking reception with poster presentations from research teams',
            type: 'SOCIAL',
            time_start: '06:00 PM',
            time_end: '08:00 PM',
            timestamp_start: '2026-03-01T18:00:00+01:00',
            timestamp_end: '2026-03-01T20:00:00+01:00',
            duration_minutes: 120,
            status: 'UPCOMING',
            capacity: {
              filled: 320,
              total: 400,
              availability_percentage: 80,
            },
            location: 'Grand Ballroom',
            floor: 'Ground Floor',
            tags: ['#Networking', '#PosterSession', '#Reception'],
            requirements: ['Registration Badge Required'],
            catering: {
              menu_type: 'Cocktail Reception',
              beverages: ['Wine', 'Beer', 'Soft Drinks'],
            },
          },
        ],
      },
      {
        date: '2026-03-02',
        day_number: 2,
        label: 'Day 2 - Technology & Transformation',
        sessions: [
          {
            id: 'S201',
            title: 'Morning Registration & Breakfast',
            description: 'Light breakfast and registration for Day 2 attendees',
            type: 'BREAK',
            time_start: '08:00 AM',
            time_end: '09:00 AM',
            timestamp_start: '2026-03-02T08:00:00+01:00',
            timestamp_end: '2026-03-02T09:00:00+01:00',
            duration_minutes: 60,
            status: 'UPCOMING',
            location: 'Grand Foyer',
            floor: 'Ground Floor',
            tags: ['#Registration', '#Breakfast'],
          },
          {
            id: 'S202',
            title: 'Keynote: Future of Labs - Automation in Drug Discovery',
            description:
              'Robotics, automation, and high-throughput screening technologies transforming pharmaceutical research',
            type: 'KEYNOTE',
            time_start: '09:00 AM',
            time_end: '10:30 AM',
            timestamp_start: '2026-03-02T09:00:00+01:00',
            timestamp_end: '2026-03-02T10:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Anna Kowalski',
              role: 'Chief Technology Officer',
              company: 'LabCorp Drug Development',
              bio: 'Leading innovation in laboratory automation and digital pathology',
              image_url: '/speakers/anna-kowalski.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 20,
              total: 80,
              availability_percentage: 25,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#Automation', '#LabTech', '#Innovation'],
            requirements: [],
            materials: [
              {
                title: 'Lab Automation Case Studies',
                type: 'PDF',
                url: '/materials/s202-automation.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S203',
            title: 'Coffee & Exhibition Tour',
            description:
              'Visit sponsor booths and learn about latest pharma technologies',
            type: 'BREAK',
            time_start: '10:30 AM',
            time_end: '11:00 AM',
            timestamp_start: '2026-03-02T10:30:00+01:00',
            timestamp_end: '2026-03-02T11:00:00+01:00',
            duration_minutes: 30,
            status: 'UPCOMING',
            location: 'Exhibition Hall',
            floor: '1st Floor',
            tags: ['#Exhibition', '#Break'],
          },
          {
            id: 'S204',
            title: 'Biotech Innovation: CRISPR & Gene Therapy',
            description:
              'Latest developments in gene editing, cell therapy, and regenerative medicine',
            type: 'WORKSHOP',
            time_start: '11:00 AM',
            time_end: '12:30 PM',
            timestamp_start: '2026-03-02T11:00:00+01:00',
            timestamp_end: '2026-03-02T12:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Prof. Jennifer Wu',
              role: 'Director of Gene Therapy Research',
              company: 'Bluebird Bio',
              bio: 'Pioneer in CRISPR applications for inherited diseases',
              image_url: '/speakers/jennifer-wu.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 65,
              total: 70,
              availability_percentage: 93,
            },
            location: 'Workshop Suite A',
            floor: '2nd Floor',
            tags: ['#BioTech', '#CRISPR', '#GeneTherapy'],
            requirements: ['Molecular Biology Background Recommended'],
            materials: [
              {
                title: 'CRISPR Applications Overview',
                type: 'PDF',
                url: '/materials/s204-crispr.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S205',
            title: 'Parallel Session: Supply Chain Resilience in Pharma',
            description:
              'Managing global supply chains, cold chain logistics, and pandemic preparedness',
            type: 'WORKSHOP',
            time_start: '11:00 AM',
            time_end: '12:30 PM',
            timestamp_start: '2026-03-02T11:00:00+01:00',
            timestamp_end: '2026-03-02T12:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Robert Chen',
              role: 'VP Global Supply Chain',
              company: 'Johnson & Johnson',
              bio: 'Expert in pharmaceutical logistics and distribution networks',
              image_url: '/speakers/robert-chen.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 38,
              total: 60,
              availability_percentage: 63,
            },
            location: 'Conference Room B',
            floor: '3rd Floor',
            tags: ['#SupplyChain', '#Logistics', '#Operations'],
            requirements: [],
            cme_credits: 1.5,
          },
          {
            id: 'S206',
            title: 'Networking Lunch & Roundtables',
            description:
              'Themed roundtable discussions during lunch on various pharma topics',
            type: 'BREAK',
            time_start: '12:30 PM',
            time_end: '02:00 PM',
            timestamp_start: '2026-03-02T12:30:00+01:00',
            timestamp_end: '2026-03-02T14:00:00+01:00',
            duration_minutes: 90,
            status: 'UPCOMING',
            location: 'Grand Foyer',
            floor: 'Ground Floor',
            tags: ['#Networking', '#Roundtable', '#Lunch'],
            roundtable_topics: [
              'Rare Disease Drug Development',
              'Digital Health Integration',
              'Biosimilars Market Outlook',
              'Clinical Trial Diversity',
            ],
          },
          {
            id: 'S207',
            title: 'Data Analytics & Real-World Evidence',
            description:
              'Leveraging big data, patient registries, and RWE for regulatory decisions',
            type: 'WORKSHOP',
            time_start: '02:00 PM',
            time_end: '03:30 PM',
            timestamp_start: '2026-03-02T14:00:00+01:00',
            timestamp_end: '2026-03-02T15:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Patricia Anderson',
              role: 'Head of Data Science',
              company: 'IQVIA',
              bio: 'Specialist in real-world evidence and health economics outcomes research',
              image_url: '/speakers/patricia-anderson.jpg',
            },
            co_speakers: [
              {
                name: 'Dr. Thomas Klein',
                role: 'Senior Data Analyst',
                company: 'Merck KGaA, Darmstadt, Germany',
              },
            ],
            status: 'UPCOMING',
            capacity: {
              filled: 52,
              total: 80,
              availability_percentage: 65,
            },
            location: 'Conference Room A',
            floor: '3rd Floor',
            tags: ['#DataAnalytics', '#RWE', '#BigData'],
            requirements: ['Statistical Knowledge Helpful'],
            materials: [
              {
                title: 'RWE Framework Guide',
                type: 'PDF',
                url: '/materials/s207-rwe-framework.pdf',
              },
              {
                title: 'Data Analytics Tools Demo',
                type: 'Video',
                url: '/materials/s207-demo.mp4',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S208',
            title: 'Parallel Session: Digital Health & Telemedicine',
            description:
              'Connected devices, remote patient monitoring, and digital therapeutics',
            type: 'WORKSHOP',
            time_start: '02:00 PM',
            time_end: '03:30 PM',
            timestamp_start: '2026-03-02T14:00:00+01:00',
            timestamp_end: '2026-03-02T15:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Maria Santos',
              role: 'Director Digital Health Innovation',
              company: 'Sanofi',
              bio: 'Expert in wearable technology and digital biomarkers',
              image_url: '/speakers/maria-santos.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 44,
              total: 60,
              availability_percentage: 73,
            },
            location: 'Workshop Suite B',
            floor: '2nd Floor',
            tags: ['#DigitalHealth', '#Telemedicine', '#Wearables'],
            requirements: [],
            cme_credits: 1.5,
          },
          {
            id: 'S209',
            title: 'Afternoon Break & Poster Viewing',
            description: 'Coffee and time to review research posters',
            type: 'BREAK',
            time_start: '03:30 PM',
            time_end: '04:00 PM',
            timestamp_start: '2026-03-02T15:30:00+01:00',
            timestamp_end: '2026-03-02T16:00:00+01:00',
            duration_minutes: 30,
            status: 'UPCOMING',
            location: 'Exhibition Hall',
            floor: '1st Floor',
            tags: ['#Break', '#PosterSession'],
          },
          {
            id: 'S210',
            title: 'Panel: Sustainability in Pharmaceutical Manufacturing',
            description:
              'Green chemistry, waste reduction, and environmental impact in drug production',
            type: 'PANEL',
            time_start: '04:00 PM',
            time_end: '05:30 PM',
            timestamp_start: '2026-03-02T16:00:00+01:00',
            timestamp_end: '2026-03-02T17:30:00+01:00',
            duration_minutes: 90,
            moderator: {
              name: 'Dr. Klaus Weber',
              role: 'Head of Sustainability',
              company: 'Merck KGaA, Darmstadt, Germany',
            },
            panelists: [
              {
                name: 'Dr. Emma Thompson',
                role: 'VP Manufacturing Excellence',
                company: 'GSK',
              },
              {
                name: 'Dr. Carlos Mendez',
                role: 'Director Environmental Affairs',
                company: 'Bayer',
              },
              {
                name: 'Dr. Yuki Tanaka',
                role: 'Green Chemistry Lead',
                company: 'Takeda',
              },
            ],
            status: 'UPCOMING',
            capacity: {
              filled: 68,
              total: 100,
              availability_percentage: 68,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#Sustainability', '#GreenChemistry', '#Manufacturing'],
            requirements: [],
            cme_credits: 1.5,
          },
          {
            id: 'S211',
            title: 'Startup Pitch Session: Emerging Pharma Innovations',
            description:
              'Five promising pharma startups present their breakthrough technologies',
            type: 'SPECIAL',
            time_start: '05:30 PM',
            time_end: '06:30 PM',
            timestamp_start: '2026-03-02T17:30:00+01:00',
            timestamp_end: '2026-03-02T18:30:00+01:00',
            duration_minutes: 60,
            status: 'UPCOMING',
            capacity: {
              filled: 95,
              total: 120,
              availability_percentage: 79,
            },
            location: 'Innovation Hub',
            floor: '2nd Floor',
            tags: ['#Startups', '#Innovation', '#Investing'],
            requirements: [],
            startups: [
              'BioNova Therapeutics - Novel Drug Delivery System',
              'GenomeX - AI-Powered Variant Analysis',
              'PharmaChain - Blockchain Supply Tracking',
              'NanoMed Solutions - Targeted Nanoparticle Therapy',
              'ClinTech AI - Clinical Trial Optimization',
            ],
          },
          {
            id: 'S212',
            title: 'Evening Gala Dinner & Awards Ceremony',
            description:
              'Formal dinner with presentation of Pharma Excellence Awards 2026',
            type: 'SOCIAL',
            time_start: '07:00 PM',
            time_end: '10:00 PM',
            timestamp_start: '2026-03-02T19:00:00+01:00',
            timestamp_end: '2026-03-02T22:00:00+01:00',
            duration_minutes: 180,
            status: 'UPCOMING',
            capacity: {
              filled: 285,
              total: 350,
              availability_percentage: 81,
            },
            location: 'Grand Ballroom',
            floor: 'Ground Floor',
            tags: ['#GalaDinner', '#Awards', '#Networking'],
            requirements: ['Separate Ticket Required', 'Formal Attire'],
            catering: {
              menu_type: 'Four-Course Dinner',
              dietary_options: [
                'Vegetarian',
                'Vegan',
                'Gluten-Free',
                'Kosher',
                'Halal',
              ],
            },
            awards: [
              'Breakthrough Innovation of the Year',
              'Clinical Excellence Award',
              'Sustainability Leadership Award',
              'Young Researcher Award',
            ],
          },
        ],
      },
      {
        date: '2026-03-03',
        day_number: 3,
        label: 'Day 3 - Future Perspectives',
        sessions: [
          {
            id: 'S301',
            title: 'Morning Breakfast & Networking',
            description:
              'Continental breakfast and final networking opportunities',
            type: 'BREAK',
            time_start: '08:00 AM',
            time_end: '09:00 AM',
            timestamp_start: '2026-03-03T08:00:00+01:00',
            timestamp_end: '2026-03-03T09:00:00+01:00',
            duration_minutes: 60,
            status: 'UPCOMING',
            location: 'Grand Foyer',
            floor: 'Ground Floor',
            tags: ['#Breakfast', '#Networking'],
          },
          {
            id: 'S302',
            title: 'Keynote: The Next Decade of Pharmaceutical Innovation',
            description:
              'Visionary perspectives on emerging technologies, therapies, and healthcare transformation',
            type: 'KEYNOTE',
            time_start: '09:00 AM',
            time_end: '10:30 AM',
            timestamp_start: '2026-03-03T09:00:00+01:00',
            timestamp_end: '2026-03-03T10:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. David Morrison',
              role: 'Chief Scientific Officer',
              company: 'Bristol Myers Squibb',
              bio: '40+ years in pharmaceutical research with focus on immunology and inflammation',
              image_url: '/speakers/david-morrison.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 145,
              total: 200,
              availability_percentage: 73,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#FutureTech', '#Innovation', '#Keynote'],
            requirements: [],
            materials: [
              {
                title: 'Future Trends Report 2026-2036',
                type: 'PDF',
                url: '/materials/s302-future-trends.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S303',
            title: 'Coffee Break & Last Exhibition Visit',
            description:
              'Final opportunity to visit sponsor booths and collect materials',
            type: 'BREAK',
            time_start: '10:30 AM',
            time_end: '11:00 AM',
            timestamp_start: '2026-03-03T10:30:00+01:00',
            timestamp_end: '2026-03-03T11:00:00+01:00',
            duration_minutes: 30,
            status: 'UPCOMING',
            location: 'Exhibition Hall',
            floor: '1st Floor',
            tags: ['#Break', '#Exhibition'],
          },
          {
            id: 'S304',
            title: 'Advanced Cell & Gene Therapies',
            description:
              'CAR-T cells, tissue engineering, and next-generation biological treatments',
            type: 'WORKSHOP',
            time_start: '11:00 AM',
            time_end: '12:30 PM',
            timestamp_start: '2026-03-03T11:00:00+01:00',
            timestamp_end: '2026-03-03T12:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Rachel Kim',
              role: 'VP Cell Therapy Development',
              company: 'Gilead Sciences',
              bio: 'Leading expert in CAR-T and TCR-T cell therapies for cancer',
              image_url: '/speakers/rachel-kim.jpg',
            },
            co_speakers: [
              {
                name: 'Dr. Andreas Mueller',
                role: 'Senior Scientist',
                company: 'Merck KGaA, Darmstadt, Germany',
              },
            ],
            status: 'UPCOMING',
            capacity: {
              filled: 58,
              total: 70,
              availability_percentage: 83,
            },
            location: 'Workshop Suite A',
            floor: '2nd Floor',
            tags: ['#CellTherapy', '#GeneTherapy', '#Oncology'],
            requirements: ['Advanced Biological Background'],
            materials: [
              {
                title: 'CAR-T Development Pipeline',
                type: 'PDF',
                url: '/materials/s304-cart-pipeline.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S305',
            title: 'Parallel Session: Patient-Centric Drug Development',
            description:
              'Incorporating patient perspectives, quality of life outcomes, and co-design approaches',
            type: 'WORKSHOP',
            time_start: '11:00 AM',
            time_end: '12:30 PM',
            timestamp_start: '2026-03-03T11:00:00+01:00',
            timestamp_end: '2026-03-03T12:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. Helen Foster',
              role: 'Director Patient Engagement',
              company: 'Eli Lilly',
              bio: 'Advocate for patient involvement in clinical research and drug development',
              image_url: '/speakers/helen-foster.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 41,
              total: 60,
              availability_percentage: 68,
            },
            location: 'Conference Room B',
            floor: '3rd Floor',
            tags: ['#PatientCentric', '#ClinicalTrials', '#QualityOfLife'],
            requirements: [],
            special_guests: [
              {
                name: 'Patient Advocate Panel',
                description:
                  'Three patient representatives sharing lived experiences',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S306',
            title: 'Networking Lunch & Career Fair',
            description:
              'Final lunch with recruitment booths from leading pharma companies',
            type: 'BREAK',
            time_start: '12:30 PM',
            time_end: '02:00 PM',
            timestamp_start: '2026-03-03T12:30:00+01:00',
            timestamp_end: '2026-03-03T14:00:00+01:00',
            duration_minutes: 90,
            status: 'UPCOMING',
            location: 'Grand Foyer & Terrace',
            floor: 'Ground Floor',
            tags: ['#CareerFair', '#Recruitment', '#Lunch'],
            participating_companies: [
              'Merck KGaA, Darmstadt, Germany',
              'Pfizer',
              'Novartis',
              'Roche',
              'AstraZeneca',
              'Johnson & Johnson',
              'Sanofi',
              'GSK',
            ],
          },
          {
            id: 'S307',
            title: 'Antimicrobial Resistance: Global Challenge',
            description:
              'Strategies to combat antibiotic resistance and develop new antimicrobial agents',
            type: 'WORKSHOP',
            time_start: '02:00 PM',
            time_end: '03:30 PM',
            timestamp_start: '2026-03-03T14:00:00+01:00',
            timestamp_end: '2026-03-03T15:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: "Prof. Margaret O'Brien",
              role: 'Director of Infectious Diseases',
              company: 'WHO Collaborating Centre',
              bio: 'Global health expert on antimicrobial resistance and stewardship programs',
              image_url: '/speakers/margaret-obrien.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 62,
              total: 80,
              availability_percentage: 78,
            },
            location: 'Conference Room A',
            floor: '3rd Floor',
            tags: ['#AMR', '#InfectiousDiseases', '#GlobalHealth'],
            requirements: [],
            materials: [
              {
                title: 'WHO AMR Action Plan 2026',
                type: 'PDF',
                url: '/materials/s307-amr-plan.pdf',
              },
            ],
            cme_credits: 1.5,
          },
          {
            id: 'S308',
            title: 'Parallel Session: Rare Diseases & Orphan Drugs',
            description:
              'Development strategies, regulatory pathways, and market access for rare disease treatments',
            type: 'WORKSHOP',
            time_start: '02:00 PM',
            time_end: '03:30 PM',
            timestamp_start: '2026-03-03T14:00:00+01:00',
            timestamp_end: '2026-03-03T15:30:00+01:00',
            duration_minutes: 90,
            speaker: {
              name: 'Dr. François Dubois',
              role: 'Head of Rare Disease Unit',
              company: 'Biogen',
              bio: 'Specialist in neurodegenerative rare diseases and orphan drug development',
              image_url: '/speakers/francois-dubois.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 48,
              total: 60,
              availability_percentage: 80,
            },
            location: 'Workshop Suite B',
            floor: '2nd Floor',
            tags: ['#RareDiseases', '#OrphanDrugs', '#Neurology'],
            requirements: [],
            cme_credits: 1.5,
          },
          {
            id: 'S309',
            title: 'Final Coffee Break',
            description: 'Last refreshment break before closing sessions',
            type: 'BREAK',
            time_start: '03:30 PM',
            time_end: '04:00 PM',
            timestamp_start: '2026-03-03T15:30:00+01:00',
            timestamp_end: '2026-03-03T16:00:00+01:00',
            duration_minutes: 30,
            status: 'UPCOMING',
            location: 'Grand Foyer',
            floor: 'Ground Floor',
            tags: ['#Break'],
          },
          {
            id: 'S310',
            title: 'Panel: Diversity, Equity & Inclusion in Clinical Trials',
            description:
              'Addressing underrepresentation, health disparities, and inclusive research practices',
            type: 'PANEL',
            time_start: '04:00 PM',
            time_end: '05:00 PM',
            timestamp_start: '2026-03-03T16:00:00+01:00',
            timestamp_end: '2026-03-03T17:00:00+01:00',
            duration_minutes: 60,
            moderator: {
              name: 'Dr. Jamal Washington',
              role: 'Chief Diversity Officer',
              company: 'Merck & Co.',
            },
            panelists: [
              {
                name: 'Dr. Priya Sharma',
                role: 'Clinical Trials Lead',
                company: 'Novartis',
              },
              {
                name: 'Dr. Carmen Ortiz',
                role: 'Health Equity Director',
                company: 'NIH',
              },
              {
                name: 'Dr. Nadia Ahmed',
                role: 'Community Engagement Manager',
                company: 'Pfizer',
              },
            ],
            status: 'UPCOMING',
            capacity: {
              filled: 88,
              total: 100,
              availability_percentage: 88,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#Diversity', '#Inclusion', '#ClinicalTrials'],
            requirements: [],
            cme_credits: 1.0,
          },
          {
            id: 'S311',
            title: 'Closing Keynote: Leadership in Times of Change',
            description:
              'Inspirational closing address on leadership, innovation, and the future of healthcare',
            type: 'KEYNOTE',
            time_start: '05:00 PM',
            time_end: '06:00 PM',
            timestamp_start: '2026-03-03T17:00:00+01:00',
            timestamp_end: '2026-03-03T18:00:00+01:00',
            duration_minutes: 60,
            speaker: {
              name: 'Danny Bar-Zohar',
              role: 'CEO Healthcare',
              company: 'Merck KGaA, Darmstadt, Germany',
              bio: "Leading Merck's healthcare business sector with focus on patient outcomes",
              image_url: '/speakers/danny-bar-zohar.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 175,
              total: 200,
              availability_percentage: 88,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#Leadership', '#ClosingKeynote', '#Merck'],
            requirements: [],
            cme_credits: 1.0,
          },
          {
            id: 'S312',
            title: 'Closing Ceremony & Certificate Distribution',
            description:
              'Official closing remarks, certificate of attendance distribution, and thank you address',
            type: 'CEREMONY',
            time_start: '06:00 PM',
            time_end: '06:30 PM',
            timestamp_start: '2026-03-03T18:00:00+01:00',
            timestamp_end: '2026-03-03T18:30:00+01:00',
            duration_minutes: 30,
            speaker: {
              name: 'Helene von Roeder',
              role: 'CFO',
              company: 'Merck KGaA, Darmstadt, Germany',
              bio: 'Chief Financial Officer of Merck KGaA',
              image_url: '/speakers/helene-von-roeder.jpg',
            },
            status: 'UPCOMING',
            capacity: {
              filled: 180,
              total: 200,
              availability_percentage: 90,
            },
            location: 'Main Auditorium',
            floor: 'Ground Floor',
            tags: ['#ClosingCeremony', '#Certificates'],
            requirements: [
              'Must have attended 70% of sessions for certificate',
            ],
            certificates: {
              type: 'Digital Certificate',
              delivery: 'Email within 48 hours',
              includes_cme: true,
            },
          },
          {
            id: 'S313',
            title: 'Farewell Cocktail Reception',
            description:
              'Final networking opportunity with light refreshments and farewell to attendees',
            type: 'SOCIAL',
            time_start: '06:30 PM',
            time_end: '08:00 PM',
            timestamp_start: '2026-03-03T18:30:00+01:00',
            timestamp_end: '2026-03-03T20:00:00+01:00',
            duration_minutes: 90,
            status: 'UPCOMING',
            capacity: {
              filled: 220,
              total: 300,
              availability_percentage: 73,
            },
            location: 'Grand Terrace',
            floor: 'Ground Floor',
            tags: ['#Networking', '#FarewellReception'],
            requirements: ['Registration Badge Required'],
            catering: {
              menu_type: 'Cocktail Reception',
              beverages: ['Wine', 'Beer', 'Cocktails', 'Soft Drinks'],
              appetizers: true,
            },
          },
        ],
      },
    ],
    statistics: {
      total_sessions: 38,
      total_speakers: 45,
      total_workshops: 15,
      total_keynotes: 4,
      total_panels: 3,
      total_cme_credits: 30.0,
      expected_attendees: 500,
      participating_companies: 25,
      countries_represented: 18,
    },
    cme_accreditation: {
      provider:
        'European Accreditation Council for Continuing Medical Education (EACCME)',
      total_credits: 30.0,
      validity: 'Valid through December 31, 2026',
      requirements: 'Minimum 70% session attendance and post-event evaluation',
    },
    sponsors: {
      platinum: [
        {
          name: 'Pfizer',
          booth: 'P-01',
          logo_url: '/sponsors/pfizer.png',
        },
        {
          name: 'Novartis',
          booth: 'P-02',
          logo_url: '/sponsors/novartis.png',
        },
      ],
      gold: [
        {
          name: 'Roche',
          booth: 'G-01',
          logo_url: '/sponsors/roche.png',
        },
        {
          name: 'AstraZeneca',
          booth: 'G-02',
          logo_url: '/sponsors/astrazeneca.png',
        },
        {
          name: 'Johnson & Johnson',
          booth: 'G-03',
          logo_url: '/sponsors/jnj.png',
        },
      ],
      silver: [
        {
          name: 'Sanofi',
          booth: 'S-01',
          logo_url: '/sponsors/sanofi.png',
        },
        {
          name: 'GSK',
          booth: 'S-02',
          logo_url: '/sponsors/gsk.png',
        },
        {
          name: 'Bayer',
          booth: 'S-03',
          logo_url: '/sponsors/bayer.png',
        },
        {
          name: 'Boehringer Ingelheim',
          booth: 'S-04',
          logo_url: '/sponsors/boehringer.png',
        },
      ],
    },
    app_features: {
      registration: {
        fields_required: [
          'full_name',
          'email',
          'phone',
          'company_name',
          'job_title',
          'department',
          'years_of_experience',
          'specialization',
          'dietary_requirements',
          'emergency_contact',
        ],
        optional_fields: [
          'linkedin_profile',
          'research_interests',
          'networking_preferences',
        ],
      },
      attendance_tracking: {
        methods: ['QR_CODE_SCAN', 'MANUAL_CHECKIN', 'NFC_BADGE'],
        check_in_requirements:
          'Must check in within 15 minutes of session start',
        check_out_requirements:
          'Optional but recommended for certificate validation',
      },
      notifications: {
        types: [
          'SESSION_REMINDER',
          'SCHEDULE_CHANGE',
          'SPEAKER_UPDATE',
          'NETWORKING_MATCH',
          'CERTIFICATE_READY',
        ],
        reminder_timing: ['1_DAY_BEFORE', '1_HOUR_BEFORE', '15_MIN_BEFORE'],
      },
      networking: {
        features: [
          'Attendee Directory',
          'Meeting Scheduler',
          'Interest-based Matching',
          'Chat Messaging',
          'Business Card Exchange',
        ],
      },
      materials: {
        access: 'Available during event and 30 days post-event',
        formats: ['PDF', 'Video', 'Audio Recording'],
        download_limit: 'Unlimited for registered attendees',
      },
    },
    session_types_legend: {
      KEYNOTE: 'Main stage presentations by industry leaders',
      WORKSHOP: 'Interactive sessions with hands-on learning',
      PANEL: 'Expert discussions with Q&A',
      BREAK: 'Networking and refreshment breaks',
      SOCIAL: 'Evening receptions and social events',
      CEREMONY: 'Official opening/closing ceremonies',
      SPECIAL: 'Unique programming like startup pitches',
    },
    status_types_legend: {
      UPCOMING: 'Session scheduled but not yet started',
      LIVE: 'Session currently in progress',
      COMPLETED: 'Session has ended',
      CANCELLED: 'Session cancelled',
      FULL: 'No more capacity available',
    },
    tags_explanation: {
      '#Oncology': 'Cancer research and treatments',
      '#BioTech': 'Biotechnology and biopharmaceuticals',
      '#ClinicalTrials': 'Clinical research and trial design',
      '#AIPharma': 'Artificial intelligence in pharmaceuticals',
      '#Genomics': 'Genetic research and precision medicine',
      '#RegulatoryAffairs': 'FDA, EMA, and compliance topics',
      '#SupplyChain': 'Logistics and distribution',
      '#DigitalHealth': 'Digital therapeutics and health tech',
      '#Sustainability': 'Environmental and green initiatives',
      '#Leadership': 'Management and business strategy',
    },
    attendee_benefits: {
      included_in_registration: [
        'Access to all keynotes and workshops',
        'Daily breakfast and lunch',
        'Coffee breaks throughout the day',
        'Welcome reception on Day 1',
        'Event materials and presentations',
        'CME credits certificate',
        'Networking app access',
        'Exhibition hall access',
        'Event badge and lanyard',
      ],
      optional_extras: [
        {
          item: 'Gala Dinner Ticket',
          price: '€150',
          availability: 'Limited to 350 seats',
        },
        {
          item: 'Post-Event Recording Access',
          price: '€75',
          availability: 'All sessions recorded',
        },
        {
          item: 'VIP Lounge Access',
          price: '€200',
          availability: 'Premium refreshments and quiet workspace',
        },
      ],
    },
    transportation: {
      airport_transfers: {
        available: true,
        airports: ['Berlin Brandenburg Airport (BER)'],
        shuttle_times: ['06:00 AM - 10:00 PM'],
        booking_required: true,
      },
      parking: {
        available: true,
        capacity: 200,
        cost: '€15/day',
        electric_charging: true,
      },
      public_transport: {
        nearest_station: 'Potsdamer Platz U-Bahn',
        distance: '500m',
        lines: ['U2', 'S1', 'S2', 'S25'],
      },
    },
    accommodation: {
      partner_hotels: [
        {
          name: 'Grand Hyatt Berlin',
          distance_km: 0.1,
          room_rate: '€220/night',
          discount_code: 'PHARMA2026',
          available_until: '2026-02-01',
        },
        {
          name: 'Hotel Adlon Kempinski',
          distance_km: 0.8,
          room_rate: '€350/night',
          discount_code: 'PHARMA2026',
          available_until: '2026-02-01',
        },
        {
          name: 'NH Collection Berlin Mitte',
          distance_km: 1.2,
          room_rate: '€180/night',
          discount_code: 'PHARMA2026',
          available_until: '2026-02-01',
        },
      ],
    },
    health_safety: {
      measures: [
        'On-site medical support available',
        'First aid stations on each floor',
        'Emergency evacuation procedures posted',
        'Food safety certifications',
        'Accessibility accommodations available',
      ],
      emergency_contacts: {
        event_medical: '+49 30 1234 5600',
        venue_security: '+49 30 1234 5601',
        event_organizer: '+49 30 1234 5678',
      },
    },
    wifi: {
      network_name: 'PharmaConnect2026',
      password: 'Innovation2026',
      coverage: 'Full venue coverage',
      bandwidth: 'High-speed fiber connection',
    },
    mobile_app_technical: {
      platform_support: ['iOS 14+', 'Android 10+'],
      offline_mode: true,
      languages: ['English', 'German', 'French', 'Spanish'],
      data_sync: 'Real-time updates every 5 minutes',
      qr_scanner: 'Built-in for attendance and networking',
    },
    feedback_evaluation: {
      session_feedback: {
        timing: 'Available immediately after each session',
        required_for_cme: true,
        questions: 5,
      },
      overall_event_feedback: {
        timing: 'Available from Day 3 closing',
        incentive: 'Enter to win free registration for 2027 event',
        questions: 15,
      },
    },
    post_event: {
      materials_access: '30 days via app and email',
      recordings_available: 'Within 7 days for premium ticket holders',
      certificate_delivery: 'Digital certificate within 48 hours',
      networking_access: 'App remains active for 60 days',
      survey_deadline: 'March 10, 2026',
    },
    important_dates: {
      early_bird_deadline: '2026-01-15',
      regular_registration_deadline: '2026-02-15',
      late_registration_deadline: '2026-02-22',
      hotel_booking_deadline: '2026-02-01',
      abstract_submission_deadline: '2025-12-15',
      speaker_confirmation: '2026-01-05',
    },
    registration_pricing: {
      early_bird: {
        industry: '€495',
        academic: '€295',
        student: '€150',
      },
      regular: {
        industry: '€695',
        academic: '€395',
        student: '€200',
      },
      late: {
        industry: '€850',
        academic: '€495',
        student: '€250',
      },
      group_discounts: {
        '3_to_5_attendees': '10%',
        '6_to_10_attendees': '15%',
        '11_plus_attendees': '20%',
      },
    },
    social_media: {
      hashtags: ['#PharmaConnect2026', '#FutureOfPharma', '#MerckEvent'],
      twitter: '@PharmaConnect',
      linkedin: 'Pharma Connect 2026',
      instagram: '@pharmaconnect_official',
      live_streaming: 'Selected keynotes available on YouTube',
    },
  },
};
