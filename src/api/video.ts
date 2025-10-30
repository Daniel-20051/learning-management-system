import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface CreateVideoCallPayload {
  title: string;
  courseId: number;
  callType: string;
  record: boolean;
  region: string;
  startsAt: string;
}

export interface VideoCallResponse {
  success: boolean;
  data?: {
    callId: string;
    title: string;
    courseId: number;
    callType: string;
    record: boolean;
    region: string;
    startsAt: string;
    createdAt: string;
  };
  message?: string;
  error?: string;
}

export class VideoApi {
  /**
   * Create a new video call
   */
  async createVideoCall(payload: CreateVideoCallPayload): Promise<VideoCallResponse> {
    try {
      const response = await axios.post<VideoCallResponse>(`${BASE_URL}/api/video/calls`, payload, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating video call:', error);
      handleApiError(error, "creating video call");
      throw new Error(error.response?.data?.message || 'Failed to create video call');
    }
  }
}

// Export function for direct use
export const CreateVideoCall = async (payload: CreateVideoCallPayload): Promise<VideoCallResponse> => {
  const api = new VideoApi();
  return api.createVideoCall(payload);
};
