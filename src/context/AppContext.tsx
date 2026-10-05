import { useAuth } from "./AuthContext";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { apiRequest } from "../services/api";
import type { CampusEvent } from "../data/eventsData";
import type { CampusOpportunity } from "../data/opportunitiesData";
import type {
  Community,
  Event,
  Opportunity,
  Page,
  Post,
  Student,
} from "../services/models";
import { avatar, formatDate, formatTime } from "../services/models";
import { mergeItems, hasNextPage } from '../services/pagination';

export type Collection = 'events' | 'organizedEvents' | 'opportunities' | 'communities' | 'students' | 'savedOpportunities' | 'registrations' | 'savedPosts';
const collectionPaths: Record<Collection, string> = {
  events: '/events/browse', opportunities: '/opportunities/browse', communities: '/communities/browse', students: '/profile/search',
  savedOpportunities: '/opportunities/saved', registrations: '/events/registrations', savedPosts: '/feed/bookmarks',
  organizedEvents: '/events/organized',
};

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  major: string;
  gradYear: string;
  bio: string;
  avatar: string;
  banner?: string;
  university: string;
  location: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}
export interface PostComment {
  id: number | string;
  author: string;
  authorAvatar?: string;
  text: string;
  time: string;
}
export interface PostItem {
  id: number | string;
  author: { id?: string; name: string; avatar: string; title: string };
  timestamp: string;
  content: string;
  image?: string | null;
  tags?: string[];
  likes: number;
  comments: number;
  type: "text" | "image" | "poll";
  liked: boolean;
  saved: boolean;
  category: string;
  votedOption?: string | null;
  pollOptions?: { option: string; votes: number }[];
  commentsList?: PostComment[];
}
export interface ChatPartner {
  id?: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}
export const mapPost = (p: Post): PostItem => ({
  id: p.id,
  author: {
    id: p.authorId || p.author.id,
    name: p.author.profile?.name || "Student",
    avatar: avatar(
      p.author.profile?.name || "Student",
      p.author.profile?.avatarUrl,
    ),
    title: p.author.profile?.department || "SRM student",
  },
  timestamp: formatDate(p.createdAt) + " · " + formatTime(p.createdAt),
  content: p.content,
  image: p.media?.[0]?.url || null,
  tags: p.tags?.length ? p.tags : [p.category.toLowerCase()],
  likes: p.likeCount,
  comments: p.commentCount,
  type: p.media?.length ? "image" : "text",
  category: p.category,
  liked: !!p.isLiked,
  saved: !!p.isBookmarked,
  commentsList:
    p.comments?.map((c) => ({
      id: c.id,
      author: c.author.profile?.name || "Student",
      authorAvatar: c.author.profile?.avatarUrl,
      text: c.content,
      time: formatDate(c.createdAt),
    })) || [],
});
export const mapEvent = (e: Event): CampusEvent => ({
  id: e.id,
  organizerId: e.organizerId,
  status: e.status,
  rsvpStatus: e.userRsvpStatus,
  title: e.title,
  date: formatDate(e.startTime),
  time: formatTime(e.startTime) + " – " + formatTime(e.endTime),
  venue: e.venue,
  host: e.organizer?.profile?.name || "SRM student",
  category: e.category,
  attendeesCount: e.rsvpCount,
  image: e.coverImageUrl,
  isRegistered:
    e.userRsvpStatus === "GOING" || e.userRsvpStatus === "WAITLISTED",
  description: e.description,
  startTime: e.startTime,
  endTime: e.endTime,
});
export const mapOpportunity = (o: Opportunity): CampusOpportunity => ({
  id: o.id,
  creatorId: o.creatorId,
  title: o.title,
  company: o.companyName,
  deadline: o.deadline ? formatDate(o.deadline) : "Open until filled",
  type: o.category as CampusOpportunity["type"],
  stipendOrPrize: o.stipend,
  location: o.location,
  tags: o.tags,
  description: o.description,
  isSaved: !!o.isBookmarked,
  applicationUrl: o.applicationUrl || o.registrationUrl,
  personalStatus: o.personalStatus,
});
function feedPath(category: string, query: string, cursor?: string) {
  const categories: Record<string, string> = {
    projects: "PROJECT",
    discussions: "DISCUSSION",
    questions: "QUESTION",
    announcements: "ANNOUNCEMENT",
  };
  const params = new URLSearchParams({ limit: "20" });
  if (categories[category]) params.set("category", categories[category]);
  if (query.trim()) params.set("search", query.trim());
  if (category === "trending") params.set("sort", "TRENDING");
  if (cursor) params.set("cursor", cursor);
  return "/feed/latest?" + params.toString();
}
function useAppState() {
  const { user: account } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [feedCategory, setFeedCategory] = useState("all");
  const currentFeedPath = feedPath(feedCategory, searchQuery);
  const feedFilter = useRef(currentFeedPath);
  useEffect(() => { feedFilter.current = currentFeedPath; }, [currentFeedPath]);
  const [profile, setProfile] = useState<Student | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [opportunities, setOpportunities] = useState<CampusOpportunity[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<CampusOpportunity[]>([]);
  const [registrations, setRegistrations] = useState<CampusEvent[]>([]);
  const [organizedEvents, setOrganizedEvents] = useState<CampusEvent[]>([]);
  const [joinedCommunityCount, setJoinedCommunityCount] = useState(0);
  const [pages, setPages] = useState<Partial<Record<Collection, Page<unknown>>>>({});
  const [paging, setPaging] = useState<Partial<Record<Collection, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const busy = useRef(new Set<string>());
  const generation = useRef(0);
  const user: UserProfile = {
    id: account?.id,
    name: account?.community?.name || profile?.name || account?.name || "Student",
    email: account?.email || "",
    major: profile?.department ?? account?.profile?.department ?? "",
    gradYear: profile?.year ?? account?.profile?.year ?? "",
    bio: profile?.bio ?? account?.profile?.bio ?? "",
    avatar: avatar(
      account?.community?.name || profile?.name || account?.name || "Student",
      account?.community?.avatarUrl ?? profile?.avatarUrl ?? account?.profile?.avatarUrl,
    ),
    banner: profile?.bannerUrl,
    university: "SRM Institute of Science and Technology",
    location: profile?.campusLocation || "",
    githubUrl: profile?.githubUrl,
    linkedinUrl: profile?.linkedinUrl,
    portfolioUrl: profile?.portfolioUrl,
  };
  const hydratePosts = async (items: Post[]) => items.map(mapPost);
  const acceptCollection = useCallback((key: Collection, page: Page<unknown>, append: boolean) => {
    setPages(prev => ({ ...prev, [key]: page }));
    const update = <T extends { id: string | number }>(prev: T[], items: T[]) => append ? mergeItems(prev, items) : items;
    if (key === 'events' || key === 'registrations' || key === 'organizedEvents') {
      const items = (page.items as Event[]).map(mapEvent);
      (key === 'events' ? setEvents : key === 'organizedEvents' ? setOrganizedEvents : setRegistrations)(prev => update(prev, items));
    } else if (key === 'opportunities' || key === 'savedOpportunities') {
      const items = (page.items as Opportunity[]).map(mapOpportunity);
      (key === 'opportunities' ? setOpportunities : setSavedOpportunities)(prev => update(prev, items));
    } else if (key === 'communities') setCommunities(prev => update(prev, page.items as Community[]));
    else if (key === 'students') setStudents(prev => update(prev, (page.items as Student[]).filter(s => s.userId !== account?.id)));
    else setSavedPosts(prev => update(prev, (page.items as Post[]).map(p => mapPost({ ...p, isBookmarked: true }))));
  }, [account?.id]);
  const requestCollection = (key: Collection, page = 1, nextCursor?: string | null) => {
    // Keep initial hydration light; every collection retains complete paging through
    // loadMoreCollection instead of downloading hundreds of records after login.
    const pageSize = 20;
    if (key === 'students') return apiRequest<Page<unknown>>(collectionPaths[key], 'POST', { page, limit: pageSize });
    const params = new URLSearchParams({ limit: String(pageSize) });
    if (key !== 'savedPosts') params.set('page', String(page));
    if (nextCursor) params.set('cursor', nextCursor);
    return apiRequest<Page<unknown>>(collectionPaths[key] + '?' + params);
  };
  const loadMoreCollection = async (key: Collection) => {
    const previous = pages[key];
    if (!previous || !hasNextPage(previous) || busy.current.has('page:' + key)) return;
    const current = generation.current;
    busy.current.add('page:' + key);
    setPaging(prev => ({ ...prev, [key]: true }));
    try {
      const page = await requestCollection(key, (previous.page || 1) + 1, previous.nextCursor);
      if (current === generation.current) acceptCollection(key, page, true);
    } catch (error) {
      if (current === generation.current) setDataError(error instanceof Error ? error.message : 'Unable to load more. Try again.');
    } finally {
      busy.current.delete('page:' + key);
      setPaging(prev => ({ ...prev, [key]: false }));
    }
  };
  const refreshData = useCallback(async () => {
    if (!account?.onboardingCompleted) return;
    const current = ++generation.current;
    setLoading(true);
    setDataError("");
    const results = await Promise.allSettled([
      apiRequest<{ total: number }>('/communities/my/count').then(result => { if (generation.current === current) setJoinedCommunityCount(result.total); }),
      apiRequest<Student>("/profile/me").then((p) => {
        if (generation.current === current) setProfile(p);
      }),
      apiRequest<Page<Post>>(feedFilter.current).then(async (p) => {
        const items = await hydratePosts(p.items);
        if (generation.current === current) {
          setPosts(items);
          setCursor(p.nextCursor || null);
          setHasMorePosts(!!p.hasMore);
        }
      }),
      ...Object.keys(collectionPaths).map(async name => {
        const key = name as Collection;
        const page = await requestCollection(key);
        if (generation.current === current) acceptCollection(key, page, false);
      }),
    ]);
    if (generation.current !== current) return;
    const failed = results.find((r) => r.status === "rejected");
    setIsBackendConnected(!failed);
    if (failed?.status === "rejected")
      setDataError(
        failed.reason instanceof Error
          ? failed.reason.message
          : "Some campus data could not be loaded. Please retry.",
      );
    setLoading(false);
  }, [account?.onboardingCompleted, acceptCollection]);
  useEffect(() => {
    // Start centralized server hydration when the authenticated account changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshData();
    const requestGeneration = generation;
    return () => {
      requestGeneration.current++;
    };
  }, [refreshData]);
  const previousFilter = useRef(currentFeedPath);
  useEffect(() => {
    if (
      previousFilter.current === currentFeedPath ||
      !account?.onboardingCompleted
    )
      return;
    previousFilter.current = currentFeedPath;
    let stopped = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setDataError("");
      try {
        const p = await apiRequest<Page<Post>>(currentFeedPath);
        if (!stopped) {
          setPosts(p.items.map(mapPost));
          setCursor(p.nextCursor || null);
          setHasMorePosts(!!p.hasMore);
        }
      } catch (e) {
        if (!stopped)
          setDataError(
            e instanceof Error ? e.message : "Search could not be loaded.",
          );
      } finally {
        if (!stopped) setLoading(false);
      }
    }, 300);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [currentFeedPath, account?.onboardingCompleted]);
  const mutate = async (key: string, operation: () => Promise<void>) => {
    if (busy.current.has(key)) return false;
    busy.current.add(key);
    try {
      await operation();
      return true;
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("compus:action-error", {
          detail:
            error instanceof Error
              ? error.message
              : "Unable to save your changes. Try again.",
        }),
      );
      return false;
    } finally {
      busy.current.delete(key);
    }
  };
  const updateUser = (updated: Partial<UserProfile>) =>
    mutate("profile", async () => {
      if (updated.name !== undefined && !updated.name.trim())
        throw new Error("Your name cannot be empty.");
      const fields: Record<string, unknown> = {};
      const mappings = {
        name: "name",
        major: "department",
        gradYear: "year",
        bio: "bio",
        avatar: "avatarUrl",
        banner: "bannerUrl",
        location: "campusLocation",
        githubUrl: "githubUrl",
        linkedinUrl: "linkedinUrl",
        portfolioUrl: "portfolioUrl",
      } as const;
      for (const [key, target] of Object.entries(mappings))
        if (updated[key as keyof typeof mappings] !== undefined)
          fields[target] = updated[key as keyof typeof mappings] || null;
      await apiRequest("/profile/me", "PATCH", fields);
      setProfile(await apiRequest<Student>("/profile/me"));
    });
  const addPost = (
    content: string,
    image: string | null = null,
    tags: string[] = [],
    _type?: "text" | "image" | "poll",
  ) =>
    mutate("create-post", async () => {
      const categories: Record<string, string> = {
        projects: "PROJECT",
        discussions: "DISCUSSION",
        questions: "QUESTION",
        announcements: "ANNOUNCEMENT",
        general: "GENERAL",
      };
      const p = await apiRequest<Post>("/feed/posts", "POST", {
        content,
        tags,
        category: categories[tags[0]] || "GENERAL",
        ...(image ? { media: [{ url: image, type: "IMAGE" }] } : {}),
      });
      setPosts((prev) => [mapPost(p), ...prev]);
    });
  const deletePost = (id: string | number) =>
    mutate("post:" + id, async () => {
      await apiRequest("/feed/posts/" + id, "DELETE");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSavedPosts((prev) => prev.filter((p) => p.id !== id));
    });
  const toggleLikePost = (id: string | number) =>
    mutate("post:" + id, async () => {
      const p = posts.find((item) => item.id === id);
      if (!p) return;
      await apiRequest(
        "/feed/posts/" + id + "/like",
        p.liked ? "DELETE" : "POST",
      );
      setPosts((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                liked: !p.liked,
                likes: Math.max(0, item.likes + (p.liked ? -1 : 1)),
              }
            : item,
        ),
      );
    });
  const toggleSavePost = (id: string | number) =>
    mutate("save:" + id, async () => {
      const p =
        posts.find((item) => item.id === id) ||
        savedPosts.find((item) => item.id === id);
      if (!p) return;
      await apiRequest(
        "/feed/posts/" + id + "/bookmark",
        p.saved ? "DELETE" : "POST",
      );
      setPosts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, saved: !p.saved } : item,
        ),
      );
      setSavedPosts((prev) =>
        p.saved
          ? prev.filter((item) => item.id !== id)
          : [{ ...p, saved: true }, ...prev],
      );
    });
  const loadPostComments = (id: string | number) =>
    mutate("comments:" + id, async () => {
      const p = mapPost(await apiRequest<Post>("/feed/posts/" + id));
      setPosts((prev) => prev.map((item) => (item.id === id ? p : item)));
    });
  const addPostComment = (id: string | number, text: string) =>
    mutate("comment:" + id, async () => {
      await apiRequest("/feed/posts/" + id + "/comments", "POST", {
        content: text.trim(),
      });
      const p = mapPost(await apiRequest<Post>("/feed/posts/" + id));
      setPosts((prev) => prev.map((item) => (item.id === id ? p : item)));
    });
  const addEvent = (e: Omit<CampusEvent, "id">) =>
    mutate("create-event", async () => {
      const start = new Date(e.startTime || e.date + "T" + (e.time || "09:00"));
      const end = e.endTime
        ? new Date(e.endTime)
        : new Date(start.getTime() + 2 * 3600000);
      const result = await apiRequest<Event>("/events", "POST", {
        title: e.title,
        description: e.description || e.title,
        venue: e.venue,
        category: e.category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      const published = await apiRequest<Event>(
        "/events/" + result.id + "/status",
        "POST",
        { status: "REGISTRATION_OPEN" },
      );
      setEvents((prev) => [mapEvent(published), ...prev]);
    });
  const toggleRegisterEvent = (id: string) =>
    mutate("event:" + id, async () => {
      const e = events.find((item) => item.id === id) || registrations.find(item => item.id === id);
      if (!e) return;
      await apiRequest(
        "/events/" + id + "/register",
        e.isRegistered ? "DELETE" : "POST",
      );
      const result = await apiRequest<Event>("/events/" + id);
      setEvents((prev) =>
        prev.map((item) => (item.id === id ? mapEvent(result) : item)),
      );
      const page = await requestCollection('registrations');
      acceptCollection('registrations', page, false);
    });
  const addOpportunity = (o: Omit<CampusOpportunity, "id">) =>
    mutate("create-opportunity", async () => {
      const result = await apiRequest<Opportunity>("/opportunities", "POST", {
        title: o.title,
        companyName: o.company,
        description: o.description || o.title,
        category: o.type,
        location: o.location || "Campus",
        stipend: o.stipendOrPrize,
        tags: o.tags || [],
        ...(o.applicationUrl ? { applicationUrl: o.applicationUrl } : {}),
        ...(o.deadline ? { deadline: new Date(o.deadline).toISOString() } : {}),
      });
      setOpportunities((prev) => [mapOpportunity(result), ...prev]);
    });
  const toggleSaveOpportunity = (id: string) =>
    mutate("opportunity:" + id, async () => {
      const o = opportunities.find((item) => item.id === id) || savedOpportunities.find(item => item.id === id);
      if (!o) return;
      await apiRequest(
        "/opportunities/" + id + "/bookmark",
        o.isSaved ? "DELETE" : "POST",
      );
      setOpportunities((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isSaved: !o.isSaved } : item,
        ),
      );
      const page = await requestCollection('savedOpportunities');
      acceptCollection('savedOpportunities', page, false);
    });
  const loadMorePosts = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const page = await apiRequest<Page<Post>>(
        feedPath(feedCategory, searchQuery, cursor),
      );
      const items = await hydratePosts(page.items);
      setPosts((prev) => [
        ...prev,
        ...items.filter((p) => !prev.some((item) => item.id === p.id)),
      ]);
      setCursor(page.nextCursor || null);
      setHasMorePosts(!!page.hasMore);
    } catch (error) {
      setDataError(
        error instanceof Error ? error.message : "Unable to load more posts.",
      );
    } finally {
      setLoading(false);
    }
  };
  const [activeChatUser, setActiveChatUser] = useState<ChatPartner | null>(
    null,
  );
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostCategory, setCreatePostCategory] = useState("general");
  const [createPostMediaOpen, setCreatePostMediaOpen] = useState(false);
  const [isHostEventOpen, setIsHostEventOpen] = useState(false);
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  return {
    user,
    profile,
    updateUser,
    posts,
    savedPosts,
    savedOpportunities,
    registrations,
    organizedEvents,
    joinedCommunityCount,
    pages,
    paging,
    loadMoreCollection,
    addPost,
    deletePost,
    toggleLikePost,
    toggleSavePost,
    addPostComment,
    loadPostComments,
    votePollOption: (_id: string | number, _option: string) => undefined,
    events,
    addEvent,
    toggleRegisterEvent,
    opportunities,
    addOpportunity,
    toggleSaveOpportunity,
    communities,
    students,
    activeChatUser,
    startChatWithUser: setActiveChatUser,
    searchQuery,
    setSearchQuery,
    feedCategory,
    setFeedCategory,
    isCreatePostOpen,
    createPostCategory,
    createPostMediaOpen,
    openCreatePost: (category = "general", media = false) => {
      setCreatePostCategory(category);
      setCreatePostMediaOpen(media);
      setIsCreatePostOpen(true);
    },
    closeCreatePost: useCallback(() => setIsCreatePostOpen(false), []),
    isHostEventOpen,
    openHostEvent: () => setIsHostEventOpen(true),
    closeHostEvent: useCallback(() => setIsHostEventOpen(false), []),
    isCreateOppOpen,
    openCreateOpp: () => setIsCreateOppOpen(true),
    closeCreateOpp: useCallback(() => setIsCreateOppOpen(false), []),
    isBackendConnected,
    loading,
    dataError,
    refreshData,
    hasMorePosts,
    loadMorePosts,
  };
}
const AppContext = createContext<ReturnType<typeof useAppState> | undefined>(
  undefined,
);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
