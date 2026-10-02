import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ConversationList, ChatWindow } from "@/components/messages";
import type { ConvoInfo } from "@/components/messages/ChatWindow";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { avatar, formatDate, type Conversation } from "@/services/models";
import { useToast } from "@/context/ToastContext";
type ConversationCard = ConvoInfo & {
  lastMessage: string;
  timestamp: string;
  unread?: number;
};
export default function MessagesPage() {
  const { activeChatUser } = useApp();
  const { user } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeConvId, setActiveConvId] = useState(
    params.get("conversation") || "",
  );
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(
    !!params.get("conversation"),
  );
  const load = useCallback(async () => {
    const records = await apiRequest<Conversation[]>("/conversations");
    const cards = records.map((c) => {
      const peer = c.participants.find((p) => p.userId !== user?.id)?.user;
      const name = c.title || peer?.profile?.name || "Campus chat";
      return {
        id: c.id,
        name,
        avatar: avatar(name, peer?.profile?.avatarUrl),
        online: false,
        lastMessage: c.messages?.[0]?.content || "Start the conversation",
        timestamp: c.messages?.[0] ? formatDate(c.messages[0].createdAt) : "",
        unread: c.unreadCount || 0,
      };
    });
    setConversations(cards);
    setLoading(false);
    setLoadError('');
  }, [user?.id]);
  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      if (mounted && document.visibilityState === "visible")
        void load().catch((error) => { if (mounted) { setLoadError(error.message); setLoading(false); } });
    };
    refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [load]);
  useEffect(() => {
    if (!activeChatUser?.id) return;
    let mounted = true;
    void apiRequest<Conversation>("/conversations/direct", "POST", {
      targetUserId: activeChatUser.id,
    })
      .then(async (c) => {
        await load();
        if (mounted) {
          setActiveConvId(c.id);
          setIsMobileDetailOpen(true);
        }
      })
      .catch((error) => toast.error(error.message));
    return () => {
      mounted = false;
    };
  }, [activeChatUser?.id, load, toast]);
  const activeConvo = conversations.find((c) => c.id === activeConvId);
  return (
    <div className="flex h-full w-full bg-card/60 backdrop-blur-md border border-border shadow-md rounded-3xl overflow-hidden relative">
      <div
        className={
          "w-full md:w-[35%] lg:w-[30%] min-w-[280px] md:border-r border-border flex flex-col bg-card " +
          (isMobileDetailOpen ? "hidden md:flex" : "flex")
        }
      >
        {loadError && <div role="alert" className="p-4 text-xs text-destructive border-b border-border">
          <p>{loadError}</p>
          <button className="mt-2 underline" onClick={() => { setLoading(true); void load().catch(error => { setLoadError(error.message); setLoading(false); }); }}>Retry messages</button>
        </div>}
        <ConversationList
          conversations={conversations}
          loading={loading}
          activeId={activeConvId}
          onSelect={(id) => {
            setActiveConvId(id);
            setIsMobileDetailOpen(true);
          }}
        />
      </div>
      <div
        className={
          "flex-1 flex flex-col bg-background/50 h-full " +
          (isMobileDetailOpen ? "flex" : "hidden md:flex")
        }
      >
        <ChatWindow
          key={activeConvId}
          activeId={activeConvId}
          activeConvo={activeConvo}
          onBack={() => setIsMobileDetailOpen(false)}
          isMobile={isMobileDetailOpen}
        />
      </div>
    </div>
  );
}
