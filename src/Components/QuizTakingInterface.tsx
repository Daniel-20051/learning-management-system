import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { CircularProgress } from "@/Components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";

interface Question {
  id: number;
  question_text: string;
  question_type: "single_choice" | "multiple_choice";
  points: number;
  options: {
    id: number;
    option_text: string;
    is_correct: boolean;
  }[];
}

interface QuizTakingInterfaceProps {
  quizId: number;
  attemptId?: number;
  quizTitle: string;
  durationMinutes: number;
  initialRemainingSeconds?: number;
  questions: Question[];
  onComplete: () => void;
  onExit: () => void;
}

export const QuizTakingInterface: React.FC<QuizTakingInterfaceProps> = ({
  quizId: _quizId,
  attemptId,
  quizTitle,
  durationMinutes,
  initialRemainingSeconds,
  questions,
  onComplete,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: number[] }>(
    {}
  );
  const [timeRemaining, setTimeRemaining] = useState(
    typeof initialRemainingSeconds === "number"
      ? initialRemainingSeconds
      : durationMinutes * 60
  ); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  // Percentage of time remaining for the circular timer
  const totalSeconds = durationMinutes * 60;
  const timerPercent = Math.max(
    0,
    Math.min(100, (timeRemaining / totalSeconds) * 100)
  );

  type AnswerPayload = { question_id: number; selected_option_ids: number[] };

  const buildAnswersPayload = (): AnswerPayload[] => {
    return Object.entries(answers).map(([qId, optionIds]) => {
      const cleanOptionIds = ((optionIds as number[]) || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      return {
        question_id: Number(qId),
        selected_option_ids: cleanOptionIds,
      } as AnswerPayload;
    });
  };

  const submitAttemptIfPossible = async () => {
    if (!attemptId) return;
    const api = new (await import("@/api/index")).Api();
    const payload = { answers: buildAnswersPayload() } as {
      answers: AnswerPayload[];
    };

    await api.SubmitQuizAttempt(attemptId, payload);
  };

  // Memoize handleSubmitQuiz to prevent re-creation on every render
  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitAttemptIfPossible();

      toast.success("Quiz submitted successfully!");
      onComplete();
    } catch (error) {
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onComplete, answers, attemptId]);

  // Timer effect - only runs once on mount
  useEffect(() => {
    if (timeRemaining <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up, auto-submit
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [handleSubmitQuiz]); // Only depend on handleSubmitQuiz

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const isMultipleChoice =
        currentQuestion.question_type === "multiple_choice";

      if (isMultipleChoice) {
        // Toggle option for multiple choice
        const newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter((id) => id !== optionId)
          : [...currentAnswers, optionId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        // Single choice - replace with new selection
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  // Navigation
  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Check if current question is answered
  const isQuestionAnswered = (questionId: number) => {
    const questionAnswers = answers[questionId] || [];
    return questionAnswers.length > 0;
  };

  // Get answered questions count
  const answeredQuestions = Object.keys(answers).filter((questionId) =>
    isQuestionAnswered(parseInt(questionId))
  ).length;

  // Safety check - don't render if no questions or current question is invalid
  if (!questions || questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
          <p className="text-muted-foreground mb-4">
            This quiz doesn't have any questions yet.
          </p>
          <Button onClick={onExit}>Exit Quiz</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowExitConfirm(true)}
                disabled={isSubmitting || isExiting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Quiz
              </Button>
              <div>
                <h1 className="text-xl font-bold">{quizTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <CircularProgress value={timerPercent} size={56} strokeWidth={6}>
                <span
                  className={`font-mono text-xs ${
                    timeRemaining < 300 ? "text-red-600" : "text-foreground"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </CircularProgress>

              <Badge variant="outline">
                {answeredQuestions}/{totalQuestions} answered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="pt-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                Q{currentQuestionIndex + 1}
              </span>
              {isQuestionAnswered(currentQuestion.id) && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div className="prose max-w-none">
              <p className="text-lg font-medium">
                {currentQuestion.question_text}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Points: {currentQuestion.points}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option, index) => {
                  const isSelected =
                    answers[currentQuestion.id]?.includes(option.id) || false;
                  const isMultipleChoice =
                    currentQuestion.question_type === "multiple_choice";

                  // Try different property names for the option text
                  const optionText = option.option_text;

                  return (
                    <div
                      key={option.id || index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        handleAnswerSelect(
                          currentQuestion.id,
                          option.id || index
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        {isMultipleChoice ? (
                          <div
                            className={`w-5 h-5 border-2 rounded ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                        ) : (
                          <div
                            className={`w-5 h-5 border-2 rounded-full ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && (
                              <Circle className="w-3 h-3 text-white fill-white" />
                            )}
                          </div>
                        )}
                        <span className="flex-1">{optionText}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No options available for this question.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button onClick={goToNext} disabled={isSubmitting}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit and exit?</DialogTitle>
            <DialogDescription>
              Exiting will submit your current answers for this attempt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExitConfirm(false)}
              disabled={isExiting}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsExiting(true);
                try {
                  await submitAttemptIfPossible();
                  onExit();
                } catch (e) {
                } finally {
                  setIsExiting(false);
                }
              }}
              disabled={isExiting}
            >
              {isExiting ? "Submitting..." : "Submit & Exit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
