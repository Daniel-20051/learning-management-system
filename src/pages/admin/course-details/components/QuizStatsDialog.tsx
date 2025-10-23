import { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import { Input } from "@/Components/ui/input";
import { Api } from "@/api";
import type { QuizStats } from "@/types/admin";
import {
  Info,
  BarChart3,
  Users,
  Gauge,
  TrendingUp,
  CheckCircle,
  XCircle,
  User,
  Search,
} from "lucide-react";

export interface QuizStatsDialogRef {
  openDialog: (quiz: { id: number; title?: string }) => void;
  closeDialog: () => void;
}

interface QuizStatsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QuizStatsDialog = forwardRef<QuizStatsDialogRef, QuizStatsDialogProps>(
  ({ open, onOpenChange }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [quiz, setQuiz] = useState<{ id: number; title?: string } | null>(
      null
    );
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
        try {
          setLoading(true);
          const api = new Api();
          const res = await api.GetQuizStats(Number(q.id));
          const data = (((res as any) ?? {})?.data?.data ?? {}) as QuizStats;
          setStats(data);
        } catch (err: any) {
          setError(err?.response?.data?.message || "Failed to load stats");
        } finally {
          setLoading(false);
        }
      },
      closeDialog: () => {
        setIsOpen(false);
        setTimeout(() => {
          setQuiz(null);
          setStats(null);
          setError(null);
          setStudentSearch("");
        }, 300);
      },
    }));

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto mt-7">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Quiz Stats{quiz?.title ? ` • ${quiz.title}` : ""}
            </DialogTitle>
            <DialogDescription>
              Comprehensive statistics and analytics for this quiz.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-10 w-10 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin"></div>
              <div className="text-sm text-muted-foreground mt-3">
                Loading stats…
              </div>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-6">
              {/* Basic Stats */}
              <Card className="pt-2">
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 rounded border bg-muted/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Gauge className="h-4 w-4" /> Average Score
                      </div>
                      <div className="text-lg font-semibold mt-1">
                        {stats?.average_score ?? 0}
                        {typeof stats?.max_possible_score === "number" ? (
                          <span className="text-sm text-muted-foreground">
                            {" "}
                            / {stats?.max_possible_score}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="p-3 rounded border bg-muted/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 className="h-4 w-4" /> Max Possible Score
                      </div>
                      <div className="text-lg font-semibold mt-1">
                        {stats?.max_possible_score ?? 0}
                      </div>
                    </div>
                    <div className="p-3 rounded border bg-muted/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-4 w-4" /> Submitted Attempts
                      </div>
                      <div className="text-lg font-semibold mt-1">
                        {stats?.submitted_attempts ?? 0}
                      </div>
                    </div>
                    <div className="p-3 rounded border bg-muted/30">
                      <div className="text-xs text-muted-foreground">
                        Quiz ID
                      </div>
                      <div className="text-lg font-semibold mt-1">
                        {stats?.quiz_id ?? quiz?.id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participation Stats */}
              {stats?.participation && (
                <Card className="pt-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Participation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3 rounded border bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-4 w-4" /> Completion Rate
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {stats.participation.completion_rate ?? 0}%
                        </div>
                        <Progress
                          value={stats.participation.completion_rate ?? 0}
                          className="mt-2 h-2"
                        />
                      </div>
                      <div className="p-3 rounded border bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-4 w-4" /> Total Attempted
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {stats.participation.total_attempted ?? 0}
                        </div>
                      </div>
                      <div className="p-3 rounded border bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-4 w-4" /> Total Enrolled
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {stats.participation.total_enrolled ?? 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Students List */}
              {stats?.students && stats.students.length > 0 && (
                <Card className="pt-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Students</CardTitle>
                    <CardDescription>
                      Students that have taken this quiz
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students by name or email..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.student_id}
                              className="flex items-center justify-between p-2 rounded border bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {student.full_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No students found matching "{studentSearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Score Distribution */}
              {stats?.distribution && (
                <Card className="pt-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Score Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.distribution).map(
                        ([range, count]) => (
                          <div
                            key={range}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="w-16 justify-center"
                              >
                                {range}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {count} students
                              </span>
                            </div>
                            <div className="flex-1 mx-4">
                              <Progress
                                value={
                                  count > 0
                                    ? (count /
                                        Math.max(
                                          ...Object.values(
                                            stats.distribution || {}
                                          ).map(Number)
                                        )) *
                                      100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Questions Insights */}
              {stats?.questions_insights &&
                stats.questions_insights.length > 0 && (
                  <Card className="pt-2">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Questions Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.questions_insights.map((question, index) => (
                          <div
                            key={question.question_id}
                            className="flex items-center justify-between p-3 rounded border bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                Question {index + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {question.correct_rate >= 70 ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : question.correct_rate >= 50 ? (
                                  <XCircle className="h-4 w-4 text-yellow-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm font-medium">
                                  {question.correct_rate}%
                                </span>
                              </div>
                              <div className="w-20">
                                <Progress
                                  value={question.correct_rate}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              <Separator />

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

QuizStatsDialog.displayName = "QuizStatsDialog";

export default QuizStatsDialog;
