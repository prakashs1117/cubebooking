/**
 * DashboardScreen — Tablet layout (768pt+)
 *
 * Two-column side-by-side layout. Uses the exact same hooks, state, and
 * DashboardComponents as the mobile screen — only the StyleSheet changes.
 *
 * Left column  (flex 1.1): NextPickupCard → Today's Orders → Quick Actions
 * Right column (flex 1):   Stats tiles   → Upcoming Orders
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '@hooks/useDashboard';
import { useMerckTokens } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import { Shadow } from '@theme/spacing';
import AppText from '@components/common/AppText';
import NotificationBell from '@components/notifications/NotificationBell';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  PickupPassModal,
  NextPickupCard,
  StatTile,
  TodayOrderRow,
  QuickActionBtn,
  SectionCard,
  QRIcon,
  FoodIcon,
  OrdersIcon,
  mealEmoji,
} from '@components/dashboard/DashboardComponents';
import type { DashboardOrderItem } from '@hooks/useDashboard';

type PassTarget = {
  id: string;
  mealType: string;
  mealName: string;
  office: string;
  checkedIn?: boolean;
};

export default function DashboardScreenTablet() {
  const T      = useMerckTokens();
  const insets = useSafeAreaInsets();
  const nav    = useNavigation<any>();
  const { t }  = useTranslation();
  const { data, isLoading, refetch, isFetching } = useDashboard();
  const [passTarget, setPassTarget] = useState<PassTarget | null>(null);

  const hour     = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.greeting.morning')
    : hour < 17
      ? t('dashboard.greeting.afternoon')
      : t('dashboard.greeting.evening');

  const goToFood = useCallback(() => nav.navigate('Tabs', { screen: 'Food' }), [nav]);

  const openPass = useCallback((item: DashboardOrderItem | PassTarget) => {
    setPassTarget({
      id:        (item as any).id ?? '',
      mealType:  item.mealType,
      mealName:  item.mealName,
      office:    item.office,
      checkedIn: item.checkedIn,
    });
  }, []);

  const closePass = useCallback(() => setPassTarget(null), []);

  const upcomingFiltered =
    data?.upcoming.filter(o => o.dateKey !== data.today.date).slice(0, 6) ?? [];

  return (
    <View style={[dt.root, { backgroundColor: T.bgApp }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[dt.scroll, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={T.green}
            colors={[T.green]}
          />
        }
      >
        {/* ── Max-width inner container — centers on very large iPads ── */}
        <View style={dt.inner}>

          {/* ── Greeting header (full width) ── */}
          <View style={dt.headerRow}>
            <AppText weight="semibold" size={FontSize.md} color={T.tabInactive}>{greeting}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <NotificationBell color={T.headerText} size={22} />
              <TouchableOpacity
                onPress={() => nav.navigate('Tabs', { screen: 'Profile' })}
                activeOpacity={0.7}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, alignItems: 'center', justifyContent: 'center' }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="8" r="4" stroke={T.headerText} strokeWidth="1.8" />
                  <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={T.headerText} strokeWidth="1.8" strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View style={dt.loadingWrap}>
              <ActivityIndicator color={T.green} size="large" />
            </View>
          ) : (
            /* ── Two-column body ── */
            <View style={dt.body}>

              {/* ── LEFT COLUMN ── */}
              <View style={dt.leftCol}>

                {/* Next Pickup Pass */}
                {data?.nextPickup && (
                  <NextPickupCard
                    pickup={data.nextPickup}
                    onPress={() => openPass(data.nextPickup!)}
                  />
                )}

                {/* Today's orders */}
                <SectionCard
                  title={t('dashboard.todayOrders')}
                  actionLabel={`${t('common.viewAll')} →`}
                  onAction={goToFood}
                >
                  {!data?.today.booked.length ? (
                    <View style={dt.emptyWrap}>
                      <AppText size={32}>🍽️</AppText>
                      <AppText weight="semibold" size={FontSize.md} color={T.tabInactive}>
                        {t('dashboard.noMealsToday')}
                      </AppText>
                      <TouchableOpacity
                        onPress={goToFood}
                        activeOpacity={0.85}
                        style={[dt.orderNowBtn, { backgroundColor: T.green }]}
                      >
                        <AppText weight="bold" size={FontSize.md} color={T.bgApp}>
                          {t('common.orderNow')}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    data!.today.booked.map((item, i) => (
                      <TodayOrderRow
                        key={item.id}
                        item={item}
                        isFirst={i === 0}
                        onPress={() => openPass({
                          id: item.id,
                          mealType: item.meal,
                          mealName: item.name,
                          office:   item.office,
                          checkedIn: item.checkedIn,
                        })}
                      />
                    ))
                  )}
                </SectionCard>

                {/* Quick Actions */}
                <View style={[dt.actionsCard, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
                  <AppText weight="bold" size={FontSize.xl} color={T.headerText} style={dt.actionsTitle}>
                    {t('dashboard.quickActions')}
                  </AppText>
                  <View style={dt.actionsRow}>
                    <QuickActionBtn
                      label={t('dashboard.orderFood')}
                      icon={<FoodIcon color={T.green} size={24} />}
                      color={T.green}
                      onPress={goToFood}
                    />
                    <QuickActionBtn
                      label={t('dashboard.myOrders')}
                      icon={<OrdersIcon color={T.accentAmber} size={24} />}
                      color={T.accentAmber}
                      onPress={goToFood}
                    />
                    <QuickActionBtn
                      label={t('dashboard.qrPass')}
                      icon={<QRIcon color={T.accentBlue} size={24} />}
                      color={T.accentBlue}
                      onPress={() =>
                        data?.nextPickup ? openPass(data.nextPickup) : goToFood()
                      }
                    />
                  </View>
                </View>

              </View>{/* /leftCol */}

              {/* ── RIGHT COLUMN ── */}
              <View style={dt.rightCol}>

                {/* Stats — 3 tiles in a row */}
                <View style={dt.statsRow}>
                  <StatTile
                    label={t('dashboard.stats.thisMonth')}
                    value={data?.stats.mealsThisMonth ?? 0}
                    sub={t('dashboard.stats.mealsBooked')}
                    color={T.green}
                    icon={<FoodIcon color={T.green} size={18} />}
                  />
                  <StatTile
                    label={t('dashboard.stats.thisWeek')}
                    value={data?.stats.mealsThisWeek ?? 0}
                    sub={t('dashboard.stats.spent', { amount: data?.stats.totalSpend ?? 0 })}
                    color={T.accentAmber}
                    icon={<OrdersIcon color={T.accentAmber} size={18} />}
                  />
                  <StatTile
                    label={t('dashboard.stats.menuToday')}
                    value={data?.stats.todayMenuItems ?? 0}
                    sub={t('dashboard.stats.available')}
                    color={T.accentBlue}
                    icon={<FoodIcon color={T.accentBlue} size={18} />}
                  />
                </View>

                {/* Upcoming orders — shows up to 6 on tablet */}
                {upcomingFiltered.length > 0 && (
                  <SectionCard title={t('dashboard.upcoming')}>
                    {upcomingFiltered.map((item, i) => (
                      <View
                        key={item.id}
                        style={[
                          dt.upcomingRow,
                          {
                            borderTopWidth:  i === 0 ? 0 : 1,
                            borderTopColor:  T.borderDefault,
                          },
                        ]}
                      >
                        <AppText size={20}>{mealEmoji(item.mealType)}</AppText>
                        <View style={dt.upcomingInfo}>
                          <AppText
                            weight="bold"
                            size={FontSize.md}
                            color={T.headerText}
                            numberOfLines={1}
                          >
                            {item.mealName}
                          </AppText>
                          <AppText
                            weight="semibold"
                            size={FontSize.xs}
                            color={T.tabInactive}
                          >
                            {item.mealType} · {item.dateKey} · {item.office}
                          </AppText>
                        </View>
                        <AppText weight="bold" size={FontSize.sm} color={T.green}>
                          ₹{item.price}
                        </AppText>
                      </View>
                    ))}
                  </SectionCard>
                )}

              </View>{/* /rightCol */}

            </View>
          )}
        </View>{/* /inner */}
      </ScrollView>

      {passTarget && (
        <PickupPassModal
          orderId={passTarget.id}
          mealType={passTarget.mealType}
          mealName={passTarget.mealName}
          office={passTarget.office}
          checkedIn={passTarget.checkedIn}
          visible
          onClose={closePass}
        />
      )}
    </View>
  );
}

const dt = StyleSheet.create({
  root:        { flex: 1 },
  scroll:      { paddingHorizontal: 24, paddingBottom: 48 },

  // Centers content on very wide iPads (12.9" landscape)
  inner:       { maxWidth: 1024, alignSelf: 'center', width: '100%', gap: 20 },

  // Greeting
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  loadingWrap: { paddingVertical: 80, alignItems: 'center' },

  // Two-column layout
  body:        { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  leftCol:     { flex: 1.1, gap: 16 },
  rightCol:    { flex: 1, gap: 16 },

  // Stats row (inside right column)
  statsRow:    { flexDirection: 'row', gap: 12 },

  // Today's orders empty state
  emptyWrap:   { padding: 24, alignItems: 'center', gap: 12 },
  orderNowBtn: { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 },

  // Upcoming rows (inside right column SectionCard)
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13 },
  upcomingInfo:{ flex: 1, minWidth: 0 },

  // Quick actions (inside left column)
  actionsCard: { borderRadius: 20, borderWidth: 1, padding: 20, ...Shadow.sm },
  actionsTitle:{ marginBottom: 16 },
  actionsRow:  { flexDirection: 'row', gap: 16 },
});
