import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface PurchaseCoursePayload {
  course_id: number;
  payment_reference: string;
  payment_method: string;
}

export interface PurchaseCourseResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    transaction: {
      id: number;
      course_price: number;
      wsp_commission: number;
      tutor_earnings: number | null;
      commission_rate: number;
      owner_type: string;
      note: string;
    };
    enrollment: {
      course_id: number;
      academic_year: string;
      semester: string;
    };
  };
  transaction?: {
    id: number;
    course_price: number;
    wsp_commission: number;
    tutor_earnings: number | null;
    commission_rate: number;
    owner_type: string;
    note: string;
  };
  enrollment?: {
    course_id: number;
    academic_year: string;
    semester: string;
  };
}

export class MarketplaceApi {
  async PurchaseCourse(payload: PurchaseCoursePayload): Promise<any> {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/marketplace/courses/purchase`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );
      // Return the full response data structure
      return response.data;
    } catch (err: any) {
      handleApiError(err, "purchasing course");
      throw err;
    }
  }
}

// Export standalone function for backward compatibility
export async function PurchaseCourse(payload: PurchaseCoursePayload) {
  const api = new MarketplaceApi();
  return api.PurchaseCourse(payload);
}

