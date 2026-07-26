import { ProfileJoinedCommunity } from "./types";
import { Users, ArrowUpRight } from "lucide-react";

interface CommunitiesJoinedSectionProps {
  communities: ProfileJoinedCommunity[];
}

export function CommunitiesJoinedSection({ communities }: CommunitiesJoinedSectionProps) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-500" />
          Communities & Clubs Joined
        </h2>
        <span className="text-xs text-muted-foreground font-medium">{communities.length} Joined</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="p-4 rounded-2xl bg-accent/40 border border-border/50 flex items-center justify-between group hover:border-border transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={comm.avatar}
                alt={comm.name}
                className="w-11 h-11 rounded-2xl object-cover ring-1 ring-border group-hover:scale-105 transition-transform"
              />
              <div>
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {comm.name}
                </h4>
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{comm.role}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{comm.membersCount.toLocaleString()} members</p>
              </div>
            </div>

            <span className="text-muted-foreground group-hover:text-primary transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
