import { useState, useMemo } from "react";
import { Bookmark, Trash2, ExternalLink, Calendar, Briefcase, MessageSquare, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";

interface UnifiedSavedItem {
  id: string;
  rawId: string | number;
  category: "posts" | "opportunities" | "events";
  typeLabel: string;
  title: string;
  author: string;
  authorAvatar: string;
  content: string;
  image?: string | null;
  date?: string;
  location?: string;
  compensation?: string;
  dateSaved: string;
  likes?: number;
}

const SAVED_TABS = [
  { id: "all", label: "All Items" },
  { id: "posts", label: "Saved Posts" },
  { id: "opportunities", label: "Opportunities" },
  { id: "events", label: "Registered Events" },
];

export default function Saved() {
  const { posts, toggleSavePost, opportunities, toggleSaveOpportunity, events, toggleRegisterEvent } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  // Dynamically derive saved items from AppContext state
  const savedPosts: UnifiedSavedItem[] = useMemo(() => {
    return posts
      .filter((p) => p.saved)
      .map((p) => ({
        id: `post-${p.id}`,
        rawId: p.id,
        category: "posts" as const,
        typeLabel: p.type === "poll" ? "Campus Poll" : "Feed Post",
        title: p.content.slice(0, 75) + (p.content.length > 75 ? "..." : ""),
        author: p.author.name,
        authorAvatar: p.author.avatar,
        content: p.content,
        image: p.image,
        dateSaved: p.timestamp,
        likes: p.likes,
      }));
  }, [posts]);

  const savedOpportunities: UnifiedSavedItem[] = useMemo(() => {
    return opportunities
      .filter((o) => o.isSaved)
      .map((o) => ({
        id: `opp-${o.id}`,
        rawId: o.id,
        category: "opportunities" as const,
        typeLabel: o.type,
        title: o.title,
        author: o.company,
        authorAvatar: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80",
        content: o.description || "University campus partner opportunity.",
        location: o.location,
        dateSaved: o.deadline ? `Deadline: ${o.deadline}` : "Ongoing",
        compensation: o.stipendOrPrize,
      }));
  }, [opportunities]);

  const registeredEvents: UnifiedSavedItem[] = useMemo(() => {
    return events
      .filter((e) => e.isRegistered)
      .map((e) => ({
        id: `evt-${e.id}`,
        rawId: e.id,
        category: "events" as const,
        typeLabel: e.category || "Event",
        title: e.title,
        author: e.host,
        authorAvatar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150",
        content: `Venue: ${e.venue} • Time: ${e.time || 'TBD'}`,
        image: e.image,
        date: e.date,
        dateSaved: "Registered Pass",
      }));
  }, [events]);

  const allItems: UnifiedSavedItem[] = useMemo(() => {
    return [...savedPosts, ...savedOpportunities, ...registeredEvents];
  }, [savedPosts, savedOpportunities, registeredEvents]);

  const handleRemove = (item: UnifiedSavedItem) => {
    if (item.category === "posts") {
      toggleSavePost(item.rawId);
      toast.info("Post removed from saved bookmarks");
    } else if (item.category === "opportunities") {
      toggleSaveOpportunity(String(item.rawId));
      toast.info("Opportunity removed from saved bookmarks");
    } else if (item.category === "events") {
      toggleRegisterEvent(String(item.rawId));
      toast.info("Event RSVP cancelled");
    }
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return allItems;
    if (activeFilter === "posts") return savedPosts;
    if (activeFilter === "opportunities") return savedOpportunities;
    if (activeFilter === "events") return registeredEvents;
    return allItems;
  }, [activeFilter, allItems, savedPosts, savedOpportunities, registeredEvents]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-3">
            <span>Saved Bookmarks & Passes</span>
            <span className="text-xs px-3 py-1 rounded-full glass-pill text-primary font-bold">
              {allItems.length} Saved
            </span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Access your bookmarked posts, hackathons, and opportunities anytime.
          </p>
        </div>
      </div>

      {/* Glass Bubble Tab Bar */}
      <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {SAVED_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer z-10 flex-1 text-center",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="savedTabGlassBubble"
                  className="absolute inset-0 bg-background/90 dark:bg-card/90 rounded-xl shadow-sm border border-border/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-20">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items Feed Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-muted-foreground space-y-3">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h3 className="font-bold text-lg text-foreground">No saved items found</h3>
          <p className="text-xs max-w-sm mx-auto">
            Click the bookmark icon on posts or opportunities across your campus feed to save them here!
          </p>
          <button
            onClick={() => navigate("/campus")}
            className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer"
          >
            Browse Campus Feed
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="glass-panel rounded-3xl p-5 space-y-4 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.authorAvatar}
                      alt={item.author}
                      className="w-10 h-10 rounded-full border border-border shadow-xs object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.author}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md glass-pill font-bold text-primary">
                          {item.typeLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{item.dateSaved}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.content}</p>

                  {item.image && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-border/50 max-h-56">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {item.category === "events" && item.date && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-2 rounded-xl">
                      <Calendar className="w-4 h-4" />
                      <span>{item.date}</span>
                    </div>
                  )}

                  {item.category === "opportunities" && item.location && (
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                      {item.compensation && <span className="font-bold">{item.compensation}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
