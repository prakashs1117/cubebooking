export interface MCPerson {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  location: string;
  gradientIndex: number;
}

export const MOCK_PEOPLE: MCPerson[] = [
  {
    id: 'p1',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'VP, Clinical Operations',
    department: 'Clinical',
    location: 'Darmstadt, DE',
    gradientIndex: 0,
  },
  {
    id: 'p2',
    firstName: 'James',
    lastName: 'Rivera',
    role: 'Senior Research Scientist',
    department: 'R&D',
    location: 'Boston, US',
    gradientIndex: 1,
  },
  {
    id: 'p3',
    firstName: 'Aisha',
    lastName: 'Patel',
    role: 'Director, People & Culture',
    department: 'HR',
    location: 'Mumbai, IN',
    gradientIndex: 2,
  },
  {
    id: 'p4',
    firstName: 'Luca',
    lastName: 'Ferrari',
    role: 'Product Manager, Digital Health',
    department: 'Innovation',
    location: 'Milan, IT',
    gradientIndex: 3,
  },
  {
    id: 'p5',
    firstName: 'Maya',
    lastName: 'Goldstein',
    role: 'Principal Scientist, Oncology',
    department: 'R&D',
    location: 'Tel Aviv, IL',
    gradientIndex: 4,
  },
  {
    id: 'p6',
    firstName: 'André',
    lastName: 'Boateng',
    role: 'Global Supply Chain Lead',
    department: 'Operations',
    location: 'Geneva, CH',
    gradientIndex: 5,
  },
  {
    id: 'p7',
    firstName: 'Takuya',
    lastName: 'Becker',
    role: 'Data Engineer, AI Platform',
    department: 'Technology',
    location: 'Tokyo, JP',
    gradientIndex: 0,
  },
];
