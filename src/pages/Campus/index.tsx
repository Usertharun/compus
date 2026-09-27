import { useState } from "react";
import { CampusHeroBanner } from "@/components/home/CampusHeroBanner";
import { CampusPostFeed } from "@/components/home/CampusPostFeed";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sparkles, 
  MessageSquare, 
  Lightbulb, 
  HelpCircle, 
  Megaphone, 
  Image as ImageIcon, 
  Hash, 
  X,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEED_CATEGORIES = [
  { id: "all", label: "All Posts", icon: Sparkles },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: Lightbulb },
  { id: "questions", label: "Q&A", icon: HelpCircle },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

export default function CampusHome() {
  const { user, openCreatePost, searchQuery, setSearchQuery } = useApp();
  const [activeCategory, setActiveCategory] = useState("all");

  const handleClearTag = () => {
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto xl:max-w-none pb-12">
      
      {/* 1. Natural Campus Greeting & Hero Section */}
      <CampusHeroBanner />

      {/* 2. Interactive Post Composer Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-4 sm:p-5 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border shadow-xs shrink-0">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <button
            onClick={() => openCreatePost("general")}
            className="flex-1 text-left px-4 py-3 rounded-2xl bg-secondary/40 hover:bg-secondary/70 border border-border/40 text-xs sm:text-sm text-muted-foreground transition-all cursor-pointer truncate"
          >
            What's on your mind, {user.name.split(" ")[0]}? Share an update, project, or question...
          </button>
        </div>

        {/* Action Shortcut Buttons */}
        <div className="flex items-center justify-between gap-1 mt-3 pt-3 border-t border-border/40 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => openCreatePost("discussions")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-secondary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Discussion</span>
          </button>

          <button
            onClick={() => openCreatePost("projects")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-secondary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Project</span>
          </button>

          <button
            onClick={() => openCreatePost("questions")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-secondary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-sky-500" />
            <span>Ask Campus</span>
          </button>

          <button
            onClick={() => openCreatePost("general", true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-secondary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>Photo / Media</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Active Hashtag / Query Indicator */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground font-semibold"
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <span>Showing posts matching: <span className="font-bold text-primary">"{searchQuery}"</span></span>
          </div>
          <button
            onClick={handleClearTag}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Clear filter</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* 3. Feed Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide glass-panel p-1.5 rounded-2xl border border-border/50 bg-card/60">
        {FEED_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer z-10",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="feedCategoryPill"
                  className="absolute inset-0 bg-background/90 dark:bg-card/90 rounded-xl shadow-xs border border-border/60"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("w-3.5 h-3.5 relative z-20", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="relative z-20">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Dedicated Campus Post Feed */}
      <CampusPostFeed />
    </div>
  );
}