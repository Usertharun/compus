import { useState } from "react";
import { EVENTS_DATA } from "@/data/eventsData";
import { Calendar, MapPin, Clock, Users, Check, Ticket, Sparkles, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const CATEGORIES = ["All", "Hackathons", "Workshops", "Keynotes", "Socials"];

export default function EventsPage() {
  const { openHostEvent, searchQuery } = useApp();
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState(EVENTS_DATA);

  const toggleRegister = (id: string, title: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextState = !e.isRegistered;
          toast.success(nextState ? `RSVP confirmed for ${title}!` : `Cancelled RSVP for ${title}`);
          return {
            ...e,
            isRegistered: nextState,
            attendeesCount: nextState ? (e.attendeesCount || 100) + 1 : (e.attendeesCount || 100) - 1,
          };
        }
        return e;
      })
    );
  };

  const filteredEvents = events.filter((e) => {
    // Category match
    const matchesCategory =
      selectedCategory === "All" ||
      (e.category && e.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === "Hackathons" && e.title.toLowerCase().includes("hackathon"));

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.host?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Campus Calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Workshops, Hackathons & Keynotes
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-normal">
            RSVP for upcoming campus meetups, tech talks, and hackathons.
          </p>
        </div>

        <button
          onClick={openHostEvent}
          className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Host an Event
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground glass-panel rounded-3xl space-y-2">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h3 className="font-bold text-lg text-foreground">No events found</h3>
          <p className="text-xs">Try selecting a different category or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={cn(
                "group rounded-3xl bg-card border border-border/50 overflow-hidden shadow-sm",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-border",
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Date Badge Overlay */}
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-center shadow-md border border-border/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {event.date.split(",")[0]}
                  </span>
                  <span className="text-xs font-black text-foreground">
                    {event.date.split(",")[1]?.trim() || event.date}
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

                  <div className="space-y-2 text-xs text-muted-foreground font-medium">
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
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-bold text-foreground">{event.attendeesCount}</span> attending
                  </div>

                  <button
                    onClick={() => toggleRegister(event.id, event.title)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
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
      )}
    </motion.div>
  );
}
