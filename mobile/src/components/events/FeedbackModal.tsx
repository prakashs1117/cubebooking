import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import StarFilledIcon from '@components/icons/components/StarFilledIcon';
import StarOutlineIcon from '@components/icons/components/StarOutlineIcon';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
}

/**
 * FeedbackModal Component
 * Full-screen modal for submitting session feedback
 * Includes rating stars and comment
 */
const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  sessionId,
  sessionTitle,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      // Reset form when closing
      setTimeout(() => {
        setRating(0);
        setComment('');
        setHoveredStar(0);
      }, 200);
    }
  }, [visible, fadeAnim]);

  const handleSubmit = () => {
    console.log('📝 Feedback submitted:', {
      sessionId,
      sessionTitle,
      rating,
      comment,
    });

    // TODO: Send feedback to API
    // await submitFeedback({ sessionId, rating, comment });

    // Show success message
    alert('Thank you for your feedback!');
    onClose();
  };

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 500,
      backgroundColor: theme.background.card,
      borderRadius: 20,
      overflow: 'hidden',
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      flex: 1,
      marginRight: 12,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 20,
    },
    sessionInfo: {
      marginBottom: 20,
      padding: 12,
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
    },
    sessionLabel: {
      fontSize: 11,
      color: theme.text.tertiary,
      marginBottom: 4,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    sessionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    ratingSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 12,
      fontFamily: getFontStyle('h4').fontFamily,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    starButton: {
      padding: 4,
    },
    ratingLabel: {
      fontSize: 13,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 8,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    commentSection: {
      marginBottom: 20,
    },
    textInput: {
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: theme.text.primary,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: theme.border.secondary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    textInputFocused: {
      borderColor: theme.button.primary.background,
    },
    charCount: {
      fontSize: 11,
      color: theme.text.tertiary,
      textAlign: 'right',
      marginTop: 6,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: 10,
      paddingTop: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.background.secondary,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    submitButton: {
      backgroundColor: theme.button.primary.background,
    },
    submitButtonDisabled: {
      backgroundColor: theme.background.secondary,
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
      fontFamily: getFontStyle('button').fontFamily,
    },
    cancelButtonText: {
      color: theme.text.primary,
    },
    submitButtonText: {
      color: theme.button.primary.text,
    },
  });

  const getRatingLabel = (stars: number): string => {
    switch (stars) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  const isSubmitDisabled = rating === 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Share Feedback</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Session Info */}
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionLabel}>Session</Text>
                <Text style={styles.sessionTitle}>{sessionTitle}</Text>
              </View>

              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <Text style={styles.sectionTitle}>How was this session?</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const isSelected = star <= (hoveredStar || rating);
                    const StarIcon = isSelected
                      ? StarFilledIcon
                      : StarOutlineIcon;

                    return (
                      <TouchableOpacity
                        key={star}
                        style={styles.starButton}
                        onPress={() => setRating(star)}
                        onPressIn={() => setHoveredStar(star)}
                        onPressOut={() => setHoveredStar(0)}
                        activeOpacity={0.7}
                      >
                        <StarIcon
                          size={40}
                          color={
                            isSelected ? '#f39c12' : theme.border.secondary
                          }
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.ratingLabel}>
                  {getRatingLabel(hoveredStar || rating)}
                </Text>
              </View>

              {/* Comment Section */}
              <View style={styles.commentSection}>
                <Text style={styles.sectionTitle}>
                  Additional Comments (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    comment.length > 0 && styles.textInputFocused,
                  ]}
                  placeholder="Share your thoughts about this session..."
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  maxLength={500}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{comment.length}/500</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    isSubmitDisabled
                      ? styles.submitButtonDisabled
                      : styles.submitButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitDisabled}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>
                    Submit Feedback
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FeedbackModal;
