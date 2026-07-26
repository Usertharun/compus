import { FEATURED_COMMUNITIES } from "@/data/homeMockData";
import { Plus } from "lucide-react";
import * as Icons from "lucide-react";

export function SidebarFeaturedCommunities() {
  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground">Trending Communities</h3>
      </div>

      <div className="flex flex-col gap-4">
        {FEATURED_COMMUNITIES.slice(0, 4).map((community) => {
          const Icon = (Icons as any)[community.iconName] || Icons.Users;

          return (
            <div key={community.id} className="flex gap-3 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${community.gradient} shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {community.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {community.memberCount.toLocaleString()} members
                </p>
              </div>
              <button 
                className="shrink-0 self-center w-8 h-8 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors"
                aria-label="Join community"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button className="w-full text-xs font-semibold text-primary hover:text-primary/80 transition-colors pt-2 border-t border-border/40">
        Discover more communities
      </button>
    </div>
  );
}
