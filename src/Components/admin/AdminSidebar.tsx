import { Button } from "@/Components/ui/button";
import { LayoutDashboard, BookOpen, Plus, BarChart3, X } from "lucide-react";

import type { MenuItem } from "@/types/admin";

interface AdminSidebarProps {
  activeMenu: MenuItem;
  onMenuChange: (menu: MenuItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({
  activeMenu,
  onMenuChange,
  isOpen,
  onClose,
}: AdminSidebarProps) => {
  const menuItems = [
    {
      id: "dashboard" as MenuItem,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "courses" as MenuItem,
      label: "My Courses",
      icon: BookOpen,
    },
    {
      id: "create" as MenuItem,
      label: "Create Course",
      icon: Plus,
    },
    {
      id: "analytics" as MenuItem,
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 flex-col border-r bg-background
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isOpen ? "flex" : "hidden md:flex"}
      `}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b md:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 space-y-4 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeMenu === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  onMenuChange(item.id);
                  onClose(); // Close mobile sidebar when item is clicked
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
