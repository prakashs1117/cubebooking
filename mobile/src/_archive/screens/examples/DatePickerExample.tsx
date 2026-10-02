/**
 * Horizontal Date Picker Examples
 * Demonstrates different configurations and use cases
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HorizontalDatePicker } from '@components/common/HorizontalDatePicker';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

const DatePickerExample: React.FC = () => {
  const { theme } = useTheme();
  const [selectedDate1, setSelectedDate1] = useState<Date>(new Date());
  const [selectedDate2, setSelectedDate2] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Example 1: Default Configuration */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          1. Default Date Picker
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          With sticky month label and auto-scroll to today
        </Text>

        <View style={styles.pickerWrapper}>
          <HorizontalDatePicker
            onDateSelect={date => setSelectedDate1(date)}
            initialDate={new Date()}
            showMonthLabel={true}
          />
        </View>

        <View
          style={[
            styles.selectedDateBox,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.selectedDateLabel,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            Selected Date:
          </Text>
          <Text
            style={[
              styles.selectedDateText,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            {formatDate(selectedDate1)}
          </Text>
        </View>
      </View>

      {/* Example 2: Compact Mode */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          2. Compact Mode
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          Without month label for minimal space
        </Text>

        <View style={styles.pickerWrapper}>
          <HorizontalDatePicker
            onDateSelect={date => setSelectedDate2(date)}
            initialDate={new Date()}
            showMonthLabel={false}
            containerStyle={{ height: 70 }}
          />
        </View>

        <View
          style={[
            styles.selectedDateBox,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.selectedDateLabel,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            Selected Date:
          </Text>
          <Text
            style={[
              styles.selectedDateText,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            {formatDate(selectedDate2)}
          </Text>
        </View>
      </View>

      {/* Example 3: Extended Range */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          3. Extended Range
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          Shows 90 days (45 before and after)
        </Text>

        <View style={styles.pickerWrapper}>
          <HorizontalDatePicker
            onDateSelect={date => console.log('Extended range:', date)}
            initialDate={new Date()}
            daysToShow={90}
            showMonthLabel={true}
          />
        </View>
      </View>

      {/* Example 4: Custom Initial Date */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          4. Custom Initial Date
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          Starts at a specific date (e.g., event date)
        </Text>

        <View style={styles.pickerWrapper}>
          <HorizontalDatePicker
            onDateSelect={date => console.log('Custom date:', date)}
            initialDate={new Date('2026-06-15')}
            showMonthLabel={true}
          />
        </View>
      </View>

      {/* Features List */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          Features
        </Text>

        <View style={styles.featuresList}>
          {[
            '✅ Auto-scrolls to today on mount',
            '✅ Sticky month label updates on scroll',
            '✅ Today indicator (dot below date)',
            '✅ Smooth month transitions',
            '✅ Performant with FlatList',
            '✅ Light/Dark theme support',
            '✅ Large touch targets (accessible)',
            '✅ Customizable styling',
          ].map((feature, index) => (
            <Text
              key={index}
              style={[
                styles.featureItem,
                {
                  color: theme.text.primary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              {feature}
            </Text>
          ))}
        </View>
      </View>

      {/* Usage Example */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          Usage Example
        </Text>

        <View
          style={[
            styles.codeBlock,
            {
              backgroundColor: theme.background.tertiary,
              borderColor: theme.border.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.codeText,
              { color: theme.text.secondary, fontFamily: 'Courier' },
            ]}
          >
            {`<HorizontalDatePicker
  onDateSelect={(date) => {
    console.log('Selected:', date);
  }}
  initialDate={new Date()}
  daysToShow={60}
  showMonthLabel={true}
/>`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  pickerWrapper: {
    marginVertical: 8,
  },
  selectedDateBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
  },
  selectedDateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 8,
    marginTop: 12,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  codeBlock: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default DatePickerExample;
