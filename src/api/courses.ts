import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export class CoursesApi {
  async GetCourses(session: string, semester: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/student/${session}/${semester}`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "getting courses");
    }
  }

  async GetStaffCourses(session: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/staff/${session}`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "getting staff courses");
    }
  }

  async GetStaffCoursesbyId(id: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/single/${id}`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "getting course by id");
    }
  }

  async GetCourseModules(courseId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/${courseId}/modules`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "getting course modules");
    }
  }

  async AddModule(courseId: string, title: string, description: string) {
    try {
      const payload = {
        course_id: courseId,
        title: title,
        description: description,
        status: "uncompleted"
      };

      const response = await axios.post(`${BASE_URL}/api/courses/${courseId}/modules`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "adding course modules");
    }
  }

  async DeleteModule(moduleId: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/api/modules/${moduleId}`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "deleting course modules");
    }
  }

  async AddUnit(moduleId: string, data: {title: string, content: string, content_type: string, order: number, status: string}) {
    try {
      const payload = {
        module_id: moduleId,
        title: data.title,
        content: data.content,
        content_type: data.content_type,
        order: data.order,
        status: data.status,
      };

      const response = await axios.post(`${BASE_URL}/api/modules/${moduleId}/units`,
         payload,
          {
            headers: getAuthHeaders()
          }
      );
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "adding course units");
    }
  }

  async getUnits(moduleId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/modules/${moduleId}/units`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "getting course units");
    }
  }

  async EditUnit(unitId: string, data: {title: string, content: string, video_url?: string}) {
    try {
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
            headers: getAuthHeaders()
          }
      );
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "editing course units");
    }
  }

  async DeleteUnit(unitId: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/api/units/${unitId}`, {
        headers: getAuthHeaders()
      });
      
      return response;

    } catch (err: any) {
      return handleApiError(err, "deleting course units");
    }
  }

  async UploadUnitVideo(moduleId: string, unitId: string, videoFile: File, onProgress?: (progress: number) => void) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await axios.post(`${BASE_URL}/api/modules/${moduleId}/units/${unitId}/video`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
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

    } catch (err: any) {
      return handleApiError(err, "uploading course units video");
    }
  }
}

// Export standalone functions for backward compatibility
export async function GetStaffCourses(session: string) {
  const api = new CoursesApi();
  return api.GetStaffCourses(session);
}

export async function GetStaffCoursesbyId(id: string) {
  const api = new CoursesApi();
  return api.GetStaffCoursesbyId(id);
}

export async function GetCourseModules(courseId: string) {
  const api = new CoursesApi();
  return api.GetCourseModules(courseId);
}

export async function AddModule(courseId: string, title: string, description: string) {
  const api = new CoursesApi();
  return api.AddModule(courseId, title, description);
}

export async function DeleteModule(moduleId: string) {
  const api = new CoursesApi();
  return api.DeleteModule(moduleId);
}

export async function AddUnit(moduleId: string, data: {title: string, content: string, content_type: string, order: number, status: string}) {
  const api = new CoursesApi();
  return api.AddUnit(moduleId, data);
}

export async function getUnits(moduleId: string) {
  const api = new CoursesApi();
  return api.getUnits(moduleId);
}

export async function EditUnit(unitId: string, data: {title: string, content: string, video_url?: string}) {
  const api = new CoursesApi();
  return api.EditUnit(unitId, data);
}

export async function DeleteUnit(unitId: string) {
  const api = new CoursesApi();
  return api.DeleteUnit(unitId);
}

export async function UploadUnitVideo(moduleId: string, unitId: string, videoFile: File, onProgress?: (progress: number) => void) {
  const api = new CoursesApi();
  return api.UploadUnitVideo(moduleId, unitId, videoFile, onProgress);
}
