import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function UniversalSearch() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        className="w-full pl-11 pr-4 h-14 bg-card border-border/50 shadow-sm rounded-2xl text-base focus-visible:ring-primary focus-visible:ring-1 transition-all"
        placeholder="Search students, communities, events, opportunities, posts..."
      />
    </div>
  );
}
