import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
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

type PassTarget = { id: string; mealType: string; mealName: string; office: string; checkedIn?: boolean };

export default function DashboardScreen() {
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

  const upcomingFiltered = data?.upcoming.filter(o => o.dateKey !== data.today.date).slice(0, 4) ?? [];

  return (
    <View style={[ds.root, { backgroundColor: T.bgApp }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[ds.scroll, { paddingTop: insets.top + 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={T.green}
            colors={[T.green]}
          />
        }
      >
        {/* Greeting header */}
        <View style={ds.headerRow}>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>{greeting}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <NotificationBell color={T.headerText} size={22} />
            <TouchableOpacity
              onPress={() => nav.navigate('Tabs', { screen: 'Profile' })}
              activeOpacity={0.7}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4" stroke={T.headerText} strokeWidth="1.8" />
                <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={T.headerText} strokeWidth="1.8" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={ds.loadingWrap}>
            <ActivityIndicator color={T.green} size="large" />
          </View>
        ) : (
          <>
            {/* Next Pickup Pass */}
            {data?.nextPickup && (
              <NextPickupCard
                pickup={data.nextPickup}
                onPress={() => openPass(data.nextPickup!)}
              />
            )}

            {/* Stats row */}
            <View style={ds.statsRow}>
              <StatTile
                label={t('dashboard.stats.thisMonth')}
                value={data?.stats.mealsThisMonth ?? 0}
                sub={t('dashboard.stats.mealsBooked')}
                color={T.green}
                icon={<FoodIcon color={T.green} size={16} />}
              />
              <StatTile
                label={t('dashboard.stats.thisWeek')}
                value={data?.stats.mealsThisWeek ?? 0}
                sub={t('dashboard.stats.spent', { amount: data?.stats.totalSpend ?? 0 })}
                color={T.accentAmber}
                icon={<OrdersIcon color={T.accentAmber} size={16} />}
              />
              <StatTile
                label={t('dashboard.stats.menuToday')}
                value={data?.stats.todayMenuItems ?? 0}
                sub={t('dashboard.stats.available')}
                color={T.accentBlue}
                icon={<FoodIcon color={T.accentBlue} size={16} />}
              />
            </View>

            {/* Today's orders */}
            <SectionCard
              title={t('dashboard.todayOrders')}
              actionLabel={`${t('common.viewAll')} →`}
              onAction={goToFood}
            >
              {!data?.today.booked.length ? (
                <View style={ds.emptyWrap}>
                  <AppText size={28}>🍽️</AppText>
                  <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>
                    {t('dashboard.noMealsToday')}
                  </AppText>
                  <TouchableOpacity
                    onPress={goToFood}
                    activeOpacity={0.85}
                    style={[ds.orderNowBtn, { backgroundColor: T.green }]}
                  >
                    <AppText weight="bold" size={FontSize.sm} color={T.bgApp}>{t('common.orderNow')}</AppText>
                  </TouchableOpacity>
                </View>
              ) : (
                data!.today.booked.map((item, i) => (
                  <TodayOrderRow
                    key={item.id}
                    item={item}
                    isFirst={i === 0}
                    onPress={() => openPass({
                      id: item.id, mealType: item.meal,
                      mealName: item.name, office: item.office, checkedIn: item.checkedIn,
                    })}
                  />
                ))
              )}
            </SectionCard>

            {/* Upcoming */}
            {upcomingFiltered.length > 0 && (
              <SectionCard title={t('dashboard.upcoming')}>
                {upcomingFiltered.map((item, i) => (
                  <View
                    key={item.id}
                    style={[ds.upcomingRow, { borderTopWidth: i === 0 ? 0 : 1, borderTopColor: T.borderDefault }]}
                  >
                    <AppText size={18}>{mealEmoji(item.mealType)}</AppText>
                    <View style={ds.upcomingInfo}>
                      <AppText weight="bold" size={FontSize.sm} color={T.headerText} numberOfLines={1}>
                        {item.mealName}
                      </AppText>
                      <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive}>
                        {item.mealType} · {item.dateKey} · {item.office}
                      </AppText>
                    </View>
                    <AppText weight="bold" size={FontSize.xs} color={T.green}>₹{item.price}</AppText>
                  </View>
                ))}
              </SectionCard>
            )}

            {/* Quick actions */}
            <View style={[ds.actionsCard, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
              <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={ds.actionsTitle}>
                {t('dashboard.quickActions')}
              </AppText>
              <View style={ds.actionsRow}>
                <QuickActionBtn
                  label={t('dashboard.orderFood')}
                  icon={<FoodIcon color={T.green} size={22} />}
                  color={T.green}
                  onPress={goToFood}
                />
                <QuickActionBtn
                  label={t('dashboard.myOrders')}
                  icon={<OrdersIcon color={T.accentAmber} size={22} />}
                  color={T.accentAmber}
                  onPress={goToFood}
                />
                <QuickActionBtn
                  label={t('dashboard.qrPass')}
                  icon={<QRIcon color={T.accentBlue} size={22} />}
                  color={T.accentBlue}
                  onPress={() => data?.nextPickup ? openPass(data.nextPickup) : goToFood()}
                />
              </View>
            </View>
          </>
        )}
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

const ds = StyleSheet.create({
  root:        { flex: 1 },
  scroll:      { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  statsRow:    { flexDirection: 'row', gap: 10 },
  emptyWrap:   { padding: 20, alignItems: 'center', gap: 10 },
  orderNowBtn: { borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9 },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11 },
  upcomingInfo:{ flex: 1, minWidth: 0 },
  actionsCard: { borderRadius: 18, borderWidth: 1, padding: 16, ...Shadow.sm },
  actionsTitle:{ marginBottom: 14 },
  actionsRow:  { flexDirection: 'row', gap: 8 },
});
