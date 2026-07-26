import { TRENDING_SKILLS } from "@/data/discoverMockData";
import { Sparkles, Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrendingSkillsBarProps {
  selectedSkill: string | null;
  onSkillSelect: (skillName: string | null) => void;
}

export function TrendingSkillsBar({ selectedSkill, onSkillSelect }: TrendingSkillsBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-500" />
          Trending Skills & Interests on Campus
        </h3>
        {selectedSkill && (
          <button
            onClick={() => onSkillSelect(null)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear skill filter ({selectedSkill})
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {TRENDING_SKILLS.map((skill, index) => {
          const isSelected = selectedSkill === skill.name;
          return (
            <motion.button
              key={skill.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              onClick={() => onSkillSelect(isSelected ? null : skill.name)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all duration-200 border",
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105"
                  : "bg-card border-border/70 text-foreground hover:bg-accent hover:border-border"
              )}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              )}
              <span>{skill.name}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md font-mono",
                  isSelected ? "bg-white/20 text-white" : "bg-accent text-muted-foreground"
                )}
              >
                {skill.count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
