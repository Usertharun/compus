import { useState } from "react";
import {
  DiscoverSearchBar,
  TrendingSkillsBar,
  RecommendedSeniorsSection,
  RecommendedStudentsSection,
  TrendingCommunitiesSection,
  UpcomingHackathonsSection,
  OpportunitiesGrid,
  CardDetailModal,
} from "@/components/discover";
import { motion, AnimatePresence } from "framer-motion";
import { Users, GraduationCap, Trophy, Briefcase } from "lucide-react";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);

  const showSeniors = activeCategory === "all" || activeCategory === "seniors";
  const showPeers = activeCategory === "all" || activeCategory === "peers";
  const showCommunities = activeCategory === "communities";
  const showHackathons = activeCategory === "hackathons";
  const showOpportunities = activeCategory === "opportunities";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto pb-16"
    >
      {/* 1. Search Bar & Category Filters */}
      <DiscoverSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* 2. Trending Skills Bar */}
      <TrendingSkillsBar
        selectedSkill={selectedSkill}
        onSkillSelect={setSelectedSkill}
      />

      {/* Quick Category Summary Cards when on "All" */}
      {activeCategory === "all" && !selectedSkill && !searchQuery && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveCategory("seniors")}
            className="p-3.5 rounded-2xl glass-panel border border-border/50 bg-card/60 hover:bg-secondary/60 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-foreground">Seniors & Mentors</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">1-on-1 Coffee Chats</div>
          </button>

          <button
            onClick={() => setActiveCategory("peers")}
            className="p-3.5 rounded-2xl glass-panel border border-border/50 bg-card/60 hover:bg-secondary/60 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-foreground">Classmates & Peers</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Project Collaborators</div>
          </button>

          <button
            onClick={() => setActiveCategory("communities")}
            className="p-3.5 rounded-2xl glass-panel border border-border/50 bg-card/60 hover:bg-secondary/60 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-foreground">Campus Societies</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Clubs & Tech Hubs</div>
          </button>

          <button
            onClick={() => setActiveCategory("hackathons")}
            className="p-3.5 rounded-2xl glass-panel border border-border/50 bg-card/60 hover:bg-secondary/60 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-foreground">Hackathons</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Competitions & Sprints</div>
          </button>
        </div>
      )}

      {/* Main Discover Sections */}
      <div className="space-y-8 pt-2">
        <AnimatePresence mode="popLayout">
          {/* Seniors & Mentors */}
          {showSeniors && (
            <motion.div key="seniors" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <RecommendedSeniorsSection onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}

          {/* Students & Peers */}
          {showPeers && (
            <motion.div key="peers" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <RecommendedStudentsSection onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}

          {/* Communities & Clubs */}
          {showCommunities && (
            <motion.div key="communities" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TrendingCommunitiesSection onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}

          {/* Hackathons */}
          {showHackathons && (
            <motion.div key="hackathons" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <UpcomingHackathonsSection onCardClick={setModalItem} />
            </motion.div>
          )}

          {/* Opportunities */}
          {showOpportunities && (
            <motion.div key="opportunities" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <OpportunitiesGrid onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Detail Modal for Clicked Cards */}
      <CardDetailModal item={modalItem} onClose={() => setModalItem(null)} />
    </motion.div>
  );
}
