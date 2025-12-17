import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface PurchaseCoursePayload {
  course_id: number;
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

export interface MarketplaceTutor {
  owner_id: number | null;
  owner_type: "wpu" | "sole_tutor" | "organization";
  name: string;
  display_name: string;
  specialization?: string;
  description?: string;
  course_count: number;
  profile_image?: string | null;
  logo?: string | null;
  rating?: number | null;
  total_reviews?: number | null;
}

export interface MarketplaceProgram {
  id: number;
  title: string;
  description?: string;
  faculty_id: number;
  course_count: number;
  faculty?: {
    id: number;
    name: string;
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

  async GetMyCourses(params?: {
    owner_id?: number;
    owner_type?: "sole_tutor" | "organization" | "wpu";
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.owner_id) queryParams.append('owner_id', String(params.owner_id));
      if (params?.owner_type) queryParams.append('owner_type', params.owner_type);
      
      const url = queryParams.toString() 
        ? `${BASE_URL}/api/marketplace/courses/my-courses?${queryParams.toString()}`
        : `${BASE_URL}/api/marketplace/courses/my-courses`;

      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting marketplace courses");
    }
  }

  async GetMarketplaceCourses(params?: {
    owner_id?: number | null;
    owner_type?: "sole_tutor" | "organization" | "wpu";
    level?: number | string;
    program_id?: number | string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.owner_id !== undefined && params?.owner_id !== null) {
        queryParams.append('owner_id', String(params.owner_id));
      }
      if (params?.owner_type) queryParams.append('owner_type', params.owner_type);
      if (params?.level) queryParams.append('level', String(params.level));
      if (params?.program_id) queryParams.append('program_id', String(params.program_id));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      
      const url = queryParams.toString() 
        ? `${BASE_URL}/api/marketplace/courses?${queryParams.toString()}`
        : `${BASE_URL}/api/marketplace/courses`;

      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting marketplace courses");
    }
  }

  async GetMarketplaceTutors(): Promise<any> {
    try {
      // Public endpoint - no authentication required
      const response = await axios.get(`${BASE_URL}/api/marketplace/tutors`);
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting marketplace tutors");
    }
  }

  async GetMarketplacePrograms(): Promise<any> {
    try {
      // Public endpoint - no authentication required
      const response = await axios.get(`${BASE_URL}/api/marketplace/programs`);
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting marketplace programs");
    }
  }
}

// Export standalone function for backward compatibility
export async function PurchaseCourse(payload: PurchaseCoursePayload) {
  const api = new MarketplaceApi();
  return api.PurchaseCourse(payload);
}

