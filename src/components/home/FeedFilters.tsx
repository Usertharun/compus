import { cn } from "@/lib/utils";

const FILTERS = ["All", "Communities", "Events", "Opportunities", "Posts"];

export function FeedFilters() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((filter, index) => (
        <button
          key={filter}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap border",
            index === 0 
              ? "bg-foreground text-background border-foreground shadow-sm"
              : "bg-card text-muted-foreground border-border/40 hover:bg-accent hover:text-foreground"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
