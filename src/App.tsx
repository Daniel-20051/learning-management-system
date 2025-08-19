import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Components/theme-provider";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import AdminLayout from "@/Components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import CoursesPage from "./pages/admin/CoursesPage";
import CourseDetailPage from "./pages/admin/CourseDetailPage";
import Unit from "./pages/Unit";
import { SidebarSelectionProvider } from "@/context/SidebarSelectionContext";
import CertificatePage from "./pages/CertificatePage";

function App() {
  const { isLoggedIn, isAdmin, isInitializing } = useAuth();

  return (
    <SidebarSelectionProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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
              </Route>
              <Route path="/course/:id/" element={<Unit />} />
              <Route path="/certificate" element={<CertificatePage />} />
            </Routes>
          </BrowserRouter>
        )}
        <Toaster />
      </ThemeProvider>
    </SidebarSelectionProvider>
  );
}

export default App;
