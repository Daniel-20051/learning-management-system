import axios  from 'axios';
import { setAccessToken, getAccessToken, removeAccessToken } from '../lib/cookies';

// Global interceptor: if any request returns 401, remove token and notify app
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        removeAccessToken();
        // Notify AuthContext (and other listeners) to logout immediately
        window.dispatchEvent(new Event('auth:token-removed'));
      } catch {}
    }
    return Promise.reject(error);
  }
);

const BASE_URL = 'https://lms-work.onrender.com';
export class Api {
    async LoginUser(data:{
        email: string;
        password: string;
    }) {
        try{
          const payload = {
            email: data.email,
            password: data.password,
          }
          const response = await axios.post(`${BASE_URL}/api/auth/login`, payload);
          
          // Store access token in cookie if login is successful
          if (response.data && 
              typeof response.data === 'object' && 
              'success' in response.data && 
              response.data.success && 
              'data' in response.data && 
              response.data.data && 
              typeof response.data.data === 'object' && 
              'accessToken' in response.data.data) {
            setAccessToken(response.data.data.accessToken as string);
          }
          
          
          return response;

        }catch(err: any){
          console.error("Error during login:", err);
          return err;
        }
    }
    async GetCourses(session: string, semester: string) {
      try{
        
        
        // Always fetch the latest token at request time
        const token = getAccessToken();

        if (!token) {
          throw new Error("No access token found. Please login again.");
        }

        const response = await axios.get(`${BASE_URL}/api/courses/student/${session}/${semester}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
       
        return response;

      }catch(err: any){
        console.error("Error during getting courses:", err);
        
        if (err.response?.status === 401) {
          removeAccessToken();
          console.log("Token expired or invalid, removed from cookie");
        }
        return err;
      }
  }

  // Method to logout and clear token
  async logout() {
    removeAccessToken();
  }
  async Getsessions() {
    try{
      const token = getAccessToken();

      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await axios.get(`${BASE_URL}/api/semesters/get-semesters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      return response;

    }catch(err: any){
      console.error("Error during getting sessions:", err);
      
      if (err.response?.status === 401) {
        removeAccessToken();
        console.log("Token expired or invalid, removed from cookie");
      }
      return err;
    }
}
async GetStaffCourses(session: string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await axios.get(`${BASE_URL}/api/courses/staff/${session}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response;

  }catch(err: any){
    console.error("Error during getting courses:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async GetStaffCoursesbyId(id :string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await axios.get(`${BASE_URL}/api/courses/single/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    
    return response;

  }catch(err: any){
    console.error("Error during getting courses:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async GetCourseModules(courseId: string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await axios.get(`${BASE_URL}/api/courses/${courseId}/modules`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    

    return response;

  }catch(err: any){
    console.error("Error during getting course modules:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async AddModule(courseId: string, title: string, description: string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const payload = {
      course_id: courseId,
      title: title,
      description: description,
      status: "uncompleted"
    } 

    const response = await axios.post(`${BASE_URL}/api/courses/${courseId}/modules`,
      payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    
    console.log(response);
    return response;

  }catch(err: any){
    console.error("Error during adding course modules:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async DeleteModule(moduleId: string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    

    const response = await axios.delete(`${BASE_URL}/api/modules/${moduleId}`,
      
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    
   
    return response;

  }catch(err: any){
    console.error("Error during adding course modules:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async AddUnit(moduleId: string, data: {title: string, content: string, content_type: string, order: number, status: string}) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const payload = {
      module_id: moduleId,
      title: data.title,
      content: data.content,
      content_type: data.content_type,
      order: data.order,
      status: data.status,
      
    }

    const response = await axios.post(`${BASE_URL}/api/modules/${moduleId}/units`,
       payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    
   
    return response;

  }catch(err: any){
    console.error("Error during adding course units:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async getUnits(moduleId: string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }


    const response = await axios.get(`${BASE_URL}/api/modules/${moduleId}/units`,
      
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    
    console.log(response);
    return response;

  }catch(err: any){
    console.error("Error getting  course units:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async EditUnit(unitId: string, data: {title: string, content: string, video_url?: string}) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const payload: any = {
      title: data.title,
      content: data.content,
    };
    if (data.video_url !== undefined) {
      payload.video_url = data.video_url;
    }

    const response = await axios.patch(`${BASE_URL}/api/units/${unitId}`,
       payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    
   
    return response;

  }catch(err: any){
    console.error("Error during adding course units:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async DeleteUnit(unitId: string) {
  try{
    
    
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

   

    const response = await axios.delete(`${BASE_URL}/api/units/${unitId}`,
       
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    
   
    return response;

  }catch(err: any){
    console.error("Error during deleting course units:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async UploadUnitVideo(moduleId: string, unitId: string, videoFile: File, onProgress?: (progress: number) => void) {
  try{
    
    const formData = new FormData();
     formData.append('video', videoFile);
     
    // Always fetch the latest token at request time
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await axios.post(`${BASE_URL}/api/modules/${moduleId}/units/${unitId}/video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          }
        } as any
    );
    
    return response;

  }catch(err: any){
    console.error("Error during uploading course units video:", err);
    
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}


async GetModuleNotes(moduleId: string) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.get(`${BASE_URL}/api/modules/${moduleId}/note`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during getting unit notes:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async CreateModuleNotes(moduleId: string, data: { note_text: string, title?: string}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const payload: any = {
      note_text: data.note_text
    };
    if (data.title) {
      payload.title = data.title;
    }
    const response = await axios.put(`${BASE_URL}/api/modules/${moduleId}/note`,
      payload, {
      
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during getting unit notes:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async EditModuleNotes(moduleId: string, noteId: string, data: { note_text: string, title?: string}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const payload = {
      note_text: data.note_text,
      title: data.title
    }
    const response = await axios.patch(`${BASE_URL}/api/modules/${moduleId}/notes/${noteId}`,
      payload, {
      
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during getting unit notes:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}
async DeleteModuleNotes(moduleId: string, noteId: string) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    
    const response = await axios.delete(`${BASE_URL}/api/modules/${moduleId}/notes/${noteId}`,
       {
      
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during getting unit notes:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    return err;
  }
}

// Quiz creation API method
async CreateQuiz(data: {
  title: string;
  module_id: number;
  duration_minutes: number;
  description: string;
  status: string;
}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    console.log("Sending quiz data to API:", data);
    
    const response = await axios.post(`${BASE_URL}/api/quiz/create-quiz`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Quiz API response:", response);
    return response;
  } catch (err: any) {
    console.error("Error during creating quiz:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}


async GetQuiz(courseId?: number) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.get(`${BASE_URL}/api/quiz?course_id=${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during getting quizzes:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}

async GetQuizById(quizId: number) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.get(`${BASE_URL}/api/quiz/${quizId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log("Quiz by id response:", response);
    return response;
  } catch (err: any) {
    console.error("Error during getting quiz by id:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}

// Add questions to a quiz
async AddQuizQuestions(quizId: number, questions: any[]) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await axios.post(`${BASE_URL}/api/quiz/${quizId}/questions-batch`, {
      questions: questions
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Quiz questions response:", response);
   
    return response;
  } catch (err: any) {
    console.error("Error during adding quiz questions:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}

// Delete a quiz by ID
async DeleteQuiz(quizId: number) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.delete(`${BASE_URL}/api/quiz/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during deleting quiz:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
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
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.patch(`${BASE_URL}/api/quiz/${quizId}/update`, {
      quiz: data
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during updating quiz:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}

// Update quiz questions
async UpdateQuizQuestions(quizId: number, questions: any[]) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.patch(`${BASE_URL}/api/quiz/${quizId}/update`, {
      questions: questions
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (err: any) {
    console.error("Error during updating quiz questions:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}

// Start a quiz attempt
async StartQuizAttempt(quizId: number) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.post(`${BASE_URL}/api/quiz/${quizId}/attempts`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Quiz attempt response:", response);
    return response;
  } catch (err: any) {
    console.error("Error during starting quiz attempt:", err);
    
    throw err;
  }
}

// Submit an in-progress quiz attempt
async SubmitQuizAttempt(attemptId: number, data: { answers: { question_id: number; selected_option_ids: number[] }[] }) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found. Please login again.");
    }
    const response = await axios.post(
      `${BASE_URL}/api/quiz/attempts/${attemptId}/submit`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Quiz attempt submission response:", response);
    return response;
  } catch (err: any) {
    console.error("Error during submitting quiz attempt:", err);
    if (err.response?.status === 401) {
      removeAccessToken();
      console.log("Token expired or invalid, removed from cookie");
    }
    throw err;
  }
}


}

