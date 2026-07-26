export interface SkillProficiency {
  name: string;
  level: number; // 0 - 100
  category: "Frontend" | "AI/ML" | "Backend" | "Design" | "Systems";
}

export interface BadgeItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  iconName: string;
  color: string;
}

export interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  current: number;
  max: number;
  iconName: string;
  color: string;
}

export interface ProfileJoinedCommunity {
  id: string;
  name: string;
  role: string;
  avatar: string;
  category: string;
  membersCount: number;
}

export interface ProfileEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: "Registered" | "Organizer" | "Speaking";
}

export interface FullUserProfile {
  name: string;
  avatar: string;
  banner: string;
  department: string;
  year: string;
  campus: string;
  bio: string;
  statusText: string;
  profileViews: number;
  connectionsCount: number;
  projectsCount: number;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: SkillProficiency[];
  badges: BadgeItem[];
  achievements: AchievementProgress[];
  communities: ProfileJoinedCommunity[];
  events: ProfileEventItem[];
}
