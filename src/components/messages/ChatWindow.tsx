import { apiRequest } from "@/services/api";
import { formatTime, type Page, type Message } from "@/services/models";
import { uploadImage } from "@/services/uploads";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, ArrowLeft, Check, CheckCheck, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";


export interface MessageItem {
  id: number | string;
  sender: "me" | "them";
  text: string;
  time: string;
  image?: string;
  isCode?: boolean;
  read?: boolean;
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

export function ChatWindow({
  activeId,
  activeConvo: propConvo,
  onBack,
}: ChatWindowProps) {
  const toast = useToast();
  const { user: account } = useAuth();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversation Information
  const activeConvo: ConvoInfo = propConvo || {
    id: activeId,
    name: "Campus Chat",
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    online: false,
  };

  const [currentMessages, setCurrentMessages] = useState<MessageItem[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const selectedId = useRef(activeId);
  useEffect(() => { selectedId.current = activeId; }, [activeId]);
  const attachmentInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!activeId) return;
    let initial = true;
    let stopped = false;
    setCurrentMessages([]);
    setInputText("");
    setLoading(true);
    setLoadError("");
    setOlderCursor(null);
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const page = await apiRequest<Page<Message>>(
          "/conversations/" + activeId + "/messages?limit=50",
        );
        if (stopped) return;
        const latestMessages: MessageItem[] = page.items
          .slice()
          .reverse()
          .map((m) => ({
            id: m.id,
            sender: m.senderId === account?.id ? "me" : "them",
            text: m.content,
            time: formatTime(m.createdAt),
            read: !!m.reads?.some((r) => r.userId !== account?.id),
            image: m.type === "IMAGE" ? m.mediaUrl : undefined,
          }));
        setCurrentMessages((prev) => [
          ...prev.filter((m) => !latestMessages.some((n) => n.id === m.id)),
          ...latestMessages,
        ]);
        if (initial) {
          setOlderCursor(page.nextCursor || null);
          initial = false;
        }
        setLoadError("");
        setLoading(false);
        const latest = page.items.find(
          (m) =>
            m.senderId !== account?.id &&
            !m.reads?.some((r) => r.userId === account?.id),
        );
        if (latest)
          await apiRequest("/messages/" + latest.id + "/read", "POST");
      } catch (error) {
        if (!stopped) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load messages.",
          );
          setLoading(false);
        }
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [activeId, account?.id]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.at(-1)?.id, activeId]);

  const send = async (content: string, mediaUrl?: string) => {
    if (!activeId || sending) return;
    setSending(true);
    try {
      const message = await apiRequest<Message>(
        "/conversations/" + activeId + "/messages",
        "POST",
        { content, ...(mediaUrl ? { mediaUrl, type: "IMAGE" } : {}) },
      );
      if (selectedId.current !== activeId) return;
      setCurrentMessages((prev) => [
        ...prev.filter((m) => m.id !== message.id),
        {
          id: message.id,
          sender: "me",
          text: message.content,
          time: formatTime(message.createdAt),
          image: mediaUrl,
        },
      ]);
      if (!mediaUrl)
        setInputText((prev) => (prev.trim() === content ? "" : prev));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  };
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) void send(inputText.trim());
  };
  const handleSendImage = () => attachmentInput.current?.click();
  if (!activeId || !propConvo)
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        Select a conversation to start messaging.
      </div>
    );

  return (
    <div className="flex flex-col h-full w-full bg-card/60 backdrop-blur-md relative overflow-hidden">
      <input
        ref={attachmentInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const url = await uploadImage(file);
            await send("Shared an image", url);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Image upload failed.",
            );
          }
          e.target.value = "";
        }}
      />
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
            <h3 className="font-extrabold text-sm text-foreground truncate">
              {activeConvo.name}
            </h3>
            <p
              className={cn(
                "text-[11px] font-medium truncate flex items-center gap-1.5",
                activeConvo.online
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  activeConvo.online
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-muted-foreground/50",
                )}
              />
              <span>SRM student</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Chat Messages View Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-center mb-2">
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 border border-border/40 px-3 py-1 rounded-full uppercase tracking-wider">
            Campus Direct Chat
          </span>
        </div>

        {loading && (
          <p
            role="status"
            className="text-sm text-muted-foreground text-center"
          >
            Loading messages…
          </p>
        )}
        {loadError && (
          <p role="alert" className="text-sm text-destructive text-center">
            {loadError} Retrying automatically.
          </p>
        )}
        {!loading && !loadError && !currentMessages.length && (
          <p className="text-sm text-muted-foreground text-center">
            Start the conversation with a message.
          </p>
        )}
        {olderCursor && (
          <button
            className="block mx-auto text-sm underline"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const page = await apiRequest<Page<Message>>(
                  "/conversations/" +
                    activeId +
                    "/messages?limit=50&cursor=" +
                    encodeURIComponent(olderCursor),
                );
                setCurrentMessages((prev) => [
                  ...page.items
                    .slice()
                    .reverse()
                    .map((m) => ({
                      id: m.id,
                      sender:
                        m.senderId === account?.id
                          ? ("me" as const)
                          : ("them" as const),
                      text: m.content,
                      time: formatTime(m.createdAt),
                      read: !!m.reads?.some((r) => r.userId !== account?.id),
                      image: m.type === "IMAGE" ? m.mediaUrl : undefined,
                    })),
                  ...prev,
                ]);
                setOlderCursor(page.nextCursor || null);
              } catch (e) {
                toast.error(
                  e instanceof Error
                    ? e.message
                    : "Unable to load older messages.",
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            Load older messages
          </button>
        )}
        {currentMessages.map((msg) => {
          const isMe = msg.sender === "me";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                isMe ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[82%] sm:max-w-[70%] flex flex-col gap-1",
                  isMe ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-xs",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-md"
                      : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap font-normal">{msg.text}</p>

                  {msg.image && (
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-border/40 max-h-56">
                      <img
                        src={msg.image}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                  <span>{msg.time}</span>
                  {isMe &&
                    (msg.read ? (
                      <CheckCheck className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    ))}
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
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5 text-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => {
              setInputText((prev) =>
                prev ? `${prev} https://github.com/` : "https://github.com/",
              );
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
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            aria-label="Send message"
            className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
