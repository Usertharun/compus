import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Users,
  Calendar,
  Briefcase,
  MessageSquare,
  Bookmark,
  User,
  Settings,
  PenSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  group: "Workspace" | "Campus life" | "Personal";
  badge?: string | number;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Campus Feed", icon: Home, href: "/campus", group: "Workspace" },
  { label: "Discover", icon: Compass, href: "/discover", group: "Workspace" },
  {
    label: "Communities",
    icon: Users,
    href: "/communities",
    group: "Campus life",
  },
  { label: "Events", icon: Calendar, href: "/events", group: "Campus life" },
  {
    label: "Opportunities",
    icon: Briefcase,
    href: "/opportunities",
    group: "Campus life",
    badgeColor:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/messages",
    group: "Personal",
    badgeColor: "bg-indigo-500 text-white",
  },
  { label: "Saved", icon: Bookmark, href: "/saved", group: "Personal" },
  { label: "Profile", icon: User, href: "/profile", group: "Personal" },
  { label: "Settings", icon: Settings, href: "/settings", group: "Personal" },
];

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation();
  const { user, openCreatePost, events, communities, isBackendConnected } =
    useApp();
  const isCampusPage =
    location.pathname === "/" || location.pathname.startsWith("/campus");
  const registeredCount = events
    ? events.filter((e) => e.isRegistered).length
    : 0;

  return (
    <aside
      className={cn(
        "self-start w-full flex-col scrollbar-hide no-scrollbar",
        mobile
          ? "flex gap-3"
          : "sticky top-[5.25rem] hidden lg:flex max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-hide no-scrollbar",
      )}
    >
      {/* Unified Monolithic Panel with Golden Ratio Sectioning */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-sm border border-border/50 bg-card/75 backdrop-blur-xl flex flex-col">
        {/* Section 1: Golden Minor (38.2%) - Student Presence & Identity */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative shrink-0">
              <Avatar className="h-11 w-11 border-2 border-background shadow-sm ring-2 ring-primary/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm text-foreground truncate leading-snug">
                {user.name}
              </h2>
              <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                {user.major}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-0.5">
            <span className="truncate font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
              <span className="truncate">{user.university}</span>
            </span>
            <span className="font-semibold text-primary/80 shrink-0 ml-1.5">
              {user.gradYear}
            </span>
          </div>

          {/* Golden Metrics: RSVPs & Clubs */}
          <div className="grid grid-cols-2 gap-2 text-center mb-3">
            <Link
              to="/events"
              className="rounded-2xl p-2 bg-secondary/40 hover:bg-secondary/70 border border-border/40 transition-all hover:scale-[1.02] group"
            >
              <div className="font-black text-foreground text-sm leading-none mb-1 group-hover:text-primary transition-colors">
                {registeredCount}
              </div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                RSVPs
              </div>
            </Link>
            <Link
              to="/communities"
              className="rounded-2xl p-2 bg-secondary/40 hover:bg-secondary/70 border border-border/40 transition-all hover:scale-[1.02] group"
            >
              <div className="font-black text-foreground text-sm leading-none mb-1 group-hover:text-primary transition-colors">
                {communities.filter((c) => c.userRole).length}
              </div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Clubs
              </div>
            </Link>
          </div>

          {!isCampusPage ? (
            <Button
              onClick={() => openCreatePost()}
              className="w-full gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 cursor-pointer font-bold text-xs h-9"
            >
              <PenSquare className="w-4 h-4" />
              Share to Campus
            </Button>
          ) : (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-secondary/30 border border-border/30 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Active Campus Member
              </span>
              <span className="font-bold text-primary">
                {isBackendConnected ? "Connected" : "Connecting…"}
              </span>
            </div>
          )}
        </div>

        {/* Golden Harmonic Divider */}
        <div className="h-px bg-border/40 my-3.5 w-full" />

        {/* Section 2: Golden Major (61.8%) - Primary Navigation */}
        <nav aria-label="Primary navigation" className="flex flex-col gap-3">
          {(["Workspace", "Campus life", "Personal"] as const).map(
            (group, groupIndex) => (
              <div
                key={group}
                className={cn(
                  groupIndex > 0 && "pt-2 border-t border-border/30",
                )}
              >
                <p className="px-3 pb-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground/70">
                  {group}
                </p>
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.filter((item) => item.group === group).map(
                    (item) => {
                      const isActive =
                        location.pathname.startsWith(item.href) ||
                        (item.href === "/campus" && location.pathname === "/");
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-2xl transition-all duration-200 group text-sm font-medium",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                              : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-0.5",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                "w-4.5 h-4.5 transition-transform group-hover:scale-110 shrink-0",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground group-hover:text-foreground",
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0",
                                item.badgeColor ||
                                  (isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-secondary text-muted-foreground group-hover:text-foreground"),
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )}
        </nav>
      </div>
    </aside>
  );
}

export default LeftSidebar;
