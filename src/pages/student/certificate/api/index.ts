import axios  from 'axios';
import { setAccessToken, getAccessToken, removeAccessToken } from '../../../../lib/cookies';

// Global interceptor: if any request returns 401, remove token and notify app
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        removeAccessToken();
        // Notify AuthContext (and other listeners) to logout immediately
        window.dispatchEvent(new Event('auth:token-removed'));
      } catch {}
    }
    return Promise.reject(error);
  }
);

const BASE_URL = 'https://lms-work.onrender.com';