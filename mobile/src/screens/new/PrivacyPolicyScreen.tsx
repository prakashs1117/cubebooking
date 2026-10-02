import React, { useRef } from 'react';
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

const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m9 12 2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function PrivacyPolicyScreen() {
  const T = useMerckTokens();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  const sections = [
    {
      number: '1',
      title: 'Introduction',
      content: 'Merck KGaA ("Merck", "we", "us") respects the privacy of our employees and is committed to protecting your personal data. This Privacy Policy describes how the MerckConnect application collects, uses, and safeguards your personal information in accordance with the EU General Data Protection Regulation (GDPR) and applicable German data protection law.',
    },
    {
      number: '2',
      title: 'Data We Collect',
      content: 'MerckConnect collects the following categories of personal data:\n\n• Identity data: your name, employee ID, job title, and department — sourced directly from the Merck HR system.\n\n• Contact data: your corporate email address and office location.\n\n• Usage data: how you interact with the app, features you use, search queries, and session timestamps.\n\n• Food ordering data: cafeteria meal selections, order history, dietary preferences, and pickup timestamps.\n\n• Device data: device type, OS version, push notification token, and approximate location (only when you grant permission) for auto-detecting your nearest office.',
    },
    {
      number: '3',
      title: 'How We Use Your Data',
      content: 'We use your personal data exclusively for the following purposes:\n\n• To provide core app functionality: event browsing, food ordering, colleague directory, and company news.\n\n• To process and fulfil cafeteria meal orders and send pickup notifications.\n\n• To personalise your experience (e.g., remembering your preferred office).\n\n• To send service notifications about your orders, events, and important company announcements.\n\n• To improve app performance and identify technical issues through anonymised analytics.\n\nWe do not use your data for advertising, profiling beyond your job function, or any automated decision-making that has legal or significant effects on you.',
    },
    {
      number: '4',
      title: 'Legal Basis for Processing',
      content: 'Processing is carried out on the following legal bases under GDPR Art. 6:\n\n• Performance of a contract (Art. 6(1)(b)): processing necessary to provide the services you request (e.g., placing a food order).\n\n• Legitimate interests (Art. 6(1)(f)): operating and improving internal tools for employee benefit, provided these interests do not override your rights.\n\n• Compliance with legal obligations (Art. 6(1)(c)): where applicable law requires us to retain records.',
    },
    {
      number: '5',
      title: 'Data Sharing & Recipients',
      content: 'Your data is shared only on a need-to-know basis:\n\n• Merck IT and the MerckConnect product team, for app operation and support.\n\n• Cafeteria operations staff at your chosen office, solely to fulfil your meal order.\n\n• Cloud infrastructure providers (hosted within the EU/EEA), subject to GDPR-compliant data processing agreements.\n\nWe never sell your personal data to third parties, and we do not share it with external advertisers or analytics platforms.',
    },
    {
      number: '6',
      title: 'Data Retention',
      content: 'We retain your personal data only as long as necessary:\n\n• Profile and HR data: retained while you are an active Merck employee and deleted within 90 days of your departure.\n\n• Food order history: retained for 24 months for billing reconciliation and dispute resolution, then permanently deleted.\n\n• Usage analytics: retained in anonymised form for up to 12 months.',
    },
    {
      number: '7',
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your data:\n\n• All data is encrypted in transit using TLS 1.2 or higher.\n\n• Data at rest is encrypted using AES-256.\n\n• Access to production systems is restricted to authorised Merck IT personnel via multi-factor authentication.\n\n• We conduct regular security audits and penetration testing.\n\n• In the unlikely event of a data breach affecting your rights, we will notify you as required by GDPR (within 72 hours of discovery).',
    },
    {
      number: '8',
      title: 'Your Rights',
      content: 'As a data subject under GDPR, you have the following rights:\n\n• Right of access: request a copy of the personal data we hold about you.\n\n• Right to rectification: request correction of inaccurate data.\n\n• Right to erasure: request deletion of your data where no longer necessary.\n\n• Right to restriction: request that we limit processing in certain circumstances.\n\n• Right to data portability: receive your data in a structured, machine-readable format.\n\n• Right to object: object to processing based on legitimate interests.\n\nTo exercise any of these rights, contact the MerckConnect team via the Contact Us option in the app menu, or email privacy@merckgroup.com.',
    },
    {
      number: '9',
      title: 'Cookies & Local Storage',
      content: 'MerckConnect is a native mobile application and does not use browser cookies. The app uses device local storage (AsyncStorage) to save your session token, preferred office, and app settings. This data does not leave your device and can be cleared by uninstalling the app.',
    },
    {
      number: '10',
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. When we make material changes, we will notify you via an in-app notification and update the "Last Updated" date at the top of this page. Continued use of MerckConnect after the effective date of any changes constitutes acceptance of the revised policy.',
    },
    {
      number: '11',
      title: 'Contact & Data Controller',
      content: 'The data controller for MerckConnect is:\n\nMerck KGaA\nFrankfurter Str. 250\n64293 Darmstadt, Germany\n\nData Protection Officer: dpo@merckgroup.com\nMerckConnect team: merckconnect@merckgroup.com\n\nFor complaints, you may also contact the relevant supervisory authority — for Merck headquarters, this is the Hessischer Beauftragter für Datenschutz und Informationsfreiheit (HBDI).',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgApp }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.bgApp, borderBottomColor: T.borderDefault }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={T.headerText} />
        </TouchableOpacity>
        <AppText weight="bold" size={FontSize.xl} color={T.headerText}>Privacy Policy</AppText>
        <NotificationBell color={T.headerText} size={22} />
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: T.bgCard, borderColor: T.borderDefault, ...Shadow.sm }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: T.green + '18' }]}>
            <ShieldIcon color={T.green} />
          </View>
          <AppText weight="bold" size={FontSize['2xl']} color={T.headerText} align="center" style={{ marginBottom: 4 }}>Your Privacy Matters</AppText>
          <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ lineHeight: 20 }}>
            MerckConnect handles your personal data with care, in compliance with GDPR and Merck's global privacy standards.
          </AppText>
          <View style={[styles.dateBadge, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
            <AppText weight="bold" size={FontSize.xs} color={T.tabInactive}>Last updated: September 14, 2026</AppText>
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
