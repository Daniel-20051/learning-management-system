import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

export interface Question {
  id?: number;
  html: string;
  points: number;
  type?: "single_choice" | "multiple_choice"; // default single_choice when absent
  options: Option[];
}

export interface Option {
  id?: number;
  option_text: string;
  is_correct: boolean;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  status: string;
  questions?: Question[];
}

export interface EditQuizDialogRef {
  openDialog: (quiz: Quiz) => void;
  closeDialog: () => void;
}

interface EditQuizDialogProps {
  onUpdateQuiz: (
    quizId: number,
    quizData: Partial<Quiz>,
    questions: Question[]
  ) => Promise<void>;
  isLoading?: boolean;
}

const EditQuizDialog = forwardRef<EditQuizDialogRef, EditQuizDialogProps>(
  ({ onUpdateQuiz, isLoading = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      duration_minutes: 30,
      status: "draft",
    });
    const [questions, setQuestions] = useState<Question[]>([]);

    useImperativeHandle(ref, () => ({
      openDialog: (quizData: Quiz | any) => {
        setQuiz(quizData as Quiz);
        setFormData({
          title: (quizData as any).title || "",
          description: (quizData as any).description || "",
          duration_minutes: (quizData as any).duration_minutes || 30,
          status: (quizData as any).status || "draft",
        });

        // Normalize incoming questions to editor shape
        let normalizedQuestions: Question[] = Array.isArray(
          (quizData as any).questions
        )
          ? (quizData as any).questions.map((q: any) => ({
              id: q.id,
              html: q.html ?? q.question_text ?? "",
              points: q.points ?? 1,
              type: q.type ?? q.question_type ?? "single_choice",
              options: Array.isArray(q.options)
                ? q.options.map((o: any) => ({
                    id: o.id,
                    option_text: o.option_text ?? o.text ?? "",
                    is_correct: !!o.is_correct,
                  }))
                : [],
            }))
          : [];

        // Ensure single_choice questions do not keep multiple correct answers
        normalizedQuestions = normalizedQuestions.map((q) => {
          if ((q.type ?? "single_choice") !== "single_choice") return q;
          let found = false;
          return {
            ...q,
            options: q.options.map((o) => {
              if (o.is_correct && !found) {
                found = true;
                return o;
              }
              return {
                ...o,
                is_correct: o.is_correct && found ? false : o.is_correct,
              };
            }),
          };
        });

        setQuestions(normalizedQuestions);
        setIsOpen(true);
      },
      closeDialog: () => {
        setIsOpen(false);
        setTimeout(() => {
          setQuiz(null);
          setFormData({
            title: "",
            description: "",
            duration_minutes: 30,
            status: "draft",
          });
          setQuestions([]);
        }, 300);
      },
    }));

    const handleInputChange = (field: string, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const addQuestion = () => {
      const newQuestion: Question = {
        html: "",
        points: 1,
        type: "single_choice",
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      };
      setQuestions((prev) => [...prev, newQuestion]);
    };

    const updateQuestion = (
      index: number,
      field: keyof Question,
      value: any
    ) => {
      setQuestions((prev) =>
        prev.map((q, i) => {
          if (i !== index) return q;
          // When switching to single_choice, normalize options to at most one correct
          if (field === "type") {
            const nextType = value as "single_choice" | "multiple_choice";
            if (nextType === "single_choice") {
              let found = false;
              const normalizedOptions = (q.options || []).map((o) => {
                if (o.is_correct && !found) {
                  found = true;
                  return o;
                }
                return {
                  ...o,
                  is_correct: o.is_correct && found ? false : o.is_correct,
                };
              });
              return { ...q, type: nextType, options: normalizedOptions };
            }
            return { ...q, type: nextType };
          }
          return { ...q, [field]: value } as Question;
        })
      );
    };

    const addOption = (questionIndex: number) => {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === questionIndex
            ? {
                ...q,
                options: [...q.options, { option_text: "", is_correct: false }],
              }
            : q
        )
      );
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === questionIndex
            ? {
                ...q,
                options: q.options.filter((_, oi) => oi !== optionIndex),
              }
            : q
        )
      );
    };

    const updateOption = (
      questionIndex: number,
      optionIndex: number,
      field: keyof Option,
      value: any
    ) => {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === questionIndex
            ? {
                ...q,
                options: q.options.map((o, oi) =>
                  oi === optionIndex ? { ...o, [field]: value } : o
                ),
              }
            : q
        )
      );
    };

    const handleCorrectOptionChange = (
      questionIndex: number,
      optionIndex: number,
      isCorrect: boolean
    ) => {
      setQuestions((prev) =>
        prev.map((q, i) => {
          if (i !== questionIndex) return q;
          const isSingle = (q.type ?? "single_choice") === "single_choice";
          return {
            ...q,
            options: q.options.map((o, oi) =>
              isSingle
                ? { ...o, is_correct: oi === optionIndex ? isCorrect : false }
                : oi === optionIndex
                ? { ...o, is_correct: isCorrect }
                : o
            ),
          };
        })
      );
    };

    const handleSave = async () => {
      if (!quiz) return;

      // Validate form
      if (!formData.title.trim()) {
        toast.error("Please enter a quiz title");
        return;
      }

      if (formData.duration_minutes < 1) {
        toast.error("Duration must be at least 1 minute");
        return;
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.html.trim()) {
          toast.error(`Question ${i + 1} cannot be empty`);
          return;
        }
        if (question.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options`);
          return;
        }
        const hasCorrectAnswer = question.options.some((opt) => opt.is_correct);
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} must have a correct answer`);
          return;
        }
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].option_text.trim()) {
            toast.error(`Question ${i + 1}, Option ${j + 1} cannot be empty`);
            return;
          }
        }
      }

      try {
        await onUpdateQuiz(quiz.id, formData, questions);
      } catch (error) {
        // Error handling is done in the parent component
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] sm:w-auto sm:max-w-6xl max-h-[90vh] mt-7 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">Edit Quiz</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row h-auto md:h-[calc(90vh-120px)]">
            {/* Left Sidebar - Quiz Details */}
            <div className="w-full md:w-80 border-b md:border-r bg-muted/30 p-4 md:p-6 overflow-y-auto max-h-[40vh] md:max-h-none md:h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quiz Details</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter quiz title"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Enter quiz description"
                        className="mt-1 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          handleInputChange(
                            "duration_minutes",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Questions Summary</h4>
                    <Badge variant="outline">
                      {questions.length} questions
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {questions.map((q, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-background rounded border"
                      >
                        <div className="font-medium">Q{index + 1}</div>
                        <div className="text-muted-foreground truncate">
                          {q.html || "Untitled question"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {q.options.length} options • {q.points} points
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Questions */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto md:h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-lg mb-2">No questions yet</div>
                    <div className="text-sm">
                      Click "Add Question" to get started
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((question, questionIndex) => (
                      <Card key={questionIndex} className="pt-3">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Question {questionIndex + 1}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Label>Points:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={question.points}
                                  onChange={(e) =>
                                    updateQuestion(
                                      questionIndex,
                                      "points",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-16 h-8"
                                />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Question Text</Label>
                            <Textarea
                              value={question.html}
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "html",
                                  e.target.value
                                )
                              }
                              placeholder="Enter your question here..."
                              className="mt-1 min-h-[80px]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Question Type</Label>
                              <Select
                                value={question.type ?? "single_choice"}
                                onValueChange={(val) =>
                                  updateQuestion(
                                    questionIndex,
                                    "type",
                                    val as "single_choice" | "multiple_choice"
                                  )
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single_choice">
                                    Single choice
                                  </SelectItem>
                                  <SelectItem value="multiple_choice">
                                    Multiple choice
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <Label>Answer Options</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(questionIndex)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Option
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                  <Checkbox
                                    checked={option.is_correct}
                                    onCheckedChange={(checked) =>
                                      handleCorrectOptionChange(
                                        questionIndex,
                                        optionIndex,
                                        !!checked
                                      )
                                    }
                                  />
                                  <div className="flex-1">
                                    <Input
                                      value={option.option_text}
                                      onChange={(e) =>
                                        updateOption(
                                          questionIndex,
                                          optionIndex,
                                          "option_text",
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                  </div>
                                  {question.options.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeOption(questionIndex, optionIndex)
                                      }
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {(question.type ?? "single_choice") ===
                              "single_choice"
                                ? "Select exactly one correct option"
                                : "Select one or more correct options"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

EditQuizDialog.displayName = "EditQuizDialog";

export default EditQuizDialog;
