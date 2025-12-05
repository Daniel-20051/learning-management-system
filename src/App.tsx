import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Components/theme-provider";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Home from "./pages/student/home/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import RegisterStaffPage from "./pages/RegisterStaff";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import AdminLayout from "@/Components/admin/AdminLayout";
import DashboardPage from "./pages/admin/dashboard/DashboardPage";
import CoursesPage from "./pages/admin/course/CoursesPage";
import CourseDetailPage from "./pages/admin/course-details/CourseDetailPage";
import ResultsPage from "./pages/admin/result/ResultsPage";
import CourseQuizzesPage from "./pages/admin/quiz/CourseQuizzesPage";
import AdminDiscussionsListPage from "./pages/admin/discussions/AdminDiscussionsListPage";
import AdminCourseDiscussionPage from "./pages/admin/discussions/AdminCourseDiscussionPage";
import VideoLecture from "./pages/admin/video-lecture/VideoLecture";
import AdminExamsListPage from "./pages/admin/exams/AdminExamsListPage";
import AdminCourseExamsPage from "./pages/admin/exams/AdminCourseExamsPage";
import AdminExamDetailsPage from "./pages/admin/exams/AdminExamDetailsPage";
import QuestionBankPage from "./pages/admin/exams/QuestionBankPage";
import Unit from "./pages/student/unit/Unit";
import { SidebarSelectionProvider } from "@/context/SidebarSelectionContext";
import { SessionProvider } from "@/context/SessionContext";
import CertificatePage from "./pages/student/certificate/CertificatePage";
import OnlineClassesPage from "./pages/student/online-classes/OnlineClassesPage";
import NotFoundPage from "./pages/NotFoundPage";
import QuizPage from "./pages/student/quiz/QuizPage";
import ChatDialog from "@/Components/chat/ChatDialog";
import { ChatProvider } from "@/context/ChatContext";
import socketService from "@/services/Socketservice";
import { useEffect } from "react";
import StudentProfilePage from "./pages/student/profile/ProfilePage";
import AllCoursesPage from "./pages/student/all-courses/AllCoursesPage";
import AllocatedCoursesPage from "./pages/student/allocated-courses/AllocatedCoursesPage";
import StaffProfilePage from "./pages/admin/profile/StaffProfilePage";

function AdminPortalRedirect({ targetUrl }: { targetUrl?: string }) {
  useEffect(() => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  }, [targetUrl]);

  if (!targetUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Admin Portal Moved</h1>
          <p className="text-muted-foreground max-w-md">
            The super admin experience now lives in a dedicated deployment. Set
            <code className="mx-1 rounded bg-muted px-2 py-0.5">VITE_ADMIN_PORTAL_URL</code>
            in your environment to enable automatic redirects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-lg font-medium">Redirecting to admin portal…</p>
        <p className="text-muted-foreground">{targetUrl}</p>
      </div>
    </div>
  );
}

function App() {
  const { isLoggedIn, isAdmin, isInitializing, user } = useAuth();
  const adminPortalUrl = import.meta.env.VITE_ADMIN_PORTAL_URL;

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      // Connect socket on app load/login
      socketService.connect(String(user.id));
    } else {
      socketService.disconnect();
    }
  }, [isLoggedIn, user?.id]);

  return (
    <SessionProvider>
      <SidebarSelectionProvider>
        <ThemeProvider defaultTheme="light">
          {isInitializing ? null : (
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      isAdmin ? (
                        <Navigate to="/admin/dashboard" replace />
                      ) : (
                        <Home />
                      )
                    ) : (
                      <LoginPage />
                    )
                  }
                />
                <Route
                  path="/admin-login"
                  element={<AdminPortalRedirect targetUrl={adminPortalUrl} />}
                />
                <Route
                  path="/register"
                  element={<RegisterPage />}
                />
                <Route
                  path="/register/staff"
                  element={<RegisterStaffPage />}
                />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/admin"
                  element={
                    isLoggedIn && isAdmin ? (
                      <AdminLayout />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                >
                  <Route
                    index
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="courses" element={<CoursesPage />} />
                  <Route
                    path="courses/:courseId"
                    element={<CourseDetailPage />}
                  />
                  <Route path="results" element={<ResultsPage />} />
                  <Route
                    path="results/:courseId"
                    element={<CourseQuizzesPage />}
                  />
                  <Route path="discussions" element={<AdminDiscussionsListPage />} />
                  <Route path="discussions/:courseId" element={<AdminCourseDiscussionPage />} />
                  <Route path="exams" element={<AdminExamsListPage />} />
                  <Route path="exams/question-bank" element={<QuestionBankPage />} />
                  <Route path="exams/:courseId" element={<AdminCourseExamsPage />} />

                  <Route path="exams/:courseId/:examId" element={<AdminExamDetailsPage />} />
                  <Route path="profile" element={<StaffProfilePage />} />
                </Route>

                <Route
                  path="/unit/:courseId"
                  element={isLoggedIn ? <Unit /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/quiz/:quizId"
                  element={
                    isLoggedIn ? <QuizPage /> : <Navigate to="/" replace />
                  }
                />
                <Route
                  path="/certificate"
                  element={
                    isLoggedIn ? (
                      <CertificatePage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/profile"
                  element={
                    isLoggedIn ? (
                      <StudentProfilePage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/all-courses"
                  element={
                    isLoggedIn ? (
                      <AllCoursesPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/allocated-courses"
                  element={
                    isLoggedIn ? (
                      <AllocatedCoursesPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/online-classes"
                  element={
                    isLoggedIn ? (
                      <OnlineClassesPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="meeting/:callId"
                  element={
                    isLoggedIn ? (
                      <VideoLecture />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route path="*" element={<NotFoundPage />} />

              </Routes>
            </BrowserRouter>
          )}
          <Toaster />
          {/* Provide chat threads globally and mount trigger */}
          <ChatProvider enabled={isLoggedIn}>
            <div className="fixed bottom-4 right-4 z-50">
              <ChatDialog />
            </div>
          </ChatProvider>
        </ThemeProvider>
      </SidebarSelectionProvider>
    </SessionProvider>
  );
}

export default App;
