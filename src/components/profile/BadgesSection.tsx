import { BadgeItem } from "./types";
import { Award, Trophy, GitPullRequest, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgesSectionProps {
  badges: BadgeItem[];
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  const getIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-white" };
    switch (iconName) {
      case "Trophy":
        return <Trophy {...props} />;
      case "Award":
        return <Award {...props} />;
      case "GitPullRequest":
        return <GitPullRequest {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Earned Badges & Honors
        </h2>
        <span className="text-xs text-muted-foreground font-medium">{badges.length} Badges</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="p-4 rounded-2xl bg-accent/40 border border-border/50 flex items-center gap-3 hover:border-border transition-colors group"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform",
                badge.color
              )}
            >
              {getIcon(badge.iconName)}
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-xs text-foreground truncate">{badge.title}</h4>
              <p className="text-[10px] text-muted-foreground truncate">{badge.issuer}</p>
              <span className="text-[9px] font-mono text-muted-foreground">{badge.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
