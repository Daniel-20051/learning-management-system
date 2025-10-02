import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Components/theme-provider";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Home from "./pages/student/home/Home";
import LoginPage from "./pages/Login";
import AdminLayout from "@/Components/admin/AdminLayout";
import DashboardPage from "./pages/admin/dashboard/DashboardPage";
import CoursesPage from "./pages/admin/course/CoursesPage";
import CourseDetailPage from "./pages/admin/course-details/CourseDetailPage";
import ResultsPage from "./pages/admin/result/ResultsPage";
import CourseQuizzesPage from "./pages/admin/quiz/CourseQuizzesPage";
import Unit from "./pages/student/unit/Unit";
import { SidebarSelectionProvider } from "@/context/SidebarSelectionContext";
import { SessionProvider } from "@/context/SessionContext";
import CertificatePage from "./pages/student/certificate/CertificatePage";
import NotFoundPage from "./pages/NotFoundPage";
import QuizPage from "./pages/student/quiz/QuizPage";

function App() {
  const { isLoggedIn, isAdmin, isInitializing } = useAuth();

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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          )}
          <Toaster />
        </ThemeProvider>
      </SidebarSelectionProvider>
    </SessionProvider>
  );
}

export default App;
