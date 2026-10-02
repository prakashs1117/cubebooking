import React from 'react';
import renderer from 'react-test-renderer';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', dir: jest.fn(() => 'ltr') },
  }),
}));

jest.mock('@theme/index', () => ({
  useTheme: () => ({
    theme: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        card: '#FFFFFF',
        overlay: 'rgba(0, 0, 0, 0.5)',
        tertiary: '#F0F0F0',
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
        link: '#007AFF',
        error: '#FF3B30',
        disabled: '#CCCCCC',
      },
      button: { primary: { background: '#007AFF', text: '#FFFFFF' } },
      border: { primary: '#E0E0E0' },
    },
    isDark: false,
  }),
}));

jest.mock('@hooks/useLegalContent', () => ({
  useLegalContent: () => ({
    privacyPolicy: {
      title: 'Privacy Policy',
      lastUpdatedLabel: 'Last Updated',
      lastUpdatedDate: '2024-01-01',
      sections: [
        {
          id: 'intro',
          order: 1,
          title: 'Data Collection',
          content: 'We collect data to improve our services.',
        },
      ],
    },
    termsOfService: {
      title: 'Terms of Service',
      lastUpdatedLabel: 'Last Updated',
      lastUpdatedDate: '2024-01-01',
      sections: [
        {
          id: 'obligations',
          order: 1,
          title: 'User Obligations',
          content: 'Users must comply with all terms.',
        },
      ],
    },
    isLoading: false,
    error: null,
    source: 'json',
    refresh: jest.fn(),
  }),
}));

jest.mock('@hooks/useLegalModalAnimation', () => ({
  useLegalModalAnimation: () => ({
    fadeAnim: { setValue: jest.fn() },
    slideAnim: { setValue: jest.fn() },
  }),
}));

jest.mock('@hooks/useLegalModalState', () => ({
  useLegalModalState: () => ({
    isAccepted: false,
    activeTab: 'privacy',
    setActiveTab: jest.fn(),
    toggleAcceptance: jest.fn(),
    resetState: jest.fn(),
  }),
}));

jest.mock('@components/legal', () => ({
  LegalModalHeader: () => <></>,
  LegalModalTabs: () => <></>,
  LegalModalFooter: () => <></>,
  LegalDocumentView: () => <></>,
}));

const mockOnAccept = jest.fn();
const mockOnClose = jest.fn();

describe('TermsAndPrivacyModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders correctly when visible', () => {
      const tree = renderer
        .create(
          <TermsAndPrivacyModal
            visible={true}
            onAccept={mockOnAccept}
            onClose={mockOnClose}
          />,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders nothing when not visible', () => {
      const tree = renderer
        .create(
          <TermsAndPrivacyModal
            visible={false}
            onAccept={mockOnAccept}
            onClose={mockOnClose}
          />,
        )
        .toJSON();
      expect(tree).toBeFalsy();
    });

    it('renders with requireAcceptance prop', () => {
      expect(() =>
        renderer.create(
          <TermsAndPrivacyModal
            visible={true}
            onAccept={mockOnAccept}
            onClose={mockOnClose}
            requireAcceptance={true}
          />,
        ),
      ).not.toThrow();
    });
  });

  describe('Props and Callbacks', () => {
    it('accepts all required props', () => {
      const component = renderer.create(
        <TermsAndPrivacyModal
          visible={true}
          onAccept={mockOnAccept}
          onClose={mockOnClose}
        />,
      );

      expect(component).toBeTruthy();
    });

    it('accepts optional props', () => {
      const component = renderer.create(
        <TermsAndPrivacyModal
          visible={true}
          onAccept={mockOnAccept}
          onClose={mockOnClose}
          requireAcceptance={true}
        />,
      );

      expect(component).toBeTruthy();
    });
  });
});
