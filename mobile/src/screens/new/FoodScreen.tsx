import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  PermissionsAndroid,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Geolocation from '@react-native-community/geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FoodStackParamList } from '@navigation/types';
import NotificationBell from '@components/notifications/NotificationBell';
import { MERCK_TOKENS, useMerckTokens } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import AppText from '@components/common/AppText';
import { Shadow } from '@theme/spacing';
import {
  CartEntry,
  OfficeId,
  MealType,
  FoodOption,
  isPast6PM,
  dayOffsetLabel,
  dayOffsetDate,
  dayOffsetMonth,
  orderDateLabel,
  cutoffLabel,
} from '@data/mockFood';
// OfficeId is now a plain string — values come from backend /offices
import {
  useMealsByDate,
  useMyOrders,
  usePlaceBulkOrders,
  useCancelOrder,
  useRateOrder,
  usePickupPass,
} from '@hooks/useFood';
import { useOffices, useNearestOffice } from '@hooks/useOffices';
import FoodFeedbackSheet from '@components/food/FoodFeedbackSheet';
import AppModal, { type ModalConfig } from '@components/modals/AppModal';
import type { ApiOffice } from '@services/api/office.service';
import type { ApiFoodOrder } from '@services/api/food.service';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFoodReminderStore } from '@stores/foodReminderStore';
import { scheduleFoodReminder, cancelFoodReminder } from '@services/localNotificationService';

// ── Local types ────────────────────────────────────────────────────────────────

type OrderStatus = 'upcoming' | 'today' | 'past' | 'cancelled';

interface FoodOrder {
  id: string;
  dayOffset: number;
  meal: MealType;
  option: string;
  price: number;
  status: OrderStatus;
  office: OfficeId;
  checkedIn?: boolean;
  rating?: number;
  hasFeedback: boolean;
  // Meal details (populated from backend)
  dishes?: string;
  kcal?: number;
  tags?: string[];
  isNonVeg?: boolean;
  dateKey?: string;
}

// ── Booking days: next 3 weekdays (Mon–Fri), skipping Sat & Sun ───────────────

function getNextWeekdayOffsets(): number[] {
  const offsets: number[] = [];
  let offset = 1;
  while (offsets.length < 3) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) offsets.push(offset);
    offset++;
  }
  return offsets;
}

function isOffsetLocked(offset: number): boolean {
  // A booking day is locked when its cutoff has passed:
  // cutoff = previous calendar day at 6 PM.
  // So offset N locks when (offset - 1) days from now is today (i.e. offset === 1) AND past 6 PM.
  // For offset > 1, the cutoff day is still in the future — always open.
  return offset === 1 && isPast6PM();
}

// Meal pickup windows (end hour, exclusive):
// Breakfast 8–10 AM, Lunch 12–2 PM, Dinner 7–9 PM
const MEAL_WINDOW_END: Record<string, number> = {
  Breakfast: 10,
  Lunch:     14,
  Dinner:    21,
};

/**
 * Returns true when TODAY's pickup window for a given meal type has already
 * closed. Cancel is not allowed once the window is over — the user simply
 * didn't show up and the meal slot can no longer be freed.
 */
function isTodayMealWindowPassed(meal: string): boolean {
  return new Date().getHours() >= (MEAL_WINDOW_END[meal] ?? 24);
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const LockIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="11" width="16" height="10" rx="2" stroke={MERCK_TOKENS.tabInactive} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={MERCK_TOKENS.tabInactive} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path d="M12 7v5l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
  </Svg>
);

const PinIcon = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" stroke={MERCK_TOKENS.tabInactive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="2.4" stroke={MERCK_TOKENS.tabInactive} strokeWidth="2" />
  </Svg>
);

const CheckIcon = ({ color = '#fff', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="m5 12 5 5L20 7" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const QRIcon = ({ color }: { color: string }) => (
  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Path d="M14 14h3v3M21 14v7h-7v-3M17 21h1" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ChevronRight = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="m9 6 6 6-6 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);


const CreditIcon = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="13" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10h18M7 15h3" stroke={color} strokeWidth="2" strokeLinecap="round" />
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

// ── VegDot ────────────────────────────────────────────────────────────────────

function VegDot({ isNonVeg }: { isNonVeg: boolean }) {
  const T = useMerckTokens();
  const color = isNonVeg ? T.error : T.green;
  return (
    <View style={{ width: 14, height: 14, borderRadius: 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', borderColor: color }}>
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }} />
    </View>
  );
}

// ── Location Picker Modal ─────────────────────────────────────────────────────

function LocationPickerModal({
  visible,
  current,
  nearestId,
  offices,
  locating,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: OfficeId;
  nearestId: OfficeId | null;
  offices: ApiOffice[];
  locating: boolean;
  onSelect: (id: OfficeId) => void;
  onClose: () => void;
}) {
  const T = useMerckTokens();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{ backgroundColor: T.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: T.borderDefault, paddingBottom: 32 }}>
        {/* Handle */}
        <View style={{ width: 36, height: 4, backgroundColor: T.borderMuted, borderRadius: 2, alignSelf: 'center', marginTop: 10 }} />

        {/* Header row with close button */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 4 }}>
          <View>
            <AppText weight="bold" size={FontSize.xl} color={T.headerText}>Change office</AppText>
            <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 4 }}>
              {locating ? '📍 Detecting your location…' : 'Selection saved as your default office.'}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseIcon color={T.tabInactive} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 12, gap: 10 }}>
          {offices.length === 0 ? (
            <ActivityIndicator color={T.green} style={{ marginVertical: 24 }} />
          ) : (
            offices.map(o => {
              const isActive = o.id === current;
              const isNearest = o.id === nearestId;
              return (
                <TouchableOpacity
                  key={o.id}
                  onPress={() => { onSelect(o.id); onClose(); }}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: isActive ? T.green : T.borderDefault, backgroundColor: isActive ? T.green + '12' : T.bgSurface }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isActive ? T.green : T.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isActive ? T.green : T.borderDefault }}>
                    <PinIcon />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <AppText weight="bold" size={FontSize.md} color={isActive ? T.green : T.headerText}>{o.label}</AppText>
                      {isNearest && (
                        <View style={{ backgroundColor: T.green + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <AppText weight="bold" size={FontSize['2xs']} color={T.green}>Nearest</AppText>
                        </View>
                      )}
                    </View>
                    <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>{o.address}, {o.city}</AppText>
                    {o.distanceKm !== undefined && (
                      <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive} style={{ marginTop: 1 }}>📍 {o.distanceKm} km away</AppText>
                    )}
                  </View>
                  {isActive && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center' }}>
                      <CheckIcon size={11} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Office Label (tap to change) ──────────────────────────────────────────────

function OfficeSwitcher({ onOpenPicker }: { active: OfficeId; offices: ApiOffice[]; onOpenPicker: () => void }) {
  return (
    <TouchableOpacity
      onPress={onOpenPicker}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7,
      }}
    >
      <PinIcon />
      <AppText weight="bold" size={FontSize.xs} color="#fff">Change</AppText>
      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
        <Path d="m6 9 6 6 6-6" stroke="rgba(255,255,255,0.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </TouchableOpacity>
  );
}

// ── Day Picker ────────────────────────────────────────────────────────────────

function DayPicker({
  selectedOffset,
  cartCounts,
  bookingOffsets,
  onSelect,
}: {
  selectedOffset: number;
  cartCounts: Record<number, number>;
  bookingOffsets: number[];
  onSelect: (offset: number) => void;
}) {
  const T = useMerckTokens();
  return (
    <View style={{ flexDirection: 'row', gap: 9 }}>
      {bookingOffsets.map(off => {
        const locked = isOffsetLocked(off);
        const isSelected = selectedOffset === off;
        const count = cartCounts[off] ?? 0;
        const label = off === 1 ? 'Tomorrow' : dayOffsetLabel(off);
        const subColor = isSelected ? T.green : T.tabInactive;
        const dayColor = isSelected ? T.green : locked ? T.tabInactive : T.headerText;

        return (
          <TouchableOpacity
            key={off}
            onPress={() => !locked && onSelect(off)}
            activeOpacity={locked ? 1 : 0.8}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 16,
              backgroundColor: isSelected ? T.green + '22' : T.bgCard,
              borderWidth: 1, borderColor: isSelected ? T.green : T.borderDefault,
              position: 'relative', overflow: 'visible', opacity: locked ? 0.45 : 1,
            }}
          >
            {locked && <View style={{ position: 'absolute', top: 8, right: 8 }}><LockIcon /></View>}
            {count > 0 && !locked && (
              <View style={{ position: 'absolute', top: -6, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: T.accentAmber, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: T.bgApp }}>
                <AppText weight="bold" size={10} color="#fff">{count}</AppText>
              </View>
            )}
            <AppText weight="bold" size={FontSize.xs} color={subColor}>{label}</AppText>
            <AppText weight="bold" size={22} color={dayColor} style={{ lineHeight: 28 }}>{dayOffsetDate(off)}</AppText>
            <AppText weight="bold" size={FontSize.xs} color={subColor}>{dayOffsetMonth(off)}</AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Meal Detail Modal (Order view) ────────────────────────────────────────────

function MealDetailModal({
  opt,
  mealType,
  mealTime,
  isSelected,
  locked,
  visible,
  onClose,
  onSelect,
}: {
  opt: FoodOption | null;
  mealType: MealType;
  mealTime: string;
  isSelected: boolean;
  locked: boolean;
  visible: boolean;
  onClose: () => void;
  onSelect: (opt: FoodOption) => void;
}) {
  const T = useMerckTokens();
  if (!opt) return null;

  const mealEmoji  = mealType === 'Breakfast' ? '☀️' : mealType === 'Lunch' ? '🌤️' : '🌙';
  const vegColor   = opt.isNonVeg ? T.error : T.green;
  const vegLabel   = opt.isNonVeg ? 'Non-Veg' : 'Veg';
  const dishes     = opt.dishes.split(',').map(d => d.trim()).filter(Boolean);
  const leftDishes  = dishes.filter((_, i) => i % 2 === 0);
  const rightDishes = dishes.filter((_, i) => i % 2 === 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose} />
      <View style={{ backgroundColor: T.bgCard, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '88%', borderTopWidth: 1, borderColor: T.borderDefault }}>
        {/* Handle + close */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ flex: 1 }} />
          <View style={{ width: 36, height: 4, backgroundColor: T.borderMuted, borderRadius: 2, position: 'absolute', left: '50%', marginLeft: -18 }} />
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseIcon color={T.tabInactive} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Hero */}
          <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24, paddingHorizontal: 24 }}>
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: T.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.borderDefault }}>
                <AppText size={38}>{mealEmoji}</AppText>
              </View>
              <View style={{ position: 'absolute', top: -6, right: -10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: vegColor, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                <AppText weight="bold" size={FontSize['2xs']} color="#fff">{vegLabel}</AppText>
              </View>
            </View>

            <AppText weight="bold" size={24} color={T.headerText} align="center" style={{ lineHeight: 30, marginBottom: 6 }}>
              {opt.name}
            </AppText>
            <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center">
              {mealType} · {mealTime}
            </AppText>
          </View>

          {/* Price + kcal strip */}
          <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: T.bgSurface, borderRadius: 18, borderWidth: 1, borderColor: T.borderDefault, overflow: 'hidden' }}>
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: T.borderDefault }}>
              <AppText weight="bold" size={FontSize['2xs']} color={T.tabInactive} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Price</AppText>
              <AppText weight="bold" size={FontSize.lg} color={T.headerText}>₹{opt.price}</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14 }}>
              <AppText weight="bold" size={FontSize['2xs']} color={T.tabInactive} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Calories</AppText>
              <AppText weight="bold" size={FontSize.lg} color={T.headerText}>{opt.kcal > 0 ? `${opt.kcal} kcal` : '—'}</AppText>
            </View>
          </View>

          {/* Dishes — two columns */}
          {dishes.length > 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: T.bgSurface, borderRadius: 18, borderWidth: 1, borderColor: T.borderDefault, padding: 18 }}>
              <AppText weight="bold" size={FontSize.sm} color={T.tabInactive} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>What's included</AppText>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, gap: 10 }}>
                  {leftDishes.map((dish, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.green, flexShrink: 0 }} />
                      <AppText weight="semibold" size={FontSize.sm} color={T.headerText}>{dish}</AppText>
                    </View>
                  ))}
                </View>
                {rightDishes.length > 0 && (
                  <View style={{ flex: 1, gap: 10 }}>
                    {rightDishes.map((dish, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.green, flexShrink: 0 }} />
                        <AppText weight="semibold" size={FontSize.sm} color={T.headerText}>{dish}</AppText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Tags */}
          {opt.tags.length > 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {opt.tags.map(tag => (
                <View key={tag} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault }}>
                  <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>{tag}</AppText>
                </View>
              ))}
            </View>
          )}

          {/* Add / Remove action */}
          {!locked && (
            <View style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => { onSelect(opt); onClose(); }}
                activeOpacity={0.88}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  backgroundColor: isSelected ? T.error + '18' : T.green,
                  borderRadius: 16, paddingVertical: 15,
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? T.error + '60' : 'transparent',
                }}
              >
                <AppText weight="bold" size={FontSize.xl} color={isSelected ? T.error : T.bgApp}>
                  {isSelected ? 'Remove from order' : 'Add to order'}
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Meal Section Card ─────────────────────────────────────────────────────────

function MealSectionCard({
  slot,
  selectedOptionId,
  existingOrderNames = [],
  locked,
  onSelect,
}: {
  slot: { mealType: MealType; time: string; options: FoodOption[] };
  selectedOptionId: string | null;
  existingOrderNames?: string[];
  locked: boolean;
  onSelect: (opt: FoodOption) => void;
}) {
  const T = useMerckTokens();
  const hasSelection = selectedOptionId !== null;
  const hasExisting = existingOrderNames.length > 0;
  const [previewOpt, setPreviewOpt] = React.useState<FoodOption | null>(null);

  return (
    <View style={{ backgroundColor: T.bgCard, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 22, padding: 14, ...Shadow.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: T.bgSurface, alignItems: 'center', justifyContent: 'center' }}>
          <AppText size={20}>{slot.mealType === 'Breakfast' ? '☀️' : slot.mealType === 'Lunch' ? '🌤️' : '🌙'}</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 1 }}>{slot.mealType}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ClockIcon color={T.tabInactive} />
            <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>{slot.time}</AppText>
          </View>
        </View>
        {hasSelection && (
          <View style={{ backgroundColor: T.green + '22', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 }}>
            <AppText weight="bold" size={FontSize.xs} color={T.green}>Added</AppText>
          </View>
        )}
      </View>

      <View style={{ gap: 8 }}>
        {slot.options.map(opt => {
          const isSelected = opt.id === selectedOptionId;
          const isDuplicate = existingOrderNames.some(
            name => name.toLowerCase() === opt.name.toLowerCase(),
          );
          const borderColor = isDuplicate ? T.accentAmber : isSelected ? T.green : T.borderDefault;
          const bgColor    = isDuplicate ? T.accentAmber + '0A' : isSelected ? T.green + '0A' : T.bgApp;

          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setPreviewOpt(opt)}
              activeOpacity={0.85}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, borderColor, padding: 12, backgroundColor: bgColor }}
            >
              <VegDot isNonVeg={opt.isNonVeg} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <AppText weight="bold" size={FontSize.md} color={T.headerText} style={{ flex: 1 }}>{opt.name}</AppText>
                  {isDuplicate && (
                    <View style={{ backgroundColor: T.accentAmber + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <AppText weight="bold" size={FontSize['2xs']} color={T.accentAmber}>Booked</AppText>
                    </View>
                  )}
                </View>
                <AppText weight="medium" size={FontSize.sm} color={T.tabInactive} style={{ lineHeight: 17, marginBottom: 7 }} numberOfLines={2}>{opt.dishes}</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                  <View style={{ backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 }}>
                    <AppText weight="bold" size={FontSize['2xs']} color={T.tabInactive}>{opt.kcal} kcal</AppText>
                  </View>
                  {opt.tags.map(tag => (
                    <View key={tag} style={{ backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 }}>
                      <AppText weight="bold" size={FontSize['2xs']} color={T.tabInactive}>{tag}</AppText>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => !locked && onSelect(opt)}
                disabled={locked}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isSelected ? T.error : T.green,
                  backgroundColor: isSelected ? T.error + '15' : T.green + '15',
                  alignSelf: 'center',
                }}
              >
                <AppText weight="bold" size={FontSize.xs} color={isSelected ? T.error : T.green}>
                  {isSelected ? 'Remove' : 'Add'}
                </AppText>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Meal detail popup */}
      <MealDetailModal
        opt={previewOpt}
        mealType={slot.mealType}
        mealTime={slot.time}
        isSelected={previewOpt?.id === selectedOptionId}
        locked={locked}
        visible={!!previewOpt}
        onClose={() => setPreviewOpt(null)}
        onSelect={(opt) => { onSelect(opt); setPreviewOpt(null); }}
      />
    </View>
  );
}

// ── Sticky Cart Bar ───────────────────────────────────────────────────────────

function CartBar({
  cartEntries,
  onReview,
}: {
  cartEntries: CartEntry[];
  onReview: () => void;
}) {
  const T = useMerckTokens();
  const total = cartEntries.reduce((s, e) => s + e.option.price, 0);
  const count = cartEntries.length;
  const summary = cartEntries.map(e => e.option.name.split(' ')[0]).join(', ');
  const barBg = T.headerText;
  const barText = T.bgApp;

  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: 14, right: 14, bottom: 20, zIndex: 12 }, animStyle]}>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: barBg, borderRadius: 20, paddingVertical: 13, paddingLeft: 16, paddingRight: 14, ...Shadow.sm }} onPress={onReview} activeOpacity={0.9}>
        <View style={{ minWidth: 28, height: 28, borderRadius: 9, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
          <AppText weight="bold" size={FontSize.md} color={T.bgApp}>{count}</AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText weight="semibold" size={FontSize.xs} color={barText} style={{ opacity: 0.7 }} numberOfLines={1}>{summary}</AppText>
          <AppText weight="bold" size={FontSize.xl} color={barText}>₹{total} total</AppText>
        </View>
        <AppText weight="bold" size={FontSize.md} color={barText}>Review</AppText>
        <ChevronRight color={barText} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Animated Confirm Button ───────────────────────────────────────────────────

function ConfirmButton({ count, total, isConfirming, onConfirm }: { count: number; total: number; isConfirming: boolean; onConfirm: () => void }) {
  const T = useMerckTokens();
  const scale = useSharedValue(1);
  const flash = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(flash.value, [0, 1, 0], [T.green, '#ffffff', T.green]),
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.96, { damping: 10 }), withSpring(1, { damping: 12 }));
    flash.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 200 }));
    runOnJS(onConfirm)();
  };

  return (
    <View style={{ padding: 22, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.borderDefault }}>
      <Animated.View style={[{ borderRadius: 16, overflow: 'hidden' }, animStyle]}>
        <TouchableOpacity
          style={{ paddingVertical: 15, alignItems: 'center', opacity: isConfirming ? 0.7 : 1 }}
          onPress={handlePress}
          activeOpacity={0.88}
          disabled={isConfirming}
        >
          {isConfirming
            ? <ActivityIndicator color={T.bgApp} />
            : <AppText weight="bold" size={FontSize.xl} color={T.bgApp}>Confirm {count} meal{count !== 1 ? 's' : ''} · ₹{total}</AppText>
          }
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Cancel Confirm Sheet ──────────────────────────────────────────────────────

function CancelConfirmSheet({
  visible,
  meal,
  dateLabel,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  meal: MealType | null;
  dateLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const T = useMerckTokens();
  const mealEmoji = meal === 'Breakfast' ? '☀️' : meal === 'Lunch' ? '🌤️' : '🌙';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{ backgroundColor: T.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: T.borderDefault, paddingBottom: 32 }}>
        {/* Handle */}
        <View style={{ width: 36, height: 4, backgroundColor: T.borderMuted, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 20 }} />

        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: T.error + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <AppText size={30}>{mealEmoji}</AppText>
          </View>
          <AppText weight="bold" size={20} color={T.headerText} align="center">Cancel this order?</AppText>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ marginTop: 6, paddingHorizontal: 32, lineHeight: 20 }}>
            {meal} on {dateLabel} will be cancelled. You won't be charged.
          </AppText>
        </View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.88}
            style={{ backgroundColor: T.error, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}
          >
            <AppText weight="bold" size={FontSize.xl} color="#fff">Yes, cancel order</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.88}
            style={{ backgroundColor: T.bgSurface, borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: T.borderDefault }}
          >
            <AppText weight="bold" size={FontSize.xl} color={T.headerText}>Keep order</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Review Order Sheet ─────────────────────────────────────────────────────────

function ReviewOrderSheet({
  visible,
  cartEntries,
  office,
  isConfirming,
  onClose,
  onClearAll,
  onRemove,
  onConfirm,
}: {
  visible: boolean;
  cartEntries: CartEntry[];
  office: OfficeId;
  isConfirming?: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onRemove: (dayOffset: number, meal: MealType) => void;
  onConfirm: () => void;
}) {
  const T = useMerckTokens();
  const total = cartEntries.reduce((s, e) => s + e.option.price, 0);
  const count = cartEntries.length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose} />
      <View style={{ backgroundColor: T.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', borderTopWidth: 1, borderColor: T.borderDefault }}>
        <View style={{ width: 36, height: 4, backgroundColor: T.borderMuted, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 2 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 4 }}>
          <AppText weight="bold" size={FontSize['2xl']} color={T.headerText}>Review order</AppText>
          <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: T.bgSurface, alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon color={T.tabInactive} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 14 }}>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>{count} meal{count !== 1 ? 's' : ''} · pickup at {office}</AppText>
          <TouchableOpacity onPress={onClearAll}>
            <AppText weight="bold" size={FontSize.sm} color={T.error}>Clear all</AppText>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ paddingHorizontal: 22 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 8 }}>
            {cartEntries.map(e => (
              <View key={`${e.dayOffset}-${e.meal}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 11 }}>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" size={FontSize.md} color={T.headerText}>{e.meal} · {e.option.name}</AppText>
                  <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 2 }}>{orderDateLabel(e.dayOffset)}</AppText>
                </View>
                <AppText weight="bold" size={FontSize.md} color={T.headerText}>₹{e.option.price}</AppText>
                <TouchableOpacity onPress={() => onRemove(e.dayOffset, e.meal)} style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: T.error + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <CloseIcon color={T.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 14, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>Subtotal</AppText>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>₹{total}</AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>Company subsidy</AppText>
              <AppText weight="semibold" size={FontSize.sm} color={T.green}>Applied</AppText>
            </View>
            <View style={{ height: 1, backgroundColor: T.borderDefault, marginVertical: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText weight="bold" size={FontSize.lg} color={T.headerText}>Total</AppText>
              <AppText weight="bold" size={20} color={T.headerText}>₹{total}</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <CreditIcon color={T.tabInactive} />
              <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ flex: 1 }}>
                Deducted from salary wallet · cancel free before 6 PM cutoff
              </AppText>
            </View>
          </View>
          <View style={{ height: 16 }} />
        </ScrollView>

        <ConfirmButton
          count={count}
          total={total}
          isConfirming={!!isConfirming}
          onConfirm={onConfirm}
        />
      </View>
    </Modal>
  );
}

// ── Pickup Pass Sheet (QR) ────────────────────────────────────────────────────

function PickupPassSheet({
  visible,
  order,
  office,
  offices,
  onClose,
}: {
  visible: boolean;
  order: FoodOrder | null;
  office: OfficeId;
  offices: ApiOffice[];
  onClose: () => void;
}) {
  const T = useMerckTokens();
  const { width } = useWindowDimensions();
  const { data: pass, isLoading: passLoading } = usePickupPass(
    order?.id ?? '',
    visible && !!order?.id
  );

  const qrSize = width - 80;

  if (!order) return null;
  const officeInfo = offices.find(o => o.id === office) ?? { label: office, address: '' };

  const isCheckedIn = pass?.checkedIn ?? order.checkedIn ?? false;
  const employeeName = pass?.employeeName ?? 'Employee';
  const initials = employeeName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>

        {/* Close button */}
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 56, right: 24, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
          <CloseIcon color="#fff" />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <AppText weight="bold" size={FontSize['2xl']} color="#fff">Pickup pass</AppText>
          <AppText weight="semibold" size={FontSize.xs} color="rgba(255,255,255,0.6)" style={{ marginTop: 4 }}>
            Show this at the {officeInfo.label} cafeteria counter
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
              <AppText weight="semibold" size={FontSize.xs} color="#94A29A" style={{ marginTop: 1 }}>{order.meal} · {officeInfo.label}</AppText>
            </View>
            {isCheckedIn && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#008A63', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                <CheckIcon color="#fff" size={11} />
                <AppText weight="bold" size={FontSize.xs} color="#fff">Collected</AppText>
              </View>
            )}
          </View>

          <View style={{ height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#E0E8E4', width: '100%', marginBottom: 16 }} />

          {/* QR Code — centered, max size */}
          {passLoading || !pass ? (
            <View style={{ width: qrSize, height: qrSize, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#008A63" size="large" />
            </View>
          ) : (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 8 }}>
              <QRCode value={pass.token} size={qrSize} color="#0F1C17" backgroundColor="#ffffff" ecl="M" />
            </View>
          )}

          <View style={{ height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#E0E8E4', width: '100%', marginTop: 16, marginBottom: 16 }} />

          {/* Order details */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' }}>
            {[['Meal', order.meal], ['Option', order.option], ['Date', orderDateLabel(order.dayOffset)], ['Office', office]].map(([label, value]) => (
              <View key={label} style={{ minWidth: '40%' }}>
                <AppText weight="bold" size={FontSize['2xs']} color="#94A29A" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</AppText>
                <AppText weight="bold" size={FontSize.md} color="#0F1C17" style={{ marginTop: 3 }}>{value}</AppText>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: -1 }} onPress={onClose} />
      </View>
    </Modal>
  );
}

// ── Repeat Icon ───────────────────────────────────────────────────────────────

const RepeatIcon = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M17 2l4 4-4 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 22l-4-4 4-4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ReorderIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 3v5h5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Order Detail Modal ────────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  visible,
  onClose,
  onShowPass,
  onCancel,
  onFeedback,
  onReorder,
}: {
  order: FoodOrder | null;
  visible: boolean;
  onClose: () => void;
  onShowPass?: () => void;
  onCancel?: () => void;
  onFeedback?: () => void;
  onReorder?: () => void;
}) {
  const T = useMerckTokens();
  if (!order) return null;

  const isPast     = order.status === 'past';
  const isToday    = order.status === 'today';
  const isUpcoming = order.status === 'upcoming';

  const mealEmoji = order.meal === 'Breakfast' ? '☀️' : order.meal === 'Lunch' ? '🌤️' : '🌙';
  const mealTime  = { Breakfast: '8:00 – 10:00 AM', Lunch: '12:00 – 2:00 PM', Dinner: '7:00 – 9:00 PM' }[order.meal];

  const statusColor = isToday ? T.green : isUpcoming ? T.accentAmber : isPast ? T.tabInactive : T.error;
  const statusLabel = isToday ? 'Today' : isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Cancelled';

  const dishes = order.dishes?.split(',').map(d => d.trim()).filter(Boolean) ?? [];

  const vegColor   = order.isNonVeg ? T.error : T.green;
  const vegLabel   = order.isNonVeg ? 'Non-Veg' : 'Veg';

  // Split dishes into two columns
  const leftDishes  = dishes.filter((_, i) => i % 2 === 0);
  const rightDishes = dishes.filter((_, i) => i % 2 === 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose} />
      <View style={{ backgroundColor: T.bgCard, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '88%', borderTopWidth: 1, borderColor: T.borderDefault }}>
        {/* Handle + Close button row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ flex: 1 }} />
          <View style={{ width: 36, height: 4, backgroundColor: T.borderMuted, borderRadius: 2, position: 'absolute', left: '50%', marginLeft: -18 }} />
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseIcon color={T.tabInactive} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Hero */}
          <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24, paddingHorizontal: 24 }}>
            {/* Meal emoji with Veg/Non-Veg badge */}
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: T.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.borderDefault }}>
                <AppText size={38}>{mealEmoji}</AppText>
              </View>
              {/* Veg badge — top-right corner of the icon */}
              <View style={{
                position: 'absolute', top: -6, right: -10,
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                backgroundColor: vegColor, flexDirection: 'row', alignItems: 'center', gap: 4,
              }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                <AppText weight="bold" size={FontSize['2xs']} color="#fff">{vegLabel}</AppText>
              </View>
            </View>

            {/* Status pill */}
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: statusColor + '22', marginBottom: 12 }}>
              <AppText weight="bold" size={FontSize.xs} color={statusColor}>{statusLabel}</AppText>
            </View>

            {/* Meal name */}
            <AppText weight="bold" size={24} color={T.headerText} align="center" style={{ lineHeight: 30, marginBottom: 6 }}>
              {order.option}
            </AppText>
            <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center">
              {order.meal} · {mealTime}
            </AppText>
          </View>

          {/* Info strip */}
          <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: T.bgSurface, borderRadius: 18, borderWidth: 1, borderColor: T.borderDefault, overflow: 'hidden' }}>
            {[
              { label: 'Date',   value: orderDateLabel(order.dayOffset) },
              { label: 'Office', value: order.office },
              { label: 'Price',  value: `₹${order.price}` },
            ].map((item, i, arr) => (
              <View key={item.label} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: T.borderDefault }}>
                <AppText weight="bold" size={FontSize['2xs']} color={T.tabInactive} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</AppText>
                <AppText weight="bold" size={FontSize.sm} color={T.headerText}>{item.value}</AppText>
              </View>
            ))}
          </View>

          {/* Dishes — two columns */}
          {dishes.length > 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: T.bgSurface, borderRadius: 18, borderWidth: 1, borderColor: T.borderDefault, padding: 18 }}>
              <AppText weight="bold" size={FontSize.sm} color={T.tabInactive} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>What's included</AppText>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Left column */}
                <View style={{ flex: 1, gap: 10 }}>
                  {leftDishes.map((dish, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.green, flexShrink: 0 }} />
                      <AppText weight="semibold" size={FontSize.sm} color={T.headerText}>{dish}</AppText>
                    </View>
                  ))}
                </View>
                {/* Right column */}
                {rightDishes.length > 0 && (
                  <View style={{ flex: 1, gap: 10 }}>
                    {rightDishes.map((dish, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.green, flexShrink: 0 }} />
                        <AppText weight="semibold" size={FontSize.sm} color={T.headerText}>{dish}</AppText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Calories */}
          {order.kcal != null && order.kcal > 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.bgSurface, borderRadius: 14, borderWidth: 1, borderColor: T.borderDefault, paddingHorizontal: 16, paddingVertical: 12 }}>
              <AppText size={18}>🔥</AppText>
              <AppText weight="bold" size={FontSize.md} color={T.headerText}>{order.kcal} kcal</AppText>
            </View>
          )}

          {/* Tags */}
          {(order.tags ?? []).length > 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(order.tags ?? []).map(tag => (
                <View key={tag} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault }}>
                  <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>{tag}</AppText>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {(isToday || isUpcoming) && onShowPass && (
              <TouchableOpacity
                onPress={() => { onClose(); onShowPass(); }}
                activeOpacity={0.88}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.headerText, borderRadius: 16, paddingVertical: 15 }}
              >
                <QRIcon color={T.bgApp} />
                <AppText weight="bold" size={FontSize.xl} color={T.bgApp}>Show Pickup Pass</AppText>
              </TouchableOpacity>
            )}

            {isPast && !order.hasFeedback && onFeedback && (
              <TouchableOpacity
                onPress={() => { onClose(); setTimeout(onFeedback, 300); }}
                activeOpacity={0.88}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.green, borderRadius: 16, paddingVertical: 15 }}
              >
                <StarIcon filled={false} size={18} />
                <AppText weight="bold" size={FontSize.xl} color={T.bgApp}>Rate this meal</AppText>
              </TouchableOpacity>
            )}

            {isPast && order.hasFeedback && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 }}>
                {[1,2,3,4,5].map(n => <StarIcon key={n} filled={(order.rating ?? 0) >= n} size={20} />)}
                <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginLeft: 6 }}>Rated</AppText>
              </View>
            )}

            {(isToday || isUpcoming) && onCancel && (
              <TouchableOpacity
                onPress={() => { onClose(); onCancel(); }}
                activeOpacity={0.88}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.error + '18', borderRadius: 16, paddingVertical: 13, borderWidth: 1, borderColor: T.error + '40' }}
              >
                <TrashIcon color={T.error} />
                <AppText weight="bold" size={FontSize.lg} color={T.error}>Cancel Order</AppText>
              </TouchableOpacity>
            )}

            {/* Reorder — only for cancelled orders still within booking window */}
            {order.status === 'cancelled' && onReorder && (
              <TouchableOpacity
                onPress={() => { onClose(); onReorder(); }}
                activeOpacity={0.88}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.green, borderRadius: 16, paddingVertical: 15 }}
              >
                <ReorderIcon color="#fff" />
                <AppText weight="bold" size={FontSize.xl} color="#fff">Reorder this meal</AppText>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  isDuplicate = false,
  onCancel,
  onShowPass,
  onRate,
  onFeedback,
  onRepeat,
  onReorder,
  noShowConfirming,
  onNoShowRequest,
  onNoShowConfirm,
  onNoShowDismiss,
}: {
  order: FoodOrder;
  isDuplicate?: boolean;
  onCancel?: () => void;
  onShowPass?: () => void;
  onRate?: (stars: number) => void;
  onFeedback?: () => void;
  onRepeat?: () => void;
  onReorder?: () => void;
  noShowConfirming?: boolean;
  onNoShowRequest?: () => void;
  onNoShowConfirm?: () => void;
  onNoShowDismiss?: () => void;
}) {
  const T = useMerckTokens();
  const isPast = order.status === 'past';
  const isToday = order.status === 'today';
  const isUpcoming = order.status === 'upcoming';

  const sBg = isToday ? T.green + '22' : isUpcoming ? T.accentAmber + '22' : isPast ? T.tabInactive + '22' : T.error + '22';
  const sColor = isToday ? T.green : isUpcoming ? T.accentAmber : isPast ? T.tabInactive : T.error;
  const sLabel = isToday ? 'Today' : isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Cancelled';

  return (
    <View style={{ backgroundColor: isDuplicate ? T.accentAmber + '08' : T.bgCard, borderWidth: 1.5, borderColor: isDuplicate ? T.accentAmber : T.borderDefault, borderRadius: 20, padding: 14, ...Shadow.sm }}>
      {isDuplicate && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <AppText size={12}>⚠️</AppText>
          <AppText weight="bold" size={FontSize['2xs']} color={T.accentAmber}>Duplicate booking — you have another {order.meal} on this day</AppText>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Meal type icon */}
        <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: T.green + '22', alignItems: 'center', justifyContent: 'center' }}>
          <AppText size={22}>{order.meal === 'Breakfast' ? '☀️' : order.meal === 'Lunch' ? '🌤️' : '🌙'}</AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppText weight="bold" size={FontSize.md} color={T.headerText} style={{ flex: 1 }} numberOfLines={1}>{order.option}</AppText>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexShrink: 0, backgroundColor: sBg }}>
              <AppText weight="bold" size={FontSize['2xs']} color={sColor}>{sLabel}</AppText>
            </View>
          </View>
          <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 3 }}>{orderDateLabel(order.dayOffset)} · {order.office}</AppText>
        </View>
        {/* "Not coming in today?" badge — top-right, no extra height */}
        {isToday && !isPast6PM() && onNoShowRequest && !noShowConfirming && (
          <TouchableOpacity
            onPress={onNoShowRequest}
            activeOpacity={0.75}
            style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault }}
          >
            <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive}>Not coming?</AppText>
          </TouchableOpacity>
        )}
        {/* Swipe hint — chevron only, no background, no text */}
        {(isToday || isUpcoming) && !onNoShowRequest && (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 6l6 6-6 6" stroke={T.tabInactive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
        {isPast && onRepeat && (
          <TouchableOpacity onPress={onRepeat} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, borderWidth: 1, borderColor: T.green, backgroundColor: T.green + '15' }}>
            <RepeatIcon color={T.green} />
            <AppText weight="bold" size={FontSize.xs} color={T.green}>Repeat</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Reorder button for cancelled orders still within booking window */}
      {order.status === 'cancelled' && onReorder && (
        <View style={{ marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: T.borderDefault }}>
          <TouchableOpacity
            onPress={onReorder}
            activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12, backgroundColor: T.green, ...Shadow.sm }}
          >
            <ReorderIcon color="#fff" />
            <AppText weight="bold" size={FontSize.md} color="#fff">Reorder — {order.meal} · {orderDateLabel(order.dayOffset)}</AppText>
          </TouchableOpacity>
        </View>
      )}

      {isPast && (
        <View style={{ marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: T.borderDefault }}>
          {order.hasFeedback ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <StarIcon key={n} filled={(order.rating ?? 0) >= n} />
              ))}
              <View style={{ backgroundColor: T.green + '22', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, marginLeft: 4 }}>
                <AppText weight="bold" size={FontSize.xs} color={T.green}>Feedback submitted</AppText>
              </View>
            </View>
          ) : onFeedback ? (
            <TouchableOpacity
              onPress={onFeedback}
              activeOpacity={0.8}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: T.green + '18', borderWidth: 1, borderColor: T.green + '40' }}
            >
              <StarIcon filled={false} size={16} />
              <AppText weight="bold" size={FontSize.sm} color={T.green}>Rate this meal</AppText>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Confirm strip — only shown when confirming no-show, no height added otherwise */}
      {isToday && !isPast6PM() && noShowConfirming && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: T.borderDefault }}>
          <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ flex: 1 }}>
            Cancel today's {order.meal}? You won't be charged.
          </AppText>
          <TouchableOpacity onPress={onNoShowConfirm} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: T.error + '22' }}>
            <AppText weight="bold" size={FontSize.xs} color={T.error}>Cancel it</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNoShowDismiss} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: T.bgSurface }}>
            <AppText weight="bold" size={FontSize.xs} color={T.tabInactive}>Keep</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Today's Menu Card ─────────────────────────────────────────────────────────

function TodayMenuCard({ slots }: { slots: { mealType: MealType; time: string; options: FoodOption[] }[] }) {
  const T = useMerckTokens();
  const [expanded, setExpanded] = React.useState(false);
  const chevronRotate = useSharedValue(0);
  const bodyOpacity = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotate.value}deg` }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
  }));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    chevronRotate.value = withSpring(next ? 180 : 0, { damping: 16, stiffness: 200 });
    bodyOpacity.value = next
      ? withTiming(1, { duration: 200 })
      : withTiming(0, { duration: 120 });
  };

  if (!slots.length) return null;

  const MEAL_EMOJI: Record<MealType, string> = { Breakfast: '☀️', Lunch: '🌤️', Dinner: '🌙' };

  return (
    <View style={{ backgroundColor: T.bgCard, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 18, marginBottom: 12, overflow: 'hidden', ...Shadow.sm }}>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}
      >
        <View style={{ flex: 1 }}>
          <AppText weight="bold" size={FontSize.md} color={T.headerText}>Today's Menu</AppText>
          {!expanded && (
            <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 2 }}>
              {slots.map(s => s.mealType).join(' · ')}
            </AppText>
          )}
        </View>
        <Animated.View style={chevronStyle}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="m6 9 6 6 6-6" stroke={T.tabInactive} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View style={[{ borderTopWidth: 1, borderTopColor: T.borderDefault }, bodyStyle]}>
          {slots.map((slot, si) => (
            <View key={slot.mealType} style={{ borderTopWidth: si === 0 ? 0 : 1, borderTopColor: T.borderDefault, paddingHorizontal: 14, paddingVertical: 11 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AppText size={16}>{MEAL_EMOJI[slot.mealType]}</AppText>
                <AppText weight="bold" size={FontSize.sm} color={T.headerText}>{slot.mealType}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                  <ClockIcon color={T.tabInactive} />
                  <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>{slot.time}</AppText>
                </View>
              </View>
              <View style={{ gap: 7 }}>
                {slot.options.map(opt => (
                  <View key={opt.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}>
                    <View style={{ marginTop: 3 }}>
                      <VegDot isNonVeg={opt.isNonVeg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText weight="bold" size={FontSize.sm} color={T.headerText}>{opt.name}</AppText>
                      <AppText weight="medium" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 1 }} numberOfLines={2}>{opt.dishes}</AppText>
                    </View>
                    <View style={{ backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, marginTop: 2 }}>
                      <AppText weight="bold" size={FontSize['2xs']} color={T.tabInactive}>{opt.kcal} kcal</AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

// ── Reminder Sheet ────────────────────────────────────────────────────────────

function ReminderSheet({
  visible,
  onClose,
  onSet,
}: {
  visible: boolean;
  onClose: () => void;
  onSet: (time: Date) => void;
}) {
  const T = useMerckTokens();
  const [pickerTime, setPickerTime] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = React.useState(Platform.OS === 'ios');

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{
        backgroundColor: T.bgSurface,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
        borderTopWidth: 1, borderColor: T.borderDefault,
      }}>
        {/* Handle */}
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.borderDefault, alignSelf: 'center', marginBottom: 20 }} />

        <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 4 }}>
          Set a Meal Reminder
        </AppText>
        <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ marginBottom: 24 }}>
          We'll remind you to book before the 6 PM cutoff.
        </AppText>

        {/* Time display row */}
        {Platform.OS === 'android' && (
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: T.bgApp, borderRadius: 14, borderWidth: 1, borderColor: T.borderDefault,
              paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20,
            }}
          >
            <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>Remind me at</AppText>
            <AppText weight="bold" size={FontSize.md} color={T.green}>
              {pickerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </AppText>
          </TouchableOpacity>
        )}

        {(Platform.OS === 'ios' || showPicker) && (
          <DateTimePicker
            value={pickerTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_e, date) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (date) setPickerTime(date);
            }}
            textColor={T.headerText}
            style={{ marginBottom: Platform.OS === 'ios' ? 20 : 0 }}
          />
        )}

        <TouchableOpacity
          onPress={() => onSet(pickerTime)}
          activeOpacity={0.85}
          style={{
            backgroundColor: T.green, borderRadius: 14,
            paddingVertical: 14, alignItems: 'center', marginBottom: 12,
          }}
        >
          <AppText weight="bold" size={FontSize.md} color="#fff">Set Reminder</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ alignItems: 'center', paddingVertical: 10 }}>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>Cancel</AppText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ── Cutoff Reminder Banner ────────────────────────────────────────────────────

function useCutoffCountdown(): string | null {
  const [label, setLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    function compute() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      // Only show between 15:00 and 17:59 (3 PM – 6 PM)
      if (h < 15 || h >= 18) return null;
      const totalMinutesLeft = (18 * 60) - (h * 60 + m);
      const hoursLeft = Math.floor(totalMinutesLeft / 60);
      const minsLeft = totalMinutesLeft % 60;
      if (hoursLeft > 0) return `${hoursLeft}h ${minsLeft}m`;
      return `${minsLeft}m`;
    }

    setLabel(compute());
    const id = setInterval(() => setLabel(compute()), 60_000);
    return () => clearInterval(id);
  }, []);

  return label;
}

function CutoffBanner({
  hasTomorrowOrder,
  onDismiss,
  onRemindMe,
}: {
  hasTomorrowOrder: boolean;
  onDismiss: () => void;
  onRemindMe: () => void;
}) {
  const T = useMerckTokens();
  const countdown = useCutoffCountdown();

  if (!countdown || hasTomorrowOrder) return null;

  return (
    <View style={{ backgroundColor: T.accentAmber + '18', borderWidth: 1, borderColor: T.accentAmber + '55', borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ClockIcon color={T.accentAmber} />
        <View style={{ flex: 1 }}>
          <AppText weight="bold" size={FontSize.sm} color={T.accentAmber}>Order closes in {countdown}</AppText>
          <AppText weight="semibold" size={FontSize.xs} color={T.accentAmber} style={{ opacity: 0.75, marginTop: 1 }}>Book tomorrow's meal before 6:00 PM cutoff</AppText>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CloseIcon color={T.accentAmber} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onRemindMe}
        activeOpacity={0.8}
        style={{
          marginTop: 8,
          backgroundColor: T.accentAmber + '22',
          borderWidth: 1, borderColor: T.accentAmber + '55',
          borderRadius: 10,
          paddingVertical: 7, paddingHorizontal: 12,
          flexDirection: 'row', alignItems: 'center', gap: 6,
          alignSelf: 'flex-start',
        }}
      >
        <AppText style={{ fontSize: 13 }}>🔔</AppText>
        <AppText weight="bold" size={FontSize.xs} color={T.accentAmber}>Remind Me</AppText>
      </TouchableOpacity>
    </View>
  );
}

// ── Top-level segment ─────────────────────────────────────────────────────────

type FoodView = 'order' | 'orders';

function SegmentControl({ active, onChange, heroMode = false }: { active: FoodView; onChange: (v: FoodView) => void; heroMode?: boolean }) {
  const T = useMerckTokens();
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: heroMode ? 'rgba(255,255,255,0.12)' : T.bgSurface,
      borderWidth: 1,
      borderColor: heroMode ? 'rgba(255,255,255,0.2)' : T.borderDefault,
      borderRadius: 14,
      padding: 4,
    }}>
      {(['order', 'orders'] as FoodView[]).map(v => (
        <TouchableOpacity
          key={v}
          onPress={() => onChange(v)}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: active === v ? (heroMode ? '#fff' : T.green) : 'transparent' }}
          activeOpacity={0.8}
        >
          <AppText weight="semibold" size={FontSize.md} color={
            active === v
              ? (heroMode ? '#0F3D2E' : T.bgApp)
              : (heroMode ? 'rgba(255,255,255,0.7)' : T.tabInactive)
          }>
            {v === 'order' ? 'Order' : 'My Orders'}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Adapter: convert API order → local FoodOrder shape ────────────────────────

function toLocalOrder(o: ApiFoodOrder) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const orderDate = new Date(o.dateKey);
  const todayDate = new Date(todayKey);
  const diffMs = orderDate.getTime() - todayDate.getTime();
  const dayOffset = Math.round(diffMs / (1000 * 60 * 60 * 24));

  type LocalStatus = 'upcoming' | 'today' | 'past' | 'cancelled';
  let status: LocalStatus = 'upcoming';
  if (o.status === 'cancelled') status = 'cancelled';
  else if (dayOffset === 0) status = 'today';
  else if (dayOffset < 0) status = 'past';

  return {
    id: o._id,
    dayOffset,
    meal: o.mealType,
    option: o.mealName,
    price: o.price,
    status,
    office: o.office,
    checkedIn: o.checkedIn,
    rating: o.rating,
    hasFeedback: !!o.feedback?.submittedAt,
    // Populated meal details
    dishes:   typeof o.mealId === 'object' ? (o.mealId as any).dishes   : undefined,
    kcal:     typeof o.mealId === 'object' ? (o.mealId as any).kcal     : undefined,
    tags:     typeof o.mealId === 'object' ? (o.mealId as any).tags     : undefined,
    isNonVeg: typeof o.mealId === 'object' ? (o.mealId as any).isNonVeg : undefined,
    dateKey:  o.dateKey,
  };
}

// ── Meal time/order constants ─────────────────────────────────────────────────

const MEAL_TIMES: Record<string, string> = { Breakfast: '8:00 – 10:00 AM', Lunch: '12:00 – 2:00 PM', Dinner: '7:00 – 9:00 PM' };
const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

function groupMeals(meals: ApiMeal[]) {
  const grouped: Record<string, FoodOption[]> = {};
  meals
    .filter(m => m.isAvailable)
    .forEach(m => {
      if (!grouped[m.mealType]) grouped[m.mealType] = [];
      grouped[m.mealType].push({
        id: m._id,
        name: m.name,
        dishes: m.dishes,
        kcal: m.kcal ?? 0,
        price: m.price,
        tags: m.tags,
        isNonVeg: m.isNonVeg,
      });
    });
  return (MEAL_ORDER as string[])
    .filter(t => grouped[t]?.length)
    .map(t => ({ mealType: t as MealType, time: MEAL_TIMES[t], options: grouped[t] }));
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function FoodScreen() {
  const T = useMerckTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<FoodStackParamList>>();
  const bookingOffsets = React.useMemo(() => getNextWeekdayOffsets(), []);
  const [view, setView] = useState<FoodView>('order');
  const [office, setOffice] = useState<OfficeId>('MGCC');
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState<number>(bookingOffsets[0]);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [passOrderId, setPassOrderId] = useState<string | null>(null);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [feedbackMealName, setFeedbackMealName] = useState('');
  const [detailOrder, setDetailOrder] = useState<FoodOrder | null>(null);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('veg');
  const [cancelTarget, setCancelTarget] = useState<{ id: string; meal: MealType; dateLabel: string } | null>(null);

  const openCancelSheet = useCallback((id: string, meal: MealType, dayOffset: number) => {
    setCancelTarget({ id, meal, dateLabel: orderDateLabel(dayOffset) });
  }, []);

  // ── GPS + offices ──────────────────────────────────────────────────────────
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const locationFetched = useRef(false);

  const { data: allOffices = [] } = useOffices();
  const { data: nearestOffice } = useNearestOffice(coords?.lat ?? null, coords?.lng ?? null);

  // Request location on mount and auto-select nearest office
  useEffect(() => {
    if (locationFetched.current) return;
    locationFetched.current = true;

    const requestLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      setLocating(true);
      Geolocation.getCurrentPosition(
        pos => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: false, timeout: 8000 },
      );
    };
    requestLocation();
  }, []);

  // Auto-select nearest office once GPS + offices resolve
  useEffect(() => {
    if (nearestOffice?.id) {
      setOffice(nearestOffice.id);
    }
  }, [nearestOffice?.id]);

  // ── API hooks ──────────────────────────────────────────────────────────────
  const todayDateKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const selectedDateKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [selectedOffset]);

  const { data: mealsForDate = [], isLoading: menuLoading, isFetching: menuFetching, refetch: refetchMenu } = useMealsByDate(selectedDateKey);
  const { data: todayMeals = [] } = useMealsByDate(todayDateKey);
  const { data: apiOrders = [], isLoading: ordersLoading } = useMyOrders();
  const placeBulkMutation = usePlaceBulkOrders();
  const cancelMutation = useCancelOrder();
  const rateMutation = useRateOrder();

  const orders = useMemo(() => apiOrders.map(toLocalOrder), [apiOrders]);

  const locked = isOffsetLocked(selectedOffset);

  const cartMap = useMemo(() => {
    const m: Record<string, FoodOption> = {};
    cart.forEach(e => { m[`${e.dayOffset}|${e.meal}`] = e.option; });
    return m;
  }, [cart]);

  const cartCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    cart.forEach(e => { counts[e.dayOffset] = (counts[e.dayOffset] ?? 0) + 1; });
    return counts;
  }, [cart]);

  const menuDataRaw = useMemo(() => groupMeals(mealsForDate), [mealsForDate]);
  const menuData = useMemo(() => {
    if (dietFilter === 'all') return menuDataRaw;
    return menuDataRaw
      .map(slot => ({
        ...slot,
        options: slot.options.filter(o => dietFilter === 'veg' ? !o.isNonVeg : o.isNonVeg),
      }))
      .filter(slot => slot.options.length > 0);
  }, [menuDataRaw, dietFilter]);
  const todayMenuData = useMemo(() => groupMeals(todayMeals), [todayMeals]);

  const handleSelectOption = useCallback((meal: MealType, opt: FoodOption) => {
    if (locked) return;

    // Count existing confirmed orders for this day+meal (already placed)
    const existingCount = orders.filter(
      o => o.dayOffset === selectedOffset && o.meal === meal &&
           (o.status === 'upcoming' || o.status === 'today'),
    ).length;

    // Count items already in cart for this day+meal
    const inCartCount = cart.filter(
      e => e.dayOffset === selectedOffset && e.meal === meal,
    ).length;

    const isAlreadyInCart = cart.some(
      e => e.dayOffset === selectedOffset && e.meal === meal && e.option.id === opt.id,
    );

    // Removing — always allow
    if (isAlreadyInCart) {
      setCart(prev => prev.filter(
        e => !(e.dayOffset === selectedOffset && e.meal === meal && e.option.id === opt.id),
      ));
      return;
    }

    const totalAfterAdd = existingCount + inCartCount + 1;

    // Hard limit: max 2 per meal type per day (existing + cart combined)
    if (totalAfterAdd > 2) {
      Alert.alert(
        'Maximum reached',
        `You can only book up to 2 ${meal} meals per day.`,
        [{ text: 'OK' }],
      );
      return;
    }

    const doAdd = () => {
      setCart(prev => [
        ...prev.filter(e => !(e.dayOffset === selectedOffset && e.meal === meal && e.option.id === opt.id)),
        { dayOffset: selectedOffset, meal, option: opt },
      ]);
    };

    // Warn if they already have one (existing or in cart) before adding a second
    if (totalAfterAdd === 2) {
      const dayLabel = selectedOffset === 1 ? 'tomorrow' : dayOffsetLabel(selectedOffset);
      const existingName = existingCount > 0
        ? orders.find(o => o.dayOffset === selectedOffset && o.meal === meal && (o.status === 'upcoming' || o.status === 'today'))?.option
        : cart.find(e => e.dayOffset === selectedOffset && e.meal === meal)?.option.name;
      setAddSecondModal({
        variant: 'confirm',
        title: `Add a second ${meal}?`,
        message: `You already have "${existingName}" booked for ${dayLabel} ${meal.toLowerCase()}. Add "${opt.name}" as well?`,
        confirmLabel: 'Add anyway',
        cancelLabel: 'Cancel',
        onConfirm: doAdd,
      });
      return;
    }

    doAdd();
  }, [locked, selectedOffset, orders, cart, setAddSecondModal]);

  const handleRemoveCartItem = useCallback((dayOffset: number, meal: MealType) => {
    setCart(prev => prev.filter(e => !(e.dayOffset === dayOffset && e.meal === meal)));
  }, []);

  const handleClearCart = useCallback(() => setCart([]), []);

  const handleConfirm = useCallback(async () => {
    const today = new Date();
    const items = cart.map(e => {
      const d = new Date(today);
      d.setDate(today.getDate() + e.dayOffset);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return { mealId: e.option.id, dateKey, mealType: e.meal, office };
    });
    try {
      await placeBulkMutation.mutateAsync({ orders: items });
      setCart([]);
      setReviewVisible(false);
      setView('orders');
      // Sync FCM token so backend can send pickup-ready push for this order
      syncFCMTokenToBackend(token => registerFCMToken(token).then(() => {})).catch(() => {});
    } catch {
      // error surfaced by TanStack Query; keep sheet open
    }
  }, [cart, office, placeBulkMutation]);

  const handleCancelOrder = useCallback((id: string) => {
    cancelMutation.mutate(id);
  }, [cancelMutation]);

  const handleRate = useCallback((id: string, stars: number) => {
    rateMutation.mutate({ orderId: id, rating: stars });
  }, [rateMutation]);

  const [repeatNotice, setRepeatNotice] = useState<string | null>(null);
  const [addSecondModal, setAddSecondModal] = useState<ModalConfig | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [noShowConfirmId, setNoShowConfirmId] = useState<string | null>(null);
  const [reminderSheetVisible, setReminderSheetVisible] = useState(false);

  const { isReminderActive, reminderTime, notifeeId, setReminder, clearReminder } = useFoodReminderStore();

  const reminderLabel = useMemo(() => {
    if (!isReminderActive || !reminderTime) return null;
    const d = new Date(reminderTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [isReminderActive, reminderTime]);

  const handleSetReminder = useCallback(async (time: Date) => {
    try {
      const id = await scheduleFoodReminder(time);
      setReminder(time, id);
      setReminderSheetVisible(false);
    } catch {
      Alert.alert('Could not set reminder', 'Please check notification permissions in Settings.');
    }
  }, [setReminder]);

  const handleCancelReminder = useCallback(async () => {
    if (notifeeId) {
      await cancelFoodReminder(notifeeId).catch(() => {});
    }
    clearReminder();
  }, [notifeeId, clearReminder]);

  const hasTomorrowOrder = useMemo(
    () => orders.some(o => o.dayOffset === 1 && (o.status === 'upcoming' || o.status === 'today')),
    [orders],
  );

  const handleRepeatOrder = useCallback((order: FoodOrder) => {
    // Find the option in the current menu data (may have shifted offsets)
    // We match by name since IDs could differ across days
    const targetMeal = order.meal;

    // Find next available slot: unlocked offset that isn't already in cart or confirmed orders
    const confirmedMealDays = new Set(
      orders
        .filter(o => o.status === 'today' || o.status === 'upcoming')
        .map(o => `${o.dayOffset}|${o.meal}`),
    );

    const targetOffset = bookingOffsets.find(off => {
      if (isOffsetLocked(off)) return false;
      if (confirmedMealDays.has(`${off}|${targetMeal}`)) return false;
      const cartKey = `${off}|${targetMeal}`;
      return !cart.some(e => `${e.dayOffset}|${e.meal}` === cartKey);
    });

    if (targetOffset === undefined) {
      setRepeatNotice(`No open slots for ${targetMeal}`);
      setTimeout(() => setRepeatNotice(null), 2500);
      return;
    }

    // Find a matching option in the menu for that offset — same name preferred, else first option
    const slot = menuData.find(s => s.mealType === targetMeal);
    const matchedOpt = slot?.options.find(o => o.name === order.option) ?? slot?.options[0];

    if (!matchedOpt) {
      setRepeatNotice(`${targetMeal} menu not available`);
      setTimeout(() => setRepeatNotice(null), 2500);
      return;
    }

    setCart(prev => {
      const filtered = prev.filter(e => !(e.dayOffset === targetOffset && e.meal === targetMeal));
      return [...filtered, { dayOffset: targetOffset, meal: targetMeal, option: matchedOpt }];
    });
    setSelectedOffset(targetOffset);
    setView('order');
  }, [bookingOffsets, cart, menuData, orders]);

  // Reorder a cancelled order — only if the day offset is still bookable
  const handleReorder = useCallback((order: FoodOrder) => {
    // Check the cancelled order's original day is still in the booking window and not locked
    const isStillBookable = bookingOffsets.includes(order.dayOffset) && !isOffsetLocked(order.dayOffset);
    if (!isStillBookable) return; // guard — button shouldn't appear if not bookable

    // Find matching option in today's menu for that day — same meal type
    const slot = menuData.find(s => s.mealType === order.meal);
    const matchedOpt = slot?.options.find(o => o.name === order.option) ?? slot?.options[0];

    setSelectedOffset(order.dayOffset);

    if (matchedOpt) {
      // Pre-fill the cart with the same item so user lands ready to checkout
      setCart(prev => {
        const filtered = prev.filter(e => !(e.dayOffset === order.dayOffset && e.meal === order.meal && e.option.id === matchedOpt.id));
        return [...filtered, { dayOffset: order.dayOffset, meal: order.meal, option: matchedOpt }];
      });
    }

    setView('order');
  }, [bookingOffsets, menuData]);

  const applyDietFilter = useCallback((list: FoodOrder[]) => {
    if (dietFilter === 'veg')    return list.filter(o => !o.isNonVeg);
    if (dietFilter === 'nonveg') return list.filter(o => o.isNonVeg);
    return list;
  }, [dietFilter]);

  const upcoming = useMemo(
    () => applyDietFilter(orders.filter(o => o.status === 'today' || o.status === 'upcoming')),
    [orders, applyDietFilter],
  );
  const past = useMemo(
    () => applyDietFilter(orders.filter(o => o.status === 'past')),
    [orders, applyDietFilter],
  );
  const cancelled = useMemo(
    () => applyDietFilter(orders.filter(o => o.status === 'cancelled')),
    [orders, applyDietFilter],
  );

  const passOrder = useMemo(
    () => passOrderId ? orders.find(o => o.id === passOrderId) ?? null : null,
    [passOrderId, orders],
  );

  const officeAddr = allOffices.find(o => o.id === office)?.address ?? '';

  // Hero height: status bar + content area
  const HERO_H = insets.top + 200;

  return (
    <View style={[s.root, { backgroundColor: T.bgApp }]}>
      {/* ── Full-bleed hero behind status bar ─────────────────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HERO_H, zIndex: 2 }} pointerEvents="box-none">
        {/* Dark cafeteria gradient — mimics photo ambiance from design */}
        <LinearGradient
          colors={['#0A1A0F', '#0F2E1C', '#0F3D2E', '#0A4A30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {/* Texture blobs for depth */}
        <View style={{ position: 'absolute', top: -30, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,138,99,0.18)' }} />
        <View style={{ position: 'absolute', bottom: 20, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(0,100,60,0.12)' }} />
        <View style={{ position: 'absolute', top: insets.top + 20, right: 20, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.04)' }} />

        {/* Bottom dark fade so segment control is readable */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 }}
        />

        {/* Content inside hero */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
          {/* Top row: location label + office switcher + bell */}
          <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText weight="bold" size={FontSize['2xs']} color="rgba(255,255,255,0.65)" style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }} numberOfLines={1}>
                Cafeteria · {allOffices.find(o => o.id === office)?.city ?? office}
              </AppText>
              <AppText weight="bold" size={28} color="#fff" letterSpacing={-0.5} style={{ lineHeight: 32 }} numberOfLines={1}>{office}</AppText>
              <AppText weight="semibold" size={FontSize.xs} color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>
                Fresh meals, pre-booked. Order by 6 PM for tomorrow.
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
              <OfficeSwitcher active={office} offices={allOffices} onOpenPicker={() => setLocationPickerVisible(true)} />
              <TouchableOpacity
                onPress={() => setReminderSheetVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: isReminderActive ? 'rgba(0,200,120,0.22)' : 'rgba(255,255,255,0.12)',
                  borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
                  borderWidth: 1, borderColor: isReminderActive ? 'rgba(0,200,120,0.45)' : 'rgba(255,255,255,0.2)',
                }}
              >
                <AppText style={{ fontSize: 12 }}>🔔</AppText>
                <AppText weight="bold" size={11} color={isReminderActive ? '#4ade80' : 'rgba(255,255,255,0.85)'}>
                  {isReminderActive && reminderLabel ? reminderLabel : 'Remind'}
                </AppText>
              </TouchableOpacity>
              <NotificationBell color="#fff" size={22} />
            </View>
          </View>

          {/* Segment control at bottom of hero */}
          <View style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
            <SegmentControl active={view} onChange={setView} heroMode />
          </View>
        </View>
      </View>

      {/* ── Order View ────────────────────────────────────────────────────── */}
      {view === 'order' && (
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scrollContent, { paddingTop: HERO_H + 8 }]}
          refreshControl={
            <RefreshControl
              refreshing={menuFetching && !menuLoading}
              onRefresh={refetchMenu}
              tintColor={MERCK_TOKENS.green}
              colors={[MERCK_TOKENS.green]}
            />
          }
        >
          {/* Diet filter */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {([
              { key: 'all',    label: 'All' },
              { key: 'veg',    label: '🥗 Veg' },
              { key: 'nonveg', label: '🍖 Non-Veg' },
            ] as const).map(f => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setDietFilter(f.key)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: dietFilter === f.key ? T.green : T.bgSurface,
                  borderWidth: 1,
                  borderColor: dietFilter === f.key ? T.green : T.borderDefault,
                }}
              >
                <AppText weight="bold" size={FontSize.sm} color={dietFilter === f.key ? T.bgApp : T.tabInactive}>
                  {f.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's menu preview */}
          <TodayMenuCard slots={todayMenuData} />

          {/* Active reminder pill */}
          {isReminderActive && reminderLabel && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: T.green + '18', borderWidth: 1, borderColor: T.green + '55',
              borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, marginBottom: 10,
            }}>
              <AppText style={{ fontSize: 14 }}>🔔</AppText>
              <AppText weight="semibold" size={FontSize.sm} color={T.green} style={{ flex: 1 }}>
                Reminder set for {reminderLabel}
              </AppText>
              <TouchableOpacity onPress={handleCancelReminder} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <CloseIcon color={T.green} />
              </TouchableOpacity>
            </View>
          )}

          {/* Cutoff reminder banner */}
          {!bannerDismissed && (
            <CutoffBanner
              hasTomorrowOrder={hasTomorrowOrder}
              onDismiss={() => setBannerDismissed(true)}
              onRemindMe={() => setReminderSheetVisible(true)}
            />
          )}

          {/* Day picker */}
          <DayPicker
            selectedOffset={selectedOffset}
            cartCounts={cartCounts}
            bookingOffsets={bookingOffsets}
            onSelect={setSelectedOffset}
          />

          {/* Day heading + cutoff */}
          <View style={s.dayHeadRow}>
            <View>
              <AppText weight="bold" size={FontSize.xl} color={T.headerText}>
                {selectedOffset === 1 ? 'Tomorrow' : dayOffsetLabel(selectedOffset) + ', ' + dayOffsetDate(selectedOffset) + ' ' + dayOffsetMonth(selectedOffset)}
              </AppText>
              <View style={s.cutoffRow}>
                <ClockIcon color={T.tabInactive} />
                <AppText weight="bold" size={FontSize.xs} color={T.tabInactive}>{cutoffLabel(selectedOffset)}</AppText>
              </View>
            </View>
            {cart.length > 0 && !locked && (
              <TouchableOpacity onPress={handleClearCart} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.error + '22', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 11 }}>
                <TrashIcon color={T.error} />
                <AppText weight="bold" size={FontSize.sm} color={T.error}>Clear all</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Locked notice */}
          {locked && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 }}>
              <LockIcon />
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ flex: 1 }}>Booking closed for {selectedOffset === 1 ? 'tomorrow' : dayOffsetLabel(selectedOffset)} — cutoff was 6:00 PM</AppText>
            </View>
          )}

          {/* Meal section cards */}
          <View style={s.mealCards}>
            {menuLoading && (
              <ActivityIndicator color={MERCK_TOKENS.green} style={{ marginTop: 24 }} />
            )}
            {!menuLoading && menuData.length === 0 && (
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ marginTop: 32 }}>
                No meals available for this day
              </AppText>
            )}
            {menuData.map(slot => {
              const existingForSlot = orders.filter(
                o => o.dayOffset === selectedOffset && o.meal === slot.mealType &&
                     (o.status === 'upcoming' || o.status === 'today'),
              );
              return (
                <MealSectionCard
                  key={slot.mealType}
                  slot={slot}
                  selectedOptionId={cartMap[`${selectedOffset}|${slot.mealType}`]?.id ?? null}
                  existingOrderNames={existingForSlot.map(o => o.option)}
                  locked={locked}
                  onSelect={opt => handleSelectOption(slot.mealType, opt)}
                />
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── My Orders View ────────────────────────────────────────────────── */}
      {view === 'orders' && (
        ordersLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={MERCK_TOKENS.green} />
          </View>
        ) : (
          <SectionList
            style={s.scroll}
            contentContainerStyle={[s.scrollContent, { paddingBottom: 40, paddingTop: 0 }]}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            keyExtractor={item => item.id}
            sections={[
              ...(upcoming.length > 0 ? [{ title: 'Upcoming', data: upcoming }] : []),
              ...(past.length > 0    ? [{ title: 'Past meals', data: past }]    : []),
              ...(cancelled.length > 0 ? [{ title: `Cancelled (${cancelled.length})`, data: cancelled }] : []),
            ]}
            ListHeaderComponent={
              <View style={{ paddingTop: HERO_H + 8, marginBottom: 8 }}>
                {/* View all orders link */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllOrders')}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginBottom: 10 }}
                >
                  <AppText weight="bold" size={FontSize.sm} color={T.green}>View all orders</AppText>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="m9 6 6 6-6 6" stroke={T.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <View style={[s.emptyState, { paddingHorizontal: 16 }]}>
                <AppText size={FontSize.md} color={T.tabInactive}>
                  {dietFilter === 'all' ? 'No orders yet' : `No ${dietFilter === 'veg' ? 'veg' : 'non-veg'} orders`}
                </AppText>
              </View>
            }
            renderSectionHeader={({ section }) => (
              <AppText
                weight="bold"
                size={FontSize.xl}
                color={section.title.startsWith('Cancelled') ? T.tabInactive : T.headerText}
                style={{ marginBottom: 10, marginTop: section.title === 'Upcoming' ? 0 : 20, paddingHorizontal: 0 }}
              >
                {section.title}
              </AppText>
            )}
            renderItem={({ item: o, section }) => {
              const isCancelled = o.status === 'cancelled';
              // Duplicate = another active order exists for same day + meal type
              const isDuplicate = !isCancelled && orders.filter(
                x => x.id !== o.id &&
                     x.dayOffset === o.dayOffset &&
                     x.meal === o.meal &&
                     (x.status === 'upcoming' || x.status === 'today'),
              ).length > 0;

              // ── right swipe actions (revealed on swipe left→right = left edge)
              // ── Swipe LEFT → QR Pass + Cancel (upcoming/today only)
              const isReorderable = isCancelled &&
                bookingOffsets.includes(o.dayOffset) &&
                !isOffsetLocked(o.dayOffset);

              const renderSwipeLeft = () => {
                // Cancelled + reorderable → show Reorder on swipe left
                if (isCancelled) {
                  if (!isReorderable) return null;
                  return (
                    <TouchableOpacity
                      onPress={() => handleReorder(o)}
                      style={{ width: 90, backgroundColor: T.green, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginLeft: 8, marginVertical: 2 }}
                    >
                      <ReorderIcon color="#fff" />
                      <AppText weight="bold" size={FontSize['2xs']} color="#fff" style={{ marginTop: 4 }}>Reorder</AppText>
                    </TouchableOpacity>
                  );
                }
                if (o.status === 'past') return null;
                const windowPassed = o.status === 'today' && isTodayMealWindowPassed(o.meal);
                return (
                  <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8, marginVertical: 2 }}>
                    <TouchableOpacity
                      onPress={() => { setPassOrderId(o.id); setPassVisible(true); }}
                      style={{ width: 76, backgroundColor: T.green, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}
                    >
                      <QRIcon color="#fff" />
                      <AppText weight="bold" size={FontSize['2xs']} color="#fff" style={{ marginTop: 4 }}>QR Pass</AppText>
                    </TouchableOpacity>
                    {/* Cancel hidden when: today's window passed OR upcoming next-day cutoff passed */}
                    {!windowPassed && !isOffsetLocked(o.dayOffset) && (
                      <TouchableOpacity
                        onPress={() => openCancelSheet(o.id, o.meal, o.dayOffset)}
                        style={{ width: 76, backgroundColor: T.error, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}
                      >
                        <TrashIcon color="#fff" />
                        <AppText weight="bold" size={FontSize['2xs']} color="#fff" style={{ marginTop: 4 }}>Cancel</AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              };

              // ── Swipe RIGHT → Rate (past orders without feedback only)
              const renderSwipeRight = () => {
                if (isCancelled || o.status !== 'past' || o.hasFeedback) return null;
                return (
                  <TouchableOpacity
                    onPress={() => { setFeedbackOrderId(o.id); setFeedbackMealName(o.option); }}
                    style={{ width: 76, backgroundColor: T.accentAmber, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginRight: 8, marginVertical: 2 }}
                  >
                    <StarIcon filled={false} size={20} />
                    <AppText weight="bold" size={FontSize['2xs']} color="#fff" style={{ marginTop: 4 }}>Rate</AppText>
                  </TouchableOpacity>
                );
              };

              const card = (
                <TouchableOpacity
                  onPress={() => isReorderable ? handleReorder(o) : setDetailOrder(o)}
                  activeOpacity={0.85}
                >
                  <OrderCard
                    order={o}
                    isDuplicate={isDuplicate}
                    onCancel={
                      !isCancelled &&
                      o.status !== 'past' &&
                      !isOffsetLocked(o.dayOffset) &&
                      !(o.status === 'today' && isTodayMealWindowPassed(o.meal))
                        ? () => openCancelSheet(o.id, o.meal, o.dayOffset)
                        : undefined
                    }
                    onShowPass={(o.status === 'today' || o.status === 'upcoming') ? () => { setPassOrderId(o.id); setPassVisible(true); } : undefined}
                    onRate={o.status === 'past' ? (stars => handleRate(o.id, stars)) : undefined}
                    onFeedback={(o.status === 'past' && !o.hasFeedback) ? () => { setFeedbackOrderId(o.id); setFeedbackMealName(o.option); } : undefined}
                    onRepeat={o.status === 'past' ? () => handleRepeatOrder(o) : undefined}
                    onReorder={
                      o.status === 'cancelled' &&
                      bookingOffsets.includes(o.dayOffset) &&
                      !isOffsetLocked(o.dayOffset)
                        ? () => handleReorder(o)
                        : undefined
                    }
                    noShowConfirming={noShowConfirmId === o.id}
                    onNoShowRequest={o.status === 'today' ? () => setNoShowConfirmId(o.id) : undefined}
                    onNoShowConfirm={() => { handleCancelOrder(o.id); setNoShowConfirmId(null); }}
                    onNoShowDismiss={() => setNoShowConfirmId(null)}
                  />
                </TouchableOpacity>
              );

              // Static for non-reorderable cancelled orders
              if (isCancelled && !isReorderable) {
                return <View style={{ marginBottom: 10, opacity: 0.75 }}>{card}</View>;
              }

              return (
                <Swipeable
                  renderRightActions={renderSwipeLeft}
                  renderLeftActions={renderSwipeRight}
                  overshootRight={false}
                  overshootLeft={false}
                  containerStyle={{ marginBottom: 10, opacity: isCancelled ? 0.85 : 1, backgroundColor: 'transparent' }}
                  childrenContainerStyle={{ backgroundColor: 'transparent' }}
                >
                  {card}
                </Swipeable>
              );
            }}
          />
        )
      )}

      {/* ── Repeat notice toast ───────────────────────────────────────────── */}
      {repeatNotice && (
        <View style={{ position: 'absolute', bottom: 90, left: 24, right: 24, backgroundColor: T.bgCard, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', zIndex: 20, ...Shadow.sm }}>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>{repeatNotice}</AppText>
        </View>
      )}

      {/* ── Sticky Cart Bar ───────────────────────────────────────────────── */}
      {view === 'order' && cart.length > 0 && !locked && (
        <CartBar cartEntries={cart} onReview={() => setReviewVisible(true)} />
      )}

      {/* ── Review Order Sheet ─────────────────────────────────────────────── */}
      <ReviewOrderSheet
        visible={reviewVisible}
        cartEntries={cart}
        office={office}
        isConfirming={placeBulkMutation.isPending}
        onClose={() => setReviewVisible(false)}
        onClearAll={handleClearCart}
        onRemove={handleRemoveCartItem}
        onConfirm={handleConfirm}
      />

      {/* ── Pickup Pass Sheet ─────────────────────────────────────────────── */}
      <PickupPassSheet
        visible={passVisible}
        order={passOrder}
        office={office}
        offices={allOffices}
        onClose={() => { setPassVisible(false); setPassOrderId(null); }}
      />

      {/* ── Location Picker ───────────────────────────────────────────────── */}
      <LocationPickerModal
        visible={locationPickerVisible}
        current={office}
        nearestId={nearestOffice?.id ?? null}
        offices={allOffices}
        locating={locating}
        onSelect={setOffice}
        onClose={() => setLocationPickerVisible(false)}
      />

      {/* ── Order Detail Modal ────────────────────────────────────────────── */}
      <OrderDetailModal
        order={detailOrder}
        visible={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        onShowPass={detailOrder ? () => { setPassOrderId(detailOrder.id); setPassVisible(true); } : undefined}
        onCancel={
          detailOrder &&
          !isOffsetLocked(detailOrder.dayOffset) &&
          !(detailOrder.status === 'today' && isTodayMealWindowPassed(detailOrder.meal))
            ? () => openCancelSheet(detailOrder.id, detailOrder.meal, detailOrder.dayOffset)
            : undefined
        }
        onFeedback={detailOrder && !detailOrder.hasFeedback ? () => {
          setFeedbackOrderId(detailOrder.id);
          setFeedbackMealName(detailOrder.option);
        } : undefined}
        onReorder={
          detailOrder?.status === 'cancelled' &&
          bookingOffsets.includes(detailOrder.dayOffset) &&
          !isOffsetLocked(detailOrder.dayOffset)
            ? () => { setDetailOrder(null); handleReorder(detailOrder); }
            : undefined
        }
      />

      {/* ── Cancel Confirm Sheet ─────────────────────────────────────────── */}
      <CancelConfirmSheet
        visible={!!cancelTarget}
        meal={cancelTarget?.meal ?? null}
        dateLabel={cancelTarget?.dateLabel ?? ''}
        onConfirm={() => {
          if (cancelTarget) handleCancelOrder(cancelTarget.id);
          setCancelTarget(null);
        }}
        onClose={() => setCancelTarget(null)}
      />

      {/* ── Food Feedback Sheet ───────────────────────────────────────────── */}
      <FoodFeedbackSheet
        visible={!!feedbackOrderId}
        orderId={feedbackOrderId}
        mealName={feedbackMealName}
        onClose={() => { setFeedbackOrderId(null); setFeedbackMealName(''); }}
      />

      {/* ── Remind Me Sheet ───────────────────────────────────────────────── */}
      <ReminderSheet
        visible={reminderSheetVisible}
        onClose={() => setReminderSheetVisible(false)}
        onSet={handleSetReminder}
      />

      {/* ── Add second meal confirmation ───────────────────────────────────── */}
      <AppModal config={addSecondModal} onClose={() => setAddSecondModal(null)} />
    </View>
  );
}

// Static layout-only styles — no theme colors
const s = StyleSheet.create({
  root: { flex: 1 },
  header: {},
  headerInner: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  dayHeadRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 },
  cutoffRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  mealCards: { gap: 12, marginTop: 12 },
  orderList: { gap: 10 },
  emptyState: { paddingVertical: 32, alignItems: 'center' },
});
