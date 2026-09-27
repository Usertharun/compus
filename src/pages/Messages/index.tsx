import { useState, useEffect } from "react";
import { ConversationList, ChatWindow } from "@/components/messages";
import { ConvoInfo } from "@/components/messages/ChatWindow";
import { useApp } from "@/context/AppContext";

const INITIAL_CONVERSATIONS: Array<ConvoInfo & { lastMessage: string; timestamp: string; unread?: number }> = [
  {
    id: "1",
    name: "Sarah Chen",
    lastMessage: "Are we meeting at the Green Library at 4 PM?",
    timestamp: "10:30 AM",
    unread: 2,
    online: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    department: "AI & Data Science",
  },
  {
    id: "2",
    name: "Marcus Vance",
    lastMessage: "I pushed the latest Tailwind v4 styles to GitHub.",
    timestamp: "Yesterday",
    unread: 0,
    online: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Computer Science",
  },
  {
    id: "3",
    name: "TreeHacks 2026 Hackers",
    lastMessage: "Marcus: Tested the multi-agent task orchestrator!",
    timestamp: "Tuesday",
    unread: 3,
    online: true,
    avatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    department: "Hackathon Team",
  },
  {
    id: "4",
    name: "Elena Rostova",
    lastMessage: "Thanks for the coffee chat request! I'd love to connect.",
    timestamp: "2d ago",
    unread: 0,
    online: false,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Symbolic Systems",
  },
];

export default function MessagesPage() {
  const { activeChatUser } = useApp();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState("1");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // If a chat was initiated from another page (e.g., right sidebar or discover)
  useEffect(() => {
    if (activeChatUser) {
      const existing = conversations.find((c) => c.name.toLowerCase() === activeChatUser.name.toLowerCase());
      if (existing) {
        setActiveConvId(existing.id);
      } else {
        const newId = `chat-${Date.now()}`;
        const newConvo = {
          id: newId,
          name: activeChatUser.name,
          lastMessage: "Started a new direct conversation",
          timestamp: "Just now",
          unread: 0,
          online: activeChatUser.isOnline ?? true,
          avatar: activeChatUser.avatar,
          department: "Campus Peer",
        };
        setConversations((prev) => [newConvo, ...prev]);
        setActiveConvId(newId);
      }
      setIsMobileDetailOpen(true);
    }
  }, [activeChatUser]);

  const activeConvo = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSelectConvo = (id: string) => {
    setActiveConvId(id);
    setIsMobileDetailOpen(true);
  };

  return (
    <div className="flex h-full w-full bg-card/60 backdrop-blur-md border border-border shadow-md rounded-3xl overflow-hidden relative">
      {/* Left Panel (Conversation List) */}
      <div 
        className={`w-full md:w-[35%] lg:w-[30%] min-w-[280px] md:border-r border-border flex flex-col bg-card ${
          isMobileDetailOpen ? "hidden md:flex" : "flex"
        }`}
      >
        <ConversationList 
          conversations={conversations} 
          activeId={activeConvId} 
          onSelect={handleSelectConvo} 
        />
      </div>

      {/* Right Panel (Chat Window) */}
      <div 
        className={`flex-1 flex flex-col bg-background/50 h-full ${
          isMobileDetailOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <ChatWindow 
          activeId={activeConvId} 
          activeConvo={activeConvo}
          onBack={() => setIsMobileDetailOpen(false)}
          isMobile={isMobileDetailOpen}
        />
      </div>
    </div>
  );
}