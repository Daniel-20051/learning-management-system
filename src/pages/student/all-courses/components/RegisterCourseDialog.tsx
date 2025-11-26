import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Api } from "@/api";
import { Calendar, Loader2, BookOpen } from "lucide-react";

interface Course {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
  course_type: string;
  course_level: number;
}

interface RegisterCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onRegister: (courseId: number, session: string, semester: string, level: string) => Promise<void>;
}

interface SessionData {
  academic_year: string;
  semester: string;
  status: string;
}

const RegisterCourseDialog = ({
  open,
  onOpenChange,
  course,
  onRegister,
}: RegisterCourseDialogProps) => {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [sessions, setSessions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const api = new Api();

  const semesters = ["1ST", "2ND"];

  // Fetch sessions when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetchSessions();
    } else {
      // Reset state when dialog closes
      setSelectedSession("");
      setSelectedSemester("");
      setSessions([]);
      setIsLoading(true);
    }
  }, [open]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await api.Getsessions();
      const items = response?.data?.data ?? response?.data ?? [];

      if (Array.isArray(items) && items.length > 0) {
        // Build unique academic year list from API
        const uniqueYears = Array.from(
          new Set(items.map((it: SessionData) => it.academic_year))
        ) as string[];
        setSessions(uniqueYears);

        // Find active semester and auto-select it
        const active = items.find((it: SessionData) => it.status === "Active");

        if (active?.academic_year && active?.semester) {
          setSelectedSession(active.academic_year);
          setSelectedSemester(active.semester);
        } else if (items[0]?.academic_year) {
          // If no active, default to first entry
          setSelectedSession(items[0].academic_year);
          setSelectedSemester(items[0].semester || "1ST");
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!course || !selectedSession || !selectedSemester) return;

    setIsRegistering(true);
    try {
      await onRegister(
        course.id,
        selectedSession,
        selectedSemester,
        String(course.course_level)
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error registering:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "C" ? "Core" : type === "E" ? "Elective" : type || "Course";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Register for Course
          </DialogTitle>
        </DialogHeader>

        {course && (
          <div className="space-y-4">
            {/* Course Info */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{course.course_code}</Badge>
                <Badge className="bg-emerald-600 text-white">
                  {getTypeLabel(course.course_type)}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                Level {course.course_level} · {course.course_unit} Unit
                {course.course_unit !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Session Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Session
              </label>
              <Select
                value={selectedSession}
                onValueChange={setSelectedSession}
                disabled={isLoading}
              >
                <SelectTrigger>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select academic session" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semester
              </label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
                disabled={isLoading}
              >
                <SelectTrigger>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select semester" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRegistering}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            disabled={isRegistering || isLoading || !selectedSession || !selectedSemester}
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterCourseDialog;

