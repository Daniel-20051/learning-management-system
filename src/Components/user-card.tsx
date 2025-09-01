import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { LogOut, User, Award, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserCardProps {
  sidebar: boolean;
}

const UserCard = ({ sidebar }: UserCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className=" hidden md:flex items-center gap-3 cursor-pointer">
            {sidebar && (
              <img
                className="w-13 bg-primary h-13 rounded-full"
                src="/assets/avatar.png"
                alt=""
              />
            )}
            <div>
              <p className="text-sm font-bold">{user?.name || "User"}</p>
              {!sidebar && (
                <p className="text-sm">{user?.email || "user@example.com"}</p>
              )}
            </div>
            {!sidebar && (
              <img
                className="w-13 bg-primary h-13 rounded-full"
                src="/assets/avatar.png"
                alt=""
              />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/admin")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/certificate")}
          >
            <Award className="mr-2 h-4 w-4" />
            <span>Certificates</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserCard;
