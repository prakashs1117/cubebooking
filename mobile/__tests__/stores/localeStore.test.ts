/**
 * Locale Store Tests
 */

jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [
    {
      languageCode: 'en',
      countryCode: 'US',
      languageTag: 'en-US',
      isRTL: false,
    },
  ]),
  getCalendar: jest.fn(() => 'gregorian'),
  getTimeZone: jest.fn(() => 'America/New_York'),
  findBestLanguageTag: jest.fn(),
  getNumberFormatSettings: jest.fn(() => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  })),
  getCountry: jest.fn(() => 'US'),
  getCurrencies: jest.fn(() => ['USD']),
  getTemperatureUnit: jest.fn(() => 'celsius'),
  uses24HourClock: jest.fn(() => false),
  usesMetricSystem: jest.fn(() => false),
}));

import { useLocaleStore } from '@stores/localeStore';

beforeEach(() => {
  useLocaleStore.setState({
    language: 'en',
    countryCode: 'US',
    languageTag: 'en-US',
    isRTL: false,
    calendarType: 'gregorian',
    timezone: 'UTC',
  });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('initial state', () => {
  it('has correct default values', () => {
    const state = useLocaleStore.getState();
    expect(state.language).toBe('en');
    expect(state.isRTL).toBe(false);
    expect(state.calendarType).toBe('gregorian');
  });
});

describe('setTimezone', () => {
  it('updates the timezone', () => {
    useLocaleStore.getState().setTimezone('Europe/Paris');
    expect(useLocaleStore.getState().timezone).toBe('Europe/Paris');
  });
});

describe('setCalendarType', () => {
  it('updates the calendar type', () => {
    useLocaleStore.getState().setCalendarType('islamic');
    expect(useLocaleStore.getState().calendarType).toBe('islamic');
  });
});

describe('setLanguage', () => {
  it('sets a supported language', async () => {
    await useLocaleStore.getState().setLanguage('fr');
    expect(useLocaleStore.getState().language).toBe('fr');
    expect(useLocaleStore.getState().isRTL).toBe(false);
  });

  it('sets Arabic and marks isRTL true', async () => {
    await useLocaleStore.getState().setLanguage('ar');
    expect(useLocaleStore.getState().language).toBe('ar');
    expect(useLocaleStore.getState().isRTL).toBe(true);
  });

  it('defaults to English for unsupported language', async () => {
    await useLocaleStore.getState().setLanguage('zh');
    expect(useLocaleStore.getState().language).toBe('en');
  });

  it('is case-insensitive', async () => {
    await useLocaleStore.getState().setLanguage('FR');
    expect(useLocaleStore.getState().language).toBe('fr');
  });
});

describe('refreshLocale', () => {
  it('refreshes from device locale without throwing', () => {
    expect(() => useLocaleStore.getState().refreshLocale()).not.toThrow();
  });

  it('updates state from device locale', () => {
    useLocaleStore.getState().refreshLocale();
    // react-native-localize mock returns 'en', 'US', 'gregorian', 'America/New_York'
    const state = useLocaleStore.getState();
    expect(state.language).toBe('en');
    expect(state.timezone).toBe('America/New_York');
  });
});

describe('initializeLocale', () => {
  it('does not throw on call', () => {
    expect(() => useLocaleStore.getState().initializeLocale()).not.toThrow();
  });
});
