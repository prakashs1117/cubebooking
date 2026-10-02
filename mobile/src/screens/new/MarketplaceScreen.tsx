import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Polyline, Line, Polygon } from 'react-native-svg';
import { useTheme } from '@theme/index';
import { MERCK_TOKENS } from '@theme/merckTokens';
import CustomText from '@components/common/CustomText';
import CustomHeader from '@components/navigation/CustomHeader';
import { useDrawerNavigation } from '@hooks/useDrawerNavigation';
import { useHideTabBarOnScroll } from '@context/TabBarVisibilityContext';
import { useInfinitePlugins } from '@hooks/useMarketplace';
import type { Plugin, PluginType } from '@services/api/marketplace.service';
import type { MarketplaceStackParamList } from '@navigation/types';

type NavProp = NativeStackNavigationProp<MarketplaceStackParamList, 'MarketplaceList'>;

// ─── Icons ────────────────────────────────────────────────────────────────────

function PackageIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l9 4.5v9L12 20l-9-4.5v-9L12 2z" />
      <Path d="M12 2v18" />
      <Path d="M3 6.5l9 4.5 9-4.5" />
      <Path d="M7.5 4.25L16.5 8.75" />
    </Svg>
  );
}

function SparklesIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" fill={color} stroke="none" />
      <Path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75L5 3z" fill={color} stroke="none" opacity="0.7" />
      <Path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" fill={color} stroke="none" opacity="0.7" />
    </Svg>
  );
}

function BotIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="11" width="18" height="10" rx="2" />
      <Circle cx="12" cy="5" r="2" />
      <Path d="M12 7v4" />
      <Circle cx="9" cy="16" r="1" fill={color} />
      <Circle cx="15" cy="16" r="1" fill={color} />
    </Svg>
  );
}

function SearchIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

function PlusIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

function ChevronRight({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<PluginType, { label: string; accent: string; bg: string; IconComp: any }> = {
  plugin: { label: 'Plugin', accent: '#3B82F6', bg: 'rgba(59,130,246,0.12)', IconComp: PackageIcon },
  skill:  { label: 'Skill',  accent: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  IconComp: SparklesIcon },
  agent:  { label: 'Agent',  accent: '#10B981', bg: 'rgba(16,185,129,0.12)', IconComp: BotIcon },
};

const FILTER_TABS: Array<{ label: string; value: PluginType | '' }> = [
  { label: 'All',     value: '' },
  { label: 'Plugins', value: 'plugin' },
  { label: 'Skills',  value: 'skill' },
  { label: 'Agents',  value: 'agent' },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return 'Today';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

// ─── Plugin Card ──────────────────────────────────────────────────────────────

function PluginCard({ plugin, onPress }: { plugin: Plugin; onPress: () => void }) {
  const { theme } = useTheme();
  const cfg = TYPE_CONFIG[plugin.pluginType] ?? TYPE_CONFIG.plugin;
  const IconComp = cfg.IconComp;
  const techs = plugin.tags?.technologies?.slice(0, 3) ?? [];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.background.card ?? theme.background.secondary, borderColor: theme.border.primary }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: cfg.accent }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
            <IconComp color={cfg.accent} size={22} />
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.cardTitleRow}>
              <CustomText variant="bodyMedium" style={[styles.cardName, { color: theme.text.primary }]} numberOfLines={1}>
                {plugin.name}
              </CustomText>
              {plugin.version && (
                <View style={[styles.versionPill, { backgroundColor: theme.background.tertiary ?? theme.border.primary }]}>
                  <CustomText variant="caption" style={[styles.versionText, { color: theme.text.secondary }]}>
                    v{plugin.version}
                  </CustomText>
                </View>
              )}
            </View>
            <View style={styles.typeBadgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                <CustomText variant="caption" style={[styles.typeBadgeText, { color: cfg.accent }]}>
                  {cfg.label}
                </CustomText>
              </View>
              <CustomText variant="caption" style={[styles.timeText, { color: theme.text.tertiary ?? theme.text.secondary }]}>
                {timeAgo(plugin.createdAt)}
              </CustomText>
            </View>
          </View>
          <ChevronRight color={theme.text.tertiary ?? theme.text.secondary} size={16} />
        </View>

        {/* Description */}
        <CustomText variant="caption" numberOfLines={2} style={[styles.description, { color: theme.text.secondary }]}>
          {plugin.description}
        </CustomText>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.techRow}>
            {techs.map(t => (
              <View key={t} style={[styles.techPill, { backgroundColor: theme.background.tertiary ?? theme.border.primary }]}>
                <CustomText variant="caption" style={[styles.techText, { color: theme.text.secondary }]}>{t}</CustomText>
              </View>
            ))}
            {(plugin.tags?.technologies?.length ?? 0) > 3 && (
              <CustomText variant="caption" style={[styles.moreText, { color: theme.text.tertiary ?? theme.text.secondary }]}>
                +{plugin.tags.technologies.length - 3}
              </CustomText>
            )}
          </View>
          <CustomText variant="caption" style={[styles.authorText, { color: theme.text.tertiary ?? theme.text.secondary }]}>
            {plugin.authorName}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MarketplaceScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const drawerNav = useDrawerNavigation();
  const onScrollHandler = useHideTabBarOnScroll();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PluginType | ''>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = (text: string) => {
    setSearch(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 300);
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useInfinitePlugins({
      pluginType: typeFilter || undefined,
      search: debouncedSearch || undefined,
    });

  const plugins = data?.pages.flatMap(p => p.plugins) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Plugin }) => (
      <PluginCard
        plugin={item}
        onPress={() => navigation.push('MarketplaceDetail', { pluginId: item._id })}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Plugin) => item._id, []);

  const ListFooter = isFetchingNextPage
    ? <ActivityIndicator style={{ padding: 20 }} color={MERCK_TOKENS.green} />
    : null;

  const ListEmpty = !isLoading ? (
    <View style={styles.emptyState}>
      <PackageIcon color={theme.text.tertiary ?? theme.text.secondary} size={48} />
      <CustomText variant="bodyMedium" style={[styles.emptyTitle, { color: theme.text.primary }]}>
        No plugins found
      </CustomText>
      <CustomText variant="caption" style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
        {debouncedSearch ? 'Try a different search term' : 'Be the first to submit one!'}
      </CustomText>
    </View>
  ) : null;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomHeader
        variant="merck"
        showHamburger
        onHamburgerPress={() => drawerNav.openDrawer()}
      />

      {/* Header section */}
      <View style={[styles.headerSection, { borderBottomColor: theme.border.primary }]}>
        <View style={styles.titleRow}>
          <CustomText variant="h3" style={[styles.screenTitle, { color: theme.text.primary }]}>
            Marketplace
          </CustomText>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: MERCK_TOKENS.green }]}
            onPress={() => navigation.push('MarketplaceSubmit')}
            activeOpacity={0.85}
          >
            <PlusIcon color="#fff" size={16} />
            <CustomText variant="caption" style={styles.submitBtnText}>Submit</CustomText>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}>
          <SearchIcon color={theme.text.tertiary ?? theme.text.secondary} size={16} />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search plugins, skills, agents…"
            placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
            style={[styles.searchInput, { color: theme.text.primary }]}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map(f => {
            const active = typeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterTab,
                  active
                    ? { backgroundColor: MERCK_TOKENS.green }
                    : { backgroundColor: theme.background.secondary, borderColor: theme.border.primary, borderWidth: 1 },
                ]}
                onPress={() => setTypeFilter(f.value as PluginType | '')}
              >
                <CustomText
                  variant="caption"
                  style={[styles.filterTabText, { color: active ? '#fff' : theme.text.secondary }]}
                >
                  {f.label}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Stats bar */}
      {!isLoading && plugins.length > 0 && (
        <View style={[styles.statsBar, { borderBottomColor: theme.border.primary }]}>
          <CustomText variant="caption" style={[styles.statsText, { color: theme.text.secondary }]}>
            {data?.pages[0]?.pagination.total ?? 0} approved{typeFilter ? ` ${typeFilter}s` : ' packages'}
          </CustomText>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MERCK_TOKENS.green} />
          <CustomText variant="caption" style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading marketplace…
          </CustomText>
        </View>
      ) : (
        <FlashList
          data={plugins}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={130}
          contentContainerStyle={styles.listContent}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          onScroll={onScrollHandler as any}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={MERCK_TOKENS.green} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 22, fontWeight: '700' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterTabText: { fontSize: 12, fontWeight: '600' },

  statsBar: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  statsText: { fontSize: 12 },

  listContent: { padding: 14 },

  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  accentBar: { height: 3, width: '100%' },
  cardBody: { padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardMeta: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 15, fontWeight: '700', flex: 1 },
  versionPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  versionText: { fontSize: 10, fontWeight: '600' },
  typeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  timeText: { fontSize: 11 },

  description: { fontSize: 13, lineHeight: 19 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  techRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', flex: 1 },
  techPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  techText: { fontSize: 11, fontWeight: '500' },
  moreText: { fontSize: 11, alignSelf: 'center' },
  authorText: { fontSize: 11, flexShrink: 0, marginLeft: 8 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
