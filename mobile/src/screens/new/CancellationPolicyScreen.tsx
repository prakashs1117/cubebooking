import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useMerckTokens } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import { Shadow } from '@theme/spacing';
import AppText from '@components/common/AppText';
import NotificationBell from '@components/notifications/NotificationBell';
import { useNavigation } from '@react-navigation/native';

// ── Icons ─────────────────────────────────────────────────────────────────────

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalXIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" stroke={color} strokeWidth="2" />
    <Path d="M16 2v4M8 2v4M3 8h18M10 12l4 4M14 12l-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 7v5l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="m5 12 5 5L20 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AlertIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Summary Row ───────────────────────────────────────────────────────────────

function SummaryRow({
  icon,
  label,
  value,
  valueColor,
  T,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  T: ReturnType<typeof useMerckTokens>;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: T.bgSurface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </View>
      <AppText weight="semibold" size={FontSize.md} color={T.headerText} style={{ flex: 1 }}>{label}</AppText>
      <AppText weight="bold" size={FontSize.md} color={valueColor ?? T.green}>{value}</AppText>
    </View>
  );
}

// ── Scenario Card ─────────────────────────────────────────────────────────────

function ScenarioCard({
  title,
  description,
  outcome,
  outcomeColor,
  T,
}: {
  title: string;
  description: string;
  outcome: string;
  outcomeColor: string;
  T: ReturnType<typeof useMerckTokens>;
}) {
  return (
    <View style={{ backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.borderDefault, borderRadius: 16, padding: 14, marginBottom: 10 }}>
      <AppText weight="bold" size={FontSize.md} color={T.headerText} style={{ marginBottom: 5 }}>{title}</AppText>
      <AppText weight="regular" size={FontSize.sm} color={T.tabInactive} style={{ lineHeight: 20, marginBottom: 10 }}>{description}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: outcomeColor + '18', borderWidth: 1, borderColor: outcomeColor + '40', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}>
        {outcomeColor === T.green ? <CheckIcon color={outcomeColor} /> : <AlertIcon color={outcomeColor} />}
        <AppText weight="bold" size={FontSize.sm} color={outcomeColor} style={{ flex: 1 }}>{outcome}</AppText>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CancellationPolicyScreen() {
  const T = useMerckTokens();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgApp }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.bgApp, borderBottomColor: T.borderDefault }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={T.headerText} />
        </TouchableOpacity>
        <AppText weight="bold" size={FontSize.xl} color={T.headerText}>Cancellation Policy</AppText>
        <NotificationBell color={T.headerText} size={22} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: T.accentAmber + '18' }]}>
            <ClockIcon color={T.accentAmber} size={24} />
          </View>
          <AppText weight="bold" size={FontSize['2xl']} color={T.headerText} align="center" style={{ marginBottom: 4 }}>Meal Cancellation Policy</AppText>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ lineHeight: 20 }}>
            Understanding when and how you can cancel your cafeteria meal orders — and what happens if you don't.
          </AppText>
        </View>

        {/* At a Glance */}
        <View style={[styles.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 12 }}>At a Glance</AppText>
          <SummaryRow icon={<ClockIcon color={T.green} />} label="Free cancellation until" value="6:00 PM (day before)" T={T} />
          <View style={[styles.divider, { backgroundColor: T.borderDefault }]} />
          <SummaryRow icon={<ClockIcon color={T.tabInactive} />} label="Today's no-show window" value="Before meal time" T={T} />
          <View style={[styles.divider, { backgroundColor: T.borderDefault }]} />
          <SummaryRow icon={<AlertIcon color={T.error} />} label="No-show after meal time" value="Full charge" valueColor={T.error} T={T} />
          <View style={[styles.divider, { backgroundColor: T.borderDefault }]} />
          <SummaryRow icon={<CheckIcon color={T.green} />} label="Refund timeline" value="Next payroll cycle" T={T} />
        </View>

        {/* The Cutoff Rule */}
        <View style={[styles.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 10 }}>The 6 PM Cutoff Rule</AppText>
          <AppText weight="regular" size={FontSize.md} color={T.tabInactive} style={{ lineHeight: 22, marginBottom: 14 }}>
            Cafeteria orders for the following day must be placed — and can be freely cancelled — before 6:00 PM on the preceding business day.
          </AppText>
          <View style={{ backgroundColor: T.green + '10', borderWidth: 1, borderColor: T.green + '30', borderRadius: 14, padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.green }} />
              <AppText weight="bold" size={FontSize.sm} color={T.green}>Monday 5:59 PM</AppText>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>→ Cancel Tuesday's order ✓ Free</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.error }} />
              <AppText weight="bold" size={FontSize.sm} color={T.error}>Monday 6:01 PM</AppText>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive}>→ Tuesday booking locked ✗</AppText>
            </View>
          </View>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ marginTop: 12, lineHeight: 20 }}>
            Once the cutoff passes, orders are locked. The cafeteria prepares your meal based on confirmed orders, so late cancellations cannot be accommodated.
          </AppText>
        </View>

        {/* Today's Order */}
        <View style={[styles.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 10 }}>Cancelling Today's Order</AppText>
          <AppText weight="regular" size={FontSize.md} color={T.tabInactive} style={{ lineHeight: 22, marginBottom: 14 }}>
            If you're not coming into the office today, you can use the "Not coming in today?" option on your Today order card before the meal service begins.
          </AppText>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: T.green + '22', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
                <AppText weight="bold" size={10} color={T.green}>1</AppText>
              </View>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ flex: 1, lineHeight: 20 }}>Go to Food tab → My Orders</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: T.green + '22', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
                <AppText weight="bold" size={10} color={T.green}>2</AppText>
              </View>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ flex: 1, lineHeight: 20 }}>Find the Today order card</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: T.green + '22', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
                <AppText weight="bold" size={10} color={T.green}>3</AppText>
              </View>
              <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ flex: 1, lineHeight: 20 }}>Tap "Not coming in today?" and confirm</AppText>
            </View>
          </View>
          <View style={[styles.noticeBox, { backgroundColor: T.accentAmber + '12', borderColor: T.accentAmber + '40' }]}>
            <AlertIcon color={T.accentAmber} />
            <AppText weight="semibold" size={FontSize.sm} color={T.accentAmber} style={{ flex: 1, lineHeight: 19 }}>
              This option is only available before the meal service window starts. Late same-day cancellations are subject to a 50% charge.
            </AppText>
          </View>
        </View>

        {/* Scenarios */}
        <View style={[styles.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 14 }}>Common Scenarios</AppText>
          <ScenarioCard
            title="Cancelled before 6 PM cutoff"
            description="You placed a Tuesday lunch order on Monday afternoon and cancelled it by 5:45 PM the same day."
            outcome="Full refund to your salary wallet — no charge."
            outcomeColor={T.green}
            T={T}
          />
          <ScenarioCard
            title="Not coming in — cancelled via app (morning)"
            description="You have a Thursday breakfast order. Thursday morning you tap 'Not coming in today?' before breakfast service at 8:00 AM."
            outcome="Full refund — you'll be credited in the next payroll cycle."
            outcomeColor={T.green}
            T={T}
          />
          <ScenarioCard
            title="No-show — didn't cancel, didn't collect"
            description="You had a Wednesday lunch order, didn't cancel, and didn't show up to collect your meal."
            outcome="Full meal cost deducted. Repeated no-shows may affect your ordering privileges."
            outcomeColor={T.error}
            T={T}
          />
          <ScenarioCard
            title="Late same-day cancellation"
            description="You cancel a today's order after the meal service window has started."
            outcome="50% of meal cost charged. The other 50% is refunded."
            outcomeColor={T.accentAmber}
            T={T}
          />
        </View>

        {/* Refunds */}
        <View style={[styles.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ marginBottom: 10 }}>Refund Processing</AppText>
          <AppText weight="regular" size={FontSize.md} color={T.tabInactive} style={{ lineHeight: 22 }}>
            Eligible refunds are processed as credits to your Merck salary wallet. Depending on your payroll cycle, credits typically appear within 1–5 business days or in the next monthly payslip.{'\n\n'}
            To dispute a charge you believe is incorrect, contact the MerckConnect support team via the Contact Us option in the app menu within 14 days of the charge date.
          </AppText>
        </View>

        {/* No-show policy */}
        <View style={[styles.card, { backgroundColor: T.error + '0C', borderColor: T.error + '30' }]}>
          <AppText weight="bold" size={FontSize.lg} color={T.error} style={{ marginBottom: 8 }}>Repeated No-Show Policy</AppText>
          <AppText weight="regular" size={FontSize.md} color={T.tabInactive} style={{ lineHeight: 22 }}>
            Excessive no-shows waste food and cafeteria resources. Employees with 3 or more uncharged no-shows in a rolling 30-day period may have their food ordering feature temporarily restricted. Restrictions are lifted after a 7-day cooling-off period.{'\n\n'}
            If you believe a restriction was applied in error, contact HR or the MerckConnect team.
          </AppText>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  content: { padding: 16, gap: 14 },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
});
