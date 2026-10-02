import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Switch,
} from 'react-native';
import * as Animicons from '@animicons/react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

const { width } = Dimensions.get('window');
const ICON_SIZE = 48;
const COLUMNS = 3;
const PADDING = 16;
const ITEM_MARGIN = 6;
const AVAILABLE_WIDTH = width - PADDING * 2;
const ITEM_WIDTH = (AVAILABLE_WIDTH - ITEM_MARGIN * 2 * COLUMNS) / COLUMNS;

type SpeedOption = 'slow' | 'normal' | 'fast';

const ICON_NAMES = [
  'Pulse', 'Check', 'Loader', 'Upload', 'Wifi', 'Bell', 'Star', 'Heart',
  'ECG', 'HeartRate', 'Lungs', 'Pill', 'Thermometer', 'DNA', 'Syringe',
  'Brain', 'BloodDrop', 'Steps', 'Sleep', 'Oxygen', 'Medkit',
] as const;

type IconName = typeof ICON_NAMES[number];

const IconGalleryScreen: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState<SpeedOption>('normal');

  const filtered = ICON_NAMES.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const s = styles(theme);

  return (
    <View style={[s.container, { backgroundColor: theme.background.primary }]}>
      {/* Search + Controls */}
      <View style={[s.header, { backgroundColor: theme.background.card }]}>
        <TextInput
          style={[s.searchInput, { backgroundColor: theme.background.primary, color: theme.text.primary, borderColor: theme.border.primary }]}
          placeholder={`Search ${filtered.length} icons…`}
          placeholderTextColor={theme.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={s.controls}>
          <View style={s.toggle}>
            <Text style={[s.toggleLabel, { color: theme.text.secondary }]}>AutoPlay</Text>
            <Switch value={autoPlay} onValueChange={setAutoPlay} trackColor={{ true: theme.button?.primary?.background }} />
          </View>
          <View style={s.toggle}>
            <Text style={[s.toggleLabel, { color: theme.text.secondary }]}>Loop</Text>
            <Switch value={loop} onValueChange={setLoop} trackColor={{ true: theme.button?.primary?.background }} />
          </View>
          <View style={s.speedRow}>
            {(['slow', 'normal', 'fast'] as SpeedOption[]).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[s.speedChip, speed === opt && { backgroundColor: theme.button?.primary?.background }]}
                onPress={() => setSpeed(opt)}
              >
                <Text style={[s.speedChipText, { color: speed === opt ? '#fff' : theme.text.secondary }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Grid */}
      <ScrollView contentContainerStyle={s.grid}>
        {filtered.map(name => {
          const IconComponent = (Animicons as any)[name] as React.FC<any>;
          if (!IconComponent) return null;
          const isSelected = selectedIcon === name;

          return (
            <TouchableOpacity
              key={name}
              style={[
                s.iconCell,
                {
                  backgroundColor: isSelected ? theme.button?.primary?.background + '18' : theme.background.card,
                  borderColor: isSelected ? theme.button?.primary?.background : theme.border.primary,
                },
              ]}
              onPress={() => setSelectedIcon(isSelected ? null : name)}
            >
              <IconComponent
                size={ICON_SIZE}
                autoPlay={autoPlay}
                loop={loop}
                speed={speed}
              />
              <Text
                style={[s.iconLabel, { color: isSelected ? theme.button?.primary?.background : theme.text.secondary }]}
                numberOfLines={2}
              >
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail panel */}
      {selectedIcon && (() => {
        const IconComponent = (Animicons as any)[selectedIcon] as React.FC<any>;
        return (
          <View style={[s.panel, { backgroundColor: theme.background.card }]}>
            <Text style={[s.panelTitle, { color: theme.text.primary }]}>{selectedIcon}</Text>
            <View style={s.panelBody}>
              <IconComponent size={72} autoPlay={autoPlay} loop={loop} speed={speed} />
              <View style={[s.codeBox, { backgroundColor: theme.background.primary }]}>
                <Text style={[s.codeText, { color: theme.text.secondary }]}>
                  {`import { ${selectedIcon} } from '@animicons/react-native';\n\n<${selectedIcon} size={48} autoPlay loop speed="normal" />`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[s.closeBtn, { backgroundColor: theme.button?.primary?.background }]}
              onPress={() => setSelectedIcon(null)}
            >
              <Text style={s.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        );
      })()}
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      padding: 12,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    searchInput: {
      height: 42,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      fontFamily: getFontStyle('body').fontFamily,
    },
    controls: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    toggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    toggleLabel: { fontSize: 13, fontFamily: getFontStyle('caption').fontFamily },
    speedRow: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
    speedChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: theme.background.primary,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    speedChipText: { fontSize: 12, fontFamily: getFontStyle('caption').fontFamily },
    grid: {
      padding: PADDING,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    iconCell: {
      width: ITEM_WIDTH,
      margin: ITEM_MARGIN,
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      gap: 8,
    },
    iconLabel: {
      fontSize: 11,
      textAlign: 'center',
      fontFamily: getFontStyle('caption').fontFamily,
    },
    panel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    panelTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 12,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    panelBody: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    codeBox: { flex: 1, padding: 10, borderRadius: 8 },
    codeText: { fontFamily: 'monospace', fontSize: 11.5, lineHeight: 18 },
    closeBtn: { padding: 13, borderRadius: 8, alignItems: 'center' },
    closeBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
  });

export default IconGalleryScreen;
