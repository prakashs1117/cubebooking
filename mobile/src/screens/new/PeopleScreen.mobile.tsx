import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import MerckHeader from '@components/headers/MerckHeader';
import SearchBar from '@components/common/SearchBar';
import GradientAvatar from '@components/common/GradientAvatar';
import Divider from '@components/common/Divider';
import { MERCK_TOKENS, useMerckTokens } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing, Radius, Shadow } from '@theme/spacing';
import { MOCK_PEOPLE, MCPerson } from '@data/mockPeople';

function LocationIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.8"
      />
      <Circle cx="12" cy="10" r="3" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.8" />
    </Svg>
  );
}

function PersonCard({ person }: { person: MCPerson }) {
  const initials = (person.firstName[0] + person.lastName[0]).toUpperCase();
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.card}>
      <GradientAvatar initials={initials} gradientIndex={person.gradientIndex} size={46} />
      <View style={styles.cardInfo}>
        <Text style={styles.personName}>{person.firstName} {person.lastName}</Text>
        <Text style={styles.personRole} numberOfLines={1}>{person.role}</Text>
        <View style={styles.locationRow}>
          <LocationIcon />
          <Text style={styles.locationText}>{person.location}</Text>
        </View>
      </View>
      <View style={[styles.connectBtn, { borderColor: MERCK_TOKENS.green }]}>
        <Text style={[styles.connectBtnText, { color: MERCK_TOKENS.green }]}>Connect</Text>
      </View>
    </TouchableOpacity>
  );
}

const PeopleScreenMobile: React.FC = () => {
  const [query, setQuery] = useState('');
  const T = useMerckTokens();

  const filtered = query.trim()
    ? MOCK_PEOPLE.filter((p) =>
        `${p.firstName} ${p.lastName} ${p.role} ${p.department}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : MOCK_PEOPLE;

  return (
    <View style={[styles.root, { backgroundColor: T.bgApp }]}>
      <MerckHeader title="People" />
      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, role, department…"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonCard person={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Divider indent={Spacing.lg + 46 + Spacing.md} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PeopleScreenMobile;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MERCK_TOKENS.bgApp,
  },
  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing['3xl'],
    backgroundColor: MERCK_TOKENS.cardBackground,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  personName: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  personRole: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.xs,
  },
  connectBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  connectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
