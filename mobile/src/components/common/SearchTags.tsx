import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';

interface SearchTagsProps {
  recentSearches: string[];
  quickTags?: string[];
  onTagPress: (tag: string) => void;
  onClearHistory?: () => void;
  onRemoveSearch?: (search: string) => void;
}

/**
 * SearchTags Component
 * Displays quick search tags and recent search history
 */
const SearchTags: React.FC<SearchTagsProps> = ({
  recentSearches,
  quickTags = ['Events', 'Settings', 'Profile', 'Home', 'About'],
  onTagPress,
  _onClearHistory,
  onRemoveSearch,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    section: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    clearButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    clearButtonText: {
      fontSize: 12,
      color: theme.text.link,
      fontFamily: getFontStyle('caption').fontFamily,
      fontWeight: '600',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    quickTag: {
      backgroundColor: theme.button.primary.background + '15',
      borderColor: theme.button.primary.background + '30',
    },
    recentTag: {
      paddingRight: 8,
    },
    tagText: {
      fontSize: 14,
      color: theme.text.primary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    quickTagText: {
      color: theme.button.primary.background,
      fontWeight: '500',
    },
    tagIcon: {
      marginRight: 6,
    },
    removeButton: {
      marginLeft: 8,
      padding: 4,
    },
    emptyText: {
      fontSize: 14,
      color: theme.text.tertiary,
      fontFamily: getFontStyle('body').fontFamily,
      fontStyle: 'italic',
    },
  });

  const renderQuickTags = () => {
    if (!quickTags || quickTags.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('search.quickSearch')}</Text>
        </View>
        <View style={styles.tagsContainer}>
          {quickTags.map((tag, index) => (
            <TouchableOpacity
              key={`quick-${index}`}
              style={[styles.tag, styles.quickTag]}
              onPress={() => onTagPress(tag)}
              activeOpacity={0.7}
            >
              <Icon
                name="search"
                size={14}
                color={theme.button.primary.background}
                style={styles.tagIcon}
              />
              <Text style={[styles.tagText, styles.quickTagText]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('search.recentSearches')}
            </Text>
          </View>
          <Text style={styles.emptyText}>{t('search.noRecentSearches')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('search.recentSearches')}</Text>
        </View>
        <View style={styles.tagsContainer}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={`recent-${index}`}
              style={[styles.tag, styles.recentTag]}
              onPress={() => onTagPress(search)}
              activeOpacity={0.7}
            >
              <Icon
                name="time"
                size={14}
                color={theme.text.secondary}
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>{search}</Text>
              {onRemoveSearch && (
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    onRemoveSearch(search);
                  }}
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={12} color={theme.text.tertiary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderQuickTags()}
      {renderRecentSearches()}
    </ScrollView>
  );
};

export default SearchTags;
