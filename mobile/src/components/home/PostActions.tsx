import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import { HeartIcon } from '@/components/icons/components/HeartIcon';
import { MessageCircleIcon } from '@/components/icons/components/MessageCircleIcon';
import ShareIcon from '@/components/icons/components/ShareIcon';
import { BookmarkIcon } from '@/components/icons/components/BookmarkIconComponent';

interface PostActionsProps {
  likes: number;
  comments: number;
  shares?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function PostActions({
  likes: initialLikes,
  comments,
  shares = 0,
  onLike,
  onComment,
  onShare,
  onSave,
  isLiked: initialIsLiked = false,
  isSaved: initialIsSaved = false,
}: PostActionsProps) {
  const { theme } = useTheme();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border.primary,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.secondary,
    },
    actionIcon: {
      width: 16,
      height: 16,
    },
    likedText: {
      color: '#149B5F',
      fontWeight: '800',
    },
    saveAction: {
      marginLeft: 'auto',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.action}
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <HeartIcon
          width={15}
          height={15}
          color={isLiked ? '#149B5F' : theme.text.secondary}
          fill={isLiked}
        />
        <CustomText
          style={[styles.actionText, isLiked && styles.likedText]}
        >
          {formatNumber(likes)}
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        onPress={onComment}
        activeOpacity={0.7}
      >
        <MessageCircleIcon
          width={15}
          height={15}
          color={theme.text.secondary}
        />
        <CustomText style={styles.actionText}>{comments}</CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        onPress={onShare}
        activeOpacity={0.7}
      >
        <ShareIcon width={15} height={15} color={theme.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.action, styles.saveAction]}
        onPress={handleSave}
        activeOpacity={0.7}
      >
        <BookmarkIcon
          width={15}
          height={15}
          color={theme.text.secondary}
          fill={isSaved}
        />
      </TouchableOpacity>
    </View>
  );
}
