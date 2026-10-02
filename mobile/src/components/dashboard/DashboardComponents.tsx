/**
 * Reusable pure components for the Dashboard screen.
 * All components are stateless — state lives in DashboardScreen.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { useMerckTokens, MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import AppText from '@components/common/AppText';
import { Shadow } from '@theme/spacing';
import { usePickupPass } from '@hooks/useFood';
import type { DashboardOrderItem, DashboardTodayItem } from '@hooks/useDashboard';

// ── Icons ─────────────────────────────────────────────────────────────────────

export const QRIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Path d="M14 14h3v3M21 14v7h-7v-3M17 21h1" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FoodIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="1.8" />
    <Path d="M6 1v4M10 1v4M14 1v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const OrdersIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.8" />
    <Path d="M8 9h8M8 12h5M8 15h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const CheckCircleIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color + '22'} stroke={color} strokeWidth="2" />
    <Path d="m8 12 3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

export const mealEmoji = (mealType: string) =>
  mealType === 'Breakfast' ? '☀️' : mealType === 'Lunch' ? '🌤️' : '🌙';

// ── PickupPassModal ───────────────────────────────────────────────────────────

interface PickupPassModalProps {
  orderId: string;
  mealType: string;
  mealName: string;
  office: string;
  checkedIn?: boolean;
  visible: boolean;
  onClose: () => void;
}

export const PickupPassModal = React.memo(({
  orderId, mealType, mealName, office, checkedIn: orderCheckedIn, visible, onClose,
}: PickupPassModalProps) => {
  const T = useMerckTokens();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const qrSize = width - 96;
  const { data: pass, isLoading } = usePickupPass(orderId, visible);

  const isCheckedIn  = pass?.checkedIn ?? orderCheckedIn ?? false;
  const employeeName = pass?.employeeName ?? 'Employee';
  const initials     = employeeName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={pm.overlay}>
        <TouchableOpacity onPress={onClose} style={pm.closeBtn}>
          <CloseIcon color="#fff" />
        </TouchableOpacity>

        <View style={pm.header}>
          <AppText weight="bold" size={FontSize['2xl']} color="#fff">{t('food.pickup.title')}</AppText>
          <AppText weight="semibold" size={FontSize.xs} color="rgba(255,255,255,0.6)" style={{ marginTop: 4 }}>
            {t('food.pickup.counter', { office })}
          </AppText>
        </View>

        <View style={[pm.card, { width: width - 48 }]}>
          {/* Employee row */}
          <View style={pm.employeeRow}>
            <LinearGradient
              colors={['#008A63', '#0ea5e9']}
              style={pm.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppText weight="bold" size={FontSize.md} color="#fff">{initials}</AppText>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" size={FontSize.md} color="#0F1C17">{employeeName}</AppText>
              <AppText weight="semibold" size={FontSize.xs} color="#94A29A" style={{ marginTop: 1 }}>
                {mealEmoji(mealType)} {mealType} · {office}
              </AppText>
            </View>
            {isCheckedIn && (
              <View style={pm.collectedBadge}>
                <CheckCircleIcon color="#fff" />
                <AppText weight="bold" size={FontSize.xs} color="#fff">{t('food.pickup.collected')}</AppText>
              </View>
            )}
          </View>

          <View style={pm.divider} />

          {/* QR */}
          {isLoading || !pass ? (
            <View style={{ width: qrSize, height: qrSize, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#008A63" size="large" />
            </View>
          ) : (
            <View style={pm.qrWrap}>
              <QRCode value={pass.token} size={qrSize} color="#0F1C17" backgroundColor="#fff" ecl="M" />
            </View>
          )}

          <View style={pm.divider} />

          {/* Details */}
          <View style={pm.details}>
            {[['Meal', mealType], ['Item', mealName], ['Office', office]].map(([label, value]) => (
              <View key={label} style={{ minWidth: '40%' }}>
                <AppText weight="bold" size={FontSize['2xs']} color="#94A29A" style={pm.detailLabel}>{label}</AppText>
                <AppText weight="bold" size={FontSize.sm} color="#0F1C17" style={{ marginTop: 3 }}>{value}</AppText>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>
    </Modal>
  );
});

const pm = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  closeBtn:       { position: 'absolute', top: 56, right: 24, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  header:         { alignItems: 'center', marginBottom: 20 },
  card:           { backgroundColor: '#fff', borderRadius: 24, padding: 16, alignItems: 'center', ...Shadow.sm },
  employeeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginBottom: 16 },
  avatar:         { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  collectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#008A63', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  divider:        { height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#E0E8E4', width: '100%', marginVertical: 14 },
  qrWrap:         { borderRadius: 12, padding: 8 },
  details:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },
  detailLabel:    { textTransform: 'uppercase', letterSpacing: 0.4 },
});

// ── NextPickupCard ────────────────────────────────────────────────────────────

interface NextPickupCardProps {
  pickup: DashboardOrderItem;
  onPress: () => void;
}

export const NextPickupCard = React.memo(({ pickup, onPress }: NextPickupCardProps) => {
  const { t } = useTranslation();
  return (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ borderRadius: 22, ...Shadow.sm }}>
    {/* overflow:hidden on gradient clips the blob — padding lives on inner View */}
    <LinearGradient
      colors={['#0A1A0F', '#0F3D2E', '#008A63']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={nc.gradient}
    >
      {/* Decorative blob — clipped by overflow:hidden on gradient */}
      <View style={nc.blob} />

      {/* Inner padded content wrapper */}
      <View style={nc.inner}>
        {/* Content row */}
        <View style={nc.contentRow}>
          <View style={nc.emojiWrap}>
            <AppText size={28}>{mealEmoji(pickup.mealType)}</AppText>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Badge top-left above title */}
            <View style={nc.badge}>
              <View style={nc.dot} />
              <AppText weight="bold" size={9} color="rgba(255,255,255,0.7)" style={nc.labelText}>
                {t('dashboard.nextPickup')}
              </AppText>
            </View>
            <AppText weight="bold" size={18} color="#fff" numberOfLines={1} style={{ marginTop: 4 }}>{pickup.mealType} {t('dashboard.pass')}</AppText>
            <AppText weight="semibold" size={FontSize.sm} color="rgba(255,255,255,0.75)" style={{ marginTop: 2 }} numberOfLines={1}>
              {pickup.mealName}
            </AppText>
            <AppText weight="semibold" size={FontSize.xs} color="rgba(255,255,255,0.5)" style={{ marginTop: 3 }}>
              {pickup.office} · {pickup.dateKey}
            </AppText>
          </View>
          <View style={nc.qrBtn}>
            <QRIcon color="#0F3D2E" size={20} />
          </View>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
  );
});

const nc = StyleSheet.create({
  gradient:    { borderRadius: 22, overflow: 'hidden' },
  inner:       { padding: 16 },
  blob:        { position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.07)' },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  dot:         { width: 5, height: 5, borderRadius: 2.5, backgroundColor: MERCK_TOKENS.green },
  labelText:   { textTransform: 'uppercase', letterSpacing: 0.7 },
  contentRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiWrap:   { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  qrBtn:       { width: 44, height: 44, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  hint:        { marginTop: 12, textAlign: 'center' },
});

// ── StatTile ──────────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}

export const StatTile = React.memo(({ label, value, sub, color, icon }: StatTileProps) => {
  const T = useMerckTokens();
  return (
    <View style={[st.card, { borderColor: T.borderDefault, backgroundColor: T.bgCard }]}>
      <View style={[st.iconRow]}>
        <View style={[st.iconWrap, { backgroundColor: color + '18' }]}>{icon}</View>
        <AppText weight="bold" size={20} color={T.headerText}>{value}</AppText>
      </View>
      <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} numberOfLines={1}>{label}</AppText>
      {sub ? <AppText weight="semibold" size={FontSize['2xs']} color={color} style={{ marginTop: 2 }} numberOfLines={1}>{sub}</AppText> : null}
    </View>
  );
});

const st = StyleSheet.create({
  card:    { flex: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, ...Shadow.sm },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  iconWrap:{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});

// ── TodayOrderRow ─────────────────────────────────────────────────────────────

interface TodayOrderRowProps {
  item: DashboardTodayItem;
  isFirst: boolean;
  onPress: () => void;
}

export const TodayOrderRow = React.memo(({ item, isFirst, onPress }: TodayOrderRowProps) => {
  const T = useMerckTokens();
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[tr.row, { borderTopWidth: isFirst ? 0 : 1, borderTopColor: T.borderDefault }]}
    >
      <View style={[tr.iconWrap, { backgroundColor: T.green + '18' }]}>
        <AppText size={18}>{mealEmoji(item.meal)}</AppText>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="bold" size={FontSize.md} color={T.headerText} numberOfLines={1}>{item.name}</AppText>
        <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 2 }}>
          {item.meal} · {item.office}
        </AppText>
      </View>
      {item.checkedIn ? (
        <View style={[tr.badge, { backgroundColor: T.green + '18' }]}>
          <CheckCircleIcon color={T.green} />
          <AppText weight="bold" size={FontSize['2xs']} color={T.green}>{t('dashboard.collected')}</AppText>
        </View>
      ) : (
        <View style={[tr.qrBtn, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
          <QRIcon color={T.tabInactive} size={15} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const tr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  iconWrap:{ width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badge:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  qrBtn:   { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

// ── QuickActionBtn ────────────────────────────────────────────────────────────

interface QuickActionBtnProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

export const QuickActionBtn = React.memo(({ label, icon, color, onPress }: QuickActionBtnProps) => {
  const T = useMerckTokens();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={qa.wrap}>
      <View style={[qa.iconWrap, { backgroundColor: color + '18', borderColor: color + '30' }]}>
        {icon}
      </View>
      <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive} align="center" numberOfLines={1}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
});

const qa = StyleSheet.create({
  wrap:    { flex: 1, alignItems: 'center', gap: 7 },
  iconWrap:{ width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

// ── SectionCard (card shell with optional header row) ─────────────────────────

interface SectionCardProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export const SectionCard = React.memo(({ title, actionLabel, onAction, children }: SectionCardProps) => {
  const T = useMerckTokens();
  const { t: _t } = useTranslation(); // available for subclasses if needed
  return (
    <View style={[sc.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
      <View style={[sc.header, { borderBottomColor: T.borderDefault }]}>
        <AppText weight="bold" size={FontSize.lg} color={T.headerText}>{title}</AppText>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
            <AppText weight="bold" size={FontSize.xs} color={T.green}>{actionLabel}</AppText>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
});

const sc = StyleSheet.create({
  card:   { borderRadius: 18, borderWidth: 1, overflow: 'hidden', ...Shadow.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
});
