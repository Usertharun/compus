import { ProfileEventItem } from "./types";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingEventsSectionProps {
  events: ProfileEventItem[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-500" />
          My Upcoming Events
        </h2>
        <span className="text-xs text-muted-foreground font-medium">{events.length} Scheduled</span>
      </div>

      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-4 rounded-2xl bg-accent/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-foreground">{evt.title}</h4>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    evt.status === "Organizer"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      : evt.status === "Speaking"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  )}
                >
                  {evt.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {evt.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {evt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {evt.location}
                </span>
              </div>
            </div>

            <button className="px-3.5 py-1.5 rounded-xl bg-card border border-border/80 text-foreground font-bold text-xs self-start sm:self-center hover:bg-accent transition-colors flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-emerald-500" /> View Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
