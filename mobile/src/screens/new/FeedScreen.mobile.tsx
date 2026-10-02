import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme';
import CustomText from '@components/common/CustomText';
import { useInfinitePosts, useLikePost, useSharePost } from '@hooks/usePosts';
import type { Post } from '@services/api/posts.service';
import type { FeedStackParamList } from '@navigation/types';
import CreatePostSheet from '@components/feed/CreatePostSheet';
import CustomHeader from '@components/navigation/CustomHeader';
import { useDrawerNavigation } from '@hooks/useDrawerNavigation';
import { useHideTabBarOnScroll } from '@context/TabBarVisibilityContext';

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'FeedList'>;

const TABS = [
  { label: 'For You', type: undefined },
  { label: 'News', type: 'news' },
  { label: 'Kudos', type: 'kudos' },
  { label: 'Blog', type: 'blog' },
] as const;

const TYPE_BADGE: Record<string, { emoji: string; color: string; bg: string }> = {
  announcement: { emoji: '📢', color: '#60a5fa', bg: 'rgba(0,120,255,0.1)' },
  kudos:        { emoji: '🏆', color: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
  blog:         { emoji: '📝', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  news:         { emoji: '📰', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
};

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface PostRowProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onShare: () => void;
  onComment: () => void;
}

function PostRow({ post, onPress, onLike, onShare, onComment }: PostRowProps) {
  const { theme } = useTheme();
  const badge = TYPE_BADGE[post.type] ?? TYPE_BADGE.blog;

  return (
    <TouchableOpacity
      style={[styles.postRow, { borderBottomColor: theme.border.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: post.authorGradient?.[0] ?? '#0078FF' },
        ]}
      >
        <CustomText variant="caption" style={styles.avatarText}>
          {post.authorInitials}
        </CustomText>
      </View>

      <View style={styles.postContent}>
        <View style={styles.metaRow}>
          <CustomText variant="bodySmall" style={[styles.authorName, { color: theme.text.primary }]}>
            {post.authorName}
          </CustomText>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <CustomText variant="caption" style={[styles.badgeText, { color: badge.color }]}>
              {badge.emoji} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </CustomText>
          </View>
          <CustomText variant="caption" style={[styles.timeText, { color: theme.text.tertiary }]}>
            {timeAgo(post.createdAt)}
          </CustomText>
        </View>
        <CustomText variant="caption" style={[styles.roleText, { color: theme.text.tertiary }]}>
          {post.authorRole}
        </CustomText>

        <CustomText
          variant="body"
          numberOfLines={3}
          style={[styles.postText, { color: theme.text.secondary }]}
        >
          {post.content}
        </CustomText>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
            <CustomText variant="caption" style={[styles.actionText, post.liked && styles.likedText]}>
              ♥ {post.likeCount}
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onComment}>
            <CustomText variant="caption" style={[styles.actionText, { color: theme.text.tertiary }]}>
              💬 {post.commentCount}
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
            <CustomText variant="caption" style={[styles.actionText, { color: theme.text.tertiary }]}>
              ↗ {post.shareCount}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreenMobile() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const drawerNav = useDrawerNavigation();
  const [activeTab, setActiveTab] = useState(0);
  const sheetRef = useRef<BottomSheetModal>(null);
  const onScrollHandler = useHideTabBarOnScroll();

  const activeType = TABS[activeTab].type as string | undefined;
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useInfinitePosts(activeType);

  const { mutate: likePost } = useLikePost();
  const { mutate: sharePost } = useSharePost();

  const posts = data?.pages.flatMap(p => p.data) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostRow
        post={item}
        onPress={() => navigation.push('PostDetail', { postId: item.id })}
        onLike={() => likePost(item.id)}
        onShare={() => sharePost(item.id)}
        onComment={() => navigation.push('PostDetail', { postId: item.id })}
      />
    ),
    [navigation, likePost, sharePost],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListFooter = isFetchingNextPage ? (
    <ActivityIndicator style={{ padding: 16 }} color={theme.text.secondary} />
  ) : null;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomHeader
        variant="merck"
        showHamburger={true}
        onHamburgerPress={() => drawerNav.openDrawer()}
      />

      <View style={[styles.tabRow, { borderBottomColor: theme.border.primary }]}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.tab}
            onPress={() => setActiveTab(i)}
          >
            <CustomText
              variant="caption"
              style={[
                styles.tabLabel,
                { color: activeTab === i ? theme.text.primary : theme.text.tertiary },
              ]}
            >
              {tab.label}
            </CustomText>
            {activeTab === i && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={theme.text.secondary} />
      ) : (
        <FlashList
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={100}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={ListFooter}
          onScroll={onScrollHandler as any}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => sheetRef.current?.present()}
      >
        <CustomText variant="h2" style={styles.fabText}>+</CustomText>
      </TouchableOpacity>

      <CreatePostSheet ref={sheetRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabLabel: { fontSize: 12, fontWeight: '600' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#0078FF',
    borderRadius: 2,
  },
  postRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  postContent: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  authorName: { fontWeight: '700', fontSize: 12 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  timeText: { fontSize: 11 },
  roleText: { fontSize: 11, marginTop: 1, marginBottom: 4 },
  postText: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  actionsRow: { flexDirection: 'row', gap: 18 },
  actionBtn: {},
  actionText: { fontSize: 12, color: '#666' },
  likedText: { color: '#ef4444' },
  fab: {
    position: 'absolute',
    bottom: 70,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0078FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0078FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 26, lineHeight: 30 },
});
