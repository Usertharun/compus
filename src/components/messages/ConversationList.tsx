import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ConvoInfo } from "./ChatWindow";

interface ConversationListProps {
  loading?: boolean;
  conversations: Array<
    ConvoInfo & { lastMessage: string; timestamp: string; unread?: number }
  >;
  activeId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  loading = false,
}: ConversationListProps) {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredList = conversations.filter((c) => {
    // Search query filter
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    // Filter tab
    if (filter === "Unread") return (c.unread || 0) > 0;
    if (filter === "Online") return c.online;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Search & Tabs Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Messages</span>
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
            {conversations.length} chats
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classmate or message..."
            className="pl-9 bg-secondary/40 border-border/40 h-9 text-xs rounded-xl focus-visible:ring-primary/40"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {["All", "Unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? <p role="status" className="p-8 text-center text-xs text-muted-foreground">Loading conversations…</p> : filteredList.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground px-4 space-y-1">
            <p className="font-semibold text-foreground">
              No conversations found
            </p>
            <p>Visit Discover to message a student, or try another search.</p>
          </div>
        ) : (
          filteredList.map((conv) => {
            const isActive = activeId === conv.id;
            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(conv.id);
                }}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "flex gap-3 p-3.5 sm:p-4 cursor-pointer transition-all border-b border-border/30 relative",
                  isActive ? "bg-primary/10" : "hover:bg-secondary/40",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeChatIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
                  />
                )}

                <div className="relative shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-11 h-11 rounded-full border border-border/80 object-cover shadow-xs"
                  />
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5 gap-2">
                    <h3
                      className={cn(
                        "font-bold text-xs sm:text-sm truncate",
                        isActive ? "text-primary" : "text-foreground",
                      )}
                    >
                      {conv.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                      {conv.timestamp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p
                      className={cn(
                        "text-xs truncate",
                        (conv.unread || 0) > 0
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                    {(conv.unread || 0) > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ConversationList;
