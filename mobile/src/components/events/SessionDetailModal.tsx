import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import FeedbackModal from '@components/events/FeedbackModal';

interface Speaker {
  name: string;
  title: string;
  company: string;
  bio?: string;
  photo?: string;
}

interface SessionDetail {
  id: string;
  eventId: string;
  title: string;
  description: string;
  speakers: Speaker[] | null;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  tags?: string[] | null;
  difficultyLevel?: string | null;
  capacity?: number | null;
  recordingUrl?: string | null;
  slidesUrl?: string | null;
  isHighlight?: boolean;
}

interface SessionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  session: SessionDetail | null;
}

/**
 * SessionDetailModal Component
 * Full-screen modal displaying individual event session details
 * Beautiful, compact design with no empty spaces
 */
const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  visible,
  onClose,
  session,
}) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!session) return null;

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'keynote':
        return '#e74c3c';
      case 'workshop':
        return '#3498db';
      case 'talk':
        return '#9b59b6';
      case 'panel':
        return '#f39c12';
      case 'break':
        return '#95a5a6';
      default:
        return theme.button.primary.background;
    }
  };

  const getTypeIcon = (type: string): IconName => {
    switch (type.toLowerCase()) {
      case 'keynote':
        return 'star';
      case 'workshop':
        return 'component';
      case 'talk':
        return 'user';
      case 'panel':
        return 'user';
      case 'break':
        return 'time';
      default:
        return 'calendar';
    }
  };

  const getDifficultyColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return '#27ae60';
      case 'intermediate':
        return '#f39c12';
      case 'advanced':
        return '#e74c3c';
      default:
        return theme.text.secondary;
    }
  };

  const typeColor = getTypeColor(session.type);
  const duration =
    (new Date(session.endTime).getTime() -
      new Date(session.startTime).getTime()) /
    (1000 * 60);

  const handleFeedbackPress = () => {
    console.log('📝 Feedback icon pressed for session:', session.title);
    setFeedbackModalVisible(true);
  };

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-start',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
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
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('h4').fontFamily,
    },
    feedbackIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    heroSection: {
      height: 180,
      backgroundColor: typeColor + '15',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: typeColor,
    },
    heroIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: typeColor + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    heroTypeText: {
      fontSize: 14,
      fontWeight: '700',
      color: typeColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    contentSection: {
      backgroundColor: theme.background.card,
      marginTop: 2,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    titleSection: {
      marginBottom: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      lineHeight: 28,
      marginBottom: 8,
      fontFamily: getFontStyle('h2').fontFamily,
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    highlightBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.button.primary.background + '20',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    highlightText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.button.primary.background,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    difficultyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
      fontFamily: getFontStyle('caption').fontFamily,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 16,
    },
    infoCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    infoIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 10,
      color: theme.text.tertiary,
      marginBottom: 2,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 12,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.text.secondary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    speakersSection: {
      marginTop: 16,
    },
    speakerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    speakerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: typeColor + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    speakerInitials: {
      fontSize: 18,
      fontWeight: '700',
      color: typeColor,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    speakerInfo: {
      flex: 1,
    },
    speakerName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 2,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    speakerTitle: {
      fontSize: 12,
      color: theme.text.secondary,
      marginBottom: 2,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    speakerCompany: {
      fontSize: 11,
      color: theme.text.tertiary,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    tagsSection: {
      marginTop: 16,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.background.secondary,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    tagText: {
      fontSize: 12,
      color: theme.text.primary,
      fontWeight: '500',
      fontFamily: getFontStyle('caption').fontFamily,
    },
    linksSection: {
      marginTop: 16,
      gap: 10,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      padding: 14,
      gap: 12,
    },
    linkIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.button.primary.background + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    linkText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
  });

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
      supportedOrientations={[
        'portrait',
        'landscape',
        'portrait-upside-down',
        'landscape-left',
        'landscape-right',
      ]}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon
                name={isRTL ? 'chevron-right' : 'chevron-left'}
                size={26}
                color={theme.text.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Session Details
            </Text>
            <TouchableOpacity
              onPress={handleFeedbackPress}
              style={styles.feedbackIconButton}
              activeOpacity={0.7}
            >
              <Icon
                name="rate_review"
                size={22}
                color={theme.button.primary.background}
              />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
          >
            {/* Hero Section with Type */}
            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <Icon
                  name={getTypeIcon(session.type)}
                  size={40}
                  color={typeColor}
                />
              </View>
              <Text style={styles.heroTypeText}>{session.type}</Text>
            </View>

            {/* Title and Badges */}
            <View style={styles.contentSection}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>{session.title}</Text>

                <View style={styles.badgesRow}>
                  {session.isHighlight && (
                    <View style={styles.highlightBadge}>
                      <Icon
                        name="star"
                        size={12}
                        color={theme.button.primary.background}
                      />
                      <Text style={styles.highlightText}>FEATURED</Text>
                    </View>
                  )}
                  {session.difficultyLevel && (
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor: getDifficultyColor(
                            session.difficultyLevel,
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {session.difficultyLevel.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                {/* Date */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Icon
                      name="calendar"
                      size={18}
                      color={theme.text.primary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(session.startTime)}
                    </Text>
                  </View>
                </View>

                {/* Time */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="clock" size={18} color={theme.text.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue}>
                      {formatTime(session.startTime)}
                    </Text>
                  </View>
                </View>

                {/* Duration */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="time" size={18} color={theme.text.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Duration</Text>
                    <Text style={styles.infoValue}>{duration} mins</Text>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Icon
                      name="location"
                      size={18}
                      color={theme.text.primary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{session.location}</Text>
                  </View>
                </View>

                {/* Capacity */}
                {session.capacity && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                      <Icon name="user" size={18} color={theme.text.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Capacity</Text>
                      <Text style={styles.infoValue}>
                        {session.capacity} seats
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Description */}
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>About This Session</Text>
              <Text style={styles.description}>{session.description}</Text>
            </View>

            {/* Speakers */}
            {session.speakers && session.speakers.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>
                  {session.speakers.length === 1 ? 'Speaker' : 'Speakers'}
                </Text>
                <View style={styles.speakersSection}>
                  {session.speakers.map((speaker) => (
                    <View key={`speaker-${speaker.name}-${speaker.company}`} style={styles.speakerCard}>
                      <View style={styles.speakerAvatar}>
                        <Text style={styles.speakerInitials}>
                          {getInitials(speaker.name)}
                        </Text>
                      </View>
                      <View style={styles.speakerInfo}>
                        <Text style={styles.speakerName}>{speaker.name}</Text>
                        <Text style={styles.speakerTitle}>{speaker.title}</Text>
                        <Text style={styles.speakerCompany}>
                          {speaker.company}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Topics</Text>
                <View style={styles.tagsSection}>
                  <View style={styles.tagsContainer}>
                    {session.tags.map((tag) => (
                      <View key={`tag-${tag}`} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Links */}
            {(session.recordingUrl || session.slidesUrl) && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Resources</Text>
                <View style={styles.linksSection}>
                  {session.recordingUrl && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      activeOpacity={0.7}
                    >
                      <View style={styles.linkIconContainer}>
                        <Icon
                          name="sparkle"
                          size={18}
                          color={theme.button.primary.background}
                        />
                      </View>
                      <Text style={styles.linkText}>Watch Recording</Text>
                      <Icon
                        name="arrow-right-small"
                        size={20}
                        color={theme.text.tertiary}
                      />
                    </TouchableOpacity>
                  )}
                  {session.slidesUrl && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      activeOpacity={0.7}
                    >
                      <View style={styles.linkIconContainer}>
                        <Icon
                          name="document"
                          size={18}
                          color={theme.button.primary.background}
                        />
                      </View>
                      <Text style={styles.linkText}>View Slides</Text>
                      <Icon
                        name="arrow-right-small"
                        size={20}
                        color={theme.text.tertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        sessionId={session.id}
        sessionTitle={session.title}
      />
    </Modal>
  );
};

export default SessionDetailModal;
