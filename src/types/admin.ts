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