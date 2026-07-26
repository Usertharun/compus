import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

export function ConversationList({ conversations, activeId, onSelect }: any) {
  const [filter, setFilter] = useState("All");
  
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-9 bg-secondary/50 border-none h-9 text-sm rounded-xl" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["All", "Unread", "Groups", "Pinned"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                filter === f 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : "bg-card text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {conversations.map((conv: any, i: number) => {
          const isActive = activeId === conv.id;
          return (
            <div 
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex gap-3 p-4 cursor-pointer transition-colors border-b border-border/30 relative",
                isActive ? "bg-primary/5" : "hover:bg-secondary/30"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-chat-indicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"
                />
              )}

              <div className="relative shrink-0">
                <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full border border-border" />
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1 gap-2">
                  <h3 className={cn("font-semibold text-sm truncate", isActive ? "text-primary" : "text-foreground")}>
                    {conv.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground shrink-0">{conv.timestamp}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={cn("text-xs truncate", conv.unread ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
