import React from "react";
import { MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { type DirectoryUser } from "@/Components/chat/NewChatDialog";
import NewChatMenu from "@/Components/chat/NewChatMenu";
import ChatList from "@/Components/chat/ChatList";
import MessageThread from "@/Components/chat/MessageThread";
import { type ChatMessage, type ChatSummary } from "@/Components/chat/types";
import { useAuth } from "@/context/AuthContext";
import { Api } from "@/api";
import { useChat } from "@/context/ChatContext";
import socketService from "@/services/Socketservice";


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

async function fetchDirectoryStudents(search?: string): Promise<DirectoryUser[]> {
  try {
    const api = new Api();
    const res: any = await api.GetStudents(search);
    const list: any[] = res?.data?.data?.students ?? res?.data?.data ?? res?.data ?? [];
    return (Array.isArray(list) ? list : []).map((s: any) => {
      const id = String(s.id ?? s.user_id ?? s._id ?? s.uuid ?? crypto.randomUUID());
      const nameParts = [
        s.name,
        s.full_name,
        [s.first_name, s.last_name].filter(Boolean).join(" "),
        [s.fname, s.mname, s.lname].filter(Boolean).join(" ")
      ]
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
  const chatCtx = useChat();
  const [{ chats, messages }, setStore] = React.useState(getInitialData());
  const [open, setOpen] = React.useState(false);
  const isAuthed = Boolean(user && (user as any).id);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = React.useState<"list" | "thread">("list");
  const [newDialogOpen, setNewDialogOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [directory, setDirectory] = React.useState<DirectoryUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const hasLoadedUsersOnOpenRef = React.useRef(false);
  const didRefreshOnOpenRef = React.useRef(false);
  // Track chats started in this UI session so we can show them optimistically
  const [ephemeralChatIds, setEphemeralChatIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const isNewChatOpen = newDialogOpen || menuOpen;
    if (isNewChatOpen && !hasLoadedUsersOnOpenRef.current) {
      hasLoadedUsersOnOpenRef.current = true;
      setIsLoadingUsers(true);
      fetchDirectoryStudents().then((users) => {
        if (!cancelled) setDirectory(users);
      }).finally(() => {
        if (!cancelled) setIsLoadingUsers(false);
      });
    }
    if (!isNewChatOpen) {
      hasLoadedUsersOnOpenRef.current = false;
    }
    return () => {
      cancelled = true;
    };
  }, [newDialogOpen, menuOpen]);

  const handleSearchUsers = React.useCallback((term: string) => {
    const isNewChatOpen = newDialogOpen || menuOpen;
    if (!isNewChatOpen) return;
    // Any manual search counts as a load, so avoid re-triggering the initial loader effect
    hasLoadedUsersOnOpenRef.current = true;
    setIsLoadingUsers(true);
    fetchDirectoryStudents(term)
      .then((users) => setDirectory(users))
      .finally(() => setIsLoadingUsers(false));
  }, [newDialogOpen, menuOpen]);

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
    // Base from server threads (can be empty)
    const base = chatCtx?.threads ?? [];
    // Add only locally-created ephemeral chats to avoid showing seeded/local history
    const ephemeral = chats.filter((c) => ephemeralChatIds.includes(c.id));
    // Merge and de-duplicate by normalized title (server id may differ)
    const byKey = new Map<string, typeof base[number]>();
    for (const c of [...base, ...ephemeral]) {
      const key = (c.title || "").trim().toLowerCase();
      const existing = byKey.get(key);
      if (!existing || c.updatedAt > existing.updatedAt) byKey.set(key, c);
    }
    return Array.from(byKey.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chats, chatCtx, chatCtx?.threads, ephemeralChatIds]);

  const activeMessages = React.useMemo(() => {
    if (!activeChatId) return [] as ChatMessage[];
    return messages
      .filter((m) => m.chatId === activeChatId && (m.message_text ?? "").toString().trim().length > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, activeChatId]);

  function handleSend() {
    if (!activeChatId || !draft.trim()) return;
    const text = draft.trim();
    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat) return;
    // Optimistic local append
    const tempId = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: tempId,
      chatId: activeChatId,
      sender_id: user?.id ?? "0",
      receiver_id: "peer",
      message_text: text,
      created_at: new Date().toISOString(),
      delivered_at: null,
      read_at: null,
      pending: true,
    };
    setStore({
      chats: chats.map((c) => (c.id === activeChatId ? { ...c, lastMessage: text, updatedAt: Date.now() } : c)),
      messages: [...messages, optimistic],
    });
    setDraft("");

    // Resolve peer id from chat title via directory match if available
    const peer = directory.find((d) => d.name === chat.title);
    const peerId = peer?.id ?? undefined;
    if (peerId) {
      socketService.sendDirectMessage(peerId, text, (response) => {
        if (response?.ok && response?.message) {
          // Replace optimistic with server message
          const serverMsg = response.message as ChatMessage;
          setStore((prev) => ({
            chats: prev.chats.map((c) => (c.id === activeChatId ? { ...c, lastMessage: serverMsg.message_text, updatedAt: Date.now() } : c)),
            messages: prev.messages
              .map((m) => (
                m.id === tempId
                  ? {
                      ...serverMsg,
                      // Ensure it remains rendered as mine
                      sender_id: user?.id ?? serverMsg.sender_id,
                      chatId: activeChatId,
                      pending: false,
                    }
                  : m
              )),
          }));
        }
      });
    }
  }

  function handleNewChat() {
    // Open the compact menu instead of the dialog
    setMenuOpen(true);
  }

  React.useEffect(() => {
    if (open) {
      // Refresh threads in background once per open session
      if (!didRefreshOnOpenRef.current) {
        didRefreshOnOpenRef.current = true;
        chatCtx?.refresh().catch(() => {});
      }
    }
  }, [open, chatCtx]);

  // Listen for incoming direct messages
  React.useEffect(() => {
    const handler = (message: any) => {
      // Ignore echoes of my own messages
      if (String(message?.sender_id ?? "") === String(user?.id ?? "")) return;
      const text = String(message?.message_text ?? "");
      const created = message?.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString();
      // Identify thread by sender name if it exists locally
      // Fallback: use active chat if open
      let targetChatId: string | null = activeChatId;
      const senderId = String(message?.sender_id ?? "");
      const matchInDir = directory.find((u) => String(u.id) === senderId);
      if (matchInDir) {
        const existing = chats.find((c) => c.title === matchInDir.name);
        if (existing) targetChatId = existing.id;
        else {
          const id = crypto.randomUUID();
          const newChat: ChatSummary = { id, title: matchInDir.name, lastMessage: text, updatedAt: Date.now() };
          setStore({ chats: [newChat, ...chats], messages });
          setEphemeralChatIds((prev) => Array.from(new Set([...prev, id])));
          targetChatId = id;
        }
      }
      if (!targetChatId) return;
      const serverMessage: ChatMessage = {
        id: String(message?.id ?? crypto.randomUUID()),
        chatId: targetChatId,
        sender_id: message?.sender_id,
        receiver_id: message?.receiver_id,
        message_text: text,
        created_at: created,
        delivered_at: message?.delivered_at ?? null,
        read_at: message?.read_at ?? null,
      };
      setStore({
        chats: chats.map((c) => (c.id === targetChatId ? { ...c, lastMessage: text, updatedAt: Date.now() } : c)),
        messages: [...messages, serverMessage],
      });
    };
    socketService.onDirectMessage(handler);
    return () => {
      socketService.offDirectMessage(handler);
    };
  }, [chats, messages, directory, activeChatId, user?.id]);

  React.useEffect(() => {
    if (!open) {
      didRefreshOnOpenRef.current = false;
    }
  }, [open]);

  function startChatWith(user: DirectoryUser) {
    // Join DM via socket, then navigate to thread on success
    const peerId = user.id;
    socketService.joinDirectMessage(peerId, (response) => {
      if (response?.ok) {
        console.log('Joined chat:', response?.messages);
        // Create/find local thread for this peer
        const existing = chats.find((c) => c.title === user.name);
        let id = existing?.id;
        if (!id) {
          id = crypto.randomUUID();
          const now = Date.now();
          const newChat: ChatSummary = {
            id,
            title: user.name,
            lastMessage: "",
            updatedAt: now,
          };
          setStore({ chats: [newChat, ...chats], messages });
          setEphemeralChatIds((prev) => Array.from(new Set([...prev, id!])));
        } else {
          // Mark existing local chat as ephemeral so it shows while server threads are empty
          setEphemeralChatIds((prev) => Array.from(new Set([...prev, id!])));
        }
        setActiveChatId(id!);
        setMenuOpen(false);
        setNewDialogOpen(false);
        if (isMobile) setMobileView("thread");
      } else {
        console.error('Failed to join:', response?.error);
      }
    });
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
          <div className="flex items-center gap-2">
            <SheetTitle>Messages</SheetTitle>
            {chatCtx?.isRefreshing ? (
              <span className="relative inline-flex h-4 w-4">
                <span className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent" />
              </span>
            ) : null}
          </div>
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
              <div className="grid flex-1 place-items-center p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-muted p-6">
                    <MessageSquare className="size-10 text-muted-foreground" />
                  </div>
                  <div className="text-base font-medium">Select a chat to see the messages</div>
                  <div className="mt-1 text-sm text-muted-foreground">Or start a new conversation</div>
                  <div className="mt-4">
                    <Button onClick={handleNewChat}>New conversation</Button>
                  </div>
                </div>
              </div>
            )}
          </main>
          )}
        </div>
      </SheetContent>
      <NewChatMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        users={directory}
        loading={isLoadingUsers}
        onSearch={handleSearchUsers}
        onSelectUser={(u) => {
          startChatWith(u);
          setMenuOpen(false);
        }}
      />
    </Sheet>
  );
};

export default ChatDialog;