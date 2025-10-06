import React from "react";
import { MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import NewChatDialog, { type DirectoryUser } from "@/Components/chat/NewChatDialog";
import ChatList from "@/Components/chat/ChatList";
import MessageThread from "@/Components/chat/MessageThread";
import { type ChatMessage, type ChatSummary } from "@/Components/chat/types";
import { useAuth } from "@/context/AuthContext";
import { Api } from "@/api";


function loadChats(): { chats: ChatSummary[]; messages: ChatMessage[] } {
  try {
    const raw = localStorage.getItem("lms-chat-store");
    if (!raw) return { chats: [], messages: [] };
    const parsed = JSON.parse(raw);
    // Migrate any legacy messages to new schema
    if (Array.isArray(parsed?.messages)) {
      parsed.messages = parsed.messages.map((m: any) => {
        if (m && "message_text" in m) return m as ChatMessage;
        return {
          id: m?.id ?? crypto.randomUUID(),
          chatId: m?.chatId ?? "",
          sender_id: m?.sender === "me" ? "me" : "other",
          receiver_id: m?.sender === "me" ? "other" : "me",
          message_text: m?.text ?? "",
          created_at: m?.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
          delivered_at: null,
          read_at: null,
        } as ChatMessage;
      }).filter((m: ChatMessage) => (m.message_text ?? "").toString().trim().length > 0);
    }
    return parsed;
  } catch {
    return { chats: [], messages: [] };
  }
}

function saveChats(data: { chats: ChatSummary[]; messages: ChatMessage[] }) {
  localStorage.setItem("lms-chat-store", JSON.stringify(data));
}

function getInitialData(): { chats: ChatSummary[]; messages: ChatMessage[] } {
  const existing = loadChats();
  if (existing.chats.length) return existing;
  const seedChat: ChatSummary = {
    id: "general-help",
    title: "General Help",
    lastMessage: "Welcome back! How can we help today?",
    updatedAt: Date.now() - 1000 * 60 * 60,
  };
  const seedMessages: ChatMessage[] = [
    {
      id: "m1",
      chatId: seedChat.id,
      sender_id: "support",
      receiver_id: "me",
      message_text: "Welcome back! How can we help today?",
      created_at: new Date(seedChat.updatedAt).toISOString(),
      delivered_at: new Date(seedChat.updatedAt).toISOString(),
      read_at: new Date(seedChat.updatedAt + 1000).toISOString(),
    },
    {
      id: "m2",
      chatId: seedChat.id,
      sender_id: "me",
      receiver_id: "support",
      message_text: "I need assistance with course modules.",
      created_at: new Date(seedChat.updatedAt + 1000 * 60).toISOString(),
      delivered_at: null,
      read_at: null,
    },
  ];
  const data = { chats: [seedChat], messages: seedMessages };
  saveChats(data);
  return data;
}

// initials helper moved to types.ts

async function fetchDirectoryStudents(): Promise<DirectoryUser[]> {
  try {
    const api = new Api();
    const res: any = await api.GetStudents();
    const list: any[] = res?.data?.data ?? res?.data ?? [];
    return (Array.isArray(list) ? list : []).map((s: any) => {
      const id = String(s.id ?? s.user_id ?? s._id ?? s.uuid ?? crypto.randomUUID());
      const nameParts = [s.name, s.full_name, [s.first_name, s.last_name].filter(Boolean).join(" ")]
        .filter((v: any) => typeof v === "string" && v.trim().length > 0);
      const name = (nameParts[0] as string) || String(s.email ?? id);
      return { id, name, role: "Student" as const };
    });
  } catch {
    return [];
  }
}

const ChatDialog = () => {
  const { user } = useAuth();
  const [{ chats, messages }, setStore] = React.useState(getInitialData());
  const [open, setOpen] = React.useState(false);
  const isAuthed = Boolean(user && (user as any).id);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(
    chats[0]?.id ?? null
  );
  const [draft, setDraft] = React.useState("");
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = React.useState<"list" | "thread">("list");
  const [newDialogOpen, setNewDialogOpen] = React.useState(false);
  const [directory, setDirectory] = React.useState<DirectoryUser[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    if (newDialogOpen && directory.length === 0) {
      fetchDirectoryStudents().then((users) => {
        if (!cancelled) setDirectory(users);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [newDialogOpen, directory.length]);

  React.useEffect(() => {
    if (open) {
      if (isMobile) setMobileView("list");
      else setMobileView("thread");
    }
  }, [open, isMobile]);

  React.useEffect(() => {
    if (!isAuthed && open) setOpen(false);
  }, [isAuthed, open]);

  React.useEffect(() => {
    saveChats({ chats, messages });
  }, [chats, messages]);

  const filteredChats = React.useMemo(() => {
    return [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chats]);

  const activeMessages = React.useMemo(() => {
    if (!activeChatId) return [] as ChatMessage[];
    return messages
      .filter((m) => m.chatId === activeChatId && (m.message_text ?? "").toString().trim().length > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, activeChatId]);

  function handleSend() {
    if (!activeChatId || !draft.trim()) return;
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: activeChatId,
      sender_id: user?.id ?? "0",
      receiver_id: "system",
      message_text: draft.trim(),
      created_at: new Date().toISOString(),
      delivered_at: null,
      read_at: null,
    };
    const updatedMessages = [...messages, newMessage];
    const updatedChats = chats.map((c) =>
      c.id === activeChatId
        ? { ...c, lastMessage: newMessage.message_text, updatedAt: Date.now() }
        : c
    );
    setStore({ chats: updatedChats, messages: updatedMessages });
    setDraft("");
  }

  function handleNewChat() {
    setNewDialogOpen(true);
  }

  function startChatWith(user: DirectoryUser) {
    const existing = chats.find((c) => c.title === user.name);
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const id = crypto.randomUUID();
      const now = Date.now();
      const newChat: ChatSummary = {
        id,
        title: user.name,
        lastMessage: "",
        updatedAt: now,
      };
      setStore({ chats: [newChat, ...chats], messages });
      setActiveChatId(id);
    }
    setNewDialogOpen(false);
    if (isMobile) setMobileView("thread");
  }

  if (!isAuthed) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (isAuthed) setOpen(v); }}>
      <SheetTrigger asChild>
        <Button variant="default" size="lg" aria-label="Open chat" disabled={!isAuthed}>
          <MessageSquare className="mr-2 size-4" /> Chat
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Messages</SheetTitle>
        </SheetHeader>
        <div className="flex h-full min-h-0 w-full flex-1">
          <aside className="hidden w-72 shrink-0 border-r sm:block">
            <ChatList
              chats={filteredChats}
              activeChatId={activeChatId}
              onSelect={(id) => {
                setActiveChatId(id);
                if (isMobile) setMobileView("thread");
              }}
              onNew={handleNewChat}
            />
          </aside>
          {isMobile && mobileView === "list" ? (
            <ChatList
              chats={filteredChats}
              activeChatId={activeChatId}
              onSelect={(id) => {
                setActiveChatId(id);
                setMobileView("thread");
              }}
              onNew={handleNewChat}
            />
          ) : (
          <main className="flex min-w-0 flex-1 flex-col">
            {activeChatId ? (
              <>
                {(() => {
                  const chat = chats.find((c) => c.id === activeChatId)!;
                  return (
                    <MessageThread
                      chat={chat}
                      messages={activeMessages}
                      draft={draft}
                      onDraft={setDraft}
                      onSend={handleSend}
                      showBack={isMobile}
                      onBack={() => setMobileView("list")}
                    />
                  );
                })()}
                {null}
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
                Select or start a conversation
                <div className="mt-3">
                  <Button onClick={handleNewChat}>New conversation</Button>
                </div>
              </div>
            )}
          </main>
          )}
        </div>
      </SheetContent>
      <NewChatDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        users={directory}
        onSelectUser={startChatWith}
      />
    </Sheet>
  );
};

export default ChatDialog;