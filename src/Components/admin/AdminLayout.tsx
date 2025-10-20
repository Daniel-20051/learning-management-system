import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import type { MenuItem } from "@/types/admin";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active menu based on current path
  const getActiveMenu = (): MenuItem => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/dashboard") return "dashboard";
    if (path === "/admin/courses" || path.startsWith("/admin/courses/"))
      return "courses";
    if (path === "/admin/results" || path.startsWith("/admin/results/"))
      return "results";
    if (path === "/admin/discussions" || path.startsWith("/admin/discussions/"))
      return "discussions";
    if (path === "/admin/exams" || path.startsWith("/admin/exams/"))
      return "exams";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  const handleMenuChange = (menu: MenuItem) => {
    switch (menu) {
      case "courses":
        navigate("/admin/courses");
        break;
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "results":
        navigate("/admin/results");
        break;
      case "discussions":
        navigate("/admin/discussions");
        break;
      case "exams":
        navigate("/admin/exams");
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <AdminHeader
        user={user}
        onLogout={handleLogout}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          activeMenu={activeMenu}
          onMenuChange={handleMenuChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        <main
          className={`flex-1 overflow-y-auto p-6 transition-all duration-200 ${
            sidebarCollapsed ? "md:ml-12" : ""
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
