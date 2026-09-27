import { useAuth } from "./AuthContext";
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService, ApiPost } from "../services/api";
import { EVENTS_DATA, CampusEvent } from "../data/eventsData";
import { OPPORTUNITIES_DATA, CampusOpportunity } from "../data/opportunitiesData";

export interface UserProfile {
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
  author: {
    name: string;
    avatar: string;
    title: string;
  };
  timestamp: string;
  content: string;
  image?: string | null;
  tags?: string[];
  likes: number;
  comments: number;
  type: "text" | "image" | "poll";
  liked: boolean;
  saved: boolean;
  votedOption?: string | null;
  pollOptions?: Array<{ option: string; votes: number }>;
  commentsList?: PostComment[];
}

const DEFAULT_USER: UserProfile = {
  name: "Student", email: "", major: "", gradYear: "", bio: "", avatar: "", university: "", location: "",
};

const INITIAL_PRODUCTION_POSTS: PostItem[] = [
  {
    id: "post-1",
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      title: "Senior '26 • CS & AI",
    },
    timestamp: "10 mins ago",
    content: "Excited to share our open-source agent framework built with React 19 and PyTorch! We just open-sourced the autonomous multi-agent task orchestrator. Feel free to clone the repo, submit PRs, and star it! 🌟🚀",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    tags: ["opensource", "ai", "react19", "pytorch"],
    likes: 48,
    comments: 6,
    type: "image",
    liked: false,
    saved: true,
    commentsList: [
      { id: 1, author: "Sarah Chen", authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", text: "Incredible architecture! The state reconciliation is super clean.", time: "8 mins ago" },
      { id: 2, author: "Marcus Vance", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "Pulling the latest build right now to test with local Ollama models.", time: "4 mins ago" },
    ],
  },
  {
    id: "post-2",
    author: {
      name: "Stanford AI Society",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      title: "Official Campus Society",
    },
    timestamp: "1 hour ago",
    content: "Which development framework is your team using for the upcoming TreeHacks 2026 collegiate hackathon? Cast your vote below! 👇",
    image: null,
    tags: ["hackathon", "treehacks", "survey"],
    likes: 132,
    comments: 14,
    type: "poll",
    liked: true,
    saved: false,
    votedOption: "Next.js & Supabase",
    pollOptions: [
      { option: "Next.js & Supabase", votes: 84 },
      { option: "Vite React & PostgreSQL", votes: 42 },
      { option: "Python FastAPI & PyTorch", votes: 29 },
      { option: "Rust / Native Systems", votes: 12 },
    ],
    commentsList: [
      { id: 3, author: "Devansh Gupta", authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", text: "Next.js 15 App Router with Server Actions is lightning fast for hackathons.", time: "45 mins ago" },
    ],
  },
  {
    id: "post-3",
    author: {
      name: "Priya Patel",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      title: "Junior '27 • Design & UX",
    },
    timestamp: "3 hours ago",
    content: "Sneak peek of the dark mode glassmorphic interface design system for our campus community! Feedback and critique on typography, spacing, and micro-animations are welcome. ✨🎨",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop",
    tags: ["design", "uiux", "figma", "darkmode"],
    likes: 95,
    comments: 8,
    type: "image",
    liked: false,
    saved: false,
    commentsList: [
      { id: 4, author: "Elena Rostova", authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", text: "The indigo glass highlights are stunning! Matches the desktop aesthetic nicely.", time: "2 hours ago" },
    ],
  },
];

interface AppContextType {
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  posts: PostItem[];
  addPost: (content: string, image?: string | null, tags?: string[], type?: "text" | "image" | "poll") => void;
  deletePost: (id: number | string) => void;
  toggleLikePost: (id: number | string) => void;
  toggleSavePost: (id: number | string) => void;
  addPostComment: (postId: number | string, text: string) => void;
  votePollOption: (postId: number | string, option: string) => void;
  events: CampusEvent[];
  addEvent: (event: Omit<CampusEvent, "id">) => void;
  toggleRegisterEvent: (id: string) => void;
  opportunities: CampusOpportunity[];
  addOpportunity: (opp: Omit<CampusOpportunity, "id">) => void;
  toggleSaveOpportunity: (id: string) => void;
  activeChatUser: { name: string; avatar: string; isOnline?: boolean } | null;
  startChatWithUser: (user: { name: string; avatar: string; isOnline?: boolean }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCreatePostOpen: boolean;
  createPostCategory: string;
  createPostMediaOpen: boolean;
  openCreatePost: (category?: string, mediaOpen?: boolean) => void;
  closeCreatePost: () => void;
  isHostEventOpen: boolean;
  openHostEvent: () => void;
  closeHostEvent: () => void;
  isCreateOppOpen: boolean;
  openCreateOpp: () => void;
  closeCreateOpp: () => void;
  isBackendConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: account } = useAuth();
  const storageKey = (key: string) => key + ":" + (account?.id || "anonymous");
  const [user, setUser] = useState<UserProfile>(() => {
    return account ? { ...DEFAULT_USER, name: account.profile?.name || account.name, email: account.email,
      major: account.profile?.department || "", gradYear: account.profile?.year || "", bio: account.profile?.bio || "",
      avatar: account.profile?.avatarUrl || "", banner: account.profile?.bannerUrl,
      location: account.profile?.campusLocation || "", githubUrl: account.profile?.githubUrl,
      linkedinUrl: account.profile?.linkedinUrl, portfolioUrl: account.profile?.portfolioUrl } : DEFAULT_USER;
  });

  const [posts, setPosts] = useState<PostItem[]>(() => {
    const saved = localStorage.getItem(storageKey("compus_posts"));
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return INITIAL_PRODUCTION_POSTS;
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    const saved = localStorage.getItem(storageKey("compus_events"));
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return EVENTS_DATA;
  });

  const [opportunities, setOpportunities] = useState<CampusOpportunity[]>(() => {
    const saved = localStorage.getItem(storageKey("compus_opportunities"));
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return OPPORTUNITIES_DATA;
  });

  const [activeChatUser, setActiveChatUser] = useState<{ name: string; avatar: string; isOnline?: boolean } | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Sync with live backend API
  useEffect(() => {
    async function loadLiveBackendData() {
      const health = await apiService.getHealth();
      if (health && health.status === 'ok') {
        setIsBackendConnected(true);
        const livePosts = await apiService.getLatestFeed();
        if (livePosts && livePosts.length > 0) {
          const formattedLivePosts: PostItem[] = livePosts.map((p: ApiPost) => ({
            id: p.id,
            author: {
              name: p.author?.profile?.name || p.author?.email || "Student",
              avatar: p.author?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
              title: `${p.author?.profile?.department || 'Verified Member'}`,
            },
            timestamp: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: p.content,
            image: p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls[0] : null,
            tags: [p.category || 'campus'],
            likes: p.likeCount || 0,
            comments: p.commentCount || 0,
            type: p.mediaUrls && p.mediaUrls.length > 0 ? 'image' : 'text',
            liked: false,
            saved: false,
            commentsList: [],
          }));
          setPosts(formattedLivePosts);
        }
      }
    }
    if (account) void loadLiveBackendData().catch(() => setIsBackendConnected(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey("compus_user_profile"), JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(storageKey("compus_posts"), JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(storageKey("compus_events"), JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(storageKey("compus_opportunities"), JSON.stringify(opportunities));
  }, [opportunities]);

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem(storageKey("compus_user_profile"), JSON.stringify(next));
      return next;
    });
  };

  const addPost = async (
    content: string, 
    image: string | null = null, 
    tags: string[] = ["campus"],
    type: "text" | "image" | "poll" = image ? "image" : "text"
  ) => {
    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      author: {
        name: user.name,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        title: `${user.major}, ${user.gradYear ? `'${user.gradYear.slice(-2)}` : 'Student'}`,
      },
      timestamp: "Just now",
      content,
      image,
      tags,
      likes: 0,
      comments: 0,
      type,
      liked: false,
      saved: false,
      commentsList: [],
    };

    setPosts((prev) => [newPost, ...prev]);

    if (isBackendConnected) {
      await apiService.createPost(content, image ? [image] : []).catch(() => setIsBackendConnected(false));
    }
  };

  const deletePost = (id: number | string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleLikePost = (id: number | string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextLiked = !p.liked;
          return {
            ...p,
            liked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const toggleSavePost = (id: number | string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
    );
  };

  const addPostComment = (postId: number | string, text: string) => {
    if (!text.trim()) return;
    const newComment: PostComment = {
      id: Date.now(),
      author: user.name,
      authorAvatar: user.avatar,
      text: text.trim(),
      time: "Just now",
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const list = p.commentsList || [];
          return {
            ...p,
            comments: p.comments + 1,
            commentsList: [...list, newComment],
          };
        }
        return p;
      })
    );
  };

  const votePollOption = (postId: number | string, option: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const options = (p.pollOptions || []).map((opt) => {
            if (opt.option === option) {
              return { ...opt, votes: opt.votes + 1 };
            }
            if (p.votedOption === opt.option) {
              return { ...opt, votes: Math.max(0, opt.votes - 1) };
            }
            return opt;
          });
          return {
            ...p,
            votedOption: option,
            pollOptions: options,
          };
        }
        return p;
      })
    );
  };

  const addEvent = (eventData: Omit<CampusEvent, "id">) => {
    const newEvt: CampusEvent = {
      id: `evt-${Date.now()}`,
      ...eventData,
      attendeesCount: 1,
      isRegistered: true,
    };
    setEvents((prev) => [newEvt, ...prev]);
  };

  const toggleRegisterEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextState = !e.isRegistered;
          return {
            ...e,
            isRegistered: nextState,
            attendeesCount: nextState ? (e.attendeesCount || 100) + 1 : Math.max(0, (e.attendeesCount || 100) - 1),
          };
        }
        return e;
      })
    );
  };

  const addOpportunity = (oppData: Omit<CampusOpportunity, "id">) => {
    const newOpp: CampusOpportunity = {
      id: `opp-${Date.now()}`,
      ...oppData,
      isSaved: false,
    };
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  const toggleSaveOpportunity = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, isSaved: !opp.isSaved } : opp))
    );
  };

  const startChatWithUser = (chatPartner: { name: string; avatar: string; isOnline?: boolean }) => {
    setActiveChatUser(chatPartner);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostCategory, setCreatePostCategory] = useState("general");
  const [createPostMediaOpen, setCreatePostMediaOpen] = useState(false);
  const [isHostEventOpen, setIsHostEventOpen] = useState(false);
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);

  const openCreatePost = (category?: string, mediaOpen?: boolean) => {
    if (category) setCreatePostCategory(category);
    if (mediaOpen !== undefined) setCreatePostMediaOpen(mediaOpen);
    setIsCreatePostOpen(true);
  };
  const closeCreatePost = () => {
    setIsCreatePostOpen(false);
    setCreatePostMediaOpen(false);
  };

  const openHostEvent = () => setIsHostEventOpen(true);
  const closeHostEvent = () => setIsHostEventOpen(false);

  const openCreateOpp = () => setIsCreateOppOpen(true);
  const closeCreateOpp = () => setIsCreateOppOpen(false);

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        posts,
        addPost,
        deletePost,
        toggleLikePost,
        toggleSavePost,
        addPostComment,
        votePollOption,
        events,
        addEvent,
        toggleRegisterEvent,
        opportunities,
        addOpportunity,
        toggleSaveOpportunity,
        activeChatUser,
        startChatWithUser,
        searchQuery,
        setSearchQuery,
        isCreatePostOpen,
        createPostCategory,
        createPostMediaOpen,
        openCreatePost,
        closeCreatePost,
        isHostEventOpen,
        openHostEvent,
        closeHostEvent,
        isCreateOppOpen,
        openCreateOpp,
        closeCreateOpp,
        isBackendConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

