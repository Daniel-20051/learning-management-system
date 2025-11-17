import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";
import {
  MoreVertical,
  Edit,
  Trash,
  XCircle,
  Eye,
  Activity,
  Shield,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import type { AdminListItem } from "@/api/admin";

interface AdminsTableProps {
  loading: boolean;
  admins: AdminListItem[];
  searchTerm: string;
  onShowPermissions: (admin: AdminListItem) => void;
  onViewDetails?: (admin: AdminListItem) => void;
  onViewActivityLog?: (admin: AdminListItem) => void;
  onEdit?: (admin: AdminListItem) => void;
  onDeactivate?: (admin: AdminListItem) => void;
  onDelete?: (admin: AdminListItem) => void;
}

export default function AdminsTable({
  loading,
  admins,
  searchTerm,
  onShowPermissions,
  onViewDetails,
  onViewActivityLog,
  onEdit,
  onDeactivate,
  onDelete,
}: AdminsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No admins found</p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">#{admin.id}</TableCell>
                <TableCell>
                  {admin.fname} {admin.lname}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {admin.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-purple-50">
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={admin.status === "active" ? "default" : "secondary"}
                  >
                    {admin.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(admin.last_login)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(admin.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onShowPermissions(admin)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Show Permissions
                      </DropdownMenuItem>
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(admin)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onViewActivityLog && (
                        <DropdownMenuItem
                          onClick={() => onViewActivityLog(admin)}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          View Activity Log
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(admin)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDeactivate && (
                        <DropdownMenuItem
                          className="text-orange-500"
                          onClick={() => onDeactivate(admin)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(admin)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

