import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/home/CreatePostModal";

const ACTIVE_STUDENTS = [
  { name: "Sarah Chen", location: "Main Library", avatar: "SA", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { name: "Marcus Johnson", location: "Student Union", avatar: "MJ", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
  { name: "Emma Wilson", location: "Engineering Bldg", avatar: "EW", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
  { name: "David Kim", location: "Coffee Shop", avatar: "DK", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
];

const INITIAL_COMMUNITIES = [
  { name: "Design Club", members: "1.2k", icon: "🎨", joined: false },
  { name: "Web Devs", members: "850", icon: "💻", joined: true },
  { name: "Startup Connect", members: "2.1k", icon: "🚀", joined: false },
  { name: "Photography", members: "540", icon: "📸", joined: false },
];

export function RightSidebar() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);

  const toggleJoin = (index: number) => {
    const newCommunities = [...communities];
    newCommunities[index].joined = !newCommunities[index].joined;
    setCommunities(newCommunities);
  };

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] w-full hidden lg:flex flex-col gap-6 overflow-y-auto pb-6 scrollbar-hide">
      
      {/* Active on Campus */}
      <div className="glass-panel rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Active on Campus</h3>
          <button onClick={() => navigate('/discover')} className="text-xs text-primary font-medium hover:underline cursor-pointer">View All</button>
        </div>
        
        <div className="flex flex-col gap-4">
          {ACTIVE_STUDENTS.map((student) => (
            <div key={student.name} onClick={() => navigate('/profile')} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={student.img} />
                    <AvatarFallback>{student.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></div>
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{student.name}</div>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <MapPin className="w-3 h-3" />
                    {student.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Communities */}
      <div className="glass-panel rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Featured Communities</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {communities.map((community, idx) => (
            <div key={community.name} className="flex items-center justify-between group">
              <div onClick={() => navigate('/communities')} className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-lg">
                  {community.icon}
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{community.name}</div>
                  <div className="text-xs text-muted-foreground">{community.members} Members</div>
                </div>
              </div>
              <Button 
                onClick={() => toggleJoin(idx)}
                variant={community.joined ? "outline" : "secondary"} 
                size="sm" 
                className="h-8 rounded-lg text-xs font-medium hover:bg-primary hover:text-primary-foreground cursor-pointer"
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
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl border-dashed cursor-pointer">
            <Plus className="w-4 h-4" />
            Host Event
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl border-dashed cursor-pointer">
            <Plus className="w-4 h-4" />
            Create Opportunity
          </Button>
          <Button onClick={() => alert('Invite link copied to clipboard!')} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl border-dashed cursor-pointer">
            <UserPlus className="w-4 h-4" />
            Invite Friends
          </Button>
        </div>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
}
