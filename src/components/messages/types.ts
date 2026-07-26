export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  codeSnippet?: string;
}

export interface ConversationItem {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  groupBadge?: string;
  unreadCount: number;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  messages: MessageItem[];
}
