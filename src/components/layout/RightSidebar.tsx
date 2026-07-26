import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

export function RightSidebar() {
  const { openCreatePost } = useApp();
  const [communities, setCommunities] = useState([
    { id: 1, name: "Design Club", members: "1.2k", logo: "🎨", joined: false },
    { id: 2, name: "Web Devs", members: "850", logo: "💻", joined: true },
    { id: 3, name: "Startup Connect", members: "2.1k", logo: "🚀", joined: false },
    { id: 4, name: "Photography", members: "540", logo: "📷", joined: false },
  ]);

  const toggleJoin = (id: number) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c))
    );
  };

  return (
    <aside className="sticky top-20 self-start h-[calc(100vh-6rem)] w-full hidden lg:flex flex-col gap-6 overflow-y-auto pb-6 scrollbar-hide">
      
      {/* Active Students */}
      <div className="glass-panel rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Active on Campus</h3>
          <span className="text-xs text-primary font-medium hover:underline cursor-pointer">View All</span>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { name: "Sarah Chen", location: "Main Library", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen" },
            { name: "Marcus Johnson", location: "Student Union", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
            { name: "Emma Wilson", location: "Engineering Bldg", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
            { name: "David Kim", location: "Coffee Shop", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
          ].map((student) => (
            <div key={student.name} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{student.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate">{student.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Orgs */}
      <div className="glass-panel rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Featured Communities</h3>
        </div>

        <div className="flex flex-col gap-3">
          {communities.map((community) => (
            <div key={community.id} className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                  {community.logo}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{community.name}</div>
                  <div className="text-xs text-muted-foreground">{community.members} Members</div>
                </div>
              </div>

              <Button
                onClick={() => toggleJoin(community.id)}
                size="sm"
                variant={community.joined ? "secondary" : "outline"}
                className="h-8 rounded-xl px-3 text-xs font-semibold cursor-pointer shrink-0"
              >
                {community.joined ? "Joined" : "Join"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel rounded-3xl p-5 shadow-lg">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <Button onClick={openCreatePost} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl border-dashed cursor-pointer">
            <Plus className="w-4 h-4" />
            Host Event
          </Button>
          <Button onClick={openCreatePost} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl border-dashed cursor-pointer">
            <Plus className="w-4 h-4" />
            Create Opportunity
          </Button>
          <Button onClick={() => alert('Invite link copied to clipboard!')} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl border-dashed cursor-pointer">
            <UserPlus className="w-4 h-4" />
            Invite Friends
          </Button>
        </div>
      </div>
    </aside>
  );
}
