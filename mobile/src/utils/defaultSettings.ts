import { AppSettings } from '@/types/settings.types';

export const DEFAULT_SETTINGS: AppSettings = {
  home: { barcodeScanner: true },
  articleDetails: {
    safetyDataSheet: true,
    ehs: true,
    transportInformation: true,
  },
  dataPrivacy: { favourites: true, customerData: true },
  sections: Array(16).fill(true),
  location: {
    askLocationAgain: false,
    locationUpdate: true,
    error: 0,
    countryCode: '',
    city: '',
    lat: 0,
    long: 0,
  },
  validityAreaLanguage: {
    rating: 'PUBLIC',
    validityArea: 'EU',
    language: 'EN',
  },
  appLanguage: 'en',
};
