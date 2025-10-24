import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export class StudentsApi {
  async GetStudents(search?: string) {
    try {
      const url = search && search.trim().length > 0
        ? `${BASE_URL}/api/students/?search=${encodeURIComponent(search.trim())}`
        : `${BASE_URL}/api/students/`;
      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting students");
    }
  }
}

// Export standalone functions for backward compatibility
export async function GetStudents(search?: string) {
  const api = new StudentsApi();
  return api.GetStudents(search);
}
