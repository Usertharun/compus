import { AchievementProgress } from "./types";
import { Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";

interface AchievementsSectionProps {
  achievements: AchievementProgress[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-500" />
          Campus Milestones & Achievements
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {achievements.map((ach, index) => {
          const percent = Math.round((ach.current / ach.max) * 100);
          return (
            <div key={ach.id} className="p-4 rounded-2xl bg-accent/40 border border-border/50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-foreground">{ach.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{ach.description}</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {ach.current}/{ach.max}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Progress</span>
                  <span>{percent}% Completed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
