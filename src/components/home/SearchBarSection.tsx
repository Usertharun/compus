import { useState } from "react";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SearchBarSectionProps {
  onSearchChange?: (query: string) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const FILTER_TAGS = [
  { id: "all", label: "All" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
  { id: "people", label: "People" },
  { id: "opportunities", label: "Opportunities" },
];

export function SearchBarSection({
  onSearchChange,
  activeFilter = "all",
  onFilterChange,
}: SearchBarSectionProps) {
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState(activeFilter);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleFilterSelect = (filterId: string) => {
    setCurrentFilter(filterId);
    if (onFilterChange) onFilterChange(filterId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-3"
    >
      {/* Search Input Bar */}
      <div className="relative flex items-center group">
        <div className="absolute left-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search people, communities, events..."
          className={cn(
            "w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-medium",
            "bg-card text-foreground border border-border/80 shadow-xs",
            "placeholder:text-muted-foreground/70",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
            "transition-all duration-200"
          )}
        />

        {query ? (
          <button
            onClick={() => handleQueryChange("")}
            className="absolute right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute right-4 hidden sm:flex items-center gap-1 text-xs text-muted-foreground pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded-md bg-accent border border-border/60 font-mono text-[10px]">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          {FILTER_TAGS.map((tag) => {
            const isSelected = currentFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => handleFilterSelect(tag.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs scale-105"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>
    </motion.div>
  );
}
