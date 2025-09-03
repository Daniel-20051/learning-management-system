import { Button } from "@/Components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { MenuItem } from "@/types/admin";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  activeMenu: MenuItem;
  onMenuChange: (menu: MenuItem) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdminSidebar = ({
  activeMenu,
  onMenuChange,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) => {
  const isMobile = useIsMobile();
  const effectiveCollapsed = isMobile ? false : isCollapsed;
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
        fixed md:static inset-y-0 left-0 z-50 ${
          effectiveCollapsed ? "w-12" : "w-64"
        } flex-col border-r bg-background overflow-hidden
        transform transition-transform duration-200 ease-in-out
        md:transition-[width] md:duration-200 md:ease-linear
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
        <div className="flex-1 space-y-4 p-2">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden md:inline-flex"
              onClick={onToggleCollapse}
              aria-label={
                effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {effectiveCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeMenu === item.id ? "default" : "ghost"}
                className={`w-full h-10 rounded-md ${
                  effectiveCollapsed
                    ? "justify-center gap-0 px-0"
                    : "justify-start gap-3 px-3"
                }`}
                onClick={() => {
                  onMenuChange(item.id);
                  onClose(); // Close mobile sidebar when item is clicked
                }}
              >
                <item.icon className="h-4 w-4" />
                {!effectiveCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
