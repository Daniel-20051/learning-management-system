import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { Api } from "@/api";
import { Loader2, Search, ArrowLeft, FileText, Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AddObjectiveQuestionDialog from "./components/AddObjectiveQuestionDialog";

const QuestionBankPage = () => {
  const api = useMemo(() => new Api(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const courseTitle = searchParams.get("courseTitle") || "Course";
  
  // Determine if we're in super-admin context
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const examsBasePath = isSuperAdmin ? "/super-admin/exams" : "/admin/exams";

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Load questions from bank
  useEffect(() => {
    if (!courseId) return;

    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await api.GetBankQuestions(Number(courseId));
        
        const responseData = (response as any)?.data;
        const questionsData = responseData?.data ?? responseData ?? [];
        const paginationData = responseData?.pagination;
        
        setQuestions(Array.isArray(questionsData) ? questionsData : []);
        
        if (paginationData) {
          setPagination({
            total: paginationData.total || 0,
            page: paginationData.page || 1,
            limit: paginationData.limit || 20,
            totalPages: paginationData.totalPages || 1,
            hasNextPage: paginationData.hasNextPage || false,
            hasPreviousPage: paginationData.hasPreviousPage || false
          });
        }
      } catch (err: any) {
        console.error("Error loading bank questions:", err);
        const message = err?.response?.data?.message || err?.message || "Failed to load questions from bank";
        toast.error(message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [api, courseId, currentPage]);

  const handleQuestionAdded = () => {
    // Reload current page after adding new question
    setCurrentPage(1); // Reset to first page to see the new question
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "objective":
        return "Objective";
      case "theory":
        return "Theory";
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      case "medium":
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      case "hard":
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      default:
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      case "pending":
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      case "rejected":
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      default:
        return "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    // Filter by search term
    if (searchTerm.trim()) {
      const questionText = q.theory?.[0]?.question_text || q.objective?.question_text || "";
      if (!questionText.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Filter by type
    if (filterType !== "all" && q.question_type !== filterType) {
      return false;
    }

    // Filter by difficulty
    if (filterDifficulty !== "all" && q.difficulty?.toLowerCase() !== filterDifficulty) {
      return false;
    }

    // Filter by status
    if (filterStatus !== "all" && q.status?.toLowerCase() !== filterStatus) {
      return false;
    }

    return true;
  });

  // Calculate statistics (use pagination total for accurate count)
  const stats = {
    total: pagination.total,
    objective: questions.filter(q => q.question_type === "objective").length,
    theory: questions.filter(q => q.question_type === "theory").length,
    approved: questions.filter(q => q.status?.toLowerCase() === "approved").length,
  };

  if (!courseId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Invalid course ID</p>
          <Button className="mt-4" onClick={() => navigate(examsBasePath)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(examsBasePath)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
            <Button onClick={() => setAddQuestionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-xl font-semibold">Question Bank</h1>
                  <p className="text-sm text-muted-foreground">{courseTitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Questions</div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded p-3">
                  <div className="text-xl font-semibold">{stats.objective}</div>
                  <div className="text-xs text-muted-foreground">Objective Questions</div>
                </div>

                <div className="border rounded p-3">
                  <div className="text-xl font-semibold">{stats.theory}</div>
                  <div className="text-xs text-muted-foreground">Theory Questions</div>
                </div>

                <div className="border rounded p-3">
                  <div className="text-xl font-semibold">{stats.approved}</div>
                  <div className="text-xs text-muted-foreground">Approved Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4 md:col-span-1">
                <Label htmlFor="search" className="text-sm mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filterType" className="text-sm mb-2 block">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="objective">Objective</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filterDifficulty" className="text-sm mb-2 block">Difficulty</Label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filterStatus" className="text-sm mb-2 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              Showing {questions.length} of {pagination.total} questions (Page {pagination.page} of {pagination.totalPages})
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-muted-foreground">Loading questions...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium mb-1">No questions found</p>
                  <p className="text-sm">
                    {questions.length === 0 
                      ? "This course doesn't have any questions in the bank yet."
                      : "Try adjusting your filters to see more questions."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question, index) => {
              const isTheory = question.question_type === "theory";
              
              // Get question data based on type
              let questionData;
              let questionText;
              
              if (isTheory) {
                // Theory questions have data in theory array
                questionData = Array.isArray(question.theory) ? question.theory[0] : question.theory;
                questionText = questionData?.question_text || "No question text";
              } else {
                // Objective questions have data in objective object
                questionData = question.objective;
                questionText = questionData?.question_text || "No question text";
              }
              
              // Handle marks - check questionData first (where marks actually are), then fallback to question level
              const maxMarks = questionData?.marks || questionData?.max_marks || questionData?.points || question.marks || "-";
              
              // Get correct option - could be correct_option (letter) or is_correct flag on options
              const correctOption = question.correct_option || questionData?.correct_option;
              
              // Parse options - could be array of objects with id/text or option_text
              const options = questionData?.options || question.options || [];

              return (
                <Card key={question.id}>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-muted-foreground">
                            Q{index + 1}
                          </span>
                          <Badge variant="secondary">
                            {getQuestionTypeLabel(question.question_type)}
                          </Badge>
                          {question.difficulty && (
                            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          )}
                          {question.status && (
                            <Badge variant="outline" className={getStatusColor(question.status)}>
                              {question.status}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-semibold">{maxMarks}</div>
                          <div className="text-xs text-muted-foreground">marks</div>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div 
                        className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: questionText }}
                      />

                      {/* Objective Options */}
                      {!isTheory && options && options.length > 0 && (
                        <div className="space-y-2 pl-4">
                          {options.map((opt: any, idx: number) => {
                            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                            const optionText = opt.text || opt.option_text || "";
                            const optionId = opt.id;
                            
                            // Check if this is the correct option
                            const isCorrect = 
                              opt.is_correct || 
                              correctOption === optionLetter || 
                              correctOption === optionId;
                            
                            return (
                              <div 
                                key={idx} 
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="font-medium text-muted-foreground shrink-0">
                                  {optionLetter}.
                                </span>
                                <span className={isCorrect ? 'font-medium' : ''}>
                                  {optionText}
                                </span>
                                {isCorrect && (
                                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Theory Rubric */}
                      {isTheory && questionData?.rubric_json && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <div className="font-medium mb-1">Marking Rubric:</div>
                          <div className="text-muted-foreground">
                            {typeof questionData.rubric_json === 'string' 
                              ? questionData.rubric_json 
                              : JSON.stringify(questionData.rubric_json, null, 2)}
                          </div>
                        </div>
                      )}

                      {/* Metadata Footer */}
                      {(question.topic || question.tags?.length > 0 || question.source_type) && (
                        <div className="flex items-center gap-3 flex-wrap pt-3 border-t text-xs text-muted-foreground">
                          {question.topic && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Topic:</span>
                              <span>{question.topic}</span>
                            </div>
                          )}
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium">Tags:</span>
                              {question.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs h-5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {question.source_type && (
                            <div className="flex items-center gap-1 ml-auto">
                              <span className="font-medium">Source:</span>
                              <span>{question.source_type}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} questions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPreviousPage || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={loading}
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
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Question Dialog */}
        <AddObjectiveQuestionDialog
          open={addQuestionOpen}
          onOpenChange={setAddQuestionOpen}
          courseId={Number(courseId)}
          onQuestionAdded={handleQuestionAdded}
        />
      </div>
    </div>
  );
};

export default QuestionBankPage;

