import { Home, Users, Calendar, Briefcase, MessageSquare, Bookmark, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/campus" },
  { label: "Communities", icon: Users, href: "/communities" },
  { label: "Events", icon: Calendar, href: "/discover" },
  { label: "Opportunities", icon: Briefcase, href: "/discover" }, // Mock paths for now
  { label: "Messages", icon: MessageSquare, href: "/messages" },
  { label: "Saved", icon: Bookmark, href: "/saved" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function QuickNavMenu() {
  const location = useLocation();

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-3">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm",
                isActive 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
