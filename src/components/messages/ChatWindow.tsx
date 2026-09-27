import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Image as ImageIcon, 
  Mic, 
  ArrowLeft,
  PhoneOff,
  MicOff,
  VideoOff,
  Check,
  CheckCheck,
  Sparkles,
  FileText,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export interface MessageItem {
  id: number | string;
  sender: "me" | "them";
  text: string;
  time: string;
  image?: string;
  isCode?: boolean;
}

export interface ConvoInfo {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  department?: string;
}

interface ChatWindowProps {
  activeId: string;
  activeConvo?: ConvoInfo;
  onBack?: () => void;
  isMobile?: boolean;
}

export function ChatWindow({ activeId, activeConvo: propConvo, onBack, isMobile = false }: ChatWindowProps) {
  const toast = useToast();
  const { user: account } = useAuth();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default Conversations Information
  const activeConvo: ConvoInfo = propConvo || {
    id: activeId,
    name: "Campus Chat",
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    online: true,
    department: "Computer Science",
  };

  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>(() => {
    const saved = localStorage.getItem("compus_messages_map:" + account?.id);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      "1": [
        { id: 1, sender: "them", text: "Hey! Are we meeting at the Green Library at 4 PM for the AI agent project?", time: "10:30 AM" },
        { id: 2, sender: "me", text: "Yeah, definitely. Let me grab my laptop and benchmark notes first.", time: "10:32 AM" },
        { id: 3, sender: "them", text: "Awesome! We booked Room 204 on the second floor.", time: "10:33 AM" },
      ],
      "2": [
        { id: 1, sender: "them", text: "Thanks for sharing the PyTorch derivation notes!", time: "Yesterday" },
        { id: 2, sender: "me", text: "No problem at all! Let me know if you want to test the multi-agent orchestrator.", time: "Yesterday" },
      ],
      "3": [
        { id: 1, sender: "them", text: "I pushed the latest Tailwind CSS v4 design tokens to GitHub.", time: "Tuesday" },
        { id: 2, sender: "me", text: "Great! Pulling now to verify the glassmorphism dark mode cards.", time: "Tuesday" },
      ],
      "4": [
        { id: 1, sender: "them", text: "Reminder: Hackathon team submissions lock tonight at 11:59 PM.", time: "1d ago" },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem("compus_messages_map:" + account?.id, JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Calling Modal State
  const [callState, setCallState] = useState<{
    active: boolean;
    type: "audio" | "video";
    isMuted: boolean;
    isVideoOff: boolean;
    duration: number;
  }>({
    active: false,
    type: "audio",
    isMuted: false,
    isVideoOff: false,
    duration: 0,
  });

  // Call timer interval
  useEffect(() => {
    let interval: any;
    if (callState.active) {
      interval = setInterval(() => {
        setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.active]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentMessages = messagesMap[activeId] || [
    { id: 1, sender: "them", text: `Connected with ${activeConvo.name}. Start a conversation!`, time: "Just now" }
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, activeId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: Date.now(),
      sender: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));

    setInputText("");

    // Simulated realistic response from teammate/peer after 2.5s
    setTimeout(() => {
      const replies = [
        "Sounds great! Working on that right now.",
        "Got it, looking into it!",
        "Thanks for the update, let's sync up soon.",
        "Sounds great, let's catch up at the library after class!",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: MessageItem = {
        id: Date.now() + 1,
        sender: "them",
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessagesMap((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), replyMsg],
      }));
    }, 2500);
  };

  const handleSendImage = () => {
    const sampleImg = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";
    const imgMsg: MessageItem = {
      id: Date.now(),
      sender: "me",
      text: "Attached codebase screenshot from our local build:",
      image: sampleImg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessagesMap((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), imgMsg],
    }));
    toast.success("Image attachment sent!");
  };

  const handleSendVoiceNote = () => {
    const voiceMsg: MessageItem = {
      id: Date.now(),
      sender: "me",
      text: "🎤 Voice Message (0:24) - 'Discussing the database schema and deployment'",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessagesMap((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), voiceMsg],
    }));
    toast.success("Voice note sent!");
  };

  return (
    <div className="flex flex-col h-full w-full bg-card/60 backdrop-blur-md relative overflow-hidden">
      {/* 1. Header Bar */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 bg-card shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Arrow Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Back to conversation list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative shrink-0">
            <img 
              src={activeConvo.avatar} 
              alt={activeConvo.name} 
              className="w-10 h-10 rounded-full border border-border object-cover shadow-xs" 
            />
            {activeConvo.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-sm text-foreground truncate">{activeConvo.name}</h3>
            <p className={cn(
              "text-[11px] font-medium truncate flex items-center gap-1.5",
              activeConvo.online ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", activeConvo.online ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50")} />
              <span>{activeConvo.online ? "Online on campus" : "Offline"}</span>
            </p>
          </div>
        </div>

        {/* Action Controls: Audio Call, Video Call, Details */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setCallState({ active: true, type: "audio", isMuted: false, isVideoOff: false, duration: 0 })}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            title="Start Voice Call"
          >
            <Phone className="w-4 h-4 text-indigo-500" />
          </button>
          <button
            onClick={() => setCallState({ active: true, type: "video", isMuted: false, isVideoOff: false, duration: 0 })}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            title="Start Video Call"
          >
            <Video className="w-4 h-4 text-emerald-500" />
          </button>
          <button 
            onClick={() => toast.info(`Chat settings & member options for ${activeConvo.name}`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Messages View Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-center mb-2">
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 border border-border/40 px-3 py-1 rounded-full uppercase tracking-wider">
            Encrypted Campus Direct Chat
          </span>
        </div>

        {currentMessages.map((msg) => {
          const isMe = msg.sender === "me";
          return (
            <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[82%] sm:max-w-[70%] flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-xs",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-md"
                      : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap font-normal">{msg.text}</p>
                  
                  {msg.image && (
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-border/40 max-h-56">
                      <img src={msg.image} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Composer Input Form */}
      <div className="p-3 sm:p-4 bg-card border-t border-border/50 shrink-0">
        <form 
          onSubmit={handleSend} 
          className="flex items-end gap-1.5 bg-secondary/30 border border-border/50 rounded-2xl p-1.5 sm:p-2 transition-colors focus-within:border-primary/50 focus-within:bg-card shadow-sm"
        >
          <button 
            type="button" 
            onClick={handleSendImage}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 cursor-pointer"
            title="Attach Code / Image"
          >
            <ImageIcon className="w-5 h-5 text-emerald-500" />
          </button>

          <button 
            type="button" 
            onClick={() => {
              setInputText((prev) => prev ? `${prev} https://github.com/` : "https://github.com/");
            }}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 cursor-pointer hidden sm:block"
            title="Share GitHub link"
          >
            <Code className="w-5 h-5 text-indigo-500" />
          </button>
          
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeConvo.name.split(" ")[0]}...`}
            className="flex-1 max-h-32 min-h-[42px] bg-transparent resize-none py-2.5 px-2 text-xs sm:text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {inputText.trim() ? (
            <button 
              type="submit" 
              className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-sm hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSendVoiceNote}
              className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary shrink-0 cursor-pointer"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5 text-purple-500" />
            </button>
          )}
        </form>
      </div>

      {/* 4. Active Audio / Video Call Interactive Modal */}
      <AnimatePresence>
        {callState.active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-between text-center min-h-[460px] relative overflow-hidden"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-background pointer-events-none" />

              {/* Call Status Header */}
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {callState.type === "video" ? "HD Video Call Active" : "Encrypted Voice Call Active"}
                </span>
                <h3 className="font-extrabold text-xl text-foreground mt-3">{activeConvo.name}</h3>
                <p className="text-xs text-muted-foreground">{activeConvo.department || "Campus Teammate"}</p>
              </div>

              {/* Caller Avatar & Animated Rings */}
              <div className="relative my-6 z-10">
                <div className="relative">
                  <span className="animate-ping absolute inset-0 rounded-full bg-primary/20" />
                  <img
                    src={activeConvo.avatar}
                    alt={activeConvo.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-2xl relative z-10"
                  />
                </div>
                <div className="mt-4 font-mono font-bold text-sm text-primary tracking-widest">
                  {formatCallTime(callState.duration)}
                </div>
              </div>

              {/* In-Call Controls */}
              <div className="flex items-center gap-4 relative z-10">
                {/* Mute Mic */}
                <button
                  onClick={() => setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }))}
                  className={cn(
                    "p-3.5 rounded-full transition-all cursor-pointer border shadow-sm",
                    callState.isMuted
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-secondary hover:bg-secondary/80 text-foreground border-border/60"
                  )}
                  title={callState.isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Toggle Camera (If video call) */}
                {callState.type === "video" && (
                  <button
                    onClick={() => setCallState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }))}
                    className={cn(
                      "p-3.5 rounded-full transition-all cursor-pointer border shadow-sm",
                      callState.isVideoOff
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-secondary hover:bg-secondary/80 text-foreground border-border/60"
                    )}
                    title={callState.isVideoOff ? "Turn Video On" : "Turn Video Off"}
                  >
                    {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                {/* Hang Up Button */}
                <button
                  onClick={() => {
                    setCallState((prev) => ({ ...prev, active: false, duration: 0 }));
                    toast.info("Call ended");
                  }}
                  className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatWindow;
