
import io, { Socket } from 'socket.io-client';
import { getAccessToken } from '../lib/cookies';



interface MessageData {
  courseId: number;
  academicYear: string;
  semester: string;
  message_text: string;
}

interface MessageResponse {
  ok: boolean;
  message?: any;
  error?: string;
}



interface AuthenticationData {
  userId: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private userId: string | null = null;

 

connect(userId: string, onConnect?: () => void, serverUrl: string = "https://lms-work.onrender.com"): void {
    this.userId = userId;

   

    // Get fresh token each time we connect
    const token = getAccessToken();

    this.socket = io(serverUrl, {
      timeout: 10000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      auth: {
        token: token,
      },
      query: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      this.isConnected = true;

      const authData: AuthenticationData = { userId: this.userId! };
      this.socket?.emit('authenticate', authData);
      
      if (onConnect) onConnect();
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null;
  }

  joinDiscussion(
    courseId: number,
    academicYear: string,
    semester: string,
    callback?: (response: { ok: boolean; discussionId?: string | number; messages?: any[]; error?: string }) => void
  ): void {
    if (!this.isConnected || !this.socket) {
      
      if (callback) callback({ ok: false, error: 'Socket not connected' });
      return;
    }
    
    const payload = {
      courseId: Number(courseId),
      academicYear,
      semester,
    };
    
    
    
    this.socket.emit('joinDiscussion', payload, (response: any) => {
      if (response?.ok) {
        // Successfully joined; consumer may handle messages
      } else {
        
      }
      
      if (callback) {
        callback(response);
      }
    });
  }

  postMessage(messageData: MessageData, callback?: (response: MessageResponse) => void): void {
    if (!this.isConnected || !this.socket) {
      
      if (callback) {
        callback({ ok: false, error: 'Socket not connected' });
      }
      return;
    }

    
    
    // Prepare the exact format as specified
    const socketMessage = {
      courseId: messageData.courseId,           // Course ID (NUMBER)
      academicYear: messageData.academicYear,   // Academic year (STRING)
      semester: messageData.semester,           // Semester (STRING)
      message_text: messageData.message_text    // Message content (STRING)
    };
    
  
    
    // Emit with exact format as specified
    this.socket.emit('postMessage', socketMessage, (res: MessageResponse) => {
      if (callback) {
        callback(res);
      }
    });
  }

  // Legacy method for backward compatibility
  sendMessage(message: any): void {
    
    if (this.socket) {
      this.socket.emit('postMessage', message, () => {});
    }
  }

  onNewMessage(callback: (message: any) => void): void {
    if (!this.socket) {
      
      return;
    }
    
    // Remove any previous listener before adding a new one
    this.socket.off('newMessage');
    this.socket.on('newMessage', (message: any) => {
      callback(message);
    });
  }

  offNewMessage(callback: (message: any) => void): void {
    this.socket?.off('newMessage', callback);
  }

  // Debug methods to verify connection status
  getConnectionStatus(): { connected: boolean; socketId?: string; userId?: string } {
    return {
      connected: this.isSocketConnected(),
      socketId: this.socket?.id,
      userId: this.userId || undefined
    };
  }

  // Direct message join: dm:join
  joinDirectMessage(peerUserId: string | number, peerUserType: 'staff' | 'student', callback?: (response: any) => void): void {
    if (!this.isConnected || !this.socket) {
      callback?.({ ok: false, error: 'Socket not connected' });
      return;
    }
    const payload = { 
      peerUserId, 
      peerUserType 
    } as any;
    
    this.socket.emit('dm:join', payload, (response: any) => {
      callback?.(response);
    });
  }

  // Send a direct message: dm:send
  sendDirectMessage(peerUserId: string | number, message_text: string, receiverType: 'staff' | 'student', callback?: (response: any) => void): void {
    if (!this.isConnected || !this.socket) {
      callback?.({ ok: false, error: 'Socket not connected' });
      return;
    }
    
    // Validate receiverType
    if (!receiverType || (receiverType !== 'staff' && receiverType !== 'student')) {
      callback?.({ ok: false, error: 'Invalid receiverType. Must be "staff" or "student"' });
      return;
    }
    
    const payload = { 
      peerUserId: peerUserId, 
      message_text: message_text,
      peerUserType: receiverType
    };
    
    this.socket.emit('dm:send', payload, (response: any) => {
      callback?.(response);
    });
  }

  // Listen for new direct messages: dm:newMessage
  onDirectMessage(callback: (message: any) => void): void {
    if (!this.socket) {
      return;
    }
    this.socket.off('dm:newMessage');
    this.socket.on('dm:newMessage', (message: any) => {
      try {
        // Immediately mark as delivered
        const id = (message && (message.id || message._id)) as string | number | undefined;
        if (id) {
          this.socket?.emit('dm:delivered', { messageId: id });
        }
      } catch {}
      callback(message);
    });
  }

  offDirectMessage(callback?: (message: any) => void): void {
    if (!this.socket) return;
    if (callback) this.socket.off('dm:newMessage', callback as any);
    else this.socket.off('dm:newMessage');
  }

  // Typing indicators
  sendTypingStatus(peerUserId: string | number, peerUserType: 'staff' | 'student', isTyping: boolean): void {
    if (!this.isConnected || !this.socket) {
      return;
    }
    const payload = { peerUserId, peerUserType, isTyping };
    this.socket.emit('dm:typing', payload);
  }

  onTypingStatus(callback: (data: { userId: string | number; peerUserId: string | number; isTyping: boolean }) => void): void {
    if (!this.socket) {
      return;
    }
    this.socket.off('dm:typing');
    this.socket.on('dm:typing', (data: any) => {
      callback(data);
    });
  }

  offTypingStatus(callback?: (data: any) => void): void {
    if (!this.socket) return;
    if (callback) this.socket.off('dm:typing', callback as any);
    else this.socket.off('dm:typing');
  }

  // Message status (delivered/read) - Updated to match new socket structure
  markMessageAsRead(messageId: string, callback?: (response: any) => void): void {
    if (!this.isConnected || !this.socket) {
      callback?.({ ok: false, error: 'Socket not connected' });
      return;
    }
    
    this.socket.emit('dm:read', { messageId }, (response: any) => {
      callback?.(response);
    });
  }

  // Listen for delivery confirmation
  onMessageDelivered(callback: (data: { messageId: string; delivered_at: string }) => void): void {
    if (!this.socket) return;
    this.socket.off('dm:delivered');
    this.socket.on('dm:delivered', (data: any) => {
      callback(data);
    });
  }

  // Listen for read confirmation  
  onMessageRead(callback: (data: { messageId: string; read_at: string }) => void): void {
    if (!this.socket) return;
    this.socket.off('dm:read');
    this.socket.on('dm:read', (data: any) => {
      callback(data);
    });
  }

  offMessageStatus(): void {
    if (!this.socket) return;
    this.socket.off('dm:delivered');
    this.socket.off('dm:read');
  }

  // Load More Messages (Pagination)
  loadMoreMessages(
    peerUserId: string, 
    peerUserType: 'staff' | 'student',
    beforeMessageId: string | null = null, 
    limit: number = 50,
    callback?: (response: any) => void
  ): void {
    if (!this.socket) {
      return;
    }
    
    const payload = {
      peerUserId,
      peerUserType,
      beforeMessageId,
      limit
    };
    
    this.socket.emit('dm:loadMore', payload, (response: any) => {
      if (callback) callback(response);
    });
  }

  // Get detailed connection info
  getConnectionInfo(): any {
    if (!this.socket) {
      return { error: 'No socket instance' };
    }

    return {
      connected: this.isConnected,
      socketId: this.socket.id,
      userId: this.userId,
      transport: this.socket.io.engine?.transport?.name,
      readyState: this.socket.io.engine?.readyState,
      auth: this.socket.auth
    };
  }

  // Online status methods
  onUserOnlineStatus(callback: (data: { userId: string | number; userType: string; isOnline: boolean }) => void): void {
    if (!this.socket) return;
    this.socket.on('dm:online', (data: any) => {
      callback(data);
    });
  }

  offUserOnlineStatus(): void {
    if (!this.socket) return;
    this.socket.off('dm:online');
  }

  // Check online status for multiple users
  checkOnlineStatus(userIds: (string | number)[], callback?: (response: any) => void): void {
    if (!this.isConnected || !this.socket) {
      callback?.({ ok: false, error: 'Socket not connected' });
      return;
    }

    this.socket.emit('dm:checkOnline', { userIds }, (response: any) => {
      callback?.(response);
    });
  }

 }

const socketService = new SocketService();
export default socketService;
