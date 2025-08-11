import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import type { MenuItem } from "@/types/admin";

const AdminLayout = () => {
  const { user, setIsLoggedIn, setUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active menu based on current path
  const getActiveMenu = (): MenuItem => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/dashboard") return "dashboard";
    if (path === "/admin/courses" || path.startsWith("/admin/courses/"))
      return "courses";
    if (path === "/admin/create") return "create";
    if (path === "/admin/analytics") return "analytics";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  const handleMenuChange = (menu: MenuItem) => {
    switch (menu) {
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "courses":
        navigate("/admin/courses");
        break;
      case "create":
        navigate("/admin/create");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
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
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
