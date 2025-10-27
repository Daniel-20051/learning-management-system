export type UserId = string | number;

// Server-aligned message structure
export type ChatMessage = {
  id: string; // mongodb_object_id
  chatId: string; // local thread id
  sender_id: UserId;
  receiver_id: UserId;
  message_text: string;
  created_at: string; // ISO string
  delivered_at: string | null; // ISO or null
  read_at: string | null; // ISO or null
  // UI-only flags for optimistic messages
  pending?: boolean;
  failed?: boolean;
};

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export function getMessageStatus(message: ChatMessage): MessageStatus {
  if (message.failed) return 'failed';
  if (message.pending) return 'sending';
  if (message.read_at) return 'read';
  if (message.delivered_at) return 'delivered';
  return 'sent';
}

export type ChatSummary = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  unreadCount?: number;
  peerRole?: string;
};

export function initialsFromTitle(title: string) {
  return title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function isMessageFromUser(message: ChatMessage, userId: UserId | null | undefined) {
  if (userId === null || userId === undefined) return false;
  return String(message.sender_id) === String(userId);
}

// Online status types
export type UserOnlineStatus = {
  userId: string | number;
  isOnline: boolean;
};

