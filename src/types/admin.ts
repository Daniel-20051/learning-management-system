export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published" | "archived";
  modules: Module[];
  enrolledStudents: number;
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  units: Unit[];
  order: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  status: "draft" | "published";
  module_id: number;
  module_title?: string;
  attempts_allowed: number;
  created_at: string;
  created_by: number;
  questions: any[];
}

export interface QuizStats {
  average_score?: number;
  max_possible_score?: number;
  quiz_id?: number;
  submitted_attempts?: number;
  distribution?: {
    "0-39"?: number;
    "40-49"?: number;
    "50-59"?: number;
    "60-69"?: number;
    "70-100"?: number;
  };
  participation?: {
    completion_rate?: number;
    total_attempted?: number;
    total_enrolled?: number;
  };
  questions_insights?: Array<{
    question_id: number;
    correct_rate: number;
  }>;
  students?: Array<{
    student_id: number;
    full_name: string;
    email: string;
    attempt_id?: number;
    total_score?: number;
    max_score?: number;
    percentage?: number;
    started_at?: string;
    submitted_at?: string;
  }>;
  message?: string;
  status?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  type: "video" | "text" | "quiz" ;
  duration?: string;
  content?: string;
  order: number;
}

export type MenuItem = "dashboard" | "courses" | "results" | "discussions"; 