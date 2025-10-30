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

export interface VideoCall {
  id: string;
  title: string;
  streamCallId: string;
  callType: string;
  startsAt: string | null;
  endedAt: string | null;
  createdAt: string;
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

export interface VideoCallsListResponse {
  success: boolean;
  data: VideoCall[];
}

export interface DeleteVideoCallResponse {
  success: boolean;
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

  /**
   * Get all video calls
   */
  async getVideoCalls(): Promise<VideoCallsListResponse> {
    try {
      const response = await axios.get<VideoCallsListResponse>(`${BASE_URL}/api/video/calls`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching video calls:', error);
      handleApiError(error, "fetching video calls");
      throw new Error(error.response?.data?.message || 'Failed to fetch video calls');
    }
  }

  /**
   * Delete a video call
   */
  async deleteVideoCall(callId: string): Promise<DeleteVideoCallResponse> {
    try {
      const response = await axios.delete<DeleteVideoCallResponse>(`${BASE_URL}/api/video/calls/${callId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting video call:', error);
      handleApiError(error, "deleting video call");
      throw new Error(error.response?.data?.message || 'Failed to delete video call');
    }
  }
}

// Export functions for direct use
export const CreateVideoCall = async (payload: CreateVideoCallPayload): Promise<VideoCallResponse> => {
  const api = new VideoApi();
  return api.createVideoCall(payload);
};

export const GetVideoCalls = async (): Promise<VideoCallsListResponse> => {
  const api = new VideoApi();
  return api.getVideoCalls();
};

export const DeleteVideoCall = async (callId: string): Promise<DeleteVideoCallResponse> => {
  const api = new VideoApi();
  return api.deleteVideoCall(callId);
};
