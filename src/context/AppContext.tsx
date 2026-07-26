import React, { createContext, useContext, useState, useEffect } from "react";

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
  email: "arivera@stanford.edu",
  major: "Computer Science",
  gradYear: "2026",
  bio: "Building open-source tools & spatial web apps.",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  university: "Stanford University",
  location: "Green Library 📚",
};

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 1,
    author: { name: "Alex Rivera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", title: "CS, Junior" },
    timestamp: "2 hours ago",
    content: "Just finished building my first full-stack app using Next.js and Supabase! It was a steep learning curve but completely worth it. Anyone else working on similar stack for their capstone?",
    image: null,
    tags: ["nextjs", "supabase", "webdev"],
    likes: 24,
    comments: 5,
    type: "text",
    liked: false,
    saved: false,
  },
  {
    id: 2,
    author: { name: "Design Club", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design", title: "Official Community" },
    timestamp: "5 hours ago",
    content: "Sneak peek of the new UI components we're working on for the campus portal redesign. What do you think of this color scheme?",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
    tags: ["uiux", "design", "figma"],
    likes: 156,
    comments: 32,
    type: "image",
    liked: true,
    saved: true,
  },
  {
    id: 3,
    author: { name: "Sarah Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", title: "Marketing, Senior" },
    timestamp: "1 day ago",
    content: "Which email marketing platform do you prefer for student orgs?",
    image: null,
    tags: ["marketing", "tools"],
    likes: 12,
    comments: 45,
    type: "poll",
    liked: false,
    saved: false,
    votedOption: null,
  }
];

interface AppContextType {
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  posts: PostItem[];
  addPost: (content: string, image?: string | null, tags?: string[]) => void;
  toggleLikePost: (id: number | string) => void;
  toggleSavePost: (id: number | string) => void;
  isCreatePostOpen: boolean;
  openCreatePost: () => void;
  closeCreatePost: () => void;
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

  useEffect(() => {
    localStorage.setItem("compus_user_profile", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("compus_posts", JSON.stringify(posts));
  }, [posts]);

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const addPost = (content: string, image: string | null = null, tags: string[] = ["campus"]) => {
    const newPost: PostItem = {
      id: Date.now(),
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

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const openCreatePost = () => setIsCreatePostOpen(true);
  const closeCreatePost = () => setIsCreatePostOpen(false);

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        posts,
        addPost,
        toggleLikePost,
        toggleSavePost,
        isCreatePostOpen,
        openCreatePost,
        closeCreatePost,
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
