import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { apiRequest } from "@/services/api";
import { avatar, type Conversation } from "@/services/models";
import type {
  PeerStudent,
  SeniorMentor,
  DiscoverCommunity,
  HackathonItem,
  DiscoverOpportunity,
  SkillItem,
} from "@/components/discover/types";
export function useDiscoveryData() {
  const {
    students,
    communities,
    opportunities,
    events,
    user,
    refreshData,
    toggleRegisterEvent,
    toggleSaveOpportunity,
  } = useApp();
  const toast = useToast();
  const [following, setFollowing] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);
  useEffect(() => {
    if (user.id)
      void apiRequest<{ id: string }[]>("/social/following/" + user.id)
        .then((items) => setFollowing(items.map((i) => i.id)))
        .catch((error) => toast.error(error.message));
  }, [user.id, toast]);
  const RECOMMENDED_STUDENTS: PeerStudent[] = students.map((s) => ({
    id: s.userId,
    name: s.name,
    avatar: avatar(s.name, s.avatarUrl),
    major: s.department || "",
    year: s.year || "",
    lookingFor: s.bio || "",
    skills: s.skills?.map((i) => i.skill.name) || [],
    mutualFriends: [],
    isAvailableForProject: false,
    isConnected: following.includes(s.userId),
  }));
  const RECOMMENDED_SENIORS: SeniorMentor[] = students
    .filter((s) =>
      /^20\d{2}$/.test(s.year || "")
        ? Number(s.year) >= new Date().getFullYear() &&
          Number(s.year) <= new Date().getFullYear() + 1
        : /(?:3rd|4th|senior|final)/i.test(s.year || ""),
    )
    .map((s) => ({
      id: s.userId,
      name: s.name,
      avatar: avatar(s.name, s.avatarUrl),
      major: s.department || "",
      year: s.year || "",
      headline: s.bio || "",
      companyTag: "SRM student",
      skills: s.skills?.map((i) => i.skill.name) || [],
      bio: s.bio || "",
      mutualCount: 0,
      isCoffeeRequested: requested.includes(s.userId),
    }));
  const TRENDING_COMMUNITIES: DiscoverCommunity[] = communities.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    membersCount: c.memberCount,
    avatar: avatar(c.name, c.avatarUrl),
    bannerGradient: "from-indigo-600 to-purple-600",
    description: c.description,
    trendingTopic: "",
    isJoined: !!c.userRole,
  }));
  const UPCOMING_HACKATHONS: HackathonItem[] = events
    .filter(
      (e) =>
        /hackathon/i.test(e.category || "") &&
        new Date(e.startTime || "") > new Date(),
    )
    .map((e) => ({
      id: e.id,
      title: e.title,
      organizer: e.host,
      dates: e.date,
      prizePool: "",
      location: e.venue,
      teamStatus: "See event details",
      image: e.image || "",
      tags: [e.category || "Hackathon"],
      isRegistered: e.isRegistered,
    }));
  const DISCOVER_OPPORTUNITIES: DiscoverOpportunity[] = opportunities.map(
    (o) => ({
      id: o.id,
      title: o.title,
      organization: o.company,
      type: o.type as DiscoverOpportunity["type"],
      deadline: o.deadline,
      stipendOrPrize: o.stipendOrPrize || "",
      tags: o.tags || [],
      description: o.description || "",
      isSaved: o.isSaved,
    }),
  );
  const skillCounts = new Map<string, number>();
  students.forEach((s) =>
    s.skills?.forEach((i) =>
      skillCounts.set(i.skill.name, (skillCounts.get(i.skill.name) || 0) + 1),
    ),
  );
  const TRENDING_SKILLS: SkillItem[] = [...skillCounts]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      id: name,
      name,
      count,
      category: "Campus",
      gradient: "from-indigo-600 to-purple-600",
    }));
  const toggleFollow = async (id: string) => {
    try {
      const exists = following.includes(id);
      await apiRequest(
        "/social/" + (exists ? "unfollow/" : "follow/") + id,
        exists ? "DELETE" : "POST",
      );
      setFollowing((prev) =>
        exists ? prev.filter((item) => item !== id) : [...prev, id],
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update connection.",
      );
    }
  };
  const requestCoffee = async (id: string) => {
    try {
      const conversation = await apiRequest<Conversation>(
        "/conversations/direct",
        "POST",
        { targetUserId: id },
      );
      await apiRequest(
        "/conversations/" + conversation.id + "/messages",
        "POST",
        { content: "Hi! Would you be available for a campus coffee chat?" },
      );
      setRequested((prev) => [...prev, id]);
      toast.success("Coffee chat invitation sent.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send invitation.",
      );
    }
  };
  const toggleCommunity = async (id: string) => {
    const c = communities.find((item) => item.id === id);
    if (!c) return;
    try {
      await apiRequest(
        "/communities/" +
          id +
          (c.userRole
            ? "/leave"
            : c.joinPolicy === "APPROVAL_REQUIRED"
              ? "/request"
              : "/join"),
        c.userRole ? "DELETE" : "POST",
        !c.userRole && c.joinPolicy === "APPROVAL_REQUIRED" ? {} : undefined,
      );
      await refreshData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update membership.",
      );
    }
  };
  return {
    RECOMMENDED_STUDENTS,
    RECOMMENDED_SENIORS,
    TRENDING_COMMUNITIES,
    UPCOMING_HACKATHONS,
    DISCOVER_OPPORTUNITIES,
    TRENDING_SKILLS,
    toggleFollow,
    requestCoffee,
    toggleCommunity,
    toggleRegisterEvent,
    toggleSaveOpportunity,
  };
}
