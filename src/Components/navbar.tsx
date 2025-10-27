import UserCard from "./user-card";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  sidebar: boolean;
}

const Navbar = ({ sidebar }: NavbarProps) => {
  const navigate = useNavigate();
  return (
    <div
      className={`sticky top-0 z-50 bg-white flex justify-between items-center h-auto border-b border-sidebar-border py-2 px-2 md:px-7`}
    >
      <img
        src="/assets/logo.png"
        alt="Logo"
        className="w-67 h-20 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <UserCard sidebar={sidebar} />
    </div>
  );
};

export default Navbar;
