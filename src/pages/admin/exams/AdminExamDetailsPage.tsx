import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Api } from "@/api";
import { Loader2, ArrowLeft, Edit, Trash2, Users, BarChart3, ChevronDown, Search, X } from "lucide-react";
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
  attempt_no: number;
  started_at: string;
  submitted_at?: string;
  status: "in_progress" | "submitted" | "graded";
  total_score?: string;
  max_score?: string;
  graded_at?: string;
  graded_by?: number;
  student: {
    id: number;
    fname: string;
    lname: string;
    matric_number: string;
  };
}

interface ExamStatistics {
  exam_id: number;
  total_attempts: number;
  average_score: string;
  highest_score: number;
  lowest_score: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const AdminExamDetailsPage = () => {
  const { courseId, examId } = useParams<{ courseId: string; examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => new Api(), []);
  
  // Determine if we're in super-admin context
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const examsBasePath = isSuperAdmin ? "/super-admin/exams" : "/admin/exams";
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [statistics, setStatistics] = useState<ExamStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("attempts");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  
  // Collapsible row state
  const [isExamDetailsExpanded, setIsExamDetailsExpanded] = useState(false);

  const session = searchParams.get("session") || "";

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when search changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    setPagination(prev => ({ ...prev, page: 1 }));
    if (examId && activeTab === "attempts") {
      loadAttempts();
    }
  }, [debouncedSearchQuery]);


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
        
        const data = (response as any)?.data?.data ?? (response as any)?.data;
        
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
  const loadAttempts = async () => {
    if (!examId || activeTab !== "attempts") return;
    
    setAttemptsLoading(true);
    try {
      const response = await api.GetExamAttempts(parseInt(examId));
      const responseData = (response as any)?.data;
      
      if (responseData?.status && responseData?.data && responseData?.pagination) {
        setAttempts(Array.isArray(responseData.data) ? responseData.data : []);
        setPagination(responseData.pagination);
      } else {
        // Fallback for old response format
        const data = responseData?.data ?? responseData ?? [];
        setAttempts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error loading attempts:", err);
      setAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  };

  useEffect(() => {
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
        navigate(`${examsBasePath}/${courseId}?session=${encodeURIComponent(session)}`);
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
      loadAttempts();
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

      <div className="mb-6">
        <div 
          className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 ease-in-out"
          onClick={() => setIsExamDetailsExpanded(!isExamDetailsExpanded)}
        >
          <h2 className="font-semibold text-base text-foreground">Exam Details</h2>
          <ChevronDown 
            className={`h-4 w-4 ml-2 text-muted-foreground transition-transform duration-300 ease-in-out ${
              isExamDetailsExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExamDetailsExpanded 
              ? 'max-h-[1000px] opacity-100 mt-4' 
              : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transform transition-transform duration-300 ease-in-out">
            <Card className="p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-200">
              <h3 className="font-medium mb-3 text-sm">Exam Information</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge  className="text-xs h-5">
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Exam Type:</span>
                  <Badge variant="outline" className="text-xs h-5">{exam.exam_type}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Selection Mode:</span>
                  <Badge variant="outline" className="text-xs h-5">{exam.selection_mode}</Badge>
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

            <Card className="p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-200">
              <h3 className="font-medium mb-3 text-sm">Instructions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {exam.instructions || "No instructions provided"}
              </p>
            </Card>

            <Card className="p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-200">
              <h3 className="font-medium mb-3 text-sm">Question Configuration</h3>
              <div className="space-y-1.5 text-xs">
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
                  <span className="font-medium">{exam.objective_count + exam.theory_count}</span>
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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attempts">
            <Users className="h-4 w-4 mr-2" />
            Student Attempts
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attempts" className="mt-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Student Attempts
                    {searchQuery && !attemptsLoading && (
                      <Badge variant="secondary" className="text-xs">
                        {pagination.total} {pagination.total === 1 ? 'result' : 'results'}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery 
                      ? `Search results for "${searchQuery}"`
                      : "View and grade student exam attempts"
                    }
                  </p>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student name or matric number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {attemptsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>{searchQuery ? "Searching..." : "Loading attempts..."}</span>
              </div>
            ) : attempts.length > 0 ? (
              <>
                {searchQuery && (
                  <div className="px-6 py-3 bg-muted/30 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Search className="h-4 w-4" />
                        <span>Search results for: <strong>"{searchQuery}"</strong></span>
                        <Badge variant="secondary" className="text-xs">
                          {pagination.total} {pagination.total === 1 ? 'result' : 'results'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="text-xs"
                      >
                        Clear search
                      </Button>
                    </div>
                  </div>
                )}
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Attempt No.</TableHead>
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
                          <p className="font-medium">
                            {attempt.student ? `${attempt.student.fname} ${attempt.student.lname}` : "Unknown Student"}
                          </p>
                          {attempt.student?.matric_number && (
                            <p className="text-sm text-muted-foreground">{attempt.student.matric_number}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          #{attempt.attempt_no}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attempt.total_score !== null && attempt.max_score !== null && attempt.total_score !== undefined && attempt.max_score !== undefined ? (
                          <span className="font-medium">
                            {attempt.total_score} / {attempt.max_score}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({Math.round((parseFloat(attempt.total_score) / parseFloat(attempt.max_score)) * 100)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {attempt.status === "in_progress" ? (
                          <Badge variant="secondary" className="text-xs">
                            In Progress
                          </Badge>
                        ) : attempt.submitted_at ? (
                          new Date(attempt.submitted_at).toLocaleString()
                        ) : (
                          "Not submitted"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGradeAttempt(attempt.id)}
                          disabled={attempt.status === "in_progress"}
                        >
                          {attempt.status === "graded" 
                            ? "View" 
                            : attempt.status === "in_progress" 
                            ? "In Progress" 
                            : "Grade"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? (
                  <div>
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No attempts found</p>
                    <p className="text-sm">
                      No student attempts match your search for "{searchQuery}".
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-4"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No attempts yet</p>
                    <p className="text-sm">No student attempts found for this exam.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Pagination Controls */}
            {attempts.length > 0 && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} 
                  {searchQuery ? ` results for "${searchQuery}"` : " attempts"}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAttempts()}
                    disabled={!pagination.hasPreviousPage || attemptsLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                      if (pageNum > pagination.totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => loadAttempts()}
                          disabled={attemptsLoading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAttempts()}
                    disabled={!pagination.hasNextPage || attemptsLoading}
                  >
                    Next
                  </Button>
                </div>
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
          studentName={selectedAttemptData?.student ? `${selectedAttemptData.student.fname} ${selectedAttemptData.student.lname}` : undefined}
          onGraded={handleGraded}
        />
      )}
    </div>
  );
};

export default AdminExamDetailsPage;

