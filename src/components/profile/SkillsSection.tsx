import { SkillProficiency } from "./types";
import { Code2, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface SkillsSectionProps {
  skills: SkillProficiency[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-indigo-500" />
          Technical Skills & Proficiency
        </h2>
        <span className="text-xs text-muted-foreground font-medium">Verified by Projects</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <div key={index} className="p-3.5 rounded-2xl bg-accent/40 border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {skill.name}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{skill.level}%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
