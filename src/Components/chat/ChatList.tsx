import React from "react";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Search, Plus } from "lucide-react";
import { type ChatSummary, initialsFromTitle } from "./types";

export type ChatListProps = {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onNew: () => void;
  userOnlineStatus?: Record<string, boolean>;
  chatPeerIds?: Record<string, string>;
};

const ChatList: React.FC<ChatListProps> = ({ chats, activeChatId, onSelect, onNew, userOnlineStatus = {}, chatPeerIds = {} }) => {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter((c) => [c.title, c.lastMessage].some((v) => v.toLowerCase().includes(q)));
  }, [chats, query]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-2 sm:p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="pl-8"
        />
      </div>
      <div className="mt-3 mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Recent</span>
        <Button size="sm" variant="outline" onClick={onNew} aria-label="New chat" className="px-2">
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="-m-1 flex-1 overflow-auto p-1">
        {filtered.length === 0 ? (
          <div className="text-xs text-muted-foreground">No conversations</div>
        ) : (
          <ul className="flex flex-col gap-1">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  className={
                    "flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-accent " +
                    (activeChatId === c.id ? "bg-accent" : "")
                  }
                  onClick={() => onSelect(c.id)}
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initialsFromTitle(c.title)}</AvatarFallback>
                    </Avatar>
                    {(() => {
                      // Get peerId from chatPeerIds or from the chat object itself (server threads)
                      const peerId = chatPeerIds[c.id] || (c as any).peerId;
                      if (!peerId) return null;
                      
                      const isOnline = userOnlineStatus[peerId] || false;
                      return (
                        <div 
                          className={`online-indicator ${isOnline ? 'online' : 'offline'}`}
                          data-user-id={peerId}
                        />
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{c.title}</span>
                      {c.peerRole === 'staff' && (
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 flex-shrink-0">
                          STAFF
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.lastMessage || "Start a conversation"}</div>
                  </div>
                  {c.unreadCount && c.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-white min-w-[20px] h-5">
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;


