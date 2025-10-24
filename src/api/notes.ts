import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export class NotesApi {
  async GetModuleNotes(moduleId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/modules/${moduleId}/note`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "getting unit notes");
    }
  }

  async CreateModuleNotes(moduleId: string, data: { note_text: string, title?: string}) {
    try {
      const payload: any = {
        note_text: data.note_text
      };
      if (data.title) {
        payload.title = data.title;
      }
      const response = await axios.put(`${BASE_URL}/api/modules/${moduleId}/note`,
        payload, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "creating unit notes");
    }
  }

  async EditModuleNotes(moduleId: string, noteId: string, data: { note_text: string, title?: string}) {
    try {
      const payload = {
        note_text: data.note_text,
        title: data.title
      };
      const response = await axios.patch(`${BASE_URL}/api/modules/${moduleId}/notes/${noteId}`,
        payload, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "editing unit notes");
    }
  }

  async DeleteModuleNotes(moduleId: string, noteId: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/api/modules/${moduleId}/notes/${noteId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (err: any) {
      return handleApiError(err, "deleting unit notes");
    }
  }
}

// Export standalone functions for backward compatibility
export async function GetModuleNotes(moduleId: string) {
  const api = new NotesApi();
  return api.GetModuleNotes(moduleId);
}

export async function CreateModuleNotes(moduleId: string, data: { note_text: string, title?: string}) {
  const api = new NotesApi();
  return api.CreateModuleNotes(moduleId, data);
}

export async function EditModuleNotes(moduleId: string, noteId: string, data: { note_text: string, title?: string}) {
  const api = new NotesApi();
  return api.EditModuleNotes(moduleId, noteId, data);
}

export async function DeleteModuleNotes(moduleId: string, noteId: string) {
  const api = new NotesApi();
  return api.DeleteModuleNotes(moduleId, noteId);
}
