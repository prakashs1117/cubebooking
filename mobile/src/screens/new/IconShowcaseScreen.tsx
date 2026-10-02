import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMerckTokens } from '@theme/merckTokens';
import Icon from '@components/icons/Icon';
import type { IconName } from '@components/icons/types';

// ── All icon names grouped by category ────────────────────────────────────────

const ICON_GROUPS: { label: string; icons: IconName[] }[] = [
  {
    label: 'Navigation',
    icons: ['home', 'home-outline', 'back', 'back-circle', 'hamburger', 'hamburger-outline'],
  },
  {
    label: 'Arrows & Chevrons',
    icons: [
      'arrow-left', 'arrow-right', 'arrow-left-small', 'arrow-right-small',
      'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
    ],
  },
  {
    label: 'User & Profile',
    icons: ['user', 'user-outline', 'profile', 'profile-outline', 'logout', 'delete-profile'],
  },
  {
    label: 'Actions',
    icons: [
      'search', 'search-outline', 'close', 'close-circle',
      'filter', 'sort-ascending', 'options', 'refresh', 'refresh-outline',
      'refresh-square', 'reset', 'trash', 'trash-outline',
      'save', 'share', 'download', 'image', 'image-outline',
    ],
  },
  {
    label: 'Notifications & Communication',
    icons: ['bell', 'bell-outline', 'mail', 'mail-outline', 'alarm', 'campaign'],
  },
  {
    label: 'Status & Alerts',
    icons: [
      'checkmark-circle', 'close-circle', 'alert-circle', 'info', 'info-circle',
      'warning', 'sparkle', 'star', 'star-circle',
    ],
  },
  {
    label: 'Form Controls',
    icons: [
      'checkbox-checked', 'checkbox-unchecked', 'checkbox-indeterminate',
      'radio-selected', 'radio-unselected',
      'check-square', 'square', 'toggle', 'toggle-on',
      'eye', 'eye-slash',
    ],
  },
  {
    label: 'Calendar & Time',
    icons: ['calendar', 'calendar-outline', 'calendar-tab', 'calendar-tab-active', 'clock', 'time'],
  },
  {
    label: 'Location & Maps',
    icons: ['location', 'location-outline', 'map', 'map-outline', 'compass', 'compass-outline'],
  },
  {
    label: 'Documents & Content',
    icons: ['document', 'book', 'file-text', 'shield-check', 'printer'],
  },
  {
    label: 'Tools & Utilities',
    icons: [
      'barcode', 'scanner', 'torch', 'light', 'sun', 'moon',
      'globe', 'globe-outline', 'language', 'vibrant', 'dashboard', 'website',
      'ruler', 'achievement',
    ],
  },
  {
    label: 'Medical & Health',
    icons: ['lab', 'syringe', 'virus'],
  },
  {
    label: 'People & Social',
    icons: [
      'users', 'users-outline', 'person_add', 'how_to_reg',
      'thumb_up', 'heart', 'heart-outline', 'waving_hand',
    ],
  },
  {
    label: 'Notification Types (API)',
    icons: [
      'add_circle', 'system_update', 'build', 'rate_review',
      'event', 'schedule_send', 'poll', 'confirmation_number',
    ],
  },
  {
    label: 'Brand',
    icons: ['merck', 'merck-logo', 'google', 'apple'],
  },
  {
    label: 'Misc',
    icons: ['faq', 'ellipsis', 'header-bell', 'header-search'],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function IconShowcaseScreen() {
  const t = useMerckTokens();
  const [query, setQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState(28);
  const [selectedColor, setSelectedColor] = useState<'white' | 'accent' | 'muted'>('white');

  const iconColor =
    selectedColor === 'accent' ? t.green :
    selectedColor === 'muted'  ? t.tabInactive :
    t.textPrimary;

  const allNames = ICON_GROUPS.flatMap(g => g.icons);
  const q = query.trim().toLowerCase();

  const filtered = q
    ? ICON_GROUPS
        .map(g => ({ ...g, icons: g.icons.filter(n => n.includes(q)) as IconName[] }))
        .filter(g => g.icons.length > 0)
    : ICON_GROUPS;

  const handleCopy = (name: IconName) => {
    Alert.alert('Icon name', `"${name}"`);
  };

  const s = styles(t);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Icon Showcase</Text>
        <Text style={s.subtitle}>{allNames.length} icons</Text>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search icons…"
          placeholderTextColor={t.tabInactive}
        />
        <View style={s.row}>
          {/* Size pills */}
          {[20, 28, 36].map(sz => (
            <TouchableOpacity
              key={sz}
              style={[s.pill, selectedSize === sz && s.pillActive]}
              onPress={() => setSelectedSize(sz)}
            >
              <Text style={[s.pillText, selectedSize === sz && s.pillTextActive]}>
                {sz}px
              </Text>
            </TouchableOpacity>
          ))}
          {/* Color pills */}
          {(['white', 'accent', 'muted'] as const).map(c => (
            <TouchableOpacity
              key={c}
              style={[s.pill, selectedColor === c && s.pillActive]}
              onPress={() => setSelectedColor(c)}
            >
              <View style={[s.colorDot, {
                backgroundColor:
                  c === 'accent' ? t.green :
                  c === 'muted'  ? t.tabInactive : t.textPrimary,
              }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map(group => (
          <View key={group.label} style={s.group}>
            <Text style={s.groupLabel}>{group.label}</Text>
            <View style={s.grid}>
              {group.icons.map(name => (
                <TouchableOpacity
                  key={name}
                  style={s.cell}
                  onPress={() => handleCopy(name)}
                  activeOpacity={0.6}
                >
                  <View style={s.iconBox}>
                    <Icon name={name} size={selectedSize} color={iconColor} />
                  </View>
                  <Text style={s.iconName} numberOfLines={2}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyText}>No icons match "{query}"</Text>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (t: ReturnType<typeof useMerckTokens>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bgApp },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 10,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: t.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      color: t.tabInactive,
    },
    controls: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 10,
    },
    search: {
      backgroundColor: t.bgCard,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: t.textPrimary,
      borderWidth: 1,
      borderColor: t.borderDefault,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.borderDefault,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: t.green,
      borderColor: t.green,
    },
    pillText: { fontSize: 12, color: t.tabInactive },
    pillTextActive: { color: '#0A1410', fontWeight: '600' },
    colorDot: { width: 12, height: 12, borderRadius: 6 },
    scroll: { flex: 1 },
    group: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    groupLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: t.tabInactive,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    cell: {
      width: 80,
      alignItems: 'center',
      gap: 6,
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.borderDefault,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconName: {
      fontSize: 10,
      color: t.tabInactive,
      textAlign: 'center',
      lineHeight: 13,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyText: {
      color: t.tabInactive,
      fontSize: 14,
    },
  });
