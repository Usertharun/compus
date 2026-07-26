import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, UserPlus, Sparkles, Trophy, Calendar, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { SeniorMentor, PeerStudent, DiscoverCommunity, HackathonItem, DiscoverOpportunity } from "./types";
import { cn } from "@/lib/utils";

type DetailItem = SeniorMentor | PeerStudent | DiscoverCommunity | HackathonItem | DiscoverOpportunity;

interface CardDetailModalProps {
  item: DetailItem | null;
  onClose: () => void;
}

export function CardDetailModal({ item, onClose }: CardDetailModalProps) {
  if (!item) return null;

  const isSenior = "companyTag" in item;
  const isPeer = "lookingFor" in item;
  const isCommunity = "membersCount" in item;
  const isHackathon = "prizePool" in item;
  const isOpportunity = "stipendOrPrize" in item;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-3xl bg-background border border-border/80 shadow-2xl overflow-hidden relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-accent text-muted-foreground hover:text-foreground backdrop-blur-md transition-colors border border-border/50"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Content depending on type */}
          {isSenior && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img src={item.avatar} alt={item.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-500/20" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-lg text-foreground">{item.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.major} · {item.year}</p>
                  <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {item.companyTag}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-accent/40 border border-border/50 text-xs text-foreground leading-relaxed">
                <p className="font-semibold text-primary mb-1">About & Mentorship</p>
                <p>{item.bio}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Expertise & Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-accent text-foreground font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-md">
                  <Coffee className="w-4 h-4" /> Schedule Coffee Chat ☕
                </button>
              </div>
            </div>
          )}

          {isPeer && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img src={item.avatar} alt={item.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-cyan-500/20" />
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.major} · {item.year}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-300 font-semibold">
                Looking for: {item.lookingFor}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Tech Stack & Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-accent text-foreground font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-500 shadow-md">
                  <UserPlus className="w-4 h-4" /> Send Connection Request
                </button>
              </div>
            </div>
          )}

          {isCommunity && (
            <div>
              <div className={cn("h-28 w-full bg-gradient-to-r p-4 flex items-end", item.bannerGradient)}>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/50 text-white backdrop-blur-md">
                  {item.category}
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 -mt-10">
                  <img src={item.avatar} alt={item.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-background shadow-lg" />
                  <div className="pt-4">
                    <h3 className="font-extrabold text-lg text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.membersCount.toLocaleString()} Active Members</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="pt-2 flex gap-3">
                  <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-500 shadow-md">
                    <Sparkles className="w-4 h-4" /> Join Community Channel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isHackathon && (
            <div className="p-6 space-y-4">
              <div className="relative h-36 rounded-2xl overflow-hidden bg-muted">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-lg">
                  {item.prizePool}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">{item.organizer}</span>
                <h3 className="font-extrabold text-lg text-foreground">{item.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {item.dates}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {item.location}</span>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-md">
                  <Trophy className="w-4 h-4" /> Register / Join Team Matchmaking
                </button>
              </div>
            </div>
          )}

          {isOpportunity && (
            <div className="p-6 space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                {item.type}
              </span>
              <div>
                <h3 className="font-extrabold text-lg text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground font-semibold">{item.organization}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              {item.stipendOrPrize && (
                <div className="text-xs font-bold text-emerald-600 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  Reward / Stipend: {item.stipendOrPrize}
                </div>
              )}
              <div className="pt-2 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-md">
                  Submit Application <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
