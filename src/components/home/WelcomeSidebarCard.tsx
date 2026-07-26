import { Calendar, Users, Briefcase, Zap, PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function WelcomeSidebarCard() {
  const { user, openCreatePost } = useApp();

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 shadow-sm">
      {/* User Info */}
      <div className="flex flex-col items-center text-center space-y-3">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-16 h-16 rounded-full object-cover ring-4 ring-background shadow-sm"
        />
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">{user.name}</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {user.major} • Class of '{user.gradYear ? user.gradYear.slice(-2) : '26'}
          </p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/40" />

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Events</span>
          </div>
          <span className="font-bold text-foreground">15</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Communities</span>
          </div>
          <span className="font-bold text-foreground">4</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Briefcase className="w-4 h-4 text-purple-500" />
            <span>Opportunities</span>
          </div>
          <span className="font-bold text-foreground">12</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Hackathons</span>
          </div>
          <span className="font-bold text-foreground">2</span>
        </div>
      </div>

      {/* Create Post CTA */}
      <button 
        onClick={openCreatePost}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        Create Post
      </button>
    </div>
  );
}
