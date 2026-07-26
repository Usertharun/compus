import { useState } from "react";
import { HackathonItem } from "./types";
import { UPCOMING_HACKATHONS } from "@/data/discoverMockData";
import { Trophy, Calendar, MapPin, Users, Ticket, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UpcomingHackathonsSectionProps {
  onCardClick?: (item: HackathonItem) => void;
}

export function UpcomingHackathonsSection({ onCardClick }: UpcomingHackathonsSectionProps) {
  const [hackathons, setHackathons] = useState<HackathonItem[]>(UPCOMING_HACKATHONS);

  const toggleRegister = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHackathons((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isRegistered: !h.isRegistered } : h))
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Upcoming Hackathons
          </h2>
          <p className="text-xs text-muted-foreground">National collegiate hackathons & campus build sprints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hackathons.map((hackathon, index) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onCardClick && onCardClick(hackathon)}
            className={cn(
              "rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs group",
              "hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:border-border",
              "transition-all duration-300 cursor-pointer flex flex-col sm:flex-row"
            )}
          >
            {/* Image side */}
            <div className="relative sm:w-2/5 h-44 sm:h-auto overflow-hidden bg-muted">
              <img
                src={hackathon.image}
                alt={hackathon.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-amber-500 text-black text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 fill-black" />
                {hackathon.prizePool}
              </div>
            </div>

            {/* Content side */}
            <div className="p-4 sm:w-3/5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {hackathon.organizer}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {hackathon.teamStatus}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                  {hackathon.title}
                </h3>

                <div className="space-y-1 text-xs text-muted-foreground font-medium pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>{hackathon.dates}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{hackathon.location}</span>
                  </div>
                </div>
              </div>

              {/* Tags & Action */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {hackathon.tags.slice(0, 2).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-accent text-muted-foreground shrink-0"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => toggleRegister(hackathon.id, e)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all duration-200 cursor-pointer",
                    hackathon.isRegistered
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
                  )}
                >
                  {hackathon.isRegistered ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Registered
                    </>
                  ) : (
                    <>
                      <Ticket className="w-3.5 h-3.5" /> Register
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
