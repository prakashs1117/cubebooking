import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import type { InsightSectionData } from './types';

const { fontFamily: h3FontFamily } = getFontStyle('h3');
const { fontFamily: bodyMedFontFamily } = getFontStyle('bodyMedium');
const { fontFamily: captionFontFamily } = getFontStyle('caption');

interface Props {
  section: InsightSectionData;
}

const VerticalInsightsSection: React.FC<Props> = ({ section }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {section.title}
      </Text>
      <View style={styles.list}>
        {section.items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, { borderBottomColor: theme.border.secondary }]}
            activeOpacity={0.75}
          >
            <Image
              source={{ uri: item.image }}
              style={[
                styles.thumb,
                { backgroundColor: theme.background.tertiary },
              ]}
              resizeMode="cover"
            />
            <View style={styles.body}>
              <View style={styles.meta}>
                <View
                  style={[styles.dot, { backgroundColor: item.categoryColor }]}
                />
                <Text style={[styles.category, { color: theme.text.tertiary }]}>
                  {item.category}
                </Text>
              </View>
              <Text style={[styles.itemTitle, { color: theme.text.primary }]}>
                {item.title}
              </Text>
              <Text style={[styles.readMeta, { color: theme.text.secondary }]}>
                {item.meta}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  title: {
    fontFamily: h3FontFamily,
    fontSize: getFontStyle('h3').fontSize,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  list: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  category: {
    fontFamily: captionFontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  itemTitle: {
    fontFamily: bodyMedFontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  readMeta: {
    fontFamily: captionFontFamily,
    fontSize: 11,
    marginTop: 2,
  },
});

export default VerticalInsightsSection;
