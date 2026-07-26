import { useState } from "react";
import { CommunityItem, CommunityPost } from "./types";
import { 
  ArrowLeft, 
  Users, 
  Check, 
  Plus, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Share2, 
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CommunityDetailViewProps {
  community: CommunityItem;
  onBack: () => void;
}

export function CommunityDetailView({ community, onBack }: CommunityDetailViewProps) {
  const [isJoined, setIsJoined] = useState(community.isJoined || false);
  const [memberCount, setMemberCount] = useState(community.memberCount);
  const [posts, setPosts] = useState<CommunityPost[]>(community.recentPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "events" | "members">("posts");

  const toggleJoin = () => {
    const nextState = !isJoined;
    setIsJoined(nextState);
    setMemberCount((prev) => (nextState ? prev + 1 : prev - 1));
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `p-${Date.now()}`,
      authorName: "Alex Rivera",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      authorRole: "Member",
      timeAgo: "Just now",
      content: newPostContent,
      likesCount: 0,
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Communities
        </button>
        <button className="p-2 rounded-xl bg-card border border-border/80 text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Banner & Header */}
      <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-lg">
        <div className={cn("h-48 sm:h-56 w-full bg-gradient-to-r relative p-6 flex items-end", community.bannerGradient)}>
          <div className="absolute top-4 left-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20">
              {community.category}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <img
                src={community.avatarUrl}
                alt={community.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-card shadow-xl"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{memberCount.toLocaleString()} Members</span>
                </p>
              </div>
            </div>

            <button
              onClick={toggleJoin}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-md self-start sm:self-auto",
                isJoined
                  ? "bg-accent text-foreground border border-border hover:bg-destructive/10 hover:text-destructive"
                  : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              )}
            >
              {isJoined ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" /> Joined Community
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Join Community
                </>
              )}
            </button>
          </div>

          {/* Full Bio / Description */}
          <div className="mt-6 pt-6 border-t border-border/60 space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About this Community</h3>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed max-w-3xl">
              {community.fullBio}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("posts")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
            activeTab === "posts"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
        >
          Recent Discussions ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
            activeTab === "events"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
        >
          Upcoming Events ({community.upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
            activeTab === "members"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
        >
          Members ({community.featuredMembers.length})
        </button>
      </div>

      {/* Tab Content 1: Discussions & Create Post */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {/* Create Post Input */}
          <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={`Share an update or question in ${community.name}...`}
              rows={2}
              className="w-full p-3 text-xs sm:text-sm rounded-xl bg-accent/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
              >
                Post Discussion
              </button>
            </div>
          </form>

          {/* Posts Feed List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No discussions posted yet. Be the first to start a topic!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover ring-1 ring-border" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-foreground">{post.authorName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-muted-foreground font-medium">{post.authorRole}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{post.timeAgo}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="pt-2 border-t border-border/50 flex items-center gap-6 text-xs text-muted-foreground">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={cn("flex items-center gap-1.5 hover:text-rose-500 transition-colors font-medium", post.isLiked && "text-rose-500")}
                    >
                      <Heart className={cn("w-4 h-4", post.isLiked && "fill-rose-500")} /> {post.likesCount}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors font-medium">
                      <MessageSquare className="w-4 h-4" /> {post.commentsCount} comments
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Events */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {community.upcomingEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No upcoming events scheduled right now.
            </div>
          ) : (
            community.upcomingEvents.map((evt) => (
              <div key={evt.id} className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{evt.title}</h4>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium pt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {evt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {evt.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {evt.location}</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs self-start sm:self-center hover:bg-emerald-500 shadow-xs transition-colors">
                  RSVP Event
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 3: Members */}
      {activeTab === "members" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {community.featuredMembers.map((member) => (
            <div key={member.id} className="p-4 rounded-2xl bg-card border border-border/70 flex items-center gap-3">
              <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-foreground">{member.name}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{member.role}</p>
                <p className="text-[11px] text-muted-foreground">{member.major}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
