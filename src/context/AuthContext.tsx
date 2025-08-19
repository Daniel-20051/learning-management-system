import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const isAdmin = user?.role === "staff";

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (savedIsLoggedIn && savedUser) {
        setIsLoggedIn(true);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      // Ignore storage errors and start unauthenticated
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
