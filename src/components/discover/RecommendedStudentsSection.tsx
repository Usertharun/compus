import { useState } from "react";
import { PeerStudent } from "./types";
import { RECOMMENDED_STUDENTS } from "@/data/discoverMockData";
import { UserPlus, Check, Sparkles, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendedStudentsSectionProps {
  onCardClick?: (item: PeerStudent) => void;
  selectedSkill?: string | null;
}

export function RecommendedStudentsSection({ onCardClick, selectedSkill }: RecommendedStudentsSectionProps) {
  const [students, setStudents] = useState<PeerStudent[]>(RECOMMENDED_STUDENTS);

  const toggleConnect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isConnected: !s.isConnected } : s))
    );
  };

  const filtered = selectedSkill
    ? students.filter((s) => s.skills.some((sk) => sk.toLowerCase().includes(selectedSkill.toLowerCase())))
    : students;

  if (filtered.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            Recommended Students & Project Collaborators
          </h2>
          <p className="text-xs text-muted-foreground">Find hackathon teammates, co-founders, and study partners</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((peer, index) => (
            <motion.div
              key={peer.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              onClick={() => onCardClick && onCardClick(peer)}
              className={cn(
                "p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4 group",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 hover:border-border",
                "transition-all duration-300 cursor-pointer flex flex-col justify-between"
              )}
            >
              <div className="space-y-3">
                {/* Header Avatar & Name */}
                <div className="flex items-start gap-3">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {peer.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{peer.major} · {peer.year}</p>
                  </div>
                </div>

                {/* Looking For Pill */}
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 shrink-0 text-cyan-500" />
                  <span className="truncate">{peer.lookingFor}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {peer.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent text-muted-foreground border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer: Mutual Friends & Connect CTA */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                  Mutual: {peer.mutualFriends.join(", ")}
                </span>

                <button
                  onClick={(e) => toggleConnect(peer.id, e)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
                    peer.isConnected
                      ? "bg-accent text-foreground border border-border"
                      : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-xs active:scale-95"
                  )}
                >
                  {peer.isConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Connected
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> Connect
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
