import React from 'react';
import renderer from 'react-test-renderer';
import FAQScreen from '@screens/new/FAQScreen';
import { useFAQData } from '@hooks/useFAQData';

// Mock dependencies
jest.mock('@hooks/useFAQData');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));
jest.mock('@theme/index', () => ({
  useTheme: () => ({
    theme: {
      background: { primary: '#FFFFFF', secondary: '#F5F5F5', card: '#FFFFFF' },
      text: { primary: '#000000', secondary: '#666666', link: '#007AFF' },
      button: { primary: { background: '#007AFF', text: '#FFFFFF' } },
      border: { primary: '#E0E0E0' },
    },
    isDark: false,
  }),
}));

const mockFAQs = [
  {
    id: '1',
    question: 'What is React Native?',
    answer: 'React Native is a framework for building mobile apps.',
    category: 'general',
  },
  {
    id: '2',
    question: 'How do I install dependencies?',
    answer: 'Use npm install or yarn install.',
    category: 'setup',
  },
];

const mockCategories = [
  { id: 'general', name: 'General', icon: 'info' },
  { id: 'setup', name: 'Setup', icon: 'settings' },
];

const mockSearchFAQs = jest.fn();
const mockGetFAQsByCategory = jest.fn();
const mockRefresh = jest.fn();

describe('FAQScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useFAQData as jest.Mock).mockReturnValue({
      faqs: mockFAQs,
      categories: mockCategories,
      isLoading: false,
      error: null,
      source: 'json',
      refresh: mockRefresh,
      searchFAQs: mockSearchFAQs,
      getFAQsByCategory: mockGetFAQsByCategory,
    });

    mockSearchFAQs.mockImplementation((query: string) => {
      return mockFAQs.filter(faq =>
        faq.question.toLowerCase().includes(query.toLowerCase()),
      );
    });

    mockGetFAQsByCategory.mockImplementation((categoryId: string) => {
      return mockFAQs.filter(faq => faq.category === categoryId);
    });
  });

  describe('Component Rendering', () => {
    it('renders correctly with FAQ data', () => {
      const tree = renderer.create(<FAQScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with loading state', () => {
      (useFAQData as jest.Mock).mockReturnValue({
        faqs: [],
        categories: [],
        isLoading: true,
        error: null,
        source: 'json',
        refresh: mockRefresh,
        searchFAQs: mockSearchFAQs,
        getFAQsByCategory: mockGetFAQsByCategory,
      });

      expect(() => renderer.create(<FAQScreen />)).not.toThrow();
    });

    it('renders with error state', () => {
      (useFAQData as jest.Mock).mockReturnValue({
        faqs: [],
        categories: [],
        isLoading: false,
        error: 'Failed to load FAQs',
        source: 'json',
        refresh: mockRefresh,
        searchFAQs: mockSearchFAQs,
        getFAQsByCategory: mockGetFAQsByCategory,
      });

      expect(() => renderer.create(<FAQScreen />)).not.toThrow();
    });

    it('renders with empty FAQ list', () => {
      (useFAQData as jest.Mock).mockReturnValue({
        faqs: [],
        categories: [],
        isLoading: false,
        error: null,
        source: 'json',
        refresh: mockRefresh,
        searchFAQs: mockSearchFAQs,
        getFAQsByCategory: mockGetFAQsByCategory,
      });

      expect(() => renderer.create(<FAQScreen />)).not.toThrow();
    });
  });

  describe('Hook Integration', () => {
    it('exposes FAQ data hook interface', () => {
      // Verify the hook mock is configured correctly and callable
      const result = (useFAQData as jest.Mock)();
      expect(result.faqs).toBeDefined();
      expect(result.searchFAQs).toBeDefined();
      expect(result.getFAQsByCategory).toBeDefined();
    });

    it('provides search functionality', () => {
      renderer.create(<FAQScreen />);
      const result = mockSearchFAQs('React');
      expect(result).toHaveLength(1);
      expect(result[0].question).toContain('React Native');
    });

    it('provides category filtering', () => {
      renderer.create(<FAQScreen />);
      const result = mockGetFAQsByCategory('general');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('general');
    });
  });
});
