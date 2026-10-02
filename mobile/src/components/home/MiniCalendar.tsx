import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import { ChevronLeftIcon } from '@/components/icons/components/ChevronIcon';
import { ChevronRightIcon } from '@/components/icons/components/ChevronRightIcon';

interface MiniCalendarProps {
  month?: number;
  year?: number;
  onMonthChange?: (month: number, year: number) => void;
}

export default function MiniCalendar({
  month = 6, // June
  year = 2026,
  onMonthChange,
}: MiniCalendarProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 10,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 17,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    monthYear: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text.primary,
    },
    navButtons: {
      flexDirection: 'row',
      gap: 6,
    },
    navButton: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    calendarGrid: {
      paddingVertical: 12,
      paddingHorizontal: 6,
    },
    weekDays: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingHorizontal: 6,
    },
    dayOfWeek: {
      flex: 1,
      textAlign: 'center',
      fontSize: 9.5,
      fontWeight: '800',
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      color: theme.text.tertiary,
      paddingVertical: 5,
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 3,
      paddingHorizontal: 6,
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    day: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.primary,
    },
    dayToday: {
      backgroundColor: '#149B5F',
      fontWeight: '900',
    },
    dayTodayText: {
      color: '#fff',
    },
    dayDim: {
      color: theme.text.tertiary,
      fontWeight: '400',
    },
    eventDot: {
      position: 'absolute',
      bottom: 2,
      width: 4.5,
      height: 4.5,
      borderRadius: 2.25,
    },
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const today = 10;
  const eventDays = { 4: 'c', 10: null, 16: 'g', 19: 'c', 24: 'y', 26: 'g' };
  const daysInMonth = 30; // June 2026

  const days = [];
  // Add previous month's trailing days
  for (let i = 1; i <= 5; i++) {
    days.push({ day: 30 - 5 + i, dim: true });
  }
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, dim: false, isToday: i === today });
  }
  // Add next month's leading days
  for (let i = 1; i <= 5; i++) {
    days.push({ day: i, dim: true });
  }

  const eventColorMap: { [key: string]: string } = {
    g: '#149B5F',
    c: '#2DBECD',
    y: '#FFC832',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.monthYear}>
          {monthNames[month - 1]} {year}
        </CustomText>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onMonthChange?.(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year)}
            activeOpacity={0.7}
          >
            <ChevronLeftIcon width={14} height={14} color={theme.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onMonthChange?.(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year)}
            activeOpacity={0.7}
          >
            <ChevronRightIcon width={14} height={14} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarGrid}>
        <View style={styles.weekDays}>
          {dayOfWeek.map(day => (
            <CustomText key={day} style={styles.dayOfWeek}>
              {day}
            </CustomText>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((dayObj, idx) => {
            const eventColor = eventDays[dayObj.day as keyof typeof eventDays];
            return (
              <View
                key={idx}
                style={[
                  styles.dayCell,
                  dayObj.isToday && styles.dayToday,
                ]}
              >
                <CustomText
                  style={[
                    styles.day,
                    dayObj.isToday && styles.dayTodayText,
                    dayObj.dim && styles.dayDim,
                  ]}
                >
                  {dayObj.day}
                </CustomText>
                {eventColor && dayObj.isToday === false && (
                  <View
                    style={[styles.eventDot, { backgroundColor: eventColorMap[eventColor] }]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
