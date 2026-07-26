import { useState } from "react";
import { CommunityItem } from "./types";
import { Users, Check, Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CommunityCardProps {
  community: CommunityItem;
  onCardClick: (community: CommunityItem) => void;
  onToggleJoin?: (id: string, isJoined: boolean) => void;
}

export function CommunityCard({ community, onCardClick, onToggleJoin }: CommunityCardProps) {
  const [isJoined, setIsJoined] = useState(community.isJoined || false);
  const [memberCount, setMemberCount] = useState(community.memberCount);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isJoined;
    setIsJoined(nextState);
    setMemberCount((prev) => (nextState ? prev + 1 : prev - 1));
    if (onToggleJoin) onToggleJoin(community.id, nextState);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onCardClick(community)}
      className={cn(
        "group rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs cursor-pointer",
        "hover:shadow-xl hover:shadow-indigo-500/5 hover:border-border",
        "transition-all duration-300 flex flex-col justify-between"
      )}
    >
      {/* Banner & Category Pill */}
      <div className={cn("h-20 w-full bg-gradient-to-r relative p-3", community.bannerGradient)}>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-xs border border-white/20">
          {community.category}
        </span>
        {community.isFeatured && (
          <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
            ★ Featured
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Avatar Icon Overlay */}
          <div className="flex items-center justify-between -mt-9">
            <img
              src={community.avatarUrl}
              alt={community.name}
              className="w-13 h-13 rounded-2xl object-cover ring-4 ring-card shadow-md group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-muted-foreground group-hover:text-primary transition-colors p-1">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {community.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {community.description}
            </p>
          </div>
        </div>

        {/* Footer: Member Count & Join Button */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount.toLocaleString()} members</span>
          </div>

          <button
            onClick={handleJoinClick}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer",
              isJoined
                ? "bg-accent text-foreground hover:bg-destructive/10 hover:text-destructive"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
            )}
          >
            {isJoined ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Joined
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Join
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
