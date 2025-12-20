import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import {
  hasValidToken,
  getUserData,
  getLoginState,
  clearAllAuthCookies,
  setUserData
} from "../lib/cookies";

interface User {
  id: string;
  email: string;
  name: string;
  role: "staff" | "student" | "super_admin";
  permissions?: any;
  userType?: string;
  status?: string;
  profileImage?: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitializing: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const isLoggingOutRef = useRef(false);

  const isAdmin = user?.role === "staff";
  const isSuperAdmin = user?.role === "super_admin";


  const logout = useCallback(async () => {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOutRef.current) {
      return;
    }

    // Check if we're actually logged in before proceeding
    const wasLoggedIn = isLoggedIn;
    
    isLoggingOutRef.current = true;

    try {
      // Call the API logout endpoint
      const { AuthApi } = await import("../api/auth");
      const authApi = new AuthApi();
      await authApi.logout();
    } catch (err) {
      console.error("Error calling logout API:", err);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local state
      clearAllAuthCookies();
      setIsLoggedIn(false);
      setUser(null);

      // Dispatch custom event for cross-tab logout synchronization
      // Only dispatch if we were actually logged in to prevent loops
      if (wasLoggedIn) {
        // Use setTimeout to ensure state updates are processed first
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("auth:token-removed"));
        }, 0);
      }

      isLoggingOutRef.current = false;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = getUserData();
        const savedIsLoggedIn = getLoginState();
        const hasToken = hasValidToken();

        // Check if user is logged in and has a valid token
        if (savedIsLoggedIn && savedUser && hasToken) {
          setIsLoggedIn(true);
          
          // If profileImage is missing, try to fetch it from the API
          if (!savedUser.profileImage) {
            try {
              const { AuthApi } = await import("../api/auth");
              const authApi = new AuthApi();
              const profileResponse: any = await authApi.getUserProfile();
              const profileData = profileResponse?.data?.data?.user || profileResponse?.data?.user;
              
              // Handle both camelCase and snake_case field names
              const profileImageUrl = profileData?.profileImage || profileData?.profile_image;
              
              if (profileImageUrl) {
                const updatedUser = {
                  ...savedUser,
                  profileImage: profileImageUrl,
                };
                setUser(updatedUser);
                // Update cookie with profile image
                setUserData(updatedUser);
              } else {
                setUser(savedUser);
              }
            } catch (err) {
              console.error("Error fetching profile image:", err);
              // Still set user even if profile fetch fails
              setUser(savedUser);
            }
          } else {
            setUser(savedUser);
          }
        } else if (savedIsLoggedIn && !hasToken) {
          // Token expired, logout user
          logout();
        }
      } catch (error) {
        // Ignore cookie errors and start unauthenticated
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [logout]);

  // Proactively detect token removal/expiry without requiring a page refresh
  useEffect(() => {
    // Periodic check in case the cookie expires naturally
    const intervalId = window.setInterval(() => {
      if (isLoggedIn && !hasValidToken() && !isLoggingOutRef.current) {
        logout();
      }
    }, 15000); // check every 15s

    // Listen for explicit logout signals from API layer or other tabs
    const handleAuthTokenRemoved = () => {
      // Only logout if we're actually logged in and not already logging out
      // This prevents infinite loops when logout() dispatches the event
      if (isLoggedIn && !isLoggingOutRef.current) {
        logout();
      }
    };

    // Listen for explicit logout signals from API layer or other tabs
    window.addEventListener(
      "auth:token-removed",
      handleAuthTokenRemoved as EventListener
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "auth:token-removed",
        handleAuthTokenRemoved as EventListener
      );
    };
  }, [isLoggedIn, logout]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isAdmin,
        isSuperAdmin,
        isInitializing,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
