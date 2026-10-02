import React from 'react';
import { View, Text } from 'react-native';
import { IconName, IconComponentProps } from './types';
import { BellIcon, BellOutlineIcon } from './components/BellIcon';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowLeftSmallIcon,
  ArrowRightSmallIcon,
} from './components/ArrowIcon';
import { SearchIcon, SearchOutlineIcon } from './components/SearchIcon';
import {
  ProfileIcon,
  ProfileOutlineIcon,
  UserIcon,
  UserOutlineIcon,
} from './components/ProfileIcon';
import { CloseIcon } from './components/CloseIcon';
import {
  InfoIcon,
  InfoCircleIcon,
  AlertCircleIcon,
} from './components/InfoIcon';
import { ToggleIcon, ToggleOnIcon, VibrantIcon } from './components/ToggleIcon';
import { BookIcon } from './components/BookIcon';
import { DocumentIcon } from './components/DocumentIcon';
import {
  GlobeIcon,
  GlobeOutlineIcon,
  LanguageIcon,
} from './components/GlobeIcon';
import { SunIcon, MoonIcon, LightIcon } from './components/SunMoonIcon';
import {
  RefreshIcon,
  RefreshOutlineIcon,
  ResetIcon,
  RefreshSquareIcon,
} from './components/RefreshIcon';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from './components/ChevronIcon';
import { BackCircleIcon } from './components/BackCircleIcon';
import { ClockIcon, TimeIcon } from './components/ClockIcon';
import { ShieldCheckIcon } from './components/ShieldCheckIcon';
import { FileTextIcon } from './components/FileTextIcon';
import { CheckSquareIcon, SquareIcon } from './components/CheckSquareIcon';
import SparkleIcon from './components/SparkleIcon';
import FilterIcon from './components/FilterIcon';
import SortAscendingIcon from './components/SortAscendingIcon';
import OptionsIcon from './components/OptionsIcon';
import CheckmarkCircleIcon from './components/CheckmarkCircleIcon';
import CloseCircleIcon from './components/CloseCircleIcon';
import LogoutIcon from './components/LogoutIcon';
import MailIcon from './components/MailIcon';
import { TrashIcon, TrashOutlineIcon } from './components/TrashIcon';
import DeleteProfileIcon from './components/DeleteProfileIcon';
import { ImageIcon, ImageOutlineIcon } from './components/ImageIcon';
import { BarcodeIcon } from './components/BarcodeIcon';
import { ScannerIcon } from './components/ScannerIcon';
import IconTorch from '@assets/icon-torch';
import { LocationIcon, LocationOutlineIcon } from './components/LocationIcon';
import { AlarmIcon } from './components/AlarmIcon';
import { WarningIcon } from './components/WarningIcon';
import { HowToRegIcon } from './components/HowToRegIcon';
import { CampaignIcon } from './components/CampaignIcon';
import { AddCircleIcon } from './components/AddCircleIcon';
import { SystemUpdateIcon } from './components/SystemUpdateIcon';
import { BuildIcon } from './components/BuildIcon';
import { RateReviewIcon } from './components/RateReviewIcon';
import { PollIcon } from './components/PollIcon';
import { PersonAddIcon } from './components/PersonAddIcon';
import { ThumbUpIcon } from './components/ThumbUpIcon';
import { ConfirmationNumberIcon } from './components/ConfirmationNumberIcon';
import { WavingHandIcon } from './components/WavingHandIcon';
import { FaqIcon } from './components/FaqIcon';
import { EllipsisIcon } from './components/EllipsisIcon';
import { EyeIcon, EyeSlashIcon } from './components/EyeIcon';
import SaveIcon from './components/SaveIcon';
import { GoogleIcon } from './components/GoogleIcon';
import { AppleIcon } from './components/AppleIcon';
import { CheckboxCheckedIcon } from './components/CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from './components/CheckboxUncheckedIcon';
import { CheckboxIndeterminateIcon } from './components/CheckboxIndeterminateIcon';
import { StarCircleIcon } from './components/StarCircleIcon';
import ShareIcon from './components/ShareIcon';
import { CalendarTabIcon, CalendarTabActiveIcon } from './components/CalendarTabIcon';
import { UsersIcon, UsersOutlineIcon } from './components/UsersIcon';
import { CompassIcon, CompassOutlineIcon } from './components/CompassIcon';
import { HeaderBellIcon } from './components/HeaderBellIcon';
import { HeaderSearchIcon } from './components/HeaderSearchIcon';

// Import existing assets as fallbacks
import IconBack from '@assets/icon-back.tsx';
import IconHamburger from '@assets/icon-hamburger.tsx';
import IconHamburgerOutline from '@assets/icon-hamburger-o.tsx';
import IconHome from '@assets/icon-home';
import IconSettings from '@assets/icon-settings.tsx';
import IconFavorite from '@assets/icon-favorite.tsx';
import IconComponent from '@assets/icon-component.tsx';
import IconCalendar from '@assets/icon-calendar.tsx';
import IconLab from '@assets/icon-lab.tsx';

import IconRadioSelected from '@assets/icon-radio-1.tsx';
import IconRadioUnSelected from '@assets/icon-radio-o.tsx';
import IconMerckLogo from '@assets/icon-merck-logo.tsx';
import PrintIcon from '@assets/icon-print';

// Wrapper component to standardize existing icons
const LegacyIconWrapper: React.FC<{
  IconComponent: React.ComponentType<any>;
  color?: string;
  size?: number;
}> = ({ IconComponent, color = '#000', size = 24, ...props }) => (
  <IconComponent
    width={size}
    height={size}
    fill={color}
    stroke={color}
    {...props}
  />
);

export const iconRegistry: Record<
  IconName,
  React.ComponentType<IconComponentProps>
> = {
  // Navigation Icons - New standardized components
  home: props => <LegacyIconWrapper IconComponent={IconHome} {...props} />,
  'home-outline': props => (
    <LegacyIconWrapper IconComponent={IconHome} {...props} />
  ),
  back: props => <LegacyIconWrapper IconComponent={IconBack} {...props} />,
  hamburger: props => (
    <LegacyIconWrapper IconComponent={IconHamburger} {...props} />
  ),
  'hamburger-outline': props => (
    <LegacyIconWrapper IconComponent={IconHamburgerOutline} {...props} />
  ),

  // UI Icons - Legacy wrapped components
  settings: props => (
    <LegacyIconWrapper IconComponent={IconSettings} {...props} />
  ),
  'settings-outline': props => (
    <LegacyIconWrapper IconComponent={IconSettings} {...props} />
  ),
  favorite: props => (
    <LegacyIconWrapper IconComponent={IconFavorite} {...props} />
  ),
  'favorite-outline': props => (
    <LegacyIconWrapper IconComponent={IconFavorite} {...props} />
  ),
  component: props => (
    <LegacyIconWrapper IconComponent={IconComponent} {...props} />
  ),
  'component-outline': props => (
    <LegacyIconWrapper IconComponent={IconComponent} {...props} />
  ),

  // Arrow Icons - New standardized components
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right-small': ArrowRightSmallIcon,
  'arrow-left-small': ArrowLeftSmallIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-down': ChevronDownIcon,
  'back-circle': BackCircleIcon,

  // Form Controls - Modern standardized components
  'checkbox-checked': CheckboxCheckedIcon,
  'checkbox-unchecked': CheckboxUncheckedIcon,
  'checkbox-indeterminate': CheckboxIndeterminateIcon,
  'radio-selected': props => (
    <LegacyIconWrapper IconComponent={IconRadioSelected} {...props} />
  ),
  'radio-unselected': props => (
    <LegacyIconWrapper IconComponent={IconRadioUnSelected} {...props} />
  ),

  // Calendar & Time - Legacy wrapped
  calendar: props => (
    <LegacyIconWrapper IconComponent={IconCalendar} {...props} />
  ),
  'calendar-outline': props => (
    <LegacyIconWrapper IconComponent={IconCalendar} {...props} />
  ),
  time: TimeIcon,
  clock: ClockIcon,

  // Notification & Communication - New standardized components
  bell: BellIcon,
  'bell-outline': BellOutlineIcon,
  mail: MailIcon,
  'mail-outline': MailIcon,

  // Medical & Health - Legacy wrapped
  lab: props => <LegacyIconWrapper IconComponent={IconLab} {...props} />,
  syringe: props => <DefaultIconPlaceholder name="syringe" {...props} />,
  virus: props => <DefaultIconPlaceholder name="virus" {...props} />,

  // Documents & Content
  document: DocumentIcon,
  book: BookIcon,

  // Brand Icons
  merck: props => (
    <LegacyIconWrapper IconComponent={IconMerckLogo} {...props} />
  ),
  'merck-logo': props => (
    <LegacyIconWrapper IconComponent={IconMerckLogo} {...props} />
  ),
  google: GoogleIcon,
  apple: AppleIcon,

  // User & Profile
  user: UserIcon,
  'user-outline': UserOutlineIcon,
  profile: ProfileIcon,
  'profile-outline': ProfileOutlineIcon,

  // Actions
  search: SearchIcon,
  'search-outline': SearchOutlineIcon,
  close: CloseIcon,
  'close-circle': CloseCircleIcon,
  logout: LogoutIcon,
  heart: props => <DefaultIconPlaceholder name="heart" {...props} />,
  'heart-outline': props => (
    <DefaultIconPlaceholder name="heart-outline" {...props} />
  ),
  star: props => <DefaultIconPlaceholder name="star" {...props} />,
  'star-circle': StarCircleIcon,
  sparkle: SparkleIcon,
  download: props => <DefaultIconPlaceholder name="download" {...props} />,
  'alert-circle': AlertCircleIcon,
  info: InfoIcon,
  'info-circle': InfoCircleIcon,
  'checkmark-circle': CheckmarkCircleIcon,
  filter: FilterIcon,
  'sort-ascending': SortAscendingIcon,
  options: OptionsIcon,
  trash: TrashIcon,
  'trash-outline': TrashOutlineIcon,
  'delete-profile': DeleteProfileIcon,
  image: ImageIcon,
  'image-outline': ImageOutlineIcon,

  // Security & Legal
  'shield-check': ShieldCheckIcon,
  'file-text': FileTextIcon,
  'check-square': CheckSquareIcon,
  square: SquareIcon,

  // Location & Maps
  map: props => <DefaultIconPlaceholder name="map" {...props} />,
  'map-outline': props => (
    <DefaultIconPlaceholder name="map-outline" {...props} />
  ),
  location: LocationIcon,
  'location-outline': LocationOutlineIcon,

  // Tools & Utilities
  barcode: BarcodeIcon,
  scanner: ScannerIcon,
  torch: IconTorch,
  printer: PrintIcon,
  ruler: props => <DefaultIconPlaceholder name="ruler" {...props} />,
  light: LightIcon,
  sun: SunIcon,
  moon: MoonIcon,
  dashboard: props => <DefaultIconPlaceholder name="dashboard" {...props} />,
  website: props => <DefaultIconPlaceholder name="website" {...props} />,
  vibrant: VibrantIcon,
  toggle: ToggleIcon,
  'toggle-on': ToggleOnIcon,
  globe: GlobeIcon,
  'globe-outline': GlobeOutlineIcon,
  language: LanguageIcon,
  refresh: RefreshIcon,
  'refresh-outline': RefreshOutlineIcon,
  'refresh-square': RefreshSquareIcon,
  reset: ResetIcon,
  achievement: props => (
    <DefaultIconPlaceholder name="achievement" {...props} />
  ),

  // Education Icons
  'edu-1': props => <DefaultIconPlaceholder name="edu-1" {...props} />,
  'edu-2': props => <DefaultIconPlaceholder name="edu-2" {...props} />,
  'edu-3': props => <DefaultIconPlaceholder name="edu-3" {...props} />,
  'edu-4': props => <DefaultIconPlaceholder name="edu-4" {...props} />,
  'edu-5': props => <DefaultIconPlaceholder name="edu-5" {...props} />,
  'edu-6': props => <DefaultIconPlaceholder name="edu-6" {...props} />,
  'edu-7': props => <DefaultIconPlaceholder name="edu-7" {...props} />,
  'edu-8': props => <DefaultIconPlaceholder name="edu-8" {...props} />,

  // Notification Icons (from API)
  alarm: AlarmIcon,
  warning: WarningIcon,
  how_to_reg: HowToRegIcon,
  campaign: CampaignIcon,
  add_circle: AddCircleIcon,
  system_update: SystemUpdateIcon,
  build: BuildIcon,
  rate_review: RateReviewIcon,
  event: props => <LegacyIconWrapper IconComponent={IconCalendar} {...props} />, // Map to existing calendar
  schedule_send: ClockIcon, // Map to existing clock
  poll: PollIcon,
  person_add: PersonAddIcon,
  thumb_up: ThumbUpIcon,
  confirmation_number: ConfirmationNumberIcon,
  waving_hand: WavingHandIcon,

  // Misc
  faq: FaqIcon,
  ellipsis: EllipsisIcon,

  // Password visibility
  eye: EyeIcon,
  'eye-slash': EyeSlashIcon,

  // Save
  save: SaveIcon,

  // Share
  share: ShareIcon,

  // MerckConnect tab icons
  'calendar-tab': CalendarTabIcon,
  'calendar-tab-active': CalendarTabActiveIcon,
  users: UsersIcon,
  'users-outline': UsersOutlineIcon,
  compass: CompassIcon,
  'compass-outline': CompassOutlineIcon,

  // MerckConnect header icons
  'header-bell': HeaderBellIcon,
  'header-search': HeaderSearchIcon,
};

// Placeholder component for icons not yet implemented
const DefaultIconPlaceholder: React.FC<
  IconComponentProps & { name: string }
> = ({ name, size = 24, color = '#666', ...props }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}
    {...props}
  >
    <Text
      style={{
        fontSize: 8,
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      {name.slice(0, 3).toUpperCase()}
    </Text>
  </View>
);

export const getIconComponent = (
  name: IconName,
): React.ComponentType<IconComponentProps> => {
  const IconComponent = iconRegistry[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry. Using placeholder.`);
    return props => <DefaultIconPlaceholder name={name} {...props} />;
  }
  return IconComponent;
};
