import React, { useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
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

const DocIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ number, title, content, T }: { number: string; title: string; content: string; T: ReturnType<typeof useMerckTokens> }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: T.green + '22', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
          <AppText weight="bold" size={FontSize.xs} color={T.green}>{number}</AppText>
        </View>
        <AppText weight="bold" size={FontSize.lg} color={T.headerText} style={{ flex: 1, lineHeight: 22 }}>{title}</AppText>
      </View>
      <AppText weight="regular" size={FontSize.md} color={T.tabInactive} style={{ lineHeight: 22, paddingLeft: 36 }}>{content}</AppText>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TermsScreen() {
  const T = useMerckTokens();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  const sections = [
    {
      number: '1',
      title: 'Acceptance of Terms',
      content: 'By accessing or using the MerckConnect application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). These Terms constitute a binding agreement between you ("User") and Merck KGaA ("Merck"). If you do not agree with any part of these Terms, you must discontinue use of the App immediately.\n\nMerckConnect is an internal enterprise application made available exclusively to current Merck employees, contractors, and authorised personnel.',
    },
    {
      number: '2',
      title: 'Eligibility & Access',
      content: 'Access to MerckConnect is granted solely to:\n\n• Active Merck employees with valid corporate credentials.\n\n• Authorised contractors or partners with a Merck-issued account.\n\nYour access is tied to your employment. Access will be revoked upon termination of your employment or contract. You must not share your credentials or permit unauthorised access to the App.',
    },
    {
      number: '3',
      title: 'Permitted Use',
      content: 'MerckConnect is provided for legitimate business and employee welfare purposes only. Permitted uses include:\n\n• Ordering meals from company cafeterias.\n\n• Browsing and registering for company events.\n\n• Accessing the employee directory and company news.\n\n• Submitting feedback and support requests.\n\nYou agree not to use the App for any unlawful, harmful, or disruptive purpose, including but not limited to unauthorised data scraping, attempting to circumvent security measures, or using the App to harass colleagues.',
    },
    {
      number: '4',
      title: 'Food Ordering & Payments',
      content: 'When you place a food order through MerckConnect:\n\n• You confirm that you intend to collect the meal at the specified office cafeteria on the specified date.\n\n• Orders must be placed before the published daily cutoff time (6:00 PM on the preceding day).\n\n• Meal costs are deducted from your Merck cafeteria salary wallet. By placing an order you authorise Merck Payroll to deduct the applicable amount.\n\n• Orders that are not cancelled before the cutoff and not collected ("no-shows") may be subject to the full meal cost, as detailed in the Cancellation Policy.\n\n• Merck reserves the right to modify menu items, pricing, and available meals without prior notice.',
    },
    {
      number: '5',
      title: 'Events & Registration',
      content: 'Event registrations made through MerckConnect are subject to the following conditions:\n\n• Registrations are subject to capacity limits. A confirmed registration guarantees your spot.\n\n• If you can no longer attend, please cancel your registration as early as possible so your spot can be reallocated.\n\n• Merck reserves the right to cancel or reschedule events. You will be notified via the App and your corporate email.\n\n• Some events may carry attendance requirements (e.g., training completions or manager approval). These will be noted on the event detail page.',
    },
    {
      number: '6',
      title: 'Intellectual Property',
      content: 'All content, design, code, trademarks, and materials within MerckConnect are the intellectual property of Merck KGaA or its licensors and are protected by applicable intellectual property law. You may not copy, reproduce, distribute, or create derivative works from any content in the App without prior written permission from Merck.',
    },
    {
      number: '7',
      title: 'User Content & Conduct',
      content: 'When submitting feedback, messages, or other content through the App, you agree that:\n\n• Your submissions do not violate any applicable law or third-party rights.\n\n• You will not submit offensive, discriminatory, or harassing content.\n\n• Merck may review, retain, and use your submissions to improve services.\n\nViolation of this section may result in disciplinary action in accordance with Merck\'s Code of Conduct and HR policies.',
    },
    {
      number: '8',
      title: 'Availability & Maintenance',
      content: 'Merck strives to keep MerckConnect available 24/7, but does not guarantee uninterrupted access. The App may be temporarily unavailable due to:\n\n• Scheduled maintenance (announced in advance where possible).\n\n• Emergency patches or security updates.\n\n• Force majeure events outside Merck\'s control.\n\nMerck is not liable for any losses or inconveniences caused by temporary unavailability of the App.',
    },
    {
      number: '9',
      title: 'Limitation of Liability',
      content: 'To the maximum extent permitted by applicable law, Merck is not liable for:\n\n• Indirect, incidental, or consequential damages arising from your use of the App.\n\n• Data loss caused by device failure, third-party actions, or events outside Merck\'s control.\n\n• Accuracy of menu information, event details, or other content (though we strive to keep it current).\n\nNothing in these Terms limits Merck\'s liability for death, personal injury, or fraud caused by Merck\'s negligence.',
    },
    {
      number: '10',
      title: 'Privacy',
      content: 'Your use of MerckConnect is subject to Merck\'s Privacy Policy, which is incorporated into these Terms by reference. The Privacy Policy explains how we collect, use, and protect your personal data. By using the App, you acknowledge that you have read and understood the Privacy Policy.',
    },
    {
      number: '11',
      title: 'Amendments',
      content: 'Merck may update these Terms from time to time to reflect changes in law, App functionality, or company policy. Material changes will be communicated via an in-app notification at least 14 days before they take effect. Continued use of the App after the effective date of any change constitutes your acceptance of the updated Terms.',
    },
    {
      number: '12',
      title: 'Governing Law & Jurisdiction',
      content: 'These Terms are governed by the laws of the Federal Republic of Germany. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Darmstadt, Germany, unless mandatory statutory provisions require otherwise.',
    },
    {
      number: '13',
      title: 'Contact',
      content: 'For questions about these Terms, please contact:\n\nMerckConnect Team\nMerck KGaA · Frankfurter Str. 250 · 64293 Darmstadt, Germany\nEmail: merckconnect@merckgroup.com\n\nFor legal inquiries: legal@merckgroup.com',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgApp }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.bgApp, borderBottomColor: T.borderDefault }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={T.headerText} />
        </TouchableOpacity>
        <AppText weight="bold" size={FontSize.xl} color={T.headerText}>Terms &amp; Conditions</AppText>
        <NotificationBell color={T.headerText} size={22} />
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: T.green + '18' }]}>
            <DocIcon color={T.green} />
          </View>
          <AppText weight="bold" size={FontSize['2xl']} color={T.headerText} align="center" style={{ marginBottom: 4 }}>Terms of Use</AppText>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ lineHeight: 20 }}>
            Please read these Terms carefully before using MerckConnect. By using the app you agree to be bound by them.
          </AppText>
          <View style={[styles.dateBadge, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
            <AppText weight="bold" size={FontSize.xs} color={T.tabInactive}>Effective: September 14, 2026</AppText>
          </View>
        </View>

        {/* Sections */}
        <View style={[styles.sectionsCard, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          {sections.map((s, i) => (
            <React.Fragment key={s.number}>
              <Section number={s.number} title={s.title} content={s.content} T={T} />
              {i < sections.length - 1 && (
                <View style={[styles.divider, { backgroundColor: T.borderDefault }]} />
              )}
            </React.Fragment>
          ))}
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
  dateBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
});
