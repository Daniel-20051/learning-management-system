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
  Users,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  Edit,
  Power,
  Key,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import type { Student } from "@/api/admin";

interface StudentsTableProps {
  loading: boolean;
  students: Student[];
  searchTerm: string;
  levelFilter: string;
  statusFilter: string;
  onViewStudent: (studentId: number) => void;
  onEditStudent: (studentId: number) => void;
  onDeactivateStudent: (student: Student) => void;
  onActivateStudent: (student: Student) => void;
  onResetPassword: (student: Student) => void;
}

export default function StudentsTable({
  loading,
  students,
  searchTerm,
  levelFilter,
  statusFilter,
  onViewStudent,
  onEditStudent,
  onDeactivateStudent,
  onActivateStudent,
  onResetPassword,
}: StudentsTableProps) {
  const getStatusBadge = (status: string) => {
    return status === "active" || status === "Active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Matric Number</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Program</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No students found</p>
                  {(searchTerm || levelFilter !== "all" || statusFilter !== "all") && (
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="font-medium">
                    {student.fname} {student.lname}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{student.email}</TableCell>
                <TableCell>
                  {student.matric_number ? (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {student.matric_number}
                    </code>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Not assigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{student.level} Level</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(student.admin_status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {student.program?.title || `Program ${student.program_id}`}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewStudent(student.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditStudent(student.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Student
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {student.admin_status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => onDeactivateStudent(student)}
                          className="text-orange-600"
                        >
                          <Power className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onActivateStudent(student)}
                          className="text-green-600"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onResetPassword(student)}>
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
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

