/**
 * Test setup configuration
 * Sets up mocks and test environment for React Native components
 */

// Setup file for Jest tests

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock the i18n initialization module to prevent real i18next setup during tests
jest.mock('@localization/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
    language: 'en',
    changeLanguage: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    dir: jest.fn(() => 'ltr'),
  },
  setRTLChangeCallback: jest.fn(),
  getCurrentLanguage: jest.fn(() => 'en'),
  isRTL: jest.fn(() => false),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  initI18n: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  findBestLanguageTag: jest.fn(() => ({ languageTag: 'en', isRTL: false })),
  getNumberFormatSettings: jest.fn(() => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  })),
  getCalendar: jest.fn(() => 'gregorian'),
  getCountry: jest.fn(() => 'US'),
  getCurrencies: jest.fn(() => ['USD']),
  getTemperatureUnit: jest.fn(() => 'celsius'),
  getTimeZone: jest.fn(() => 'America/New_York'),
  uses24HourClock: jest.fn(() => false),
  usesMetricSystem: jest.fn(() => false),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock Firebase modules (avoids native module not found errors)
const firebaseMock = () => ({
  logEvent: jest.fn().mockResolvedValue(undefined),
  setCurrentScreen: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setUserProperties: jest.fn().mockResolvedValue(undefined),
  logScreenView: jest.fn().mockResolvedValue(undefined),
  setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  crashlytics: jest.fn().mockReturnValue({
    recordError: jest.fn(),
    log: jest.fn(),
    setUserId: jest.fn(),
    setAttribute: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
  }),
  app: jest.fn().mockReturnValue({}),
});

jest.mock('@react-native-firebase/analytics', () =>
  jest.fn(() => firebaseMock()),
);
jest.mock('@react-native-firebase/crashlytics', () =>
  jest.fn(() => ({
    recordError: jest.fn(),
    log: jest.fn(),
    setUserId: jest.fn(),
    setAttribute: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
  })),
);
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: {
    app: jest.fn(() => ({})),
    apps: [],
    initializeApp: jest.fn(() => ({})),
  },
}));
jest.mock('@react-native-firebase/messaging', () => {
  const mockFn = jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('mock-token'),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    onTokenRefresh: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    requestPermission: jest.fn().mockResolvedValue(1),
    setBackgroundMessageHandler: jest.fn(),
    subscribeToTopic: jest.fn().mockResolvedValue(undefined),
    unsubscribeFromTopic: jest.fn().mockResolvedValue(undefined),
    deleteToken: jest.fn().mockResolvedValue(undefined),
    hasPermission: jest.fn().mockResolvedValue(1),
  }));
  mockFn.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    DENIED: 0,
    NOT_DETERMINED: -1,
  };
  return mockFn;
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    }),
  ),
}));

// Mock react-native-bootsplash
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockReturnValue(false),
  useHideAnimation: jest.fn(() => ({
    container: { style: {}, onLayout: jest.fn() },
    logo: { source: 0, style: {} },
    brand: { source: 0, style: {} },
  })),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
  useRoute: jest.fn(() => ({ params: {}, name: 'TestScreen', key: 'test' })),
  useIsFocused: jest.fn(() => true),
  createNavigatorFactory: jest.fn(() => jest.fn()),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
    Group: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
  CardStyleInterpolators: {
    forHorizontalIOS: jest.fn(),
    forFadeFromCenter: jest.fn(),
  },
  TransitionPresets: {
    SlideFromRightIOS: {},
    ModalPresentationIOS: {},
  },
}));

jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
  DrawerContentScrollView: ({ children }: { children: React.ReactNode }) =>
    children,
  DrawerItemList: () => null,
}));

// Mock TanStack React Query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    cancelQueries: jest.fn(),
    removeQueries: jest.fn(),
    resumePausedMutations: jest.fn(),
    getQueryCache: jest.fn(() => ({
      getAll: jest.fn(() => []),
    })),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isFetching: false,
    isSuccess: false,
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
  useQueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    cancelQueries: jest.fn(),
    removeQueries: jest.fn(),
  })),
  useInfiniteQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
}));

// Global fetch mock
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock react-native-worklets before reanimated (avoids native init error in tests)
jest.mock('react-native-worklets', () => ({
  useSharedValue: jest.fn((init: any) => ({ value: init })),
  useWorkletCallback: jest.fn((fn: any) => fn),
  runOnJS: jest.fn((fn: any) => fn),
  runOnUI: jest.fn((fn: any) => fn),
}));

// Mock react-native-reanimated (avoids native Worklets init error in tests)
jest.mock('react-native-reanimated', () => {
  const { View, Text, Image, ScrollView } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text,
      Image,
      ScrollView,
      createAnimatedComponent: (component: any) => component,
      call: jest.fn(),
    },
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    useAnimatedGestureHandler: jest.fn(() => jest.fn()),
    useDerivedValue: jest.fn((fn: any) => ({ value: fn() })),
    withTiming: jest.fn((val: any) => val),
    withSpring: jest.fn((val: any) => val),
    withSequence: jest.fn((...args: any[]) => args[0]),
    withDelay: jest.fn((_delay: number, anim: any) => anim),
    withRepeat: jest.fn((anim: any) => anim),
    interpolate: jest.fn((val: any) => val),
    Extrapolation: { CLAMP: 'clamp' },
    runOnJS: jest.fn((fn: any) => fn),
    runOnUI: jest.fn((fn: any) => fn),
    cancelAnimation: jest.fn(),
    Easing: {
      linear: jest.fn(),
      out: jest.fn((fn: any) => fn),
      in: jest.fn((fn: any) => fn),
      bezier: jest.fn(() => jest.fn()),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      poly: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      back: jest.fn(),
      bounce: jest.fn(),
      bezierFn: jest.fn(() => jest.fn()),
    },
    Animated: {
      View,
      Text,
      Image,
      ScrollView,
      createAnimatedComponent: (component: any) => component,
    },
    createAnimatedComponent: (component: any) => component,
  };
});

// Mock react-native-reanimated-carousel
jest.mock('react-native-reanimated-carousel', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => children ?? null,
  Pagination: {
    Basic: () => null,
    Custom: () => null,
  },
}));

// Mock react-native-gesture-handler (avoids TurboModuleRegistry error in tests)
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) =>
    children,
  Gesture: { Pan: jest.fn(), Tap: jest.fn(), Pinch: jest.fn() },
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  TapGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  ScrollView: require('react-native').ScrollView,
  FlatList: require('react-native').FlatList,
  State: {},
  Directions: {},
}));

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  BottomSheetModal: ({ children }: { children: React.ReactNode }) => children,
  BottomSheetScrollView: ({ children }: { children: React.ReactNode }) =>
    children,
  useBottomSheetModal: () => ({ dismiss: jest.fn() }),
}));

// Additional React Native mocks can be added here as needed
