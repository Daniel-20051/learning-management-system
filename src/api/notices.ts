import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface Notice {
  id: number;
  title: string;
  note: string;
  date: string;
  token: string | null;
  course_id: number | null;
  expires_at: string | null;
  is_permanent: boolean;
  status: string;
  target_audience: string;
  course: any | null;
}

export interface NoticesResponse {
  status: boolean;
  code: number;
  message: string;
  data: Notice[];
}

export class NoticesApi {
  async GetNotices(): Promise<NoticesResponse> {
    try {
      const response = await axios.get<NoticesResponse>(`${BASE_URL}/api/notices`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (err: any) {
      handleApiError(err, "getting notices");
      throw err;
    }
  }
}

// Export standalone function for backward compatibility
export async function GetNotices() {
  const api = new NoticesApi();
  return api.GetNotices();
}

