import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Api } from "@/api";
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { toast } from "sonner";
import ConfirmDialog from "@/Components/ConfirmDialog";

// Local interface definition as fallback
interface Exam {
  id: number;
  course_id: number;
  academic_year?: string;
  semester?: string;
  title: string;
  instructions?: string;
  start_at?: string;
  end_at?: string;
  duration_minutes: number;
  visibility?: "draft" | "published" | "archived";
  randomize?: boolean;
  exam_type?: "objective-only" | "theory-only" | "mixed";
  selection_mode?: "manual" | "random";
  objective_count?: number;
  theory_count?: number;
  max_attempts?: number;
  created_by?: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at?: string;
  total_questions?: number;
  attempts_count?: number;
  questions?: any[];
}


const AdminCourseExamsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => new Api(), []);
  
  // Determine if we're in super-admin context
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const examsBasePath = isSuperAdmin ? "/super-admin/exams" : "/admin/exams";
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Academic sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    duration_minutes: 60,
    status: "draft" as "draft" | "published" | "archived",
    academic_year: "",
    semester: "",
    start_at: "",
    end_at: "",
    visibility: "draft" as "draft" | "published" | "archived",
    randomize: false,
    exam_type: "mixed" as "objective-only" | "theory-only" | "mixed",
    selection_mode: "manual" as "manual" | "random",
    objective_count: 10,
    theory_count: 5
  });

  const session = searchParams.get("session") || "";

  // Load academic sessions
  useEffect(() => {
    const loadSessions = async () => {
      setSessionsLoading(true);
      try {
        const response = await api.Getsessions();
        const items = response?.data?.data ?? response?.data ?? [];
        
        if (Array.isArray(items) && items.length > 0) {
          setSessions(items);
          
          // Build unique academic year list
          const uniqueYears = Array.from(
            new Set(items.map((it: any) => it.academic_year))
          );
          setAcademicYears(uniqueYears as string[]);
          
          // Find active session or default to first
          const active = items.find((it: any) => it.status === "Active");
          const defaultYear = active?.academic_year || uniqueYears[0];
          const defaultSemester = active?.semester || items[0]?.semester;
          
          if (defaultYear) {
            setFormData(prev => ({
              ...prev,
              academic_year: defaultYear,
              semester: defaultSemester || ""
            }));
            
            // Set available semesters for default year
            const semestersForYear = items
              .filter((it: any) => it.academic_year === defaultYear)
              .map((it: any) => it.semester);
            setAvailableSemesters(Array.from(new Set(semestersForYear)));
          }
        }
      } catch (err: any) {
        console.error("Error loading sessions:", err);
        toast.error("Failed to load academic sessions");
      } finally {
        setSessionsLoading(false);
      }
    };
    
    loadSessions();
  }, [api]);

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

  // Load exams
  useEffect(() => {
    if (!courseId) return;
    
    const loadExams = async () => {
      setLoading(true);
      try {
        // This would be the new exam API endpoint
        const courseIdNum = parseInt(courseId);
        const response = await api.GetExams(courseIdNum, currentPage, 20);
        const responseData = (response as any)?.data;
        
        if (responseData?.status && responseData?.data) {
          // Handle new response format
          setExams(Array.isArray(responseData.data) ? responseData.data : []);
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
        } else {
          // Fallback for old format
          const data = responseData?.data ?? responseData ?? [];
          setExams(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading exams:", err);
        setExams([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadExams();
  }, [api, courseId, currentPage]);

  const handleCreateExam = async () => {
    if (!courseId) return;
    
    if (!formData.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }
    
    if (!formData.academic_year) {
      toast.error("Please select an academic year");
      return;
    }
    
    if (!formData.semester) {
      toast.error("Please select a semester");
      return;
    }
    
    setCreateLoading(true);
    try {
      const examData: any = {
        course_id: parseInt(courseId),
        title: formData.title,
        duration_minutes: formData.duration_minutes,
        status: formData.status,
        academic_year: formData.academic_year,
        semester: formData.semester,
        visibility: formData.visibility,
        randomize: formData.randomize,
        exam_type: formData.exam_type,
        selection_mode: formData.selection_mode,
        objective_count: formData.objective_count,
        theory_count: formData.theory_count
      };

      if (formData.instructions.trim()) {
        examData.instructions = formData.instructions;
      }

      if (formData.start_at) {
        examData.start_at = formData.start_at;
      }

      if (formData.end_at) {
        examData.end_at = formData.end_at;
      }

      const response = await api.CreateExam(examData);
      
      if ((response as any)?.data?.success || (response as any)?.status === 200 || (response as any)?.status === 201) {
        toast.success("Exam created successfully!");
        
        // Reload exams
        const courseIdNum = parseInt(courseId);
        const examsResponse = await api.GetExams(courseIdNum, currentPage, 20);
        const responseData = (examsResponse as any)?.data;
        
        if (responseData?.status && responseData?.data) {
          setExams(Array.isArray(responseData.data) ? responseData.data : []);
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
        } else {
          const data = responseData?.data ?? responseData ?? [];
          setExams(Array.isArray(data) ? data : []);
        }
        
        // Reset form and close dialog
        const active = sessions.find((it: any) => it.status === "Active");
        const defaultYear = active?.academic_year || academicYears[0] || "";
        const defaultSemester = active?.semester || "";
        
        setFormData({
          title: "",
          instructions: "",
          duration_minutes: 60,
          status: "draft",
          academic_year: defaultYear,
          semester: defaultSemester,
          start_at: "",
          end_at: "",
          visibility: "draft",
          randomize: false,
          exam_type: "mixed",
          selection_mode: "manual",
          objective_count: 10,
          theory_count: 5
        });
        setIsCreateDialogOpen(false);
      } else {
        toast.error("Failed to create exam. Please try again.");
      }
    } catch (err: any) {
      console.error("Error creating exam:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to create exam. Please try again.";
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditExam = async () => {
    if (!editingExam) return;
    
    if (!formData.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }
    
    setEditLoading(true);
    try {
      const updateData: any = {
        title: formData.title,
        duration_minutes: formData.duration_minutes,
        status: formData.status,
        visibility: formData.visibility,
        randomize: formData.randomize,
        exam_type: formData.exam_type,
        selection_mode: formData.selection_mode,
        objective_count: formData.objective_count,
        theory_count: formData.theory_count
      };

      if (formData.instructions.trim()) {
        updateData.instructions = formData.instructions;
      }

      if (formData.start_at) {
        updateData.start_at = formData.start_at;
      }

      if (formData.end_at) {
        updateData.end_at = formData.end_at;
      }

      const response = await api.UpdateExam(editingExam.id, updateData);
      
      if ((response as any)?.data?.success || (response as any)?.status === 200) {
        toast.success("Exam updated successfully!");
        
        // Reload exams
        const courseIdNum = parseInt(courseId!);
        const examsResponse = await api.GetExams(courseIdNum, currentPage, 20);
        const responseData = (examsResponse as any)?.data;
        
        if (responseData?.status && responseData?.data) {
          setExams(Array.isArray(responseData.data) ? responseData.data : []);
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
        } else {
          const data = responseData?.data ?? responseData ?? [];
          setExams(Array.isArray(data) ? data : []);
        }
        
        // Reset form and close dialog
        setEditingExam(null);
        setFormData({
          title: "",
          instructions: "",
          duration_minutes: 60,
          status: "draft",
          academic_year: "2024/2025",
          semester: "1ST",
          start_at: "",
          end_at: "",
          visibility: "draft",
          randomize: false,
          exam_type: "mixed",
          selection_mode: "manual",
          objective_count: 10,
          theory_count: 5
        });
        setIsEditDialogOpen(false);
      } else {
        toast.error("Failed to update exam. Please try again.");
      }
    } catch (err: any) {
      console.error("Error updating exam:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to update exam. Please try again.";
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteExam = async (examId: number) => {
    setExamToDelete(examId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await api.DeleteExam(examToDelete);
      
      if ((response as any)?.data?.success || (response as any)?.status === 200) {
        toast.success("Exam deleted successfully!");
        
        // Reload exams
        const courseIdNum = parseInt(courseId!);
        const examsResponse = await api.GetExams(courseIdNum, currentPage, 20);
        const responseData = (examsResponse as any)?.data;
        
        if (responseData?.status && responseData?.data) {
          setExams(Array.isArray(responseData.data) ? responseData.data : []);
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
        } else {
          const data = responseData?.data ?? responseData ?? [];
          setExams(Array.isArray(data) ? data : []);
        }
      } else {
        toast.error("Failed to delete exam. Please try again.");
      }
    } catch (err: any) {
      console.error("Error deleting exam:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to delete exam. Please try again.";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setExamToDelete(null);
    }
  };

  const cancelDeleteExam = () => {
    setIsDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  const openEditDialog = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      instructions: exam.instructions || "",
      duration_minutes: exam.duration_minutes,
      status: exam.status,
      academic_year: exam.academic_year || "2024/2025",
      semester: exam.semester || "1ST",
      start_at: exam.start_at ? exam.start_at.slice(0, 16) : "", // Format for datetime-local input
      end_at: exam.end_at ? exam.end_at.slice(0, 16) : "",
      visibility: exam.visibility || exam.status,
      randomize: exam.randomize || false,
      exam_type: exam.exam_type || "mixed",
      selection_mode: exam.selection_mode || "manual",
      objective_count: exam.objective_count || 10,
      theory_count: exam.theory_count || 5
    });
    setIsEditDialogOpen(true);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {courseInfo?.title || courseInfo?.course_title || "Course"} - Exams
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage exams for this course
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`${examsBasePath}?session=${encodeURIComponent(session)}`)}
          >
            Back to Exams
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter exam title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Enter exam instructions for students"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academic_year">Academic Year *</Label>
                    <Select 
                      value={formData.academic_year} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, academic_year: value, semester: "" });
                        // Update available semesters for selected year
                        const semestersForYear = sessions
                          .filter((it: any) => it.academic_year === value)
                          .map((it: any) => it.semester);
                        setAvailableSemesters(Array.from(new Set(semestersForYear)));
                      }}
                      disabled={sessionsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={sessionsLoading ? "Loading..." : "Select academic year"} />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester *</Label>
                    <Select 
                      value={formData.semester} 
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                      disabled={!formData.academic_year || availableSemesters.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.academic_year ? "Select year first" : "Select semester"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSemesters.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_at">Start Date & Time</Label>
                    <Input
                      id="start_at"
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_at">End Date & Time</Label>
                    <Input
                      id="end_at"
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exam_type">Exam Type</Label>
                    <Select value={formData.exam_type} onValueChange={(value: "objective-only" | "theory-only" | "mixed") => setFormData({ ...formData, exam_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="objective-only">Objective Only</SelectItem>
                        <SelectItem value="theory-only">Theory Only</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="selection_mode">Selection Mode</Label>
                    <Select value={formData.selection_mode} onValueChange={(value: "manual" | "random") => setFormData({ ...formData, selection_mode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Selection</SelectItem>
                        <SelectItem value="random">Random Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.selection_mode === "random" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="objective_count">Objective Questions Count</Label>
                      <Input
                        id="objective_count"
                        type="number"
                        min="0"
                        value={formData.objective_count}
                        onChange={(e) => setFormData({ ...formData, objective_count: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="theory_count">Theory Questions Count</Label>
                      <Input
                        id="theory_count"
                        type="number"
                        min="0"
                        value={formData.theory_count}
                        onChange={(e) => setFormData({ ...formData, theory_count: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: "draft" | "published" | "archived") => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="randomize"
                      checked={formData.randomize}
                      onCheckedChange={(checked) => setFormData({ ...formData, randomize: checked })}
                    />
                    <Label htmlFor="randomize">Randomize Questions</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateExam} disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Exam"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Max Attempts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={10} className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading exams…
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && exams.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-sm text-muted-foreground">
                  No exams found for this course.
                </TableCell>
              </TableRow>
            )}
            {!loading && exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.academic_year || '-'}</TableCell>
                <TableCell>{exam.semester || '-'}</TableCell>
                <TableCell>{exam.duration_minutes} min</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {exam.exam_type === 'mixed' ? 'Mixed' : 
                     exam.exam_type === 'objective-only' ? 'Objective' : 
                     exam.exam_type === 'theory-only' ? 'Theory' : 'Mixed'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(exam.visibility || exam.status)}>
                    {exam.visibility || exam.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Obj: {exam.objective_count || 0}</div>
                    <div>Theory: {exam.theory_count || 0}</div>
                  </div>
                </TableCell>
                <TableCell>{exam.max_attempts || 'Unlimited'}</TableCell>
                <TableCell>{new Date(exam.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`${examsBasePath}/${courseId}/${exam.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(exam)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} exams
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPreviousPage || loading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter exam title"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Enter exam instructions for students"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start_at">Start Date & Time</Label>
                <Input
                  id="edit-start_at"
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-end_at">End Date & Time</Label>
                <Input
                  id="edit-end_at"
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-exam_type">Exam Type</Label>
                <Select value={formData.exam_type} onValueChange={(value: "objective-only" | "theory-only" | "mixed") => setFormData({ ...formData, exam_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="objective-only">Objective Only</SelectItem>
                    <SelectItem value="theory-only">Theory Only</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-selection_mode">Selection Mode</Label>
                <Select value={formData.selection_mode} onValueChange={(value: "manual" | "random") => setFormData({ ...formData, selection_mode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                    <SelectItem value="random">Random Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.selection_mode === "random" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-objective_count">Objective Questions Count</Label>
                  <Input
                    id="edit-objective_count"
                    type="number"
                    min="0"
                    value={formData.objective_count}
                    onChange={(e) => setFormData({ ...formData, objective_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-theory_count">Theory Questions Count</Label>
                  <Input
                    id="edit-theory_count"
                    type="number"
                    min="0"
                    value={formData.theory_count}
                    onChange={(e) => setFormData({ ...formData, theory_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: "draft" | "published" | "archived") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit-randomize"
                  checked={formData.randomize}
                  onCheckedChange={(checked) => setFormData({ ...formData, randomize: checked })}
                />
                <Label htmlFor="edit-randomize">Randomize Questions</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={editLoading}>
                Cancel
              </Button>
              <Button onClick={handleEditExam} disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Exam"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteExam}
        onCancel={cancelDeleteExam}
        isProcessing={deleteLoading}
      />
    </div>
  );
};

export default AdminCourseExamsPage;
