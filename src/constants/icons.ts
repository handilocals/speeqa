import { IconName } from '../components/common/Icon';

export const ICONS = {
  // Navigation
  home: 'home-outline' as IconName,
  homeFilled: 'home' as IconName,
  profile: 'person-outline' as IconName,
  profileFilled: 'person' as IconName,
  messages: 'chatbubble-outline' as IconName,
  messagesFilled: 'chatbubble' as IconName,
  marketplace: 'cart-outline' as IconName,
  marketplaceFilled: 'cart' as IconName,
  collections: 'bookmark-outline' as IconName,
  collectionsFilled: 'bookmark' as IconName,
  notifications: 'notifications-outline' as IconName,
  notificationsFilled: 'notifications' as IconName,

  // Actions
  add: 'add-outline' as IconName,
  close: 'close' as IconName,
  search: 'search' as IconName,
  filter: 'filter' as IconName,
  sort: 'swap-vertical' as IconName,
  share: 'share-outline' as IconName,
  more: 'ellipsis-horizontal' as IconName,
  back: 'arrow-back' as IconName,
  forward: 'arrow-forward' as IconName,
  refresh: 'refresh' as IconName,
  settings: 'settings-outline' as IconName,
  settingsFilled: 'settings' as IconName,

  // Social
  like: 'heart-outline' as IconName,
  likeFilled: 'heart' as IconName,
  comment: 'chatbubble-outline' as IconName,
  commentFilled: 'chatbubble' as IconName,
  repost: 'repeat-outline' as IconName,
  repostFilled: 'repeat' as IconName,
  bookmark: 'bookmark-outline' as IconName,
  bookmarkFilled: 'bookmark' as IconName,
  follow: 'person-add-outline' as IconName,
  following: 'person-check' as IconName,

  // Content
  image: 'image-outline' as IconName,
  video: 'videocam-outline' as IconName,
  poll: 'bar-chart-outline' as IconName,
  link: 'link-outline' as IconName,
  location: 'location-outline' as IconName,
  calendar: 'calendar-outline' as IconName,
  time: 'time-outline' as IconName,

  // Status
  checkmark: 'checkmark' as IconName,
  error: 'alert-circle' as IconName,
  warning: 'warning' as IconName,
  info: 'information-circle' as IconName,
  success: 'checkmark-circle' as IconName,
  loading: 'reload' as IconName,

  // Theme
  sun: 'sunny-outline' as IconName,
  moon: 'moon-outline' as IconName,
  system: 'phone-portrait-outline' as IconName,

  // User Interface
  menu: 'menu' as IconName,
  chevronDown: 'chevron-down' as IconName,
  chevronUp: 'chevron-up' as IconName,
  chevronLeft: 'chevron-back' as IconName,
  chevronRight: 'chevron-forward' as IconName,
  expand: 'expand' as IconName,
  collapse: 'contract' as IconName,
  drag: 'reorder-three' as IconName,

  // Communication
  send: 'send' as IconName,
  attach: 'attach' as IconName,
  mic: 'mic-outline' as IconName,
  micFilled: 'mic' as IconName,
  camera: 'camera-outline' as IconName,
  cameraFilled: 'camera' as IconName,

  // Rating
  star: 'star-outline' as IconName,
  starFilled: 'star' as IconName,
  starHalf: 'star-half' as IconName,
  thumbsUp: 'thumbs-up-outline' as IconName,
  thumbsUpFilled: 'thumbs-up' as IconName,
  thumbsDown: 'thumbs-down-outline' as IconName,
  thumbsDownFilled: 'thumbs-down' as IconName,
} as const;

export type IconKey = keyof typeof ICONS; 