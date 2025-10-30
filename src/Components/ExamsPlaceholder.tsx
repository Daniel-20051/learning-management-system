import { ClipboardList, Info, RefreshCw, Calendar, Clock, Play, ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { useState, useEffect } from "react";
import { Api } from "@/api/index";
import type { StudentExam, ExamStartResponse } from "@/types/admin";
import { useSidebarSelection } from "@/context/SidebarSelectionContext";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import ExamTakingInterface from "./ExamTakingInterface";
import { ExamAttemptsDialog } from "./ExamAttemptsDialog";

const ExamsPlaceholder = () => {
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [currentExam, setCurrentExam] = useState<ExamStartResponse['data'] | null>(null);
  const [startingExam, setStartingExam] = useState(false);
  const [attemptsDialogOpen, setAttemptsDialogOpen] = useState(false);
  const [selectedExamForAttempts, setSelectedExamForAttempts] = useState<{ id: number; title: string } | null>(null);
  const { courseId } = useSidebarSelection();
  const { selectedSession, selectedSemester } = useSession();
  const api = new Api();

  const fetchExams = async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.GetStudentExams(courseId);
      
      if (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status && 'data' in response.data) {
        const responseData = response.data as any;
        setExams(responseData.data);
        if (responseData.pagination) {
          setPagination(responseData.pagination);
        }
      } else {
        setExams([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }
    } catch (err: any) {
      console.error("Error fetching exams:", err);
      setError("Failed to load exams");
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [courseId, selectedSession, selectedSemester]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const getExamStatus = (exam: StudentExam) => {
    const now = new Date();
    const startDate = new Date(exam.start_at);
    const endDate = new Date(exam.end_at);
    
    if (now < startDate) return { status: "upcoming", color: "bg-blue-100 text-blue-800" };
    if (now > endDate) return { status: "ended", color: "bg-gray-100 text-gray-800" };
    return { status: "active", color: "bg-green-100 text-green-800" };
  };

  const handleStartExam = async (examId: number) => {
    setStartingExam(true);
    try {
      const response = await api.StartExam(examId);
      
      if (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status) {
        const responseData = response.data as any;
        setCurrentExam(responseData.data);
        toast.success("Exam started successfully!");
      } else {
        // Handle non-success response with detailed error information
        const responseData = response.data as any;
        const errorMessage = responseData?.message || responseData?.error || "Failed to start exam - invalid response";
        console.error("Failed to start exam - Response:", response);
        toast.error(`Failed to start exam: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error("Error starting exam:", err);
      
      // Extract detailed error information
      const status = err.response?.status;
      const statusText = err.response?.statusText;
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || errorData?.error || err.message;
      
      // Log full error details for debugging
      console.error("Full error details:", {
        status,
        statusText,
        errorData,
        fullError: err
      });
      
      // Create comprehensive error message
      let displayMessage = "Failed to start exam";
      
      if (status) {
        displayMessage += ` (${status}`;
        if (statusText) {
          displayMessage += ` ${statusText}`;
        }
        displayMessage += ")";
      }
      
      if (errorMessage) {
        displayMessage += `: ${errorMessage}`;
      }
      
      // Handle specific error cases
      if (status === 400) {
        if (errorMessage?.includes("already started") || errorMessage?.includes("attempt exists")) {
          displayMessage = `Exam cannot be started: ${errorMessage}`;
        } else if (errorMessage?.includes("not available") || errorMessage?.includes("not active")) {
          displayMessage = `Exam is not available: ${errorMessage}`;
        } else if (errorMessage?.includes("time") || errorMessage?.includes("expired")) {
          displayMessage = `Exam timing issue: ${errorMessage}`;
        }
      } else if (status === 403) {
        displayMessage = `Access denied: ${errorMessage || "You don't have permission to start this exam"}`;
      } else if (status === 404) {
        displayMessage = `Exam not found: ${errorMessage || "The exam may have been deleted or moved"}`;
      } else if (status === 429) {
        displayMessage = `Too many attempts: ${errorMessage || "Please wait before trying again"}`;
      } else if (status >= 500) {
        displayMessage = `Server error (${status}): ${errorMessage || "Please try again later or contact support"}`;
      }
      
      toast.error(displayMessage);
    } finally {
      setStartingExam(false);
    }
  };

  const handleBackToExams = () => {
    setCurrentExam(null);
  };

  const handleViewAttempts = (examId: number, examTitle: string) => {
    setSelectedExamForAttempts({ id: examId, title: examTitle });
    setAttemptsDialogOpen(true);
  };

  const handleCloseAttemptsDialog = () => {
    setAttemptsDialogOpen(false);
    setSelectedExamForAttempts(null);
  };

  // Show exam taking interface if an exam is started
  if (currentExam) {
    return <ExamTakingInterface examData={currentExam} onBack={handleBackToExams} />;
  }

  return (
    <div className="w-full py-4">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Main Layout with Side Component */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="pt-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Course Exams
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchExams}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
                <CardDescription>
                  View and take your course examinations when they become available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading exams...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <ClipboardList className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Error Loading Exams</h3>
                      <p className="text-muted-foreground mt-1">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchExams}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <ClipboardList className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">No Exams Available</h3>
                      <p className="text-muted-foreground mt-1">
                        There are currently no exams scheduled for this course. Check back later or contact your instructor for more information.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exams.map((exam) => {
                          const examStatus = getExamStatus(exam);
                          return (
                            <TableRow key={exam.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{exam.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {exam.objective_count + exam.theory_count} questions
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  {exam.duration_minutes} min
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(exam.start_at)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(exam.end_at)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    disabled={examStatus.status !== "active" || startingExam}
                                    className="flex items-center gap-1"
                                    onClick={() => examStatus.status === "active" && handleStartExam(exam.id)}
                                  >
                                    <Play className="w-3 h-3" />
                                    {startingExam ? "Starting..." : examStatus.status === "active" ? "Start" : "View"}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex items-center gap-1"
                                    onClick={() => handleViewAttempts(exam.id, exam.title)}
                                  >
                                    <History className="w-3 h-3" />
                                    Attempts
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} exams
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (pagination.hasPreviousPage) {
                                // TODO: Implement page change
                              }
                            }}
                            disabled={!pagination.hasPreviousPage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="text-sm font-medium">
                            Page {pagination.page} of {pagination.totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (pagination.hasNextPage) {
                                // TODO: Implement page change
                              }
                            }}
                            disabled={!pagination.hasNextPage}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Component - Instructions */}
          <div className="lg:col-span-1">
            <Card className="sticky pt-3 top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5" />
                  Exam Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-3">
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Exams will appear here when they are scheduled and available</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Make sure you have a stable internet connection before starting</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Read all instructions carefully before beginning an exam</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Contact your instructor if you encounter any technical issues</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Exam Attempts Dialog */}
      <ExamAttemptsDialog
        isOpen={attemptsDialogOpen}
        onClose={handleCloseAttemptsDialog}
        examId={selectedExamForAttempts?.id}
        examTitle={selectedExamForAttempts?.title}
      />
    </div>
  );
};

export default ExamsPlaceholder;
