import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { CircularProgress } from "@/Components/ui/circular-progress";
import { useBeforeUnload, useNavigate } from "react-router-dom";
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
  courseId: number;
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
  courseId,
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const navigate = useNavigate();

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

  // Check if current question is answered
  const isQuestionAnswered = (questionId: number) => {
    const questionAnswers = answers[questionId] || [];
    return questionAnswers.length > 0;
  };

  // Get answered questions count
  const answeredQuestions = Object.keys(answers).filter((questionId) =>
    isQuestionAnswered(parseInt(questionId))
  ).length;

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return questions.every((question) => isQuestionAnswered(question.id));
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
    if (isSubmitting || isSubmitted) return;

    // Check if all questions are answered before submission
    if (!areAllQuestionsAnswered()) {
      const unansweredCount = questions.length - answeredQuestions;
      toast.error(
        `Please answer all questions before submitting. ${unansweredCount} question${
          unansweredCount > 1 ? "s" : ""
        } remaining.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Save all answers before submitting
      await saveAllAnswersToBackend();
      await submitAttemptIfPossible();

      setIsSubmitted(true);
      toast.success("Quiz submitted successfully!");

      // Use a longer delay to ensure all effects are processed and navigation works
      setTimeout(() => {
        // Force navigation using window.location to bypass any interception
        navigate("/unit/" + courseId);
      }, 1000);
    } catch (error) {
      const e: any = error as any;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to submit quiz. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    isSubmitted,
    onComplete,
    answers,
    attemptId,
    questions,
    answeredQuestions,
  ]);

  // Intercept SPA navigations: back/forward and link clicks
  useEffect(() => {
    // If quiz is submitted, don't set up navigation interception
    if (isSubmitted) {
      return;
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Re-push current state to cancel immediate nav
      history.pushState(null, "", window.location.href);

      setShowExitConfirm(true);
      pendingHrefRef.current = "back"; // marker to go back after submit
    };

    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      // Only intercept left-click without modifiers and same-origin links
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return; // external
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;

      // Intercept and show confirm
      e.preventDefault();
      pendingHrefRef.current = url.pathname + url.search + url.hash;
      setShowExitConfirm(true);
    };

    // Push a state so we can cancel the first back press
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClickCapture, true);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [isSubmitted, onExit]);

  // Warn on full tab/window close with native prompt
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (isSubmitting || isSubmitted) return;
        event.preventDefault();
        event.returnValue =
          "Are you sure you want to leave? Your quiz will be submitted.";
      },
      [isSubmitting, isSubmitted]
    )
  );

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

  // Auto-save answers every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isSubmitted && Object.keys(answers).length > 0) {
        saveAllAnswersToBackend();
      }
    }, 30000); // Save every 30 seconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [answers, isSubmitted, attemptId]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Save all answers to backend at once
  const saveAllAnswersToBackend = async () => {
    if (!attemptId) return;

    try {
      const api = new (await import("@/api/index")).Api();
      const answersPayload = Object.entries(answers).flatMap(
        ([questionId, optionIds]) =>
          optionIds.map((optionId) => ({
            question_id: parseInt(questionId),
            selected_option_id: optionId,
          }))
      );

      if (answersPayload.length > 0) {
        await api.SaveQuizAnswers(attemptId, { answers: answersPayload });
      }
    } catch (error) {
      console.error("Failed to save answers:", error);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const isMultipleChoice =
        currentQuestion.question_type === "multiple_choice";

      let newAnswers: number[];
      if (isMultipleChoice) {
        // Toggle option for multiple choice
        newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter((id) => id !== optionId)
          : [...currentAnswers, optionId];
      } else {
        // Single choice - replace with new selection
        newAnswers = [optionId];
      }

      return { ...prev, [questionId]: newAnswers };
    });
  };

  // Navigation
  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      // Save answers before moving to next question
      saveAllAnswersToBackend();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save answers before moving to previous question
      saveAllAnswersToBackend();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
                onClick={() => {
                  if (isSubmitted) {
                    onExit();
                  } else {
                    setShowExitConfirm(true);
                  }
                }}
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

              <Badge
                variant={areAllQuestionsAnswered() ? "default" : "destructive"}
                className={areAllQuestionsAnswered() ? "" : "animate-pulse"}
              >
                {answeredQuestions}/{totalQuestions} answered
                {!areAllQuestionsAnswered() && (
                  <span className="ml-1 text-xs">
                    ({questions.length - answeredQuestions} remaining)
                  </span>
                )}
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
                Question {currentQuestionIndex + 1}
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

          <div className="flex flex-col gap-2">
            {currentQuestionIndex === totalQuestions - 1 &&
              !areAllQuestionsAnswered() && (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  ⚠️ Please answer all questions before submitting the quiz.
                </div>
              )}
            <div className="flex place-self-end gap-2">
              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={
                    isSubmitting || isSubmitted || !areAllQuestionsAnswered()
                  }
                  className={`${
                    areAllQuestionsAnswered()
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : isSubmitted
                    ? "Quiz Submitted"
                    : areAllQuestionsAnswered()
                    ? "Submit Quiz"
                    : `Submit Quiz (${
                        questions.length - answeredQuestions
                      } remaining)`}
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
                  // Save all answers before submitting
                  await saveAllAnswersToBackend();
                  await submitAttemptIfPossible();
                  const pending = pendingHrefRef.current;
                  if (pending === "back") {
                    // Now allow back navigation
                    pendingHrefRef.current = null;
                    history.back();
                    return;
                  }
                  if (pending && typeof pending === "string") {
                    pendingHrefRef.current = null;
                    window.location.assign(pending);
                    return;
                  }
                  onExit();
                } catch (e: any) {
                  const message =
                    e?.response?.data?.message ||
                    e?.message ||
                    "Failed to submit quiz. Please try again.";
                  toast.error(message);
                } finally {
                  setIsExiting(false);
                }
              }}
              disabled={isExiting}
            >
              {isExiting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit & Exit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
