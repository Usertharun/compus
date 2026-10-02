import { useState } from "react";
import { Calendar, MapPin, Clock, Users, Check, Ticket, Sparkles, Plus, Search, X, LayoutGrid, List, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const CATEGORIES = [
  "All",
  "Hackathons",
  "Workshops",
  "Keynotes",
  "Socials",
  "My RSVPs",
];

export default function EventsPage() {
  const { openHostEvent, user, events, toggleRegisterEvent } = useApp();
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const registeredCount = events.filter((e) => e.isRegistered).length;

  const handleToggleRegister = async (
    id: string,
    title: string,
    currentStatus?: boolean,
  ) => {
    if (!(await toggleRegisterEvent(id))) return;
    toast.success(
      currentStatus
        ? `Cancelled registration for ${title}`
        : `Registration updated for ${title}. Check My RSVPs for your status.`,
    );
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === "My RSVPs") {
      if (!e.isRegistered) return false;
    } else if (selectedCategory !== "All") {
      const match =
        (e.category &&
          e.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === "Hackathons" &&
          e.title.toLowerCase().includes("hackathon"));
      if (!match) return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.host?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto pb-16"
    >
      {/* 1. Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-7 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-2.5">
            <Calendar className="w-3.5 h-3.5" />
            Campus calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Workshops, Hackathons & Keynotes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
            RSVP for campus tech talks, developer sprints, hackathons, and
            socials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setSelectedCategory("My RSVPs")}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border",
              selectedCategory === "My RSVPs"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-secondary/40 hover:bg-secondary border-border/50 text-foreground",
            )}
          >
            <Ticket className="w-4 h-4" />
            <span>My RSVPs</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-extrabold",
                selectedCategory === "My RSVPs"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/10 text-emerald-600",
              )}
            >
              {registeredCount}
            </span>
          </button>

          <button
            onClick={openHostEvent}
            className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Host Event
          </button>
        </div>
      </div>

      {/* 2. Controls & Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, venue, or host..."
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

        {/* View Switcher */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-2xl border border-border/50 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-xl transition-colors cursor-pointer",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-xl transition-colors cursor-pointer",
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              <span>{cat}</span>
              {cat === "My RSVPs" && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-md text-[10px] font-extrabold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/10 text-emerald-600",
                  )}
                >
                  {registeredCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Events Feed Grid / List */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground glass-panel rounded-3xl space-y-3 p-8 border border-border/50">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <h3 className="font-bold text-base text-foreground">
            {selectedCategory === "My RSVPs"
              ? "No RSVP'd events yet"
              : "No events match your filter"}
          </h3>
          <p className="text-xs max-w-sm mx-auto">
            {selectedCategory === "My RSVPs"
              ? "Browse the campus calendar and click 'Register' on upcoming events to register."
              : "Try adjusting your search terms or select 'All' to see all campus activities."}
          </p>
          {selectedCategory === "My RSVPs" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer"
            >
              Browse All Events
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={cn(
                "group rounded-3xl bg-card border border-border/50 overflow-hidden shadow-xs",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30",
                "transition-all duration-300 flex flex-col justify-between",
              )}
            >
              {/* Image Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-center shadow-md border border-border/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {event.date.split(",")[0]}
                  </span>
                  <span className="text-xs font-black text-foreground">
                    {event.date.split(",")[1]?.trim() || event.date}
                  </span>
                </div>

                {/* Category Tag */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                  {event.category || "Campus"}
                </div>

                {/* Host */}
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium truncate flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{event.host}</span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-muted-foreground font-medium">
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3.5 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-bold text-foreground">
                      {event.attendeesCount}
                    </span>{" "}
                    attending
                  </div>

                  <div className="flex items-center gap-1.5">
                    {event.isRegistered && (
                      <button
                        onClick={() => setSelectedTicket(event)}
                        className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold transition-colors cursor-pointer"
                        title="View registration"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleToggleRegister(
                          event.id,
                          event.title,
                          event.isRegistered,
                        )
                      }
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
                        event.isRegistered
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs active:scale-95",
                      )}
                    >
                      {event.isRegistered ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />{" "}
                          Confirmed
                        </>
                      ) : (
                        <>
                          <Ticket className="w-3.5 h-3.5" /> RSVP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Compact List View */
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all border border-border/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border/40"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {event.category || "Event"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {event.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{event.venue}</span> • <span>{event.host}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() =>
                    handleToggleRegister(
                      event.id,
                      event.title,
                      event.isRegistered,
                    )
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    event.isRegistered
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-emerald-600 text-white hover:bg-emerald-500",
                  )}
                >
                  {event.isRegistered ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Ticket className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {event.rsvpStatus === "WAITLISTED"
                      ? "Waitlisted"
                      : event.isRegistered
                        ? "Cancel RSVP"
                        : "Register"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Campus registration
                </span>
                <h3 className="font-extrabold text-base text-foreground mt-1 leading-snug">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued to {user.name} ({user.major})
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Status:{" "}
                {selectedTicket.rsvpStatus === "WAITLISTED"
                  ? "Waitlisted — awaiting a place"
                  : "Registered"}
                . Contact the organizer for admission requirements.
              </p>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Venue:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedTicket.venue}
                  </span>
                </div>
                <div>
                  Date & Time:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedTicket.date} • {selectedTicket.time}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2.5 rounded-xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
