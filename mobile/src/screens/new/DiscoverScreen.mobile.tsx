import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import MerckHeader from '@components/headers/MerckHeader';
import SearchBar from '@components/common/SearchBar';
import SectionHeader from '@components/common/SectionHeader';
import PostCard from '@components/feed/PostCard';
import { MERCK_TOKENS, useMerckTokens } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing, Radius } from '@theme/spacing';
import { Gradients } from '@theme/colors';
import { MOCK_FEED } from '@data/mockFeed';

const { width: W } = Dimensions.get('window');

const CATEGORIES = [
  { label: 'Healthcare', gradient: Gradients.tealCyan },
  { label: 'Technology', gradient: Gradients.cyanIndigo },
  { label: 'Culture', gradient: Gradients.purplePink },
  { label: 'Learning', gradient: Gradients.orangePink },
  { label: 'Wellness', gradient: Gradients.green },
  { label: 'Innovation', gradient: Gradients.coral },
];

function CategoryCard({ label, gradient }: { label: string; gradient: [string, string] }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.catCard}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.catGradient}
      >
        <Text style={styles.catLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const DiscoverScreenMobile: React.FC = () => {
  const [query, setQuery] = useState('');
  const T = useMerckTokens();

  return (
    <View style={[styles.root, { backgroundColor: T.bgApp }]}>
      <MerckHeader title="Discover" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search topics, people, events…" />
        </View>

        <SectionHeader title="Browse Categories" style={styles.sectionHeader} />
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.label} label={cat.label} gradient={cat.gradient} />
          ))}
        </View>

        <SectionHeader title="Trending Posts" style={styles.sectionHeader} />
        <View style={styles.feedList}>
          {MOCK_FEED.slice(0, 4).map((post) => (
            <PostCard key={post.id} post={post} compact />
          ))}
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
};

export default DiscoverScreenMobile;

const CARD_W = (W - Spacing.lg * 2 - Spacing.md) / 2;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MERCK_TOKENS.bgApp },
  scroll: { flex: 1 },
  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionHeader: { marginTop: Spacing.sm },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  catCard: {
    width: CARD_W,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  catGradient: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  feedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
});
