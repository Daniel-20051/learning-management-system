// Import all API classes and functions from separate modules
import { AuthApi } from './auth';
import { CoursesApi, GetStaffCourses, GetStaffCoursesbyId, GetCourseModules, AddModule, DeleteModule, AddUnit, getUnits, EditUnit, DeleteUnit, UploadUnitVideo, UnregisterFromCourse, GetCourseParticipants, GetAllocatedCourses, RegisterAllocatedCourses } from './courses';
import { NotesApi, GetModuleNotes, CreateModuleNotes, EditModuleNotes, DeleteModuleNotes } from './notes';
import { QuizApi, CreateQuiz, GetQuiz, GetQuizById, AddQuizQuestions, DeleteQuiz, UpdateQuiz, UpdateQuizQuestions, StartQuizAttempt, SaveQuizAnswers, SubmitQuizAttempt, GetQuizStats, GetMyLatestAttempt } from './quiz';
import { ExamsApi, GetStaffExams, GetExams, CreateExam, UpdateExam, DeleteExam, GetExamById, GetBankQuestions, AddObjectiveQuestion, AddTheoryQuestion, GetExamAttempts, GetAttemptForGrading, GradeTheoryAnswer, BulkGradeTheoryAnswers, GetExamStatistics, GetStudentExams, StartExam, SubmitExamAnswer, SubmitExam } from './exams';
import { StudentsApi, GetStudents } from './students';
import { ChatApi, GetChatThreads } from './chat';
import { VideoApi, CreateVideoCall, GetVideoCalls, DeleteVideoCall } from './video';
import { NoticesApi, GetNotices } from './notices';
import { MarketplaceApi, PurchaseCourse } from './marketplace';
import { WalletApi } from './wallet';
import { ProgramsApi, GetProgramById, GetFacultyById } from './programs';

// Re-export all API classes and functions
export { AuthApi, CoursesApi, NotesApi, QuizApi, ExamsApi, StudentsApi, ChatApi, VideoApi, NoticesApi, MarketplaceApi, WalletApi, ProgramsApi };
export { GetNotices, PurchaseCourse };
export { GetStaffCourses, GetStaffCoursesbyId, GetCourseModules, AddModule, DeleteModule, AddUnit, getUnits, EditUnit, DeleteUnit, UploadUnitVideo, UnregisterFromCourse, GetCourseParticipants, GetAllocatedCourses, RegisterAllocatedCourses };
export { GetModuleNotes, CreateModuleNotes, EditModuleNotes, DeleteModuleNotes };
export { CreateQuiz, GetQuiz, GetQuizById, AddQuizQuestions, DeleteQuiz, UpdateQuiz, UpdateQuizQuestions, StartQuizAttempt, SaveQuizAnswers, SubmitQuizAttempt, GetQuizStats, GetMyLatestAttempt };
export { GetStaffExams, GetExams, CreateExam, UpdateExam, DeleteExam, GetExamById, GetBankQuestions, AddObjectiveQuestion, AddTheoryQuestion, GetExamAttempts, GetAttemptForGrading, GradeTheoryAnswer, BulkGradeTheoryAnswers, GetExamStatistics, GetStudentExams, StartExam, SubmitExamAnswer, SubmitExam };
export { GetStudents };
export { GetChatThreads };
export { CreateVideoCall, GetVideoCalls, DeleteVideoCall };
export { GetProgramById, GetFacultyById };

// For backward compatibility, create a unified Api class that includes all functionality
export class Api extends AuthApi {
  courses = new CoursesApi();
  notes = new NotesApi();
  quiz = new QuizApi();
  exams = new ExamsApi();
  students = new StudentsApi();
  chat = new ChatApi();
  video = new VideoApi();
  notices = new NoticesApi();
  marketplace = new MarketplaceApi();
  wallet = new WalletApi();
  programs = new ProgramsApi();

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

  async AddUnit(moduleId: string, data: { title: string, content: string, content_type: string, order: number, status: string }) {
    return this.courses.AddUnit(moduleId, data);
  }

  async getUnits(moduleId: string) {
    return this.courses.getUnits(moduleId);
  }

  async EditUnit(unitId: string, data: { title: string, content: string, video_url?: string }) {
    return this.courses.EditUnit(unitId, data);
  }

  async DeleteUnit(unitId: string) {
    return this.courses.DeleteUnit(unitId);
  }

  async UploadUnitVideo(moduleId: string, unitId: string, videoFile: File, onProgress?: (progress: number) => void) {
    return this.courses.UploadUnitVideo(moduleId, unitId, videoFile, onProgress);
  }

  /**
   * Get available courses - primarily for marketplace courses.
   * Note: Students can no longer browse all WPU courses. Use GetAllocatedCourses() instead.
   */
  async GetAvailableCourses(params?: { level?: string; program_id?: string; faculty_id?: string }) {
    return this.courses.GetAvailableCourses(params);
  }

  /**
   * @deprecated Direct course registration is no longer available.
   * Use RegisterAllocatedCourses() instead to register for allocated courses.
   */
  async RegisterCourse(data: {
    course_id?: number;
    course_ids?: number[];
    academic_year: string;
    semester: string;
    level?: string;
  }) {
    return this.courses.RegisterCourse(data);
  }

  /**
   * @deprecated Course unregistration is no longer available.
   */
  async UnregisterFromCourse(registrationId: string) {
    return this.courses.UnregisterFromCourse(registrationId);
  }

  async GetCourseParticipants(courseId: string, params?: {
    academic_year?: string;
    semester?: string;
    search?: string;
    includeSelf?: boolean;
  }) {
    return this.courses.GetCourseParticipants(courseId, params);
  }

  /**
   * Get allocated courses for the current active semester.
   * This is the primary endpoint for students to view courses allocated to them.
   */
  async GetAllocatedCourses() {
    return this.courses.GetAllocatedCourses();
  }

  /**
   * Register for all allocated courses in the current active semester.
   * The registration fee will be deducted from the student's wallet.
   */
  async RegisterAllocatedCourses() {
    return this.courses.RegisterAllocatedCourses();
  }

  async GetSchoolFees() {
    return this.courses.GetSchoolFees();
  }

  async PaySchoolFees() {
    return this.courses.PaySchoolFees();
  }

  // Re-export notes methods for backward compatibility
  async GetModuleNotes(moduleId: string) {
    return this.notes.GetModuleNotes(moduleId);
  }

  async CreateModuleNotes(moduleId: string, data: { note_text: string, title?: string }) {
    return this.notes.CreateModuleNotes(moduleId, data);
  }

  async EditModuleNotes(moduleId: string, noteId: string, data: { note_text: string, title?: string }) {
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

  async GetBankQuestions(courseId: number, page: number = 1, limit: number = 20) {
    return this.exams.GetBankQuestions(courseId, page, limit);
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

  // Re-export notices methods for backward compatibility
  async GetNotices() {
    return this.notices.GetNotices();
  }

  // Re-export marketplace methods for backward compatibility
  async PurchaseCourse(payload: { course_id: number }) {
    return this.marketplace.PurchaseCourse(payload);
  }

  async GetMarketplaceCourses(params?: {
    owner_id?: number | null;
    owner_type?: "sole_tutor" | "organization" | "wpu";
    level?: number | string;
    program_id?: number | string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.marketplace.GetMarketplaceCourses(params);
  }

  async GetMarketplaceTutors() {
    return this.marketplace.GetMarketplaceTutors();
  }

  async GetMarketplacePrograms() {
    return this.marketplace.GetMarketplacePrograms();
  }

  // Add user profile method
  async getUserProfile() {
    return super.getUserProfile();
  }

  // Add update student profile method
  async updateStudentProfile(data: {
    fname: string;
    lname: string;
    mname?: string;
    phone?: string;
    address?: string;
    dob?: string;
    country?: string;
    state_origin?: string;
    lcda?: string;
    currency?: string;
  }) {
    return super.updateStudentProfile(data);
  }

  // Re-export programs methods for backward compatibility
  async GetProgramById(id: number) {
    return this.programs.GetProgramById(id);
  }

  async GetFacultyById(id: number) {
    return this.programs.GetFacultyById(id);
  }
}