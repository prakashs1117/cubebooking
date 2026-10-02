/**
 * Custom Hooks
 *
 * Centralized exports for all custom hooks
 */

// Legal Modal Hooks
export { useLegalModalAnimation } from './useLegalModalAnimation';
export { useLegalModalState } from './useLegalModalState';
export {
  useLegalContent,
  usePrivacyPolicy,
  useTermsOfService,
} from './useLegalContent';

// FAQ Hooks
export { useFAQData } from './useFAQData';

// Events Hooks
export { useEvents, useEvent, useEventSearch, eventKeys } from './useEvents';

// User Profile Hooks
export { useUserProfile, useUpdateUserProfile, userKeys } from './useUser';

// Device / Responsive Hooks
export { useDeviceType } from './useDeviceType';
export type { DeviceTypeResult } from './useDeviceType';

// Posts / Feed Hooks
export { usePosts, usePost, usePostComments, useLikePost, useSharePost, useAddComment, useDeleteComment, postKeys } from './usePosts';
