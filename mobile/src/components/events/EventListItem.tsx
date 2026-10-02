import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { BodyText, Heading3 } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import { EventCardData } from './EventCard';

interface EventListItemProps {
  event: EventCardData;
  onPress?: () => void;
}

/**
 * Vertical list item for events (used in EventsListScreen)
 * More compact than EventCard, optimized for scrollable lists
 */
const EventListItem: React.FC<EventListItemProps> = ({ event, onPress }) => {
  const { theme, isDark } = useTheme();

  const getStatusBadgeColor = () => {
    switch (event.status) {
      case 'LIVE':
        return BaseColors.error;
      case 'UPCOMING':
        return BaseColors.merckPurple;
      case 'COMPLETED':
        return BaseColors.gray500;
      case 'CANCELLED':
        return BaseColors.error;
      case 'FULL':
        return BaseColors.warning;
      default:
        return BaseColors.merckPurple;
    }
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: theme.background.card,
      shadowColor: isDark ? 'rgba(0,0,0,0.6)' : '#000',
    },
  ];

  const imagePlaceholderStyle = [
    styles.imagePlaceholder,
    {
      backgroundColor: isDark
        ? 'rgba(139, 92, 246, 0.15)'
        : 'rgba(139, 92, 246, 0.1)',
    },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={containerStyle}
    >
      {/* Image Placeholder */}
      <View style={imagePlaceholderStyle}>
        <Icon
          name="calendar"
          size={28}
          color={isDark ? BaseColors.white : BaseColors.merckPurple}
        />
      </View>

      <View style={styles.content}>
        {/* Title and Status */}
        <View style={styles.headerRow}>
          <Heading3
            style={[
              styles.title,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h3').fontFamily,
              },
            ]}
            numberOfLines={2}
          >
            {event.title}
          </Heading3>
          {event.status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBadgeColor() },
              ]}
            >
              <BodyText style={styles.statusText}>{event.status}</BodyText>
            </View>
          )}
        </View>

        {/* Date, Time, Location */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={14} color={theme.text.secondary} />
            <BodyText
              style={[styles.infoText, { color: theme.text.secondary }]}
            >
              {event.date} • {event.time}
            </BodyText>
          </View>
          <View style={styles.infoRow}>
            <Icon name="location" size={14} color={theme.text.secondary} />
            <BodyText
              style={[styles.infoText, { color: theme.text.secondary }]}
              numberOfLines={1}
            >
              {event.location}
            </BodyText>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <Icon name="chevron-right" size={20} color={theme.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: BaseColors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoContainer: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});

export default EventListItem;
