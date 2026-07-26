import { useState } from "react";
import { ConversationList, ChatWindow } from "@/components/messages";

const MOCK_CONVOS = [
  {
    id: "1",
    name: "Study Group - CS 101",
    lastMessage: "Are we meeting at the library tonight?",
    timestamp: "10:30 AM",
    unread: 2,
    online: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StudyGroup",
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    lastMessage: "Thanks for the notes!",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: "3",
    name: "Hackathon Team",
    lastMessage: "I pushed the latest changes.",
    timestamp: "Tuesday",
    unread: 5,
    online: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hackathon",
  }
];

export default function MessagesPage() {
  const [activeConvId, setActiveConvId] = useState("1");

  return (
    <div className="flex h-full w-full bg-background border border-border shadow-sm rounded-xl overflow-hidden">
      {/* Left Panel (30%) */}
      <div className="w-[30%] min-w-[300px] border-r border-border flex flex-col bg-card">
        <ConversationList 
          conversations={MOCK_CONVOS} 
          activeId={activeConvId} 
          onSelect={setActiveConvId} 
        />
      </div>

      {/* Right Panel (70%) */}
      <div className="flex-1 flex flex-col bg-background/50">
        <ChatWindow activeId={activeConvId} />
      </div>
    </div>
  );
}