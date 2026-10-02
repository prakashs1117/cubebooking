import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { FAQItem as FAQItemType } from '@/types/faq.types';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  item: FAQItemType;
  isExpanded?: boolean;
  onToggle?: () => void;
}

/**
 * FAQItem
 *
 * Expandable/collapsible FAQ item with beautiful animations
 */
export const FAQItem: React.FC<FAQItemProps> = ({
  item,
  isExpanded: controlledExpanded,
  onToggle,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(controlledExpanded || false);

  // Animation values
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    if (controlledExpanded !== undefined) {
      setIsExpanded(controlledExpanded);
    }
  }, [controlledExpanded]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded, rotateAnim, fadeAnim]);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background.card,
          borderColor: theme.border.secondary,
        },
      ]}
    >
      {/* Question Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint={
          isExpanded ? 'Collapse answer' : 'Expand to see answer'
        }
      >
        {/* Icon */}
        {item.icon && (
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${theme.text.link}15` },
              ]}
            >
              <Icon name={item.icon as any} size={20} color={theme.text.link} />
            </View>
          </View>
        )}

        {/* Question */}
        <CustomText
          style={[
            styles.question,
            { color: theme.text.primary },
            !item.icon && styles.questionNoIcon,
          ]}
        >
          {item.question}
        </CustomText>

        {/* Chevron */}
        <Animated.View
          style={[
            styles.chevron,
            {
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        >
          <Icon name="chevron-down" size={20} color={theme.text.tertiary} />
        </Animated.View>
      </TouchableOpacity>

      {/* Answer */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.answerContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View
            style={[
              styles.answerDivider,
              { backgroundColor: theme.border.secondary },
            ]}
          />
          <CustomText style={[styles.answer, { color: theme.text.secondary }]}>
            {item.answer}
          </CustomText>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: `${theme.text.link}10` },
                  ]}
                >
                  <CustomText
                    style={[styles.tagText, { color: theme.text.link }]}
                  >
                    {tag}
                  </CustomText>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 60,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  questionNoIcon: {
    marginLeft: 0,
  },
  chevron: {
    marginLeft: 12,
  },
  answerContainer: {
    paddingBottom: 16,
  },
  answerDivider: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
