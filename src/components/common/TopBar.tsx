import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Sparkles, Command, Menu, X } from "lucide-react";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { UserMenuDropdown } from "@/components/layout/UserMenuDropdown";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useApp } from "@/context/AppContext";

export interface TopBarProps {
  /** Custom page title override */
  title?: string;
  /** Custom page subtitle override */
  subtitle?: string;
  /** Custom logo click callback. Defaults to navigate("/campus") */
  onLogoClick?: () => void;
  /** Custom search trigger callback */
  onSearchClick?: () => void;
  /** Toggle search bar visibility (defaults to true) */
  showSearch?: boolean;
  /** Custom menu trigger callback for mobile */
  onMenuClick?: () => void;
  /** Toggle notification icon visibility (defaults to true) */
  showNotifications?: boolean;
  /** Toggle user avatar menu visibility (defaults to true) */
  showAvatar?: boolean;
  /** Custom outer header class name */
  className?: string;
  /** Custom inner container class name */
  containerClassName?: string;
  /** Additional custom actions on right side */
  rightActions?: ReactNode;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/campus": { title: "Campus Feed", subtitle: "What's happening at your university today" },
  "/": { title: "Campus Feed", subtitle: "What's happening at your university today" },
  "/discover": { title: "Discover", subtitle: "Explore upcoming events, workshops & groups" },
  "/communities": { title: "Communities", subtitle: "Student clubs, study hubs & societies" },
  "/messages": { title: "Messages", subtitle: "Direct chats & group discussions" },
  "/profile": { title: "My Profile", subtitle: "Manage your portfolio & student profile" },
  "/onboarding": { title: "Onboarding", subtitle: "Complete your campus setup" },
};

export function TopBar({
  title,
  subtitle,
  onLogoClick,
  onSearchClick,
  onMenuClick,
  showSearch = true,
  showNotifications = true,
  showAvatar = true,
  className,
  containerClassName,
  rightActions,
}: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const routeInfo = ROUTE_TITLES[location.pathname] || {
    title: title || "COMPUS",
    subtitle: subtitle || "Campus Networking Hub",
  };

  const displayTitle = title || routeInfo.title;
  const displaySubtitle = subtitle || routeInfo.subtitle;

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate("/campus");
    }
  };

  const { searchQuery, setSearchQuery } = useApp();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "sticky top-0 z-40 w-full backdrop-blur-2xl bg-background/80",
        "border-b border-border/50 shadow-xs transition-colors duration-200",
        className
      )}
    >
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", containerClassName)}>
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo & Current Page Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile Menu Toggle */}
            {onMenuClick && (
              <button 
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* COMPUS Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none shrink-0"
              aria-label="COMPUS Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-base text-foreground font-sans">
                    COMPUS
                  </span>
                </div>
              </div>
            </button>

          </div>

          {/* Right Actions: Section (Title), Search, Notifications, Avatar */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Current Page Title & Subtitle */}
            <div className="hidden lg:flex flex-col items-end text-right justify-center pr-2">
              <h1 className="text-base font-bold text-foreground tracking-tight truncate leading-none">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-[11px] text-muted-foreground truncate mt-1 font-normal">
                  {displaySubtitle}
                </p>
              )}
            </div>
            
            <div className="hidden lg:block h-5 w-[1px] bg-border/60 shrink-0" />
            
            {/* Expandable Single Search Icon */}
            {showSearch && (
              <div className="flex items-center relative">
                <motion.div
                  initial={false}
                  animate={{ width: (isSearchExpanded || searchQuery) ? (window.innerWidth < 640 ? 200 : 260) : 40 }}
                  className={cn(
                    "relative flex items-center bg-accent/50 hover:bg-accent border border-border/50 rounded-xl transition-colors overflow-hidden h-10",
                    (isSearchExpanded || searchQuery) ? "ring-2 ring-primary/20 border-primary/30" : ""
                  )}
                >
                  <button
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 outline-none cursor-pointer"
                    aria-label="Toggle Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campus..."
                    className={cn(
                      "w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70 pr-7 transition-opacity",
                      (isSearchExpanded || searchQuery) ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onFocus={() => setIsSearchExpanded(true)}
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 p-1 text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (isSearchExpanded && (
                    <kbd className="hidden lg:inline-flex absolute right-2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background rounded-md border border-border/60 pointer-events-none">
                      <Command className="w-2.5 h-2.5" />K
                    </kbd>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Additional Custom Actions */}
            {rightActions}

            {/* Notification Popover Dropdown */}
            {showNotifications && <NotificationDropdown />}

            {/* User Profile Avatar Dropdown */}
            {showAvatar && <UserMenuDropdown />}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default TopBar;
