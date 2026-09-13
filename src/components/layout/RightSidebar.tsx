import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, UserPlus, Hash, Flame, Sparkles, MessageSquare, Check, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const TRENDING_TOPICS = [
  { tag: "TreeHacks2026", posts: "128 posts", badge: "Hackathon" },
  { tag: "AI_Agents", posts: "86 posts", badge: "Research" },
  { tag: "FoundersMeetup", posts: "64 posts", badge: "Community" },
  { tag: "FigmaDesign", posts: "42 posts", badge: "Workshop" },
  { tag: "ExamPrep", posts: "35 posts", badge: "Academic" },
];

export function RightSidebar() {
  const navigate = useNavigate();
  const toast = useToast();
  const { openHostEvent, openCreateOpp, searchQuery, setSearchQuery } = useApp();
  const [communities, setCommunities] = useState([
    { id: 1, name: "Design Club", members: "1.2k", logo: "🎨", joined: false },
    { id: 2, name: "Web Devs", members: "850", logo: "💻", joined: true },
    { id: 3, name: "Startup Connect", members: "2.1k", logo: "🚀", joined: false },
  ]);

  const toggleJoin = (id: number) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.joined;
          toast.success(nextState ? `Joined ${c.name}!` : `Left ${c.name}`);
          return { ...c, joined: nextState };
        }
        return c;
      })
    );
  };

  const handleTagClick = (tag: string) => {
    if (searchQuery === tag) {
      setSearchQuery("");
      toast.info(`Cleared hashtag filter`);
    } else {
      setSearchQuery(tag);
      toast.success(`Filtering feed by #${tag}`);
    }
  };

  return (
    <aside className="sticky top-20 self-start w-full hidden lg:flex flex-col gap-5 pb-6">
      
      {/* 1. Campus Pulse Live Stats */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">Campus Pulse</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="font-black text-foreground text-sm leading-none mb-1">1.4k</div>
            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Online</div>
          </div>
          <div className="p-2 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="font-black text-foreground text-sm leading-none mb-1">14</div>
            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Events</div>
          </div>
          <div className="p-2 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="font-black text-foreground text-sm leading-none mb-1">28</div>
            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Roles</div>
          </div>
        </div>
      </div>

      {/* 2. Trending Topics / Hashtags */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">Trending Topics</h3>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {TRENDING_TOPICS.map((item) => {
            const isSelected = searchQuery.toLowerCase() === item.tag.toLowerCase();
            return (
              <button
                key={item.tag}
                onClick={() => handleTagClick(item.tag)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group text-xs",
                  isSelected
                    ? "bg-primary/15 text-primary font-bold border border-primary/20"
                    : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary")} />
                  <span className={cn("truncate font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                    {item.tag}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 font-medium ml-2">
                  {item.posts}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Peers */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">Active Classmates</h3>
          <button 
            onClick={() => navigate("/discover")}
            className="text-[11px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Explore <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { name: "Sarah Chen", location: "Main Library", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen" },
            { name: "Marcus Johnson", location: "Student Union", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
            { name: "Emma Wilson", location: "Engineering Lab", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
          ].map((student) => (
            <div key={student.name} className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-secondary/40 transition-colors">
              <div 
                onClick={() => navigate("/discover")}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-foreground truncate">{student.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{student.location}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/messages`)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                title={`Message ${student.name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm border border-border/50 bg-card/60 backdrop-blur-md">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground mb-3">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <Button 
            onClick={openHostEvent} 
            variant="outline" 
            className="w-full justify-start gap-2 h-9 rounded-xl border-border/50 hover:border-indigo-500/40 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-500" />
            Host Campus Event
          </Button>
          <Button 
            onClick={openCreateOpp} 
            variant="outline" 
            className="w-full justify-start gap-2 h-9 rounded-xl border-border/50 hover:border-emerald-500/40 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            Post Opportunity
          </Button>
          <Button 
            onClick={() => {
              navigator.clipboard?.writeText?.(window.location.origin);
              toast.success("Invite link copied to clipboard!");
            }} 
            variant="outline" 
            className="w-full justify-start gap-2 h-9 rounded-xl border-border/50 hover:border-purple-500/40 text-xs font-semibold cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-500" />
            Invite Classmate
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;
