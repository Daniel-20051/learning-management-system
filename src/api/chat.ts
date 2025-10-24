import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export class ChatApi {
  async GetChatThreads() {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/dm/threads`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting chat threads");
    }
  }
}

// Export standalone functions for backward compatibility
export async function GetChatThreads() {
  const api = new ChatApi();
  return api.GetChatThreads();
}
