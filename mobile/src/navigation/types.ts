export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type DrawerParamList = {
  Tabs: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  CancellationPolicy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Food: undefined;
  Profile: undefined;
  Vendor: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  FAQ: undefined;
  Feedback: undefined;
  Contact: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
};

export type PeopleStackParamList = {
  PeopleFeed: undefined;
  PersonDetail: { userId: string };
};

export type DiscoverStackParamList = {
  DiscoverFeed: undefined;
  SearchResults: { query?: string };
};

export type FoodStackParamList = {
  FoodMenu: undefined;
  FoodOrderConfirm: { mealId: string };
  AllOrders: undefined;
};

export type SavedStackParamList = {
  SavedList: undefined;
};

export type FeedStackParamList = {
  FeedList: undefined;
  PostDetail: { postId: string };
};

export type MarketplaceStackParamList = {
  MarketplaceList: undefined;
  MarketplaceDetail: { pluginId: string };
  MarketplaceSubmit: undefined;
};

/** FluentEdge Practice mode screens (nested navigation). */
export type PracticeStackParamList = {
  PracticeHub: undefined;
  TableTopics: undefined;
  GamesHub: undefined;
  FillerWordSlayer: undefined;
  GamePlaceholder: {
    title: string;
    desc: string;
    icon: string;
    tone: import('@demand/shared/fe').FETone;
  };
};

/** FluentEdge bottom-tab shell (Today · Community · Practice · Progress · Profile). */
export type FETabParamList = {
  Today: undefined;
  Community: undefined;
  PracticeNav: undefined;
  Progress: undefined;
  Profile: undefined;
};
