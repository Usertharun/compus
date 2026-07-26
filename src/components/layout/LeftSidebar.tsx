import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Bookmark, 
  User, 
  Settings,
  PenSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/home/CreatePostModal";
import { useApp } from "@/context/AppContext";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/campus" },
  { label: "Communities", icon: Users, href: "/communities" },
  { label: "Events", icon: Calendar, href: "/events" },
  { label: "Opportunities", icon: Briefcase, href: "/opportunities" },
  { label: "Messages", icon: MessageSquare, href: "/messages" },
  { label: "Saved", icon: Bookmark, href: "/saved" },
  { label: "Profile", icon: User, href: "/profile" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function LeftSidebar() {
  const location = useLocation();
  const { user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] w-full hidden lg:flex flex-col gap-6 overflow-y-auto pb-6 scrollbar-hide">
      
      {/* Greeting Card */}
      <div className="glass-panel rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight">Good Day, {user.name.split(" ")[0]}!</h2>
            <p className="text-sm text-muted-foreground">{user.major}</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mb-4 font-medium">
          {user.university}
        </div>

        <div className="grid grid-cols-2 gap-3 text-center mb-5">
          <div className="glass-pill rounded-xl p-2.5">
            <div className="font-bold text-foreground text-lg leading-none mb-1">3</div>
            <div className="text-xs text-muted-foreground font-medium">Events</div>
          </div>
          <div className="glass-pill rounded-xl p-2.5">
            <div className="font-bold text-foreground text-lg leading-none mb-1">5</div>
            <div className="text-xs text-muted-foreground font-medium">Groups</div>
          </div>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)}
          className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 cursor-pointer" 
          size="lg"
        >
          <PenSquare className="w-4 h-4" />
          Create Post
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 glass-panel rounded-3xl p-3 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.href) || 
                           (item.href === "/campus" && location.pathname === "/");
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
}
