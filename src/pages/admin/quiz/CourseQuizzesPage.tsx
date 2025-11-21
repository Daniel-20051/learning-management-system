import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import {
  ArrowLeft,
  Search,
  Eye,
  Calendar,
  Clock,
  ClipboardList,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Api } from "@/api";
import StudentScoresDialog from "./components/StudentScoresDialog";
import type { StudentScoresDialogRef } from "./components/StudentScoresDialog";

interface QuizData {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  status: "draft" | "published";
  created_at: string;
  total_questions?: number;
  total_attempts?: number;
  average_score?: number;
  max_score?: number;
  module_id?: number;
  course_id?: number;
}

const CourseQuizzesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams<{ courseId: string }>();
  const api = new Api();
  
  // Determine if we're in super-admin context
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const resultsPath = isSuperAdmin ? "/super-admin/courses" : "/admin/results";
  const studentScoresDialogRef = useRef<StudentScoresDialogRef>(null);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch quizzes for the course
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseId) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await api.GetQuiz(parseInt(courseId));
        const responseData = response as any;
        const data = responseData?.data?.data ?? responseData?.data ?? [];
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || "Failed to load quizzes. Please try again.");
        console.error("Error fetching quizzes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;

    const query = searchQuery.toLowerCase().trim();
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        (quiz.description && quiz.description.toLowerCase().includes(query))
    );
  }, [quizzes, searchQuery]);

  const handleBack = () => {
    navigate(resultsPath);
  };

  const handleViewStudentScores = (quizId: number) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz && studentScoresDialogRef.current) {
      studentScoresDialogRef.current.openDialog({
        id: quizId,
        title: quiz.title,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Course Quizzes
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and view quiz performance for this course
          </p>
        </div>
      </div>

      {/* Quizzes Table */}
      <Card className="pt-3">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Quiz List</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 text-center py-4">{error}</div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin"></div>
              <span className="ml-2 text-muted-foreground">
                Loading quizzes...
              </span>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No quizzes found matching your search."
                : "No quizzes available for this course."}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {filteredQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {quiz.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDuration(quiz.duration_minutes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(quiz.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {getStatusBadge(quiz.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStudentScores(quiz.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Scores
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz Title</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{quiz.title}</div>
                              {quiz.description && (
                                <div className="text-sm text-muted-foreground">
                                  {quiz.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDuration(quiz.duration_minutes)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(quiz.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewStudentScores(quiz.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View Scores
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Student Scores Dialog */}
      <StudentScoresDialog ref={studentScoresDialogRef} />
    </div>
  );
};

export default CourseQuizzesPage;
