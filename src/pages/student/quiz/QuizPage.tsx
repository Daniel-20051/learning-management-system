import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api } from "@/api/index";
import { toast } from "sonner";
import { QuizTakingInterface } from "./components/QuizTakingInterface";
import { QuizStartConfirmationModal } from "./components/QuizStartConfirmationModal";
import { SubmitAttemptConfirmationModal } from "./components/SubmitAttemptConfirmationModal";

type QuizQuestion = {
  id: number;
  question_text: string;
  question_type: "single_choice" | "multiple_choice";
  points: number;
  options: { id: number; option_text: string; is_correct: boolean }[];
};

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const api = new Api();

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(true);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [taking, setTaking] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [initialRemainingSeconds, setInitialRemainingSeconds] = useState<
    number | null
  >(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [existingAttemptId, setExistingAttemptId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      try {
        setIsLoading(true);
        const res = await api.GetQuizById(Number(quizId));
        const data = res.data as { status: boolean; data: any };
        if (data?.status && data?.data) {
          setQuiz(data.data);
        } else {
          throw new Error("Failed to load quiz");
        }
      } catch (e: any) {
        toast.error(e?.message || "Failed to load quiz");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleConfirmStart = async () => {
    if (!quiz) return;
    setIsStarting(true);
    try {
      const res = await api.StartQuizAttempt(quiz.id);
      const data = res.data as { status: boolean; data?: any };
      if (!data?.status) throw new Error("Could not start attempt");
      if (data?.data?.id) setAttemptId(Number(data.data.id));

      // Compute remaining time from started_at
      const startedAtIso: string | undefined = data?.data?.started_at;
      const durationSec = Number(quiz.duration_minutes || 30) * 60;
      let remainingSec = durationSec;
      if (startedAtIso) {
        const startedMs = Date.parse(startedAtIso);
        const elapsedSec = Math.max(
          0,
          Math.floor((Date.now() - startedMs) / 1000)
        );
        remainingSec = Math.max(0, durationSec - elapsedSec);
      }
      if (remainingSec <= 0) {
        toast.error("Time exceeded for this quiz attempt.");
        return;
      }
      setInitialRemainingSeconds(remainingSec);
      setTaking(true);
      setShowConfirm(false);
    } catch (e: any) {
      console.error("Error starting quiz attempt:", e);
      
      // Extract detailed error information
      const status = e?.response?.status;
      const statusText = e?.response?.statusText;
      const errorData = e?.response?.data;
      const errorMessage = errorData?.message || errorData?.error || e.message;
      
      // Log full error details for debugging
      console.error("Full quiz start error details:", {
        quizId: quiz?.id,
        status,
        statusText,
        errorData,
        fullError: e
      });
      
      // Check if the error is about time limit exceeded for existing attempt
      if (
        status === 400 &&
        errorMessage?.includes("Time limit exceeded for existing attempt")
      ) {
        const attemptId = errorData?.attempt_id || null;

        setExistingAttemptId(attemptId);
        setShowSubmitConfirm(true);
        setShowConfirm(false);
        return;
      }

      // Create comprehensive error message
      let displayMessage = "Failed to start quiz attempt";
      
      if (status) {
        displayMessage += ` (${status}`;
        if (statusText) {
          displayMessage += ` ${statusText}`;
        }
        displayMessage += ")";
      }
      
      if (errorMessage) {
        displayMessage += `: ${errorMessage}`;
      }
      
      // Handle specific error cases
      if (status === 400) {
        if (errorMessage?.includes("already started") || errorMessage?.includes("attempt exists")) {
          displayMessage = `Quiz cannot be started: ${errorMessage}`;
        } else if (errorMessage?.includes("not available") || errorMessage?.includes("not active")) {
          displayMessage = `Quiz is not available: ${errorMessage}`;
        } else if (errorMessage?.includes("time") || errorMessage?.includes("expired")) {
          displayMessage = `Quiz timing issue: ${errorMessage}`;
        }
      } else if (status === 403) {
        displayMessage = `Access denied: ${errorMessage || "You don't have permission to start this quiz"}`;
      } else if (status === 404) {
        displayMessage = `Quiz not found: ${errorMessage || "The quiz may have been deleted or moved"}`;
      } else if (status === 429) {
        displayMessage = `Too many attempts: ${errorMessage || "Please wait before trying again"}`;
      } else if (status >= 500) {
        displayMessage = `Server error (${status}): ${errorMessage || "Please try again later or contact support"}`;
      }
      
      toast.error(displayMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitExistingAttempt = async () => {
    setIsSubmitting(true);
    try {
      toast.info("Clearing previous attempt...");

      // Wait a moment for the backend to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSubmitConfirm(false);
      setExistingAttemptId(null);

      // Now try to start a new attempt
      await handleConfirmStart();
    } catch (e: any) {
      console.error("Error clearing previous attempt:", e);
      const message =
        e?.response?.data?.message || "Failed to clear previous attempt";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSubmitConfirm = () => {
    setShowSubmitConfirm(false);
    setExistingAttemptId(null);
    setShowConfirm(true);
  };

  if (isLoading || !quiz) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin"></div>
            <div className="absolute w-20 h-20 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            <div className="absolute w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Loading Quiz
            </h3>
            <p className="text-sm text-muted-foreground">
              Fetching questions and settings…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (taking) {
    return (
      <QuizTakingInterface
        quizId={quiz.id}
        attemptId={attemptId || undefined}
        quizTitle={quiz.title}
        courseId={quiz.course_id}
        durationMinutes={quiz.duration_minutes || 30}
        initialRemainingSeconds={initialRemainingSeconds ?? undefined}
        questions={(quiz.questions || []) as QuizQuestion[]}
        onComplete={() => {
          toast.success("Quiz completed");
          // Navigate back to the course page
          // Try both methods to ensure navigation works
          try {
            if (quiz?.course_id) {
              navigate("/unit/" + quiz.course_id);
            } else {
              navigate(-1);
            }
          } catch (error) {
            window.history.back();
          }
        }}
        onExit={() => {
          if (quiz?.course_id) {
            navigate("/unit/" + quiz.course_id);
          } else {
            navigate(-1);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* <div className="max-w-xl w-full border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description ? (
          <p className="text-muted-foreground mb-4">{quiz.description}</p>
        ) : null}
        <div className="flex items-center gap-2 text-sm mb-6">
          <span>Duration:</span>
          <span className="font-medium">
            {quiz.duration_minutes || 30} minutes
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/unit/" + quiz.course_id)}>
            Cancel
          </Button>
          <Button onClick={() => setShowConfirm(true)}>Start Quiz</Button>
        </div>
      </div> */}

      <QuizStartConfirmationModal
        isOpen={showConfirm}
        onClose={() => {
          if (quiz?.course_id) {
            navigate("/unit/" + quiz.course_id);
          } else {
            // Fallback to previous page or home if course_id is not available
            navigate(-1);
          }
        }}
        onConfirm={handleConfirmStart}
        quizTitle={quiz.title}
        durationMinutes={quiz.duration_minutes}
        attemptsAllowed={quiz.attempts_allowed}
        isLoading={isStarting}
      />

      <SubmitAttemptConfirmationModal
        isOpen={showSubmitConfirm}
        onClose={handleCloseSubmitConfirm}
        onConfirm={handleSubmitExistingAttempt}
        isLoading={isSubmitting}
        attemptId={existingAttemptId || undefined}
      />
    </div>
  );
}
