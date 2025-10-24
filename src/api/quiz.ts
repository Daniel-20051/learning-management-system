import axios from 'axios';
import { BASE_URL, getAuthHeaders } from './base';

export class QuizApi {
  // Quiz creation API method
  async CreateQuiz(data: {
    title: string;
    module_id: number;
    duration_minutes: number;
    description: string;
    status: string;
  }) {
    try {
      const response = await axios.post(`${BASE_URL}/api/quiz/create-quiz`, data, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      return response;
    } catch (err: any) {
      console.error("Error during creating quiz:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  async GetQuiz(courseId?: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/quiz?course_id=${courseId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      console.error("Error during getting quizzes:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  async GetQuizById(quizId: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/quiz/${quizId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      console.error("Error during getting quiz by id:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Add questions to a quiz
  async AddQuizQuestions(quizId: number, questions: any[]) {
    try {
      const response = await axios.post(`${BASE_URL}/api/quiz/${quizId}/questions-batch`, {
        questions: questions
      }, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
     
      return response;
    } catch (err: any) {
      console.error("Error during adding quiz questions:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Delete a quiz by ID
  async DeleteQuiz(quizId: number) {
    try {
      const response = await axios.delete(`${BASE_URL}/api/quiz/${quizId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      console.error("Error during deleting quiz:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Update a quiz by ID
  async UpdateQuiz(quizId: number, data: {
    title?: string;
    duration_minutes?: number;
    status?: string;
    description?: string;
  }) {
    try {
      const response = await axios.patch(`${BASE_URL}/api/quiz/${quizId}/update`, {
        quiz: data
      }, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (err: any) {
      console.error("Error during updating quiz:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Update quiz questions
  async UpdateQuizQuestions(quizId: number, questions: any[]) {
    try {
      const response = await axios.patch(`${BASE_URL}/api/quiz/${quizId}/update`, {
        questions: questions
      }, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (err: any) {
      console.error("Error during updating quiz questions:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Start a quiz attempt
  async StartQuizAttempt(quizId: number) {
    try {
      const response = await axios.post(`${BASE_URL}/api/quiz/${quizId}/attempts`, {}, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      console.error("Error during starting quiz attempt:", err);
      throw err;
    }
  }

  // Save quiz answers as user answers questions
  async SaveQuizAnswers(attemptId: number, data: { answers: { question_id: number; selected_option_id: number }[] }) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/quiz/attempts/${attemptId}/answers`,
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
      console.error("Error during saving quiz answers:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  // Submit an in-progress quiz attempt
  async SubmitQuizAttempt(attemptId: number, data: { answers: { question_id: number; selected_option_ids: number[] }[] }) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/quiz/attempts/${attemptId}/submit`,
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
      console.error("Error during submitting quiz attempt:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

  async GetQuizStats(quizId?: number) {
    try {
      const response = await axios.get(`${BASE_URL}/api/quiz/${quizId}/stats`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      console.error("Error during getting quiz stats:", err);
      if (err.response?.status === 401) {
        // Handle 401 error
      }
      throw err;
    }
  }

   // Get the student's latest attempt details for a quiz
   async GetMyLatestAttempt(quizId: number) {
     try {
       const response = await axios.get(`${BASE_URL}/api/quiz/${quizId}/my-latest`, {
         headers: getAuthHeaders()
       });
       
       return response;
     } catch (err: any) {
       console.error("Error during getting latest attempt:", err);
       if (err.response?.status === 401) {
         // Handle 401 error
       }
       throw err;
     }
   }
}

// Export standalone functions for backward compatibility
export async function CreateQuiz(data: {
  title: string;
  module_id: number;
  duration_minutes: number;
  description: string;
  status: string;
}) {
  const api = new QuizApi();
  return api.CreateQuiz(data);
}

export async function GetQuiz(courseId?: number) {
  const api = new QuizApi();
  return api.GetQuiz(courseId);
}

export async function GetQuizById(quizId: number) {
  const api = new QuizApi();
  return api.GetQuizById(quizId);
}

export async function AddQuizQuestions(quizId: number, questions: any[]) {
  const api = new QuizApi();
  return api.AddQuizQuestions(quizId, questions);
}

export async function DeleteQuiz(quizId: number) {
  const api = new QuizApi();
  return api.DeleteQuiz(quizId);
}

export async function UpdateQuiz(quizId: number, data: {
  title?: string;
  duration_minutes?: number;
  status?: string;
  description?: string;
}) {
  const api = new QuizApi();
  return api.UpdateQuiz(quizId, data);
}

export async function UpdateQuizQuestions(quizId: number, questions: any[]) {
  const api = new QuizApi();
  return api.UpdateQuizQuestions(quizId, questions);
}

export async function StartQuizAttempt(quizId: number) {
  const api = new QuizApi();
  return api.StartQuizAttempt(quizId);
}

export async function SaveQuizAnswers(attemptId: number, data: { answers: { question_id: number; selected_option_id: number }[] }) {
  const api = new QuizApi();
  return api.SaveQuizAnswers(attemptId, data);
}

export async function SubmitQuizAttempt(attemptId: number, data: { answers: { question_id: number; selected_option_ids: number[] }[] }) {
  const api = new QuizApi();
  return api.SubmitQuizAttempt(attemptId, data);
}

export async function GetQuizStats(quizId?: number) {
  const api = new QuizApi();
  return api.GetQuizStats(quizId);
}

export async function GetMyLatestAttempt(quizId: number) {
  const api = new QuizApi();
  return api.GetMyLatestAttempt(quizId);
}
