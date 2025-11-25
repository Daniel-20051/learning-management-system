import axios from 'axios';
import { setAccessToken, removeAccessToken } from '../lib/cookies';
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
        // Call logout endpoint with token
        await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err: any) {
      console.error("Error during logout:", err);
      // Continue with local logout even if API call fails
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
    phone?: string;
    address?: string;
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
}

// Import getAccessToken for use in this file
import { getAccessToken } from '../lib/cookies';
