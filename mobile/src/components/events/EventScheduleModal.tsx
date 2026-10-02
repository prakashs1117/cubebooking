import React, { useState, useEffect, useRef } from 'react';
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
import EventDateSelector from '@components/events/EventDateSelector';
import SessionDetailModal from '@components/events/SessionDetailModal';

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

interface EventScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  startTime: string;
  endTime: string;
  scheduleItems: ScheduleItem[];
}

const EventScheduleModal: React.FC<EventScheduleModalProps> = ({
  visible,
  onClose,
  eventTitle: _eventTitle,
  startTime,
  endTime,
  scheduleItems,
}) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(startTime));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [sessionDetailVisible, setSessionDetailVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ScheduleItem | null>(
    null,
  );

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date(startTime));
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, startTime, fadeAnim]);

  // Helper: Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Get schedule items for selected date
  const getScheduleItemsForDate = (date: Date): ScheduleItem[] => {
    return scheduleItems
      .filter(item => {
        const itemDate = new Date(item.startTime);
        return isSameDay(itemDate, date);
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  };

  // Get dates that have schedule items
  const getDatesWithScheduleItems = (): Date[] => {
    const uniqueDates = new Set<string>();
    scheduleItems.forEach(item => {
      const date = new Date(item.startTime);
      uniqueDates.add(date.toDateString());
    });
    return Array.from(uniqueDates).map(dateStr => new Date(dateStr));
  };

  const filteredScheduleItems = getScheduleItemsForDate(selectedDate);
  const datesWithEvents = getDatesWithScheduleItems();

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimeRange = (startTime: string, endTime: string): string => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    return `${start}\n${end}`;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  const getTypeIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'keynote':
        return 'star';
      case 'workshop':
        return 'briefcase';
      case 'talk':
        return 'mic';
      case 'panel':
        return 'users';
      case 'break':
        return 'coffee';
      default:
        return 'calendar';
    }
  };

  const handleSessionPress = (session: ScheduleItem) => {
    console.log('📅 Session pressed:', session.title);
    setSelectedSession(session);
    setSessionDetailVisible(true);
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
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    contentContainer: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    datePickerSection: {
      backgroundColor: theme.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    selectedDateInfo: {
      backgroundColor: theme.background.card,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    selectedDateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedDateText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    sessionsCountBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.button.primary.background,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    timelineContainer: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 20,
    },
    noEventsContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noEventsText: {
      fontSize: 16,
      color: theme.text.secondary,
      marginTop: 12,
      fontFamily: getFontStyle('body').fontFamily,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    timelineLeft: {
      width: 65,
      paddingRight: 12,
      alignItems: 'flex-end',
      paddingTop: 4,
    },
    timelineCenter: {
      width: 20,
      alignItems: 'center',
    },
    timelineRight: {
      flex: 1,
      paddingLeft: 12,
    },
    timeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text.secondary,
      textAlign: 'right',
      lineHeight: 16,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginVertical: 4,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: theme.border.secondary,
    },
    scheduleCard: {
      backgroundColor: theme.background.card,
      borderRadius: 10,
      padding: 12,
      borderLeftWidth: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    highlightCard: {
      borderWidth: 1,
      borderColor: theme.button.primary.background + '30',
    },
    scheduleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    typeIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    scheduleTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      lineHeight: 20,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    typeBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    scheduleDescription: {
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 18,
      marginBottom: 8,
      fontFamily: getFontStyle('body').fontFamily,
    },
    detailsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
      marginBottom: 8,
    },
    detailBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 7,
      paddingVertical: 3,
      backgroundColor: theme.background.secondary,
      borderRadius: 6,
      gap: 4,
      maxWidth: 100,
    },
    detailText: {
      fontSize: 10,
      color: theme.text.secondary,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    speakersContainer: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    speakerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },
    speakerDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.button.primary.background,
      marginRight: 6,
    },
    speakerText: {
      flex: 1,
      fontSize: 11,
      color: theme.text.primary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    difficultyBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    difficultyText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      fontFamily: getFontStyle('caption').fontFamily,
    },
  });

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
              Event Schedule
            </Text>
          </View>

          {/* Content Container - Takes remaining space */}
          <View style={styles.contentContainer}>
            {/* Date Selector Section - Fixed at top */}
            <View style={styles.datePickerSection}>
              <EventDateSelector
                startDate={startTime}
                endDate={endTime}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                datesWithEvents={datesWithEvents}
              />
            </View>

            {/* Selected Date Info - Fixed below date picker */}
            <View style={styles.selectedDateInfo}>
              <View style={styles.selectedDateHeader}>
                <Text style={styles.selectedDateText}>
                  {formatMonthYear(selectedDate)}
                </Text>
                <Text style={styles.sessionsCountBadge}>
                  {filteredScheduleItems.length}{' '}
                  {filteredScheduleItems.length === 1 ? 'Session' : 'Sessions'}
                </Text>
              </View>
            </View>

            {/* Schedule Timeline - Scrollable content */}
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {filteredScheduleItems.length === 0 ? (
                <View style={styles.noEventsContainer}>
                  <Icon name="calendar" size={48} color={theme.text.tertiary} />
                  <Text style={styles.noEventsText}>
                    No schedule items for this date
                  </Text>
                </View>
              ) : (
                <View style={styles.timelineContainer}>
                  {filteredScheduleItems.map((item, index) => {
                    const typeColor = getTypeColor(item.type);
                    const isLastItem =
                      index === filteredScheduleItems.length - 1;

                    return (
                      <View key={item.id} style={styles.timelineItem}>
                        {/* Left Time */}
                        <View style={styles.timelineLeft}>
                          <Text style={styles.timeText}>
                            {formatTimeRange(item.startTime, item.endTime)}
                          </Text>
                        </View>

                        {/* Center Line */}
                        <View style={styles.timelineCenter}>
                          <View
                            style={[
                              styles.timelineDot,
                              { backgroundColor: typeColor },
                            ]}
                          />
                          {!isLastItem && <View style={styles.timelineLine} />}
                        </View>

                        {/* Right Card */}
                        <View style={styles.timelineRight}>
                          <TouchableOpacity
                            style={[
                              styles.scheduleCard,
                              { borderLeftColor: typeColor },
                              item.isHighlight && styles.highlightCard,
                            ]}
                            onPress={() => handleSessionPress(item)}
                            activeOpacity={0.7}
                          >
                            {/* Card Header */}
                            <View style={styles.scheduleHeader}>
                              <View
                                style={[
                                  styles.typeIcon,
                                  { backgroundColor: typeColor + '20' },
                                ]}
                              >
                                <Icon
                                  name={getTypeIcon(item.type)}
                                  size={16}
                                  color={typeColor}
                                />
                              </View>
                              <Text
                                style={styles.scheduleTitle}
                                numberOfLines={2}
                              >
                                {item.title}
                              </Text>
                            </View>

                            {/* Description */}
                            <Text
                              style={styles.scheduleDescription}
                              numberOfLines={3}
                            >
                              {item.description}
                            </Text>

                            {/* Details Row */}
                            <View style={styles.detailsRow}>
                              {/* Location */}
                              <View style={styles.detailBadge}>
                                <Icon
                                  name="location"
                                  size={11}
                                  color={theme.text.secondary}
                                />
                                <Text style={styles.detailText}>
                                  {item.location}
                                </Text>
                              </View>

                              {/* Capacity */}
                              {item.capacity && (
                                <View style={styles.detailBadge}>
                                  <Icon
                                    name="user"
                                    size={11}
                                    color={theme.text.secondary}
                                  />
                                  <Text style={styles.detailText}>
                                    {item.capacity}
                                  </Text>
                                </View>
                              )}

                              {/* Type Badge */}
                              <View
                                style={[
                                  styles.typeBadge,
                                  { backgroundColor: typeColor },
                                ]}
                              >
                                <Text style={styles.typeBadgeText}>
                                  {item.type}
                                </Text>
                              </View>

                              {/* Difficulty */}
                              {item.difficultyLevel && (
                                <View
                                  style={[
                                    styles.difficultyBadge,
                                    {
                                      backgroundColor:
                                        item.difficultyLevel === 'beginner'
                                          ? '#27ae60'
                                          : item.difficultyLevel ===
                                            'intermediate'
                                          ? '#f39c12'
                                          : '#e74c3c',
                                    },
                                  ]}
                                >
                                  <Text style={styles.difficultyText}>
                                    {item.difficultyLevel}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Speakers */}
                            {item.speakers && item.speakers.length > 0 && (
                              <View style={styles.speakersContainer}>
                                {item.speakers.map((speaker) => (
                                  <View key={`speaker-${speaker.name}-${speaker.title}`} style={styles.speakerRow}>
                                    <View style={styles.speakerDot} />
                                    <Text
                                      style={styles.speakerText}
                                      numberOfLines={1}
                                    >
                                      {speaker.name} • {speaker.title}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* Session Detail Modal */}
      <SessionDetailModal
        visible={sessionDetailVisible}
        onClose={() => setSessionDetailVisible(false)}
        session={selectedSession}
      />
    </Modal>
  );
};

export default EventScheduleModal;
