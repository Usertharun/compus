import { useState } from "react";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Image as ImageIcon, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatWindow({ activeId }: { activeId: string }) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "them", text: "Hey! Are you going to the career fair tomorrow?", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Yeah, definitely. I want to check out the startup booths.", time: "10:32 AM" },
    { id: 3, sender: "them", text: "Awesome! Let's meet at the library and walk over together.", time: "10:33 AM" },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setMessages([...messages, { 
      id: Date.now(), 
      sender: "me", 
      text: inputText, 
      time: "Just now" 
    }]);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=StudyGroup" alt="Avatar" className="w-10 h-10 rounded-full border border-border" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Study Group - CS 101</h3>
            <p className="text-[11px] text-green-600 dark:text-green-500 font-medium">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
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

        {messages.map((msg) => (
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
          <button type="button" className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0">
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message..."
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
            <button type="submit" className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-sm hover:opacity-90 transition-opacity shrink-0 mb-0.5">
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button type="button" className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 mb-0.5">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
