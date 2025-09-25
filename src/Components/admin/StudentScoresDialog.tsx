import { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Api } from "@/api";
import type { QuizStats } from "@/types/admin";
import { Search, X, Clock, User, Award } from "lucide-react";

export interface StudentScoresDialogRef {
  openDialog: (quiz: { id: number; title?: string }) => void;
  closeDialog: () => void;
}

interface StudentScoresDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const StudentScoresDialog = forwardRef<
  StudentScoresDialogRef,
  StudentScoresDialogProps
>(({ open, onOpenChange }, ref) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [quiz, setQuiz] = useState<{ id: number; title?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!stats?.students) return [];
    if (!studentSearch.trim()) return stats.students;

    const searchTerm = studentSearch.toLowerCase();
    return stats.students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
    );
  }, [stats?.students, studentSearch]);

  useImperativeHandle(ref, () => ({
    openDialog: async (q) => {
      setQuiz(q);
      setIsOpen(true);
      setError(null);
      setStats(null);
      setStudentSearch("");
      try {
        setLoading(true);
        const api = new Api();
        const response = await api.GetQuizStats(q.id);
        const data = (response as any)?.data?.data ?? (response as any)?.data;
        setStats(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load quiz statistics");
        console.error("Error fetching quiz stats:", err);
      } finally {
        setLoading(false);
      }
    },
    closeDialog: () => {
      setIsOpen(false);
      setQuiz(null);
      setStats(null);
      setError(null);
      setStudentSearch("");
    },
  }));

  const calculateTimeTaken = (startedAt?: string, submittedAt?: string) => {
    if (!startedAt || !submittedAt) return "N/A";

    try {
      const start = new Date(startedAt);
      const end = new Date(submittedAt);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs < 0) return "Invalid";

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (diffMinutes === 0) {
        return `${diffSeconds}s`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ${diffSeconds}s`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        return `${hours}h ${remainingMinutes}m`;
      }
    } catch (error) {
      console.error("Time calculation error:", error);
      return "Invalid";
    }
  };

  const getScoreBadge = (percentage?: number) => {
    if (percentage === undefined || percentage === null)
      return <Badge variant="outline">N/A</Badge>;

    return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
  };

  const getScoreColor = (percentage?: number) => {
    if (percentage === undefined || percentage === null)
      return "text-muted-foreground";
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] mt-7 overflow-y-auto  sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
            <Award className="h-5 w-5 text-primary" />
            Student Scores - {quiz?.title || "Quiz"}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-2 text-muted-foreground">
              Loading scores...
            </span>
          </div>
        )}

        {error && <div className="text-red-600 text-center py-4">{error}</div>}

        {stats && !loading && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-primary">
                  {stats.submitted_attempts || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Total Attempts
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-primary">
                  {stats.average_score?.toFixed(1) || 0}%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Average Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-primary">
                  {stats.max_possible_score || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Max Score
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex justify-end">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {studentSearch
                  ? "No students found matching your search."
                  : "No student data available."}
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {filteredStudents.map((student) => (
                    <Card key={student.student_id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium text-base">
                              {student.full_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.email}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Score
                            </div>
                            <div className="font-medium">
                              {student.total_score || 0} /{" "}
                              {student.max_score || 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Percentage
                            </div>
                            <div
                              className={`font-medium ${getScoreColor(
                                student.percentage
                              )}`}
                            >
                              {student.percentage || 0}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {getScoreBadge(student.percentage)}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {calculateTimeTaken(
                              student.started_at,
                              student.submitted_at
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">
                            Percentage
                          </TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">
                            Time Taken
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {student.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="font-medium">
                                {student.total_score || 0} /{" "}
                                {student.max_score || 0}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div
                                className={`font-medium ${getScoreColor(
                                  student.percentage
                                )}`}
                              >
                                {student.percentage || 0}%
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getScoreBadge(student.percentage)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1 text-sm font-medium">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {calculateTimeTaken(
                                  student.started_at,
                                  student.submitted_at
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                Showing {filteredStudents.length} of{" "}
                {stats.students?.length || 0} students
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

StudentScoresDialog.displayName = "StudentScoresDialog";

export default StudentScoresDialog;
