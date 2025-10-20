import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
  exam_type?: "objective" | "theory" | "mixed";
  selection_mode?: "all" | "random";
  objective_count?: number;
  theory_count?: number;
  description?: string;
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
  const api = useMemo(() => new Api(), []);
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    description: "",
    duration_minutes: 60,
    status: "draft" as "draft" | "published" | "archived",
    academic_year: "2024",
    semester: "first",
    start_at: "",
    end_at: "",
    visibility: "draft" as "draft" | "published" | "archived",
    randomize: false,
    exam_type: "mixed" as "objective" | "theory" | "mixed",
    selection_mode: "all" as "all" | "random",
    objective_count: 10,
    theory_count: 5
  });

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

  // Load exams
  useEffect(() => {
    if (!courseId) return;
    
    const loadExams = async () => {
      setLoading(true);
      try {
        // This would be the new exam API endpoint
        const response = await api.GetExams(parseInt(courseId));
        const data = (response as any)?.data?.data ?? (response as any)?.data ?? [];
        setExams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading exams:", err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadExams();
  }, [api, courseId]);

  const handleCreateExam = async () => {
    if (!courseId) return;
    
    if (!formData.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }
    
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
      
      if (formData.description.trim()) {
        examData.description = formData.description;
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
        const examsResponse = await api.GetExams(parseInt(courseId));
        const data = (examsResponse as any)?.data?.data ?? (examsResponse as any)?.data ?? [];
        setExams(Array.isArray(data) ? data : []);
        
        // Reset form and close dialog
        setFormData({
          title: "",
          instructions: "",
          description: "",
          duration_minutes: 60,
          status: "draft",
          academic_year: "2024",
          semester: "first",
          start_at: "",
          end_at: "",
          visibility: "draft",
          randomize: false,
          exam_type: "mixed",
          selection_mode: "all",
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
    }
  };

  const handleEditExam = async () => {
    if (!editingExam) return;
    
    if (!formData.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }
    
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
      
      if (formData.description.trim()) {
        updateData.description = formData.description;
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
        const examsResponse = await api.GetExams(parseInt(courseId!));
        const data = (examsResponse as any)?.data?.data ?? (examsResponse as any)?.data ?? [];
        setExams(Array.isArray(data) ? data : []);
        
        // Reset form and close dialog
        setEditingExam(null);
        setFormData({
          title: "",
          instructions: "",
          description: "",
          duration_minutes: 60,
          status: "draft",
          academic_year: "2024",
          semester: "first",
          start_at: "",
          end_at: "",
          visibility: "draft",
          randomize: false,
          exam_type: "mixed",
          selection_mode: "all",
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
    }
  };

  const handleDeleteExam = async (examId: number) => {
    if (!confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
    
    try {
      const response = await api.DeleteExam(examId);
      
      if ((response as any)?.data?.success || (response as any)?.status === 200) {
        toast.success("Exam deleted successfully!");
        
        // Reload exams
        const examsResponse = await api.GetExams(parseInt(courseId!));
        const data = (examsResponse as any)?.data?.data ?? (examsResponse as any)?.data ?? [];
        setExams(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to delete exam. Please try again.");
      }
    } catch (err: any) {
      console.error("Error deleting exam:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to delete exam. Please try again.";
      toast.error(message);
    }
  };

  const openEditDialog = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      instructions: exam.instructions || "",
      description: exam.description || "",
      duration_minutes: exam.duration_minutes,
      status: exam.status,
      academic_year: exam.academic_year || "2024",
      semester: exam.semester || "first",
      start_at: exam.start_at ? exam.start_at.slice(0, 16) : "", // Format for datetime-local input
      end_at: exam.end_at ? exam.end_at.slice(0, 16) : "",
      visibility: exam.visibility || exam.status,
      randomize: exam.randomize || false,
      exam_type: exam.exam_type || "mixed",
      selection_mode: exam.selection_mode || "all",
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
            onClick={() => navigate(`/admin/exams?session=${encodeURIComponent(session)}`)}
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter exam description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Input
                      id="academic_year"
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
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
                    <Select value={formData.exam_type} onValueChange={(value: "objective" | "theory" | "mixed") => setFormData({ ...formData, exam_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="objective">Objective</SelectItem>
                        <SelectItem value="theory">Theory</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="selection_mode">Selection Mode</Label>
                    <Select value={formData.selection_mode} onValueChange={(value: "all" | "random") => setFormData({ ...formData, selection_mode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Questions</SelectItem>
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
                  <Button onClick={handleCreateExam}>
                    Create Exam
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
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading exams…
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && exams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  No exams found for this course.
                </TableCell>
              </TableRow>
            )}
            {!loading && exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.duration_minutes} min</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status}
                  </Badge>
                </TableCell>
                <TableCell>{exam.total_questions || 0}</TableCell>
                <TableCell>{new Date(exam.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/exams/${courseId}/${exam.id}`)}
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

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter exam description"
                rows={2}
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
                <Select value={formData.exam_type} onValueChange={(value: "objective" | "theory" | "mixed") => setFormData({ ...formData, exam_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="objective">Objective</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-selection_mode">Selection Mode</Label>
                <Select value={formData.selection_mode} onValueChange={(value: "all" | "random") => setFormData({ ...formData, selection_mode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Questions</SelectItem>
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
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditExam}>
                Update Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseExamsPage;
