import axios  from 'axios';
import { setAccessToken, getAccessToken, removeAccessToken } from '../lib/cookies';

const BASE_URL = 'https://lms-work.onrender.com';

const token = getAccessToken();
export class Api {
    async LoginUser(data:{
        email: string;
        password: string;
    }) {
        try{
          const payload = {
            email: data.email,
            password: data.password,
          }
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
          
          
          return response;

        }catch(err: any){
          console.error("Error during login:", err);
          return err;
        }
    }
    async GetCourses(session: string, semester: string) {
      try{
        
        
        if (!token) {
          throw new Error("No access token found. Please login again.");
        }

        const response = await axios.get(`${BASE_URL}/api/courses/student/${session}/${semester}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        
        return response;

      }catch(err: any){
        console.error("Error during getting courses:", err);
        
        if (err.response?.status === 401) {
          removeAccessToken();
          console.log("Token expired or invalid, removed from cookie");
        }
        return err;
      }
  }

  // Method to logout and clear token
  async logout() {
    removeAccessToken();
  }
}

