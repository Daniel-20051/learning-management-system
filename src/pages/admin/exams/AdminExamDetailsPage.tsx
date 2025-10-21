import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Api } from "@/api";
import { Loader2, ArrowLeft, Edit, Trash2, Plus, Eye, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import GradingDialog from "./components/GradingDialog";

// Local interface definitions as fallback
interface Exam {
  id: number;
  course_id: number;
  academic_year: string;
  semester: string;
  title: string;
  instructions?: string;
  start_at?: string;
  end_at?: string;
  duration_minutes: number;
  visibility: "draft" | "published" | "archived";
  randomize: boolean;
  exam_type: "objective" | "theory" | "mixed";
  selection_mode: "all" | "random";
  objective_count: number;
  theory_count: number;
  created_by: number;
  created_at: string;
  updated_at?: string;
  questions?: ExamQuestion[];
}

interface ExamQuestion {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay" | "short_answer";
  points: number;
  order: number;
  options?: any[];
  correct_answer?: string;
  created_at: string;
}

interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  status: "in_progress" | "submitted" | "graded";
  score?: number;
  max_score?: number;
  started_at: string;
  submitted_at?: string;
  graded_at?: string;
}

interface ExamStatistics {
  exam_id: number;
  total_attempts: number;
  average_score: string;
  highest_score: number;
  lowest_score: number;
}

const AdminExamDetailsPage = () => {
  const { courseId, examId } = useParams<{ courseId: string; examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = useMemo(() => new Api(), []);
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ExamStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");

  const session = searchParams.get("session") || "";

  // Load course info
  useEffect(() => {
    if (!courseId) return;
    
    const loadCourseInfo = async () => {
      try {
        const response = await api.GetStaffCoursesbyId(courseId);
        const data = response?.data?.data ?? response?.data;
        setCourseInfo(data);
      } catch (err) {
        console.error("Error loading course info:", err);
      }
    };
    
    loadCourseInfo();
  }, [api, courseId]);

  // Load exam details
  useEffect(() => {
    if (!examId) return;
    
    const loadExam = async () => {
      setLoading(true);
      try {
        const response = await api.GetExamById(parseInt(examId));
        
        // Log the response from getting exam details for debugging
        console.log("GetExamById response:", response);
        
        const data = (response as any)?.data?.data ?? (response as any)?.data;
        console.log("Processed exam data:", data);
        
        setExam(data);
      } catch (err) {
        console.error("Error loading exam:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadExam();
  }, [api, examId]);

  // Load exam attempts
  useEffect(() => {
    if (!examId || activeTab !== "attempts") return;
    
    const loadAttempts = async () => {
      setAttemptsLoading(true);
      try {
        const response = await api.GetExamAttempts(parseInt(examId), "submitted");
        const data = (response as any)?.data?.data ?? (response as any)?.data ?? [];
        console.log("Exam attempts:", data);
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading attempts:", err);
        setAttempts([]);
      } finally {
        setAttemptsLoading(false);
      }
    };
    
    loadAttempts();
  }, [api, examId, activeTab]);

  // Load exam statistics
  useEffect(() => {
    if (!examId || activeTab !== "statistics") return;
    
    const loadStatistics = async () => {
      setStatsLoading(true);
      try {
        const response = await api.GetExamStatistics(parseInt(examId));
        const data = (response as any)?.data?.data ?? (response as any)?.data;
        console.log("Exam statistics:", data);
        setStatistics(data);
      } catch (err) {
        console.error("Error loading statistics:", err);
        setStatistics(null);
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadStatistics();
  }, [api, examId, activeTab]);

  const handleDeleteExam = async () => {
    if (!exam || !confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
    
    try {
      const response = await api.DeleteExam(exam.id);
      
      if ((response as any)?.data?.success || (response as any)?.status === 200) {
        toast.success("Exam deleted successfully!");
        navigate(`/admin/exams/${courseId}?session=${encodeURIComponent(session)}`);
      } else {
        toast.error("Failed to delete exam. Please try again.");
      }
    } catch (err: any) {
      console.error("Error deleting exam:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to delete exam. Please try again.";
      toast.error(message);
    }
  };

  const handleGradeAttempt = (attemptId: number) => {
    setSelectedAttempt(attemptId);
    setIsGradingDialogOpen(true);
  };

  const handleGraded = () => {
    // Reload attempts after grading
    if (examId && activeTab === "attempts") {
      api.GetExamAttempts(parseInt(examId), "submitted")
        .then(response => {
          const data = (response as any)?.data?.data ?? (response as any)?.data ?? [];
          setAttempts(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Error reloading attempts:", err));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAttemptStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading exam details...</span>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Exam not found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/admin/exams/${courseId}?session=${encodeURIComponent(session)}`)}
          className="mt-4"
        >
          Back to Exams
        </Button>
      </div>
    );
  }

  const selectedAttemptData = attempts.find(a => a.id === selectedAttempt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/exams/${courseId}?session=${encodeURIComponent(session)}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{exam.title}</h2>
            <p className="text-sm text-muted-foreground">
              {courseInfo?.title || courseInfo?.course_title || "Course"} - Exam Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/exams/${courseId}?session=${encodeURIComponent(session)}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Exam
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteExam}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Exam Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(exam.visibility)}>
                {exam.visibility}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Academic Year:</span>
              <span>{exam.academic_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Semester:</span>
              <span>{exam.semester}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{exam.duration_minutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exam Type:</span>
              <Badge variant="outline">{exam.exam_type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selection Mode:</span>
              <Badge variant="outline">{exam.selection_mode}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Randomize:</span>
              <span>{exam.randomize ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(exam.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <p className="text-sm text-muted-foreground">
            {exam.instructions || "No instructions provided"}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Question Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Objective Questions:</span>
              <span>{exam.objective_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Theory Questions:</span>
              <span>{exam.theory_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-semibold">{exam.objective_count + exam.theory_count}</span>
            </div>
            {exam.start_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Time:</span>
                <span>{new Date(exam.start_at).toLocaleString()}</span>
              </div>
            )}
            {exam.end_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Time:</span>
                <span>{new Date(exam.end_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">
            <Eye className="h-4 w-4 mr-2" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="attempts">
            <Users className="h-4 w-4 mr-2" />
            Student Attempts
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Button size="sm" onClick={() => toast.info("Add question feature coming soon!")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
            
            {exam.questions && exam.questions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exam.questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-md truncate">
                          {question.question_text}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {question.question_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.info("Question preview coming soon!")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.info("Question editing coming soon!")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.info("Question deletion coming soon!")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No questions added to this exam yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => toast.info("Add question feature coming soon!")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="attempts" className="mt-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Student Attempts</h3>
              <p className="text-sm text-muted-foreground">View and grade student exam attempts</p>
            </div>
            
            {attemptsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading attempts...</span>
              </div>
            ) : attempts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{attempt.student_name || "Unknown Student"}</p>
                          {attempt.student_email && (
                            <p className="text-sm text-muted-foreground">{attempt.student_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAttemptStatusColor(attempt.status)}>
                          {attempt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attempt.score !== undefined && attempt.max_score !== undefined ? (
                          <span className="font-medium">
                            {attempt.score} / {attempt.max_score}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({Math.round((attempt.score / attempt.max_score) * 100)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {attempt.submitted_at
                          ? new Date(attempt.submitted_at).toLocaleString()
                          : "Not submitted"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGradeAttempt(attempt.id)}
                        >
                          {attempt.status === "graded" ? "View" : "Grade"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No student attempts found for this exam.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading statistics...</span>
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Attempts</h3>
                  <p className="text-3xl font-bold mt-2">{statistics.total_attempts || 0}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
                  <p className="text-3xl font-bold mt-2">
                    {statistics.average_score || "0.00"}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Highest Score</h3>
                  <p className="text-3xl font-bold mt-2">
                    {statistics.highest_score || 0}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Lowest Score</h3>
                  <p className="text-3xl font-bold mt-2">
                    {statistics.lowest_score || 0}
                  </p>
                </Card>
              </div>

              {statistics.total_attempts === 0 && (
                <Card className="p-6">
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">No student attempts have been submitted yet.</p>
                    <p className="text-xs mt-2">Statistics will appear once students start taking the exam.</p>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <p>No statistics available for this exam yet.</p>
                <p className="text-sm mt-2">Statistics will be generated after students submit their attempts.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Grading Dialog */}
      {selectedAttempt && (
        <GradingDialog
          open={isGradingDialogOpen}
          onOpenChange={setIsGradingDialogOpen}
          attemptId={selectedAttempt}
          studentName={selectedAttemptData?.student_name}
          onGraded={handleGraded}
        />
      )}
    </div>
  );
};

export default AdminExamDetailsPage;

