import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { MERCK_TOKENS, useMerckTokens } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import { Shadow } from '@theme/spacing';
import AppText from '@components/common/AppText';
import NotificationBell from '@components/notifications/NotificationBell';
import { useNavigation } from '@react-navigation/native';
import { useMyOrders, useRateOrder } from '@hooks/useFood';
import type { ApiFoodOrder } from '@services/api/food.service';
import { orderDateLabel } from '@data/mockFood';

// ── Icons ─────────────────────────────────────────────────────────────────────

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StarIcon = ({ filled, size = 18 }: { filled: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
      fill={filled ? MERCK_TOKENS.accentAmber : 'none'}
      stroke={filled ? MERCK_TOKENS.accentAmber : MERCK_TOKENS.borderMuted}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </Svg>
);

const QRIcon = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3H3v4h4V3H5zM5 5v1H4V4h1v1zM19 3h-2v4h4V3h-2zM19 5v1h-1V4h1v1zM5 17H3v4h4v-4H5zM5 19v1H4v-1h1v1z" stroke={color} strokeWidth="1.5" />
    <Path d="M14 14h3v3M21 14v7h-7v-3M17 21h1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const EmptyIcon = ({ color }: { color: string }) => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ── Types & helpers ───────────────────────────────────────────────────────────

type FilterTab = 'all' | 'upcoming' | 'past' | 'cancelled';

function getLocalStatus(o: ApiFoodOrder): 'upcoming' | 'today' | 'past' | 'cancelled' {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const orderDate = new Date(o.dateKey);
  const todayDate = new Date(todayKey);
  const diffMs = orderDate.getTime() - todayDate.getTime();
  const dayOffset = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (o.status === 'cancelled') return 'cancelled';
  if (dayOffset === 0) return 'today';
  if (dayOffset < 0) return 'past';
  return 'upcoming';
}

function getDayOffset(o: ApiFoodOrder): number {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const orderDate = new Date(o.dateKey);
  const todayDate = new Date(todayKey);
  const diffMs = orderDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// ── Order Row ─────────────────────────────────────────────────────────────────

function OrderRow({
  order,
  onRate,
  T,
}: {
  order: ApiFoodOrder;
  onRate?: (stars: number) => void;
  T: ReturnType<typeof useMerckTokens>;
}) {
  const localStatus = getLocalStatus(order);
  const dayOffset = getDayOffset(order);

  const sBg =
    localStatus === 'today' ? T.green + '22'
    : localStatus === 'upcoming' ? T.accentAmber + '22'
    : localStatus === 'past' ? T.bgSurface
    : T.error + '22';

  const sColor =
    localStatus === 'today' ? T.green
    : localStatus === 'upcoming' ? T.accentAmber
    : localStatus === 'past' ? T.tabInactive
    : T.error;

  const sLabel =
    localStatus === 'today' ? 'Today'
    : localStatus === 'upcoming' ? 'Upcoming'
    : localStatus === 'past' ? 'Past'
    : 'Cancelled';

  return (
    <View style={{ backgroundColor: T.bgCard, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 18, padding: 14, ...Shadow.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Meal emoji block */}
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: sColor + '18', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AppText size={11} weight="bold" color={sColor} style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {order.mealType.slice(0, 3)}
          </AppText>
          <AppText size={FontSize.md} weight="bold" color={sColor}>₹{order.price}</AppText>
        </View>

        {/* Details */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <AppText weight="bold" size={FontSize.md} color={T.headerText} style={{ flex: 1 }} numberOfLines={1}>{order.mealName}</AppText>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9, backgroundColor: sBg, flexShrink: 0 }}>
              <AppText weight="bold" size={FontSize['2xs']} color={sColor}>{sLabel}</AppText>
            </View>
          </View>
          <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>{order.mealType}</AppText>
          <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 1 }}>
            {orderDateLabel(dayOffset)} · {order.office}
          </AppText>
        </View>

        {/* QR for active orders */}
        {(localStatus === 'today' || localStatus === 'upcoming') && (
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: T.headerText, alignItems: 'center', justifyContent: 'center' }}>
            <QRIcon color={T.bgApp} />
          </View>
        )}
      </View>

      {/* Rating row for past */}
      {localStatus === 'past' && onRate && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: T.borderDefault }}>
          <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginRight: 2 }}>Rate:</AppText>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => onRate(n)}
              style={{ width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: T.borderDefault, backgroundColor: T.bgSurface, alignItems: 'center', justifyContent: 'center' }}
            >
              <StarIcon filled={(order.rating ?? 0) >= n} size={16} />
            </TouchableOpacity>
          ))}
          {order.rating !== undefined && (
            <View style={{ backgroundColor: T.green + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginLeft: 4 }}>
              <AppText weight="bold" size={FontSize.xs} color={T.green}>Rated ★{order.rating}</AppText>
            </View>
          )}
        </View>
      )}

      {/* Refunded badge for cancelled */}
      {localStatus === 'cancelled' && (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.borderDefault, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ backgroundColor: T.green + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9 }}>
            <AppText weight="bold" size={FontSize.xs} color={T.green}>Refunded</AppText>
          </View>
          <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>Order was cancelled</AppText>
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AllOrdersScreen() {
  const T = useMerckTokens();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data: apiOrders = [], isLoading, isRefetching, refetch } = useMyOrders();
  const rateMutation = useRateOrder();

  const filtered = useMemo(() => {
    if (filter === 'all') return apiOrders;
    return apiOrders.filter(o => {
      const status = getLocalStatus(o);
      if (filter === 'upcoming') return status === 'upcoming' || status === 'today';
      if (filter === 'past') return status === 'past';
      if (filter === 'cancelled') return status === 'cancelled';
      return true;
    });
  }, [apiOrders, filter]);

  const handleRate = useCallback((orderId: string, stars: number) => {
    rateMutation.mutate({ orderId, rating: stars });
  }, [rateMutation]);

  const counts = useMemo(() => ({
    all: apiOrders.length,
    upcoming: apiOrders.filter(o => { const s = getLocalStatus(o); return s === 'upcoming' || s === 'today'; }).length,
    past: apiOrders.filter(o => getLocalStatus(o) === 'past').length,
    cancelled: apiOrders.filter(o => getLocalStatus(o) === 'cancelled').length,
  }), [apiOrders]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgApp }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.bgApp, borderBottomColor: T.borderDefault }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={T.headerText} />
        </TouchableOpacity>
        <AppText weight="bold" size={FontSize.xl} color={T.headerText}>All Orders</AppText>
        <NotificationBell color={T.headerText} size={22} />
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={[styles.filterBar, { borderBottomColor: T.borderDefault }]}
      >
        {FILTER_TABS.map(tab => {
          const active = filter === tab.key;
          const count = counts[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              activeOpacity={0.8}
              style={[
                styles.filterTab,
                {
                  backgroundColor: active ? T.green : T.bgSurface,
                  borderColor: active ? T.green : T.borderDefault,
                },
              ]}
            >
              <AppText weight="bold" size={FontSize.sm} color={active ? T.bgApp : T.tabInactive}>
                {tab.label}
              </AppText>
              {count > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : T.borderDefault }]}>
                  <AppText weight="bold" size={10} color={active ? T.bgApp : T.tabInactive}>{count}</AppText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={MERCK_TOKENS.green} />
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ marginTop: 8 }}>Loading orders…</AppText>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={MERCK_TOKENS.green} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <EmptyIcon color={T.tabInactive} />
              <AppText weight="bold" size={FontSize.xl} color={T.headerText} style={{ marginTop: 12 }}>No orders yet</AppText>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ marginTop: 6, lineHeight: 20 }}>
                {filter === 'all'
                  ? 'Start ordering meals from the Food tab'
                  : `No ${filter} orders to show`}
              </AppText>
            </View>
          ) : (
            <View style={styles.orderList}>
              {filtered.map(o => (
                <OrderRow
                  key={o._id}
                  order={o}
                  onRate={getLocalStatus(o) === 'past' ? (stars) => handleRate(o._id, stars) : undefined}
                  T={T}
                />
              ))}
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    borderBottomWidth: 1,
    maxHeight: 56,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  orderList: { gap: 10 },
  emptyState: { paddingTop: 80, alignItems: 'center', paddingHorizontal: 32 },
});
