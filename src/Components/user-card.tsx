import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { LogOut, User, Award, Settings, Video, BookOpen, Loader2, Library, GraduationCap, Wallet, Receipt } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserCardProps {
  sidebar: boolean;
}

const UserCard = ({ sidebar }: UserCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Force navigation to login page to ensure clean state
      // Don't set state after navigation as page will reload
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, try to navigate
      // Don't set state after navigation as page will reload
      window.location.href = "/";
    }
    // Note: Not using finally block here because window.location.href causes
    // a hard navigation that will reload the page, making state updates unnecessary
  };

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer">
            {sidebar && (
              <img
                className="w-13 bg-primary h-13 rounded-full"
                src="/assets/avatar.png"
                alt=""
              />
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-bold">{user?.name || "User"}</p>
              {!sidebar && (
                <p className="text-sm">{user?.email || "user@example.com"}</p>
              )}
            </div>
            {/* Mobile: Show only avatar */}
            <div className="sm:hidden">
              <img
                className="w-10 h-10 bg-primary rounded-full"
                src="/assets/avatar.png"
                alt="User Avatar"
              />
            </div>
            {/* Desktop: Show avatar when not in sidebar */}
            {!sidebar && (
              <img
                className="hidden sm:block w-13 bg-primary h-13 rounded-full"
                src="/assets/avatar.png"
                alt=""
              />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            className="cursor-pointer py-3"
            onClick={() => navigate("/profile")}
          >
            <User className="mr-3 h-5 w-5" />
            <span className="text-base">Profile</span>
          </DropdownMenuItem>
          {!isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/wallet")}
            >
              <Wallet className="mr-3 h-5 w-5" />
              <span className="text-base">Wallet</span>
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/school-fees")}
            >
              <Receipt className="mr-3 h-5 w-5" />
              <span className="text-base">School Fees</span>
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/admin")}
            >
              <Settings className="mr-3 h-5 w-5" />
              <span className="text-base">Admin Panel</span>
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/")}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              <span className="text-base">My Courses</span>
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/all-courses")}
            >
              <Library className="mr-3 h-5 w-5" />
              <span className="text-base">Marketplace</span>
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/allocated-courses")}
            >
              <GraduationCap className="mr-3 h-5 w-5" />
              <span className="text-base">Course Registration</span>
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => navigate("/online-classes")}
            >
              <Video className="mr-3 h-5 w-5" />
              <span className="text-base">Online Class</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer py-3"
            onClick={() => navigate("/certificate")}
          >
            <Award className="mr-3 h-5 w-5" />
            <span className="text-base">Certificates</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-3 text-red-600 focus:text-red-600"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="mr-3 h-5 w-5" />
            )}
            <span className="text-base">
              {isLoggingOut ? "Logging out..." : "Log out"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserCard;
