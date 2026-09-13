import { useState } from "react";
import { OPPORTUNITIES_DATA } from "@/data/opportunitiesData";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Send,
  Building2,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const TYPES = ["All", "Internship", "Research", "Grant", "Club Role", "My Applications"];

interface AppliedItem {
  id: string;
  title: string;
  company: string;
  appliedDate: string;
  status: "Submitted" | "Under Review" | "Shortlisted";
}

export default function OpportunitiesPage() {
  const { openCreateOpp, user } = useApp();
  const toast = useToast();
  const [selectedType, setSelectedType] = useState("All");
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES_DATA);
  const [appliedOpp, setAppliedOpp] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedItems, setAppliedItems] = useState<AppliedItem[]>([
    {
      id: "app-1",
      title: "Machine Learning Research Fellow",
      company: "Stanford HAI Lab",
      appliedDate: "Applied 2 days ago",
      status: "Under Review"
    },
    {
      id: "app-2",
      title: "Frontend Engineering Intern",
      company: "Linear Technologies",
      appliedDate: "Applied 1 week ago",
      status: "Shortlisted"
    }
  ]);
  const [noteInput, setNoteInput] = useState("");

  const toggleBookmark = (id: string, title: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const nextState = !opp.isSaved;
          toast.success(nextState ? `Saved ${title} to bookmarks!` : `Removed ${title} from saved`);
          return { ...opp, isSaved: nextState };
        }
        return opp;
      })
    );
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appliedOpp) return;

    const newApp: AppliedItem = {
      id: `app-${Date.now()}`,
      title: appliedOpp.title,
      company: appliedOpp.company || "University Partner",
      appliedDate: "Just now",
      status: "Submitted"
    };

    setAppliedItems(prev => [newApp, ...prev]);
    toast.success(`Application submitted to ${newApp.company}! Track it under 'My Applications'.`);
    setAppliedOpp(null);
    setNoteInput("");
  };

  const filteredOpps = opportunities.filter((opp) => {
    if (selectedType !== "All" && selectedType !== "My Applications") {
      if (!opp.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      opp.title.toLowerCase().includes(q) ||
      opp.company?.toLowerCase().includes(q) ||
      opp.description?.toLowerCase().includes(q) ||
      opp.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto pb-16"
    >
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-7 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2.5">
            <Briefcase className="w-3.5 h-3.5" />
            Career, Research & Grants Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Internships, Lab Roles & Grants
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
            Direct access to student tech internships, academic research grants, and club executive positions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setSelectedType("My Applications")}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border",
              selectedType === "My Applications"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-secondary/40 hover:bg-secondary border-border/50 text-foreground"
            )}
          >
            <FileCheck className="w-4 h-4" />
            <span>My Applications</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[10px] font-extrabold",
              selectedType === "My Applications" ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600"
            )}>
              {appliedItems.length}
            </span>
          </button>

          <button
            onClick={openCreateOpp}
            className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Post Role
          </button>
        </div>
      </div>

      {/* 2. Controls & Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opportunities by title, company, or tech stack..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-card border border-border/50 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TYPES.map((type) => {
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <span>{type}</span>
              {type === "My Applications" && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-md text-[10px] font-extrabold",
                  isActive ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600"
                )}>
                  {appliedItems.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Content Area: Opportunities Grid OR My Applications View */}
      {selectedType === "My Applications" ? (
        /* My Applications Tracker */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-base text-foreground">Submitted Applications ({appliedItems.length})</h2>
            <span className="text-xs text-muted-foreground">Applications sent directly to recruiters & labs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appliedItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-3xl p-5 border border-border/50 bg-card/60 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      {item.company}
                    </span>
                    <span className={cn(
                      "text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border",
                      item.status === "Shortlisted" 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : item.status === "Under Review"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                    )}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" /> {item.appliedDate}
                  </span>
                  <span className="text-[11px] font-semibold text-primary">Candidate Profile Linked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground glass-panel rounded-3xl space-y-2 p-8 border border-border/50">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <h3 className="font-bold text-base text-foreground">No opportunities found</h3>
          <p className="text-xs max-w-sm mx-auto">Try selecting a different filter category or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpps.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={cn(
                "p-6 rounded-3xl bg-card border border-border/50 shadow-xs",
                "flex flex-col justify-between space-y-4 group",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/30",
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
                  title={opp.isSaved ? "Remove from bookmarks" : "Save opportunity"}
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
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary/50 text-muted-foreground border border-border/40"
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

      {/* 5. Application Modal */}
      <AnimatePresence>
        {appliedOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                    {appliedOpp.type} Application
                  </span>
                  <h3 className="font-extrabold text-lg text-foreground mt-2 leading-snug">
                    {appliedOpp.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{appliedOpp.company}</p>
                </div>
                <button
                  onClick={() => setAppliedOpp(null)}
                  className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                {appliedOpp.description}
              </div>

              <div className="rounded-2xl p-3 bg-primary/5 border border-primary/20 text-xs text-foreground space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pre-verified Campus Profile
                </div>
                <div className="text-muted-foreground text-[11px]">
                  Applying as <span className="font-semibold text-foreground">{user.name}</span> ({user.major} • {user.email})
                </div>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Portfolio Link / GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/myusername or portfolio URL"
                    defaultValue="https://github.com/Usertharun"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/40 border border-border/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Cover Note / Project Experience</label>
                  <textarea
                    rows={3}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Briefly explain your relevant coursework, projects, or why you'd excel in this position..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/40 border border-border/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppliedOpp(null)}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
