import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import { EventsStackParamList } from '@/types/navigation';
import { getEventById } from '@services/api/events.service';
import EventScheduleModal from '@components/events/EventScheduleModal';
import EventFeedbackModal from '@components/events/EventFeedbackModal';
import { useRatePrompt } from '@hooks/useRatePrompt';
import { analytics } from '@services/analyticsService';

type EventDetailScreenRouteProp = RouteProp<
  EventsStackParamList,
  'EventDetail'
>;

interface Speaker {
  name: string;
  title: string;
  company: string;
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
  capacity: number;
  isHighlight: boolean;
}

interface Track {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Venue {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  amenities: string[];
  parking: string;
  publicTransport: string;
}

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venue: string;
  capacity: number;
  status: string;
  tags: Tag[];
  venueModel: Venue;
  scheduleItems: ScheduleItem[];
  tracks: Track[];
  confirmedCount: number;
  availableSeats: number;
}

const EventDetailScreen: React.FC = () => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<EventDetailScreenRouteProp>();
  const insets = useSafeAreaInsets();

  console.log('@123 route ', route);
  const { slug } = route.params;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const isRTL = i18n.language === 'ar';
  const { triggerRatePrompt } = useRatePrompt();

  useEffect(() => {
    loadEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Trigger rate prompt and log analytics once event data is successfully loaded
  useEffect(() => {
    if (event && !loading) {
      triggerRatePrompt('event_viewed');
      analytics.logEventViewed(slug, event.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const loadEventDetails = async () => {
    console.log('@123 slug ', slug);
    try {
      setLoading(true);
      setError(null);
      const response = await getEventById(slug);
      setEvent(response.event);
    } catch (err) {
      console.error('Error loading event details:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return theme.button.success.background;
      case 'DRAFT':
        return theme.text.tertiary;
      case 'CANCELLED':
        return theme.button.error.background;
      default:
        return theme.button.primary.background;
    }
  };

  const handleFeedbackSubmit = (feedback: {
    ratings: { [key: string]: number };
    comment: string;
    eventId: string;
    averageRating: number;
  }) => {
    console.log('Event Feedback Submitted:', feedback);
    // TODO: Send feedback to API
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: insets.top + 12,
      backgroundColor: theme.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      marginLeft: 12,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    feedbackButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.button.primary.background + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: theme.text.secondary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      fontSize: 16,
      color: theme.button.error.background,
      textAlign: 'center',
      marginBottom: 16,
      fontFamily: getFontStyle('body').fontFamily,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: theme.button.primary.background,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.button.primary.text,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: getFontStyle('button').fontFamily,
    },
    scrollContent: {
      paddingBottom: 16,
    },
    heroSection: {
      padding: 16,
      backgroundColor: theme.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 10,
      lineHeight: 28,
      fontFamily: getFontStyle('h2').fontFamily,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: theme.button.primary.background + '15',
      borderRadius: 14,
    },
    tagText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.button.primary.background,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
      marginBottom: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: getFontStyle('caption').fontFamily,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 10,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: theme.text.primary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    section: {
      padding: 16,
      backgroundColor: theme.background.card,
      marginTop: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 10,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    description: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    statCard: {
      flex: 1,
      padding: 12,
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.button.primary.background,
      lineHeight: 24,
      fontFamily: getFontStyle('h2').fontFamily,
    },
    statLabel: {
      fontSize: 11,
      color: theme.text.secondary,
      marginTop: 2,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    venueCard: {
      padding: 12,
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
    },
    venueTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 4,
      lineHeight: 20,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    venueText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 6,
      lineHeight: 18,
      fontFamily: getFontStyle('body').fontFamily,
    },
    amenitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    amenity: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.background.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    amenityText: {
      fontSize: 11,
      color: theme.text.primary,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    trackCard: {
      padding: 12,
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      marginBottom: 8,
      borderLeftWidth: 4,
    },
    trackName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 3,
      lineHeight: 18,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    trackDescription: {
      fontSize: 12,
      color: theme.text.secondary,
      lineHeight: 16,
      fontFamily: getFontStyle('body').fontFamily,
    },
    moreInfoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.primary.background,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 16,
      gap: 8,
    },
    moreInfoButtonText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.button.primary.text,
      textAlign: 'center',
      fontFamily: getFontStyle('button').fontFamily,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={24}
              color={theme.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.button.primary.background}
          />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={24}
              color={theme.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadEventDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name={isRTL ? 'chevron-right' : 'chevron-left'}
            size={24}
            color={theme.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => setShowFeedbackModal(true)}
          activeOpacity={0.7}
        >
          <Icon
            name="rate_review"
            size={22}
            color={theme.button.primary.background}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>{event.title}</Text>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {event.tags.map(tag => (
                <View key={tag.id} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Status */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(event.status) },
            ]}
          >
            <Text style={styles.statusText}>{event.status}</Text>
          </View>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon
                name="calendar"
                size={20}
                color={theme.button.primary.background}
              />
            </View>
            <Text style={styles.infoText}>
              {formatDate(event.startTime)} - {formatDate(event.endTime)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon
                name="clock"
                size={20}
                color={theme.button.primary.background}
              />
            </View>
            <Text style={styles.infoText}>
              {formatTime(event.startTime)} - {formatTime(event.endTime)} (
              {event.timezone})
            </Text>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon
                name="location"
                size={20}
                color={theme.button.primary.background}
              />
            </View>
            <Text style={styles.infoText}>{event.venue}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{event.confirmedCount}</Text>
              <Text style={styles.statLabel}>Registered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{event.availableSeats}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{event.capacity}</Text>
              <Text style={styles.statLabel}>Capacity</Text>
            </View>
          </View>

          {/* More Info Button */}
          {event.scheduleItems && event.scheduleItems.length > 0 && (
            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={() => setShowScheduleModal(true)}
            >
              <Icon
                name="calendar"
                size={20}
                color={theme.button.primary.text}
              />
              <Text style={styles.moreInfoButtonText}>
                View Schedule ({event.scheduleItems.length} sessions)
              </Text>
              <Icon
                name="chevron-right"
                size={20}
                color={theme.button.primary.text}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Venue Details - Compact */}
        {event.venueModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue</Text>
            <View style={styles.venueCard}>
              <Text style={styles.venueTitle}>{event.venueModel.name}</Text>
              <Text style={styles.venueText}>
                {event.venueModel.city}, {event.venueModel.state}
              </Text>

              {event.venueModel.amenities &&
                event.venueModel.amenities.length > 0 && (
                  <View style={styles.amenitiesContainer}>
                    {event.venueModel.amenities
                      .slice(0, 4)
                      .map((amenity, index) => (
                        <View key={index} style={styles.amenity}>
                          <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                      ))}
                    {event.venueModel.amenities.length > 4 && (
                      <View style={styles.amenity}>
                        <Text style={styles.amenityText}>
                          +{event.venueModel.amenities.length - 4}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
            </View>
          </View>
        )}

        {/* Tracks */}
        {event.tracks && event.tracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracks</Text>
            {event.tracks.map(track => (
              <View
                key={track.id}
                style={[styles.trackCard, { borderLeftColor: track.color }]}
              >
                <Text style={styles.trackName}>{track.name}</Text>
                <Text style={styles.trackDescription}>{track.description}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Schedule Modal */}
      {event.scheduleItems && event.scheduleItems.length > 0 && (
        <EventScheduleModal
          visible={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          eventTitle={event.title}
          startTime={event.startTime}
          endTime={event.endTime}
          scheduleItems={event.scheduleItems}
        />
      )}

      {/* Feedback Modal */}
      <EventFeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        eventTitle={event.title}
        eventId={event.id}
        onSubmit={handleFeedbackSubmit}
      />
    </View>
  );
};

export default EventDetailScreen;
