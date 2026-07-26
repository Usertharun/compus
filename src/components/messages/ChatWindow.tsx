import { useState } from "react";
import { Send, Paperclip, Phone, Video, MoreVertical, Image as ImageIcon, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface ConvoInfo {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

const CONVO_DETAILS: Record<string, ConvoInfo> = {
  "1": {
    id: "1",
    name: "Study Group - CS 101",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StudyGroup",
    online: true,
  },
  "2": {
    id: "2",
    name: "Sarah Jenkins",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    online: false,
  },
  "3": {
    id: "3",
    name: "Hackathon Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hackathon",
    online: true,
  },
};

const INITIAL_MESSAGES_MAP: Record<string, Array<{ id: number; sender: "me" | "them"; text: string; time: string }>> = {
  "1": [
    { id: 1, sender: "them", text: "Hey! Are we meeting at the library tonight?", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Yeah, definitely. Let me grab my laptop first.", time: "10:32 AM" },
    { id: 3, sender: "them", text: "Awesome! We're at Green Library, 2nd floor.", time: "10:33 AM" },
  ],
  "2": [
    { id: 1, sender: "them", text: "Thanks for sharing the lecture notes!", time: "Yesterday" },
    { id: 2, sender: "me", text: "No problem at all! Let me know if you have questions.", time: "Yesterday" },
  ],
  "3": [
    { id: 1, sender: "them", text: "I pushed the latest API changes to the main branch.", time: "Tuesday" },
    { id: 2, sender: "me", text: "Great, pulling now to test the spatial UI integration.", time: "Tuesday" },
  ],
};

export function ChatWindow({ activeId }: { activeId: string }) {
  const toast = useToast();
  const [inputText, setInputText] = useState("");
  const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES_MAP);

  const activeConvo = CONVO_DETAILS[activeId] || {
    id: activeId,
    name: "Campus Chat",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chat",
    online: true,
  };

  const currentMessages = messagesMap[activeId] || [
    { id: 1, sender: "them", text: `Connected with ${activeConvo.name}`, time: "Just now" }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "me" as const,
      text: inputText,
      time: "Just now",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));

    setInputText("");
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={activeConvo.avatar} alt={activeConvo.name} className="w-10 h-10 rounded-full border border-border object-cover" />
            {activeConvo.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{activeConvo.name}</h3>
            <p className={cn("text-[11px] font-medium", activeConvo.online ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
              {activeConvo.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info(`Starting audio call with ${activeConvo.name}...`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.info(`Starting video call with ${activeConvo.name}...`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <Video className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full uppercase tracking-widest">
            Today
          </span>
        </div>

        {currentMessages.map((msg) => (
          <div key={msg.id} className={cn("flex w-full", msg.sender === "me" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[70%] flex flex-col gap-1", msg.sender === "me" ? "items-end" : "items-start")}>
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed",
                msg.sender === "me" 
                  ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm" 
                  : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm"
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground px-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="p-4 bg-card border-t border-border/50 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-secondary/30 border border-border/50 rounded-2xl p-2 transition-colors focus-within:border-primary/50 focus-within:bg-card shadow-sm">
          <button type="button" onClick={() => toast.info("Attachment feature coming soon")} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 cursor-pointer">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => toast.info("Image upload coming soon")} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 cursor-pointer">
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeConvo.name}...`}
            className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-3 px-2 text-[15px] focus:outline-none text-foreground placeholder:text-muted-foreground"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          {inputText ? (
            <button type="submit" className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-sm hover:opacity-90 transition-opacity shrink-0 mb-0.5 cursor-pointer">
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button type="button" onClick={() => toast.info("Voice note recording started...")} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 mb-0.5 cursor-pointer">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
