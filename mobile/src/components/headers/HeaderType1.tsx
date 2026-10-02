import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, createCommonStyles } from '@theme/index';
import { useTranslation } from 'react-i18next';
import { Heading1, BodyText, CaptionText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { EventData } from '@services/eventsService';

interface HeaderType1Props {
  eventData: EventData;
}

/**
 * HeaderType1 - Full gradient header with event information
 * Displays event name, theme, venue, dates with colored background
 */
const HeaderType1: React.FC<HeaderType1Props> = ({ eventData }) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const commonStyles = createCommonStyles(theme);

  const currentLang = i18n.language;
  const isCurrentRTL = currentLang === 'ar';

  const styles = StyleSheet.create({
    ...commonStyles,
    header: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 20,
      paddingVertical: 24,
      paddingTop: 40,
    },
    headerTitle: {
      marginBottom: 8,
    },
    headerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    headerIcon: {
      marginRight: 8,
    },
  });

  return (
    <View style={styles.header}>
      <Heading1
        style={[styles.headerTitle, isCurrentRTL && commonStyles.rtlText]}
        color={theme.button.primary.text}
      >
        {eventData.name}
      </Heading1>
      <BodyText color={theme.button.primary.text + 'DD'}>
        {eventData.theme}
      </BodyText>
      <View style={styles.headerInfo}>
        <Icon
          name="location"
          size={16}
          color={theme.button.primary.text}
          style={styles.headerIcon}
        />
        <CaptionText color={theme.button.primary.text + 'DD'}>
          {eventData.venue.name}
        </CaptionText>
      </View>
      <View style={[styles.headerInfo, { marginTop: 4 }]}>
        <Icon
          name="calendar"
          size={16}
          color={theme.button.primary.text}
          style={styles.headerIcon}
        />
        <CaptionText color={theme.button.primary.text + 'DD'}>
          {new Date(eventData.event_dates.start_date).toLocaleDateString()} -{' '}
          {new Date(eventData.event_dates.end_date).toLocaleDateString()}
        </CaptionText>
      </View>
    </View>
  );
};

export default HeaderType1;
