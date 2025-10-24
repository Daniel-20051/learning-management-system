import React, { createContext, useContext, useState } from "react";

type Unit = {
  id: string;
  title: string;
  content: string;
  content_type: string;
  order: number;
  status: string;
  video_url?: string;
  module_id: string;
  created_at: string;
  updated_at: string;
};

type Module = {
  id: string;
  title: string;
  description: string;
  course_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  units: Unit[];
  quiz?: any[]; // TODO: Define proper quiz type when quiz endpoint is available
};

type SidebarSelectionContextType = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  module: number;
  setModule: (module: number) => void;
  courseId: string | null;
  setCourseId: (courseId: string) => void;
  modules: Module[];
  setModules: (modules: Module[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  selectedQuiz: any | null;
  setSelectedQuiz: (quiz: any | null) => void;
  quizzes: any[];
  setQuizzes: (quizzes: any[]) => void;
  selectedExams: boolean;
  setSelectedExams: (exams: boolean) => void;
};

const SidebarSelectionContext = createContext<
  SidebarSelectionContextType | undefined
>(undefined);

export const SidebarSelectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [module, setModule] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedExams, setSelectedExams] = useState(false);

  return (
    <SidebarSelectionContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        module,
        setModule,
        courseId,
        setCourseId,
        modules,
        setModules,
        isLoading,
        setIsLoading,
        selectedQuiz,
        setSelectedQuiz,
        quizzes,
        setQuizzes,
        selectedExams,
        setSelectedExams,
      }}
    >
      {children}
    </SidebarSelectionContext.Provider>
  );
};

export const useSidebarSelection = () => {
  const context = useContext(SidebarSelectionContext);
  if (!context) {
    throw new Error(
      "useSidebarSelection must be used within a SidebarSelectionProvider"
    );
  }
  return context;
};
