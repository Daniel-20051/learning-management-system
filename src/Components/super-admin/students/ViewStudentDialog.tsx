import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";
import { Card, CardContent } from "@/Components/ui/card";
import { Mail, Phone, GraduationCap, BookOpen, Calendar, User, UserCheck, UserX, RefreshCw } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { getStudent, type StudentDetails } from "@/api/admin";
import { toast } from "sonner";

interface ViewStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
}

export default function ViewStudentDialog({
  open,
  onOpenChange,
  studentId,
}: ViewStudentDialogProps) {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && studentId) {
      // Reset states first
      setStudent(null);
      setError(null);
      setLoading(false);
      
      // Add a small delay to ensure dialog is fully mounted
      const timer = setTimeout(() => {
        fetchStudentDetails();
      }, 50);
      return () => clearTimeout(timer);
    }
    
    // Ensure body scroll is restored when dialog closes
    if (!open) {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup on unmount
      setStudent(null);
      setError(null);
      setLoading(false);
      // Force restore pointer events and scroll
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, [open, studentId]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getStudent(studentId);
      if (response.success) {
        setStudent(response.data.student);
      }
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch student details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active" || status === "Active") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <UserCheck className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else if (status === "inactive" || status === "Inactive") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <UserX className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing while loading
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            View detailed information about this student
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : student ? (
          <div className="grid gap-4 py-4">
            {/* Personal Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Personal Information</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="text-base font-medium mt-1">
                      {student.fname} {student.lname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">{getStatusBadge(student.admin_status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{student.email}</p>
                    </div>
                  </div>
                  {student.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{student.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Academic Information</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Matric Number
                    </label>
                    {student.matric_number ? (
                      <code className="text-sm bg-muted px-2 py-1 rounded block mt-1 w-fit">
                        {student.matric_number}
                      </code>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        Not assigned
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Level
                    </label>
                    <p className="text-base font-medium mt-1">{student.level} Level</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Program
                    </label>
                    <p className="text-sm mt-1">
                      {student.program?.program_name || `Program ${student.program_id}`}
                    </p>
                  </div>
                  {student.created_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Enrolled Since
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          {new Date(student.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enrolled Courses */}
            {student.enrolledCourses && student.enrolledCourses.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">
                      Enrolled Courses ({student.enrolledCourses.length})
                    </h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {student.enrolledCourses.map((course) => (
                      <div
                        key={course.course_id}
                        className="border rounded-lg p-3 bg-muted/50"
                      >
                        <p className="font-medium text-sm">{course.course_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Course ID: {course.course_id}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive font-medium mb-2">Failed to fetch student details</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                fetchStudentDetails();
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No student data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

