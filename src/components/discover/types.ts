export interface SkillItem {
  id: string;
  name: string;
  count: number;
  category: string;
  gradient: string;
}

export interface SeniorMentor {
  id: string;
  name: string;
  avatar: string;
  major: string;
  year: string;
  headline: string;
  companyTag: string; // e.g. "Ex-OpenAI Intern", "Palantir Fellow"
  skills: string[];
  bio: string;
  mutualCount: number;
  isCoffeeRequested?: boolean;
}

export interface PeerStudent {
  id: string;
  name: string;
  avatar: string;
  major: string;
  year: string;
  lookingFor: string; // e.g. "Hackathon Teammate", "Roommate for Spring"
  skills: string[];
  mutualFriends: string[];
  isAvailableForProject: boolean;
  isConnected?: boolean;
}

export interface DiscoverCommunity {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  avatar: string;
  bannerGradient: string;
  description: string;
  trendingTopic: string;
  isJoined?: boolean;
}

export interface HackathonItem {
  id: string;
  title: string;
  organizer: string;
  dates: string;
  prizePool: string;
  location: string;
  teamStatus: "Looking for Team" | "Teams Full" | "Solo Allowed";
  image: string;
  tags: string[];
  isRegistered?: boolean;
}

export interface DiscoverOpportunity {
  id: string;
  title: string;
  organization: string;
  type: "Research" | "Internship" | "Grant" | "Workshop";
  deadline: string;
  stipendOrPrize?: string;
  tags: string[];
  description: string;
  isSaved?: boolean;
}
