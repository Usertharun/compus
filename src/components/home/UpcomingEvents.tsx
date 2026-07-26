import { useState } from "react";
import { EVENTS_DATA } from "@/data/eventsData";
import { Calendar, MapPin, Clock, Users, ChevronRight, Check, Sparkles, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function UpcomingEvents() {
  const [events, setEvents] = useState(EVENTS_DATA.slice(0, 6));

  const toggleRegister = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              isRegistered: !e.isRegistered,
              attendeesCount: e.isRegistered ? (e.attendeesCount || 100) - 1 : (e.attendeesCount || 100) + 1,
            }
          : e
      )
    );
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Upcoming Events
          </h2>
          <p className="text-sm text-muted-foreground font-normal mt-0.5">Workshops, hackathons & campus keynotes</p>
        </div>
        <button className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer">
          View calendar <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className={cn(
              "group rounded-3xl bg-card border border-border/40 overflow-hidden shadow-sm",
              "hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-border/60",
              "transition-all duration-300 flex flex-col justify-between"
            )}
          >
            {/* Banner Image & Overlay */}
            <div className="relative h-44 w-full overflow-hidden bg-muted">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Date Badge Overlay */}
              <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-center shadow-md border border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  {event.date.split(",")[0]}
                </span>
                <span className="text-xs font-black text-foreground">
                  {event.date.split(",")[1]?.trim()}
                </span>
              </div>

              {/* Category Tag */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                {event.category || "Campus"}
              </div>

              {/* Host */}
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium truncate flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{event.host}</span>
              </div>
            </div>

            {/* Event Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-muted-foreground font-medium">
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="font-bold text-foreground">{event.attendeesCount}</span> attending
                </div>

                <button
                  onClick={() => toggleRegister(event.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
                    event.isRegistered
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm active:scale-95"
                  )}
                >
                  {event.isRegistered ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" /> RSVP'd
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" /> Register
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
