import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Api } from "@/api";
import { Loader2, ArrowLeft, Edit, Trash2, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

// Local interface definitions as fallback
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

const AdminExamDetailsPage = () => {
  const { courseId, examId } = useParams<{ courseId: string; examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = useMemo(() => new Api(), []);
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);

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
        const data = response?.data?.data ?? response?.data;
        setExam(data);
      } catch (err) {
        console.error("Error loading exam:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadExam();
  }, [api, examId]);

  const handleDeleteExam = async () => {
    if (!exam || !confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
    
    try {
      const response = await api.DeleteExam(exam.id);
      
      if (response?.data?.success || response?.status === 200) {
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
              <Badge className={getStatusColor(exam.status)}>
                {exam.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{exam.duration_minutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions:</span>
              <span>{exam.total_questions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(exam.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            {exam.description || "No description provided"}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Attempts:</span>
              <span>{exam.attempts_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions:</span>
              <span>{exam.total_questions || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions</h3>
            <Button size="sm">
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
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Question
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminExamDetailsPage;
