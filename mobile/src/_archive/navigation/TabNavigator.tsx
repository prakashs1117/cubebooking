import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import { TabBarVisibilityProvider } from '@context/TabBarVisibilityContext';
import {
  SearchOverlayProvider,
  useSearchOverlay,
} from '@context/SearchOverlayContext';
import HomeSearchOverlay from '@components/search/HomeSearchOverlay';

// Screens
import HomeScreen from '@screens/HomeScreen';
import FavoritesStackNavigator from '@navigation/FavoritesStackNavigator';
import HistoryStackNavigator from '@navigation/HistoryStackNavigator';
import MoreStackNavigator from '@navigation/MoreStackNavigator';
import SearchStackNavigator from '@navigation/SearchStackNavigator';

const Tab = createBottomTabNavigator();

// My M Safety brand colors — fixed, not theme-driven (tab bar is always purple)
const MMS = {
  tabBg: '#4A0E8F',
  active: '#F5C518',
  inactive: 'rgba(255,255,255,0.55)',
};

const TAB_HEIGHT = 64;

// Inline search tab button — same height as other tabs, opens overlay on press
const SearchInlineButton: React.FC<any> = props => {
  const { openSearch } = useSearchOverlay();
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.75}
      onPress={openSearch}
      accessibilityRole="button"
      accessibilityLabel="Search"
    />
  );
};

const TabsWithOverlay: React.FC = () => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === 'ar';
  const { isOpen, closeSearch } = useSearchOverlay();

  const tabLabelStyle = getFontStyle('caption');

  const tabScreens = useMemo(
    () => [
      {
        name: 'Home',
        component: HomeScreen,
        label: t('navigation.home'),
        iconFocused: 'home' as const,
        iconUnfocused: 'home-outline' as const,
      },
      {
        name: 'Favorites',
        component: FavoritesStackNavigator,
        label: t('navigation.favorites'),
        iconFocused: 'favorite' as const,
        iconUnfocused: 'favorite-outline' as const,
      },
      {
        name: 'Search',
        component: SearchStackNavigator,
        label: t('navigation.search'),
        iconFocused: 'search' as const,
        iconUnfocused: 'search' as const,
        isCenter: true,
        unmountOnBlur: true,
      },
      {
        name: 'History',
        component: HistoryStackNavigator,
        label: t('navigation.history'),
        iconFocused: 'clock' as const,
        iconUnfocused: 'clock' as const,
      },
      {
        name: 'More',
        component: MoreStackNavigator,
        label: t('navigation.more'),
        iconFocused: 'alert-circle' as const,
        iconUnfocused: 'alert-circle' as const,
      },
    ],
    [t],
  );

  const orderedTabs = useMemo(
    () => (isRTL ? [...tabScreens].reverse() : tabScreens),
    [tabScreens, isRTL],
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelPosition: 'below-icon',
          tabBarStyle: {
            backgroundColor: MMS.tabBg,
            borderTopWidth: 0,
            height: TAB_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
            elevation: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: MMS.active,
          tabBarInactiveTintColor: MMS.inactive,
          tabBarLabelStyle: {
            fontFamily: tabLabelStyle.fontFamily,
            fontSize: 11,
            fontWeight: '500' as const,
            marginTop: 2,
          },
        }}
      >
        {orderedTabs.map(screen => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={{
              tabBarLabel: screen.label,
              unmountOnBlur: (screen as any).unmountOnBlur ?? false,
              tabBarIcon: ({ focused, color }) => (
                <Icon
                  name={focused ? screen.iconFocused : screen.iconUnfocused}
                  size={24}
                  color={screen.isCenter ? MMS.active : color}
                />
              ),
              ...(screen.isCenter
                ? {
                    tabBarButton: (props: any) => (
                      <SearchInlineButton {...props} />
                    ),
                  }
                : {}),
            }}
          />
        ))}
      </Tab.Navigator>

      {/* Global search overlay — accessible from any tab via the search button */}
      <HomeSearchOverlay visible={isOpen} onClose={closeSearch} />
    </>
  );
};

const TabNavigator: React.FC = () => (
  <TabBarVisibilityProvider>
    <SearchOverlayProvider>
      <TabsWithOverlay />
    </SearchOverlayProvider>
  </TabBarVisibilityProvider>
);

export default TabNavigator;
