import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { Heading3, BodyText, CaptionText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { DaySchedule } from '@services/eventsService';

interface DayScheduleCardProps {
  day: DaySchedule;
}

const DayScheduleCard: React.FC<DayScheduleCardProps> = ({ day }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    dayNumber: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.button.primary.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    infoContainer: {
      flex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    statText: {
      marginLeft: 4,
    },
  });

  const sessionTypes = {
    keynotes: day.sessions.filter(s => s.type === 'KEYNOTE').length,
    workshops: day.sessions.filter(s => s.type === 'WORKSHOP').length,
    panels: day.sessions.filter(s => s.type === 'PANEL').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dayNumber}>
          <BodyText
            color={theme.button.primary.text}
            style={{ fontWeight: 'bold', fontSize: 18 }}
          >
            {day.day_number}
          </BodyText>
        </View>
        <View style={styles.infoContainer}>
          <Heading3 color={theme.text.primary}>{day.label}</Heading3>
          <CaptionText color={theme.text.secondary}>
            {formatDate(day.date)}
          </CaptionText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="calendar" size={16} color={theme.text.secondary} />
          <CaptionText style={styles.statText} color={theme.text.secondary}>
            {day.sessions.length} sessions
          </CaptionText>
        </View>
        {sessionTypes.keynotes > 0 && (
          <View style={styles.statItem}>
            <Icon name="star" size={16} color="#8B5CF6" />
            <CaptionText style={styles.statText} color={theme.text.secondary}>
              {sessionTypes.keynotes} keynotes
            </CaptionText>
          </View>
        )}
        {sessionTypes.workshops > 0 && (
          <View style={styles.statItem}>
            <Icon name="document" size={16} color="#3B82F6" />
            <CaptionText style={styles.statText} color={theme.text.secondary}>
              {sessionTypes.workshops} workshops
            </CaptionText>
          </View>
        )}
      </View>
    </View>
  );
};

export default DayScheduleCard;
