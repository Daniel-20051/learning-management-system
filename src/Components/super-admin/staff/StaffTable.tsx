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
  MoreVertical,
  Edit,
  Key,
  XCircle,
  Trash,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import type { Staff } from "@/api/admin";
import { useState } from "react";

interface StaffTableProps {
  loading: boolean;
  staff: Staff[];
  searchTerm: string;
}

export default function StaffTable({
  loading,
  staff,
  searchTerm,
}: StaffTableProps) {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);

  const handleViewCourses = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setTimeout(() => {
      setIsCoursesDialogOpen(true);
    }, 0);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setIsCoursesDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Courses</TableHead>
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
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No staff members found</p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="font-medium">
                    {member.full_name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="text-sm">{member.phone || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {member.courses?.length || 0} {member.courses?.length === 1 ? 'Course' : 'Courses'}
                  </Badge>
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
                      <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          handleViewCourses(member);
                        }}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Courses
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-orange-600">
                        <XCircle className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Courses Dialog */}
      {selectedStaff && (
        <Dialog open={isCoursesDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Courses - {selectedStaff.full_name}</DialogTitle>
              <DialogDescription>
                {selectedStaff.email}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedStaff.courses && selectedStaff.courses.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Teaching {selectedStaff.courses.length} {selectedStaff.courses.length === 1 ? 'course' : 'courses'}
                </p>
                <div className="grid gap-3">
                  {selectedStaff.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Course Code: <code className="text-xs bg-muted px-2 py-0.5 rounded">{course.course_code}</code>
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ID: {course.id}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No courses assigned</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This staff member is not currently teaching any courses.
                </p>
              </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

