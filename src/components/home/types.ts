export interface FeaturedCommunity {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  iconName: string; // Lucide icon or emoji
  gradient: string;
  description: string;
  isJoined?: boolean;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "Tech" | "Social" | "Career" | "Sports" | "Arts";
  attendeesCount: number;
  image: string;
  organizer: string;
  isRegistered?: boolean;
}

export interface ActiveStudent {
  id: string;
  name: string;
  avatar: string;
  major: string;
  year: string;
  status: string;
  locationTag: string;
  isOnline: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: "Internship" | "Hackathon" | "Workshop" | "Club Recruitment";
  deadline: string;
  location: string;
  tags: string[];
  badgeColor: string;
  description: string;
}

export interface CampusPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    title: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  image?: string;
}
