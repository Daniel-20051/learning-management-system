import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { LogOut, User, Award } from "lucide-react";

interface UserCardProps {
  sidebar: boolean;
}

const UserCard = ({ sidebar }: UserCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    navigate("/");
  };

  return (
    <div className="flex items-center gap-3">
      {!sidebar && <ModeToggle />}
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
              <p className="text-sm font-bold">John Doe</p>
              {!sidebar && <p className="text-sm">john.doe@example.com</p>}
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
      {sidebar && <ModeToggle />}
    </div>
  );
};

export default UserCard;
