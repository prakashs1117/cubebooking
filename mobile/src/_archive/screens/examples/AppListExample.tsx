/**
 * AppList Usage Examples
 * Demonstrates all features of the reusable AppList component.
 */

import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AppList from '@/components/common/AppList';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import {
  Heading3,
  BodyText,
  CaptionText,
  CustomText,
} from '@components/common/CustomText';
import Icon from '@components/icons/Icon';

// ─── Mock data types ──────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  online: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

// ─── Mock data generators ─────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#007AFF',
  '#34C759',
  '#FF9500',
  '#FF3B30',
  '#5856D6',
  '#503291',
];
const ROLES = [
  'Engineer',
  'Designer',
  'Product Manager',
  'Analyst',
  'QA',
  'DevOps',
];
const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Tools',
  'Food',
  'Sports',
];

const generateUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    role: ROLES[i % ROLES.length],
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    online: i % 3 !== 0,
  }));

const generateProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1}`,
    category: CATEGORIES[i % CATEGORIES.length],
    price: parseFloat((Math.random() * 200 + 10).toFixed(2)),
    inStock: i % 4 !== 0,
  }));

const ALL_USERS = generateUsers(120);
const ALL_PRODUCTS = generateProducts(80);
const PAGE_SIZE = 20;

// ─── List item components ─────────────────────────────────────────────────────

const UserRow = React.memo(({ item }: { item: User }) => {
  const { theme } = useTheme();
  return (
    <View style={[itemStyles.row, { backgroundColor: theme.background.card }]}>
      <View style={[itemStyles.avatar, { backgroundColor: item.avatarColor }]}>
        <CustomText variant="button" style={{ color: '#fff' }}>
          {item.name.charAt(0)}
        </CustomText>
      </View>
      <View style={itemStyles.info}>
        <CustomText variant="bodyMedium" style={{ color: theme.text.primary }}>
          {item.name}
        </CustomText>
        <CaptionText style={{ color: theme.text.secondary }}>
          {item.role}
        </CaptionText>
      </View>
      <View
        style={[
          itemStyles.badge,
          {
            backgroundColor: item.online
              ? '#34C75922'
              : theme.background.tertiary,
          },
        ]}
      >
        <CaptionText
          style={{ color: item.online ? '#34C759' : theme.text.tertiary }}
        >
          {item.online ? 'Online' : 'Offline'}
        </CaptionText>
      </View>
    </View>
  );
});

const ProductRow = React.memo(({ item }: { item: Product }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        itemStyles.productRow,
        { backgroundColor: theme.background.card },
      ]}
    >
      <View style={itemStyles.productInfo}>
        <CustomText variant="bodyMedium" style={{ color: theme.text.primary }}>
          {item.name}
        </CustomText>
        <CaptionText style={{ color: theme.text.secondary }}>
          {item.category}
        </CaptionText>
      </View>
      <View style={itemStyles.productRight}>
        <CustomText variant="button" style={{ color: theme.text.primary }}>
          ${item.price}
        </CustomText>
        <CaptionText
          style={{
            color: item.inStock ? '#34C759' : theme.text.error,
            marginTop: 2,
          }}
        >
          {item.inStock ? 'In stock' : 'Out of stock'}
        </CaptionText>
      </View>
    </View>
  );
});

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  productInfo: {
    flex: 1,
    gap: 3,
  },
  productRight: {
    alignItems: 'flex-end',
  },
});

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const { theme } = useTheme();
  return (
    <View style={sectionStyles.container}>
      <Heading3 style={{ color: theme.text.primary }}>{title}</Heading3>
      <BodyText
        style={[sectionStyles.description, { color: theme.text.secondary }]}
      >
        {description}
      </BodyText>
    </View>
  );
};

const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  description: {
    marginTop: 4,
    lineHeight: 20,
  },
});

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type ExampleTab =
  | 'loading'
  | 'basic'
  | 'separator'
  | 'pagination'
  | 'error'
  | 'empty';

const TABS: { id: ExampleTab; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'loading', label: 'Loading' },
  { id: 'separator', label: 'Separator' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'error', label: 'Error' },
  { id: 'empty', label: 'Empty' },
];

// ─── Main screen ──────────────────────────────────────────────────────────────

const AppListExample: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ExampleTab>('basic');

  // Pagination state
  const [page, setPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<Product[]>(
    ALL_PRODUCTS.slice(0, PAGE_SIZE),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasMore = paginatedData.length < ALL_PRODUCTS.length;

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // Simulate network delay
    setTimeout(() => {
      const next = page + 1;
      setPaginatedData(ALL_PRODUCTS.slice(0, next * PAGE_SIZE));
      setPage(next);
      setLoadingMore(false);
    }, 800);
  }, [loadingMore, hasMore, page]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPage(1);
      setPaginatedData(ALL_PRODUCTS.slice(0, PAGE_SIZE));
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderUser = useCallback(
    ({ item }: { item: User }) => <UserRow item={item} />,
    [],
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => <ProductRow item={item} />,
    [],
  );

  const renderContent = () => {
    switch (activeTab) {
      // ── 1. Basic ──────────────────────────────────────────────────────────
      case 'basic':
        return (
          <>
            <SectionHeader
              title="1. Basic List"
              description="120 users — stable key extraction via item.id, no separator, no extra config."
            />
            <View style={{ flex: 1 }}>
              <AppList<User> data={ALL_USERS} renderItem={renderUser} />
            </View>
          </>
        );

      // ── 2. Loading skeleton ───────────────────────────────────────────────
      case 'loading':
        return (
          <>
            <SectionHeader
              title="2. Loading Skeleton"
              description="Pass loading={true} to show themed shimmer rows instead of the list."
            />
            <View style={{ flex: 1 }}>
              <AppList<User>
                data={[]}
                renderItem={renderUser}
                loading
                skeletonCount={8}
              />
            </View>
          </>
        );

      // ── 3. Separator ──────────────────────────────────────────────────────
      case 'separator':
        return (
          <>
            <SectionHeader
              title="3. Item Separator"
              description="showSeparator renders a hairline divider between items using the theme border color."
            />
            <View style={{ flex: 1 }}>
              <AppList<User>
                data={ALL_USERS.slice(0, 30)}
                renderItem={renderUser}
                showSeparator
              />
            </View>
          </>
        );

      // ── 4. Pagination + pull-to-refresh ───────────────────────────────────
      case 'pagination':
        return (
          <>
            <SectionHeader
              title="4. Pagination + Pull-to-Refresh"
              description={`Showing ${paginatedData.length} of ${ALL_PRODUCTS.length} products. Scroll to end to load more. Pull down to reset.`}
            />
            <View style={{ flex: 1 }}>
              <AppList<Product>
                data={paginatedData}
                renderItem={renderProduct}
                showSeparator
                loadingMore={loadingMore}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.4}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </View>
          </>
        );

      // ── 5. Error state ────────────────────────────────────────────────────
      case 'error':
        return (
          <>
            <SectionHeader
              title="5. Error State"
              description="Pass error with a message string to show the error UI with a retry tap target."
            />
            <View style={{ flex: 1 }}>
              <AppList<User>
                data={[]}
                renderItem={renderUser}
                error="Failed to load users. Please check your connection."
                onRetry={() => console.log('Retry tapped')}
              />
            </View>
          </>
        );

      // ── 6. Empty state ────────────────────────────────────────────────────
      case 'empty':
        return (
          <>
            <SectionHeader
              title="6. Empty State"
              description="When data is an empty array the default empty UI shows. Customise via emptyTitle / emptySubtitle or EmptyComponent."
            />
            <View style={{ flex: 1 }}>
              <AppList<User>
                data={[]}
                renderItem={renderUser}
                emptyTitle="No users found"
                emptySubtitle="Add team members to see them listed here."
              />
            </View>
          </>
        );
    }
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.background.primary }]}
    >
      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { borderBottomColor: theme.border.secondary }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                active && {
                  borderBottomColor: theme.button.primary.background,
                  borderBottomWidth: 2,
                },
              ]}
              activeOpacity={0.7}
            >
              <CaptionText
                style={[
                  styles.tabLabel,
                  {
                    color: active
                      ? theme.button.primary.background
                      : theme.text.secondary,
                    fontFamily: getFontStyle(active ? 'button' : 'caption')
                      .fontFamily,
                  },
                ]}
              >
                {tab.label}
              </CaptionText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Props reference footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background.secondary,
            borderTopColor: theme.border.secondary,
          },
        ]}
      >
        <View style={styles.footerRow}>
          <Icon name="document" size={14} color={theme.text.tertiary} />
          <CaptionText
            style={[styles.footerText, { color: theme.text.tertiary }]}
          >
            {'AppList<T>  ·  @/components/common/AppList'}
          </CaptionText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabBar: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBarContent: {
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
  },
});

export default AppListExample;
