import { CommunityItem, CommunityCategory } from "./types";
import { CommunityCard } from "./CommunityCard";
import { Cpu, TrendingUp, Palette, Trophy, Sparkles } from "lucide-react";

interface CommunityCategorySectionProps {
  category: CommunityCategory | "Featured";
  communities: CommunityItem[];
  onCardClick: (community: CommunityItem) => void;
}

export function CommunityCategorySection({
  category,
  communities,
  onCardClick,
}: CommunityCategorySectionProps) {
  if (communities.length === 0) return null;

  const getSectionHeader = () => {
    switch (category) {
      case "Featured":
        return {
          title: "Featured Communities",
          subtitle: "Top active student organizations & clubs this term",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        };
      case "Technology":
        return {
          title: "Technology & Engineering",
          subtitle: "AI research, robotics labs, fullstack web guilds & hardware teams",
          icon: <Cpu className="w-5 h-5 text-indigo-500" />,
        };
      case "Business":
        return {
          title: "Business, VC & Startups",
          subtitle: "Student venture funds, founder incubators & consulting clubs",
          icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
        };
      case "Creative":
        return {
          title: "Creative, Design & Media",
          subtitle: "Product design guilds, filmmaking societies & visual arts",
          icon: <Palette className="w-5 h-5 text-pink-500" />,
        };
      case "Sports":
        return {
          title: "Sports, Outdoor & Recreation",
          subtitle: "Alpine ski clubs, cycling teams & intramural sports",
          icon: <Trophy className="w-5 h-5 text-sky-500" />,
        };
    }
  };

  const header = getSectionHeader();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          {header.icon}
          {header.title}
        </h2>
        <p className="text-xs text-muted-foreground">{header.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </section>
  );
}
