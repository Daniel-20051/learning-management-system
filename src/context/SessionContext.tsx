import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface SessionContextType {
  selectedSession: string;
  selectedSemester: string;
  setSelectedSession: (session: string) => void;
  setSelectedSemester: (semester: string) => void;
  setSessionAndSemester: (session: string, semester: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const setSessionAndSemester = (session: string, semester: string) => {
    setSelectedSession(session);
    setSelectedSemester(semester);
  };

  const value: SessionContextType = {
    selectedSession,
    selectedSemester,
    setSelectedSession,
    setSelectedSemester,
    setSessionAndSemester,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
