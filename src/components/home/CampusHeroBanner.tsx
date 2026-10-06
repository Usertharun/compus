import { useApp } from "@/context/AppContext";
import { CalendarDays, ChevronDown, Clock, GraduationCap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MyCampusHub } from "./MyCampusHub";
import { cn } from "@/lib/utils";

export function CampusHeroBanner() {
  const { user, events } = useApp();
  const [todayOpen, setTodayOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user.name.split(" ")[0] || "Student";
  const rsvpCount = events ? events.filter((e) => e.isRegistered).length : 2;

  // Format today's date nicely: e.g. "Monday, Sep 14"
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl glass-panel border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-primary/5 p-5 sm:p-6 shadow-sm backdrop-blur-md"
    >
      {/* Subtle background glow accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          {/* Campus metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{user.university}</span>
            </span>
            <span className="hidden sm:inline-block opacity-40">•</span>
            <span className="text-[11px] flex items-center gap-1 text-muted-foreground font-medium">
              <Clock className="w-3 h-3" />
              <span>{todayStr}</span>
            </span>
          </div>

          {/* Natural Greeting */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            {getGreeting()}, <span className="text-primary">{firstName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-normal leading-relaxed">
            Stay updated with discussions, club announcements, and technical workshops across campus.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            aria-expanded={todayOpen}
            aria-controls="campus-today-summary"
            onClick={() => setTodayOpen((open) => !open)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold transition-colors",
              todayOpen
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 border-border/40 text-foreground hover:bg-secondary",
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", todayOpen && "rotate-180")} />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-secondary/50 border border-border/40 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">{rsvpCount} RSVPs</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Live Feed</span>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {todayOpen && (
          <motion.div
            id="campus-today-summary"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 18 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 overflow-hidden border-t border-border/50 pt-4"
          >
            <MyCampusHub compact />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CampusHeroBanner;
