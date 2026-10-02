import Toast from 'react-native-toast-message';

/**
 * Toast utility for showing notifications
 * Simple, clean API for displaying different types of toast messages
 */

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom';
  onPress?: () => void;
}

/**
 * Show a success toast message
 * @example
 * showSuccess({ title: 'Success!', message: 'Your changes have been saved' });
 */
export const showSuccess = (options: ToastOptions) => {
  Toast.show({
    type: 'success',
    text1: options.title,
    text2: options.message,
    position: options.position || 'top',
    visibilityTime: options.duration || 3000,
    onPress: options.onPress,
  });
};

/**
 * Show an error toast message
 * @example
 * showError({ title: 'Error', message: 'Something went wrong' });
 */
export const showError = (options: ToastOptions) => {
  Toast.show({
    type: 'error',
    text1: options.title,
    text2: options.message,
    position: options.position || 'top',
    visibilityTime: options.duration || 4000,
    onPress: options.onPress,
  });
};

/**
 * Show an info toast message
 * @example
 * showInfo({ title: 'Info', message: 'New updates available' });
 */
export const showInfo = (options: ToastOptions) => {
  Toast.show({
    type: 'info',
    text1: options.title,
    text2: options.message,
    position: options.position || 'top',
    visibilityTime: options.duration || 3000,
    onPress: options.onPress,
  });
};

/**
 * Show a warning toast message
 * @example
 * showWarning({ title: 'Warning', message: 'Please complete all required fields' });
 */
export const showWarning = (options: ToastOptions) => {
  Toast.show({
    type: 'warning',
    text1: options.title,
    text2: options.message,
    position: options.position || 'top',
    visibilityTime: options.duration || 3500,
    onPress: options.onPress,
  });
};

/**
 * Hide the currently visible toast
 */
export const hideToast = () => {
  Toast.hide();
};

/**
 * Quick toast methods for common scenarios
 */
export const toast = {
  success: (title: string, message?: string) => showSuccess({ title, message }),
  error: (title: string, message?: string) => showError({ title, message }),
  info: (title: string, message?: string) => showInfo({ title, message }),
  warning: (title: string, message?: string) => showWarning({ title, message }),
  hide: hideToast,
};
