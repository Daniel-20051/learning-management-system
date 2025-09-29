import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Send, Smile, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import socketService from "@/services/Socketservice";

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
}

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: "1",
    courseId: 123,
    academicYear: "2024/2025",
    semester: "2ND",
    message_text:
      "Hey everyone! I have a question about the video we just watched. Can someone explain the concept of recursion in more detail?",
    author: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/assets/avatar.png",
      role: "student",
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    courseId: 123,
    academicYear: "2024/2025",
    semester: "2ND",
    message_text:
      "Great question Sarah! Recursion is when a function calls itself to solve a problem. Think of it like Russian nesting dolls - each doll contains a smaller version of itself.",
    author: {
      id: "instructor1",
      name: "Dr. Michael Chen",
      avatar: "/assets/avatar.png",
      role: "instructor",
    },
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
  },
  {
    id: "3",
    courseId: 123,
    academicYear: "2024/2025",
    semester: "2ND",
    message_text:
      "Thanks Dr. Chen! That analogy really helps. I'm still confused about the base case though. How do we know when to stop?",
    author: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/assets/avatar.png",
      role: "student",
    },
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: "4",
    courseId: 123,
    academicYear: "2024/2025",
    semester: "2ND",
    message_text:
      "The base case is the condition that stops the recursion. It's like the smallest doll that doesn't open - it's the final answer. For example, in factorial: n! = n * (n-1)!, but 1! = 1 (base case).",
    author: {
      id: "instructor1",
      name: "Dr. Michael Chen",
      avatar: "/assets/avatar.png",
      role: "instructor",
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  },
  {
    id: "5",
    courseId: 123,
    academicYear: "2024/2025",
    semester: "2ND",
    message_text:
      "I found this helpful diagram that explains recursion visually. What do you all think?",
    author: {
      id: "user2",
      name: "Alex Rodriguez",
      avatar: "/assets/avatar.png",
      role: "student",
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "6",
    courseId: 123,
    academicYear: "2024/2025",
    semester: "2ND",
    message_text:
      "Perfect timing! I was just about to ask about the practical applications. When would you actually use recursion in real projects?",
    author: {
      id: "user3",
      name: "Emma Wilson",
      avatar: "/assets/avatar.png",
      role: "student",
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
];

const Discussion: React.FC<DiscussionProps> = ({
  courseId,
  academicYear = "2024/2025",
  semester = "2ND",
}) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Message listening - socket connection is handled by Unit page
  useEffect(() => {
    // Listen for new messages
    socketService.onNewMessage((message: any) => {
      console.log("📨 New message received in Discussion:", message);
      // Add the new message to the messages list
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      // Remove the message listener when component unmounts
      socketService.offNewMessage(() => {});
    };
  }, []);

  // Handle typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;

    if (newMessage.trim()) {
      setTypingUsers(["You"]);

      typingTimer = setTimeout(() => {
        setTypingUsers([]);
      }, 1000);
    } else {
      setTypingUsers([]);
    }

    return () => clearTimeout(typingTimer);
  }, [newMessage]);

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
    const message: Message = {
      id: Date.now().toString(),
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
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setTypingUsers([]);

    // Send via socket
    try {
      setIsLoading(true);

      socketService.postMessage(messageData, (response) => {
        if (response.ok) {
          console.log("✅ Message sent successfully:", response.message);
          // Message was sent successfully, no need to remove from UI
        } else {
          console.error("❌ Failed to send message:", response.error);
          // Optionally remove the message from UI if socket call fails
          setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
          // You could also show a toast notification here
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

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
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
        {messages.map((message) => (
          <div key={message.id} className="flex space-x-3 group">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={message.author.avatar} />
              <AvatarFallback className="text-xs">
                {message.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {message.author.name}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-1.5 py-0.5",
                    getRoleColor(message.author.role)
                  )}
                >
                  {message.author.role}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(message.timestamp)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg px-3 py-2 max-w-2xl">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {message.message_text}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center mb-3 space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span>
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </span>
          </div>
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
