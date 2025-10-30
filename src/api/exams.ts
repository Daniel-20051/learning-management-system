import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export class ExamsApi {
  // Exam management API methods
  async GetStaffExams() {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting staff exams");
    }
  }

  async GetExams(courseId: number, page: number = 1, limit: number = 20) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams?course_id=${courseId}&page=${page}&limit=${limit}`, {
        headers: getAuthHeaders()
      });
      console.log(response)
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting exams");
    }
  }

  async CreateExam(data: {
    course_id: number;
    academic_year?: string;
    semester?: string;
    title: string;
    instructions?: string;
    start_at?: string;
    end_at?: string;
    duration_minutes: number;
    visibility?: string;
    randomize?: boolean;
    exam_type?: string;
    selection_mode?: string;
    objective_count?: number;
    theory_count?: number;
    description?: string;
    status: string;
  }) {
    try {
      const response = await axios.post(`${BASE_URL}/api/exams`, data, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      return response;
    } catch (err: any) {
      return handleApiError(err, "creating exam");
    }
  }

  async UpdateExam(examId: number, data: {
    title?: string;
    instructions?: string;
    start_at?: string;
    end_at?: string;
    duration_minutes?: number;
    visibility?: string;
    randomize?: boolean;
    exam_type?: string;
    selection_mode?: string;
    objective_count?: number;
    theory_count?: number;
    description?: string;
    status?: string;
  }) {
    try {
      const response = await axios.put(`${BASE_URL}/api/exams/${examId}`, data, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "updating exam");
    }
  }

  async DeleteExam(examId: number) {
    try {
      const response = await axios.delete(`${BASE_URL}/api/exams/${examId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "deleting exam");
    }
  }

  async GetExamById(examId: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/${examId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting exam by id");
    }
  }

  // Get question bank for exam creation
  async GetBankQuestions(courseId: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/bank/questions/${courseId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting bank questions");
    }
  }

  // Add objective question to question bank
  async AddObjectiveQuestion(data: {
    course_id: number;
    question_text: string;
    options: Array<{ id: string; text: string }>;
    correct_option: string;
    marks: number;
  }) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/exams/bank/questions/objective`,
        data,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (err: any) {
      console.error("Error adding objective question:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Add theory question to question bank
  async AddTheoryQuestion(data: {
    course_id: number;
    question_text: string;
    max_marks: number;
    difficulty?: string;
    topic?: string;
  }) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/exams/bank/questions/theory`,
        data,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (err: any) {
      console.error("Error adding theory question:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Get all attempts for an exam (for grading)
  async GetExamAttempts(examId: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/${examId}/attempts`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting exam attempts");
    }
  }

  // Get specific attempt for grading
  async GetAttemptForGrading(attemptId: number) {
    try {
      const url = `${BASE_URL}/api/exams/attempts/${attemptId}/grade`;
      
      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      
      console.log(response);
      return response;
    } catch (err: any) {
      console.error("Error during getting attempt for grading:", err);
      console.log("Error response data:", err.response?.data);
      console.log("Error response status:", err.response?.status);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Grade a single theory answer
  async GradeTheoryAnswer(answerId: number, score: number, feedback?: string) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/exams/answers/theory/${answerId}/grade`,
        { score, feedback },
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (err: any) {
      return handleApiError(err, "grading theory answer");
    }
  }

  // Bulk grade theory answers
  async BulkGradeTheoryAnswers(attemptId: number, grades: { answer_id: number; awarded_score: number; feedback?: string }[]) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/exams/attempts/${attemptId}/grade-bulk`,
        { grades },
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (err: any) {
      return handleApiError(err, "bulk grading");
    }
  }

  // Get exam statistics
  async GetExamStatistics(examId: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/${examId}/statistics`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting exam statistics");
    }
  }

  // Get student exams for a course
  async GetStudentExams(courseId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/student/exams?course_id=${courseId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting student exams");
    }
  }

  // Start an exam
  async StartExam(examId: number) {
    try {
      const response = await axios.post(`${BASE_URL}/api/exams/student/exams/${examId}/start`, {}, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      // Enhanced error handling for exam start
      const enhancedError = handleApiError(err, `starting exam ${examId}`);
      
      // Add specific context for exam start errors
      if (err.response?.data) {
        console.error("Exam start error details:", {
          examId,
          errorData: err.response.data,
          timestamp: new Date().toISOString()
        });
      }
      
      // Re-throw the error to maintain the existing error handling flow
      throw enhancedError;
    }
  }

  // Submit exam answer
  async SubmitExamAnswer(attemptId: number, payload: {
    exam_item_id: number;
    answer_type: "objective" | "theory";
    selected_option?: string;
    answer_text?: string;
  }) {
    try {
      const response = await axios.post(`${BASE_URL}/api/exams/student/exams/attempts/${attemptId}/answer`, payload, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      console.log(response);
      return response;
    } catch (err: any) {
      return handleApiError(err, "submitting exam answer");
    }
  }

  // Submit completed exam
  async SubmitExam(attemptId: number) {
    try {
      const response = await axios.post(`${BASE_URL}/api/exams/student/exams/attempts/${attemptId}/submit`, {}, {
        headers: getAuthHeaders()
      });
      console.log(response);
      return response;
    } catch (err: any) {
      return handleApiError(err, "submitting exam");
    }
  }

  // Get student's exam attempt history
  async GetStudentExamAttempts(page: number = 1, limit: number = 20) {
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/student/attempts?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting student exam attempts");
    }
  }
}

// Export standalone functions for backward compatibility
export async function GetStaffExams() {
  const api = new ExamsApi();
  return api.GetStaffExams();
}

export async function GetExams(courseId: number, page: number = 1, limit: number = 20) {
  const api = new ExamsApi();
  return api.GetExams(courseId, page, limit);
}

export async function CreateExam(data: {
  course_id: number;
  academic_year?: string;
  semester?: string;
  title: string;
  instructions?: string;
  start_at?: string;
  end_at?: string;
  duration_minutes: number;
  visibility?: string;
  randomize?: boolean;
  exam_type?: string;
  selection_mode?: string;
  objective_count?: number;
  theory_count?: number;
  description?: string;
  status: string;
}) {
  const api = new ExamsApi();
  return api.CreateExam(data);
}

export async function UpdateExam(examId: number, data: {
  title?: string;
  instructions?: string;
  start_at?: string;
  end_at?: string;
  duration_minutes?: number;
  visibility?: string;
  randomize?: boolean;
  exam_type?: string;
  selection_mode?: string;
  objective_count?: number;
  theory_count?: number;
  description?: string;
  status?: string;
}) {
  const api = new ExamsApi();
  return api.UpdateExam(examId, data);
}

export async function DeleteExam(examId: number) {
  const api = new ExamsApi();
  return api.DeleteExam(examId);
}

export async function GetExamById(examId: number) {
  const api = new ExamsApi();
  return api.GetExamById(examId);
}

export async function GetBankQuestions(courseId: number) {
  const api = new ExamsApi();
  return api.GetBankQuestions(courseId);
}

export async function AddObjectiveQuestion(data: {
  course_id: number;
  question_text: string;
  options: Array<{ id: string; text: string }>;
  correct_option: string;
  marks: number;
}) {
  const api = new ExamsApi();
  return api.AddObjectiveQuestion(data);
}

export async function AddTheoryQuestion(data: {
  course_id: number;
  question_text: string;
  max_marks: number;
  difficulty?: string;
  topic?: string;
}) {
  const api = new ExamsApi();
  return api.AddTheoryQuestion(data);
}

export async function GetExamAttempts(examId: number) {
  const api = new ExamsApi();
  return api.GetExamAttempts(examId);
}

export async function GetAttemptForGrading(attemptId: number) {
  const api = new ExamsApi();
  return api.GetAttemptForGrading(attemptId);
}

export async function GradeTheoryAnswer(answerId: number, score: number, feedback?: string) {
  const api = new ExamsApi();
  return api.GradeTheoryAnswer(answerId, score, feedback);
}

export async function BulkGradeTheoryAnswers(attemptId: number, grades: { answer_id: number; awarded_score: number; feedback?: string }[]) {
  const api = new ExamsApi();
  return api.BulkGradeTheoryAnswers(attemptId, grades);
}

export async function GetExamStatistics(examId: number) {
  const api = new ExamsApi();
  return api.GetExamStatistics(examId);
}

export async function GetStudentExams(courseId: string) {
  const api = new ExamsApi();
  return api.GetStudentExams(courseId);
}

export async function StartExam(examId: number) {
  const api = new ExamsApi();
  return api.StartExam(examId);
}

export async function SubmitExamAnswer(attemptId: number, payload: {
  exam_item_id: number;
  answer_type: "objective" | "theory";
  selected_option?: string;
  answer_text?: string;
}) {
  const api = new ExamsApi();
  return api.SubmitExamAnswer(attemptId, payload);
}

export async function SubmitExam(attemptId: number) {
  const api = new ExamsApi();
  return api.SubmitExam(attemptId);
}

export async function GetStudentExamAttempts(page: number = 1, limit: number = 20) {
  const api = new ExamsApi();
  return api.GetStudentExamAttempts(page, limit);
}
