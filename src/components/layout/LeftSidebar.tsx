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
  Sparkles
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
  { label: "Communities", icon: Users, href: "/communities", group: "Campus life" },
  { label: "Events", icon: Calendar, href: "/events", group: "Campus life", badge: 3 },
  { label: "Opportunities", icon: Briefcase, href: "/opportunities", group: "Campus life", badge: "New", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
  { label: "Messages", icon: MessageSquare, href: "/messages", group: "Personal", badge: 2, badgeColor: "bg-indigo-500 text-white" },
  { label: "Saved", icon: Bookmark, href: "/saved", group: "Personal", badge: 4 },
  { label: "Profile", icon: User, href: "/profile", group: "Personal" },
  { label: "Settings", icon: Settings, href: "/settings", group: "Personal" },
];

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation();
  const { user, openCreatePost } = useApp();

  return (
    <aside className={cn(
      "self-start w-full flex-col gap-5 overflow-y-auto pb-6 scrollbar-hide",
      mobile ? "flex" : "sticky top-20 h-[calc(100vh-6rem)] hidden lg:flex"
    )}>
      
      {/* Student Profile Card */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-primary/20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card ring-1 ring-emerald-500/30" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base text-foreground truncate leading-tight flex items-center gap-1.5">
              <span>{user.name}</span>
            </h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.major}</p>
          </div>
        </div>
        
        <div className="text-[11px] text-muted-foreground mb-4 font-medium px-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span className="truncate">{user.university}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-center mb-4">
          <div className="glass-pill rounded-xl p-2 bg-secondary/40 border border-border/40">
            <div className="font-black text-foreground text-base leading-none mb-1">3</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">RSVPs</div>
          </div>
          <div className="glass-pill rounded-xl p-2 bg-secondary/40 border border-border/40">
            <div className="font-black text-foreground text-base leading-none mb-1">5</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Clubs</div>
          </div>
        </div>

        <Button 
          onClick={openCreatePost}
          className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 cursor-pointer font-bold text-xs h-10" 
        >
          <PenSquare className="w-4 h-4" />
          Share to Campus
        </Button>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Primary navigation" className="glass-panel rounded-3xl p-3 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        {(["Workspace", "Campus life", "Personal"] as const).map((group, groupIndex) => (
          <div key={group} className={cn(groupIndex > 0 && "mt-3 pt-3 border-t border-border/40")}>
            <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/70">{group}</p>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                const isActive = location.pathname.startsWith(item.href) || 
                                 (item.href === "/campus" && location.pathname === "/");
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs",
                      isActive 
                        ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/20" 
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none",
                        item.badgeColor || (isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-foreground")
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default LeftSidebar;
