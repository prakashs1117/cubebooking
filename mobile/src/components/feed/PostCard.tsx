import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import GradientAvatar from '@components/common/GradientAvatar';
import BadgePill from '@components/common/BadgePill';
import MerckCard from '@components/common/MerckCard';
import { MCPost, FeedCategory } from '@data/mockFeed';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

const CATEGORY_COLORS: Record<FeedCategory, string> = {
  Healthcare: MERCK_TOKENS.green,
  Learning: MERCK_TOKENS.accentBlue,
  Culture: MERCK_TOKENS.accentAmber,
};

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CommentIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M16 6l-4-4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2v13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

interface PostCardProps {
  post: MCPost;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const catColor = CATEGORY_COLORS[post.category];

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c: number) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c: number) => c + 1);
    }
  };

  return (
    <MerckCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <GradientAvatar initials={post.initials} gradientIndex={post.gradientIndex} size={38} />
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>{post.name}</Text>
          <Text style={styles.role} numberOfLines={1}>{post.role} · {post.timestamp}</Text>
        </View>
        <BadgePill value={post.category} variant="category" color={catColor} />
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={compact ? 3 : undefined}>
        {post.content}
      </Text>

      {/* Engagement */}
      <View style={styles.engagementRow}>
        <TouchableOpacity onPress={handleLike} style={styles.engBtn} activeOpacity={0.7}>
          <HeartIcon filled={liked} color={liked ? '#E5484D' : MERCK_TOKENS.tabInactive} />
          <Text style={[styles.engText, liked && { color: '#E5484D' }]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engBtn} activeOpacity={0.7}>
          <CommentIcon color={MERCK_TOKENS.tabInactive} />
          <Text style={styles.engText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engBtn} activeOpacity={0.7}>
          <ShareIcon color={MERCK_TOKENS.tabInactive} />
          <Text style={styles.engText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </MerckCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  meta: {
    flex: 1,
  },
  name: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  role: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  content: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MERCK_TOKENS.borderDefault,
    paddingTop: Spacing.md,
    marginTop: 2,
  },
  engBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  engText: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
