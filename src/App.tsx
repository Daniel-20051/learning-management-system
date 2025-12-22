import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Components/theme-provider";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { SidebarSelectionProvider } from "@/context/SidebarSelectionContext";
import { SessionProvider } from "@/context/SessionContext";
import { ChatProvider } from "@/context/ChatContext";
import socketService from "@/services/Socketservice";
import { useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load all route components for better code splitting
const Home = lazy(() => import("./pages/student/home/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const RegisterStaffPage = lazy(() => import("./pages/RegisterStaff"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const AdminLayout = lazy(() => import("@/Components/admin/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/dashboard/DashboardPage"));
const CoursesPage = lazy(() => import("./pages/admin/course/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/admin/course-details/CourseDetailPage"));
const ResultsPage = lazy(() => import("./pages/admin/result/ResultsPage"));
const CourseQuizzesPage = lazy(() => import("./pages/admin/quiz/CourseQuizzesPage"));
const AdminDiscussionsListPage = lazy(() => import("./pages/admin/discussions/AdminDiscussionsListPage"));
const AdminCourseDiscussionPage = lazy(() => import("./pages/admin/discussions/AdminCourseDiscussionPage"));
const VideoLecture = lazy(() => import("./pages/admin/video-lecture/VideoLecture"));
const AdminExamsListPage = lazy(() => import("./pages/admin/exams/AdminExamsListPage"));
const AdminCourseExamsPage = lazy(() => import("./pages/admin/exams/AdminCourseExamsPage"));
const AdminExamDetailsPage = lazy(() => import("./pages/admin/exams/AdminExamDetailsPage"));
const QuestionBankPage = lazy(() => import("./pages/admin/exams/QuestionBankPage"));
const Unit = lazy(() => import("./pages/student/unit/Unit"));
const CertificatePage = lazy(() => import("./pages/student/certificate/CertificatePage"));
const OnlineClassesPage = lazy(() => import("./pages/student/online-classes/OnlineClassesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const QuizPage = lazy(() => import("./pages/student/quiz/QuizPage"));
const ChatDialog = lazy(() => import("@/Components/chat/ChatDialog"));
const StudentProfilePage = lazy(() => import("./pages/student/profile/ProfilePage"));
const AllCoursesPage = lazy(() => import("./pages/student/all-courses/AllCoursesPage"));
const AllocatedCoursesPage = lazy(() => import("./pages/student/allocated-courses/AllocatedCoursesPage"));
const WalletPage = lazy(() => import("./pages/student/wallet/WalletPage"));
const SchoolFeesPage = lazy(() => import("./pages/student/school-fees/SchoolFeesPage"));
const StaffProfilePage = lazy(() => import("./pages/admin/profile/StaffProfilePage"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function App() {
  const { isLoggedIn, isAdmin, isInitializing, user } = useAuth();
  
  // Check if user account is active (not pending or inactive)
  // If status is undefined/null, allow access (backward compatibility)
  const isAccountActive = !user?.status || (user.status !== "pending" && user.status !== "inactive");

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
              <Suspense fallback={<PageLoader />}>
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
                  element={<Navigate to="/" replace />}
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
                    isLoggedIn && isAccountActive ? (
                      <AllocatedCoursesPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    isLoggedIn ? (
                      <WalletPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/school-fees"
                  element={
                    isLoggedIn && isAccountActive ? (
                      <SchoolFeesPage />
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
              </Suspense>
            </BrowserRouter>
          )}
          <Toaster position="top-right" />
          {/* Provide chat threads globally and mount trigger */}
          <ChatProvider enabled={isLoggedIn}>
            <Suspense fallback={null}>
              <div className="fixed bottom-4 right-4 z-50">
                <ChatDialog />
              </div>
            </Suspense>
          </ChatProvider>
        </ThemeProvider>
      </SidebarSelectionProvider>
    </SessionProvider>
  );
}

export default App;
