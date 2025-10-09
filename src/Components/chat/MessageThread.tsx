import React from "react";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Send, ChevronLeft } from "lucide-react";
import { type ChatMessage, type ChatSummary, initialsFromTitle, isMessageFromUser } from "./types";
import { useAuth } from "@/context/AuthContext";

export type MessageThreadProps = {
  chat: ChatSummary;
  messages: ChatMessage[];
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

const MessageThread: React.FC<MessageThreadProps> = ({ chat, messages, draft, onDraft, onSend, showBack, onBack }) => {
  const { user } = useAuth();
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b p-3">
        {showBack ? (
          <Button size="sm" variant="outline" onClick={onBack} aria-label="Back to chats" className="sm:hidden">
            <ChevronLeft className="size-4" />
          </Button>
        ) : null}
        <Avatar className="h-9 w-9">
          <AvatarFallback>{initialsFromTitle(chat.title)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium">{chat.title}</div>
          <div className="text-xs text-muted-foreground">{chat.lastMessage ? "Active" : "No messages yet"}</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">No messages yet</div>
          ) : (
            messages.map((m) => {
              const mine = isMessageFromUser(m, user?.id);
              const base = mine ? "bg-primary text-primary-foreground" : "bg-accent text-foreground";
              const pending = m.pending ? (mine ? " opacity-60" : " opacity-60") : "";
              return (
                <div key={m.id} className={mine ? "ml-auto max-w-[88%]" : "mr-auto max-w-[88%]"}>
                  <div className={"rounded-lg px-3 py-2 text-sm shadow-xs " + base + pending}>
                    {m.message_text}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="sticky bottom-0 border-t bg-background/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="Type a message"
            className="min-h-[48px] max-h-48 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button aria-label="Send" onClick={onSend} disabled={!draft.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;


