import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface AdminPermissions {
  staff: {
    edit: boolean;
    view: boolean;
    create: boolean;
    delete: boolean;
  };
  admins: {
    edit: boolean;
    view: boolean;
    create: boolean;
    delete: boolean;
  };
  system: {
    logs: boolean;
    settings: boolean;
    analytics: boolean;
  };
  content: {
    exams: boolean;
    units: boolean;
    modules: boolean;
    quizzes: boolean;
  };
  courses: {
    edit: boolean;
    view: boolean;
    create: boolean;
    delete: boolean;
  };
  students: {
    edit: boolean;
    view: boolean;
    create: boolean;
    delete: boolean;
  };
}

export interface AdminProfile {
  id: number;
  email: string;
  fname: string;
  lname: string;
  mname: string | null;
  role: string;
  phone: string;
  permissions: AdminPermissions;
  status: string;
  last_login: string;
  profile_image: string | null;
  two_factor_enabled: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data: {
    admin: AdminProfile;
  };
}

export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get<AdminProfileResponse>(
      `${BASE_URL}/api/admin/profile`,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'getting admin profile');
    throw err;
  }
};

export interface UpdateAdminProfileData {
  id: number;
  email: string;
  fname: string;
  lname: string;
  mname?: string | null;
  role: string;
  phone: string;
}

export interface UpdateAdminProfileResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      phone: string;
      profileImage: string | null;
    };
  };
}

export const updateAdminProfile = async (data: UpdateAdminProfileData): Promise<UpdateAdminProfileResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put<UpdateAdminProfileResponse>(
      `${BASE_URL}/api/admin/profile`,
      data,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'updating admin profile');
    throw err;
  }
};

// Students Management
export interface Student {
  id: number;
  email: string;
  fname: string;
  lname: string;
  matric_number: string;
  level: number;
  admin_status: string;
  program_id: number;
  program?: {
    id: number;
    title: string;
  };
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  status?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: Student[];
    pagination: PaginationData;
  };
}

export const getStudents = async (params: GetStudentsParams = {}): Promise<GetStudentsResponse> => {
  try {
    const headers = getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.level) queryParams.append('level', params.level.toString());
    if (params.status) queryParams.append('status', params.status);
    
    const url = `${BASE_URL}/api/admin/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axios.get<GetStudentsResponse>(url, { headers });
    return response.data;
  } catch (err) {
    handleApiError(err, 'getting students');
    throw err;
  }
};

export interface StudentStatisticsByLevel {
  level: string | null;
  count: string;
}

export interface StudentStatisticsByProgram {
  program_id: number;
  count: string;
  "program.title": string | null;
}

export interface StudentStatisticsRaw {
  total: number;
  active: number;
  inactive: number;
  byLevel: StudentStatisticsByLevel[];
  byProgram: StudentStatisticsByProgram[];
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  studentsByLevel: {
    [key: string]: number;
  };
  studentsByProgram: {
    [key: string]: number;
  };
}

export interface GetStudentStatisticsResponse {
  success: boolean;
  message: string;
  data: StudentStatisticsRaw;
}

export const getStudentStatistics = async (): Promise<GetStudentStatisticsResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get<GetStudentStatisticsResponse>(
      `${BASE_URL}/api/admin/students/stats`,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'getting student statistics');
    throw err;
  }
};

// Get Single Student
export interface StudentDetails extends Omit<Student, 'program'> {
  program?: {
    id: number;
    program_name: string;
    title?: string;
  };
  enrolledCourses?: Array<{
    course_id: number;
    course_name: string;
  }>;
}

export interface GetStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: StudentDetails;
  };
}

export const getStudent = async (studentId: number): Promise<GetStudentResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get<GetStudentResponse>(
      `${BASE_URL}/api/admin/students/${studentId}`,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'getting student details');
    throw err;
  }
};

// Create Student
export interface CreateStudentData {
  email: string;
  password: string;
  fname: string;
  lname: string;
  matric_number?: string;
  level: number;
  program_id: number;
  currency?: string;
  referral_code?: string;
  designated_institute?: number;
  foreign_student?: number;
}

export interface CreateStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: Student;
  };
}

export const createStudent = async (data: CreateStudentData): Promise<CreateStudentResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post<CreateStudentResponse>(
      `${BASE_URL}/api/admin/students`,
      data,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'creating student');
    throw err;
  }
};

// Update Student
export interface UpdateStudentData {
  fname?: string;
  lname?: string;
  level?: number;
  phone?: string;
  matric_number?: string;
  program_id?: number;
}

export interface UpdateStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: Student;
  };
}

export const updateStudent = async (studentId: number, data: UpdateStudentData): Promise<UpdateStudentResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put<UpdateStudentResponse>(
      `${BASE_URL}/api/admin/students/${studentId}`,
      data,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'updating student');
    throw err;
  }
};

// Deactivate Student
export interface DeactivateStudentResponse {
  success: boolean;
  message: string;
}

export const deactivateStudent = async (studentId: number): Promise<DeactivateStudentResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch<DeactivateStudentResponse>(
      `${BASE_URL}/api/admin/students/${studentId}/deactivate`,
      {},
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'deactivating student');
    throw err;
  }
};

// Activate Student
export interface ActivateStudentResponse {
  success: boolean;
  message: string;
}

export const activateStudent = async (studentId: number): Promise<ActivateStudentResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch<ActivateStudentResponse>(
      `${BASE_URL}/api/admin/students/${studentId}/activate`,
      {},
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'activating student');
    throw err;
  }
};

// Reset Student Password
export interface ResetStudentPasswordData {
  newPassword: string;
}

export interface ResetStudentPasswordResponse {
  success: boolean;
  message: string;
}

export const resetStudentPassword = async (
  studentId: number,
  data: ResetStudentPasswordData
): Promise<ResetStudentPasswordResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post<ResetStudentPasswordResponse>(
      `${BASE_URL}/api/admin/students/${studentId}/reset-password`,
      data,
      { headers }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'resetting student password');
    throw err;
  }
};

// ==================== STAFF MANAGEMENT ====================

export interface StaffCourse {
  id: number;
  title: string;
  course_code: string;
}

export interface Staff {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  linkedin: string;
  google_scholar: string;
  file: string;
  research_areas: string;
  home_address: string;
  courses: StaffCourse[];
}

export interface GetStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetStaffResponse {
  success: boolean;
  message: string;
  data: {
    staff: Staff[];
    pagination: PaginationData;
  };
}

export const getStaff = async (params: GetStaffParams = {}): Promise<GetStaffResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get<GetStaffResponse>(
      `${BASE_URL}/api/admin/staff`,
      { headers, params }
    );
    return response.data;
  } catch (err) {
    handleApiError(err, 'getting staff');
    throw err;
  }
};

