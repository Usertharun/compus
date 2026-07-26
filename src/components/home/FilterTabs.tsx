import { cn } from "@/lib/utils";

const TABS = ["All", "Communities", "Events", "Opportunities", "Posts"];

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border cursor-pointer",
            activeTab === tab
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
