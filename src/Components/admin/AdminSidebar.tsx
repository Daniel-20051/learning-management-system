import { Button } from "@/Components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
  MessageSquareText,
  FileText,
  User,
  LogOut,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

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
      id: "results" as MenuItem,
      label: "Results",
      icon: BarChart3,
    },
    {
      id: "discussions" as MenuItem,
      label: "Discussions",
      icon: MessageSquareText,
    },
    {
      id: "exams" as MenuItem,
      label: "Exams",
      icon: FileText,
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
          effectiveCollapsed ? "w-16" : "w-72"
        } flex-col border-r bg-background/95 backdrop-blur-sm overflow-hidden
        transform transition-all duration-300 ease-in-out
        md:transition-[width] md:duration-300 md:ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isOpen ? "flex" : "hidden md:flex"}
        shadow-sm
      `}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b md:hidden">
          <h2 className="text-xl font-semibold">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 space-y-6 p-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hidden md:inline-flex hover:bg-accent/50 transition-colors"
              onClick={onToggleCollapse}
              aria-label={
                effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {effectiveCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeMenu === item.id ? "default" : "ghost"}
                className={`w-full rounded-lg transition-all duration-200 ${
                  effectiveCollapsed
                    ? "h-12 justify-center gap-0 px-0"
                    : "h-14 justify-start gap-4 px-4 text-base font-medium"
                } ${
                  activeMenu === item.id
                    ? "shadow-sm"
                    : "hover:bg-accent/70 hover:shadow-sm"
                }`}
                onClick={() => {
                  onMenuChange(item.id);
                  onClose(); // Close mobile sidebar when item is clicked
                }}
              >
                <item.icon className={effectiveCollapsed ? "h-5 w-5" : "h-5 w-5 flex-shrink-0"} />
                {!effectiveCollapsed && (
                  <span className="truncate text-left">{item.label}</span>
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full rounded-lg transition-all duration-200 ${
                  effectiveCollapsed
                    ? "h-12 justify-center px-0"
                    : "h-14 justify-start gap-3 px-3"
                } hover:bg-accent/70`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {user?.name ? getInitials(user.name) : "ST"}
                  </AvatarFallback>
                </Avatar>
                {!effectiveCollapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name || "Staff"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  navigate("/admin/profile");
                  onClose();
                }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
