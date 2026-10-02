import { SvgProps } from 'react-native-svg';

export interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  /** Icon name from the available icon set */
  name: IconName;
  /** Size of the icon in pixels. Defaults to 24 */
  size?: number;
  /** Color of the icon. Defaults to current color */
  color?: string;
  /** Additional styles */
  style?: any;
}

export type IconName =
  // Navigation Icons
  | 'home'
  | 'home-outline'
  | 'back'
  | 'hamburger'
  | 'hamburger-outline'

  // UI Icons
  | 'settings'
  | 'settings-outline'
  | 'favorite'
  | 'favorite-outline'
  | 'component'
  | 'component-outline'

  // Arrow Icons
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-right-small'
  | 'arrow-left-small'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'back-circle'

  // Form Controls
  | 'checkbox-checked'
  | 'checkbox-unchecked'
  | 'checkbox-indeterminate'
  | 'radio-selected'
  | 'radio-unselected'

  // Calendar & Time
  | 'calendar'
  | 'calendar-outline'
  | 'time'
  | 'clock'

  // Notification & Communication
  | 'bell'
  | 'bell-outline'
  | 'mail'
  | 'mail-outline'

  // Medical & Health
  | 'lab'
  | 'syringe'
  | 'virus'

  // Documents & Content
  | 'document'
  | 'book'

  // Brand Icons
  | 'merck'
  | 'merck-logo'
  | 'google'
  | 'apple'

  // User & Profile
  | 'user'
  | 'user-outline'
  | 'profile'
  | 'profile-outline'

  // Actions
  | 'search'
  | 'search-outline'
  | 'close'
  | 'close-circle'
  | 'logout'
  | 'heart'
  | 'heart-outline'
  | 'star'
  | 'star-circle'
  | 'sparkle'
  | 'download'
  | 'alert-circle'
  | 'info'
  | 'info-circle'
  | 'checkmark-circle'
  | 'filter'
  | 'sort-ascending'
  | 'options'
  | 'trash'
  | 'trash-outline'
  | 'delete-profile'
  | 'image'
  | 'image-outline'

  // Security & Legal
  | 'shield-check'
  | 'file-text'
  | 'check-square'
  | 'square'

  // Education
  | 'edu-1'
  | 'edu-2'
  | 'edu-3'
  | 'edu-4'
  | 'edu-5'
  | 'edu-6'
  | 'edu-7'
  | 'edu-8'

  // Location & Maps
  | 'map'
  | 'map-outline'
  | 'location'
  | 'location-outline'

  // Tools & Utilities
  | 'barcode'
  | 'scanner'
  | 'printer'
  | 'ruler'
  | 'light'
  | 'sun'
  | 'moon'
  | 'dashboard'
  | 'website'
  | 'vibrant'
  | 'toggle'
  | 'toggle-on'
  | 'globe'
  | 'globe-outline'
  | 'language'
  | 'refresh'
  | 'refresh-outline'
  | 'refresh-square'
  | 'reset'
  | 'achievement'

  // Notification Icons (from API)
  | 'alarm'
  | 'warning'
  | 'how_to_reg'
  | 'campaign'
  | 'add_circle'
  | 'system_update'
  | 'build'
  | 'rate_review'
  | 'event'
  | 'schedule_send'
  | 'poll'
  | 'person_add'
  | 'thumb_up'
  | 'confirmation_number'
  | 'waving_hand'

  // Misc
  | 'faq'
  | 'ellipsis'

  // Password visibility
  | 'eye'
  | 'eye-slash'

  // Save
  | 'save'

  // Share
  | 'share'

  // MerckConnect tab icons
  | 'calendar-tab'
  | 'calendar-tab-active'
  | 'users'
  | 'users-outline'
  | 'compass'
  | 'compass-outline'

  // MerckConnect header icons
  | 'header-bell'
  | 'header-search';

export interface IconComponentProps extends SvgProps {
  color?: string;
  size?: number;
}
