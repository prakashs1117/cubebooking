import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import MerckHeader from '@components/headers/MerckHeader';
import StatChip from '@components/common/StatChip';
import SectionHeader from '@components/common/SectionHeader';
import { MERCK_TOKENS, useMerckTokens } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import AppText from '@components/common/AppText';
import { Spacing, Radius, Shadow } from '@theme/spacing';
import { useNextMealPass, usePickupPass } from '@hooks/useFood';

// ─── Icons ────────────────────────────────────────────────────────────────────

function MealIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="1.8" />
      <Path d="M6 1v4M10 1v4M14 1v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function QRIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <Path d="M14 14h3v3M21 14v7h-7v-3M17 21h1" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ color = '#fff', size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color + '22'} stroke={color} strokeWidth="2" />
      <Path d="m8 12 3 3 5-5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Pickup Pass Sheet (shared with FoodScreen) ───────────────────────────────

function PassSheet({
  orderId,
  mealType,
  mealName,
  office,
  checkedIn: orderCheckedIn,
  visible,
  onClose,
}: {
  orderId: string;
  mealType: string;
  mealName: string;
  office: string;
  checkedIn?: boolean;
  visible: boolean;
  onClose: () => void;
}) {
  const T = useMerckTokens();
  const { width } = useWindowDimensions();
  const qrSize = width - 96;

  const { data: pass, isLoading } = usePickupPass(orderId, visible);

  const isCheckedIn = pass?.checkedIn ?? orderCheckedIn ?? false;
  const employeeName = pass?.employeeName ?? 'Employee';
  const initials = employeeName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const mealEmoji = mealType === 'Breakfast' ? '☀️' : mealType === 'Lunch' ? '🌤️' : '🌙';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {/* Close */}
        <TouchableOpacity
          onPress={onClose}
          style={{ position: 'absolute', top: 56, right: 24, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
        >
          <CloseIcon color="#fff" />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <AppText weight="bold" size={FontSize['2xl']} color="#fff">Pickup Pass</AppText>
          <AppText weight="semibold" size={FontSize.xs} color="rgba(255,255,255,0.6)" style={{ marginTop: 4 }}>
            Show this at the {office} cafeteria counter
          </AppText>
        </View>

        {/* QR Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 16, alignItems: 'center', width: width - 48, ...Shadow.sm }}>
          {/* Employee row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginBottom: 16 }}>
            <LinearGradient colors={['#008A63', '#0ea5e9']} style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <AppText weight="bold" size={FontSize.md} color="#fff">{initials}</AppText>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" size={FontSize.md} color="#0F1C17">{employeeName}</AppText>
              <AppText weight="semibold" size={FontSize.xs} color="#94A29A" style={{ marginTop: 1 }}>
                {mealEmoji} {mealType} · {office}
              </AppText>
            </View>
            {isCheckedIn && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#008A63', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                <CheckIcon color="#fff" size={13} />
                <AppText weight="bold" size={FontSize.xs} color="#fff">Collected</AppText>
              </View>
            )}
          </View>

          <View style={{ height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#E0E8E4', width: '100%', marginBottom: 16 }} />

          {/* QR */}
          {isLoading || !pass ? (
            <View style={{ width: qrSize, height: qrSize, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#008A63" size="large" />
            </View>
          ) : (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 8 }}>
              <QRCode value={pass.token} size={qrSize} color="#0F1C17" backgroundColor="#ffffff" ecl="M" />
            </View>
          )}

          <View style={{ height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#E0E8E4', width: '100%', marginTop: 16, marginBottom: 14 }} />

          {/* Details */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' }}>
            {[
              ['Meal', mealType],
              ['Item', mealName],
              ['Office', office],
            ].map(([label, value]) => (
              <View key={label} style={{ minWidth: '40%' }}>
                <AppText weight="bold" size={FontSize['2xs']} color="#94A29A" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</AppText>
                <AppText weight="bold" size={FontSize.sm} color="#0F1C17" style={{ marginTop: 3 }}>{value}</AppText>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: -1 }} onPress={onClose} />
      </View>
    </Modal>
  );
}

// ─── Next Meal QR Card ────────────────────────────────────────────────────────

function NextMealQRCard() {
  const T = useMerckTokens();
  const [passVisible, setPassVisible] = useState(false);
  const { next, isLoading } = useNextMealPass();

  if (isLoading) {
    return (
      <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, height: 88, backgroundColor: T.bgCard, borderRadius: 20, borderWidth: 1, borderColor: T.borderDefault, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={MERCK_TOKENS.green} size="small" />
      </View>
    );
  }

  if (!next) return null;

  const mealEmoji = next.mealType === 'Breakfast' ? '☀️' : next.mealType === 'Lunch' ? '🌤️' : '🌙';
  const mealTime = { Breakfast: '8:00–10:00 AM', Lunch: '12:00–2:00 PM', Dinner: '7:00–9:00 PM' }[next.mealType as string] ?? '';

  // Friendly date label
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
  const dateLabel = next.dateKey === todayKey ? 'Today' : next.dateKey === tomorrowKey ? 'Tomorrow' : next.dateKey;

  return (
    <>
      {/* Wrap in View for shadow — LinearGradient can't carry shadow on iOS */}
      <TouchableOpacity
        onPress={() => setPassVisible(true)}
        activeOpacity={0.88}
        style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, borderRadius: 20, ...Shadow.sm }}
      >
        <LinearGradient
          colors={['#0F3D2E', '#027A55', '#008A63']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, overflow: 'hidden', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          {/* Decorative circles — inside overflow:hidden so they don't clip content */}
          <View style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <View style={{ position: 'absolute', right: 50, bottom: -40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />

          {/* Meal emoji badge */}
          <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AppText size={26}>{mealEmoji}</AppText>
          </View>

          {/* Text */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText weight="bold" size={FontSize['2xs']} color="rgba(255,255,255,0.65)" style={{ textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>
              {dateLabel} · {next.office}
            </AppText>
            <AppText weight="bold" size={FontSize.lg} color="#fff" style={{ lineHeight: 22 }} numberOfLines={1}>
              {next.mealType} QR Pass
            </AppText>
            <AppText weight="semibold" size={FontSize.xs} color="rgba(255,255,255,0.7)" style={{ marginTop: 2 }} numberOfLines={1}>
              {next.mealName} · {mealTime}
            </AppText>
          </View>

          {/* QR button — flexShrink:0 ensures it never gets squeezed */}
          <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 4 }}>
            <QRIcon color="#0F3D2E" size={20} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <PassSheet
        orderId={next._id}
        mealType={next.mealType}
        mealName={next.mealName}
        office={next.office}
        checkedIn={next.checkedIn}
        visible={passVisible}
        onClose={() => setPassVisible(false)}
      />
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreenMobile() {
  const T = useMerckTokens();

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1, backgroundColor: T.bgApp }}>
      <MerckHeader title="MerckConnect" hasNotificationBadge />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['2xl'] }}>

        {/* Greeting */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
          <AppText weight="medium" size={FontSize.sm} color={T.tabInactive}>{greeting}</AppText>
          <AppText weight="bold" size={FontSize['3xl']} color={T.headerText} style={{ marginTop: 2 }}>Welcome back 👋</AppText>
        </View>

        {/* Stat Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
          <StatChip label="Meals this month" value={23} iconColor={T.green} icon={<MealIcon color={T.green} />} style={{ marginRight: Spacing.md }} />
          <StatChip label="This week" value={5} iconColor={T.accentAmber} icon={<MealIcon color={T.accentAmber} />} style={{ marginRight: Spacing.md }} />
          <StatChip label="Total spend" value="₹460" iconColor={T.accentBlue} icon={<MealIcon color={T.accentBlue} />} />
        </ScrollView>

        {/* ── Next Meal QR Quick-Access Card ── */}
        <SectionHeader title="Next Pickup Pass" style={{ marginTop: 0 }} />
        <NextMealQRCard />

        {/* Today's meals summary */}
        <SectionHeader title="Today's Menu" style={{ marginTop: Spacing.sm }} />
        <View style={{ marginHorizontal: Spacing.lg, backgroundColor: T.bgCard, borderRadius: Radius.base, borderWidth: 1, borderColor: T.borderDefault, overflow: 'hidden', marginBottom: Spacing['2xl'] }}>
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map((type, i) => (
            <View key={type} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 14, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: T.borderDefault }}>
              <AppText size={22} style={{ marginRight: Spacing.md, width: 30, textAlign: 'center' }}>
                {type === 'Breakfast' ? '☀️' : type === 'Lunch' ? '🌤' : '🌙'}
              </AppText>
              <View style={{ flex: 1 }}>
                <AppText weight="semibold" size={FontSize.md} color={T.headerText}>{type}</AppText>
                <AppText weight="medium" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 2 }}>Tap Food tab to order</AppText>
              </View>
              <View style={{ backgroundColor: T.green + '22', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                <AppText weight="bold" size={FontSize.xs} color={T.green}>Open</AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </View>
  );
}
