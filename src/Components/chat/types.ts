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
  // UI-only flag for optimistic messages
  pending?: boolean;
};

export type ChatSummary = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
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


