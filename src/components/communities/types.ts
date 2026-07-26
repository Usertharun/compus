export type CommunityCategory = "Technology" | "Business" | "Creative" | "Sports";

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  timeAgo: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
}

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  major: string;
}

export interface CommunityItem {
  id: string;
  name: string;
  category: CommunityCategory;
  description: string;
  fullBio: string;
  memberCount: number;
  iconName: string; // Lucide icon or emoji
  avatarUrl: string;
  bannerGradient: string;
  bannerImage?: string;
  isFeatured?: boolean;
  isJoined?: boolean;
  recentPosts: CommunityPost[];
  upcomingEvents: CommunityEvent[];
  featuredMembers: CommunityMember[];
}
