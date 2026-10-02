import React, { useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { FlashList, FlashListProps, ListRenderItem } from '@shopify/flash-list';
import { useTheme } from '@theme/index';
import { CustomText } from '@/components/common/CustomText';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppListProps<T>
  extends Omit<FlashListProps<T>, 'renderItem' | 'data'> {
  /** Array of items to render */
  data: T[];

  /** Render function for each item */
  renderItem: ListRenderItem<T>;

  /**
   * Stable unique key extractor.
   * Defaults to `item.id` when the item has an `id` field, otherwise falls back to index.
   */
  keyExtractor?: (item: T, index: number) => string;

  // ── Loading states ──────────────────────────────────────────────────────

  /** Show full-list skeleton loader instead of the list */
  loading?: boolean;

  /** Number of skeleton rows to show while loading */
  skeletonCount?: number;

  /** Show a spinner in the list footer — for pagination / next-page loading */
  loadingMore?: boolean;

  // ── Error state ─────────────────────────────────────────────────────────

  /** Pass an error message to show the error state */
  error?: string | null;

  /** Called when the user taps retry in the error state */
  onRetry?: () => void;

  // ── Empty state ─────────────────────────────────────────────────────────

  /** Custom empty state component — overrides default empty UI */
  EmptyComponent?: React.ReactElement;

  /** Title shown in the default empty state */
  emptyTitle?: string;

  /** Subtitle shown in the default empty state */
  emptySubtitle?: string;

  // ── Pull-to-refresh ─────────────────────────────────────────────────────

  /** Whether the list is currently refreshing */
  refreshing?: boolean;

  /** Called when the user pulls to refresh */
  onRefresh?: () => void;

  // ── Infinite scroll ──────────────────────────────────────────────────────

  /** Called when the user scrolls near the end — use for pagination */
  onEndReached?: () => void;

  /** How far from the end (0–1) to trigger onEndReached. Default: 0.5 */
  onEndReachedThreshold?: number;

  // ── Separator ────────────────────────────────────────────────────────────

  /** Show a hairline divider between items */
  showSeparator?: boolean;

  /** Custom separator component — overrides showSeparator */
  SeparatorComponent?: React.ReactElement;

  // ── Style overrides ──────────────────────────────────────────────────────

  containerStyle?: ViewStyle;
  contentContainerStyle?: StyleProp<ViewStyle>;
  emptyContainerStyle?: ViewStyle;
  emptyTitleStyle?: TextStyle;
  emptySubtitleStyle?: TextStyle;
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = React.memo(() => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        skeletonStyles.row,
        {
          backgroundColor: theme.background.card,
          borderBottomColor: theme.border.secondary,
        },
      ]}
    >
      <View
        style={[
          skeletonStyles.avatar,
          { backgroundColor: theme.background.tertiary },
        ]}
      />
      <View style={skeletonStyles.lines}>
        <View
          style={[
            skeletonStyles.lineWide,
            { backgroundColor: theme.background.tertiary },
          ]}
        />
        <View
          style={[
            skeletonStyles.lineNarrow,
            { backgroundColor: theme.background.tertiary },
          ]}
        />
      </View>
    </View>
  );
});

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  lines: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  lineWide: {
    height: 14,
    borderRadius: 7,
    width: '65%',
  },
  lineNarrow: {
    height: 12,
    borderRadius: 6,
    width: '40%',
  },
});

// ─── Default empty state ──────────────────────────────────────────────────────

const DefaultEmpty = React.memo(
  ({
    title,
    subtitle,
    containerStyle,
    titleStyle,
    subtitleStyle,
  }: {
    title: string;
    subtitle: string;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
  }) => {
    const { theme } = useTheme();
    return (
      <View style={[emptyStyles.container, containerStyle]}>
        <CustomText
          variant="h3"
          style={{ color: theme.text.secondary, ...titleStyle }}
        >
          {title}
        </CustomText>
        <CustomText
          variant="bodyMedium"
          style={[
            emptyStyles.subtitle,
            { color: theme.text.tertiary },
            subtitleStyle,
          ]}
        >
          {subtitle}
        </CustomText>
      </View>
    );
  },
);

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
});

// ─── Error state ──────────────────────────────────────────────────────────────

const ErrorState = React.memo(
  ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
    const { theme } = useTheme();
    return (
      <View style={errorStyles.container}>
        <CustomText variant="h3" style={{ color: theme.text.error }}>
          Something went wrong
        </CustomText>
        <CustomText
          variant="bodyMedium"
          style={[errorStyles.message, { color: theme.text.secondary }]}
        >
          {message}
        </CustomText>
        {onRetry && (
          <CustomText
            variant="button"
            style={[errorStyles.retry, { color: theme.text.link }]}
            onPress={onRetry}
          >
            Tap to retry
          </CustomText>
        )}
      </View>
    );
  },
);

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
  },
});

// ─── Pagination footer ────────────────────────────────────────────────────────

const ListFooter = React.memo(({ loading }: { loading: boolean }) => {
  const { theme } = useTheme();
  if (!loading) return null;
  return (
    <View style={footerStyles.container}>
      <ActivityIndicator color={theme.button.primary.background} />
    </View>
  );
});

const footerStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

// ─── AppList ──────────────────────────────────────────────────────────────────

function AppList<T>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  skeletonCount = 6,
  loadingMore = false,
  error = null,
  onRetry,
  EmptyComponent,
  emptyTitle = 'No items found',
  emptySubtitle = 'There is nothing here yet.',
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  showSeparator = false,
  SeparatorComponent,
  containerStyle,
  contentContainerStyle,
  emptyContainerStyle,
  emptyTitleStyle,
  emptySubtitleStyle,
  ...rest
}: AppListProps<T>) {
  const { theme } = useTheme();

  // ── Key extractor — stable, ID-based ──────────────────────────────────────
  const resolvedKeyExtractor = useCallback(
    (item: T, index: number): string => {
      if (keyExtractor) return keyExtractor(item, index);
      if (item && typeof item === 'object' && 'id' in item) {
        return String((item as { id: unknown }).id);
      }
      return String(index);
    },
    [keyExtractor],
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={[
          { flex: 1, backgroundColor: theme.background.primary },
          containerStyle,
        ]}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // ── Separator ─────────────────────────────────────────────────────────────
  const resolvedSeparator = SeparatorComponent
    ? () => SeparatorComponent
    : showSeparator
    ? () => (
        <View
          style={[
            separatorStyles.line,
            { backgroundColor: theme.border.secondary },
          ]}
        />
      )
    : undefined;

  // ── Empty state ───────────────────────────────────────────────────────────
  const resolvedEmpty = EmptyComponent ?? (
    <DefaultEmpty
      title={emptyTitle}
      subtitle={emptySubtitle}
      containerStyle={emptyContainerStyle}
      titleStyle={emptyTitleStyle}
      subtitleStyle={emptySubtitleStyle}
    />
  );

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.background.primary },
        containerStyle,
      ]}
    >
      <FlashList<T>
        data={data}
        renderItem={renderItem}
        keyExtractor={resolvedKeyExtractor}
        ListEmptyComponent={resolvedEmpty}
        ListFooterComponent={<ListFooter loading={loadingMore} />}
        ItemSeparatorComponent={resolvedSeparator}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { backgroundColor: theme.background.primary },
          contentContainerStyle,
        ]}
        {...rest}
      />
    </View>
  );
}

const separatorStyles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});

export default AppList;
