import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MerckHeader from '@components/headers/MerckHeader';
import SectionHeader from '@components/common/SectionHeader';
import PostCard from '@components/feed/PostCard';
import CategoryTag from '@components/common/CategoryTag';
import EmptyState from '@components/common/EmptyState';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';
import { MOCK_FEED } from '@data/mockFeed';
import Svg, { Path } from 'react-native-svg';

type SavedTab = 'Posts' | 'Events';

function BookmarkEmptyIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke={MERCK_TOKENS.tabInactive}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<SavedTab>('Posts');
  const savedPosts = MOCK_FEED.slice(0, 2);

  return (
    <View style={styles.root}>
      <MerckHeader title="Saved" />

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        {(['Posts', 'Events'] as SavedTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'Posts' && (
          <>
            {savedPosts.length > 0 ? (
              <View style={styles.feedList}>
                {savedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No saved posts"
                subtitle="Posts you bookmark will appear here."
                icon={<BookmarkEmptyIcon />}
              />
            )}
          </>
        )}
        {activeTab === 'Events' && (
          <EmptyState
            title="No saved events"
            subtitle="Events you bookmark will appear here."
            icon={<BookmarkEmptyIcon />}
          />
        )}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MERCK_TOKENS.bgApp },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: MERCK_TOKENS.borderDefault,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: -1,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: MERCK_TOKENS.green,
  },
  tabText: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: {
    color: MERCK_TOKENS.green,
  },
  scroll: { flex: 1 },
  feedList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
});
