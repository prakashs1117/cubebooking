import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomText } from '@components/common/CustomText';
import { BaseColors } from '@theme/colors';

// ─── Shared SDS sub-components ───────────────────────────────────────────────

interface Colors {
  primary: string;
  secondary: string;
  divider: string;
}

// Key/value row with a thin divider below
export const SDSInfoRow: React.FC<{
  label: string;
  value: string;
  colors: Colors;
  last?: boolean;
}> = ({ label, value, colors, last = false }) => (
  <View>
    <View style={sharedStyles.infoRow}>
      <CustomText style={[sharedStyles.infoLabel, { color: colors.secondary }]}>
        {label}
      </CustomText>
      <CustomText style={[sharedStyles.infoValue, { color: colors.primary }]}>
        {value}
      </CustomText>
    </View>
    {!last && (
      <View
        style={[sharedStyles.divider, { backgroundColor: colors.divider }]}
      />
    )}
  </View>
);

// Bulleted list of strings
export const SDSBulletList: React.FC<{
  items: string[];
  color: string;
}> = ({ items, color }) => (
  <View style={sharedStyles.bulletList}>
    {items.map((item, i) => (
      <View key={i} style={sharedStyles.bulletRow}>
        <View style={[sharedStyles.bullet, { backgroundColor: color }]} />
        <CustomText style={[sharedStyles.bulletText, { color }]}>
          {item}
        </CustomText>
      </View>
    ))}
  </View>
);

// Titled subsection container
export const SDSSubSection: React.FC<{
  title: string;
  colors: Colors;
  children: React.ReactNode;
}> = ({ title, colors, children }) => (
  <View style={sharedStyles.subSection}>
    <CustomText
      style={[sharedStyles.subSectionTitle, { color: BaseColors.merckPurple }]}
    >
      {title}
    </CustomText>
    {children}
  </View>
);

// Flexible renderer for sections with unknown data shapes (14, 16)
export const GenericSectionRenderer: React.FC<{
  data: Record<string, any>;
  colors: Colors;
}> = ({ data, colors }) => {
  const entries = Object.entries(data).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    if (Array.isArray(v) && v.length === 0) return false;
    if (typeof v === 'string' && v.trim() === '') return false;
    return true;
  });

  return (
    <>
      {entries.map(([key, value], i) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .trim();
        const formatted = Array.isArray(value)
          ? value.join('\n')
          : typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);
        return (
          <SDSInfoRow
            key={key}
            label={label.charAt(0).toUpperCase() + label.slice(1)}
            value={formatted}
            colors={colors}
            last={i === entries.length - 1}
          />
        );
      })}
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const sharedStyles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 12,
  },
  infoLabel: {
    width: 130,
    fontSize: 13,
    flexShrink: 0,
    lineHeight: 18,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 0,
  },
  bulletList: {
    paddingVertical: 4,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  subSection: {
    marginTop: 12,
    gap: 6,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
});
