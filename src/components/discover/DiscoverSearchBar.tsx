import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DiscoverSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Discoveries" },
  { id: "seniors", label: "Seniors & Mentors" },
  { id: "peers", label: "Students & Peers" },
  { id: "communities", label: "Communities" },
  { id: "hackathons", label: "Hackathons" },
  { id: "opportunities", label: "Opportunities" },
];

export function DiscoverSearchBar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: DiscoverSearchBarProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Discover Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Explore People, Clubs & Opportunities
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-normal">
            Connect with campus mentors, find project teammates, and discover upcoming hackathons.
          </p>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative flex items-center group">
        <div className="absolute left-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by skill, name, role, or community (e.g. PyTorch, OpenAI, TreeHacks)..."
          className={cn(
            "w-full pl-14 pr-12 py-4 rounded-3xl text-sm font-medium",
            "bg-card text-foreground border border-border/40 shadow-sm",
            "placeholder:text-muted-foreground/70",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
            "transition-all duration-300"
          )}
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-5 p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Bar with Framer Motion layout indicator */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "relative px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0",
                isActive
                  ? "text-primary-foreground shadow-sm"
                  : "bg-card border border-border/30 text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDiscoverCategory"
                  className="absolute inset-0 bg-primary rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
