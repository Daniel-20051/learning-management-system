import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Skeleton } from "@/Components/ui/skeleton";
import { Api } from "@/api";
import { Search, GraduationCap, Users, Mail, Phone } from "lucide-react";

interface Lecturer {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
}

interface Classmate {
  id: number;
  fname: string;
  mname?: string;
  lname: string;
  email: string;
  matric_number: string;
  level: string;
  program_id?: number;
  facaulty_id?: number;
  profile_picture?: string;
}

interface CourseInfo {
  id: number;
  title: string;
  course_code: string;
}

interface ParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | number;
  courseTitle: string;
  academicYear?: string;
  semester?: string;
}

const ParticipantsDialog = ({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  academicYear,
  semester,
}: ParticipantsDialogProps) => {
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const api = new Api();

  useEffect(() => {
    if (open && courseId) {
      fetchParticipants();
    }
  }, [open, courseId, academicYear, semester]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await api.GetCourseParticipants(String(courseId), {
        academic_year: academicYear,
        semester: semester,
        includeSelf: true,
      });

      if (response.data?.data) {
        const data = response.data.data;
        
        // Set course info
        if (data.course) {
          setCourseInfo(data.course);
        }
        
        // Set lecturer (single object)
        if (data.lecturer) {
          setLecturer(data.lecturer);
        } else {
          setLecturer(null);
        }
        
        // Set classmates array
        if (data.classmates && Array.isArray(data.classmates)) {
          setClassmates(data.classmates);
        } else {
          setClassmates([]);
        }

        // Set total from pagination if available
        if (data.pagination?.total) {
          setTotalStudents(data.pagination.total);
        } else {
          setTotalStudents(data.classmates?.length || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = classmates.filter((student) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${student.fname} ${student.mname || ""} ${student.lname}`.toLowerCase();
    const matricNumber = student.matric_number?.toLowerCase() || "";
    return fullName.includes(query) || matricNumber.includes(query);
  });

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStudentInitials = (fname: string, lname: string) => {
    return `${fname?.[0] || ""}${lname?.[0] || ""}`.toUpperCase();
  };

  const displayTitle = courseInfo?.title || courseTitle;
  const displayCode = courseInfo?.course_code;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            Course Participants
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{displayTitle}</span>
            {displayCode && (
              <Badge variant="outline" className="text-xs">
                {displayCode}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Lecturer Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-foreground">
                Course Lecturer
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ) : lecturer ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                <Avatar className="h-12 w-12 border-2 border-emerald-200">
                  <AvatarImage src={lecturer.profile_picture} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                    {getInitials(lecturer.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {lecturer.full_name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 text-xs"
                    >
                      Lecturer
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{lecturer.email}</span>
                    </div>
                    {lecturer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{lecturer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No lecturer assigned yet
              </p>
            )}
          </div>

          {/* Students Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  Classmates
                </h3>
                {!isLoading && (
                  <Badge variant="secondary" className="text-xs">
                    {totalStudents} student{totalStudents !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or matric number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.profile_picture} />
                      <AvatarFallback className="bg-blue-50 text-blue-700 text-sm font-medium">
                        {getStudentInitials(student.fname, student.lname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {student.fname} {student.mname ? `${student.mname} ` : ""}{student.lname}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{student.matric_number}</span>
                        <span>•</span>
                        <span>Level {student.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No students match "{searchQuery}"</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No other students enrolled yet</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantsDialog;
