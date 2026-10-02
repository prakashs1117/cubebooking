import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@theme/index';
import { BodyText, Heading3 } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import { formatEventDateRange } from '@utils/eventTransformers';

const { width: viewportWidth } = Dimensions.get('window');

// Card dimensions - Glass morphism style
const CARD_WIDTH = Math.min(viewportWidth * 0.85, 280);
const CARD_HEIGHT = 240;
const IMAGE_HEIGHT = 140;

interface Speaker {
  name: string;
  title: string;
  company: string;
  bio?: string;
  photo?: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  speakers: Speaker[] | null;
  capacity: number | null;
  isHighlight: boolean;
  tags?: string[] | null;
  difficultyLevel?: string | null;
}

export interface EventCardData {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  status?: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'FULL';
  date: string;
  time: string;
  location: string;
  startTime?: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  capacity?: number;
  tags?: Array<{ id: string; name: string; slug: string }>;
  scheduleItems?: ScheduleItem[];
  onDetailsPress?: () => void;
  onSchedulePress?: () => void;
}

interface EventCardProps {
  event: EventCardData;
  onPress?: () => void;
  onSchedulePress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onSchedulePress,
}) => {
  const { theme, isDark } = useTheme();

  const handleSchedulePress = (e: any) => {
    e.stopPropagation();
    if (event.onSchedulePress) {
      event.onSchedulePress();
    } else if (onSchedulePress) {
      onSchedulePress();
    }
  };

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

  const handleCardPress = () => {
    if (event.onDetailsPress) {
      event.onDetailsPress();
    } else if (onPress) {
      onPress();
    }
  };

  const cardShadowColor = isDark ? 'rgba(0,0,0,0.6)' : '#000';

  // Glass morphism background color
  const glassBackground = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.9)';

  const glassBorder = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)';

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCardPress}
        style={[
          styles.card,
          {
            backgroundColor: glassBackground,
            borderColor: glassBorder,
            shadowColor: cardShadowColor,
          },
        ]}
      >
        {/* Event Image */}
        <View style={styles.imageContainer}>
          {event.imageUrl && event.imageUrl.trim() !== '' ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() =>
                console.log('Image failed to load:', event.imageUrl)
              }
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  backgroundColor: isDark
                    ? 'rgba(79, 49, 144, 0.15)'
                    : BaseColors.gray200,
                },
              ]}
            >
              <Icon name="merck-logo" size={64} color={theme.text.tertiary} />
            </View>
          )}

          {/* Status Badge - Glass style */}
          {event.status && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusBadgeColor() + 'E6',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              ]}
            >
              <BodyText
                style={[
                  styles.statusText,
                  { fontFamily: getFontStyle('caption').fontFamily },
                ]}
              >
                {event.status}
              </BodyText>
            </View>
          )}
        </View>

        {/* Event Content */}
        <View style={styles.contentContainer}>
          {/* Date Range - Small uppercase label */}
          {event.startTime && event.endTime && (
            <BodyText
              style={[
                styles.dateLabel,
                {
                  color: theme.button.primary.background,
                  fontFamily: getFontStyle('caption').fontFamily,
                },
              ]}
            >
              {formatEventDateRange(
                event.startTime,
                event.endTime,
              ).toUpperCase()}
            </BodyText>
          )}

          {/* Title */}
          <Heading3
            style={[
              styles.title,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h3').fontFamily,
                marginBottom: 0,
              },
            ]}
            numberOfLines={2}
          >
            {event.title}
          </Heading3>

          {/* Capacity and Tags Row */}
          <View style={styles.metaRow}>
            {/* Capacity */}
            {event.capacity && (
              <View style={styles.capacityBadge}>
                <Icon name="user" size={14} color={theme.text.tertiary} />
                <BodyText
                  style={[styles.capacityText, { color: theme.text.tertiary }]}
                >
                  {event.capacity}
                </BodyText>
              </View>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {event.tags.slice(0, 2).map(tag => (
                  <View
                    key={tag.id}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: isDark
                          ? 'rgba(79, 49, 144, 0.2)'
                          : theme.button.primary.background + '15',
                        borderWidth: 1,
                        borderColor: isDark
                          ? 'rgba(79, 49, 144, 0.3)'
                          : 'transparent',
                      },
                    ]}
                  >
                    <BodyText
                      style={[
                        styles.tagText,
                        {
                          color: theme.button.primary.background,
                          fontFamily: getFontStyle('caption').fontFamily,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {tag.name}
                    </BodyText>
                  </View>
                ))}
                {event.tags.length > 2 && (
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: theme.background.tertiary,
                        borderWidth: 1,
                        borderColor: glassBorder,
                      },
                    ]}
                  >
                    <BodyText
                      style={[
                        styles.tagText,
                        {
                          color: theme.text.secondary,
                          fontFamily: getFontStyle('caption').fontFamily,
                        },
                      ]}
                    >
                      +{event.tags.length - 2}
                    </BodyText>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Schedule Badge - Corner */}
        {event.scheduleItems && event.scheduleItems.length > 0 && (
          <TouchableOpacity
            style={[
              styles.scheduleBadge,
              {
                backgroundColor: theme.button.primary.background + 'E6',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
            ]}
            onPress={handleSchedulePress}
            activeOpacity={0.8}
          >
            <Icon name="calendar" size={12} color={theme.button.primary.text} />
            <BodyText
              style={[
                styles.scheduleBadgeText,
                {
                  color: theme.button.primary.text,
                  fontFamily: getFontStyle('caption').fontFamily,
                },
              ]}
            >
              {event.scheduleItems.length}
            </BodyText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH + 16,
    height: CARD_HEIGHT,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20, // Larger radius for glass effect
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 0,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: BaseColors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    maxWidth: 90,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scheduleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
  },
  scheduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default EventCard;
