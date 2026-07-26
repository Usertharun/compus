import { useState } from "react";
import { OPPORTUNITIES_DATA } from "@/data/opportunitiesData";
import { Briefcase, Calendar, MapPin, ExternalLink, Bookmark, Plus, DollarSign, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const TYPES = ["All", "Internship", "Research", "Grant", "Club Role"];

export default function OpportunitiesPage() {
  const { openCreateOpp, searchQuery } = useApp();
  const toast = useToast();
  const [selectedType, setSelectedType] = useState("All");
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES_DATA);
  const [appliedOpp, setAppliedOpp] = useState<any | null>(null);

  const toggleBookmark = (id: string, title: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const nextState = !opp.isSaved;
          toast.success(nextState ? `Saved ${title} to bookmarks!` : `Removed ${title} from saved items`);
          return { ...opp, isSaved: nextState };
        }
        return opp;
      })
    );
  };

  const handleApply = (opp: any) => {
    toast.success(`Application submitted to ${opp.company || opp.organization || "recruiter"}!`);
    setAppliedOpp(null);
  };

  const filteredOpps = opportunities.filter((opp) => {
    const matchesType =
      selectedType === "All" ||
      opp.type.toLowerCase().includes(selectedType.toLowerCase());

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.company?.toLowerCase().includes(q) ||
      opp.description?.toLowerCase().includes(q) ||
      opp.tags?.some((t) => t.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            Career & Grants Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Internships, Research & Grants
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-normal">
            Apply to top student positions, research labs, startup roles, and funding grants.
          </p>
        </div>

        <button
          onClick={openCreateOpp}
          className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Post an Opportunity
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TYPES.map((type) => {
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredOpps.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground glass-panel rounded-3xl space-y-2">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h3 className="font-bold text-lg text-foreground">No opportunities found</h3>
          <p className="text-xs">Try selecting a different filter category or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpps.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={cn(
                "p-6 rounded-3xl bg-card border border-border/70 shadow-xs",
                "flex flex-col justify-between space-y-4 group",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-border",
                "transition-all duration-300"
              )}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                      opp.badgeColor || "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                    )}
                  >
                    {opp.type}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground truncate max-w-[180px]">
                    {opp.company}
                  </span>
                </div>

                <button
                  onClick={() => toggleBookmark(opp.id, opp.title)}
                  className={cn(
                    "p-2 rounded-xl border transition-colors cursor-pointer",
                    opp.isSaved
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground hover:text-foreground border-border/40 hover:bg-accent"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", opp.isSaved && "fill-current")} />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                  {opp.title}
                </h3>
                {opp.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                    {opp.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              {opp.tags && opp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.tags.map((tag, tIndex) => (
                    <span
                      key={tIndex}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-accent/60 text-muted-foreground border border-border/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs">
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

                <button
                  onClick={() => setAppliedOpp(opp)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                >
                  Apply <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {appliedOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-background border border-border rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary uppercase">{appliedOpp.type}</span>
                <h3 className="font-extrabold text-lg text-foreground">{appliedOpp.title}</h3>
                <p className="text-xs text-muted-foreground">{appliedOpp.company}</p>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/30 text-xs text-muted-foreground leading-relaxed">
                {appliedOpp.description}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Attach Note / Portfolio Link</label>
                <input
                  type="text"
                  placeholder="https://github.com/myusername or brief note..."
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAppliedOpp(null)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApply(appliedOpp)}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 shadow-md"
                >
                  Submit Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
