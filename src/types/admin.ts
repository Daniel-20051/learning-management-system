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

export interface Exam {
  id: number;
  course_id: number;
  academic_year?: string;
  semester?: string;
  title: string;
  instructions?: string;
  start_at?: string;
  end_at?: string;
  duration_minutes: number;
  visibility?: "draft" | "published" | "archived";
  randomize?: boolean;
  exam_type?: "objective" | "theory" | "mixed";
  selection_mode?: "all" | "random";
  objective_count?: number;
  theory_count?: number;
  description?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at?: string;
  total_questions?: number;
  attempts_count?: number;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay" | "short_answer";
  points: number;
  order: number;
  options?: ExamQuestionOption[];
  correct_answer?: string;
  created_at: string;
}

export interface ExamQuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  order: number;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: number;
  started_at: string;
  submitted_at?: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  status: "in_progress" | "submitted" | "graded";
  answers?: ExamAnswer[];
}

export interface ExamAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  selected_option_ids?: number[];
  points_earned?: number;
  is_correct?: boolean;
}

export interface ExamStats {
  exam_id: number;
  total_attempts: number;
  completed_attempts: number;
  average_score?: number;
  highest_score?: number;
  lowest_score?: number;
  pass_rate?: number;
  completion_rate: number;
  question_stats?: Array<{
    question_id: number;
    correct_count: number;
    total_attempts: number;
    difficulty_level: "easy" | "medium" | "hard";
  }>;
}

export type MenuItem = "dashboard" | "courses" | "results" | "discussions" | "exams"; 