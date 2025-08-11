import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
  onSidebarToggle: () => void;
}

const AdminHeader = ({ user, onLogout, onSidebarToggle }: AdminHeaderProps) => {
  return (
    <div className="sticky top-0 z-100 border-b bg-card">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={onSidebarToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="logo"
            className=" h-13 md:h-15 w-39 md:w-50 "
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden md:block font-medium">{user?.name}</span>
            <Badge>{user?.role}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
