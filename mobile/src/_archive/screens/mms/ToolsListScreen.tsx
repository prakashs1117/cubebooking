import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import { useFeatureFlag } from '@hooks/useFeatureFlag';
import { ToolsStackParamList } from '@/types/navigation';
import { useHideTabBarOnScroll } from '@context/TabBarVisibilityContext';

type ToolsListScreenNavigationProp = StackNavigationProp<
  ToolsStackParamList,
  'ToolsList'
>;

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  screen: keyof ToolsStackParamList;
  featureFlag?: string;
}

const ToolsListScreen: React.FC = () => {
  const navigation = useNavigation<ToolsListScreenNavigationProp>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tabBarScrollHandler = useHideTabBarOnScroll();

  // Feature flags
  const iconGalleryEnabled = useFeatureFlag('ENABLE_ICON_GALLERY', false);
  const featureFlagsEnabled = useFeatureFlag(
    'ENABLE_FEATURE_FLAGS_SCREEN',
    false,
  );

  const tools: ToolItem[] = [
    {
      id: 'iconGallery',
      title: t('navigation.iconGallery'),
      description: 'Browse all available icons in the app',
      icon: 'component',
      screen: 'IconGallery',
      featureFlag: 'ENABLE_ICON_GALLERY',
    },
    {
      id: 'featureFlags',
      title: t('navigation.featureFlags'),
      description: 'Manage feature flags and app configurations',
      icon: 'vibrant',
      screen: 'FeatureFlags',
      featureFlag: 'ENABLE_FEATURE_FLAGS_SCREEN',
    },
    {
      id: 'datePickerDemo',
      title: 'Date Picker Examples',
      description: 'Interactive examples of horizontal date picker component',
      icon: 'calendar',
      screen: 'DatePickerDemo',
    },
    {
      id: 'appListDemo',
      title: 'AppList Examples',
      description:
        'FlashList-powered reusable list — loading, pagination, error & empty states',
      icon: 'component',
      screen: 'AppListDemo',
    },
  ];

  const isToolEnabled = (tool: ToolItem): boolean => {
    if (!tool.featureFlag) return true;
    if (tool.featureFlag === 'ENABLE_ICON_GALLERY') return iconGalleryEnabled;
    if (tool.featureFlag === 'ENABLE_FEATURE_FLAGS_SCREEN')
      return featureFlagsEnabled;
    return false;
  };

  const enabledTools = tools.filter(isToolEnabled);

  const handleToolPress = (screen: keyof ToolsStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={tabBarScrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {t('navigation.tools')}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.text.secondary }]}
          >
            Developer tools and utilities
          </Text>
        </View>

        <View style={styles.toolsList}>
          {enabledTools.map(tool => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolCard,
                {
                  backgroundColor: theme.background.card,
                  borderColor: theme.border.primary,
                },
              ]}
              onPress={() => handleToolPress(tool.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.button.primary.background + '15' },
                ]}
              >
                <Icon
                  name={tool.icon}
                  size={24}
                  color={theme.button.primary.background}
                />
              </View>
              <View style={styles.toolContent}>
                <Text style={[styles.toolTitle, { color: theme.text.primary }]}>
                  {tool.title}
                </Text>
                <Text
                  style={[
                    styles.toolDescription,
                    { color: theme.text.secondary },
                  ]}
                >
                  {tool.description}
                </Text>
              </View>
              <Icon
                name="arrow-ios-forward"
                size={20}
                color={theme.text.tertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {enabledTools.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="component" size={48} color={theme.text.tertiary} />
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              No tools available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: getFontStyle('h2').fontSize,
    lineHeight: getFontStyle('h2').lineHeight,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: getFontStyle('body').fontSize,
    lineHeight: getFontStyle('body').lineHeight,
  },
  toolsList: {
    gap: 12,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolContent: {
    flex: 1,
    gap: 4,
  },
  toolTitle: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  toolDescription: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: getFontStyle('body').fontSize,
  },
});

export default ToolsListScreen;
