import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '@theme/index';
import { MERCK_TOKENS } from '@theme/merckTokens';
import CustomText from '@components/common/CustomText';
import CustomHeader from '@components/navigation/CustomHeader';
import { useDrawerNavigation } from '@hooks/useDrawerNavigation';
import { faqService, type FAQ } from '@services/api/faq.service';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

function ClearIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

function ChevronIcon({ color, rotated }: { color: string; rotated: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: [{ rotate: rotated ? '180deg' : '0deg' }] }}>
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function HelpIcon({ color }: { color: string }) {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </Svg>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQAccordionItem({ faq, index }: { faq: FAQ; index: number }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !open;
    setOpen(next);
    Animated.timing(fadeAnim, {
      toValue: next ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={[
        styles.faqItem,
        {
          backgroundColor: theme.background.card ?? theme.background.secondary,
          borderColor: theme.border.primary,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={toggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={[styles.faqNumber, { backgroundColor: open ? MERCK_TOKENS.green + '18' : theme.background.tertiary ?? theme.border.primary }]}>
          <CustomText variant="caption" style={[styles.faqNumberText, { color: open ? MERCK_TOKENS.green : theme.text.secondary }]}>
            {String(index + 1).padStart(2, '0')}
          </CustomText>
        </View>
        <CustomText variant="bodyMedium" style={[styles.faqQuestion, { color: theme.text.primary }]} numberOfLines={open ? undefined : 2}>
          {faq.question}
        </CustomText>
        <ChevronIcon color={open ? MERCK_TOKENS.green : theme.text.secondary} rotated={open} />
      </TouchableOpacity>

      {open && (
        <Animated.View style={[styles.faqAnswerWrap, { opacity: fadeAnim }]}>
          <View style={[styles.faqDivider, { backgroundColor: theme.border.primary }]} />
          <CustomText variant="body" style={[styles.faqAnswer, { color: theme.text.secondary }]}>
            {faq.answer}
          </CustomText>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FAQScreen() {
  const { theme } = useTheme();
  const drawerNav = useDrawerNavigation();
  const [search, setSearch] = useState('');

  const { data: faqs = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => faqService.list(),
    staleTime: 5 * 60_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q),
    );
  }, [faqs, search]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <HelpIcon color={theme.text.tertiary ?? theme.text.secondary} />
        <CustomText variant="bodyMedium" style={[styles.emptyTitle, { color: theme.text.primary }]}>
          {search ? 'No results found' : 'No FAQs yet'}
        </CustomText>
        <CustomText variant="caption" style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
          {search ? 'Try a different search term' : 'Check back soon'}
        </CustomText>
      </View>
    );
  }, [isLoading, search, theme]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomHeader variant="merck" showHamburger onHamburgerPress={() => drawerNav.openDrawer()} />

      {/* Page title */}
      <View style={[styles.titleSection, { borderBottomColor: theme.border.primary }]}>
        <CustomText variant="h3" style={[styles.pageTitle, { color: theme.text.primary }]}>
          FAQ
        </CustomText>
        {!isLoading && faqs.length > 0 && (
          <CustomText variant="caption" style={[styles.countBadge, { color: theme.text.secondary }]}>
            {filtered.length} of {faqs.length}
          </CustomText>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}>
        <SearchIcon color={theme.text.tertiary ?? theme.text.secondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions…"
          placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
          style={[styles.searchInput, { color: theme.text.primary }]}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ClearIcon color={theme.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={MERCK_TOKENS.green} />
          <CustomText variant="caption" style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading FAQs…
          </CustomText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={MERCK_TOKENS.green} />
          }
        >
          {filtered.length === 0
            ? renderEmpty()
            : filtered.map((faq, i) => (
                <FAQAccordionItem key={faq.id} faq={faq} index={i} />
              ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  countBadge: { fontSize: 12 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  faqItem: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 58,
  },
  faqNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  faqNumberText: { fontSize: 11, fontWeight: '700' },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  faqAnswerWrap: { paddingBottom: 16 },
  faqDivider: { height: 1, marginHorizontal: 14, marginBottom: 14 },
  faqAnswer: { fontSize: 14, lineHeight: 22, paddingHorizontal: 14 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13 },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
