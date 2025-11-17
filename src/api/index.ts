// Import all API classes and functions from separate modules
import { AuthApi } from './auth';
import { CoursesApi, GetStaffCourses, GetStaffCoursesbyId, GetCourseModules, AddModule, DeleteModule, AddUnit, getUnits, EditUnit, DeleteUnit, UploadUnitVideo } from './courses';
import { NotesApi, GetModuleNotes, CreateModuleNotes, EditModuleNotes, DeleteModuleNotes } from './notes';
import { QuizApi, CreateQuiz, GetQuiz, GetQuizById, AddQuizQuestions, DeleteQuiz, UpdateQuiz, UpdateQuizQuestions, StartQuizAttempt, SaveQuizAnswers, SubmitQuizAttempt, GetQuizStats, GetMyLatestAttempt } from './quiz';
import { ExamsApi, GetStaffExams, GetExams, CreateExam, UpdateExam, DeleteExam, GetExamById, GetBankQuestions, AddObjectiveQuestion, AddTheoryQuestion, GetExamAttempts, GetAttemptForGrading, GradeTheoryAnswer, BulkGradeTheoryAnswers, GetExamStatistics, GetStudentExams, StartExam, SubmitExamAnswer, SubmitExam } from './exams';
import { StudentsApi, GetStudents } from './students';
import { ChatApi, GetChatThreads } from './chat';
import { VideoApi, CreateVideoCall, GetVideoCalls, DeleteVideoCall } from './video';
import { getAdminProfile, updateAdminProfile, getStudents, getStudentStatistics, getStudent, createStudent, updateStudent, deactivateStudent, activateStudent, resetStudentPassword, getStaff, createStaff, updateStaff, deactivateStaff, resetStaffPassword, getAdmins, createAdmin, updateAdmin, deactivateAdmin, getActivityLogs, type AdminProfile, type AdminProfileResponse, type AdminPermissions, type UpdateAdminProfileData, type UpdateAdminProfileResponse, type Student, type GetStudentsParams, type GetStudentsResponse, type PaginationData, type StudentStatistics, type GetStudentStatisticsResponse, type StudentDetails, type GetStudentResponse, type CreateStudentData, type CreateStudentResponse, type UpdateStudentData, type UpdateStudentResponse, type DeactivateStudentResponse, type ActivateStudentResponse, type ResetStudentPasswordData, type ResetStudentPasswordResponse, type Staff, type StaffCourse, type GetStaffParams, type GetStaffResponse, type CreateStaffData, type CreateStaffResponse, type UpdateStaffData, type UpdateStaffResponse, type DeactivateStaffResponse, type ResetStaffPasswordData, type ResetStaffPasswordResponse, type AdminListItem, type GetAdminsResponse, type CreateAdminData, type CreateAdminResponse, type UpdateAdminData, type UpdateAdminResponse, type DeactivateAdminResponse, type ActivityLog, type GetActivityLogsParams, type GetActivityLogsResponse } from './admin';

// Re-export all API classes and functions
export { AuthApi, CoursesApi, NotesApi, QuizApi, ExamsApi, StudentsApi, ChatApi, VideoApi };
export { GetStaffCourses, GetStaffCoursesbyId, GetCourseModules, AddModule, DeleteModule, AddUnit, getUnits, EditUnit, DeleteUnit, UploadUnitVideo };
export { GetModuleNotes, CreateModuleNotes, EditModuleNotes, DeleteModuleNotes };
export { CreateQuiz, GetQuiz, GetQuizById, AddQuizQuestions, DeleteQuiz, UpdateQuiz, UpdateQuizQuestions, StartQuizAttempt, SaveQuizAnswers, SubmitQuizAttempt, GetQuizStats, GetMyLatestAttempt };
export { GetStaffExams, GetExams, CreateExam, UpdateExam, DeleteExam, GetExamById, GetBankQuestions, AddObjectiveQuestion, AddTheoryQuestion, GetExamAttempts, GetAttemptForGrading, GradeTheoryAnswer, BulkGradeTheoryAnswers, GetExamStatistics, GetStudentExams, StartExam, SubmitExamAnswer, SubmitExam };
export { GetStudents };
export { GetChatThreads };
export { CreateVideoCall, GetVideoCalls, DeleteVideoCall };
export { getAdminProfile, updateAdminProfile, getStudents, getStudentStatistics, getStudent, createStudent, updateStudent, deactivateStudent, activateStudent, resetStudentPassword, getStaff, createStaff, updateStaff, deactivateStaff, resetStaffPassword, getAdmins, createAdmin, updateAdmin, deactivateAdmin, getActivityLogs, type AdminProfile, type AdminProfileResponse, type AdminPermissions, type UpdateAdminProfileData, type UpdateAdminProfileResponse, type Student, type GetStudentsParams, type GetStudentsResponse, type PaginationData, type StudentStatistics, type GetStudentStatisticsResponse, type StudentDetails, type GetStudentResponse, type CreateStudentData, type CreateStudentResponse, type UpdateStudentData, type UpdateStudentResponse, type DeactivateStudentResponse, type ActivateStudentResponse, type ResetStudentPasswordData, type ResetStudentPasswordResponse, type Staff, type StaffCourse, type GetStaffParams, type GetStaffResponse, type CreateStaffData, type CreateStaffResponse, type UpdateStaffData, type UpdateStaffResponse, type DeactivateStaffResponse, type ResetStaffPasswordData, type ResetStaffPasswordResponse, type AdminListItem, type GetAdminsResponse, type CreateAdminData, type CreateAdminResponse, type UpdateAdminData, type UpdateAdminResponse, type DeactivateAdminResponse, type ActivityLog, type GetActivityLogsParams, type GetActivityLogsResponse };

// For backward compatibility, create a unified Api class that includes all functionality
export class Api extends AuthApi {
  courses = new CoursesApi();
  notes = new NotesApi();
  quiz = new QuizApi();
  exams = new ExamsApi();
  students = new StudentsApi();
  chat = new ChatApi();
  video = new VideoApi();

  // Re-export course methods for backward compatibility
  async GetCourses(session: string, semester: string) {
    return this.courses.GetCourses(session, semester);
  }

  async GetStaffCourses(session: string) {
    return this.courses.GetStaffCourses(session);
  }

  async GetStaffCoursesbyId(id: string) {
    return this.courses.GetStaffCoursesbyId(id);
  }

  async GetCourseModules(courseId: string) {
    return this.courses.GetCourseModules(courseId);
  }

  async AddModule(courseId: string, title: string, description: string) {
    return this.courses.AddModule(courseId, title, description);
  }

  async DeleteModule(moduleId: string) {
    return this.courses.DeleteModule(moduleId);
  }

  async AddUnit(moduleId: string, data: {title: string, content: string, content_type: string, order: number, status: string}) {
    return this.courses.AddUnit(moduleId, data);
  }

  async getUnits(moduleId: string) {
    return this.courses.getUnits(moduleId);
  }

  async EditUnit(unitId: string, data: {title: string, content: string, video_url?: string}) {
    return this.courses.EditUnit(unitId, data);
  }

  async DeleteUnit(unitId: string) {
    return this.courses.DeleteUnit(unitId);
  }

  async UploadUnitVideo(moduleId: string, unitId: string, videoFile: File, onProgress?: (progress: number) => void) {
    return this.courses.UploadUnitVideo(moduleId, unitId, videoFile, onProgress);
  }

  // Re-export notes methods for backward compatibility
  async GetModuleNotes(moduleId: string) {
    return this.notes.GetModuleNotes(moduleId);
  }

  async CreateModuleNotes(moduleId: string, data: { note_text: string, title?: string}) {
    return this.notes.CreateModuleNotes(moduleId, data);
  }

  async EditModuleNotes(moduleId: string, noteId: string, data: { note_text: string, title?: string}) {
    return this.notes.EditModuleNotes(moduleId, noteId, data);
  }

  async DeleteModuleNotes(moduleId: string, noteId: string) {
    return this.notes.DeleteModuleNotes(moduleId, noteId);
  }

  // Re-export quiz methods for backward compatibility
  async CreateQuiz(data: {
    title: string;
    module_id: number;
    duration_minutes: number;
    description: string;
    status: string;
  }) {
    return this.quiz.CreateQuiz(data);
  }

  async GetQuiz(courseId?: number) {
    return this.quiz.GetQuiz(courseId);
  }

  async GetQuizById(quizId: number) {
    return this.quiz.GetQuizById(quizId);
  }

  async AddQuizQuestions(quizId: number, questions: any[]) {
    return this.quiz.AddQuizQuestions(quizId, questions);
  }

  async DeleteQuiz(quizId: number) {
    return this.quiz.DeleteQuiz(quizId);
  }

  async UpdateQuiz(quizId: number, data: {
    title?: string;
    duration_minutes?: number;
    status?: string;
    description?: string;
  }) {
    return this.quiz.UpdateQuiz(quizId, data);
  }

  async UpdateQuizQuestions(quizId: number, questions: any[]) {
    return this.quiz.UpdateQuizQuestions(quizId, questions);
  }

  async StartQuizAttempt(quizId: number) {
    return this.quiz.StartQuizAttempt(quizId);
  }

  async SaveQuizAnswers(attemptId: number, data: { answers: { question_id: number; selected_option_id: number }[] }) {
    return this.quiz.SaveQuizAnswers(attemptId, data);
  }

  async SubmitQuizAttempt(attemptId: number, data: { answers: { question_id: number; selected_option_ids: number[] }[] }) {
    return this.quiz.SubmitQuizAttempt(attemptId, data);
  }

  async GetQuizStats(quizId?: number) {
    return this.quiz.GetQuizStats(quizId);
  }

  async GetMyLatestAttempt(quizId: number) {
    return this.quiz.GetMyLatestAttempt(quizId);
  }

  // Re-export exam methods for backward compatibility
  async GetStaffExams() {
    return this.exams.GetStaffExams();
  }

  async GetExams(courseId: number, page: number = 1, limit: number = 20) {
    return this.exams.GetExams(courseId, page, limit);
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
    return this.exams.CreateExam(data);
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
    return this.exams.UpdateExam(examId, data);
  }

  async DeleteExam(examId: number) {
    return this.exams.DeleteExam(examId);
  }

  async GetExamById(examId: number) {
    return this.exams.GetExamById(examId);
  }

  async GetBankQuestions(courseId: number) {
    return this.exams.GetBankQuestions(courseId);
  }

  async AddObjectiveQuestion(data: {
    course_id: number;
    question_text: string;
    options: Array<{ id: string; text: string }>;
    correct_option: string;
    marks: number;
  }) {
    return this.exams.AddObjectiveQuestion(data);
  }

  async AddTheoryQuestion(data: {
    course_id: number;
    question_text: string;
    max_marks: number;
    difficulty?: string;
    topic?: string;
  }) {
    return this.exams.AddTheoryQuestion(data);
  }

  async GetExamAttempts(examId: number) {
    return this.exams.GetExamAttempts(examId);
  }

  async GetAttemptForGrading(attemptId: number) {
    return this.exams.GetAttemptForGrading(attemptId);
  }

  async GradeTheoryAnswer(answerId: number, score: number, feedback?: string) {
    return this.exams.GradeTheoryAnswer(answerId, score, feedback);
  }

  async BulkGradeTheoryAnswers(attemptId: number, grades: { answer_id: number; awarded_score: number; feedback?: string }[]) {
    return this.exams.BulkGradeTheoryAnswers(attemptId, grades);
  }

  async GetExamStatistics(examId: number) {
    return this.exams.GetExamStatistics(examId);
  }

  async GetStudentExams(courseId: string) {
    return this.exams.GetStudentExams(courseId);
  }

  async StartExam(examId: number) {
    return this.exams.StartExam(examId);
  }

  async SubmitExamAnswer(attemptId: number, payload: {
    exam_item_id: number;
    answer_type: "objective" | "theory";
    selected_option?: string;
    answer_text?: string;
  }) {
    return this.exams.SubmitExamAnswer(attemptId, payload);
  }

  async SubmitExam(attemptId: number) {
    return this.exams.SubmitExam(attemptId);
  }

  // Re-export student methods for backward compatibility
  async GetStudents(search?: string) {
    return this.students.GetStudents(search);
  }

  // Re-export chat methods for backward compatibility
  async GetChatThreads() {
    return this.chat.GetChatThreads();
  }

  // Re-export video methods for backward compatibility
  async CreateVideoCall(payload: any) {
    return this.video.createVideoCall(payload);
  }

  async GetVideoCalls() {
    return this.video.getVideoCalls();
  }

  async DeleteVideoCall(callId: string) {
    return this.video.deleteVideoCall(callId);
  }

  // Add user profile method
  async getUserProfile() {
    return super.getUserProfile();
  }
}