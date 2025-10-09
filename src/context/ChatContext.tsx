import React from "react";
import { Api } from "@/api";

export type ChatThread = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  peerId?: string; // Add peer ID for socket joining
  unreadCount?: number; // Number of unread messages
  peerRole?: string; // Role of the peer (e.g., "staff", "student")
};

type ChatContextValue = {
  threads: ChatThread[];
  isLoading: boolean; // initial load
  isRefreshing: boolean; // background refresh
  refresh: () => Promise<void>;
};

const ChatContext = React.createContext<ChatContextValue | undefined>(undefined);

export function useChat() {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

export const ChatProvider: React.FC<{ children: React.ReactNode } & { enabled?: boolean }> = ({ children, enabled = true }) => {
  const [threads, setThreads] = React.useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const mapToThread = React.useCallback((raw: any): ChatThread => {
    
    const id = String(raw?.id ?? raw?._id ?? raw?.thread_id ?? crypto.randomUUID());
    const titleCandidates = [
      raw?.title,
      raw?.name,
      raw?.participant_name,
      // API returns a `peer` object with `full_name` for the other user in DM
      raw?.peer?.full_name,
      Array.isArray(raw?.participants)
        ? raw.participants
            .map((p: any) => p?.name || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.email)
            .filter((x: any) => typeof x === "string" && x.trim().length > 0)
            .join(", ")
        : undefined,
    ].filter((v) => typeof v === "string" && v.trim().length > 0);
    const title = (titleCandidates[0] as string) || "Conversation";
    const lastMessage = String(
      // Support multiple API shapes for last message
      raw?.lastMessage?.text ??
      raw?.lastMessage?.message_text ??
      raw?.last_message?.message_text ??
      raw?.last_message_text ??
      raw?.last_message ??
      ""
    );
    const updatedAtVal =
      raw?.updatedAt ?? raw?.updated_at ?? raw?.last_message?.created_at ?? raw?.lastMessage?.created_at ?? Date.now();
    const updatedAt = typeof updatedAtVal === "number" ? updatedAtVal : new Date(updatedAtVal).getTime();
    
    // Extract peer ID for socket joining - try multiple possible locations
    let peerId = "";
    
    // Try different locations for peer ID
    if (raw?.peer?.id) {
      peerId = String(raw.peer.id);
    } else if (raw?.peer?.user_id) {
      peerId = String(raw.peer.user_id);
    } else if (raw?.peer?._id) {
      peerId = String(raw.peer._id);
    } else if (raw?.peerId) {
      peerId = String(raw.peerId);
    } else if (raw?.peer_id) {
      peerId = String(raw.peer_id);
    } else if (Array.isArray(raw?.participants) && raw.participants.length > 0) {
      // Try to extract from participants array (for DM threads)
      const participant = raw.participants[0];
      peerId = String(participant?.id ?? participant?.user_id ?? participant?._id ?? "");
    } else if (raw?.id && (raw?.type === 'dm' || raw?.isDM)) {
      // If this is a DM thread, the chat ID itself might be the peer ID
      peerId = String(raw.id);
    }
    
    
    
    
    // Extract unread count
    const unreadCount = typeof raw?.unreadCount === 'number' ? raw.unreadCount : 
                       typeof raw?.unread_count === 'number' ? raw.unread_count : 0;
    
    // Extract peer role
    const peerRole = raw?.peer?.role || raw?.peerRole || undefined;
    
    return { 
      id, 
      title, 
      lastMessage, 
      updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
      peerId: peerId || undefined,
      unreadCount: unreadCount > 0 ? unreadCount : undefined,
      peerRole: peerRole
    };
  }, []);

  const fetchThreads = React.useCallback(async () => {
    const api = new Api();
    const res: any = await api.GetChatThreads();
    const list: any[] = res?.data?.data?.threads ?? [];
    const mapped = (Array.isArray(list) ? list : []).map(mapToThread);
    setThreads(mapped);
  }, [mapToThread]);

  const refresh = React.useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchThreads();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchThreads]);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        await fetchThreads();
      } catch {}
      finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchThreads]);

  const value = React.useMemo(
    () => ({ threads, isLoading, isRefreshing, refresh }),
    [threads, isLoading, isRefreshing, refresh]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};


