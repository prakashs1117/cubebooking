import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import EventListItem from '@components/events/EventListItem';
import SearchBar from '@components/events/SearchBar';
import FilterSortModal from '@components/events/FilterSortModal';
import type {
  SortOption,
  FilterOption,
} from '@components/events/SortFilterBar';
import type { EventCardData } from '@utils/eventTransformers';

interface Props {
  filteredEvents: EventCardData[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: SortOption;
  filterBy: FilterOption;
  setSortBy: (v: SortOption) => void;
  setFilterBy: (v: FilterOption) => void;
  showFilterModal: boolean;
  setShowFilterModal: (v: boolean) => void;
  onEventPress: (slug: string) => void;
}

const EventsListTablet: React.FC<Props> = ({
  filteredEvents,
  isLoading,
  isRefetching,
  refetch,
  searchQuery,
  setSearchQuery,
  sortBy,
  filterBy,
  setSortBy,
  setFilterBy,
  showFilterModal,
  setShowFilterModal,
  onEventPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const renderEventItem = ({ item }: { item: EventCardData }) => (
    <EventListItem event={item} onPress={() => onEventPress(item.slug)} />
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    const message = searchQuery.trim()
      ? t('events.noSearchResults')
      : t('events.noEvents');
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={[
            styles.emptyText,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    );
  };

  if (isLoading && filteredEvents.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.button.primary.background}
          />
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            {t('events.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          showFilterButton
          onFilterPress={() => setShowFilterModal(true)}
        />
      </View>

      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.text.tertiary }]}>
          {filteredEvents.length} {t('events.eventsFound')}
        </Text>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, styles.tabletListContent]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.button.primary.background}
            colors={[theme.button.primary.background]}
          />
        }
        showsVerticalScrollIndicator={false}
        numColumns={2}
        key="tablet"
      />

      <FilterSortModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  resultsText: { fontSize: 12, fontWeight: '500' },
  listContent: { paddingTop: 8, paddingBottom: 24 },
  tabletListContent: { paddingHorizontal: 24 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

export default EventsListTablet;
