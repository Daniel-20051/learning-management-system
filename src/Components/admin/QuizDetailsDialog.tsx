import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Clock, HelpCircle, CheckCircle, X } from "lucide-react";

export interface QuizDetailsDialogRef {
  openDialog: (quiz: any) => void;
  closeDialog: () => void;
}

interface QuizDetailsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QuizDetailsDialog = forwardRef<
  QuizDetailsDialogRef,
  QuizDetailsDialogProps
>(({ open, onOpenChange }, ref) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useImperativeHandle(ref, () => ({
    openDialog: (quiz: any) => {
      setSelectedQuiz(quiz);
      setIsOpen(true);
    },
    closeDialog: () => {
      setIsOpen(false);
      setSelectedQuiz(null);
    },
  }));

  const handleClose = () => {
    setIsOpen(false);
    setSelectedQuiz(null);
  };

  if (!selectedQuiz) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] mt-7 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {selectedQuiz.title}
          </DialogTitle>
          <DialogDescription>
            Quiz details and questions for this module
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Information */}
          <Card className="pt-3">
            <CardHeader>
              <CardTitle className="text-lg">Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-sm mt-1">
                    {selectedQuiz.description || "No description"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={
                        selectedQuiz.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {selectedQuiz.status || "draft"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Duration
                  </label>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedQuiz.duration_minutes} minutes
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Attempts Allowed
                  </label>
                  <p className="text-sm mt-1">
                    {selectedQuiz.attempts_allowed}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total Questions
                  </label>
                  <p className="text-sm mt-1">
                    {selectedQuiz.questions?.length || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="text-sm mt-1">
                    {selectedQuiz.created_at
                      ? new Date(selectedQuiz.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card className="pt-3">
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                <div className="space-y-4">
                  {selectedQuiz.questions.map(
                    (question: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-sm">
                            Question {index + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.question_type?.replace("_", " ") ||
                                "Unknown"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.points} point
                              {question.points !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm mb-3">{question.question_text}</p>

                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">
                              Options:
                            </label>
                            <div className="space-y-1">
                              {question.options.map(
                                (option: any, optionIndex: number) => (
                                  <div
                                    key={optionIndex}
                                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                                      option.is_correct
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    {option.is_correct ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <X className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span
                                      className={
                                        option.is_correct
                                          ? "text-green-800"
                                          : "text-gray-700"
                                      }
                                    >
                                      {option.text}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No questions added to this quiz yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

QuizDetailsDialog.displayName = "QuizDetailsDialog";

export default QuizDetailsDialog;
