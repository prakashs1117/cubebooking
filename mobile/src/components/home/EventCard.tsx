import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import Avatar from '@/components/common/Avatar';
import CustomButton from '@/components/common/CustomButton';
import { PinIcon } from '@/components/icons/components/PinIcon';

interface EventCardProps {
  date: {
    day: number;
    month: string;
  };
  title: string;
  location: string;
  gradientType: 'ec1' | 'ec2' | 'ec3';
  seats: {
    available?: number;
    status: 'available' | 'low' | 'waitlist';
  };
  attendees?: Array<{ initials: string; color: string }>;
  onPress?: () => void;
  onRegisterPress?: () => void;
}

export default function EventCard({
  date,
  title,
  location,
  gradientType,
  seats,
  attendees,
  onPress,
  onRegisterPress,
}: EventCardProps) {
  const { theme } = useTheme();

  const gradientMap = {
    ec1: { start: '#149B5F', end: '#2DBECD' },
    ec2: { start: '#0F69AF', end: '#2DBECD' },
    ec3: { start: '#C2780A', end: '#FFC832' },
  };

  const { start: gradientStart, end: gradientEnd } = gradientMap[gradientType];

  const seatsText =
    seats.status === 'waitlist'
      ? 'Waitlist open'
      : seats.status === 'low'
        ? `${seats.available} seats left`
        : `${seats.available} seats left`;

  const seatsColor = seats.status === 'low' ? '#B07B00' : '#149B5F';

  const styles = StyleSheet.create({
    card: {
      minWidth: 244,
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 12,
      overflow: 'hidden',
    },
    cover: {
      height: 95,
      backgroundColor: gradientStart,
      justifyContent: 'flex-end',
      paddingHorizontal: 11,
      paddingVertical: 11,
      position: 'relative',
    },
    coverPattern: {
      position: 'absolute',
      inset: 0,
      opacity: 0.15,
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
    dateBox: {
      backgroundColor: 'rgba(255,255,255,0.97)',
      borderRadius: 10,
      paddingHorizontal: 11,
      paddingVertical: 6,
      alignItems: 'center',
      zIndex: 1,
    },
    dateDay: {
      fontSize: 17,
      fontWeight: '900',
      color: '#0B5A37',
      lineHeight: 20,
    },
    dateMonth: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      color: '#0B5A37',
    },
    body: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
      flex: 1,
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 1.4,
      color: theme.text.primary,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 5,
    },
    metaIcon: {
      width: 14,
      height: 14,
    },
    metaText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 8,
    },
    seatsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    avatars: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      marginLeft: -7,
      borderWidth: 2,
      borderColor: theme.background.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    seats: {
      fontSize: 11,
      fontWeight: '700',
      color: seatsColor,
    },
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cover}>
        <View style={styles.coverPattern} />
        <View style={styles.dateBox}>
          <CustomText style={styles.dateDay}>{date.day}</CustomText>
          <CustomText style={styles.dateMonth}>{date.month}</CustomText>
        </View>
      </View>

      <View style={styles.body}>
        <View>
          <CustomText style={styles.title}>{title}</CustomText>
          <View style={styles.meta}>
            <PinIcon width={12} height={12} color={theme.text.secondary} />
            <CustomText style={styles.metaText}>{location}</CustomText>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.seatsContainer}>
            {attendees && attendees.length > 0 && (
              <View style={styles.avatars}>
                {attendees.map((attendee, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: attendee.color,
                        marginLeft: idx === 0 ? 0 : -7,
                      },
                    ]}
                  >
                    <CustomText
                      style={{
                        fontSize: 8,
                        fontWeight: '800',
                        color: '#fff',
                      }}
                    >
                      {attendee.initials}
                    </CustomText>
                  </View>
                ))}
              </View>
            )}
            <CustomText style={styles.seats}>{seatsText}</CustomText>
          </View>
          <CustomButton
            title={seats.status === 'waitlist' ? 'Join waitlist' : 'Register'}
            onPress={onRegisterPress || (() => {})}
            variant={seats.status === 'waitlist' ? 'outline' : 'primary'}
            size="small"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
