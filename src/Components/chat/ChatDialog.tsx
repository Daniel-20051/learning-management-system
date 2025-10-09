import React from "react";
import { MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { type DirectoryUser } from "@/Components/chat/NewChatDialog";
import NewChatMenu from "@/Components/chat/NewChatMenu";
import ChatList from "@/Components/chat/ChatList";
import MessageThread from "@/Components/chat/MessageThread";
import { type ChatMessage, type ChatSummary, isMessageFromUser } from "@/Components/chat/types";
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
  const [loadingChatId, setLoadingChatId] = React.useState<string | null>(null);
  // Store peer IDs for active chats to ensure consistency between join and send
  const [chatPeerIds, setChatPeerIds] = React.useState<Record<string, string>>({});
  // Track typing status for each chat
  const [typingStatus, setTypingStatus] = React.useState<Record<string, boolean>>({});

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
    const filtered = messages
      .filter((m) => m.chatId === activeChatId && (m.message_text ?? "").toString().trim().length > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
 
    return filtered;
  }, [messages, activeChatId]);

  function handleSend() {
    if (!activeChatId || !draft.trim()) return;
    const text = draft.trim();
    
    // Look for chat in both local chats and server threads (filteredChats)
    const chat = chats.find((c) => c.id === activeChatId) || filteredChats.find((c) => c.id === activeChatId);
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

    // Use the stored peer ID that was used when joining this chat
    let peerId: string | undefined = chatPeerIds[activeChatId];
    
    
    // Fallback: try to resolve peer ID if not stored
    if (!peerId) {
      
      // First try to get peerId from the chat thread (server data)
      if ((chat as any).peerId) {
        peerId = String((chat as any).peerId);
      } else {
        // Fallback: resolve peer id from chat title via directory match
        const peer = directory.find((d) => d.name === chat.title);
        peerId = peer?.id;
      }
      
      // Store the resolved peer ID for future use
      if (peerId) {
        setChatPeerIds(prev => ({ ...prev, [activeChatId]: peerId! }));
      }
    }
    
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
                      // Mark as delivered immediately when sent successfully
                      delivered_at: serverMsg.delivered_at || new Date().toISOString(),
                    }
                  : m
              )),
          }));
        } else {
          // Handle send failure - remove pending flag and show error state
          setStore((prev) => ({
            chats: prev.chats,
            messages: prev.messages.map((m) => (
              m.id === tempId ? { ...m, pending: false, failed: true } : m
            )),
          }));
        }
      });
    } else {
      // No peer ID found - mark message as failed
      setStore((prev) => ({
        chats: prev.chats,
        messages: prev.messages.map((m) => (
          m.id === tempId ? { ...m, pending: false, failed: true } : m
        )),
      }));
      console.error('Cannot send message: No peer ID found for chat', chat);
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

  // Handle typing indicators
  React.useEffect(() => {
    const handleTyping = (data: { userId: string | number; peerUserId: string | number; isTyping: boolean }) => {
      const senderId = String(data.userId);
      // Find chat by peer ID
      const chatId = Object.keys(chatPeerIds).find(id => chatPeerIds[id] === senderId);
      if (chatId) {
        setTypingStatus(prev => ({
          ...prev,
          [chatId]: data.isTyping
        }));
      }
    };

    socketService.onTypingStatus(handleTyping);
    return () => {
      socketService.offTypingStatus(handleTyping);
    };
  }, [chatPeerIds]);

  // Handle message status updates
  React.useEffect(() => {
    const handleDelivered = (data: { messageId: string; delivered_at: string }) => {
      setStore(prev => ({
        chats: prev.chats,
        messages: prev.messages.map(m => 
          m.id === data.messageId 
            ? { ...m, delivered_at: data.delivered_at }
            : m
        )
      }));
    };

    const handleRead = (data: { messageId: string; read_at: string }) => {
      setStore(prev => ({
        chats: prev.chats,
        messages: prev.messages.map(m => 
          m.id === data.messageId 
            ? { ...m, read_at: data.read_at }
            : m
        )
      }));
    };

    socketService.onMessageDelivered(handleDelivered);
    socketService.onMessageRead(handleRead);
    
    return () => {
      socketService.offMessageStatus();
    };
  }, [setStore]);

  // Typing handlers
  const handleTyping = React.useCallback(() => {
    if (!activeChatId) return;
    const peerId = chatPeerIds[activeChatId];
    if (peerId) {
      socketService.sendTypingStatus(peerId, true);
    }
  }, [activeChatId, chatPeerIds]);

  const handleStopTyping = React.useCallback(() => {
    if (!activeChatId) return;
    const peerId = chatPeerIds[activeChatId];
    if (peerId) {
      socketService.sendTypingStatus(peerId, false);
    }
  }, [activeChatId, chatPeerIds]);

  // Mark messages as read when viewing a chat
  React.useEffect(() => {
    if (!activeChatId) return;
    
    // Mark unread messages as read
    const unreadMessages = activeMessages.filter(m => 
      !isMessageFromUser(m, user?.id) && !m.read_at
    );
    
    unreadMessages.forEach(message => {
      socketService.markMessageAsRead(message.id, () => {
        // Message marked as read
      });
    });
  }, [activeChatId, activeMessages, user?.id]);

  React.useEffect(() => {
    if (!open) {
      didRefreshOnOpenRef.current = false;
    }
  }, [open]);

  // Helper function to process and store server messages
  const processServerMessages = React.useCallback((serverMessages: any[], chatId: string) => {
    if (!Array.isArray(serverMessages) || serverMessages.length === 0) {
      setLoadingChatId(null);
      return;
    }
    
    // Clear existing messages for this chat first to avoid duplicates
    setStore((prev) => {
      const filteredMessages = prev.messages.filter(m => m.chatId !== chatId);
      
      const processedMessages: ChatMessage[] = serverMessages
        .map((msg: any) => {
          // Extract sender ID - try multiple possible field names
          const senderId = String(
            msg.senderId || 
            msg.sender_id || 
            msg.sender?.id || 
            msg.sender || 
            ''
          );
          
          // Extract receiver ID - try multiple possible field names  
          const receiverId = String(
            msg.receiverId || 
            msg.receiver_id || 
            msg.receiver?.id || 
            msg.receiver || 
            ''
          );
          
          const processed = {
            id: String(msg._id || msg.id || crypto.randomUUID()),
            chatId: chatId,
            sender_id: senderId,
            receiver_id: receiverId,
            message_text: String(msg.messageText || msg.message_text || msg.text || msg.content || ''),
            created_at: msg.created_at || msg.createdAt || msg.timestamp || new Date().toISOString(),
            delivered_at: msg.deliveredAt || msg.delivered_at || null,
            read_at: msg.readAt || msg.read_at || null,
          };
          
          
          return processed;
        })
        .filter(msg => msg.message_text.trim().length > 0)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      const newMessages = [...filteredMessages, ...processedMessages];
      
      return {
        chats: prev.chats,
        messages: newMessages
      };
    });
    
    setLoadingChatId(null);
  }, [setStore]);

  function handleSelectChat(chatId: string) {
    setActiveChatId(chatId);
    setLoadingChatId(chatId); // Set loading state
    if (isMobile) setMobileView("thread");
    
    // Set a timeout to clear loading state in case socket doesn't respond
    setTimeout(() => {
      setLoadingChatId((current) => current === chatId ? null : current);
    }, 10000); // 10 second timeout
    
    // Find the chat to get peer information
    const chat = filteredChats.find((c) => c.id === chatId);
    if (!chat) {
      setLoadingChatId(null);
      return;
    }
    
    // If this is a server thread that doesn't exist in local chats, create a local copy
    const localChat = chats.find((c) => c.id === chatId);
    if (!localChat) {
      const newLocalChat: ChatSummary = {
        id: chat.id,
        title: chat.title,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        unreadCount: (chat as any).unreadCount,
        peerRole: (chat as any).peerRole,
      };
      setStore({ chats: [newLocalChat, ...chats], messages });
      setEphemeralChatIds((prev) => Array.from(new Set([...prev, chatId])));
    }
    
    // First try to get peer ID from the chat thread data (from server)
    let peerId = (chat as any).peerId;
    
    // Fallback: try to find the peer user ID from directory or chat title
    if (!peerId) {
      const peer = directory.find((d) => d.name === chat.title);
      peerId = peer?.id;
    }
    
    if (peerId) {
      // Store the peer ID for this chat to use when sending messages
      setChatPeerIds(prev => ({ ...prev, [chatId]: peerId }));
      
      // Check if socket is connected before trying to join
      if (!socketService.isSocketConnected()) {
        if (user?.id) {
          socketService.connect(String(user.id), () => {
            socketService.joinDirectMessage(peerId, (response) => {
              if (response?.ok) {
                // Process and store the received messages - use the chatId parameter instead of activeChatId
                if (response?.messages && Array.isArray(response.messages)) {
                  processServerMessages(response.messages, chatId);
                }
                } else {
                  setLoadingChatId(null);
                }
            });
          });
        }
      } else {
        // Join the chat via socket
        socketService.joinDirectMessage(peerId, (response) => {
          if (response?.ok) {
            // Process and store the received messages - use the chatId parameter instead of activeChatId
            if (response?.messages && Array.isArray(response.messages)) {
              processServerMessages(response.messages, chatId);
            }
        } else {
          setLoadingChatId(null);
        }
        });
      }
    } else {
      // Try to load directory if not loaded yet
      if (directory.length === 0) {
        setIsLoadingUsers(true);
        fetchDirectoryStudents().then((users) => {
          setDirectory(users);
          setIsLoadingUsers(false);
          // Retry finding the peer
          const retryPeer = users.find((d) => d.name === chat.title);
          if (retryPeer?.id) {
            // Store the peer ID for this chat to use when sending messages
            setChatPeerIds(prev => ({ ...prev, [chatId]: retryPeer.id }));
            
            // Check if socket is connected before trying to join
            if (!socketService.isSocketConnected()) {
              if (user?.id) {
                socketService.connect(String(user.id), () => {
                  socketService.joinDirectMessage(retryPeer.id, (response) => {
                    if (response?.ok) {
                      // Process and store the received messages - use the chatId parameter instead of activeChatId
                      if (response?.messages && Array.isArray(response.messages)) {
                        processServerMessages(response.messages, chatId);
                      }
                  } else {
                    setLoadingChatId(null);
                  }
                  });
                });
              }
            } else {
              socketService.joinDirectMessage(retryPeer.id, (response) => {
                if (response?.ok) {
                  // Process and store the received messages - use the chatId parameter instead of activeChatId
                  if (response?.messages && Array.isArray(response.messages)) {
                    processServerMessages(response.messages, chatId);
                  }
                } else {
                  setLoadingChatId(null);
                }
              });
            }
          }
        }).catch(() => {
          setIsLoadingUsers(false);
        });
      }
    }
  }

  function startChatWith(user: DirectoryUser) {
    // Join DM via socket, then navigate to thread on success
    const peerId = user.id;
    
    // Check if socket is connected before trying to join
    if (!socketService.isSocketConnected()) {
      if (user?.id) {
        socketService.connect(String(user.id), () => {
          socketService.joinDirectMessage(peerId, (response) => {
            handleStartChatResponse(response, user, peerId);
          });
        });
      }
      return;
    }
    
    socketService.joinDirectMessage(peerId, (response) => {
      handleStartChatResponse(response, user, peerId);
    });
  }
  
  function handleStartChatResponse(response: any, user: DirectoryUser, peerId: string) {
    if (response?.ok) {
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
      
      // Store the peer ID for this chat
      setChatPeerIds(prev => ({ ...prev, [id!]: peerId }));
      
      // Process and store the received messages
      if (response?.messages && Array.isArray(response.messages)) {
        processServerMessages(response.messages, id!);
      }
      
      setActiveChatId(id!);
      setMenuOpen(false);
      setNewDialogOpen(false);
      if (isMobile) setMobileView("thread");
    }
  }

  if (!isAuthed) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (isAuthed) setOpen(v); }}>
      <SheetTrigger asChild>
        <Button variant="default" size="lg" aria-label="Open chat" disabled={!isAuthed}>
          <MessageSquare className="mr-2 size-4" /> Chat
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-screen flex flex-col">
        <SheetHeader className="border-b p-2 sm:p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SheetTitle>Messages</SheetTitle>
            {chatCtx?.isRefreshing ? (
              <span className="relative inline-flex h-4 w-4">
                <span className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent" />
              </span>
            ) : null}
          </div>
        </SheetHeader>
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
          <aside className="hidden w-72 shrink-0 border-r sm:block">
            <ChatList
              chats={filteredChats}
              activeChatId={activeChatId}
              onSelect={handleSelectChat}
              onNew={handleNewChat}
            />
          </aside>
          {isMobile && mobileView === "list" ? (
            <ChatList
              chats={filteredChats}
              activeChatId={activeChatId}
              onSelect={handleSelectChat}
              onNew={handleNewChat}
            />
          ) : (
          <main className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
            {activeChatId ? (
              <>
                {(() => {
                  // Look for chat in both local chats and filteredChats (which includes server threads)
                  const chat = chats.find((c) => c.id === activeChatId) || filteredChats.find((c) => c.id === activeChatId);
                  
                  if (!chat) {
                    return (
                      <div className="grid flex-1 place-items-center p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="text-base font-medium">Chat not found</div>
                          <div className="mt-1 text-sm text-muted-foreground">Please select a valid chat</div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <MessageThread
                      chat={chat}
                      messages={activeMessages}
                      draft={draft}
                      onDraft={setDraft}
                      onSend={handleSend}
                      showBack={isMobile}
                      onBack={() => {
                        if (isMobile) {
                          setMobileView("list");
                        } else {
                          // Clear active chat to return to neutral state
                          setActiveChatId(null);
                          setDraft("");
                        }
                      }}
                      isLoading={loadingChatId === activeChatId}
                      isTyping={typingStatus[activeChatId] || false}
                      onTyping={handleTyping}
                      onStopTyping={handleStopTyping}
                    />
                  );
                })()}
                {null}
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-6">
                <div className="flex flex-col items-center text-center max-w-md">
                  <div className="mb-4 rounded-full bg-muted p-6">
                    <MessageSquare className="size-10 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-semibold">Welcome to Messages</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Select a conversation from the sidebar to start chatting, or create a new conversation to connect with someone.
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleNewChat} className="min-w-[140px]">
                      New conversation
                    </Button>
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