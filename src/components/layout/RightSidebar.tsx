import { avatar } from "@/services/models";

import { useNavigate } from "react-router-dom";
import { MapPin, Plus, UserPlus, Hash, Flame, MessageSquare, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export function RightSidebar() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    openHostEvent,
    openCreateOpp,
    searchQuery,
    setSearchQuery,
    startChatWithUser,
    events,
    opportunities,
    students,
    posts,
    pages,
  } = useApp();

  const handleTagClick = (tag: string) => {
    if (searchQuery === tag) {
      setSearchQuery("");
      toast.info(`Cleared hashtag filter`);
    } else {
      setSearchQuery(tag);
      toast.success(`Filtering feed by #${tag}`);
    }
  };

  const handleMessageClassmate = (student: {
    id: string;
    name: string;
    avatar: string;
  }) => {
    startChatWithUser({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
    });
    navigate("/messages");
  };

  const classmates = students
    .slice(0, 3)
    .map((s) => ({
      id: s.userId,
      name: s.name,
      location: s.department || "",
      avatar: avatar(s.name, s.avatarUrl),
    }));
  const topicCounts = new Map<string, number>();
  posts.forEach((p) =>
    p.tags?.forEach((tag) =>
      topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1),
    ),
  );
  const TRENDING_TOPICS = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag, count]) => ({ tag, posts: count + " posts" }));

  const totalEvents = pages.events?.total ?? events.length;
  const totalRoles = pages.opportunities?.total ?? opportunities.length;

  return (
    <aside className="sticky top-[5.25rem] self-start w-full hidden lg:flex flex-col max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-hide no-scrollbar">
      {/* Unified Monolithic Panel matching LeftSidebar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-sm border border-border/50 bg-card/75 backdrop-blur-xl flex flex-col">
        {/* Section 1: Golden Minor (38.2%) - Campus Pulse & Quick Actions */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                Campus Pulse
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Campus
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2 rounded-2xl bg-secondary/40 border border-border/40">
              <div className="font-black text-foreground text-sm leading-none mb-0.5">
                {students.length}
              </div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Students
              </div>
            </div>
            <div className="p-2 rounded-2xl bg-secondary/40 border border-border/40">
              <div className="font-black text-foreground text-sm leading-none mb-0.5">
                {totalEvents}
              </div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Events
              </div>
            </div>
            <div className="p-2 rounded-2xl bg-secondary/40 border border-border/40">
              <div className="font-black text-foreground text-sm leading-none mb-0.5">
                {totalRoles}
              </div>
              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Roles
              </div>
            </div>
          </div>

          {/* Quick Actions inside Pulse */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={openHostEvent}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-secondary/40 hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400 text-muted-foreground text-xs font-semibold border border-border/40 transition-all cursor-pointer"
              title="Host Campus Event"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">Event</span>
            </button>
            <button
              onClick={openCreateOpp}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-secondary/40 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 text-muted-foreground text-xs font-semibold border border-border/40 transition-all cursor-pointer"
              title="Post Opportunity"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Role</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.origin);
                  toast.success("Campus invite link copied.");
                } catch {
                  toast.error("Unable to copy the link.");
                }
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-secondary/40 hover:bg-purple-500/15 hover:text-purple-600 dark:hover:text-purple-400 text-muted-foreground text-xs font-semibold border border-border/40 transition-all cursor-pointer"
              title="Invite Classmate"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="truncate">Invite</span>
            </button>
          </div>
        </div>

        {/* Golden Harmonic Divider */}
        <div className="h-px bg-border/40 my-3.5 w-full" />

        {/* Section 2: Golden Major (61.8%) - Trending & Social Connectivity */}
        <div className="flex flex-col gap-4">
          {/* Subsection A: Trending Topics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  Trending on Campus
                </h3>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {TRENDING_TOPICS.map((item) => {
                const isSelected =
                  searchQuery.toLowerCase() === item.tag.toLowerCase();
                return (
                  <button
                    key={item.tag}
                    onClick={() => handleTagClick(item.tag)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer group text-xs",
                      isSelected
                        ? "bg-primary/15 text-primary font-bold border border-primary/20"
                        : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground/60 group-hover:text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate font-semibold",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
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

          {/* Subsection Divider */}
          <div className="h-px bg-border/30 w-full" />

          {/* Subsection B: Active Classmates */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                Active Classmates
              </h3>
              <button
                onClick={() => navigate("/discover")}
                className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                Explore <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {classmates.map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-secondary/40 transition-colors"
                >
                  <div
                    onClick={() => handleMessageClassmate(student)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-foreground truncate leading-tight">
                        {student.name}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground leading-tight mt-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{student.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMessageClassmate(student)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                    title={`Message ${student.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;
