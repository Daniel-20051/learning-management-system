import axios from 'axios';
import { setAccessToken, removeAccessToken, getAccessToken } from '../lib/cookies';
import { BASE_URL } from './base';

export class AuthApi {
  async LoginUser(data: {
    email: string;
    password: string;
  }) {
    const payload = {
      email: data.email,
      password: data.password,
    };
    const response = await axios.post(`${BASE_URL}/api/auth/login`, payload);

    // Store access token in cookie if login is successful
    if (response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      response.data.success &&
      'data' in response.data &&
      response.data.data &&
      typeof response.data.data === 'object' &&
      'accessToken' in response.data.data) {
      setAccessToken(response.data.data.accessToken as string);
    }
    console.log(response)
    return response;
  }

  async LoginAdmin(data: {
    email: string;
    password: string;
  }) {
    const payload = {
      email: data.email,
      password: data.password,
    };
    const response = await axios.post(`${BASE_URL}/api/admin/login`, payload);

    // Store access token in cookie if login is successful
    if (response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      response.data.success &&
      'data' in response.data &&
      response.data.data &&
      typeof response.data.data === 'object' &&
      'accessToken' in response.data.data) {
      setAccessToken(response.data.data.accessToken as string);
    }
    console.log(response)
    return response;
  }

  // Method to logout and clear token
  async logout() {
    try {
      const token = getAccessToken();
      if (token) {
        // Call logout endpoint with token and timeout to prevent hanging
        await Promise.race([
          axios.post(`${BASE_URL}/api/auth/logout`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Logout timeout')), 5000)
          )
        ]);
      }
    } catch (err: any) {
      console.error("Error during logout:", err);
      // Continue with local logout even if API call fails or times out
    } finally {
      // Always remove token locally
      removeAccessToken();
    }
  }

  // Method to request password reset
  async requestPasswordReset(email: string, userType: "student" | "staff") {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/password/reset-request`, {
        email,
        userType
      });
      return response;
    } catch (err: any) {
      console.error("Error requesting password reset:", err);
      throw err;
    }
  }

  // Method to reset password with token
  async resetPassword(token: string, newPassword: string, userType: string) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/password/reset`, {
        token,
        newPassword,
        userType
      });
      return response;
    } catch (err: any) {
      console.error("Error resetting password:", err);
      throw err;
    }
  }

  // Method to get user profile
  async getUserProfile() {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response;
    } catch (err: any) {
      console.error("Error getting user profile:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }

  async Getsessions() {
    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.get(`${BASE_URL}/api/semesters/get-semesters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response;

    } catch (err: any) {
      console.error("Error during getting sessions:", err);

      if (err.response?.status === 401) {
        removeAccessToken();
      }
      return err;
    }
  }

  // Method to update student profile
  async updateStudentProfile(data: {
    fname: string;
    lname: string;
    mname?: string;
    phone?: string;
    address?: string;
    dob?: string;
    country?: string;
    state_origin?: string;
    lcda?: string;
    currency?: string;
  }) {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.put(`${BASE_URL}/api/auth/profile/student`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (err: any) {
      console.error("Error updating student profile:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }

  // Method to upload a single KYC document
  async uploadKycDocument(
    documentType: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const formData = new FormData();
      formData.append("document_type", documentType);
      formData.append("file", file);

      const response = await axios.post(
        `${BASE_URL}/api/student/kyc/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        } as any
      );

      return response;
    } catch (err: any) {
      console.error("Error uploading KYC document:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }

  // Method to upload profile image
  async uploadProfileImage(
    file: File,
    onProgress?: (progress: number) => void
  ) {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${BASE_URL}/api/student/kyc/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        } as any
      );

      return response;
    } catch (err: any) {
      console.error("Error uploading profile image:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }

  // Method to get KYC documents
  async getKycDocuments() {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.get(`${BASE_URL}/api/student/kyc/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (err: any) {
      console.error("Error fetching KYC documents:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }

  // Method to update school information
  async updateSchoolInformation(data: {
    school1?: string;
    school1_date?: string;
    school2?: string;
    school2_date?: string;
    school?: string;
    school_date?: string;
  }) {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.put(
        `${BASE_URL}/api/student/kyc/schools`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response;
    } catch (err: any) {
      console.error("Error updating school information:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }

  // Method to register a new student
  async RegisterStudent(data: {
    email: string;
    password: string;
    fname: string;
    lname: string;
    phone: string;
    level: string;
    program_id: number;
    currency: string;
    referral_code: string;
    designated_institute: number;
    foreign_student: number;
  }) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register/student`, data);
      return response;
    } catch (err: any) {
      console.error("Error registering student:", err);
      throw err;
    }
  }

  // Method to register a new staff
  async RegisterStaff(data: {
    email: string;
    password: string;
    fname: string;
    lname: string;
    phone: string;
    department: string;
  }) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register/staff`, data);
      return response;
    } catch (err: any) {
      console.error("Error registering staff:", err);
      throw err;
    }
  }

  // Method to update staff profile
  async updateStaffProfile(data: {
    fname?: string;
    lname?: string;
    phone?: string;
    linkedin?: string;
    google_scholar?: string;
    research_areas?: string;
    home_address?: string;
  }) {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.put(`${BASE_URL}/api/auth/profile/staff`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (err: any) {
      console.error("Error updating staff profile:", err);
      if (err.response?.status === 401) {
        removeAccessToken();
      }
      throw err;
    }
  }
}
