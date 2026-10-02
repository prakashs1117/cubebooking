import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { useTheme } from '@theme/index';
import { MERCK_TOKENS } from '@theme/merckTokens';
import CustomText from '@components/common/CustomText';
import { usePlugin, useDeletePlugin, useSubmitFeedback, usePluginFeedback } from '@hooks/useMarketplace';
import { useAuth } from '@context/AuthContext';
import type { MarketplaceStackParamList } from '@navigation/types';
import type { PluginType, SafetyLevel, FeedbackType, ComponentType } from '@services/api/marketplace.service';

type NavProp = NativeStackNavigationProp<MarketplaceStackParamList, 'MarketplaceDetail'>;
type RouteT = RouteProp<MarketplaceStackParamList, 'MarketplaceDetail'>;

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}
function ExternalIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <Polyline points="15 3 21 3 21 9" />
      <Line x1="10" y1="14" x2="21" y2="3" />
    </Svg>
  );
}
function CopyIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="9" y="9" width="13" height="13" rx="2" />
      <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}
function TrashIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <Path d="M10 11v6M14 11v6" />
      <Path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Svg>
  );
}
function ShieldIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} opacity="0.2" />
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}
function ChevronDown({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}
function ChevronUp({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="18 15 12 9 6 15" />
    </Svg>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<PluginType, { label: string; accent: string; bg: string }> = {
  plugin: { label: 'Plugin', accent: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  skill:  { label: 'Skill',  accent: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  agent:  { label: 'Agent',  accent: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

const SAFETY_CFG: Record<SafetyLevel, { color: string; bg: string; emoji: string }> = {
  caution: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', emoji: '⚠️' },
  warning: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  emoji: '🚨' },
  info:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', emoji: 'ℹ️' },
};

const COMP_CFG: Record<ComponentType, { color: string; bg: string }> = {
  agent:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  skill:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  hook:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  command: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
};

const FB_TYPES: Array<{ value: FeedbackType; label: string; emoji: string }> = [
  { value: 'bug',     label: 'Bug',     emoji: '🐛' },
  { value: 'idea',    label: 'Idea',    emoji: '💡' },
  { value: 'general', label: 'General', emoji: '💬' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(true);
  return (
    <View style={[detailStyles.section, { borderColor: theme.border.primary }]}>
      <TouchableOpacity style={detailStyles.sectionHeader} onPress={() => setOpen(v => !v)} activeOpacity={0.7}>
        <CustomText variant="bodyMedium" style={[detailStyles.sectionTitle, { color: theme.text.primary }]}>{title}</CustomText>
        {open ? <ChevronUp color={theme.text.secondary} /> : <ChevronDown color={theme.text.secondary} />}
      </TouchableOpacity>
      {open && <View style={detailStyles.sectionBody}>{children}</View>}
    </View>
  );
}

function CodeBlock({ code }: { code: string }) {
  const { theme } = useTheme();
  return (
    <View style={[detailStyles.codeBlock, { backgroundColor: theme.background.secondary ?? '#111' }]}>
      <CustomText variant="caption" style={detailStyles.codeText}>{code}</CustomText>
    </View>
  );
}

function TagPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[detailStyles.pill, { backgroundColor: bg }]}>
      <CustomText variant="caption" style={[detailStyles.pillText, { color }]}>{label}</CustomText>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MarketplaceDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteT>();
  const { user } = useAuth();

  const { pluginId } = route.params;
  const { data: plugin, isLoading, error } = usePlugin(pluginId);
  const { mutate: deletePlugin, isPending: deleting } = useDeletePlugin();
  const { mutate: submitFeedback, isPending: sendingFb } = useSubmitFeedback();
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbType, setFbType] = useState<FeedbackType>('general');
  const [fbMsg, setFbMsg] = useState('');
  const { data: feedbacks } = usePluginFeedback(pluginId, showFeedback);

  if (isLoading) {
    return (
      <SafeAreaView style={[detailStyles.container, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity style={detailStyles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon color={theme.text.primary} />
        </TouchableOpacity>
        <View style={detailStyles.center}>
          <ActivityIndicator size="large" color={MERCK_TOKENS.green} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !plugin) {
    return (
      <SafeAreaView style={[detailStyles.container, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity style={detailStyles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon color={theme.text.primary} />
        </TouchableOpacity>
        <View style={detailStyles.center}>
          <CustomText variant="bodyMedium" style={{ color: theme.text.secondary }}>Plugin not found</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = TYPE_CFG[plugin.pluginType] ?? TYPE_CFG.plugin;
  const isOwner = user?.id === plugin.authorId;
  const isAdmin = user?.roles?.some((r: string) => r === 'Admin' || r === 'Super Admin');
  const canDelete = isOwner || isAdmin;

  function handleDelete() {
    Alert.alert('Delete Plugin', `Remove "${plugin!.name}" from the marketplace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePlugin(plugin!._id, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }

  function handleSendFeedback() {
    if (!fbMsg.trim()) return;
    submitFeedback(
      { pluginId, type: fbType, message: fbMsg.trim() },
      {
        onSuccess: () => {
          setFbMsg('');
          Alert.alert('Thanks!', 'Feedback submitted.');
        },
      },
    );
  }

  const allTags = [
    ...(plugin.tags?.technologies ?? []),
    ...(plugin.tags?.topics ?? []),
    ...(plugin.tags?.categories ?? []),
    ...(plugin.tags?.keywords ?? []),
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[detailStyles.container, { backgroundColor: theme.background.primary }]}>
      {/* Nav bar */}
      <View style={[detailStyles.navbar, { borderBottomColor: theme.border.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={detailStyles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={theme.text.primary} />
        </TouchableOpacity>
        <CustomText variant="bodyMedium" style={[detailStyles.navTitle, { color: theme.text.primary }]} numberOfLines={1}>
          {plugin.name}
        </CustomText>
        {canDelete && (
          <TouchableOpacity onPress={handleDelete} disabled={deleting} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {deleting ? <ActivityIndicator size="small" color="#EF4444" /> : <TrashIcon color="#EF4444" />}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={detailStyles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[detailStyles.hero, { backgroundColor: cfg.bg }]}>
          <View style={detailStyles.heroTop}>
            <View style={[detailStyles.heroIcon, { backgroundColor: cfg.accent + '22' }]}>
              <CustomText style={{ fontSize: 32 }}>
                {plugin.pluginType === 'agent' ? '🤖' : plugin.pluginType === 'skill' ? '✨' : '📦'}
              </CustomText>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <CustomText variant="h3" style={[detailStyles.heroName, { color: theme.text.primary }]}>{plugin.name}</CustomText>
              <View style={detailStyles.heroMeta}>
                <View style={[detailStyles.typeBadge, { backgroundColor: cfg.accent }]}>
                  <CustomText variant="caption" style={detailStyles.typeBadgeText}>{cfg.label}</CustomText>
                </View>
                {plugin.version && (
                  <CustomText variant="caption" style={[{ color: theme.text.secondary, fontSize: 12 }]}>v{plugin.version}</CustomText>
                )}
                {plugin.license && (
                  <CustomText variant="caption" style={[{ color: theme.text.secondary, fontSize: 12 }]}>{plugin.license}</CustomText>
                )}
              </View>
              <CustomText variant="caption" style={{ color: theme.text.secondary, fontSize: 12 }}>
                by {plugin.authorName}
              </CustomText>
            </View>
          </View>
          <CustomText variant="caption" style={[detailStyles.heroDesc, { color: theme.text.secondary }]}>
            {plugin.description}
          </CustomText>
        </View>

        {/* Install commands */}
        {(plugin.marketplaceCmd || plugin.installCmd) && (
          <Section title="Installation">
            {plugin.marketplaceCmd && (
              <View style={{ gap: 4 }}>
                <CustomText variant="caption" style={[detailStyles.label, { color: theme.text.secondary }]}>Add marketplace source</CustomText>
                <CodeBlock code={plugin.marketplaceCmd} />
              </View>
            )}
            {plugin.installCmd && (
              <View style={{ gap: 4, marginTop: 8 }}>
                <CustomText variant="caption" style={[detailStyles.label, { color: theme.text.secondary }]}>Install</CustomText>
                <CodeBlock code={plugin.installCmd} />
              </View>
            )}
          </Section>
        )}

        {/* Repository */}
        <Section title="Repository">
          <TouchableOpacity
            style={[detailStyles.repoRow, { backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}
            onPress={() => Linking.openURL(plugin.repositoryUrl).catch(() => {})}
            activeOpacity={0.7}
          >
            <CustomText variant="caption" style={[detailStyles.repoUrl, { color: MERCK_TOKENS.green }]} numberOfLines={1}>
              {plugin.repositoryUrl}
            </CustomText>
            <ExternalIcon color={MERCK_TOKENS.green} size={15} />
          </TouchableOpacity>
        </Section>

        {/* Components */}
        {plugin.components?.length > 0 && (
          <Section title={`What's Inside (${plugin.components.length})`}>
            {plugin.components.map((comp, i) => {
              const cc = COMP_CFG[comp.componentType] ?? COMP_CFG.skill;
              return (
                <View key={i} style={[detailStyles.compRow, { backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}>
                  <View style={detailStyles.compHeader}>
                    <View style={[detailStyles.compTypePill, { backgroundColor: cc.bg }]}>
                      <CustomText variant="caption" style={[detailStyles.compTypePillText, { color: cc.color }]}>
                        {comp.componentType}
                      </CustomText>
                    </View>
                    {comp.invocation && (
                      <View style={[detailStyles.invocationPill, { backgroundColor: theme.background.primary }]}>
                        <CustomText variant="caption" style={[detailStyles.invocationText, { color: MERCK_TOKENS.teal }]}>
                          {comp.invocation}
                        </CustomText>
                      </View>
                    )}
                  </View>
                  {comp.name && (
                    <CustomText variant="bodyMedium" style={[detailStyles.compName, { color: theme.text.primary }]}>{comp.name}</CustomText>
                  )}
                  {comp.description && (
                    <CustomText variant="caption" style={[detailStyles.compDesc, { color: theme.text.secondary }]}>{comp.description}</CustomText>
                  )}
                  {comp.tools?.length > 0 && (
                    <View style={detailStyles.toolsRow}>
                      {comp.tools.map(t => (
                        <View key={t} style={[detailStyles.toolPill, { backgroundColor: theme.background.primary }]}>
                          <CustomText variant="caption" style={[detailStyles.toolText, { color: theme.text.secondary }]}>{t}</CustomText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </Section>
        )}

        {/* Safety signals */}
        {plugin.safetySignals?.length > 0 && (
          <Section title={`Safety Signals (${plugin.safetySignals.length})`}>
            {plugin.safetySignals.map((sig, i) => {
              const sc = SAFETY_CFG[sig.level] ?? SAFETY_CFG.info;
              return (
                <View key={i} style={[detailStyles.safetyRow, { backgroundColor: sc.bg, borderLeftColor: sc.color }]}>
                  <CustomText style={{ fontSize: 16 }}>{sc.emoji}</CustomText>
                  <View style={{ flex: 1, gap: 2 }}>
                    <CustomText variant="bodyMedium" style={[detailStyles.safetyTitle, { color: sc.color }]}>{sig.title}</CustomText>
                    {sig.detail && (
                      <CustomText variant="caption" style={[detailStyles.safetyDetail, { color: theme.text.secondary }]}>{sig.detail}</CustomText>
                    )}
                  </View>
                </View>
              );
            })}
          </Section>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <Section title="Tags">
            <View style={detailStyles.tagsWrap}>
              {(plugin.tags?.technologies ?? []).map(t => <TagPill key={t} label={t} color="#3B82F6" bg="rgba(59,130,246,0.1)" />)}
              {(plugin.tags?.topics ?? []).map(t => <TagPill key={t} label={t} color="#8B5CF6" bg="rgba(139,92,246,0.1)" />)}
              {(plugin.tags?.categories ?? []).map(t => <TagPill key={t} label={t} color="#10B981" bg="rgba(16,185,129,0.1)" />)}
              {(plugin.tags?.keywords ?? []).map(t => <TagPill key={t} label={t} color="#F59E0B" bg="rgba(245,158,11,0.1)" />)}
            </View>
          </Section>
        )}

        {/* Feedback */}
        <Section title="Feedback">
          <View style={{ gap: 10 }}>
            {/* Type selector */}
            <View style={detailStyles.fbTypeRow}>
              {FB_TYPES.map(ft => (
                <TouchableOpacity
                  key={ft.value}
                  style={[
                    detailStyles.fbTypeBtn,
                    fbType === ft.value
                      ? { backgroundColor: MERCK_TOKENS.green }
                      : { backgroundColor: theme.background.secondary, borderWidth: 1, borderColor: theme.border.primary },
                  ]}
                  onPress={() => setFbType(ft.value)}
                >
                  <CustomText variant="caption" style={[detailStyles.fbTypeBtnText, { color: fbType === ft.value ? '#fff' : theme.text.secondary }]}>
                    {ft.emoji} {ft.label}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message input */}
            <TextInput
              value={fbMsg}
              onChangeText={setFbMsg}
              placeholder="Share your feedback…"
              placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
              multiline
              numberOfLines={3}
              style={[detailStyles.fbInput, { color: theme.text.primary, backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}
            />

            <TouchableOpacity
              style={[detailStyles.fbSendBtn, { backgroundColor: MERCK_TOKENS.green, opacity: !fbMsg.trim() || sendingFb ? 0.5 : 1 }]}
              onPress={handleSendFeedback}
              disabled={!fbMsg.trim() || sendingFb}
            >
              {sendingFb
                ? <ActivityIndicator size="small" color="#fff" />
                : <CustomText variant="caption" style={detailStyles.fbSendBtnText}>Send Feedback</CustomText>}
            </TouchableOpacity>

            {/* Show feedbacks toggle */}
            <TouchableOpacity onPress={() => setShowFeedback(v => !v)} style={detailStyles.viewFbBtn}>
              <CustomText variant="caption" style={[detailStyles.viewFbText, { color: MERCK_TOKENS.green }]}>
                {showFeedback ? 'Hide' : 'View'} submitted feedback
              </CustomText>
            </TouchableOpacity>

            {showFeedback && feedbacks && feedbacks.length > 0 && (
              <View style={{ gap: 8 }}>
                {feedbacks.map(fb => {
                  const fbCfg = { bug: '#EF4444', idea: '#F59E0B', general: '#6B7280' }[fb.type];
                  return (
                    <View key={fb._id} style={[detailStyles.fbItem, { backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}>
                      <View style={detailStyles.fbItemHeader}>
                        <CustomText variant="caption" style={[detailStyles.fbItemAuthor, { color: theme.text.primary }]}>{fb.userName}</CustomText>
                        <View style={[detailStyles.fbItemType, { backgroundColor: fbCfg + '20' }]}>
                          <CustomText variant="caption" style={[detailStyles.fbItemTypeText, { color: fbCfg }]}>{fb.type}</CustomText>
                        </View>
                      </View>
                      <CustomText variant="caption" style={[detailStyles.fbItemMsg, { color: theme.text.secondary }]}>{fb.message}</CustomText>
                    </View>
                  );
                })}
              </View>
            )}
            {showFeedback && feedbacks?.length === 0 && (
              <CustomText variant="caption" style={[{ color: theme.text.secondary, textAlign: 'center', paddingVertical: 8 }]}>
                No feedback yet
              </CustomText>
            )}
          </View>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const detailStyles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 2 },
  navTitle: { flex: 1, fontSize: 16, fontWeight: '600' },

  scroll: { padding: 16, gap: 12 },

  hero: { borderRadius: 18, padding: 16, gap: 12 },
  heroTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  heroIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroName: { fontSize: 20, fontWeight: '700' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroDesc: { fontSize: 14, lineHeight: 21 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  section: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },

  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  codeBlock: { borderRadius: 10, padding: 12 },
  codeText: { fontFamily: 'Courier', fontSize: 12, color: '#10B981' },

  repoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  repoUrl: { flex: 1, fontSize: 13 },

  compRow: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  compHeader: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  compTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  compTypePillText: { fontSize: 11, fontWeight: '700' },
  invocationPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  invocationText: { fontSize: 11, fontWeight: '600', fontFamily: 'Courier' },
  compName: { fontSize: 14, fontWeight: '700' },
  compDesc: { fontSize: 13, lineHeight: 18 },
  toolsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  toolPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  toolText: { fontSize: 11 },

  safetyRow: { flexDirection: 'row', gap: 10, borderRadius: 10, padding: 12, borderLeftWidth: 3 },
  safetyTitle: { fontSize: 13, fontWeight: '700' },
  safetyDetail: { fontSize: 12, lineHeight: 17 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 12, fontWeight: '500' },

  fbTypeRow: { flexDirection: 'row', gap: 8 },
  fbTypeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  fbTypeBtnText: { fontSize: 12, fontWeight: '600' },
  fbInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, textAlignVertical: 'top', minHeight: 80 },
  fbSendBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  fbSendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  viewFbBtn: { alignItems: 'center', paddingVertical: 6 },
  viewFbText: { fontSize: 13, fontWeight: '600' },
  fbItem: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 4 },
  fbItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fbItemAuthor: { fontSize: 12, fontWeight: '600' },
  fbItemType: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  fbItemTypeText: { fontSize: 11, fontWeight: '600' },
  fbItemMsg: { fontSize: 13, lineHeight: 18 },
});
