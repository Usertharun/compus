import { useState } from "react";
import { Bookmark, Trash2, ExternalLink, Calendar, Briefcase, MessageSquare, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SAVED_TABS = [
  { id: "all", label: "All Items" },
  { id: "posts", label: "Saved Posts" },
  { id: "opportunities", label: "Opportunities" },
  { id: "events", label: "Events" },
];

const INITIAL_SAVED_ITEMS = [
  {
    id: "p1",
    category: "posts",
    typeLabel: "Post",
    title: "UI Components for Campus Portal Redesign",
    author: "Design Club",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design",
    content: "Sneak peek of the new UI components we're working on for the campus portal redesign. What do you think of this color scheme?",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
    dateSaved: "Saved 2 hours ago",
    likes: 156,
  },
  {
    id: "o1",
    category: "opportunities",
    typeLabel: "Internship",
    title: "Software Engineer Intern - Summer 2026",
    author: "Stripe",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stripe",
    content: "Building core payments infrastructure and global developer APIs. Open for CS and ECE undergrads.",
    location: "San Francisco, CA / Remote",
    dateSaved: "Saved yesterday",
    compensation: "$55/hr",
  },
  {
    id: "e1",
    category: "events",
    typeLabel: "Hackathon",
    title: "Stanford AI & Web3 Innovation Hackathon",
    author: "ACM Student Chapter",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ACM",
    content: "48-hour sprint building intelligent agents and spatial apps. $15,000 in prizes and VC office hours.",
    date: "Oct 18-20 • Huang Engineering Center",
    dateSaved: "Saved 3 days ago",
  },
  {
    id: "p2",
    category: "posts",
    typeLabel: "Discussion",
    title: "Full-stack Next.js & Supabase Architecture Tips",
    author: "Alex Chen",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content: "Just finished building my first full-stack app using Next.js and Supabase! Here are the 5 lessons I learned.",
    dateSaved: "Saved 5 days ago",
    likes: 24,
  }
];

export default function Saved() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState(INITIAL_SAVED_ITEMS);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.category === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-3">
            <span>Saved Bookmarks</span>
            <span className="text-xs px-3 py-1 rounded-full glass-pill text-primary font-bold">
              {items.length} Saved
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
                    onClick={() => removeItem(item.id)}
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
