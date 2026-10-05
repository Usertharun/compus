export interface Page<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
export interface Student {
  id: string;
  userId: string;
  name: string;
  username: string;
  department?: string;
  year?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  campusLocation?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  visibility?: string;
  contactVisibility?: string;
  showSkills?: boolean;
  showProjects?: boolean;
  allowDirectMessages?: boolean;
  showLocation?: boolean;
  user?: { id: string; email?: string };
  skills?: { skill: { id: string; name: string } }[];
  projects?: {
    id: string;
    title: string;
    description: string;
    projectUrl?: string;
    githubUrl?: string;
  }[];
  achievements?: {
    id: string;
    title: string;
    description: string;
    issuer?: string;
    dateAwarded: string;
  }[];
  metrics?: {
    followersCount?: number;
    followingCount?: number;
    projectsCount?: number;
    viewsCount?: number;
  };
}
export interface Author {
  id: string;
  profile?: {
    name?: string;
    avatarUrl?: string;
    department?: string;
    username?: string;
  };
}
export interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
}
export interface Post {
  id: string;
  authorId: string;
  author: Author;
  content: string;
  category: string;
  tags: string[];
  media?: { url: string }[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments?: Comment[];
}
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  organizerId: string;
  startTime: string;
  endTime: string;
  coverImageUrl?: string;
  status: string;
  rsvpCount: number;
  userRsvpStatus?: string | null;
  capacity?: number;
  isFull?: boolean;
  organizer?: Author;
}
export interface Opportunity {
  id: string;
  title: string;
  companyName: string;
  description: string;
  category: string;
  creatorId: string;
  location: string;
  stipend?: string;
  deadline?: string;
  applicationUrl?: string;
  registrationUrl?: string;
  tags: string[];
  isBookmarked?: boolean;
  personalStatus?: string | null;
}
export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  ownerId: string;
  avatarUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  themeStyle?: "GRADIENT" | "SOLID" | "MINIMAL";
  tags?: string[];
  contactEmail?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  joinPolicy: string;
  isMember?: boolean;
  viewerRole?: string;
  userRole?: string | null;
  hasPendingRequest?: boolean;
  members?: { role: string; user: Author }[];
}
export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: Author;
  mediaUrl?: string;
  type?: string;
  reads?: { userId: string }[];
}
export interface Conversation {
  id: string;
  name?: string;
  type: string;
  updatedAt: string;
  title?: string;
  participants: { userId: string; user: Author }[];
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}
export interface Notification {
  id: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
export interface Preferences {
  messages: boolean;
  communities: boolean;
  events: boolean;
  opportunities: boolean;
  feedActivity: boolean;
  followers: boolean;
  mentions: boolean;
}
export const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
export function avatar(name: string, url?: string) {
  if (url) return url;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" rx="50" fill="#4f46e5"/><text x="50" y="62" text-anchor="middle" font-size="32" fill="white" font-family="Arial">${initials.replace(/[<>&]/g, "")}</text></svg>`,
    )
  );
}
