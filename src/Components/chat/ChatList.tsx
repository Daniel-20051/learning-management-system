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
};

const ChatList: React.FC<ChatListProps> = ({ chats, activeChatId, onSelect, onNew }) => {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter((c) => [c.title, c.lastMessage].some((v) => v.toLowerCase().includes(q)));
  }, [chats, query]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-3">
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
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initialsFromTitle(c.title)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.lastMessage || "Start a conversation"}</div>
                  </div>
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


