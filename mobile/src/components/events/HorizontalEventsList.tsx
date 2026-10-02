import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import EventCard, { EventCardData } from '@components/events/EventCard';
import { Heading2, BodyText } from '@components/common/CustomText';
import EventScheduleModal from '@components/events/EventScheduleModal';

const { width: viewportWidth } = Dimensions.get('window');

// Card dimensions - must match EventCard dimensions
const CARD_WIDTH = Math.min(viewportWidth * 0.85, 280);
const CARD_CONTAINER_WIDTH = CARD_WIDTH + 16; // Matches EventCard's cardContainer width

interface HorizontalEventsListProps {
  title?: string;
  events: EventCardData[];
  onEventPress?: (eventId: string) => void;
  onSeeAllPress?: () => void;
  showHeader?: boolean;
  showSeeAll?: boolean;
  emptyMessage?: string;
  containerStyle?: ViewStyle;
}

/**
 * Reusable horizontal scrolling events list component
 * Can be used on any screen (Home, Events, Profile, etc.)
 */
const HorizontalEventsList: React.FC<HorizontalEventsListProps> = ({
  title,
  events,
  onEventPress,
  onSeeAllPress,
  showHeader = true,
  showSeeAll = true,
  emptyMessage,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCardData | null>(
    null,
  );

  // Default title
  const displayTitle = title || t('events.title');

  // Default empty message
  const displayEmptyMessage = emptyMessage || t('events.noEvents');

  // Handle event card press
  const handleEventPress = useCallback(
    (eventId: string) => {
      if (onEventPress) {
        onEventPress(eventId);
      } else {
        console.log('Event pressed:11', eventId);
        // TODO: Default navigation to event details
      }
    },
    [onEventPress],
  );

  // Handle "See All" press
  const handleSeeAllPress = useCallback(() => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      console.log('See All pressed');
      // TODO: Default navigation to all events screen
    }
  }, [onSeeAllPress]);

  // Handle schedule button press
  const handleSchedulePress = useCallback((event: EventCardData) => {
    setSelectedEvent(event);
    setShowScheduleModal(true);
  }, []);

  // Render event card item
  const renderEventCard = useCallback(
    ({ item }: { item: EventCardData }) => (
      <EventCard
        event={item}
        onPress={() => handleEventPress(item.slug)}
        onSchedulePress={() => handleSchedulePress(item)}
      />
    ),
    [handleEventPress, handleSchedulePress],
  );

  // Render empty state
  const renderEmptyState = useCallback(() => {
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
          {displayEmptyMessage}
        </Text>
      </View>
    );
  }, [theme, displayEmptyMessage]);

  // Get item layout for better scroll performance
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: CARD_CONTAINER_WIDTH,
      offset: CARD_CONTAINER_WIDTH * index,
      index,
    }),
    [],
  );

  // Render section header
  const renderHeader = useCallback(() => {
    if (!showHeader) return null;

    return (
      <View style={styles.headerContainer}>
        <Heading2
          style={[
            styles.headerTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h2').fontFamily,
            },
          ]}
        >
          {displayTitle}
        </Heading2>
        {showSeeAll && (
          <TouchableOpacity onPress={handleSeeAllPress} activeOpacity={0.7}>
            <BodyText
              style={[
                styles.seeAllText,
                {
                  color: theme.text.link,
                  fontFamily: getFontStyle('bodyMedium').fontFamily,
                },
              ]}
            >
              {t('events.seeAll')}
            </BodyText>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [showHeader, showSeeAll, theme, displayTitle, handleSeeAllPress, t]);

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        {/* Header */}
        {renderHeader()}

        {/* Horizontal Scrolling Event Cards */}
        {events.length > 0 ? (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_CONTAINER_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            getItemLayout={getItemLayout}
            scrollEventThrottle={16}
            pagingEnabled={false}
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Schedule Modal */}
      {selectedEvent && selectedEvent.scheduleItems && (
        <EventScheduleModal
          visible={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          eventTitle={selectedEvent.title}
          startTime={selectedEvent.startTime || selectedEvent.date}
          endTime={selectedEvent.endTime || selectedEvent.date}
          scheduleItems={selectedEvent.scheduleItems}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    width: viewportWidth - 40,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HorizontalEventsList;
