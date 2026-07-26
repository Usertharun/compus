import { useState } from "react";
import { COMMUNITIES_DATA } from "@/data/communitiesData";
import { Cpu, Code, Zap, Rocket, Bot, Users, ChevronRight, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function FeaturedCommunities() {
  const featuredList = COMMUNITIES_DATA.slice(0, 6);
  const [communities, setCommunities] = useState(featuredList);

  const toggleJoin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isJoined: !(c as any).isJoined, members: (c as any).isJoined ? c.members - 1 : c.members + 1 } : c
      )
    );
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Featured Communities
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 font-normal">Find & join active student clubs on campus</p>
        </div>
        <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer">
          Explore all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Cards Scroll */}
      <div className="flex gap-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-1">
        {communities.map((community, index) => {
          const isJoined = (community as any).isJoined;
          return (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className={cn(
                "snap-start shrink-0 w-64 sm:w-72 p-6 rounded-3xl bg-card border border-border/40 shadow-sm",
                "flex flex-col justify-between space-y-5 group",
                "hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-border/70",
                "transition-all duration-300 cursor-pointer"
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-sm", community.banner)}>
                  <Users className="w-5 h-5 text-white/90" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent text-muted-foreground border border-border/30">
                  {community.category}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {community.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {community.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {community.members.toLocaleString()}
                </span>

                <button
                  onClick={(e) => toggleJoin(community.id, e)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
                    isJoined
                      ? "bg-accent/80 text-foreground hover:bg-destructive/10 hover:text-destructive"
                      : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:scale-95"
                  )}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" /> Joined
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Join
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
