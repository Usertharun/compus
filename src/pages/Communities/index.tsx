import { useState } from "react";
import { COMMUNITIES_DATA } from "@/data/communitiesMockData";
import { CommunityItem, CommunityCategory } from "@/components/communities/types";
import { CommunityCategorySection, CommunityDetailView } from "@/components/communities";
import { Search, X, Users, Sparkles, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunitiesPage() {
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Featured", "Technology", "Business", "Creative", "Sports"];

  // Filter communities by query & selected tab
  const filteredCommunities = COMMUNITIES_DATA.filter((comm) => {
    const matchesSearch =
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Featured") return comm.isFeatured;
    return comm.category === selectedCategory;
  });

  const featuredCommunities = filteredCommunities.filter((c) => c.isFeatured);
  const techCommunities = filteredCommunities.filter((c) => c.category === "Technology");
  const bizCommunities = filteredCommunities.filter((c) => c.category === "Business");
  const creativeCommunities = filteredCommunities.filter((c) => c.category === "Creative");
  const sportsCommunities = filteredCommunities.filter((c) => c.category === "Sports");

  if (selectedCommunity) {
    return (
      <CommunityDetailView
        community={selectedCommunity}
        onBack={() => setSelectedCommunity(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Directory Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2">
              <Users className="w-3.5 h-3.5" />
              Campus Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Explore Campus Communities & Clubs
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-normal">
              Join active student societies, research labs, founder collectives, and sports clubs.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center group">
          <div className="absolute left-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities by name, topic, or keyword (e.g. AI, VC, Ski, Figma)..."
            className={cn(
              "w-full pl-14 pr-12 py-4 rounded-3xl text-sm font-medium",
              "bg-card text-foreground border border-border/40 shadow-sm",
              "placeholder:text-muted-foreground/70",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
              "transition-all duration-300"
            )}
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "relative px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0",
                  isActive
                    ? "text-primary-foreground shadow-sm"
                    : "bg-card border border-border/30 text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCommunityCategory"
                    className="absolute inset-0 bg-primary rounded-2xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Sections */}
      <div className="space-y-12 pt-2">
        <AnimatePresence mode="popLayout">
          {/* Featured */}
          {(selectedCategory === "All" || selectedCategory === "Featured") && featuredCommunities.length > 0 && (
            <motion.div key="featured" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityCategorySection
                category="Featured"
                communities={featuredCommunities}
                onCardClick={setSelectedCommunity}
              />
            </motion.div>
          )}

          {/* Technology */}
          {(selectedCategory === "All" || selectedCategory === "Technology") && techCommunities.length > 0 && (
            <motion.div key="tech" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityCategorySection
                category="Technology"
                communities={techCommunities}
                onCardClick={setSelectedCommunity}
              />
            </motion.div>
          )}

          {/* Business */}
          {(selectedCategory === "All" || selectedCategory === "Business") && bizCommunities.length > 0 && (
            <motion.div key="biz" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityCategorySection
                category="Business"
                communities={bizCommunities}
                onCardClick={setSelectedCommunity}
              />
            </motion.div>
          )}

          {/* Creative */}
          {(selectedCategory === "All" || selectedCategory === "Creative") && creativeCommunities.length > 0 && (
            <motion.div key="creative" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityCategorySection
                category="Creative"
                communities={creativeCommunities}
                onCardClick={setSelectedCommunity}
              />
            </motion.div>
          )}

          {/* Sports */}
          {(selectedCategory === "All" || selectedCategory === "Sports") && sportsCommunities.length > 0 && (
            <motion.div key="sports" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityCategorySection
                category="Sports"
                communities={sportsCommunities}
                onCardClick={setSelectedCommunity}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}