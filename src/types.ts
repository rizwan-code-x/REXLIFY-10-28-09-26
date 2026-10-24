/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppStatus = 'Active' | 'Beta' | 'Coming Soon' | 'Archived';

export interface AppAPKInfo {
  size: string; // e.g., "18.4 MB"
  downloadCount: number;
  qrCodeUrl?: string; // Auto-generated
  compatibility: string; // e.g., "Android 8.0+"
  version?: string;
  changelog: { version: string; date: string; changes: string[] }[];
}

export interface Application {
  id: string;
  name: string;
  logo: string; // Base64 description, emoji, or icon string
  shortDescription: string;
  fullDescription: string;
  version: string;
  category: string;
  status: AppStatus;
  releaseDate: string;
  developerNotes: string;
  screenshots: string[]; // Mock screenshot references
  downloadUrl: string;
  liveUrl?: string;
  progress?: number;
  completedMilestones?: string[];
  inProgressMilestones?: string[];
  upcomingMilestones?: string[];
  tags: string[];
  features: string[];
  featured?: boolean;
  apkInfo: AppAPKInfo;
  seoTitle?: string;
  seoDescription?: string;
}

export type UpdateCategory = 'Announcements' | 'Development News' | 'Release Notes' | 'Feature Updates' | 'Platform Updates';

export interface Update {
  id: string;
  title: string;
  content: string;
  category: UpdateCategory;
  date: string;
  pinned: boolean;
  scheduledDate?: string;
}

export type ProjectStatus = 'Planning' | 'Development' | 'Testing' | 'Released' | 'Future Vision';

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number; // 0 to 100
  status: ProjectStatus | string;
  targetRelease: string;
  category: string;
  notes: string;
  mediaUrl?: string;
}

export type DocCategory = 'REXLIFY' | 'NeuraX' | 'Sifra' | 'Applications' | 'Development' | 'Updates';

export interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: DocCategory;
  content: string; // Markdown
  lastUpdated: string;
  image?: string;
}

export type MessageCategory = 'Contact' | 'Suggestions' | 'Feedback' | 'Bug Reports' | 'Feature Requests' | 'Inquiry';

export interface UserMessage {
  id: string;
  senderName?: string;
  senderEmail?: string;
  sender?: string;
  email?: string;
  subject: string;
  category?: MessageCategory;
  message?: string;
  content?: string;
  date: string;
  isImportant: boolean;
  isRead: boolean;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  schemaMarkup: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
  };
  twitterCard: {
    title: string;
    description: string;
    image: string;
  };
}

export interface SponsoredVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  sponsor: string;
  date: string;
}

export interface WebsiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutStory: string;
  aboutMission: string;
  aboutVision: string;
  aboutGoal: string;
  founderName: string;
  founderBio: string;
  githubUrl: string;
  telegramUrl: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeAccentColor?: string;
  themeBgColor?: string;
  themeFontFamily?: string;
  themeGlowStrength?: string;
  themeAnimationSpeed?: string;
  themeBgEffect?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  fullDetails: string;
  features: string[];
  name?: string;
  category?: string;
  icon?: string;
  deliverables?: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  content?: string;
  date: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  fullDetails: string;
  category: 'Software' | 'AI Tool' | 'Mobile App' | 'Upcoming';
  image: string;
  rating: number;
  downloads: string;
  downloadUrl: string;
  reviews: Review[];
  features: string[];
  githubUrl?: string;
  docsUrl?: string;
  logo?: string;
  version?: string;
  fileSize?: string;
}

export interface BlogComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface BlogItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  date: string;
  author: string;
  readTime: string;
  readingTime?: string;
  comments: BlogComment[];
}

export interface VideoComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface VideoCenterItem {
  id: string;
  url: string;
  title: string;
  description: string;
  category: 'Banner Ads' | 'Video Ads' | 'Popup Ads' | 'Sponsored Content' | 'Tutorials' | 'Demos' | 'Promos';
  sponsor?: string;
  date: string;
  likes: number;
  shares: number;
  comments: VideoComment[];
  duration: string;
  image?: string;
}

export interface AdvertisementItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  adType: 'Banner' | 'Popup' | 'VideoOverlay' | 'Sponsored';
  active: boolean;
  impressions: number;
  clicks: number;
  revenuePerClick: number;
}

export interface UserActivityItem {
  id: string;
  type: 'login' | 'download' | 'favorite' | 'upload' | 'view_doc' | 'review' | 'system' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface UserAccount {
  username: string;
  email: string;
  bio: string;
  avatar: string;
  role?: string;
  joinedDate?: string;
  favorites: string[]; // item IDs
  watchLater: string[]; // video IDs
  savedDocs?: string[]; // document IDs
  activityHistory?: UserActivityItem[];
  uploadedFiles: UserUploadedFile[];
}

export interface UserUploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | string;
  size: string;
  date: string;
  hash?: string;
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string; // e.g. 'General', 'Ecosystem', 'Security', 'Billing & Access', 'Sifra AI'
  order: number;
  helpfulCount?: number;
  helpfulVotes?: number;
}
