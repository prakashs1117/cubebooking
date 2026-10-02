import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import EventCard from './EventCard';

interface Event {
  id: string;
  date: { day: number; month: string };
  title: string;
  location: string;
  gradientType: 'ec1' | 'ec2' | 'ec3';
  seats: { available?: number; status: 'available' | 'low' | 'waitlist' };
  attendees?: Array<{ initials: string; color: string }>;
}

interface EventCarouselProps {
  title?: string;
  onSeeAll?: () => void;
  events?: Event[];
  onEventPress?: (eventId: string) => void;
  onEventRegister?: (eventId: string) => void;
}

export default function EventCarousel({
  title = 'Upcoming events',
  onSeeAll,
  events,
  onEventPress,
  onEventRegister,
}: EventCarouselProps) {
  const { theme } = useTheme();

  const mockEvents: Event[] = events || [
    {
      id: '1',
      date: { day: 16, month: 'Jun' },
      title: 'AI in Pharma — Tech Conference',
      location: 'Innovation Center, Hall B',
      gradientType: 'ec1',
      seats: { available: 12, status: 'available' },
      attendees: [
        { initials: 'A', color: '#149B5F' },
        { initials: 'S', color: '#2DBECD' },
        { initials: '+', color: '#0F69AF' },
      ],
    },
    {
      id: '2',
      date: { day: 19, month: 'Jun' },
      title: 'Cloud Architecture Training',
      location: 'Virtual · MS Teams',
      gradientType: 'ec2',
      seats: { status: 'waitlist' },
      attendees: [],
    },
    {
      id: '3',
      date: { day: 24, month: 'Jun' },
      title: 'Summer Cricket Tournament 🏏',
      location: 'Campus Sports Ground',
      gradientType: 'ec3',
      seats: { available: 48, status: 'available' },
      attendees: [],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      marginBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      marginBottom: 13,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: -0.3,
      color: theme.text.primary,
    },
    seeAllLink: {
      fontSize: 13,
      fontWeight: '700',
      color: '#149B5F',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    scrollContainer: {
      paddingHorizontal: 14,
      gap: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>{title}</CustomText>
        {onSeeAll && (
          <CustomText style={styles.seeAllLink} onPress={onSeeAll}>
            See all →
          </CustomText>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
      >
        {mockEvents.map(event => (
          <EventCard
            key={event.id}
            date={event.date}
            title={event.title}
            location={event.location}
            gradientType={event.gradientType}
            seats={event.seats}
            attendees={event.attendees}
            onPress={() => onEventPress?.(event.id)}
            onRegisterPress={() => onEventRegister?.(event.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
