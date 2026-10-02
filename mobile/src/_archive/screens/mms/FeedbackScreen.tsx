import React, { useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import FeedbackModal from '@components/common/FeedbackModal';
import { BaseColors } from '@theme/colors';

// ─── Config ────────────────────────────────────────────────────────────────────
// Replace these with your real App Store / Play Store IDs
const APP_STORE_URL = 'itms-apps://apps.apple.com/app/id0000000000';
const PLAY_STORE_URL = 'market://details?id=com.yourcompany.yourapp';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  value: string;
  label: string;
  color: string;
  bg: string;
}> = ({ value, label, color, bg }) => (
  <View style={[statCardStyles.card, { backgroundColor: bg }]}>
    <Text style={[statCardStyles.value, { color }]}>{value}</Text>
    <Text style={[statCardStyles.label, { color }]}>{label}</Text>
  </View>
);

const statCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  label: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.75,
    textAlign: 'center',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FeedbackScreen: React.FC = () => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const openStore = async () => {
    const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    }
  };

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View
          style={[
            styles.hero,
            { backgroundColor: theme.button.primary.background },
          ]}
        >
          <View style={styles.heroIconWrap}>
            <Icon name="star" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Your Voice Matters</Text>
          <Text style={styles.heroSubtitle}>
            Help us shape the app you love. Every piece of feedback directly
            influences what we build next.
          </Text>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatCard
            value="4.8★"
            label="Avg Rating"
            color={BaseColors.warning}
            bg={BaseColors.warning + '18'}
          />
          <StatCard
            value="1.2k"
            label="Reviews"
            color={BaseColors.primary}
            bg={BaseColors.primary + '18'}
          />
          <StatCard
            value="98%"
            label="Responded"
            color={BaseColors.success}
            bg={BaseColors.success + '18'}
          />
        </View>

        {/* ── In-app feedback card ── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.background.card,
              borderColor: theme.border.secondary,
            },
          ]}
        >
          <View style={styles.cardIconRow}>
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: theme.button.primary.background + '18' },
              ]}
            >
              <Icon
                name="rate_review"
                size={26}
                color={theme.button.primary.background}
              />
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>Quick</Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            Share In-App Feedback
          </Text>
          <Text
            style={[styles.cardDescription, { color: theme.text.secondary }]}
          >
            Rate your experience, report a bug, request a feature, or just tell
            us how you feel — it takes under 60 seconds.
          </Text>

          <View style={styles.featureList}>
            {[
              { icon: 'star' as const, text: 'Star rating + mood selector' },
              { icon: 'filter' as const, text: 'Categorised feedback' },
              { icon: 'info-circle' as const, text: 'Private & secure' },
            ].map(f => (
              <View key={f.text} style={styles.featureRow}>
                <Icon
                  name={f.icon}
                  size={16}
                  color={theme.button.primary.background}
                />
                <Text
                  style={[styles.featureText, { color: theme.text.secondary }]}
                >
                  {f.text}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.button.primary.background },
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Icon name="star" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Give Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* ── Store rating card ── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.background.card,
              borderColor: theme.border.secondary,
            },
          ]}
        >
          <View style={styles.cardIconRow}>
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: BaseColors.warning + '22' },
              ]}
            >
              <Icon
                name={Platform.OS === 'ios' ? 'apple' : 'star'}
                size={26}
                color={BaseColors.warning}
              />
            </View>
            <View
              style={[
                styles.cardBadge,
                { backgroundColor: BaseColors.warning + '22' },
              ]}
            >
              <Text
                style={[styles.cardBadgeText, { color: BaseColors.warning }]}
              >
                Public
              </Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            {Platform.OS === 'ios' ? 'Rate on App Store' : 'Rate on Play Store'}
          </Text>
          <Text
            style={[styles.cardDescription, { color: theme.text.secondary }]}
          >
            Love the app? Leave a public review on the{' '}
            {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}. It helps other
            users discover us and motivates the team.
          </Text>

          <View style={styles.storeStars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Text key={i} style={styles.storeStar}>
                ★
              </Text>
            ))}
          </View>
          <Text
            style={[styles.storeStarLabel, { color: theme.text.secondary }]}
          >
            Tap below to leave a 5-star review
          </Text>

          <TouchableOpacity
            style={[
              styles.storeBtn,
              {
                borderColor: BaseColors.warning,
                backgroundColor: BaseColors.warning + '14',
              },
            ]}
            onPress={openStore}
            activeOpacity={0.8}
          >
            <Icon
              name={Platform.OS === 'ios' ? 'apple' : 'star'}
              size={18}
              color={BaseColors.warning}
            />
            <Text style={[styles.storeBtnText, { color: BaseColors.warning }]}>
              Open {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
            </Text>
            <Icon name="chevron-right" size={16} color={BaseColors.warning} />
          </TouchableOpacity>
        </View>

        {/* ── Footer note ── */}
        <Text style={[styles.footerNote, { color: theme.text.tertiary }]}>
          We read every review and respond to every in-app submission.{'\n'}
          Your feedback drives our roadmap.
        </Text>
      </ScrollView>

      <FeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Hero
  hero: {
    borderRadius: 24,
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  // Card
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: BaseColors.primary + '1A',
  },
  cardBadgeText: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: BaseColors.primary,
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },

  // Feature list
  featureList: { gap: 10, marginBottom: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
  },

  // Primary button
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Store stars
  storeStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 6,
  },
  storeStar: { fontSize: 28, color: '#FFCC00' },
  storeStarLabel: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 18,
  },

  // Store button
  storeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  storeBtnText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },

  // Footer
  footerNote: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default FeedbackScreen;
