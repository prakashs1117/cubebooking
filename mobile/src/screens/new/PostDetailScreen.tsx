import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { useAuth } from '@context/AuthContext';
import CustomText from '@components/common/CustomText';
import {
  usePost,
  usePostComments,
  useLikePost,
  useSharePost,
  useAddComment,
  useDeleteComment,
} from '@hooks/usePosts';
import type { HomeStackParamList } from '@navigation/types';
import type { PostComment } from '@services/api/posts.service';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'PostDetail'>;
type RouteProps = RouteProp<HomeStackParamList, 'PostDetail'>;

const TYPE_BADGE: Record<string, { emoji: string; color: string; bg: string }> = {
  announcement: { emoji: '📢', color: '#60a5fa', bg: 'rgba(0,120,255,0.1)' },
  kudos:        { emoji: '🏆', color: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
  blog:         { emoji: '📝', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  news:         { emoji: '📰', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
};

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { postId } = route.params;
  const { state: authState } = useAuth();

  const [commentText, setCommentText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = usePostComments(postId, true);
  const { mutate: likePost } = useLikePost();
  const { mutate: sharePost } = useSharePost();
  const { mutate: addComment, isPending: addingComment } = useAddComment();
  const { mutate: deleteComment } = useDeleteComment();

  const currentUserId = (authState?.user as any)?.id ?? '';

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text || addingComment) return;
    addComment({ postId, text });
    setCommentText('');
  };

  const handleLongPressComment = (commentId: string, authorId: string) => {
    if (authorId !== currentUserId) return;
    Alert.alert('Delete comment', 'Remove your comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteComment({ postId, commentId }),
      },
    ]);
  };

  if (postLoading || !post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.text.secondary} />
      </SafeAreaView>
    );
  }

  const badge = TYPE_BADGE[post.type] ?? TYPE_BADGE.blog;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.backHeader, { borderBottomColor: theme.border.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <CustomText variant="body" style={{ color: '#0078FF', fontSize: 20 }}>‹</CustomText>
          </TouchableOpacity>
          <CustomText variant="bodySmall" style={[styles.backTitle, { color: theme.text.primary }]}>
            Post
          </CustomText>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={[styles.postSection, { borderBottomColor: theme.border.primary }]}>
            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: post.authorGradient?.[0] ?? '#0078FF' }]}>
                <CustomText variant="caption" style={styles.avatarText}>
                  {post.authorInitials}
                </CustomText>
              </View>
              <View style={{ flex: 1 }}>
                <CustomText variant="bodySmall" style={{ fontWeight: '700', color: theme.text.primary }}>
                  {post.authorName}
                </CustomText>
                <View style={styles.metaRow}>
                  <CustomText variant="caption" style={{ color: theme.text.tertiary }}>
                    {post.authorRole} · {timeAgo(post.createdAt)}
                  </CustomText>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <CustomText variant="caption" style={[styles.badgeText, { color: badge.color }]}>
                      {badge.emoji} {post.type}
                    </CustomText>
                  </View>
                </View>
              </View>
            </View>

            {post.title ? (
              <CustomText variant="heading3" style={[styles.postTitle, { color: theme.text.primary }]}>
                {post.title}
              </CustomText>
            ) : null}

            <CustomText variant="body" style={[styles.postContent, { color: theme.text.secondary }]}>
              {post.content}
            </CustomText>

            {post.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {post.tags.map(tag => (
                  <View key={tag} style={[styles.tag, { backgroundColor: theme.background.secondary, borderColor: theme.border.primary }]}>
                    <CustomText variant="caption" style={[styles.tagText, { color: theme.text.tertiary }]}>
                      {tag}
                    </CustomText>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.statsRow, { borderTopColor: theme.border.primary, borderBottomColor: theme.border.primary }]}>
              <CustomText variant="caption" style={{ color: theme.text.tertiary }}>♥ {post.likeCount} likes</CustomText>
              <CustomText variant="caption" style={{ color: theme.text.tertiary }}>💬 {post.commentCount} comments</CustomText>
              <CustomText variant="caption" style={{ color: theme.text.tertiary }}>↗ {post.shareCount} shares</CustomText>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => likePost(postId)}>
                <CustomText variant="caption" style={[styles.actionText, post.liked ? styles.likedText : { color: theme.text.tertiary }]}>
                  ♥ Like
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => inputRef.current?.focus()}>
                <CustomText variant="caption" style={[styles.actionText, { color: theme.text.tertiary }]}>
                  💬 Comment
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => sharePost(postId)}>
                <CustomText variant="caption" style={[styles.actionText, { color: theme.text.tertiary }]}>
                  ↗ Share
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <CustomText variant="caption" style={[styles.sectionLabel, { color: theme.text.tertiary }]}>
              COMMENTS
            </CustomText>
            {commentsLoading ? (
              <ActivityIndicator style={{ padding: 12 }} color={theme.text.secondary} />
            ) : (
              (comments ?? []).map((comment: PostComment) => (
                <TouchableOpacity
                  key={comment.id}
                  style={[styles.commentRow, { borderBottomColor: theme.border.primary }]}
                  onLongPress={() => handleLongPressComment(comment.id, comment.authorId)}
                  delayLongPress={500}
                >
                  <View style={[styles.commentAvatar, { backgroundColor: '#a855f7' }]}>
                    <CustomText variant="caption" style={styles.avatarText}>
                      {comment.authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </CustomText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <CustomText variant="caption" style={{ fontWeight: '700', color: theme.text.primary }}>
                      {comment.authorName}
                    </CustomText>
                    <CustomText variant="caption" style={{ color: theme.text.secondary, marginVertical: 2 }}>
                      {comment.text}
                    </CustomText>
                    <CustomText variant="caption" style={{ color: theme.text.tertiary, fontSize: 10 }}>
                      {timeAgo(comment.createdAt)}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.commentInput, { backgroundColor: theme.background.primary, borderTopColor: theme.border.primary }]}>
          <View style={[styles.commentAvatar, { backgroundColor: '#0078FF' }]}>
            <CustomText variant="caption" style={styles.avatarText}>
              {(authState?.user as any)?.firstName?.[0] ?? 'U'}
            </CustomText>
          </View>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.border.primary }]}
            placeholder="Add a comment…"
            placeholderTextColor={theme.text.tertiary}
            value={commentText}
            onChangeText={setCommentText}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSubmitComment}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: commentText.trim() ? 1 : 0.4 }]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || addingComment}
          >
            <CustomText variant="caption" style={styles.sendText}>↗</CustomText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 8, paddingRight: 4 },
  backTitle: { fontWeight: '700', fontSize: 14 },
  postSection: { padding: 16, borderBottomWidth: 1 },
  authorRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  postTitle: { fontWeight: '800', marginBottom: 8 },
  postContent: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 14, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 10 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { padding: 4 },
  actionText: { fontSize: 13 },
  likedText: { color: '#ef4444' },
  commentsSection: { paddingTop: 4 },
  sectionLabel: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  commentRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentInput: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  textInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, fontSize: 13, borderWidth: 1 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0078FF', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 14 },
});
