import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import Avatar from '@/components/common/Avatar';
import Chip from '@/components/common/Chip';
import PostActions from './PostActions';
import { PlayIcon } from '@/components/icons/components/PlayIcon';
import { AwardIcon } from '@/components/icons/components/AwardIcon';

interface FeedPostProps {
  id: string;
  author: {
    name: string;
    role: string;
    timestamp: string;
    initials: string;
    gradient?: [string, string];
  };
  type: 'blog' | 'kudos' | 'news';
  title?: string;
  content: string;
  media?: {
    type: 'video' | 'image' | 'none';
    label?: string;
  };
  kudos?: {
    title: string;
    description: string;
  };
  metrics: {
    likes: number;
    comments: number;
    shares?: number;
  };
  userActions?: {
    liked: boolean;
    saved: boolean;
  };
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export default function FeedPost({
  id,
  author,
  type,
  title,
  content,
  media,
  kudos,
  metrics,
  userActions = { liked: false, saved: false },
  onPress,
  onLike,
  onComment,
  onShare,
  onSave,
}: FeedPostProps) {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    postHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 13,
    },
    who: {
      flex: 1,
      minWidth: 0,
    },
    whoName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 3,
    },
    whoMeta: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
      lineHeight: 16,
    },
    content: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.6,
      color: theme.text.primary,
      marginBottom: 12,
    },
    contentTitle: {
      fontWeight: '800',
      fontSize: 15,
      marginBottom: 8,
    },
    media: {
      marginTop: 12,
      borderRadius: 12,
      height: 140,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    mediaContent: {
      alignItems: 'center',
      gap: 12,
    },
    mediaText: {
      color: 'rgba(255,255,255,0.95)',
      fontWeight: '700',
      fontSize: 14,
      textAlign: 'center',
    },
    kudosStrip: {
      marginTop: 12,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: isDark
        ? 'rgba(255,200,50,.15)'
        : '#FFF9E6',
      borderWidth: 1.5,
      borderStyle: 'solid',
      borderColor: isDark
        ? 'rgba(255,200,50,.4)'
        : 'rgba(255,200,50,.6)',
      marginBottom: 12,
    },
    medalContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#FFC832',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    kudosText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 2,
    },
    kudosDescription: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
    },
  });

  const getMediaGradient = () => {
    switch (type) {
      case 'blog':
        return { start: '#0B5A37', end: '#2DBECD' };
      case 'news':
        return { start: '#F4A460', end: '#FFB84D' };
      default:
        return { start: '#1E3C72', end: '#2A5298' };
    }
  };

  const { start: mediaStart } = getMediaGradient();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.postHead}>
        <Avatar initials={author.initials} size="md" gradient={author.gradient} />
        <View style={styles.who}>
          <CustomText style={styles.whoName} numberOfLines={1}>
            {author.name}
          </CustomText>
          <CustomText style={styles.whoMeta}>
            {author.role} · {author.timestamp}
          </CustomText>
        </View>
        <Chip label={type} type={type} />
      </View>

      {title && (
        <CustomText style={[styles.content, styles.contentTitle]}>
          {title}
        </CustomText>
      )}

      <CustomText style={styles.content}>{content}</CustomText>

      {media && media.type !== 'none' && (
        <View style={[styles.media, { backgroundColor: mediaStart }]}>
          <View style={styles.mediaContent}>
            {media.type === 'video' && (
              <>
                <PlayIcon width={26} height={26} color="rgba(255,255,255,0.92)" />
                <CustomText style={styles.mediaText}>
                  {media.label || '5 min read · with video'}
                </CustomText>
              </>
            )}
            {media.type === 'image' && (
              <CustomText style={styles.mediaText}>
                {media.label || 'Gallery'}
              </CustomText>
            )}
          </View>
        </View>
      )}

      {kudos && (
        <View style={styles.kudosStrip}>
          <View style={styles.medalContainer}>
            <AwardIcon width={18} height={18} color="#7A5200" />
          </View>
          <View>
            <CustomText style={styles.kudosText}>{kudos.title}</CustomText>
            <CustomText style={styles.kudosDescription}>
              {kudos.description}
            </CustomText>
          </View>
        </View>
      )}

      <PostActions
        likes={metrics.likes}
        comments={metrics.comments}
        shares={metrics.shares}
        isLiked={userActions.liked}
        isSaved={userActions.saved}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
        onSave={onSave}
      />
    </TouchableOpacity>
  );
}
