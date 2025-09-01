import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { hasValidToken, removeAccessToken } from "../lib/cookies";

interface User {
  id: string;
  email: string;
  name: string;
  role: "staff" | "student";
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
  isInitializing: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const isAdmin = user?.role === "staff";

  const logout = () => {
    removeAccessToken();
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const hasToken = hasValidToken();

      // Check if user is logged in and has a valid token
      if (savedIsLoggedIn && savedUser && hasToken) {
        setIsLoggedIn(true);
        setUser(JSON.parse(savedUser));
      } else if (savedIsLoggedIn && !hasToken) {
        // Token expired, logout user
        logout();
      }
    } catch (error) {
      // Ignore storage errors and start unauthenticated
      logout();
    } finally {
      setIsInitializing(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isAdmin,
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
