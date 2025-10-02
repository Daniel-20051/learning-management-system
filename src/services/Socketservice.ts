
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

    console.log('Connecting to socket server...');

    this.socket = io(serverUrl, {
      timeout: 10000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      auth: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
      this.isConnected = true;

      const authData: AuthenticationData = { userId: this.userId! };
      this.socket?.emit('authenticate', authData);
      console.log('🔐 Authentication sent');
      if (onConnect) onConnect();
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection failed:', error);
      this.isConnected = false;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from socket server');
      this.isConnected = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket...');
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
      console.error('Socket not connected');
      if (callback) callback({ ok: false, error: 'Socket not connected' });
      return;
    }
    
    const payload = {
      courseId: Number(courseId),
      academicYear,
      semester,
    };
    
    console.log('📡 Emitting joinDiscussion with payload:', payload);
    
    this.socket.emit('joinDiscussion', payload, (response: any) => {
      if (response?.ok) {
        console.log('Joined discussion:', response.discussionId);
        console.log('Recent messages:', response.messages); // Last 100 messages
      } else {
        console.error('Failed to join discussion:', response?.error);
      }
      
      if (callback) {
        callback(response);
      }
    });
  }

  postMessage(messageData: MessageData, callback?: (response: MessageResponse) => void): void {
    if (!this.isConnected || !this.socket) {
      console.error('Socket not connected');
      if (callback) {
        callback({ ok: false, error: 'Socket not connected' });
      }
      return;
    }

    console.log('📤 Sending message:', messageData);
    
    // Prepare the exact format as specified
    const socketMessage = {
      courseId: messageData.courseId,           // Course ID (NUMBER)
      academicYear: messageData.academicYear,   // Academic year (STRING)
      semester: messageData.semester,           // Semester (STRING)
      message_text: messageData.message_text    // Message content (STRING)
    };
    
  
    
    // Emit with exact format as specified
    this.socket.emit('postMessage', socketMessage, (response: MessageResponse) => {
      if (response.ok) {
        console.log('✅ Message sent successfully:', response.message);
      } else {
        console.error('❌ Failed to send message:', response.error);
      }
      if (callback) {
        callback(response);
      }
    });
  }

  // Legacy method for backward compatibility
  sendMessage(message: any): void {
    console.warn('⚠️ sendMessage is deprecated. Use postMessage instead.');
    if (this.socket) {
      this.socket.emit('postMessage', message, (response: any) => {
        console.log('🔌 Message sent:', response);
      });
    }
  }

  onNewMessage(callback: (message: any) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    
    // Remove any previous listener before adding a new one
    this.socket.off('newMessage');
    this.socket.on('newMessage', (message: any) => {
      callback(message);
      console.log('🔌 New message received:', message);
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

 }

const socketService = new SocketService();
export default socketService;
