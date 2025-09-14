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

export interface Unit {
  id: string;
  title: string;
  type: "video" | "text" | "quiz" ;
  duration?: string;
  content?: string;
  order: number;
}

export type MenuItem = "dashboard" | "courses" ; 