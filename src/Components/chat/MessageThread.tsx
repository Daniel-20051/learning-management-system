import React from "react";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Send, ChevronLeft, Check, CheckCheck } from "lucide-react";
import { type ChatMessage, type ChatSummary, initialsFromTitle, isMessageFromUser, getMessageStatus } from "./types";
import { useAuth } from "@/context/AuthContext";

export type MessageThreadProps = {
  chat: ChatSummary;
  messages: ChatMessage[];
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  showBack?: boolean;
  onBack?: () => void;
  isLoading?: boolean;
  isTyping?: boolean;
  onTyping?: () => void;
  onStopTyping?: () => void;
  // Pagination props
  pagination?: {
    hasMore: boolean;
    loading: boolean;
    oldestMessageId: string | null;
  };
  onLoadMore?: () => void;
  // Online status props
  isOnline?: boolean;
  peerId?: string;
};

const MessageThread: React.FC<MessageThreadProps> = ({ 
  chat, 
  messages, 
  draft, 
  onDraft, 
  onSend, 
  showBack, 
  onBack, 
  isLoading, 
  isTyping = false, 
  onTyping, 
  onStopTyping,
  pagination,
  onLoadMore,
  isOnline,
  peerId
}) => {
  const { user } = useAuth();
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    onDraft(value);
    
    // Trigger typing indicator
    if (onTyping && value.length > 0) {
      onTyping();
      
      // Clear existing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Set timer to stop typing after 3 seconds of inactivity
      typingTimerRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 3000);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = React.useCallback((force = false) => {
    if (messagesEndRef.current && (!isUserScrolling || force)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isUserScrolling]);

  // Handle scroll detection
  const handleScroll = React.useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
    
    setIsUserScrolling(!isAtBottom);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset user scrolling state after 3 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000);
  }, []);

  // Auto-scroll when new messages arrive
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Auto-scroll when typing indicator changes
  React.useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping, scrollToBottom]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Safety check for undefined chat
  if (!chat) {
    return (
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="grid flex-1 place-items-center p-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-base font-medium">Chat not available</div>
            <div className="mt-1 text-sm text-muted-foreground">Please select a valid chat</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-w-0 flex-1 flex-col h-full">
      <div className="flex items-center gap-2 sm:gap-3 border-b p-2 sm:p-3 flex-shrink-0">
        {showBack ? (
          <Button size="sm" variant="outline" onClick={onBack} aria-label="Back to chats" className="sm:hidden">
            <ChevronLeft className="size-4" />
          </Button>
        ) : null}
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initialsFromTitle(chat.title)}</AvatarFallback>
          </Avatar>
          {isOnline !== undefined && (
            <div 
              className={`online-indicator ${isOnline ? 'online' : 'offline'}`}
              data-user-id={peerId}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium">{chat.title}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            {peerId 
              ? (isOnline ? 'Online' : 'Offline')
              : (chat.lastMessage || "No messages yet")
            }
          </div>
        </div>
        {/* Close chat button - visible on all screen sizes */}
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onBack} 
          aria-label="Close chat"
          className="hidden sm:flex h-8 w-8 p-0"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-scroll p-3 sm:p-6 chat-background"
        onScroll={handleScroll}
        style={{ 
          height: 'calc(100vh - 200px)',
          minHeight: '200px'
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-primary"></div>
                <div className="absolute inset-0 rounded-full h-10 w-10 border-2 border-transparent border-t-primary/20 animate-pulse"></div>
              </div>
              <div className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Loading messages...</div>
              <div className="mt-1 text-xs text-muted-foreground/70">Please wait while we fetch your conversation</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">No messages yet</div>
          ) : (
            <>
              {/* Load More Messages Button */}
              {pagination?.hasMore && onLoadMore && (
                <div className="flex justify-center py-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onLoadMore}
                    disabled={pagination.loading}
                    className="text-xs"
                  >
                    {pagination.loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More Messages'
                    )}
                  </Button>
                </div>
              )}
              
              {messages.map((m) => {
                const mine = isMessageFromUser(m, user?.id);
                const base = mine ? "bg-primary text-primary-foreground" : "bg-accent text-foreground";
                const pending = m.pending ? " opacity-60" : "";
                const failed = m.failed ? " bg-destructive/20 border border-destructive/40" : "";
                const status = getMessageStatus(m);
                
                // Format timestamp to show actual time
                const formatTimestamp = (timestamp: string) => {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const isToday = date.toDateString() === now.toDateString();
                  
                  if (isToday) {
                    // Show time only for today's messages
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else {
                    // Show date and time for older messages
                    return date.toLocaleString([], { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                  }
                };
                
                return (
                  <div key={m.id} className={mine ? "ml-auto max-w-[90%] sm:max-w-[88%]" : "mr-auto max-w-[90%] sm:max-w-[88%]"}>
                    <div className={"rounded-lg px-2 sm:px-3 py-2 text-sm shadow-xs " + base + pending + failed}>
                      {m.message_text}
                      <div className={`flex items-center mt-1 gap-1 text-xs opacity-70 ${mine ? 'justify-end' : 'justify-start'}`}>
                        <span>{formatTimestamp(m.created_at)}</span>
                        {mine && (
                          <>
                            {status === 'failed' && (
                              <span className="text-destructive">Failed to send</span>
                            )}
                            {status === 'sending' && (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
                            )}
                            {status === 'sent' && (
                              <Check className="w-3 h-3 opacity-60" />
                            )}
                            {status === 'delivered' && (
                              <CheckCheck className="w-3 h-3 opacity-60" />
                            )}
                            {status === 'read' && (
                              <CheckCheck className="w-3 h-3 text-blue-400" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="mr-auto max-w-[90%] sm:max-w-[88%]">
                  <div className="rounded-lg px-2 sm:px-3 py-2 text-sm shadow-xs bg-accent text-foreground">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {/* Invisible element for scroll targeting */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 border-t bg-background/80 p-2 sm:p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message"
            className="min-h-[40px] sm:min-h-[48px] max-h-32 sm:max-h-48 resize-none text-sm sm:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
                // Stop typing when message is sent
                if (onStopTyping) {
                  onStopTyping();
                }
                // Force scroll to bottom when sending
                setTimeout(() => scrollToBottom(true), 100);
              }
            }}
          />
          <Button 
            aria-label="Send" 
            size="sm"
            onClick={() => {
              onSend();
              // Force scroll to bottom when sending
              setTimeout(() => scrollToBottom(true), 100);
            }} 
            disabled={!draft.trim()}
            className="h-10 w-10 py-3 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground sm:h-auto sm:w-auto sm:px-4 sm:rounded-md"
          >
            <Send className="size-4" />
            <span className="hidden sm:inline sm:ml-2">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;


