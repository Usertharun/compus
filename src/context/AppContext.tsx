import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService, ApiPost } from "../services/api";

export interface UserProfile {
  name: string;
  email: string;
  major: string;
  gradYear: string;
  bio: string;
  avatar: string;
  university: string;
  location: string;
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
  type: string;
  liked: boolean;
  saved: boolean;
  votedOption?: string | null;
}

const DEFAULT_USER: UserProfile = {
  name: "Alex Rivera",
  email: "alex.chen@srmist.edu.in",
  major: "Computer Science",
  gradYear: "2026",
  bio: "Building open-source tools & campus communication platform.",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  university: "SRM Institute of Science and Technology",
  location: "Campus Central 📚",
};

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 1,
    author: { name: "Alex Rivera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", title: "CS, Junior" },
    timestamp: "2 hours ago",
    content: "Welcome to Compus! The enterprise campus communication platform is now live and synchronized with the production PostgreSQL database backend.",
    image: null,
    tags: ["compus", "backend", "live"],
    likes: 24,
    comments: 5,
    type: "text",
    liked: false,
    saved: false,
  },
  {
    id: 2,
    author: { name: "Computer Science Society", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CS", title: "Official Community" },
    timestamp: "5 hours ago",
    content: "Announcing the 2026 Annual Campus Hackathon! Register your teams now in the Events section.",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
    tags: ["hackathon", "cs", "events"],
    likes: 156,
    comments: 32,
    type: "image",
    liked: true,
    saved: true,
  }
];

interface AppContextType {
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  posts: PostItem[];
  addPost: (content: string, image?: string | null, tags?: string[]) => void;
  toggleLikePost: (id: number | string) => void;
  toggleSavePost: (id: number | string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCreatePostOpen: boolean;
  openCreatePost: () => void;
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
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("compus_user_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_USER;
  });

  const [posts, setPosts] = useState<PostItem[]>(() => {
    const saved = localStorage.getItem("compus_posts");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_POSTS;
  });

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Sync with live backend API
  useEffect(() => {
    async function loadLiveBackendData() {
      const health = await apiService.getHealth();
      if (health && health.success) {
        setIsBackendConnected(true);
        const livePosts = await apiService.getLatestFeed();
        if (livePosts && livePosts.length > 0) {
          const formattedLivePosts: PostItem[] = livePosts.map((p: ApiPost) => ({
            id: p.id,
            author: {
              name: p.author?.profile?.fullName || p.author?.email || "Student",
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
          }));
          setPosts(formattedLivePosts);
        }
      }
    }
    loadLiveBackendData();
  }, []);

  useEffect(() => {
    localStorage.setItem("compus_user_profile", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("compus_posts", JSON.stringify(posts));
  }, [posts]);

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const addPost = async (content: string, image: string | null = null, tags: string[] = ["campus"]) => {
    const newPost: PostItem = {
      id: Date.now().toString(),
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
      type: image ? "image" : "text",
      liked: false,
      saved: false,
    };

    setPosts((prev) => [newPost, ...prev]);

    // Send to live REST API if connected
    if (isBackendConnected) {
      await apiService.createPost(content, image ? [image] : []);
    }
  };

  const toggleLikePost = (id: number | string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
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

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isHostEventOpen, setIsHostEventOpen] = useState(false);
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);

  const openCreatePost = () => setIsCreatePostOpen(true);
  const closeCreatePost = () => setIsCreatePostOpen(false);

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
        toggleLikePost,
        toggleSavePost,
        searchQuery,
        setSearchQuery,
        isCreatePostOpen,
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
