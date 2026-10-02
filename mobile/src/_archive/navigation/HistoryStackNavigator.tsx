import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import type { HistoryStackParamList } from '@/types/navigation';
import CustomHeader from '@components/navigation/CustomHeader';
import HistoryScreen from '@screens/HistoryScreen';
import ArticleDetailScreen from '@screens/ArticleDetailScreen';
import SafetyLabelScreen from '@screens/SafetyLabelScreen';

const Stack = createStackNavigator<HistoryStackParamList>();

const HistoryStackNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('history.title')}
              showHamburger={false}
              hideSearch
            />
          ),
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SafetyLabel"
        component={SafetyLabelScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default HistoryStackNavigator;
