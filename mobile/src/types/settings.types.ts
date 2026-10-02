export interface HomeSettings {
  barcodeScanner: boolean;
}

export interface ArticleDetailsSettings {
  safetyDataSheet: boolean;
  ehs: boolean;
  transportInformation: boolean;
}

export interface DataPrivacySettings {
  favourites: boolean;
  customerData: boolean;
}

export interface LocationSettings {
  askLocationAgain: boolean;
  locationUpdate: boolean;
  error: number;
  countryCode: string;
  city: string;
  long: number;
  lat: number;
}

export interface ValidityAreaLanguageSettings {
  rating: string;
  validityArea: string;
  language: string;
}

export interface AppSettings {
  home: HomeSettings;
  articleDetails: ArticleDetailsSettings;
  dataPrivacy: DataPrivacySettings;
  sections: boolean[];
  location: LocationSettings;
  validityAreaLanguage: ValidityAreaLanguageSettings;
  appLanguage: string;
}
