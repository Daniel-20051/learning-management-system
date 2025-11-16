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
    removeAccessToken();
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
}

// Import getAccessToken for use in this file
import { getAccessToken } from '../lib/cookies';
