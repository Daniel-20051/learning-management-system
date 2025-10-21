import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Badge } from "@/Components/ui/badge";
import { Card } from "@/Components/ui/card";
import { Api } from "@/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/Components/ui/separator";

interface GradingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attemptId: number;
  studentName?: string;
  onGraded?: () => void;
}

interface Answer {
  id: number;
  question_id: number;
  question_text: string;
  question_type: string;
  points: number;
  student_answer?: string;
  selected_options?: any[];
  correct_answer?: string;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
}

const GradingDialog = ({
  open,
  onOpenChange,
  attemptId,
  studentName,
  onGraded
}: GradingDialogProps) => {
  const api = useMemo(() => new Api(), []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [grades, setGrades] = useState<Record<number, { score: number; feedback: string }>>({});

  // Load attempt details
  useEffect(() => {
    if (!open || !attemptId) return;

    const loadAttempt = async () => {
      setLoading(true);
      try {
        const response = await api.GetAttemptForGrading(attemptId);
        const data = (response as any)?.data?.data ?? (response as any)?.data ?? {};
        
        console.log("Attempt for grading:", data);
        
        const attemptAnswers = data.answers || [];
        setAnswers(attemptAnswers);
        
        // Initialize grades state with existing scores/feedback
        const initialGrades: Record<number, { score: number; feedback: string }> = {};
        attemptAnswers.forEach((answer: Answer) => {
          if (answer.question_type === "essay" || answer.question_type === "short_answer") {
            initialGrades[answer.id] = {
              score: answer.score || 0,
              feedback: answer.feedback || ""
            };
          }
        });
        setGrades(initialGrades);
      } catch (err) {
        console.error("Error loading attempt:", err);
        toast.error("Failed to load attempt details");
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [api, attemptId, open]);

  const handleGradeChange = (answerId: number, field: "score" | "feedback", value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value
      }
    }));
  };

  const handleSubmitGrades = async () => {
    setSaving(true);
    try {
      // Prepare grades array for theory questions only
      const theoryGrades = answers
        .filter(a => a.question_type === "essay" || a.question_type === "short_answer")
        .map(a => ({
          answer_id: a.id,
          score: grades[a.id]?.score || 0,
          feedback: grades[a.id]?.feedback || ""
        }));

      if (theoryGrades.length === 0) {
        toast.info("No theory questions to grade");
        return;
      }

      await api.BulkGradeTheoryAnswers(attemptId, theoryGrades);
      toast.success("Grades saved successfully!");
      onGraded?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error saving grades:", err);
      const message = err?.response?.data?.message || "Failed to save grades";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
      case "essay":
        return "Essay";
      case "short_answer":
        return "Short Answer";
      default:
        return type;
    }
  };

  const getQuestionTypeBadgeColor = (type: string) => {
    switch (type) {
      case "multiple_choice":
      case "true_false":
        return "bg-blue-100 text-blue-800";
      case "essay":
      case "short_answer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Separate answers by type
  const objectiveAnswers = answers.filter(
    a => a.question_type === "multiple_choice" || a.question_type === "true_false"
  );
  const theoryAnswers = answers.filter(
    a => a.question_type === "essay" || a.question_type === "short_answer"
  );

  const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
  const maxScore = answers.reduce((sum, a) => sum + a.points, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Grade Exam Attempt{studentName ? ` - ${studentName}` : ""}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading attempt details...</span>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Score summary */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Score</p>
                  <p className="text-2xl font-bold">
                    {totalScore} / {maxScore}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">
                    {maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>

            {/* Answers list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* Objective Questions (Auto-graded) */}
              {objectiveAnswers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Objective Questions
                    <Badge variant="outline">Auto-graded</Badge>
                  </h3>
                  <div className="space-y-3">
                    {objectiveAnswers.map((answer, idx) => (
                      <Card key={answer.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Q{idx + 1}
                                </span>
                                <Badge className={getQuestionTypeBadgeColor(answer.question_type)}>
                                  {getQuestionTypeLabel(answer.question_type)}
                                </Badge>
                              </div>
                              <p className="font-medium">{answer.question_text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {answer.is_correct ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <Badge variant={answer.is_correct ? "default" : "destructive"}>
                                {answer.score || 0} / {answer.points}
                              </Badge>
                            </div>
                          </div>
                          
                          {answer.selected_options && answer.selected_options.length > 0 && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">Student Answer:</p>
                              <p className="font-medium">
                                {answer.selected_options.map((opt: any) => opt.option_text).join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {objectiveAnswers.length > 0 && theoryAnswers.length > 0 && (
                <Separator className="my-4" />
              )}

              {/* Theory Questions (Manual grading) */}
              {theoryAnswers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Theory Questions
                    <Badge variant="outline">Manual Grading Required</Badge>
                  </h3>
                  <div className="space-y-4">
                    {theoryAnswers.map((answer, idx) => (
                      <Card key={answer.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Q{objectiveAnswers.length + idx + 1}
                                </span>
                                <Badge className={getQuestionTypeBadgeColor(answer.question_type)}>
                                  {getQuestionTypeLabel(answer.question_type)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  (Max: {answer.points} points)
                                </span>
                              </div>
                              <p className="font-medium">{answer.question_text}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm text-muted-foreground">Student Answer:</Label>
                            <div className="mt-1 p-3 bg-muted rounded-md">
                              <p className="text-sm whitespace-pre-wrap">
                                {answer.student_answer || "(No answer provided)"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`score-${answer.id}`}>Score</Label>
                              <Input
                                id={`score-${answer.id}`}
                                type="number"
                                min="0"
                                max={answer.points}
                                value={grades[answer.id]?.score || 0}
                                onChange={(e) =>
                                  handleGradeChange(answer.id, "score", parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div>
                              <Label>Status</Label>
                              <div className="h-10 flex items-center">
                                <Badge
                                  variant={
                                    grades[answer.id]?.score === answer.points
                                      ? "default"
                                      : grades[answer.id]?.score > 0
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {grades[answer.id]?.score || 0} / {answer.points}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`feedback-${answer.id}`}>Feedback (Optional)</Label>
                            <Textarea
                              id={`feedback-${answer.id}`}
                              placeholder="Provide feedback to the student..."
                              rows={2}
                              value={grades[answer.id]?.feedback || ""}
                              onChange={(e) =>
                                handleGradeChange(answer.id, "feedback", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {answers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No answers found for this attempt.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmitGrades} disabled={saving || loading || theoryAnswers.length === 0}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Grades"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradingDialog;

