/**
 * Cookie utility functions for managing access tokens
 */

/**
 * Set a cookie with expiration time
 * @param name - Cookie name
 * @param value - Cookie value
 * @param hours - Expiration time in hours (default: 4 hours)
 */
export const setCookie = (name: string, value: string, hours: number = 4): void => {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Convert hours to milliseconds
  const expires = `expires=${date.toUTCString()}`;
  
  // Set cookie with secure and sameSite attributes for better security
  document.cookie = `${name}=${value};${expires};path=/;secure;samesite=strict`;
};

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

/**
 * Delete a cookie by name
 * @param name - Cookie name
 */
export const deleteCookie = (name: string): void => {
  // Delete cookie with multiple path variations to ensure complete removal
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname}`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${window.location.hostname}`;
};

/**
 * Check if a cookie exists and is not expired
 * @param name - Cookie name
 * @returns boolean indicating if cookie exists and is valid
 */
export const isCookieValid = (name: string): boolean => {
  const cookie = getCookie(name);
  return cookie !== null && cookie !== '';
};

// Token-specific functions
export const TOKEN_COOKIE_NAME = 'access_token';

/**
 * Store access token in cookie for 4 hours
 * @param token - Access token to store
 */
export const setAccessToken = (token: string): void => {
  setCookie(TOKEN_COOKIE_NAME, token, 4);
};

/**
 * Get access token from cookie
 * @returns Access token or null if not found/expired
 */
export const getAccessToken = (): string | null => {
  return getCookie(TOKEN_COOKIE_NAME);
};

/**
 * Remove access token from cookie
 */
export const removeAccessToken = (): void => {
  deleteCookie(TOKEN_COOKIE_NAME);
};

/**
 * Check if access token exists and is valid
 * @returns boolean indicating if token is available
 */
export const hasValidToken = (): boolean => {
  return isCookieValid(TOKEN_COOKIE_NAME);
};

// User data specific functions
export const USER_COOKIE_NAME = 'user_data';
export const LOGIN_STATE_COOKIE_NAME = 'is_logged_in';

/**
 * Store user data in cookie
 * @param user - User object to store
 */
export const setUserData = (user: any): void => {
  const userData = JSON.stringify(user);
  setCookie(USER_COOKIE_NAME, userData, 4);
};

/**
 * Get user data from cookie
 * @returns User object or null if not found/expired
 */
export const getUserData = (): any | null => {
  const userData = getCookie(USER_COOKIE_NAME);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data from cookie:', error);
    return null;
  }
};

/**
 * Remove user data from cookie
 */
export const removeUserData = (): void => {
  deleteCookie(USER_COOKIE_NAME);
};

/**
 * Store login state in cookie
 * @param isLoggedIn - Login state boolean
 */
export const setLoginState = (isLoggedIn: boolean): void => {
  setCookie(LOGIN_STATE_COOKIE_NAME, isLoggedIn.toString(), 4);
};

/**
 * Get login state from cookie
 * @returns boolean indicating login state
 */
export const getLoginState = (): boolean => {
  const loginState = getCookie(LOGIN_STATE_COOKIE_NAME);
  return loginState === 'true';
};

/**
 * Remove login state from cookie
 */
export const removeLoginState = (): void => {
  deleteCookie(LOGIN_STATE_COOKIE_NAME);
};

/**
 * Check if user has valid session (both token and user data exist)
 * @returns boolean indicating if user has complete valid session
 */
export const hasValidSession = (): boolean => {
  return hasValidToken() && getUserData() !== null && getLoginState();
};

/**
 * Complete logout - removes all auth-related cookies
 */
export const clearAllAuthCookies = (): void => {
  removeAccessToken();
  removeUserData();
  removeLoginState();
};

/**
 * Debug function to check all cookies
 * @returns string of all cookies for debugging
 */
export const debugCookies = (): string => {
  return document.cookie;
};
