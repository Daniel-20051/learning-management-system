import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface Program {
  id: number;
  name: string;
  [key: string]: any;
}

export interface Faculty {
  id: number;
  name: string;
  [key: string]: any;
}

export class ProgramsApi {
  /**
   * Get program by ID
   */
  async GetProgramById(id: number): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/api/programs/${id}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting program by ID");
    }
  }

  /**
   * Get faculty by ID
   */
  async GetFacultyById(id: number): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/api/faculties/${id}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting faculty by ID");
    }
  }
}

// Export standalone functions for backward compatibility
export async function GetProgramById(id: number) {
  const api = new ProgramsApi();
  return api.GetProgramById(id);
}

export async function GetFacultyById(id: number) {
  const api = new ProgramsApi();
  return api.GetFacultyById(id);
}

