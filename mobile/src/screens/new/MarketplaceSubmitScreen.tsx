import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '@theme/index';
import { MERCK_TOKENS } from '@theme/merckTokens';
import CustomText from '@components/common/CustomText';
import { useSubmitPlugin } from '@hooks/useMarketplace';
import type { PluginType } from '@services/api/marketplace.service';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

const TYPE_OPTIONS: Array<{ value: PluginType; label: string; emoji: string; desc: string }> = [
  { value: 'plugin', label: 'Plugin',  emoji: '📦', desc: 'Tool or integration' },
  { value: 'skill',  label: 'Skill',   emoji: '✨', desc: 'Claude skill / slash command' },
  { value: 'agent',  label: 'Agent',   emoji: '🤖', desc: 'Autonomous AI agent' },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <CustomText variant="caption" style={[submitStyles.fieldLabel, { color: theme.text.secondary }]}>
        {label}{required && <CustomText style={{ color: '#EF4444' }}> *</CustomText>}
      </CustomText>
      {children}
    </View>
  );
}

export default function MarketplaceSubmitScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { mutate: submitPlugin, isPending } = useSubmitPlugin();

  const [pluginType, setPluginType] = useState<PluginType>('plugin');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [version, setVersion] = useState('');
  const [license, setLicense] = useState('');
  const [marketplaceCmd, setMarketplaceCmd] = useState('');
  const [installCmd, setInstallCmd] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [topics, setTopics] = useState('');
  const [keywords, setKeywords] = useState('');

  const inputStyle = [submitStyles.input, { color: theme.text.primary, backgroundColor: theme.background.secondary, borderColor: theme.border.primary }];

  function splitTags(raw: string) {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }

  function handleSubmit() {
    if (!name.trim()) { Alert.alert('Required', 'Plugin name is required'); return; }
    if (!description.trim() || description.trim().length < 10) { Alert.alert('Required', 'Description must be at least 10 characters'); return; }
    if (!repositoryUrl.trim()) { Alert.alert('Required', 'Repository URL is required'); return; }

    submitPlugin(
      {
        name: name.trim(),
        pluginType,
        description: description.trim(),
        repositoryUrl: repositoryUrl.trim(),
        version: version.trim() || undefined,
        license: license.trim() || undefined,
        marketplaceCmd: marketplaceCmd.trim() || undefined,
        installCmd: installCmd.trim() || undefined,
        tags: {
          technologies: splitTags(technologies),
          topics: splitTags(topics),
          categories: [],
          keywords: splitTags(keywords),
        },
        components: [],
        safetySignals: [],
      },
      {
        onSuccess: () => {
          Alert.alert('Submitted!', 'Your plugin has been submitted for review.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.message ?? 'Submission failed');
        },
      },
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[submitStyles.container, { backgroundColor: theme.background.primary }]}>
      {/* Navbar */}
      <View style={[submitStyles.navbar, { borderBottomColor: theme.border.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={theme.text.primary} />
        </TouchableOpacity>
        <CustomText variant="bodyMedium" style={[submitStyles.navTitle, { color: theme.text.primary }]}>
          Submit to Marketplace
        </CustomText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={submitStyles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Type selector */}
        <View style={submitStyles.card}>
          <CustomText variant="bodyMedium" style={[submitStyles.cardTitle, { color: theme.text.primary }]}>Type</CustomText>
          <View style={submitStyles.typeRow}>
            {TYPE_OPTIONS.map(opt => {
              const active = pluginType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    submitStyles.typeOption,
                    { borderColor: active ? MERCK_TOKENS.green : theme.border.primary, backgroundColor: active ? MERCK_TOKENS.green + '15' : theme.background.secondary },
                  ]}
                  onPress={() => setPluginType(opt.value)}
                >
                  <CustomText style={{ fontSize: 22 }}>{opt.emoji}</CustomText>
                  <CustomText variant="caption" style={[submitStyles.typeLabel, { color: active ? MERCK_TOKENS.green : theme.text.primary }]}>{opt.label}</CustomText>
                  <CustomText variant="caption" style={[submitStyles.typeDesc, { color: theme.text.secondary }]}>{opt.desc}</CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Basics */}
        <View style={submitStyles.card}>
          <CustomText variant="bodyMedium" style={[submitStyles.cardTitle, { color: theme.text.primary }]}>Basics</CustomText>
          <View style={{ gap: 12 }}>
            <Field label="Name" required>
              <TextInput value={name} onChangeText={setName} placeholder="My awesome plugin" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} style={inputStyle} />
            </Field>
            <Field label="Description" required>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What does it do? (min 10 chars)"
                placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
                multiline
                numberOfLines={4}
                style={[inputStyle, { textAlignVertical: 'top', minHeight: 90 }]}
              />
            </Field>
          </View>
        </View>

        {/* Repository */}
        <View style={submitStyles.card}>
          <CustomText variant="bodyMedium" style={[submitStyles.cardTitle, { color: theme.text.primary }]}>Repository & Version</CustomText>
          <View style={{ gap: 12 }}>
            <Field label="Repository URL" required>
              <TextInput value={repositoryUrl} onChangeText={setRepositoryUrl} placeholder="https://gitlab.com/your/repo" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} autoCapitalize="none" keyboardType="url" style={inputStyle} />
            </Field>
            <View style={submitStyles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Version">
                  <TextInput value={version} onChangeText={setVersion} placeholder="1.0.0" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} style={inputStyle} />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="License">
                  <TextInput value={license} onChangeText={setLicense} placeholder="MIT" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} style={inputStyle} />
                </Field>
              </View>
            </View>
          </View>
        </View>

        {/* Install commands */}
        <View style={submitStyles.card}>
          <CustomText variant="bodyMedium" style={[submitStyles.cardTitle, { color: theme.text.primary }]}>Install Commands</CustomText>
          <View style={{ gap: 12 }}>
            <Field label="Marketplace add command">
              <TextInput value={marketplaceCmd} onChangeText={setMarketplaceCmd} placeholder="claude marketplace add ..." placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} autoCapitalize="none" style={[inputStyle, { fontFamily: 'Courier' }]} />
            </Field>
            <Field label="Install command">
              <TextInput value={installCmd} onChangeText={setInstallCmd} placeholder="claude install ..." placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} autoCapitalize="none" style={[inputStyle, { fontFamily: 'Courier' }]} />
            </Field>
          </View>
        </View>

        {/* Tags */}
        <View style={submitStyles.card}>
          <CustomText variant="bodyMedium" style={[submitStyles.cardTitle, { color: theme.text.primary }]}>Tags</CustomText>
          <CustomText variant="caption" style={[submitStyles.hint, { color: theme.text.secondary }]}>Comma-separated values</CustomText>
          <View style={{ gap: 12, marginTop: 8 }}>
            <Field label="Technologies">
              <TextInput value={technologies} onChangeText={setTechnologies} placeholder="TypeScript, Node.js, React" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} style={inputStyle} />
            </Field>
            <Field label="Topics">
              <TextInput value={topics} onChangeText={setTopics} placeholder="developer-tools, automation" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} style={inputStyle} />
            </Field>
            <Field label="Keywords">
              <TextInput value={keywords} onChangeText={setKeywords} placeholder="token-savings, ai" placeholderTextColor={theme.text.tertiary ?? theme.text.secondary} style={inputStyle} />
            </Field>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[submitStyles.submitBtn, { backgroundColor: MERCK_TOKENS.green, opacity: isPending ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending
            ? <ActivityIndicator color="#fff" />
            : <CustomText variant="bodyMedium" style={submitStyles.submitBtnText}>Submit for Review</CustomText>}
        </TouchableOpacity>

        <CustomText variant="caption" style={[submitStyles.disclaimer, { color: theme.text.secondary }]}>
          Submitted plugins are reviewed by admins before appearing in the marketplace.
        </CustomText>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const submitStyles = StyleSheet.create({
  container: { flex: 1 },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  navTitle: { flex: 1, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  scroll: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, gap: 12, backgroundColor: 'transparent' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  row2: { flexDirection: 'row', gap: 10 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeOption: { flex: 1, borderRadius: 14, borderWidth: 2, padding: 12, alignItems: 'center', gap: 4 },
  typeLabel: { fontSize: 13, fontWeight: '700' },
  typeDesc: { fontSize: 10, textAlign: 'center', lineHeight: 13 },
  hint: { fontSize: 12 },
  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { textAlign: 'center', fontSize: 12, lineHeight: 17 },
});
