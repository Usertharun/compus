import { Briefcase, Calendar, MapPin, ExternalLink, ChevronRight, Bookmark } from "lucide-react";
import { OPPORTUNITIES_DATA } from "@/data/opportunitiesData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function OpportunitiesSection() {
  const oppList = OPPORTUNITIES_DATA.slice(0, 6);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Campus Opportunities
          </h2>
          <p className="text-xs text-muted-foreground font-normal">Internships, research grants, hackathons & club recruiting</p>
        </div>
        <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
          Explore all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {oppList.map((opp, index) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className={cn(
              "p-5 rounded-2xl bg-card border border-border/70 shadow-xs",
              "flex flex-col justify-between space-y-4 group",
              "hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-border",
              "transition-all duration-300 cursor-pointer"
            )}
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                    opp.badgeColor || "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                  )}
                >
                  {opp.type}
                </span>
                <span className="text-xs font-semibold text-muted-foreground truncate max-w-[150px]">
                  {opp.company}
                </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                {opp.title}
              </h3>
              {opp.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                  {opp.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {opp.tags && (
              <div className="flex flex-wrap gap-1.5">
                {opp.tags.map((tag, tIndex) => (
                  <span
                    key={tIndex}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent/60 text-muted-foreground border border-border/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {opp.deadline}
                </span>
                {opp.location && (
                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {opp.location}
                  </span>
                )}
              </div>

              <button className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity shadow-xs cursor-pointer">
                Apply <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
