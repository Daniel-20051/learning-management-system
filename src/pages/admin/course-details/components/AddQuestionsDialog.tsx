import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";

export interface QuestionOption {
  text: string;
  is_correct: boolean;
}

export interface Question {
  text: string;
  type: "single_choice" | "multiple_choice";
  points: number;
  options?: QuestionOption[];
}

export interface AddQuestionsDialogRef {
  openDialog: () => void;
  closeDialog: () => void;
}

interface AddQuestionsDialogProps {
  quizTitle: string;
  quizId: number;
  existingQuestions?: any[];
  onAddQuestions: (quizId: number, questions: Question[]) => Promise<void>;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddQuestionsDialog = forwardRef<
  AddQuestionsDialogRef,
  AddQuestionsDialogProps
>(
  (
    {
      quizTitle,
      quizId,
      existingQuestions = [],
      onAddQuestions,
      isLoading = false,
      open: externalOpen,
      onOpenChange,
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    // Convert existing questions from API format to component format
    const convertApiQuestionToComponentFormat = (
      apiQuestion: any
    ): Question => {
      return {
        text: apiQuestion.question_text || "",
        type: apiQuestion.question_type || "single_choice",
        points: apiQuestion.points || 1,
        options: apiQuestion.options
          ? apiQuestion.options.map((opt: any) => ({
              text: opt.text || "",
              is_correct: opt.is_correct || false,
            }))
          : [],
      };
    };

    const [questions, setQuestions] = useState<Question[]>(() => {
      // If there are existing questions, show them, otherwise start with one empty question
      if (existingQuestions && existingQuestions.length > 0) {
        return existingQuestions.map(convertApiQuestionToComponentFormat);
      }
      return [
        {
          text: "",
          type: "single_choice",
          points: 1,
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
        },
      ];
    });

    const [newQuestionsStartIndex, setNewQuestionsStartIndex] = useState(() => {
      return existingQuestions ? existingQuestions.length : 0;
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update questions when existingQuestions prop changes
    useEffect(() => {
      if (existingQuestions && existingQuestions.length > 0) {
        const convertedQuestions = existingQuestions.map(
          convertApiQuestionToComponentFormat
        );
        setQuestions(convertedQuestions);
        setNewQuestionsStartIndex(existingQuestions.length);
      } else {
        // Reset to one empty question if no existing questions
        setQuestions([
          {
            text: "",
            type: "single_choice",
            points: 1,
            options: [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ],
          },
        ]);
        setNewQuestionsStartIndex(0);
      }
    }, [existingQuestions]);

    useImperativeHandle(ref, () => ({
      openDialog: () => setOpen(true),
      closeDialog: () => {
        setOpen(false);
        resetForm();
      },
    }));

    const resetForm = () => {
      // Reset to existing questions + one empty question
      const baseQuestions =
        existingQuestions && existingQuestions.length > 0
          ? existingQuestions.map(convertApiQuestionToComponentFormat)
          : [];

      setQuestions([
        ...baseQuestions,
        {
          text: "",
          type: "single_choice",
          points: 1,
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
        },
      ]);
      setNewQuestionsStartIndex(
        existingQuestions ? existingQuestions.length : 0
      );
      setErrors({});
    };

    const validateQuestions = (): boolean => {
      const newErrors: Record<string, string> = {};
      let hasErrors = false;

      questions.forEach((question, qIndex) => {
        if (!question.text.trim()) {
          newErrors[`question_${qIndex}_text`] = "Question text is required";
          hasErrors = true;
        }

        if (question.points <= 0) {
          newErrors[`question_${qIndex}_points`] =
            "Points must be greater than 0";
          hasErrors = true;
        }

        if (
          question.type === "single_choice" ||
          question.type === "multiple_choice"
        ) {
          if (!question.options || question.options.length < 2) {
            newErrors[`question_${qIndex}_options`] =
              "At least 2 options are required";
            hasErrors = true;
          } else {
            // Check if all options have text
            const emptyOptions = question.options.some(
              (option) => !option.text.trim()
            );
            if (emptyOptions) {
              newErrors[`question_${qIndex}_options`] =
                "All options must have text";
              hasErrors = true;
            }

            // Check if at least one option is correct
            const hasCorrectOption = question.options.some(
              (option) => option.is_correct
            );
            if (!hasCorrectOption) {
              newErrors[`question_${qIndex}_correct`] =
                "At least one option must be marked as correct";
              hasErrors = true;
            }

            // For single choice, ensure only one correct answer
            if (question.type === "single_choice") {
              const correctCount = question.options.filter(
                (option) => option.is_correct
              ).length;
              if (correctCount > 1) {
                newErrors[`question_${qIndex}_correct`] =
                  "Single choice questions can only have one correct answer";
                hasErrors = true;
              }
            }
          }
        }
      });

      setErrors(newErrors);
      return !hasErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateQuestions()) {
        return;
      }

      try {
        // Only send new questions (starting from newQuestionsStartIndex)
        const newQuestions = questions.slice(newQuestionsStartIndex);

        // Filter out empty questions
        const validNewQuestions = newQuestions.filter(
          (q) => q.text.trim() !== ""
        );

        if (validNewQuestions.length === 0) {
          setOpen(false);
          return;
        }

        await onAddQuestions(quizId, validNewQuestions);
      } catch (error) {
        console.error("Error adding questions:", error);
      }
    };

    const addQuestion = () => {
      setQuestions([
        ...questions,
        {
          text: "",
          type: "single_choice",
          points: 1,
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
        },
      ]);
    };

    const removeQuestion = (index: number) => {
      // Don't allow removing existing questions, only new ones
      if (index >= newQuestionsStartIndex && questions.length > 1) {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
      }
    };

    const updateQuestion = (
      index: number,
      field: keyof Question,
      value: any
    ) => {
      const newQuestions = [...questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };

      // Reset options when changing question type
      if (field === "type") {
        if (value === "single_choice" || value === "multiple_choice") {
          newQuestions[index].options = [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ];
        } else {
          delete newQuestions[index].options;
        }
      }

      setQuestions(newQuestions);

      // Clear related errors
      const errorKey = `question_${index}_${field}`;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const { [errorKey]: _, ...rest } = prev;
          return rest;
        });
      }
    };

    const addOption = (questionIndex: number) => {
      const newQuestions = [...questions];
      if (newQuestions[questionIndex].options) {
        newQuestions[questionIndex].options!.push({
          text: "",
          is_correct: false,
        });
        setQuestions(newQuestions);
      }
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
      const newQuestions = [...questions];
      if (
        newQuestions[questionIndex].options &&
        newQuestions[questionIndex].options!.length > 2
      ) {
        newQuestions[questionIndex].options!.splice(optionIndex, 1);
        setQuestions(newQuestions);
      }
    };

    const updateOption = (
      questionIndex: number,
      optionIndex: number,
      field: keyof QuestionOption,
      value: any
    ) => {
      const newQuestions = [...questions];
      if (newQuestions[questionIndex].options) {
        newQuestions[questionIndex].options![optionIndex] = {
          ...newQuestions[questionIndex].options![optionIndex],
          [field]: value,
        };

        // For single choice, uncheck other options when one is checked
        if (
          field === "is_correct" &&
          value &&
          newQuestions[questionIndex].type === "single_choice"
        ) {
          newQuestions[questionIndex].options!.forEach((option, idx) => {
            if (idx !== optionIndex) {
              option.is_correct = false;
            }
          });
        }

        setQuestions(newQuestions);
      }
    };

    const renderQuestionOptions = (
      question: Question,
      questionIndex: number
    ) => {
      if (!question.options) return null;

      return (
        <div className="space-y-3">
          <Label>Options</Label>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <Checkbox
                checked={option.is_correct}
                onCheckedChange={(checked) =>
                  updateOption(
                    questionIndex,
                    optionIndex,
                    "is_correct",
                    checked
                  )
                }
                disabled={questionIndex < newQuestionsStartIndex}
              />
              <Input
                value={option.text}
                onChange={(e) =>
                  updateOption(
                    questionIndex,
                    optionIndex,
                    "text",
                    e.target.value
                  )
                }
                placeholder={`Option ${optionIndex + 1}`}
                className="flex-1"
                disabled={questionIndex < newQuestionsStartIndex}
                readOnly={questionIndex < newQuestionsStartIndex}
              />
              {question.options!.length > 2 &&
                questionIndex >= newQuestionsStartIndex && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(questionIndex, optionIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
            </div>
          ))}
          {questionIndex >= newQuestionsStartIndex && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addOption(questionIndex)}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          )}
          {errors[`question_${questionIndex}_options`] && (
            <p className="text-sm text-red-500">
              {errors[`question_${questionIndex}_options`]}
            </p>
          )}
          {errors[`question_${questionIndex}_correct`] && (
            <p className="text-sm text-red-500">
              {errors[`question_${questionIndex}_correct`]}
            </p>
          )}
        </div>
      );
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Questions to {quizTitle}</DialogTitle>
            <DialogDescription>
              Add questions to your quiz. You can create different types of
              questions with multiple options.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <Card
                  key={questionIndex}
                  className={
                    questionIndex < newQuestionsStartIndex
                      ? "bg-gray-50 pt-3 border-gray-300"
                      : "pt-3"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Question {questionIndex + 1}
                        {questionIndex < newQuestionsStartIndex && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Existing
                          </span>
                        )}
                        {questionIndex >= newQuestionsStartIndex && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </CardTitle>
                      {questions.length > 1 &&
                        questionIndex >= newQuestionsStartIndex && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question_${questionIndex}_text`}>
                        Question Text *
                      </Label>
                      <Textarea
                        id={`question_${questionIndex}_text`}
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(questionIndex, "text", e.target.value)
                        }
                        placeholder="Enter your question"
                        className={
                          errors[`question_${questionIndex}_text`]
                            ? "border-red-500"
                            : ""
                        }
                        rows={2}
                        disabled={questionIndex < newQuestionsStartIndex}
                        readOnly={questionIndex < newQuestionsStartIndex}
                      />
                      {errors[`question_${questionIndex}_text`] && (
                        <p className="text-sm text-red-500">
                          {errors[`question_${questionIndex}_text`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question_${questionIndex}_type`}>
                          Question Type
                        </Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            updateQuestion(questionIndex, "type", value)
                          }
                          disabled={questionIndex < newQuestionsStartIndex}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_choice">
                              Single Choice
                            </SelectItem>
                            <SelectItem value="multiple_choice">
                              Multiple Choice
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`question_${questionIndex}_points`}>
                          Points *
                        </Label>
                        <Input
                          id={`question_${questionIndex}_points`}
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
                          className={
                            errors[`question_${questionIndex}_points`]
                              ? "border-red-500"
                              : ""
                          }
                          disabled={questionIndex < newQuestionsStartIndex}
                          readOnly={questionIndex < newQuestionsStartIndex}
                        />
                        {errors[`question_${questionIndex}_points`] && (
                          <p className="text-sm text-red-500">
                            {errors[`question_${questionIndex}_points`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {(question.type === "single_choice" ||
                      question.type === "multiple_choice") &&
                      renderQuestionOptions(question, questionIndex)}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Question
            </Button>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Questions"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

AddQuestionsDialog.displayName = "AddQuestionsDialog";

export default AddQuestionsDialog;
