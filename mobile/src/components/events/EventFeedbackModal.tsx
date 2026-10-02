import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import StarFilledIcon from '@components/icons/components/StarFilledIcon';
import StarOutlineIcon from '@components/icons/components/StarOutlineIcon';

interface RatingCategory {
  id: string;
  label: string;
  icon: string;
  rating: number;
}

interface EventFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  eventId: string;
  onSubmit: (feedback: {
    ratings: { [key: string]: number };
    comment: string;
    eventId: string;
    averageRating: number;
  }) => void;
}

const EventFeedbackModal: React.FC<EventFeedbackModalProps> = ({
  visible,
  onClose,
  eventTitle,
  eventId,
  onSubmit,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Card stagger animations
  const cardAnimations = useRef(
    Array.from({ length: 7 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    })),
  ).current;

  // Thank you screen animations
  const thankYouScaleAnim = useRef(new Animated.Value(0)).current;
  const thankYouIconAnim = useRef(new Animated.Value(0)).current;

  // Average rating animation
  const averageRatingAnim = useRef(new Animated.Value(0)).current;

  const [categories, setCategories] = useState<RatingCategory[]>([
    {
      id: 'presentation',
      label: 'Presentation Quality',
      icon: 'document',
      rating: 0,
    },
    { id: 'content', label: 'Content & Topics', icon: 'book', rating: 0 },
    { id: 'speakers', label: 'Speakers', icon: 'mic', rating: 0 },
    { id: 'venue', label: 'Venue & Facilities', icon: 'location', rating: 0 },
    { id: 'hospitality', label: 'Hospitality', icon: 'heart', rating: 0 },
    { id: 'organization', label: 'Organization', icon: 'calendar', rating: 0 },
    {
      id: 'networking',
      label: 'Networking Opportunities',
      icon: 'users',
      rating: 0,
    },
  ]);

  useEffect(() => {
    if (visible) {
      // Reset form
      setCategories(prev => prev.map(cat => ({ ...cat, rating: 0 })));
      setComment('');
      setIsSubmitting(false);

      // Reset all animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      backdropAnim.setValue(0);
      thankYouScaleAnim.setValue(0);
      thankYouIconAnim.setValue(0);
      cardAnimations.forEach(anim => {
        anim.opacity.setValue(0);
        anim.translateY.setValue(20);
      });

      // Animate in with stagger effect
      Animated.parallel([
        // Backdrop fade
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Modal container entrance
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger category cards
      const cardStaggerDelay = 50;
      cardAnimations.forEach((anim, index) => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 300,
            delay: 200 + index * cardStaggerDelay,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            tension: 100,
            friction: 10,
            delay: 200 + index * cardStaggerDelay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    visible,
    backdropAnim,
    cardAnimations,
    fadeAnim,
    scaleAnim,
    slideAnim,
    thankYouIconAnim,
    thankYouScaleAnim,
  ]);

  const updateRating = (categoryId: string, rating: number) => {
    const wasEmpty = !categories.some(cat => cat.rating > 0);

    setCategories(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, rating } : cat)),
    );

    // Animate average rating appearance on first rating
    if (wasEmpty) {
      averageRatingAnim.setValue(0);
      Animated.spring(averageRatingAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }

    // Add haptic-like scale animation on star tap
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex >= 0 && cardAnimations[categoryIndex]) {
      Animated.sequence([
        Animated.spring(cardAnimations[categoryIndex].translateY, {
          toValue: -2,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(cardAnimations[categoryIndex].translateY, {
          toValue: 0,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getAverageRating = (): number => {
    const totalRatings = categories.reduce((sum, cat) => sum + cat.rating, 0);
    const ratedCategories = categories.filter(cat => cat.rating > 0).length;
    return ratedCategories > 0 ? totalRatings / ratedCategories : 0;
  };

  const canSubmit = (): boolean => {
    return categories.some(cat => cat.rating > 0);
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const ratings: { [key: string]: number } = {};
    categories.forEach(cat => {
      if (cat.rating > 0) {
        ratings[cat.id] = cat.rating;
      }
    });

    setIsSubmitting(true);

    // Animate thank you screen
    Animated.sequence([
      Animated.spring(thankYouScaleAnim, {
        toValue: 1.1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(thankYouScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.spring(thankYouIconAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onSubmit({
      ratings,
      comment: comment.trim(),
      eventId,
      averageRating: getAverageRating(),
    });

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const getStarColor = (filled: boolean): string => {
    if (filled) {
      return '#FFB800'; // Golden yellow
    }
    return isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
  };

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: insets.top + 12,
      backgroundColor: theme.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 2,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 120,
      flexGrow: 1,
    },
    eventTitleContainer: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: theme.background.card,
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.button.primary.background,
    },
    eventTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    instructionText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 12,
      paddingHorizontal: 4,
      fontFamily: getFontStyle('body').fontFamily,
    },
    categoryCard: {
      backgroundColor: theme.background.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border.secondary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    categoryLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    categoryIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.primary.background + '15',
    },
    categoryLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    starsContainer: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 6,
    },
    starButton: {
      padding: 2,
    },
    commentSection: {
      marginTop: 8,
      marginBottom: 8,
    },
    commentLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
      paddingHorizontal: 4,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    textInput: {
      backgroundColor: theme.background.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border.secondary,
      padding: 12,
      fontSize: 14,
      color: theme.text.primary,
      fontFamily: getFontStyle('body').fontFamily,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    textInputFocused: {
      borderColor: theme.button.primary.background,
      borderWidth: 2,
    },
    characterCount: {
      fontSize: 11,
      color: theme.text.tertiary,
      textAlign: 'right',
      marginTop: 4,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    submitSection: {
      paddingTop: 8,
    },
    averageRatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.button.primary.background + '10',
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
    },
    averageRatingLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    averageRatingValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    averageRatingNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.button.primary.background,
      fontFamily: getFontStyle('h2').fontFamily,
    },
    submitButton: {
      backgroundColor: theme.button.primary.background,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      shadowColor: theme.button.primary.background,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      backgroundColor: theme.background.secondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    submitButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.button.primary.text,
      fontFamily: getFontStyle('button').fontFamily,
    },
    submitButtonTextDisabled: {
      color: theme.text.tertiary,
    },
    thankYouContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    thankYouIcon: {
      marginBottom: 20,
    },
    thankYouTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 10,
      textAlign: 'center',
      fontFamily: getFontStyle('h2').fontFamily,
    },
    thankYouMessage: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: getFontStyle('body').fontFamily,
    },
    ratingStatsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
      justifyContent: 'center',
    },
    ratingStatBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.button.success.background + '20',
      borderRadius: 16,
    },
    ratingStatText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.button.success.background,
      fontFamily: getFontStyle('caption').fontFamily,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)'],
              }),
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.headerTitle}>Event Feedback</Text>
                  <Text style={styles.headerSubtitle}>Help us improve</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={20} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              >
                {isSubmitting ? (
                  // Thank you screen
                  <Animated.View
                    style={[
                      styles.thankYouContainer,
                      {
                        transform: [{ scale: thankYouScaleAnim }],
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.thankYouIcon,
                        {
                          opacity: thankYouIconAnim,
                          transform: [
                            {
                              scale: thankYouIconAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                              }),
                            },
                            {
                              rotate: thankYouIconAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Icon
                        name="checkmark-circle"
                        size={80}
                        color={theme.button.success.background}
                      />
                    </Animated.View>
                    <Text style={styles.thankYouTitle}>Thank You!</Text>
                    <Text style={styles.thankYouMessage}>
                      Your feedback helps us create better events for everyone.
                    </Text>
                    <View style={styles.ratingStatsContainer}>
                      <View style={styles.ratingStatBadge}>
                        <Text style={styles.ratingStatText}>
                          ⭐ {getAverageRating().toFixed(1)} Average
                        </Text>
                      </View>
                      <View style={styles.ratingStatBadge}>
                        <Text style={styles.ratingStatText}>
                          ✓ {categories.filter(c => c.rating > 0).length} Rated
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                ) : (
                  // Feedback form
                  <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Event Title */}
                    <View style={styles.eventTitleContainer}>
                      <Text style={styles.eventTitle} numberOfLines={2}>
                        {eventTitle}
                      </Text>
                    </View>

                    <Text style={styles.instructionText}>
                      Rate each aspect of the event (tap stars)
                    </Text>

                    {/* Rating Categories */}
                    {categories.map((category, index) => (
                      <Animated.View
                        key={category.id}
                        style={[
                          styles.categoryCard,
                          {
                            opacity: cardAnimations[index].opacity,
                            transform: [
                              { translateY: cardAnimations[index].translateY },
                            ],
                          },
                        ]}
                      >
                        {/* Left: Icon and Label */}
                        <View style={styles.categoryLeft}>
                          <View style={styles.categoryIconContainer}>
                            <Icon
                              name={category.icon}
                              size={18}
                              color={theme.button.primary.background}
                            />
                          </View>
                          <Text style={styles.categoryLabel}>
                            {category.label}
                          </Text>
                        </View>

                        {/* Right: Stars with Background */}
                        <View style={styles.starsContainer}>
                          {[1, 2, 3, 4, 5].map(star => {
                            const isFilled = star <= category.rating;
                            return (
                              <TouchableOpacity
                                key={star}
                                style={styles.starButton}
                                onPress={() => updateRating(category.id, star)}
                                activeOpacity={0.7}
                              >
                                {isFilled ? (
                                  <StarFilledIcon size={24} color="#FFB800" />
                                ) : (
                                  <StarOutlineIcon
                                    size={24}
                                    color={getStarColor(false)}
                                  />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </Animated.View>
                    ))}

                    {/* Comment Section */}
                    <View style={styles.commentSection}>
                      <Text style={styles.commentLabel}>
                        Additional Comments (Optional)
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          comment.length > 0 && styles.textInputFocused,
                        ]}
                        placeholder="Share your thoughts, suggestions, or any feedback..."
                        placeholderTextColor={theme.text.tertiary}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        maxLength={500}
                        returnKeyType="default"
                        blurOnSubmit={false}
                      />
                      <Text style={styles.characterCount}>
                        {comment.length} / 500
                      </Text>
                    </View>

                    {/* Submit Section */}
                    <View style={styles.submitSection}>
                      {getAverageRating() > 0 && (
                        <Animated.View
                          style={[
                            styles.averageRatingContainer,
                            {
                              opacity: averageRatingAnim,
                              transform: [
                                {
                                  scale: averageRatingAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.9, 1],
                                  }),
                                },
                                {
                                  translateY: averageRatingAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [10, 0],
                                  }),
                                },
                              ],
                            },
                          ]}
                        >
                          <Text style={styles.averageRatingLabel}>
                            Overall Rating
                          </Text>
                          <View style={styles.averageRatingValue}>
                            <Text style={styles.averageRatingNumber}>
                              {getAverageRating().toFixed(1)}
                            </Text>
                            <Icon name="star" size={20} color="#FFB800" />
                          </View>
                        </Animated.View>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          !canSubmit() && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!canSubmit()}
                        activeOpacity={0.8}
                      >
                        <Icon
                          name="checkmark-circle"
                          size={20}
                          color={
                            canSubmit()
                              ? theme.button.primary.text
                              : theme.text.tertiary
                          }
                        />
                        <Text
                          style={[
                            styles.submitButtonText,
                            !canSubmit() && styles.submitButtonTextDisabled,
                          ]}
                        >
                          Submit Feedback
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EventFeedbackModal;
