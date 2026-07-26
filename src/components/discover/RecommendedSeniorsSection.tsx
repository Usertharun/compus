import { useState } from "react";
import { SeniorMentor } from "./types";
import { RECOMMENDED_SENIORS } from "@/data/discoverMockData";
import { Coffee, ShieldCheck, GraduationCap, Users, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendedSeniorsSectionProps {
  onCardClick?: (item: SeniorMentor) => void;
  selectedSkill?: string | null;
}

export function RecommendedSeniorsSection({ onCardClick, selectedSkill }: RecommendedSeniorsSectionProps) {
  const [seniors, setSeniors] = useState<SeniorMentor[]>(RECOMMENDED_SENIORS);

  const toggleCoffee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSeniors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isCoffeeRequested: !s.isCoffeeRequested } : s))
    );
  };

  const filtered = selectedSkill
    ? seniors.filter((s) => s.skills.some((sk) => sk.toLowerCase().includes(selectedSkill.toLowerCase())))
    : seniors;

  if (filtered.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            Recommended Seniors & Alumni Mentors
          </h2>
          <p className="text-xs text-muted-foreground">Experienced upperclassmen ready for 1-on-1 coffee chats & advice</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((senior, index) => (
            <motion.div
              key={senior.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              onClick={() => onCardClick && onCardClick(senior)}
              className={cn(
                "p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4 group",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-border",
                "transition-all duration-300 cursor-pointer flex flex-col justify-between"
              )}
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name & Company Badge */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={senior.avatar}
                      alt={senior.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {senior.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                    </div>

                    <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {senior.companyTag}
                    </span>
                  </div>
                </div>

                {/* Major & Bio */}
                <div>
                  <p className="text-xs font-semibold text-foreground">{senior.major} · {senior.year}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {senior.bio}
                  </p>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1">
                  {senior.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent text-muted-foreground border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer: Mutual Connection & Coffee CTA */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <strong className="text-foreground">{senior.mutualCount}</strong> mutuals
                </span>

                <button
                  onClick={(e) => toggleCoffee(senior.id, e)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
                    senior.isCoffeeRequested
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs active:scale-95"
                  )}
                >
                  {senior.isCoffeeRequested ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-500" /> Requested ☕
                    </>
                  ) : (
                    <>
                      <Coffee className="w-3.5 h-3.5" /> Ask Coffee ☕
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
