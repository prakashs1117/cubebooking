import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText, Heading3 } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import {
  Session,
  getSessionTypeColor,
  formatSessionTime,
  getCapacityColor,
} from '@services/eventsService';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
  const { theme } = useTheme();

  const typeColor = getSessionTypeColor(session.type);
  const capacityColor = session.capacity
    ? getCapacityColor(session.capacity.availability_percentage)
    : theme.text.secondary;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: typeColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    typeBadge: {
      backgroundColor: typeColor + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    timeText: {
      marginLeft: 6,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    locationText: {
      marginLeft: 6,
    },
    speakerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    speakerInfo: {
      marginLeft: 8,
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    capacityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    capacityBar: {
      width: 60,
      height: 4,
      backgroundColor: theme.border.secondary,
      borderRadius: 2,
      marginLeft: 6,
      overflow: 'hidden',
    },
    capacityFill: {
      height: '100%',
      borderRadius: 2,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    tag: {
      backgroundColor: theme.background.tertiary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 4,
      marginBottom: 4,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Heading3 color={theme.text.primary} numberOfLines={2}>
            {session.title}
          </Heading3>
        </View>
        <View style={styles.typeBadge}>
          <CaptionText color={typeColor} style={{ fontWeight: '600' }}>
            {session.type}
          </CaptionText>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Icon name="time" size={16} color={theme.text.secondary} />
        <BodyText style={styles.timeText} color={theme.text.secondary}>
          {formatSessionTime(session)} ({session.duration_minutes} min)
        </BodyText>
      </View>

      <View style={styles.locationContainer}>
        <Icon name="location" size={16} color={theme.text.secondary} />
        <BodyText style={styles.locationText} color={theme.text.secondary}>
          {session.location} - {session.floor}
        </BodyText>
      </View>

      {session.speaker && (
        <View style={styles.speakerContainer}>
          <Icon name="user" size={20} color={theme.text.link} />
          <View style={styles.speakerInfo}>
            <BodyText color={theme.text.primary} style={{ fontWeight: '600' }}>
              {session.speaker.name}
            </BodyText>
            <CaptionText color={theme.text.secondary}>
              {session.speaker.role} - {session.speaker.company}
            </CaptionText>
          </View>
        </View>
      )}

      {session.tags && session.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {session.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <CaptionText color={theme.text.secondary}>{tag}</CaptionText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        {session.capacity && (
          <View style={styles.capacityContainer}>
            <CaptionText color={theme.text.secondary}>
              {session.capacity.filled}/{session.capacity.total}
            </CaptionText>
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    width: `${session.capacity.availability_percentage}%`,
                    backgroundColor: capacityColor,
                  },
                ]}
              />
            </View>
          </View>
        )}
        {session.cme_credits && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={14} color="#F59E0B" />
            <CaptionText color={theme.text.secondary} style={{ marginLeft: 4 }}>
              {session.cme_credits} CME
            </CaptionText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SessionCard;
