import { STUDENTS_DATA } from "./studentsData";
import { COMMUNITIES_DATA } from "./communitiesData";
import { EVENTS_DATA } from "./eventsData";
import { OPPORTUNITIES_DATA } from "./opportunitiesData";
import {
  SkillItem,
  SeniorMentor,
  PeerStudent,
  DiscoverCommunity,
  HackathonItem,
  DiscoverOpportunity,
} from "@/components/discover/types";

export const TRENDING_SKILLS: SkillItem[] = [
  { id: "sk1", name: "AI & LLM Agents", count: 420, category: "AI/ML", gradient: "from-blue-600 to-indigo-600" },
  { id: "sk2", name: "React 19 & Next.js", count: 350, category: "Frontend", gradient: "from-cyan-500 to-blue-500" },
  { id: "sk3", name: "Figma & Design Systems", count: 280, category: "Design", gradient: "from-pink-500 to-rose-500" },
  { id: "sk4", name: "Rust & Systems", count: 190, category: "Systems", gradient: "from-amber-500 to-orange-500" },
  { id: "sk5", name: "Venture Capital", count: 240, category: "Business", gradient: "from-emerald-600 to-teal-600" },
  { id: "sk6", name: "Robotics ROS2", count: 160, category: "Hardware", gradient: "from-purple-600 to-indigo-600" },
  { id: "sk7", name: "PyTorch & Computer Vision", count: 310, category: "AI/ML", gradient: "from-violet-600 to-purple-600" },
];

export const RECOMMENDED_SENIORS: SeniorMentor[] = STUDENTS_DATA.filter((s) => s.year.includes("4th Year")).slice(0, 6).map((s, idx) => ({
  id: s.id,
  name: s.name,
  avatar: s.avatar,
  major: s.department,
  year: s.year,
  headline: s.bio,
  companyTag: idx % 3 === 0 ? "Google Intern" : idx % 3 === 1 ? "CRED Fellow" : "SAIL Scholar",
  skills: s.skills,
  bio: s.bio,
  mutualCount: 12 + idx * 3,
  isCoffeeRequested: false,
}));

export const RECOMMENDED_STUDENTS: PeerStudent[] = STUDENTS_DATA.filter((s) => s.year.includes("3rd Year") || s.year.includes("2nd Year")).slice(0, 6).map((s, idx) => ({
  id: s.id,
  name: s.name,
  avatar: s.avatar,
  major: s.department,
  year: s.year,
  lookingFor: idx % 2 === 0 ? "Hackathon Builder for SIH 2026" : "Fullstack Collaborator for AI Startup",
  skills: s.skills,
  mutualFriends: [STUDENTS_DATA[0].name, STUDENTS_DATA[1].name],
  isAvailableForProject: true,
  isConnected: false,
}));

export const TRENDING_COMMUNITIES: DiscoverCommunity[] = COMMUNITIES_DATA.slice(0, 6).map((c) => ({
  id: c.id,
  name: c.name,
  category: c.category,
  membersCount: c.members,
  avatar: c.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
  bannerGradient: c.banner,
  description: c.description,
  trendingTopic: `🔥 Active Discussion in ${c.name}`,
  isJoined: c.isFeatured || false,
}));

export const UPCOMING_HACKATHONS: HackathonItem[] = EVENTS_DATA.filter((e) => e.category === "Hackathon" || e.title.toLowerCase().includes("hack")).map((e, idx) => ({
  id: e.id,
  title: e.title,
  organizer: e.host,
  dates: e.date,
  prizePool: idx === 0 ? "₹1,00,000" : "$25,000",
  location: e.venue,
  teamStatus: "Looking for Team",
  image: e.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600",
  tags: ["AI Track", "Hardware Track", "Fintech Track"],
  isRegistered: false,
}));

export const DISCOVER_OPPORTUNITIES: DiscoverOpportunity[] = OPPORTUNITIES_DATA.slice(0, 6).map((o) => ({
  id: o.id,
  title: o.title,
  organization: o.company,
  type: o.type as any,
  deadline: o.deadline,
  stipendOrPrize: o.stipendOrPrize,
  tags: o.tags || [],
  description: o.description || "",
  isSaved: false,
}));
