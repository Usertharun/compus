import { useState } from "react";
import { DiscoverOpportunity } from "./types";
import { DISCOVER_OPPORTUNITIES } from "@/data/discoverMockData";
import { Briefcase, Calendar, ExternalLink, Bookmark, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OpportunitiesGridProps {
  onCardClick?: (item: DiscoverOpportunity) => void;
  selectedSkill?: string | null;
}

export function OpportunitiesGrid({ onCardClick, selectedSkill }: OpportunitiesGridProps) {
  const [opportunities, setOpportunities] = useState<DiscoverOpportunity[]>(DISCOVER_OPPORTUNITIES);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isSaved: !o.isSaved } : o))
    );
  };

  const filtered = selectedSkill
    ? opportunities.filter((o) => o.tags.some((t) => t.toLowerCase().includes(selectedSkill.toLowerCase())) || o.title.toLowerCase().includes(selectedSkill.toLowerCase()))
    : opportunities;

  if (filtered.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Campus Fellowships & Grants
          </h2>
          <p className="text-xs text-muted-foreground">Paid research roles, student VC funds & technical workshops</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((opp, index) => (
            <motion.div
              key={opp.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              onClick={() => onCardClick && onCardClick(opp)}
              className={cn(
                "p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3 group",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-border",
                "transition-all duration-300 cursor-pointer flex flex-col justify-between"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {opp.type}
                  </span>
                  <button
                    onClick={(e) => toggleSave(opp.id, e)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Bookmark className={cn("w-4 h-4", opp.isSaved && "fill-indigo-500 text-indigo-500")} />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{opp.organization}</p>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                {opp.stipendOrPrize && (
                  <div className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    {opp.stipendOrPrize}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {opp.deadline}
                </span>

                <button className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity shadow-xs">
                  Apply <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
