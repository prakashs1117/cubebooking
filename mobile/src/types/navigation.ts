export type DrawerItemType = 'screen' | 'divider' | 'group';

export interface DrawerItemConfig {
  id?: string;
  label?: string;
  icon?: string;
  screen?: string;
  tab?: string;
  action?: string;
  featureFlag?: string | null;
  group?: string;
  type?: DrawerItemType;
  items?: DrawerItemConfig[];
}

export interface DrawerConfig {
  drawerItems: DrawerItemConfig[];
}

export type RootStackParamList = {
  Auth: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  OTPVerification: { email: string; type: 'registration' | 'password_reset' };
  Main: undefined;
};

export type DrawerParamList = {
  Tabs: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  AllEvents: undefined;
  EventDetail: { slug: string };
  DatePickerExample: undefined;
};

export type ToolsStackParamList = {
  ToolsList: undefined;
  IconGallery: undefined;
  FeatureFlags: undefined;
  DatePickerDemo: undefined;
  AppListDemo: undefined;
};

export type MoreStackParamList = {
  MoreList: undefined;
  About: undefined;
  FAQ: undefined;
  AppListDemo: undefined;
  Feedback: undefined;
  CuratedDemo: undefined;
  IconGallery: undefined;
};

export interface ArticleNavParam {
  materialNumber: string;
  articleName: string;
  substance?: string;
  brand?: string;
  casNumber?: string;
  articleNumber?: string;
}

export interface SafetyLabelNavParam extends ArticleNavParam {
  revisionDate?: string;
  hazardPictogramIcons?: string[];
  pictoLength?: number;
}

export type SearchStackParamList = {
  SearchList: undefined;
  BarcodeScanner: undefined;
  ArticleDetail: { article: ArticleNavParam; cameFromOverlay?: boolean };
  SafetyLabel: { article: SafetyLabelNavParam };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  ArticleDetail: { article: ArticleNavParam };
  SafetyLabel: { article: SafetyLabelNavParam };
};

export type FavoritesStackParamList = {
  FavoritesList: undefined;
  FavoriteListDetail: {
    listId: string;
    listName: string;
    remoteArticles?: import('@/types/favorites.types').RemoteArticle[];
  };
  ArticleDetail: { article: ArticleNavParam };
  SafetyLabel: { article: SafetyLabelNavParam };
  BatchLabelPreview: {
    articles: import('@/components/search/ArticleCard').Article[];
  };
};

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Search: undefined;
  History: undefined;
  More: undefined;
  // Legacy — kept for drawer/deep-link compat during migration
  Settings: undefined;
  Profile: undefined;
  Demo: undefined;
  Events: undefined;
  Tools: undefined;
};
