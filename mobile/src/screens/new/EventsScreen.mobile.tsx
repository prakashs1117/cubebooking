import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import MerckHeader from '@components/headers/MerckHeader';
import MerckButton from '@components/common/MerckButton';
import { MERCK_TOKENS, getCapacityColors, useMerckTokens } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing, Radius, Shadow } from '@theme/spacing';
import { MOCK_EVENTS, MCEvent } from '@data/mockEvents';

type FilterType = 'All' | 'Virtual' | 'In-Person' | 'Hybrid';
const FILTERS: FilterType[] = ['All', 'Virtual', 'In-Person', 'Hybrid'];

const CATEGORY_COLORS: Record<string, string> = {
  Townhall: MERCK_TOKENS.accentBlue,
  Wellness: MERCK_TOKENS.green,
  Technology: MERCK_TOKENS.accentPink,
  Networking: MERCK_TOKENS.accentAmber,
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function LocationIcon({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ active, onSelect }: { active: FilterType; onSelect: (f: FilterType) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {FILTERS.map((f, i) => (
        <TouchableOpacity
          key={f}
          onPress={() => onSelect(f)}
          activeOpacity={0.7}
          style={[
            styles.filterPill,
            active === f ? styles.filterActive : styles.filterInactive,
            i < FILTERS.length - 1 && { marginRight: Spacing.sm },
          ]}
        >
          <Text style={[
            styles.filterLabel,
            active === f ? styles.filterLabelActive : styles.filterLabelInactive,
          ]}>
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onPress }: { event: MCEvent; onPress: () => void }) {
  const [registered, setRegistered] = useState(event.isRegistered ?? false);
  const capColors = getCapacityColors(event.registered, event.capacity);
  const catColor = CATEGORY_COLORS[event.category] ?? MERCK_TOKENS.green;
  const ratio = Math.min(event.registered / event.capacity, 1);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.eventCard}>
      {/* Gradient header */}
      <LinearGradient
        colors={event.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.eventStrip}
      >
        {/* Date badge */}
        <View style={styles.eventStripDate}>
          <Text style={styles.stripMonth}>{event.month}</Text>
          <Text style={styles.stripDay}>{event.day}</Text>
        </View>

        {/* Info */}
        <View style={styles.eventStripInfo}>
          {/* Category + type row */}
          <View style={styles.catRow}>
            <View style={[styles.tagPill, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
              <Text style={styles.tagText}>{event.category}</Text>
            </View>
            <View style={[styles.tagPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.tagText}>{event.type}</Text>
            </View>
          </View>
          <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        </View>
      </LinearGradient>

      {/* Card body */}
      <View style={styles.eventBody}>
        <View style={styles.eventDetailRow}>
          <ClockIcon color={MERCK_TOKENS.tabInactive} />
          <Text style={styles.eventDetailText}>{event.time}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <LocationIcon color={MERCK_TOKENS.tabInactive} />
          <Text style={styles.eventDetailText} numberOfLines={1}>{event.location}</Text>
        </View>

        {/* Capacity */}
        <View style={styles.capacityRow}>
          <Text style={styles.capacityLabel}>
            {event.registered} / {event.capacity} registered
          </Text>
          <View style={[styles.capacityTrack, { backgroundColor: MERCK_TOKENS.bgSurface }]}>
            <View
              style={[
                styles.capacityFill,
                { width: `${ratio * 100}%` as any, backgroundColor: capColors.fill },
              ]}
            />
          </View>
        </View>

        {/* CTA */}
        {registered ? (
          <View style={styles.registeredRow}>
            <CheckIcon color={MERCK_TOKENS.green} />
            <Text style={styles.registeredText}>Registered — view ticket</Text>
          </View>
        ) : (
          <MerckButton
            label="Register now"
            onPress={() => setRegistered(true)}
            compact
            style={styles.registerBtn}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const EventsScreenMobile: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('All');
  const T = useMerckTokens();

  const filteredEvents = filter === 'All'
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter((e) => e.type === filter);

  return (
    <View style={[styles.root, { backgroundColor: T.bgApp }]}>
      <MerckHeader title="Events" />
      <FilterBar active={filter} onSelect={setFilter} />
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <EventCard event={item} onPress={() => {}} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default EventsScreenMobile;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MERCK_TOKENS.bgApp,
  },

  // Filter bar — use marginRight instead of gap to avoid ScrollView issues
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterActive: {
    backgroundColor: MERCK_TOKENS.green + '22',
    borderColor: MERCK_TOKENS.green,
  },
  filterInactive: {
    backgroundColor: 'transparent',
    borderColor: MERCK_TOKENS.borderDefault,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  filterLabelActive: { color: MERCK_TOKENS.green },
  filterLabelInactive: { color: MERCK_TOKENS.tabInactive },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.xs,
  },

  // Event card
  eventCard: {
    backgroundColor: MERCK_TOKENS.cardBackground,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  eventStrip: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    alignItems: 'flex-start',
    minHeight: 110,
  },
  eventStripDate: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 48,
  },
  stripMonth: {
    color: '#fff',
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  stripDay: {
    color: '#fff',
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    lineHeight: 36,
  },
  eventStripInfo: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  catRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: '#fff',
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.semibold,
  },
  eventTitle: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
  },

  eventBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.sm,
    flex: 1,
  },

  capacityRow: {
    gap: 5,
    marginTop: 2,
  },
  capacityLabel: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  capacityTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },

  registeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  registeredText: {
    color: MERCK_TOKENS.green,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  registerBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
