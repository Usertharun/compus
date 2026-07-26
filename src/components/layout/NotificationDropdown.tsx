import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Calendar, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Check, 
  X,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "./types";
import { cn } from "@/lib/utils";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "ACM Hackathon 2026",
    description: "Registration for the annual Campus Hackathon is now live! Sign up before Friday.",
    time: "10m ago",
    unread: true,
    type: "event",
  },
  {
    id: "2",
    title: "AI & ML Club",
    description: "Sarah joined the group and posted a new discussion: 'Transformers in 2026'.",
    time: "45m ago",
    unread: true,
    type: "community",
  },
  {
    id: "3",
    title: "Alex Rivera sent a message",
    description: "Hey! Are we still meeting at the campus library for the group project?",
    time: "2h ago",
    unread: true,
    type: "message",
  },
  {
    id: "4",
    title: "Campus Announcement",
    description: "Student Center room bookings for Spring term open tomorrow at 9 AM.",
    time: "5h ago",
    unread: false,
    type: "system",
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case "community":
        return <Users className="w-4 h-4 text-indigo-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer",
          "hover:bg-accent/80 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-background"></span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden",
              "bg-background/95 backdrop-blur-2xl border border-border/80",
              "shadow-2xl shadow-black/15 ring-1 ring-black/5"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Read all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={cn(
                      "p-3.5 flex gap-3 text-left transition-colors cursor-pointer group hover:bg-accent/50",
                      item.unread ? "bg-accent/20" : "opacity-80"
                    )}
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-background border border-border/60 shadow-xs group-hover:border-border">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-semibold truncate", item.unread ? "text-foreground" : "text-muted-foreground")}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {item.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 self-center shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-1 hover:bg-accent/60 rounded-xl transition-colors"
              >
                View all notifications <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
