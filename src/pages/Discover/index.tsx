import { useState, useMemo } from "react";
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

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);

  const showSeniors = activeCategory === "all" || activeCategory === "seniors";
  const showPeers = activeCategory === "all" || activeCategory === "peers";
  const showCommunities = activeCategory === "all" || activeCategory === "communities";
  const showHackathons = activeCategory === "all" || activeCategory === "hackathons";
  const showOpportunities = activeCategory === "all" || activeCategory === "opportunities";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto"
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

      {/* Main Discover Sections with Smooth Animated Transitions */}
      <div className="space-y-10">
        <AnimatePresence mode="popLayout">
          {/* 3. Recommended Seniors */}
          {showSeniors && (
            <motion.div key="seniors" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <RecommendedSeniorsSection onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}

          {/* 4. Recommended Peers */}
          {showPeers && (
            <motion.div key="peers" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <RecommendedStudentsSection onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}

          {/* 5. Trending Communities */}
          {showCommunities && (
            <motion.div key="communities" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TrendingCommunitiesSection onCardClick={setModalItem} selectedSkill={selectedSkill || searchQuery} />
            </motion.div>
          )}

          {/* 6. Upcoming Hackathons */}
          {showHackathons && (
            <motion.div key="hackathons" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <UpcomingHackathonsSection onCardClick={setModalItem} />
            </motion.div>
          )}

          {/* 7. Campus Opportunities */}
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
