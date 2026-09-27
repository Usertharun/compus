import { useAuth } from "@/context/AuthContext";
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
  LogOut, 
  Sun, 
  Moon, 
  X,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";

interface MobileNavDrawerProps {
  onClose: () => void;
}

const NAV_GROUPS = [
  {
    title: "Workspace",
    items: [
      { label: "Campus Feed", icon: Home, href: "/campus" },
      { label: "Discover", icon: Compass, href: "/discover" },
    ],
  },
  {
    title: "Campus Life",
    items: [
      { label: "Communities", icon: Users, href: "/communities" },
      { label: "Events", icon: Calendar, href: "/events", badge: 3 },
      { label: "Opportunities", icon: Briefcase, href: "/opportunities", badge: "New" },
    ],
  },
  {
    title: "Personal",
    items: [
      { label: "Messages", icon: MessageSquare, href: "/messages", badge: 2 },
      { label: "Saved", icon: Bookmark, href: "/saved" },
      { label: "Profile", icon: User, href: "/profile" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
];

export function MobileNavDrawer({ onClose }: MobileNavDrawerProps) {
  const location = useLocation();
  const { user } = useApp();
  const { logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    try { await logout(); } catch { /* Local session is cleared even if the server is unavailable. */ }
  };

  return (
    <div className="flex flex-col h-full text-foreground">
      {/* Header with Brand and Close button */}
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            C
          </div>
          <span className="font-extrabold tracking-tight text-lg text-foreground font-sans">COMPUS</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 -mr-1 text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Close Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Student Profile Card */}
      <Link 
        to="/profile" 
        onClick={onClose}
        className="flex items-center gap-3 p-3 mt-4 rounded-2xl bg-secondary/40 border border-border/40 hover:bg-secondary/60 transition-colors"
      >
        <Avatar className="h-11 w-11 border border-border shadow-xs shrink-0">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm text-foreground truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{user.major || user.university}</span>
          </div>
        </div>
      </Link>

      {/* Navigation Links by Group */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.href) || 
                               (item.href === "/campus" && location.pathname === "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-bold border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold",
                      isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Actions: Theme Toggle & Sign Out */}
      <div className="pt-3 border-t border-border/40 space-y-2 mt-auto">
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground capitalize">{isDarkMode ? "On" : "Off"}</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default MobileNavDrawer;
