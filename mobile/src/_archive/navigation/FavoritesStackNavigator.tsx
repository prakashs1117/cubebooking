import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { FavoritesStackParamList } from '@/types/navigation';
import CustomHeader from '@components/navigation/CustomHeader';
import FavoritesScreen from '@screens/FavoritesScreen';
import FavoriteListDetailScreen from '@screens/FavoriteListDetailScreen';
import ArticleDetailScreen from '@screens/ArticleDetailScreen';
import SafetyLabelScreen from '@screens/SafetyLabelScreen';
import BatchLabelPreviewScreen from '@screens/BatchLabelPreviewScreen';

const Stack = createStackNavigator<FavoritesStackParamList>();

const FavoritesStackNavigator: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="FavoritesList"
        component={FavoritesScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('favorites.title')}
              showHamburger={false}
              hideSearch
            />
          ),
        }}
      />
      <Stack.Screen
        name="FavoriteListDetail"
        component={FavoriteListDetailScreen}
        options={{
          header: () => (
            <CustomHeader
              showBack
              onBackPress={() => navigation.goBack()}
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
      <Stack.Screen
        name="BatchLabelPreview"
        component={BatchLabelPreviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default FavoritesStackNavigator;
