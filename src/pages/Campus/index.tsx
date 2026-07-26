import { useState } from "react";
import { FilterTabs } from "@/components/home/FilterTabs";
import { CompactUpcomingEvents } from "@/components/home/CompactUpcomingEvents";
import { CompactOpportunities } from "@/components/home/CompactOpportunities";
import { CampusPostFeed } from "@/components/home/CampusPostFeed";

export default function CampusHome() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto xl:max-w-none">
      <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {(activeTab === "All" || activeTab === "Events" || activeTab === "Opportunities") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {(activeTab === "All" || activeTab === "Events") && <CompactUpcomingEvents />}
          {(activeTab === "All" || activeTab === "Opportunities") && <CompactOpportunities />}
        </div>
      )}

      {(activeTab === "All" || activeTab === "Posts") && <CampusPostFeed />}
      
      {activeTab === "Communities" && (
        <div className="py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border/50 shadow-sm">
          <p className="font-medium">Community feed coming soon...</p>
          <p className="text-sm mt-1">Discover new communities in the sidebar!</p>
        </div>
      )}
    </div>
  );
}