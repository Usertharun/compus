import { useState } from "react";
import { DiscoverCommunity } from "./types";
import { TRENDING_COMMUNITIES } from "@/data/discoverMockData";
import { Users, Check, Plus, MessageSquare, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TrendingCommunitiesSectionProps {
  onCardClick?: (item: DiscoverCommunity) => void;
  selectedSkill?: string | null;
}

export function TrendingCommunitiesSection({ onCardClick, selectedSkill }: TrendingCommunitiesSectionProps) {
  const [communities, setCommunities] = useState<DiscoverCommunity[]>(TRENDING_COMMUNITIES);

  const toggleJoin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isJoined: !c.isJoined, membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1 } : c
      )
    );
  };

  const filtered = selectedSkill
    ? communities.filter((c) => c.name.toLowerCase().includes(selectedSkill.toLowerCase()) || c.category.toLowerCase().includes(selectedSkill.toLowerCase()))
    : communities;

  if (filtered.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Trending Communities
          </h2>
          <p className="text-xs text-muted-foreground">Most active student societies and research groups on campus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((comm, index) => (
            <motion.div
              key={comm.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              onClick={() => onCardClick && onCardClick(comm)}
              className={cn(
                "rounded-2xl bg-card border border-border/70 shadow-xs overflow-hidden group",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:border-border",
                "transition-all duration-300 cursor-pointer flex flex-col justify-between"
              )}
            >
              {/* Banner Top */}
              <div className={cn("h-16 w-full bg-gradient-to-r relative p-3", comm.bannerGradient)}>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-xs border border-white/20">
                  {comm.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 -mt-8">
                    <img
                      src={comm.avatar}
                      alt={comm.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-4 ring-card shadow-md"
                    />
                    <div className="pt-4 flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {comm.name}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium">
                        {comm.membersCount.toLocaleString()} members
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>

                  <div className="p-2 rounded-xl bg-accent/40 text-[11px] text-foreground font-medium flex items-center gap-1.5 border border-border/40">
                    <span className="truncate">{comm.trendingTopic}</span>
                  </div>
                </div>

                {/* Footer Join Action */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Active now
                  </span>

                  <button
                    onClick={(e) => toggleJoin(comm.id, e)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer",
                      comm.isJoined
                        ? "bg-accent text-foreground hover:bg-destructive/10 hover:text-destructive"
                        : "bg-amber-600 text-white hover:bg-amber-500 shadow-xs active:scale-95"
                    )}
                  >
                    {comm.isJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Joined
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Join Club
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
