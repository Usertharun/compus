import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Compass, 
  Users, 
  MessageSquare, 
  User, 
  LucideIcon 
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BottomNavItemProps {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number | string;
}

export interface BottomNavigationProps {
  /** Optional custom list of navigation items. Defaults to standard 5 tabs. */
  items?: BottomNavItemProps[];
  /** Optional active path override. Defaults to React Router useLocation().pathname */
  activePath?: string;
  /** Callback fired when a tab is clicked */
  onTabChange?: (item: BottomNavItemProps) => void;
  /** Custom wrapper class name */
  className?: string;
  /** Custom inner floating dock class name */
  dockClassName?: string;
  /** Toggle label text visibility (defaults to true) */
  showLabels?: boolean;
  /** Custom layout ID for active tab animation (defaults to 'bottomNavActivePill') */
  layoutId?: string;
}

export const DEFAULT_BOTTOM_NAV_ITEMS: BottomNavItemProps[] = [
  {
    id: "home",
    label: "Home",
    path: "/campus",
    icon: Home,
  },
  {
    id: "discover",
    label: "Discover",
    path: "/discover",
    icon: Compass,
  },
  {
    id: "communities",
    label: "Communities",
    path: "/communities",
    icon: Users,
  },
  {
    id: "messages",
    label: "Messages",
    path: "/messages",
    icon: MessageSquare,
    badge: 2,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export function BottomNavigation({
  items = DEFAULT_BOTTOM_NAV_ITEMS,
  activePath,
  onTabChange,
  className,
  dockClassName,
  showLabels = true,
  layoutId = "bottomNavActivePill",
}: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = activePath || location.pathname;

  const handleTabClick = (item: BottomNavItemProps) => {
    if (onTabChange) {
      onTabChange(item);
    } else {
      navigate(item.path);
    }
  };

  const { scrollY } = useScroll();
  const [isCompact, setIsCompact] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 80) {
      setIsCompact(true);
    } else if (latest < previous || latest <= 50) {
      setIsCompact(false);
    }
  });

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-3 sm:pb-5 px-4 flex justify-center",
        className
      )}
    >
      <nav
        aria-label="Bottom Navigation"
        className={cn(
          "pointer-events-auto relative flex items-center justify-around",
          "w-full transition-all duration-300 ease-in-out",
          isCompact 
            ? "max-w-xs px-2 py-1.5 rounded-full shadow-xl bg-background/90 backdrop-blur-2xl border border-border/80" 
            : "max-w-lg px-2 py-2 rounded-3xl bg-background/85 backdrop-blur-2xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]",
          dockClassName
        )}
      >
        {items.map((item) => {
          // Path matching: exact match or route aliases (e.g. / campus matches /)
          const isActive =
            currentPath === item.path ||
            (item.path === "/campus" && currentPath === "/");

          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group focus:outline-none flex-1",
                isCompact ? "py-1.5 px-2 rounded-full max-w-[50px]" : "py-2 px-3 sm:px-4 rounded-2xl max-w-[80px]"
              )}
            >
              {/* Active Tab Animated Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className={cn(
                    "absolute inset-0 bg-primary/10 dark:bg-primary/20 border border-primary/10",
                    isCompact ? "rounded-full" : "rounded-2xl"
                  )}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative z-10 flex items-center justify-center">
                <IconComponent
                  className={cn(
                    "transition-all duration-200",
                    isCompact ? "w-4 h-4" : "w-5 h-5",
                    isActive
                      ? "text-primary scale-110"
                      : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                  )}
                />

                {item.badge !== undefined && item.badge !== null && (
                  <span className={cn(
                    "absolute flex items-center justify-center rounded-full bg-indigo-500 font-bold text-white px-1 shadow-xs ring-2 ring-background animate-in fade-in zoom-in duration-200",
                    isCompact ? "-top-1 -right-1.5 h-3 min-w-3 text-[9px]" : "-top-1.5 -right-2 h-4 min-w-4 text-[10px]"
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label - hidden in compact mode */}
              {showLabels && !isCompact && (
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "relative z-10 text-[11px] font-medium mt-1 tracking-tight transition-colors duration-200 whitespace-nowrap",
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
}

export default BottomNavigation;
