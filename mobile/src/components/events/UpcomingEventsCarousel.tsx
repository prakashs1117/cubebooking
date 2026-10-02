import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { useDeviceType } from '@hooks/useDeviceType';
import { Heading3, BodyText, CaptionText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import eventsData from '@/data/eventsData.json';
import {
  transformAPIEventsToCards,
  type EventsAPIResponse,
} from '@utils/eventTransformers';
import { EventCardData } from './EventCard';

const CARD_SPACING = 16;

/**
 * Upcoming Events Horizontal Carousel
 * Shows upcoming events in a horizontal scrollable list on the Home screen
 */
const UpcomingEventsCarousel: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { isTablet, width: screenWidth } = useDeviceType();

  // Tablet (>= 768 pt): show ~2.5 cards so the list feels scrollable.
  // Phone: keep original 75 % width.
  const CARD_WIDTH = isTablet
    ? Math.min(Math.round((screenWidth - 32) / 2.5), 420)
    : screenWidth * 0.75;

  // Get upcoming events from data
  const upcomingEvents = useMemo(() => {
    try {
      const allEvents = transformAPIEventsToCards(
        eventsData as EventsAPIResponse,
      );

      // Filter for upcoming and live events only
      const filtered = allEvents.filter(
        event => event.status === 'UPCOMING' || event.status === 'LIVE',
      );

      // Sort by date (LIVE first, then upcoming by date)
      filtered.sort((a, b) => {
        // LIVE events first
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;

        // Then by date
        return a.date.localeCompare(b.date);
      });

      // Limit to 10 events
      return filtered.slice(0, 10);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
      return [];
    }
  }, []);

  const handleEventPress = (slug: string) => {
    // Navigate to Events tab, then to EventDetail screen
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Events',
        params: {
          screen: 'EventDetail',
          params: { slug },
        },
      }),
    );
  };

  const handleViewAll = () => {
    // Navigate to Events tab, then to AllEvents screen
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Events',
        params: {
          screen: 'AllEvents',
        },
      }),
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return BaseColors.error;
      case 'UPCOMING':
        return BaseColors.merckPurple;
      default:
        return BaseColors.merckPurple;
    }
  };

  const renderEventCard = ({ item }: { item: EventCardData }) => {
    const cardStyle = [
      styles.eventCard,
      {
        width: CARD_WIDTH,
        backgroundColor: theme.background.card,
        shadowColor: isDark ? 'rgba(0,0,0,0.6)' : '#000',
      },
    ];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleEventPress(item.slug)}
        style={cardStyle}
      >
        {/* Image Placeholder */}
        <View
          style={[
            styles.imagePlaceholder,
            {
              backgroundColor: isDark
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(139, 92, 246, 0.1)',
            },
          ]}
        >
          <Icon
            name="calendar"
            size={40}
            color={isDark ? BaseColors.white : BaseColors.merckPurple}
          />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Status Badge */}
          {item.status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBadgeColor(item.status) },
              ]}
            >
              <CaptionText style={styles.statusText}>{item.status}</CaptionText>
            </View>
          )}

          {/* Title */}
          <Heading3
            style={[
              styles.eventTitle,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h3').fontFamily,
              },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Heading3>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color={theme.text.secondary} />
            <BodyText
              style={[styles.infoText, { color: theme.text.secondary }]}
              numberOfLines={1}
            >
              {item.date}
            </BodyText>
          </View>

          {/* Time */}
          <View style={styles.infoRow}>
            <Icon name="clock" size={16} color={theme.text.secondary} />
            <BodyText
              style={[styles.infoText, { color: theme.text.secondary }]}
              numberOfLines={1}
            >
              {item.time}
            </BodyText>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Icon name="location" size={16} color={theme.text.secondary} />
            <BodyText
              style={[styles.infoText, { color: theme.text.secondary }]}
              numberOfLines={1}
            >
              {item.location}
            </BodyText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (upcomingEvents.length === 0) {
    return null; // Don't show section if no events
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="calendar" size={24} color={theme.text.link} />
          <Heading3
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            {t('events.title')}
          </Heading3>
        </View>
        <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
          <BodyText style={{ color: theme.text.link }}>
            {t('common.viewAll')}
          </BodyText>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={upcomingEvents}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: getFontStyle('h3').fontSize,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: CARD_SPACING,
  },
  eventCard: {
    // width applied as inline style (computed per device)
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imagePlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: BaseColors.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    marginBottom: 12,
    minHeight: 48,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
});

export default UpcomingEventsCarousel;
