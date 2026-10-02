import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  SafeAreaView,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { MERCK_TOKENS, useMerckTokens } from '@theme/merckTokens';
import NotificationBell from '@components/notifications/NotificationBell';
import { FontSize, FontWeight } from '@theme/typography';
import { Shadow } from '@theme/spacing';
import HorizontalDatePicker from '@components/common/HorizontalDatePicker';
import AppText from '@components/common/AppText';
import {
  useAllMeals,
  useMealsByDate,
  useCreateMeal,
  useUpdateMeal,
  useDeleteMeal,
  useToggleMealAvailability,
  useCheckIn,
  useDishes,
  useCreateDish,
  useMealRates,
  useSetMealRates,
} from '@hooks/useFood';
import { useFeAuthStore } from '@stores/feAuthStore';
import foodApi from '@services/api/food.service';
import type { ApiMeal, ApiPickupPass, CreateMealPayload } from '@services/api/food.service';
import type { MealType } from '@data/mockFood';

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Decode base64url → UTF-8 string using pure JS (no Buffer/atob dependency)
function base64urlToUtf8(token: string): string {
  const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '=='.slice(0, (4 - (b64.length % 4)) % 4);
  // Decode base64 char-by-char to binary string
  const binaryStr = padded.replace(/[A-Za-z0-9+/=]/g, (c) => {
    const idx = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.indexOf(c);
    return String.fromCharCode(idx);
  });
  // Properly decode using decodeURIComponent escape trick
  const encoded = binaryStr.split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join('');
  return decodeURIComponent(encoded);
}

function decodeQrToken(token: string): string | null {
  try {
    // token is base64url of "orderId:userId:dateKey" — we only need orderId
    const decoded = base64urlToUtf8(token);
    return decoded.split(':')[0] ?? null;
  } catch {
    return null;
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const CheckCircleIcon = ({ color, size = 56 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color + '22'} stroke={color} strokeWidth="2" />
    <Path d="m8 12 3 3 5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ScanIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Rect x="7" y="7" width="10" height="10" rx="1" stroke={color} strokeWidth="1.8" />
  </Svg>
);

const AlertIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CameraOffIcon = ({ color }: { color: string }) => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M1 1l22 22M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"
      stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.7" />
  </Svg>
);

const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

// ── VegDot ─────────────────────────────────────────────────────────────────────

function VegDot({ isNonVeg }: { isNonVeg: boolean }) {
  const T = useMerckTokens();
  const color = isNonVeg ? T.error : T.green;
  return (
    <View style={[vd.outer, { borderColor: color }]}>
      <View style={[vd.inner, { backgroundColor: color }]} />
    </View>
  );
}
const vd = StyleSheet.create({
  outer: { width: 14, height: 14, borderRadius: 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 7, height: 7, borderRadius: 3.5 },
});

// ── Segment control ────────────────────────────────────────────────────────────

type VendorTab = 'scan' | 'menu';

function SegmentControl({ active, onChange }: { active: VendorTab; onChange: (v: VendorTab) => void }) {
  const T = useMerckTokens();
  return (
    <View style={[seg.wrap, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
      {(['scan', 'menu'] as VendorTab[]).map(v => (
        <TouchableOpacity
          key={v}
          onPress={() => onChange(v)}
          style={[seg.btn, active === v && { backgroundColor: T.green }]}
          activeOpacity={0.8}
        >
          <AppText style={[seg.label, { color: T.tabInactive }, active === v && { color: T.bgApp }]}>
            {v === 'scan' ? 'Scan Pass' : 'Manage Menu'}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const seg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
  },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  label: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});

// ── Scan phase state machine ───────────────────────────────────────────────────

type ScanPhase =
  | { tag: 'scanning' }
  | { tag: 'loading' }
  | { tag: 'preview'; pass: ApiPickupPass }
  | { tag: 'accepting'; pass: ApiPickupPass }
  | { tag: 'success'; pass: ApiPickupPass }
  | { tag: 'already_collected'; pass: ApiPickupPass }
  | { tag: 'error'; message: string };

// ── Scan Tab ──────────────────────────────────────────────────────────────────

function ScanTab() {
  const T = useMerckTokens();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [phase, setPhase] = useState<ScanPhase>({ tag: 'scanning' });
  const checkInMutation = useCheckIn();
  const processingRef = useRef(false);

  const handleQrDetected = useCallback(async (token: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    setPhase({ tag: 'loading' });

    const orderId = decodeQrToken(token);
    if (!orderId) {
      setPhase({ tag: 'error', message: 'Invalid QR code — not a meal pickup pass.' });
      processingRef.current = false;
      return;
    }

    try {
      const pass = await foodApi.getPickupPass(orderId);
      if (pass.checkedIn) {
        setPhase({ tag: 'already_collected', pass });
      } else {
        setPhase({ tag: 'preview', pass });
      }
    } catch (err: any) {
      setPhase({ tag: 'error', message: err?.message ?? 'Failed to fetch order details.' });
    }
    processingRef.current = false;
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (phase.tag !== 'scanning' || codes.length === 0) return;
      const value = codes[0].value;
      if (!value) return;
      handleQrDetected(value);
    },
  });

  const handleAccept = useCallback(async () => {
    if (phase.tag !== 'preview') return;
    const { pass } = phase;
    setPhase({ tag: 'accepting', pass });
    try {
      await checkInMutation.mutateAsync(pass.orderId);
      setPhase({ tag: 'success', pass });
    } catch (err: any) {
      setPhase({ tag: 'error', message: err?.message ?? 'Check-in failed. Try again.' });
    }
  }, [phase, checkInMutation]);

  const reset = useCallback(() => {
    processingRef.current = false;
    setPhase({ tag: 'scanning' });
  }, []);

  // Permission gate
  if (!hasPermission) {
    return (
      <View style={[scan.center, { backgroundColor: T.bgApp }]}>
        <CameraOffIcon color={T.tabInactive} />
        <AppText style={[scan.permTitle, { color: T.headerText }]}>Camera access needed</AppText>
        <AppText style={[scan.permSub, { color: T.tabInactive }]}>Grant permission to scan employee pickup passes</AppText>
        <TouchableOpacity onPress={requestPermission} style={[scan.permBtn, { backgroundColor: T.green }]}>
          <AppText style={[scan.permBtnText, { color: T.bgApp }]}>Allow Camera</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // No physical camera (simulator)
  if (!device) {
    return (
      <View style={[scan.center, { backgroundColor: T.bgApp }]}>
        <CameraOffIcon color={T.tabInactive} />
        <AppText style={[scan.permTitle, { color: T.headerText }]}>No camera detected</AppText>
        <AppText style={[scan.permSub, { color: T.tabInactive }]}>Use a real device to scan QR passes</AppText>
      </View>
    );
  }

  return (
    <View style={scan.root}>
      {/* Camera always mounted for instant wake */}
      <Camera
        style={StyleSheet.absoluteFill as any}
        device={device}
        isActive={phase.tag === 'scanning'}
        codeScanner={codeScanner}
      />

      {/* Dark overlay when not actively scanning */}
      {phase.tag !== 'scanning' && <View style={[StyleSheet.absoluteFill as any, scan.overlay]} />}

      {/* Scanning frame */}
      {phase.tag === 'scanning' && (
        <View style={scan.frameWrap}>
          <View style={scan.frame}>
            <View style={[scan.corner, scan.tl, { borderColor: T.green }]} />
            <View style={[scan.corner, scan.tr, { borderColor: T.green }]} />
            <View style={[scan.corner, scan.bl, { borderColor: T.green }]} />
            <View style={[scan.corner, scan.br, { borderColor: T.green }]} />
          </View>
          <AppText style={scan.hint}>Point at the employee's QR pickup pass</AppText>
        </View>
      )}

      {/* Loading */}
      {phase.tag === 'loading' && (
        <View style={[scan.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <ActivityIndicator color={T.green} size="large" />
          <AppText style={[scan.cardTitle, { color: T.headerText }]}>Fetching order details…</AppText>
        </View>
      )}

      {/* Preview — show order, confirm */}
      {(phase.tag === 'preview' || phase.tag === 'accepting') && (
        <View style={[scan.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <View style={scan.passHeader}>
            <View style={[scan.passAvatar, { backgroundColor: T.green + '30' }]}>
              <AppText style={[scan.passAvatarText, { color: T.green }]}>
                {(phase.pass.employeeName ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </AppText>
            </View>
            <View style={scan.passInfo}>
              <AppText style={[scan.passName, { color: T.headerText }]}>{phase.pass.employeeName ?? 'Employee'}</AppText>
              <AppText style={[scan.passSub, { color: T.tabInactive }]}>{phase.pass.mealType} · {phase.pass.office}</AppText>
            </View>
          </View>

          <View style={[scan.passDetails, { backgroundColor: T.bgSurface }]}>
            <View style={scan.detailRow}>
              <AppText style={[scan.detailLabel, { color: T.tabInactive }]}>Meal</AppText>
              <AppText style={[scan.detailValue, { color: T.headerText }]}>{phase.pass.mealName}</AppText>
            </View>
            <View style={scan.detailRow}>
              <AppText style={[scan.detailLabel, { color: T.tabInactive }]}>Date</AppText>
              <AppText style={[scan.detailValue, { color: T.headerText }]}>{phase.pass.dateKey}</AppText>
            </View>
            <View style={scan.detailRow}>
              <AppText style={[scan.detailLabel, { color: T.tabInactive }]}>Office</AppText>
              <AppText style={[scan.detailValue, { color: T.headerText }]}>{phase.pass.office}</AppText>
            </View>
          </View>

          <TouchableOpacity
            style={[scan.acceptBtn, { backgroundColor: T.green }, phase.tag === 'accepting' && { opacity: 0.7 }]}
            onPress={handleAccept}
            disabled={phase.tag === 'accepting'}
            activeOpacity={0.85}
          >
            {phase.tag === 'accepting'
              ? <ActivityIndicator color={T.bgApp} />
              : <AppText style={[scan.acceptBtnText, { color: T.bgApp }]}>Accept & Mark Collected</AppText>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={reset} style={scan.cancelLink}>
            <AppText style={[scan.cancelLinkText, { color: T.tabInactive }]}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Success */}
      {phase.tag === 'success' && (
        <View style={[scan.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <CheckCircleIcon color={T.green} />
          <AppText style={[scan.successTitle, { color: T.green }]}>Collected!</AppText>
          <AppText style={[scan.successSub, { color: T.tabInactive }]}>
            {phase.pass.mealName} marked as collected for {phase.pass.employeeName ?? 'the employee'}.
            {'\n'}They'll see the confirmation in their app within 30 seconds.
          </AppText>
          <TouchableOpacity style={[scan.scanAgainBtn, { backgroundColor: T.green }]} onPress={reset} activeOpacity={0.85}>
            <ScanIcon color={T.bgApp} />
            <AppText style={[scan.scanAgainText, { color: T.bgApp }]}>Scan Next Pass</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Already collected */}
      {phase.tag === 'already_collected' && (
        <View style={[scan.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <View style={scan.alreadyIcon}>
            <AlertIcon color={T.accentAmber} />
          </View>
          <AppText style={[scan.alreadyTitle, { color: T.accentAmber }]}>Already Collected</AppText>
          <AppText style={[scan.alreadySub, { color: T.tabInactive }]}>
            {phase.pass.mealName} for {phase.pass.employeeName ?? 'this employee'} was already marked as collected.
          </AppText>
          <TouchableOpacity style={[scan.scanAgainBtn, { backgroundColor: T.green }]} onPress={reset} activeOpacity={0.85}>
            <ScanIcon color={T.bgApp} />
            <AppText style={[scan.scanAgainText, { color: T.bgApp }]}>Scan Another</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Error */}
      {phase.tag === 'error' && (
        <View style={[scan.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <View style={scan.errorIcon}>
            <AlertIcon color={T.error} />
          </View>
          <AppText style={[scan.errorTitle, { color: T.error }]}>Something went wrong</AppText>
          <AppText style={[scan.errorSub, { color: T.tabInactive }]}>{phase.message}</AppText>
          <TouchableOpacity style={[scan.scanAgainBtn, { backgroundColor: T.green }]} onPress={reset} activeOpacity={0.85}>
            <ScanIcon color={T.bgApp} />
            <AppText style={[scan.scanAgainText, { color: T.bgApp }]}>Try Again</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICK = 3;

const scan = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.6)' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  permTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, textAlign: 'center' },
  permSub: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 20 },
  permBtn: { marginTop: 8, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13 },
  permBtnText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },

  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  frame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 6 },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 6 },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 6 },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.md, fontWeight: FontWeight.semibold, textAlign: 'center' },

  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, marginTop: 12 },

  passHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch' },
  passAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passAvatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  passInfo: { flex: 1 },
  passName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  passSub: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: 2 },

  passDetails: {
    alignSelf: 'stretch',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  detailValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  acceptBtn: {
    alignSelf: 'stretch',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  acceptBtnText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  cancelLink: { paddingVertical: 4 },
  cancelLinkText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },

  successTitle: { fontSize: 22, fontWeight: FontWeight.bold },
  successSub: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 20 },

  alreadyIcon: { padding: 8 },
  alreadyTitle: { fontSize: 20, fontWeight: FontWeight.bold },
  alreadySub: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 20 },

  errorIcon: { padding: 8 },
  errorTitle: { fontSize: 20, fontWeight: FontWeight.bold },
  errorSub: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 20 },

  scanAgainBtn: {
    alignSelf: 'stretch',
    borderRadius: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanAgainText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
});

// ── Add Meal Sheet ─────────────────────────────────────────────────────────────

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
const SUGGESTED_TAGS = ['Veg', 'Non-veg', 'Gluten-free', 'Contains dairy', 'Contains nuts', 'Contains egg'];

function AddMealSheet({ visible, onClose, dateKey }: { visible: boolean; onClose: () => void; dateKey: string }) {
  const T = useMerckTokens();
  const createMeal = useCreateMeal();
  const createDish = useCreateDish();
  const { data: allMeals = [] } = useAllMeals();
  const { data: mealRates } = useMealRates();

  const [form, setForm] = useState<{
    name: string;
    mealType: MealType;
    selectedDishes: string[];
    kcal: string;
    tags: string[];
    isNonVeg: boolean;
  }>({
    name: '',
    mealType: 'Lunch',
    selectedDishes: [],
    kcal: '',
    tags: [],
    isNonVeg: false,
  });

  const resolvedPrice = mealRates?.[form.mealType] ?? null;

  const [error, setError] = useState('');
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // Dish library — re-query as user types
  const { data: dishSuggestions = [] } = useDishes(
    dishSearchQuery.trim().length > 0 ? dishSearchQuery.trim() : undefined
  );

  // Filter suggestions to exclude already-selected dishes
  const filteredDishSuggestions = useMemo(
    () => dishSuggestions.filter(d => !form.selectedDishes.includes(d.name)),
    [dishSuggestions, form.selectedDishes]
  );

  // "Add new" option — show when search text doesn't exactly match any suggestion
  const showAddNew = useMemo(() => {
    const q = dishSearchQuery.trim();
    if (!q) return false;
    if (form.selectedDishes.map(d => d.toLowerCase()).includes(q.toLowerCase())) return false;
    return !dishSuggestions.some(d => d.name.toLowerCase() === q.toLowerCase());
  }, [dishSearchQuery, dishSuggestions, form.selectedDishes]);

  // Meal copy search
  const mealSearchResults = useMemo(() => {
    if (!mealSearchQuery.trim()) return [];
    const q = mealSearchQuery.toLowerCase();
    return allMeals.filter(m =>
      m.name.toLowerCase().includes(q) || m.dishes.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [mealSearchQuery, allMeals]);

  const resetForm = useCallback(() => {
    setForm({ name: '', mealType: 'Lunch', selectedDishes: [], kcal: '', tags: [], isNonVeg: false });
    setError('');
    setMealSearchQuery('');
    setDishSearchQuery('');
  }, []);

  const handleClose = useCallback(() => { resetForm(); onClose(); }, [onClose, resetForm]);

  const prefillFromMeal = useCallback((meal: ApiMeal) => {
    const dishes = meal.dishes.split(',').map(d => d.trim()).filter(Boolean);
    setForm({
      name: meal.name,
      mealType: meal.mealType,
      selectedDishes: dishes,
      kcal: meal.kcal != null ? String(meal.kcal) : '',
      tags: [...meal.tags],
      isNonVeg: meal.isNonVeg,
    });
    setMealSearchQuery('');
  }, []);

  const addDish = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || form.selectedDishes.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) return;
    setForm(f => ({ ...f, selectedDishes: [...f.selectedDishes, trimmed] }));
    setDishSearchQuery('');
  }, [form.selectedDishes]);

  const addNewDish = useCallback(async () => {
    const name = dishSearchQuery.trim();
    if (!name) return;
    try {
      await createDish.mutateAsync(name);
      addDish(name);
    } catch {
      addDish(name); // still add to form even if backend fails
    }
  }, [dishSearchQuery, createDish, addDish]);

  const removeDish = useCallback((name: string) => {
    setForm(f => ({ ...f, selectedDishes: f.selectedDishes.filter(d => d !== name) }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!form.name.trim()) { setError('Meal name is required'); return; }
    if (form.selectedDishes.length === 0) { setError('Add at least one dish'); return; }
    const kcalRaw = form.kcal.trim();
    const kcal = kcalRaw ? parseInt(kcalRaw, 10) : null;
    if (kcal !== null && (isNaN(kcal) || kcal < 0)) { setError('Enter a valid calorie count'); return; }

    const payload: CreateMealPayload = {
      name: form.name.trim(),
      dishes: form.selectedDishes.join(', '),
      kcal,
      mealType: form.mealType,
      tags: form.tags,
      isNonVeg: form.isNonVeg,
      dateKey,
    };

    try {
      await createMeal.mutateAsync(payload);
      handleClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create meal');
    }
  }, [form, dateKey, createMeal, handleClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={am.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={am.kav}>
        <View style={[am.sheet, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <View style={[am.handle, { backgroundColor: T.borderMuted }]} />

          <View style={am.headerRow}>
            <AppText style={[am.title, { color: T.headerText }]}>Add Meal</AppText>
            <TouchableOpacity onPress={handleClose} style={[am.closeBtn, { backgroundColor: T.bgSurface }]}>
              <CloseIcon color={T.tabInactive} />
            </TouchableOpacity>
          </View>

          <ScrollView style={am.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* ── Copy from existing meal ── */}
            <AppText style={[am.label, { color: T.tabInactive }]}>Copy from Existing Meal</AppText>
            <TextInput
              style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
              placeholder="Search meals to copy…"
              placeholderTextColor={T.tabInactive}
              value={mealSearchQuery}
              onChangeText={setMealSearchQuery}
            />
            {mealSearchResults.length > 0 && (
              <View style={[am.searchResults, { borderColor: T.borderDefault }]}>
                {mealSearchResults.map(m => (
                  <TouchableOpacity
                    key={m._id}
                    style={[am.searchRow, { borderBottomColor: T.borderDefault, backgroundColor: T.bgSurface }]}
                    onPress={() => prefillFromMeal(m)}
                    activeOpacity={0.75}
                  >
                    <VegDot isNonVeg={m.isNonVeg} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <AppText style={[am.searchName, { color: T.headerText }]}>{m.name}</AppText>
                      <AppText style={[am.searchDishes, { color: T.tabInactive }]} numberOfLines={1}>{m.dishes}</AppText>
                    </View>
                    <AppText style={[am.searchCopy, { color: T.green }]}>Copy</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[am.divider, { backgroundColor: T.borderDefault }]} />

            {/* ── Meal Name ── */}
            <AppText style={[am.label, { color: T.tabInactive }]}>Meal Name *</AppText>
            <TextInput
              style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
              placeholder="e.g. South Indian Veg"
              placeholderTextColor={T.tabInactive}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />

            {/* ── Meal type ── */}
            <AppText style={[am.label, { color: T.tabInactive }]}>Meal Type *</AppText>
            <View style={am.pillRow}>
              {MEAL_TYPES.map(mt => (
                <TouchableOpacity
                  key={mt}
                  onPress={() => setForm(f => ({ ...f, mealType: mt }))}
                  style={[
                    am.pill,
                    { backgroundColor: T.bgSurface, borderColor: T.borderDefault },
                    form.mealType === mt && { backgroundColor: T.green, borderColor: T.green },
                  ]}
                >
                  <AppText style={[am.pillText, { color: T.tabInactive }, form.mealType === mt && { color: T.bgApp }]}>{mt}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Dish picker ── */}
            <AppText style={[am.label, { color: T.tabInactive }]}>Dishes *</AppText>

            {/* Selected dishes as removable chips */}
            {form.selectedDishes.length > 0 && (
              <View style={am.selectedDishRow}>
                {form.selectedDishes.map(name => (
                  <View key={name} style={[am.dishChip, { backgroundColor: T.green + '22', borderColor: T.green }]}>
                    <AppText style={[am.dishChipText, { color: T.green }]}>{name}</AppText>
                    <TouchableOpacity onPress={() => removeDish(name)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <AppText style={[am.dishChipRemove, { color: T.green }]}>✕</AppText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Search box */}
            <TextInput
              style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
              placeholder="Search or type a dish name…"
              placeholderTextColor={T.tabInactive}
              value={dishSearchQuery}
              onChangeText={setDishSearchQuery}
            />

            {/* Suggestions from dish library */}
            {(filteredDishSuggestions.length > 0 || showAddNew) && (
              <View style={[am.searchResults, { borderColor: T.borderDefault }]}>
                {filteredDishSuggestions.slice(0, 6).map(d => (
                  <TouchableOpacity
                    key={d._id}
                    style={[am.searchRow, { borderBottomColor: T.borderDefault, backgroundColor: T.bgSurface }]}
                    onPress={() => addDish(d.name)}
                    activeOpacity={0.75}
                  >
                    <AppText style={[am.searchName, { color: T.headerText }]}>{d.name}</AppText>
                    <AppText style={[am.searchCopy, { color: T.green }]}>+ Add</AppText>
                  </TouchableOpacity>
                ))}
                {showAddNew && (
                  <TouchableOpacity
                    style={[am.searchRow, { borderBottomColor: T.borderDefault, backgroundColor: T.green + '12' }]}
                    onPress={addNewDish}
                    disabled={createDish.isPending}
                    activeOpacity={0.75}
                  >
                    {createDish.isPending
                      ? <ActivityIndicator size="small" color={T.green} />
                      : <AppText style={[am.searchName, { color: T.headerText }]}>
                          Add "<AppText style={{ color: T.green }}>{dishSearchQuery.trim()}</AppText>"
                        </AppText>
                    }
                    <AppText style={[am.searchCopy, { color: T.green }]}>New</AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Calories (optional) + Standard Price (read-only) ── */}
            <View style={[am.twoCol, { marginTop: 14 }]}>
              <View style={am.col}>
                <AppText style={[am.label, { color: T.tabInactive }]}>Calories (optional)</AppText>
                <TextInput
                  style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
                  placeholder="e.g. 420"
                  placeholderTextColor={T.tabInactive}
                  value={form.kcal}
                  onChangeText={v => setForm(f => ({ ...f, kcal: v }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={am.col}>
                <AppText style={[am.label, { color: T.tabInactive }]}>Standard Price</AppText>
                <View style={[am.priceReadOnly, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
                  {resolvedPrice !== null
                    ? <AppText style={[am.priceReadOnlyText, { color: T.green }]}>₹{resolvedPrice}</AppText>
                    : <AppText style={[am.priceReadOnlyMuted, { color: T.tabInactive }]}>Not set</AppText>
                  }
                </View>
              </View>
            </View>

            {/* ── Dietary Tags ── */}
            <AppText style={[am.label, { color: T.tabInactive }]}>Dietary Tags</AppText>
            <View style={am.tagGrid}>
              {SUGGESTED_TAGS.map(tag => {
                const selected = form.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[
                      am.tagChip,
                      { backgroundColor: T.bgSurface, borderColor: T.borderDefault },
                      selected && { backgroundColor: T.green + '22', borderColor: T.green },
                    ]}
                  >
                    <AppText style={[am.tagChipText, { color: T.tabInactive }, selected && { color: T.green }]}>{tag}</AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Non-Veg toggle ── */}
            <View style={am.switchRow}>
              <AppText style={[am.switchLabel, { color: T.headerText }]}>Non-Veg</AppText>
              <Switch
                value={form.isNonVeg}
                onValueChange={v => setForm(f => ({ ...f, isNonVeg: v }))}
                trackColor={{ false: T.borderDefault, true: T.error + '80' }}
                thumbColor={form.isNonVeg ? T.error : T.tabInactive}
              />
            </View>

            {!!error && <AppText style={[am.error, { color: T.error }]}>{error}</AppText>}
            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={[am.footer, { borderTopColor: T.borderDefault }]}>
            <TouchableOpacity
              style={[am.submitBtn, { backgroundColor: T.green }, createMeal.isPending && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={createMeal.isPending}
              activeOpacity={0.88}
            >
              {createMeal.isPending
                ? <ActivityIndicator color={T.bgApp} />
                : <AppText style={[am.submitText, { color: T.bgApp }]}>Add Meal</AppText>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const am = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    borderTopWidth: 1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 22 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.md,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  twoCol: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 4,
  },
  switchLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  error: {
    marginTop: 12,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  footer: {
    padding: 22,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  searchResults: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  searchName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, flex: 1 },
  searchDishes: { fontSize: FontSize['2xs'], marginTop: 2 },
  searchCopy: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginLeft: 8 },
  divider: { height: 1, marginVertical: 16 },
  selectedDishRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  dishChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  dishChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  dishChipRemove: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  priceReadOnly: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  priceReadOnlyText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  priceReadOnlyMuted: { fontSize: FontSize.md },
});

// ── Manage Menu Tab ────────────────────────────────────────────────────────────

function EditMealSheet({ meal, dateKey, onClose }: { meal: ApiMeal | null; dateKey: string; onClose: () => void }) {
  const T = useMerckTokens();
  const updateMeal = useUpdateMeal(dateKey);
  const { data: mealRates } = useMealRates();
  const createDish = useCreateDish();
  const { data: allDishSuggestions = [] } = useDishes(undefined);

  const [form, setForm] = useState({
    name: '',
    mealType: 'Lunch' as MealType,
    selectedDishes: [] as string[],
    kcal: '',
    tags: [] as string[],
    isNonVeg: false,
  });
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Pre-fill when sheet opens
  React.useEffect(() => {
    if (meal) {
      setForm({
        name: meal.name,
        mealType: meal.mealType,
        selectedDishes: meal.dishes.split(',').map(d => d.trim()).filter(Boolean),
        kcal: meal.kcal != null ? String(meal.kcal) : '',
        tags: [...meal.tags],
        isNonVeg: meal.isNonVeg,
      });
      setDishSearchQuery('');
      setError('');
    }
  }, [meal]);

  const resolvedPrice = mealRates?.[form.mealType] ?? null;

  const filteredDishSuggestions = useMemo(() => {
    if (!dishSearchQuery.trim()) return [];
    const q = dishSearchQuery.toLowerCase();
    return allDishSuggestions
      .filter(d => d.name.toLowerCase().includes(q) && !form.selectedDishes.includes(d.name))
      .slice(0, 6);
  }, [dishSearchQuery, allDishSuggestions, form.selectedDishes]);

  const showAddNew = useMemo(() => {
    const q = dishSearchQuery.trim();
    if (!q) return false;
    if (form.selectedDishes.map(d => d.toLowerCase()).includes(q.toLowerCase())) return false;
    return !allDishSuggestions.some(d => d.name.toLowerCase() === q.toLowerCase());
  }, [dishSearchQuery, allDishSuggestions, form.selectedDishes]);

  const addDish = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || form.selectedDishes.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) return;
    setForm(f => ({ ...f, selectedDishes: [...f.selectedDishes, trimmed] }));
    setDishSearchQuery('');
  }, [form.selectedDishes]);

  const addNewDish = useCallback(async () => {
    const name = dishSearchQuery.trim();
    if (!name) return;
    try { await createDish.mutateAsync(name); } catch {}
    addDish(name);
  }, [dishSearchQuery, createDish, addDish]);

  const toggleTag = useCallback((tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));
  }, []);

  const handleSave = useCallback(async () => {
    setError('');
    if (!form.name.trim()) { setError('Meal name is required'); return; }
    if (form.selectedDishes.length === 0) { setError('Add at least one dish'); return; }
    const kcalRaw = form.kcal.trim();
    const kcal = kcalRaw ? parseInt(kcalRaw, 10) : null;
    if (kcal !== null && (isNaN(kcal) || kcal < 0)) { setError('Enter a valid calorie count'); return; }
    try {
      await updateMeal.mutateAsync({
        mealId: meal!._id,
        payload: { name: form.name.trim(), dishes: form.selectedDishes.join(', '), kcal, mealType: form.mealType, tags: form.tags, isNonVeg: form.isNonVeg },
      });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update meal');
    }
  }, [form, meal, updateMeal, onClose]);

  if (!meal) return null;

  return (
    <Modal visible={!!meal} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={am.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={am.kav}>
        <View style={[am.sheet, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <View style={[am.handle, { backgroundColor: T.borderMuted }]} />
          <View style={am.headerRow}>
            <AppText style={[am.title, { color: T.headerText }]}>Edit Meal</AppText>
            <TouchableOpacity onPress={onClose} style={[am.closeBtn, { backgroundColor: T.bgSurface }]}>
              <CloseIcon color={T.tabInactive} />
            </TouchableOpacity>
          </View>
          <ScrollView style={am.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <AppText style={[am.label, { color: T.tabInactive }]}>Meal Name *</AppText>
            <TextInput
              style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              placeholderTextColor={T.tabInactive}
            />

            <AppText style={[am.label, { color: T.tabInactive }]}>Meal Type *</AppText>
            <View style={am.pillRow}>
              {MEAL_TYPES.map(mt => (
                <TouchableOpacity
                  key={mt}
                  onPress={() => setForm(f => ({ ...f, mealType: mt }))}
                  style={[
                    am.pill,
                    { backgroundColor: T.bgSurface, borderColor: T.borderDefault },
                    form.mealType === mt && { backgroundColor: T.green, borderColor: T.green },
                  ]}
                >
                  <AppText style={[am.pillText, { color: T.tabInactive }, form.mealType === mt && { color: T.bgApp }]}>{mt}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            <AppText style={[am.label, { color: T.tabInactive }]}>Dishes *</AppText>
            {form.selectedDishes.length > 0 && (
              <View style={am.selectedDishRow}>
                {form.selectedDishes.map(name => (
                  <View key={name} style={[am.dishChip, { backgroundColor: T.green + '22', borderColor: T.green }]}>
                    <AppText style={[am.dishChipText, { color: T.green }]}>{name}</AppText>
                    <TouchableOpacity onPress={() => setForm(f => ({ ...f, selectedDishes: f.selectedDishes.filter(d => d !== name) }))} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <AppText style={[am.dishChipRemove, { color: T.green }]}>✕</AppText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TextInput
              style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
              placeholder="Search or type a dish…"
              placeholderTextColor={T.tabInactive}
              value={dishSearchQuery}
              onChangeText={setDishSearchQuery}
            />
            {(filteredDishSuggestions.length > 0 || showAddNew) && (
              <View style={[am.searchResults, { borderColor: T.borderDefault }]}>
                {filteredDishSuggestions.map(d => (
                  <TouchableOpacity
                    key={d._id}
                    style={[am.searchRow, { borderBottomColor: T.borderDefault, backgroundColor: T.bgSurface }]}
                    onPress={() => addDish(d.name)}
                    activeOpacity={0.75}
                  >
                    <AppText style={[am.searchName, { color: T.headerText }]}>{d.name}</AppText>
                    <AppText style={[am.searchCopy, { color: T.green }]}>+ Add</AppText>
                  </TouchableOpacity>
                ))}
                {showAddNew && (
                  <TouchableOpacity
                    style={[am.searchRow, { borderBottomColor: T.borderDefault, backgroundColor: T.green + '12' }]}
                    onPress={addNewDish}
                    disabled={createDish.isPending}
                    activeOpacity={0.75}
                  >
                    <AppText style={[am.searchName, { color: T.headerText }]}>Add "<AppText style={{ color: T.green }}>{dishSearchQuery.trim()}</AppText>"</AppText>
                    <AppText style={[am.searchCopy, { color: T.green }]}>New</AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={[am.twoCol, { marginTop: 14 }]}>
              <View style={am.col}>
                <AppText style={[am.label, { color: T.tabInactive }]}>Calories (optional)</AppText>
                <TextInput
                  style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
                  placeholder="e.g. 420"
                  placeholderTextColor={T.tabInactive}
                  value={form.kcal}
                  onChangeText={v => setForm(f => ({ ...f, kcal: v }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={am.col}>
                <AppText style={[am.label, { color: T.tabInactive }]}>Standard Price</AppText>
                <View style={[am.priceReadOnly, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
                  {resolvedPrice !== null
                    ? <AppText style={[am.priceReadOnlyText, { color: T.green }]}>₹{resolvedPrice}</AppText>
                    : <AppText style={[am.priceReadOnlyMuted, { color: T.tabInactive }]}>Not set</AppText>
                  }
                </View>
              </View>
            </View>

            <AppText style={[am.label, { color: T.tabInactive }]}>Dietary Tags</AppText>
            <View style={am.tagGrid}>
              {SUGGESTED_TAGS.map(tag => {
                const selected = form.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[
                      am.tagChip,
                      { backgroundColor: T.bgSurface, borderColor: T.borderDefault },
                      selected && { backgroundColor: T.green + '22', borderColor: T.green },
                    ]}
                  >
                    <AppText style={[am.tagChipText, { color: T.tabInactive }, selected && { color: T.green }]}>{tag}</AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={am.switchRow}>
              <AppText style={[am.switchLabel, { color: T.headerText }]}>Non-Veg</AppText>
              <Switch
                value={form.isNonVeg}
                onValueChange={v => setForm(f => ({ ...f, isNonVeg: v }))}
                trackColor={{ false: T.borderDefault, true: T.error + '80' }}
                thumbColor={form.isNonVeg ? T.error : T.tabInactive}
              />
            </View>

            {!!error && <AppText style={[am.error, { color: T.error }]}>{error}</AppText>}
            <View style={{ height: 16 }} />
          </ScrollView>
          <View style={[am.footer, { borderTopColor: T.borderDefault }]}>
            <TouchableOpacity
              style={[am.submitBtn, { backgroundColor: T.green }, updateMeal.isPending && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={updateMeal.isPending}
              activeOpacity={0.88}
            >
              {updateMeal.isPending
                ? <ActivityIndicator color={T.bgApp} />
                : <AppText style={[am.submitText, { color: T.bgApp }]}>Save Changes</AppText>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MealManageCard({ meal, dateKey, onEdit }: { meal: ApiMeal; dateKey: string; onEdit: (meal: ApiMeal) => void }) {
  const T = useMerckTokens();
  const toggle = useToggleMealAvailability();
  const deleteMeal = useDeleteMeal(dateKey);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = useCallback(() => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteMeal.mutate(meal._id);
    setConfirmDelete(false);
  }, [confirmDelete, deleteMeal, meal._id]);

  return (
    <View style={[mm.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }, !meal.isAvailable && mm.cardDisabled]}>
      {/* Main row */}
      <View style={mm.row}>
        <VegDot isNonVeg={meal.isNonVeg} />
        <View style={mm.info}>
          <AppText style={[mm.name, { color: T.headerText }]}>{meal.name}</AppText>
          <AppText style={[mm.dishes, { color: T.tabInactive }]} numberOfLines={1}>{meal.dishes}</AppText>
          <View style={mm.badges}>
            <View style={[mm.badge, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
              <AppText style={[mm.badgeText, { color: T.tabInactive }]}>₹{meal.price}</AppText>
            </View>
            {meal.kcal != null && (
              <View style={[mm.badge, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
                <AppText style={[mm.badgeText, { color: T.tabInactive }]}>{meal.kcal} kcal</AppText>
              </View>
            )}
          </View>
        </View>
        {/* Enable/Disable toggle */}
        <View style={mm.toggleWrap}>
          <AppText style={[mm.availLabel, { color: meal.isAvailable ? T.green : T.tabInactive }]}>
            {meal.isAvailable ? 'On' : 'Off'}
          </AppText>
          <Switch
            value={meal.isAvailable}
            onValueChange={() => toggle.mutate(meal._id)}
            disabled={toggle.isPending}
            trackColor={{ false: T.borderDefault, true: T.green + '80' }}
            thumbColor={meal.isAvailable ? T.green : T.tabInactive}
          />
        </View>
      </View>

      {/* Action row */}
      <View style={[mm.actions, { borderTopColor: T.borderDefault }]}>
        <TouchableOpacity
          style={[mm.actionBtn, { backgroundColor: T.bgSurface }]}
          onPress={() => { setConfirmDelete(false); onEdit(meal); }}
          activeOpacity={0.75}
        >
          <AppText style={[mm.actionEdit, { color: T.accentBlue }]}>✎ Edit</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[mm.actionBtn, { backgroundColor: T.bgSurface }, confirmDelete && { backgroundColor: T.error + '15' }]}
          onPress={handleDelete}
          disabled={deleteMeal.isPending}
          activeOpacity={0.75}
        >
          {deleteMeal.isPending
            ? <ActivityIndicator size="small" color={T.error} />
            : <AppText style={[mm.actionDelete, { color: T.error }]}>{confirmDelete ? 'Tap again to confirm' : '⌫ Delete'}</AppText>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const mm = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    ...Shadow.sm,
  },
  cardDisabled: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 2 },
  dishes: { fontSize: FontSize.sm, marginBottom: 6 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { fontSize: FontSize['2xs'], fontWeight: FontWeight.bold },
  toggleWrap: { alignItems: 'center', gap: 4 },
  availLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  actionEdit: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  actionDelete: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});

function MealRateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const T = useMerckTokens();
  const { data: rates } = useMealRates();
  const setRates = useSetMealRates();
  const [form, setForm] = useState({ Breakfast: '', Lunch: '', Dinner: '' });
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (rates && visible) {
      setForm({
        Breakfast: String(rates.Breakfast),
        Lunch: String(rates.Lunch),
        Dinner: String(rates.Dinner),
      });
    }
  }, [rates, visible]);

  const handleSave = useCallback(async () => {
    setError('');
    const b = parseFloat(form.Breakfast);
    const l = parseFloat(form.Lunch);
    const d = parseFloat(form.Dinner);
    if (isNaN(b) || b < 0 || isNaN(l) || l < 0 || isNaN(d) || d < 0) {
      setError('Enter valid prices for all meal types');
      return;
    }
    try {
      await setRates.mutateAsync({ Breakfast: b, Lunch: l, Dinner: d });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save rates');
    }
  }, [form, setRates, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={am.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={am.kav}>
        <View style={[am.sheet, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
          <View style={[am.handle, { backgroundColor: T.borderMuted }]} />
          <View style={am.headerRow}>
            <View>
              <AppText style={[am.title, { color: T.headerText }]}>Standard Meal Rates</AppText>
              <AppText style={[am.label, { marginTop: 2, color: T.tabInactive }]}>Set by Super Admin · Applied to all vendors</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={[am.closeBtn, { backgroundColor: T.bgSurface }]}>
              <CloseIcon color={T.tabInactive} />
            </TouchableOpacity>
          </View>
          <View style={am.body}>
            {(['Breakfast', 'Lunch', 'Dinner'] as const).map(mt => (
              <View key={mt}>
                <AppText style={[am.label, { color: T.tabInactive }]}>
                  {mt === 'Breakfast' ? '☀️ ' : mt === 'Lunch' ? '🌤️ ' : '🌙 '}{mt} Price (₹)
                </AppText>
                <TextInput
                  style={[am.input, { backgroundColor: T.bgSurface, borderColor: T.borderDefault, color: T.headerText }]}
                  placeholder="0"
                  placeholderTextColor={T.tabInactive}
                  value={form[mt]}
                  onChangeText={v => setForm(f => ({ ...f, [mt]: v }))}
                  keyboardType="numeric"
                />
              </View>
            ))}
            {!!error && <AppText style={[am.error, { color: T.error }]}>{error}</AppText>}
          </View>
          <View style={[am.footer, { borderTopColor: T.borderDefault }]}>
            <TouchableOpacity
              style={[am.submitBtn, { backgroundColor: T.green }, setRates.isPending && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={setRates.isPending}
              activeOpacity={0.88}
            >
              {setRates.isPending
                ? <ActivityIndicator color={T.bgApp} />
                : <AppText style={[am.submitText, { color: T.bgApp }]}>Save Rates</AppText>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getMenuStartDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  if (dow === 6) d.setDate(d.getDate() + 2); // Saturday → Monday
  if (dow === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
  return d;
}

function ManageMenuTab() {
  const T = useMerckTokens();
  const menuStart = useMemo(() => getMenuStartDate(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(menuStart);
  const [addVisible, setAddVisible] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ApiMeal | null>(null);
  const userRole = useFeAuthStore(s => s.user?.role ?? '');
  const isSuperAdmin = userRole === 'super_admin';

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const { data: meals = [], isLoading } = useMealsByDate(selectedDateKey);

  const grouped = useMemo(() => {
    const order: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
    const map: Record<string, ApiMeal[]> = {};
    meals.forEach(m => {
      if (!map[m.mealType]) map[m.mealType] = [];
      map[m.mealType].push(m);
    });
    return order.map(t => ({ mealType: t, items: map[t] ?? [] }));
  }, [meals]);

  return (
    <View style={{ flex: 1 }}>
      {/* Date picker strip */}
      <View style={[menu.datePickerWrap, { backgroundColor: T.bgApp, borderBottomColor: T.borderDefault }]}>
        <View style={menu.datePickerHeader}>
          <AppText style={[menu.dateLabelText, { color: T.headerText }]}>{formatDateLabel(selectedDate)}</AppText>
          {isSuperAdmin && (
            <TouchableOpacity
              style={[menu.rateBtn, { backgroundColor: T.accentAmber + '22', borderColor: T.accentAmber + '60' }]}
              onPress={() => setRateVisible(true)}
              activeOpacity={0.8}
            >
              <AppText style={[menu.rateBtnText, { color: T.accentAmber }]}>₹ Set Rates</AppText>
            </TouchableOpacity>
          )}
        </View>
        <HorizontalDatePicker
          onDateSelect={setSelectedDate}
          initialDate={menuStart}
          startDate={menuStart}
          daysToShow={30}
          showMonthLabel={true}
          containerStyle={[menu.datePickerContainer, { backgroundColor: T.bgApp }]}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={menu.scrollContent}
      >
        {isLoading && <ActivityIndicator color={T.green} style={{ marginTop: 32 }} />}

        {!isLoading && grouped.map(({ mealType, items }) => (
          <View key={mealType}>
            <View style={menu.sectionHeader}>
              <AppText style={menu.sectionEmoji}>
                {mealType === 'Breakfast' ? '☀️' : mealType === 'Lunch' ? '🌤️' : '🌙'}
              </AppText>
              <AppText style={[menu.sectionTitle, { color: T.headerText }]}>{mealType}</AppText>
              <AppText style={[menu.sectionCount, { color: T.tabInactive, backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
                {items.length}
              </AppText>
            </View>
            {items.length > 0
              ? <View style={menu.group}>{items.map(m => <MealManageCard key={m._id} meal={m} dateKey={selectedDateKey} onEdit={setEditingMeal} />)}</View>
              : (
                <View style={menu.emptySection}>
                  <AppText style={[menu.emptySectionText, { color: T.tabInactive }]}>No {mealType.toLowerCase()} added for this date</AppText>
                </View>
              )
            }
          </View>
        ))}

        {/* Space for FAB */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[menu.fab, { backgroundColor: T.green }]}
        onPress={() => setAddVisible(true)}
        activeOpacity={0.88}
      >
        <PlusIcon color={T.bgApp} />
        <AppText style={[menu.fabText, { color: T.bgApp }]}>Add Meal</AppText>
      </TouchableOpacity>

      <AddMealSheet visible={addVisible} onClose={() => setAddVisible(false)} dateKey={selectedDateKey} />
      <EditMealSheet meal={editingMeal} dateKey={selectedDateKey} onClose={() => setEditingMeal(null)} />
      <MealRateSheet visible={rateVisible} onClose={() => setRateVisible(false)} />
    </View>
  );
}

const menu = StyleSheet.create({
  datePickerWrap: {
    paddingTop: 12,
    borderBottomWidth: 1,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  dateLabelText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  rateBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rateBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  datePickerContainer: {},
  scrollContent: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 16,
  },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, flex: 1 },
  sectionCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  group: { gap: 8 },
  emptySection: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  emptySectionText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 20,
    ...Shadow.sm,
  },
  fabText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
});

// ── Main VendorScreen ─────────────────────────────────────────────────────────

export default function VendorScreen() {
  const [tab, setTab] = useState<VendorTab>('scan');
  const T = useMerckTokens();

  return (
    <View style={[s.root, { backgroundColor: T.bgApp }]}>
      <SafeAreaView style={[s.header, { backgroundColor: T.bgApp }]}>
        <View style={s.headerInner}>
          <View style={s.titleRow}>
            <AppText style={[s.title, { color: T.headerText }]}>Vendor</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[s.vendorBadge, { backgroundColor: T.accentAmber + '22', borderColor: T.accentAmber + '50' }]}>
                <AppText style={[s.vendorBadgeText, { color: T.accentAmber }]}>Vendor</AppText>
              </View>
              <NotificationBell color={T.headerText} size={22} />
            </View>
          </View>
          <SegmentControl active={tab} onChange={setTab} />
        </View>
      </SafeAreaView>

      <View style={s.content}>
        {tab === 'scan' ? <ScanTab /> : <ManageMenuTab />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {},
  headerInner: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  vendorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  vendorBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: { flex: 1 },
});
