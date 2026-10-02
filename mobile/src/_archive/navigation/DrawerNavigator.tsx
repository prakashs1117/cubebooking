import React, { useMemo } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import TabNavigator from '@navigation/TabNavigator';
import CustomDrawerContent from '@components/navigation/CustomDrawerContent';
import { DrawerParamList } from '@/types/navigation';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Memoize screen options to prevent unnecessary re-renders.
  // Do NOT set drawerPosition here — React Navigation reads I18nManager.isRTL
  // automatically and places the drawer on the correct edge. Manually overriding
  // drawerPosition while I18nManager.forceRTL is also active causes the drawer
  // to be rendered in the wrong position or clipped.
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      drawerStyle: {
        backgroundColor: theme.background.card,
        width: 280,
      },
      drawerType: 'front' as const,
      overlayColor: theme.background.overlay,
    }),
    [theme.background.card, theme.background.overlay],
  );

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={screenOptions}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          drawerLabel: t('navigation.home'),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
