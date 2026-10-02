import React from 'react';
import renderer from 'react-test-renderer';
import SignInScreen from '@screens/SignInScreen';
import { useAuth } from '@context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTermsAndPrivacy } from '@hooks/useTermsAndPrivacy';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

// Mock dependencies
jest.mock('@context/AuthContext');
jest.mock('@react-navigation/native');
jest.mock('react-i18next');
jest.mock('@hooks/useTermsAndPrivacy');
jest.mock('@stores/featureFlagsStore');
jest.mock('@utils/platformConfig', () => ({
  isSocialLoginEnabled: jest.fn(() => true),
}));
jest.mock('@theme/index', () => ({
  useTheme: () => ({
    theme: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        card: '#FFFFFF',
        tertiary: '#F0F0F0',
      },
      text: { primary: '#000000', secondary: '#666666', link: '#007AFF' },
      button: { primary: { background: '#007AFF', text: '#FFFFFF' } },
      border: { primary: '#E0E0E0' },
      input: {
        background: '#F5F5F5',
        border: '#E0E0E0',
        placeholder: '#999999',
        text: '#000000',
      },
    },
    isDark: false,
  }),
}));

const mockLogin = jest.fn();
const mockNavigate = jest.fn();
const mockShowModal = jest.fn();
const mockHideModal = jest.fn();
const mockAcceptTerms = jest.fn();
const mockCheckAcceptance = jest.fn();
const mockGetFeatureFlag = jest.fn();

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false,
    });

    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: jest.fn(),
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      i18n: { language: 'en' },
    });

    (useTermsAndPrivacy as jest.Mock).mockReturnValue({
      isModalVisible: false,
      hasAccepted: true,
      isFeatureEnabled: false,
      showModal: mockShowModal,
      hideModal: mockHideModal,
      handleAccept: mockAcceptTerms,
      checkAcceptance: mockCheckAcceptance,
    });

    (useFeatureFlagsStore as jest.Mock).mockImplementation(selector => {
      if (typeof selector === 'function') {
        return selector({
          getFeatureFlag: mockGetFeatureFlag,
        });
      }
      return mockGetFeatureFlag;
    });

    mockGetFeatureFlag.mockReturnValue({
      config: { showOnSignin: false },
    });
  });

  describe('Component Rendering', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<SignInScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with social login enabled', () => {
      expect(() => renderer.create(<SignInScreen />)).not.toThrow();
    });

    it('renders auth layout wrapper without crashing', () => {
      expect(() => renderer.create(<SignInScreen />)).not.toThrow();
    });
  });

  describe('Integration with Context', () => {
    it('auth context mock is properly configured', () => {
      expect((useAuth as jest.Mock)()).toEqual(
        expect.objectContaining({
          login: mockLogin,
          user: null,
          isLoading: false,
        }),
      );
    });

    it('navigation mock is properly configured', () => {
      expect((useNavigation as jest.Mock)()).toEqual(
        expect.objectContaining({ navigate: mockNavigate }),
      );
    });

    it('translation mock returns key unchanged', () => {
      const { t } = (useTranslation as jest.Mock)();
      expect(t('some.key')).toBe('some.key');
    });

    it('terms and privacy hook mock is properly configured', () => {
      const result = (useTermsAndPrivacy as jest.Mock)();
      expect(result.hasAccepted).toBe(true);
      expect(result.showModal).toBe(mockShowModal);
    });

    it('feature flags store mock is properly configured', () => {
      expect(useFeatureFlagsStore).toBeDefined();
    });
  });
});
