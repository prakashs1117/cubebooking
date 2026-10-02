/**
 * HomeScreen Component Tests
 * Tests for the main home screen with localization and theme functionality
 */

import React from 'react';
import renderer from 'react-test-renderer';
import HomeScreen from '@screens/HomeScreen';

// Mock the Icon component
jest.mock('@components/icons/Icon', () => () => null);

// Mock font utilities
jest.mock('@utils/fonts', () => ({
  getFontStyle: jest.fn(() => ({
    fontFamily: 'System',
    fontSize: 16,
  })),
  combineWithFontStyle: jest.fn((variant: string, styles: any) => ({
    fontFamily: 'System',
    fontSize: 16,
    ...styles,
  })),
}));

// Mock theme
jest.mock('@theme/index', () => ({
  useTheme: () => ({
    theme: {
      text: {
        primary: '#000000',
        secondary: '#666666',
        link: '#0066CC',
      },
      background: {
        primary: '#FFFFFF',
        card: '#F8F9FA',
      },
      button: {
        primary: { background: '#0066CC', text: '#FFFFFF' },
        success: { background: '#28A745', text: '#FFFFFF' },
        error: { background: '#DC3545', text: '#FFFFFF' },
      },
    },
  }),
  createCommonStyles: jest.fn(() => ({})),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const component = renderer.create(<HomeScreen />);
    expect(component).toBeDefined();
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<HomeScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
