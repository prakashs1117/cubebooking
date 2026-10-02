import React, { useState, forwardRef, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme';
import { useAuth } from '@context/AuthContext';
import CustomText from '@components/common/CustomText';
import { useCreatePost } from '@hooks/usePosts';

type PostType = 'blog' | 'news' | 'kudos' | 'announcement';

const POST_TYPES: { type: PostType; emoji: string; label: string }[] = [
  { type: 'announcement', emoji: '📢', label: 'Announce' },
  { type: 'blog',         emoji: '📝', label: 'Blog' },
  { type: 'news',         emoji: '📰', label: 'News' },
  { type: 'kudos',        emoji: '🏆', label: 'Kudos' },
];

const TYPE_ACTIVE: Record<PostType, { color: string; bg: string; border: string }> = {
  announcement: { color: '#60a5fa', bg: 'rgba(0,120,255,0.12)', border: 'rgba(0,120,255,0.35)' },
  blog:         { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)' },
  news:         { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  kudos:        { color: '#c084fc', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)' },
};

const CreatePostSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const { theme } = useTheme();
  const authCtx = useAuth();
  const { mutate: createPost, isPending } = useCreatePost();

  const [postType, setPostType] = useState<PostType>('blog');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');

  const snapPoints = useMemo(() => ['75%', '92%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const dismiss = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
  };

  const handlePost = () => {
    if (!content.trim() || isPending) return;

    const user = authCtx.user as any;
    const firstName: string = user?.firstName ?? 'U';
    const lastName: string = user?.lastName ?? '';
    const initials = (firstName[0] + (lastName[0] ?? '')).toUpperCase();

    const tags = tagsRaw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    createPost(
      {
        type: postType,
        title: title.trim() || undefined,
        content: content.trim(),
        tags,
        authorInitials: initials,
        authorGradient: ['#0078FF', '#2DBECD'],
      },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setTagsRaw('');
          setPostType('blog');
          dismiss();
        },
      },
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.background.primary }}
      handleIndicatorStyle={{ backgroundColor: theme.border.primary }}
    >
      <BottomSheetView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={[styles.sheetHeader, { borderBottomColor: theme.border.primary }]}>
          <TouchableOpacity onPress={dismiss}>
            <CustomText variant="body" style={{ color: theme.text.tertiary, fontSize: 14 }}>
              Cancel
            </CustomText>
          </TouchableOpacity>
          <CustomText variant="bodySmall" style={{ fontWeight: '700', color: theme.text.primary }}>
            New Post
          </CustomText>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!content.trim() || isPending}
            style={[styles.postBtn, { opacity: content.trim() && !isPending ? 1 : 0.4 }]}
          >
            <CustomText variant="caption" style={styles.postBtnText}>
              {isPending ? '…' : 'Post'}
            </CustomText>
          </TouchableOpacity>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={[styles.authorRow, { borderBottomColor: theme.border.primary }]}>
            <View style={styles.avatar}>
              <CustomText variant="caption" style={styles.avatarText}>
                {(authCtx.user as any)?.firstName?.[0] ?? 'U'}
              </CustomText>
            </View>
            <View>
              <CustomText variant="bodySmall" style={{ fontWeight: '700', color: theme.text.primary }}>
                {(authCtx.user as any)?.firstName ?? 'User'} {(authCtx.user as any)?.lastName ?? ''}
              </CustomText>
              <CustomText variant="caption" style={{ color: theme.text.tertiary }}>
                {(authCtx.user as any)?.role ?? 'Member'}
              </CustomText>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.typeRow, { borderBottomColor: theme.border.primary }]}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {POST_TYPES.map(({ type, emoji, label }) => {
              const active = postType === type;
              const s = TYPE_ACTIVE[type];
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? s.bg : theme.background.secondary,
                      borderColor: active ? s.border : theme.border.primary,
                    },
                  ]}
                  onPress={() => setPostType(type)}
                >
                  <CustomText
                    variant="caption"
                    style={[styles.chipText, { color: active ? s.color : theme.text.tertiary }]}
                  >
                    {emoji} {label}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.fieldRow, { borderBottomColor: theme.border.primary }]}>
            <TextInput
              style={[styles.titleInput, { color: theme.text.primary }]}
              placeholder="Post title (optional)"
              placeholderTextColor={theme.text.tertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.contentInput, { color: theme.text.primary }]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.text.tertiary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
          </View>

          <View style={[styles.fieldRow, { borderTopColor: theme.border.primary }]}>
            <CustomText variant="caption" style={[styles.fieldLabel, { color: theme.text.tertiary }]}>
              🏷️ Tags (comma-separated)
            </CustomText>
            <TextInput
              style={[styles.tagsInput, { color: theme.text.primary }]}
              placeholder="clinical, Q3, results"
              placeholderTextColor={theme.text.tertiary}
              value={tagsRaw}
              onChangeText={setTagsRaw}
            />
          </View>

          <CustomText
            variant="caption"
            style={[styles.charCount, { color: content.length > 4800 ? '#ef4444' : theme.text.tertiary }]}
          >
            {content.length} / 5000
          </CustomText>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CreatePostSheet.displayName = 'CreatePostSheet';

export default CreatePostSheet;

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  postBtn: {
    backgroundColor: '#0078FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  postBtnText: { color: '#fff', fontWeight: '700' },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0078FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  typeRow: { paddingVertical: 10, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  fieldLabel: { fontSize: 11, marginBottom: 4 },
  titleInput: { fontSize: 15, fontWeight: '700', paddingVertical: 4 },
  contentInput: { fontSize: 14, lineHeight: 22, minHeight: 100 },
  tagsInput: { fontSize: 13, paddingVertical: 4 },
  charCount: { textAlign: 'right', paddingHorizontal: 16, paddingTop: 6, fontSize: 11 },
});
