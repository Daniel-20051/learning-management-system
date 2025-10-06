import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Send, Smile, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import socketService from "@/services/Socketservice";

// Helper function to generate random IDs
const generateRandomId = () => Math.random().toString(36).substr(2, 9);

// Types for discussion messages
interface Message {
  id: string;
  courseId: number;
  academicYear: string;
  semester: string;
  message_text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: "student" | "instructor" | "admin";
  };
  timestamp: Date;
  isEdited?: boolean;
  isPending?: boolean;
  isFailed?: boolean;
}

// API message data structure
interface MessageData {
  courseId: number;
  academicYear: string;
  semester: string;
  message_text: string;
}

interface DiscussionProps {
  unitId: string;
  moduleId: string;
  courseId: string;
  academicYear?: string;
  semester?: string;
  initialMessages?: any[];
}



const Discussion: React.FC<DiscussionProps> = ({
  courseId,
  academicYear = "2024/2025",
  semester = "2ND",
  initialMessages = [],
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load recent messages from parent when provided
  useEffect(() => {
    if (!initialMessages || initialMessages.length === 0) return;
    const normalized = initialMessages.map((m: any): Message => ({
      id: String(m?.id ?? m?._id ?? generateRandomId()),
      courseId: Number(m?.course_id ?? m?.courseId ?? courseId),
      academicYear: String(m?.academic_year ?? m?.academicYear ?? academicYear),
      semester: String(m?.semester ?? semester),
      message_text: String(m?.message_text ?? m?.text ?? ""),
      author: {
        id: String(m?.sender_id ?? m?.author?.id ?? "unknown"),
        name: String(m?.sender_type ?? m?.author?.name ?? "Unknown User"),
        avatar: m?.author?.avatar ?? "/assets/avatar.png",
        role: (m?.author?.role as any) ?? "student",
      },
      timestamp: m?.created_at ? new Date(m.created_at) : new Date(),
      isPending: false,
      isFailed: false,
    }));
    setMessages(normalized);
  }, [initialMessages]);

  // Message listening - socket connection is handled by Unit page
  useEffect(() => {
    // Listen for new messages
    socketService.onNewMessage((message: any) => {
      console.log("📨 New message received in Discussion:", message);
      // Normalize shape and provide safe fallbacks
      const normalized: Message = {
        id: String(message?.id),
        courseId: Number(message?.courseId ?? courseId),
        academicYear: String(message?.academicYear ?? academicYear),
        semester: String(message?.semester ?? semester),
        message_text: String(message?.message_text ?? message?.text ?? ""),
        author:
          message?.author && typeof message.author === "object"
            ? {
                id: String(message.author.id ?? "unknown"),
                name: String(message.author.name ?? "Unknown User"),
                avatar: message.author.avatar ?? "/assets/avatar.png",
                role: (message.author.role as any) ?? "student",
              }
            : {
                id: "unknown",
                name: "Unknown User",
                avatar: "/assets/avatar.png",
                role: "student",
              },
        timestamp: message?.timestamp ? new Date(message.timestamp) : new Date(),
        isPending: false,
      };

      setMessages((prev) => {
        // If same id already exists, merge and clear pending/failed
        const existingIndex = prev.findIndex((m) => m.id === normalized.id);
        if (existingIndex !== -1) {
          const copy = [...prev];
          copy[existingIndex] = {
            ...copy[existingIndex],
            ...normalized,
            isPending: false,
            isFailed: false,
          };
          return copy;
        }

        // If a pending message with same text exists, replace it (server echo)
        const pendingIndex = prev.findIndex(
          (m) => m.isPending && m.message_text === normalized.message_text
        );
        if (pendingIndex !== -1) {
          const copy = [...prev];
          copy[pendingIndex] = { ...normalized, isPending: false, isFailed: false };
          return copy;
        }

        return [...prev, normalized];
      });
    });

    // Cleanup on unmount
    return () => {
      // Remove the message listener when component unmounts
      socketService.offNewMessage(() => {});
    };
  }, []);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Prepare message data for socket
    const messageData: MessageData = {
      courseId: parseInt(courseId),
      academicYear,
      semester,
      message_text: newMessage.trim(),
    };

    // Log the message data structure for debugging
    console.log("📤 Message data structure being sent:", messageData);

    // Create message for UI immediately (optimistic update)
    const tempId = Date.now().toString();
    const message: Message = {
      id: tempId,
      courseId: parseInt(courseId),
      academicYear,
      semester,
      message_text: newMessage.trim(),
      author: {
        id: "current-user",
        name: "You",
        avatar: "/assets/avatar.png",
        role: "student",
      },
      timestamp: new Date(),
      isPending: true,
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Send via socket
    try {
      setIsLoading(true);

      socketService.postMessage(messageData, (response) => {
        if (response.ok) {
          console.log("✅ Message sent successfully:", response.message);
          // Clear pending state; if server returns an id, update it
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    id: String(response?.message?.id ?? response?.message?._id ?? m.id),
                    isPending: false,
                    isFailed: false,
                  }
                : m
            )
          );
        } else {
          console.error("❌ Failed to send message:", response.error);
          // Mark as failed (keep it visible but greyed + could allow retry later)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, isPending: false, isFailed: true } : m
            )
          );
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the message from UI if there's an error
      setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: Date | string | number) => {
    const ts = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - ts.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "instructor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center py-12">
            <div className="flex flex-col items-center text-center text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation by sending a message.</p>
            </div>
          </div>
        ) : (
        messages.map((message) => {
          const name = message.author?.name ?? "Unknown User";
          const avatar = message.author?.avatar ?? "/assets/avatar.png";
          const role = message.author?.role ?? "student";
          return (
            <div
              key={message.id}
              className={cn(
                "flex space-x-3 group",
                message.isPending && "opacity-60",
                message.isFailed && "opacity-60"
              )}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-xs">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-1.5 py-0.5",
                      getRoleColor(role)
                    )}
                  >
                    {role}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg px-2 py-1.5 max-w-2xl">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {message.message_text}
                  </p>
                  {message.isFailed && (
                    <p className="text-[10px] text-red-500 mt-1">Failed to send</p>
                  )}
                </div>
              </div>
            </div>
          );
        })
        )}


        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-20 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              style={{
                minHeight: "40px",
                maxHeight: "80px",
                height: "auto",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="px-4"
          >
            <Send className="w-4 h-4 mr-1" />
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Discussion;
