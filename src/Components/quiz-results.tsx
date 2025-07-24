import { Button } from "@/Components/ui/button";

interface QuizResultsProps {
  quizResults: {
    correct: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null;
  adminConfig: any;
  canTakeCurrentQuiz: boolean;
  onRetakeQuiz: () => void;
}

const QuizResults = ({
  quizResults,
  adminConfig,
  canTakeCurrentQuiz,
  onRetakeQuiz,
}: QuizResultsProps) => {
  if (!quizResults) return null;

  return (
    <div className="flex flex-col w-[70%] place-self-center gap-3 mb-4 py-4 px-8 bg-card border border-border rounded-lg shadow-sm">
      <div className="text-lg text-foreground font-semibold mb-2">
        Quiz Results
      </div>
      <div className="space-y-2">
        <p className="text-foreground text-base">
          You scored{" "}
          <span className="font-bold text-primary">
            {quizResults.percentage}%
          </span>{" "}
          on the quiz.
        </p>
        <p className="text-muted-foreground text-sm">
          You answered{" "}
          <span className="text-foreground font-semibold">
            {quizResults.correct}
          </span>{" "}
          out of{" "}
          <span className="text-foreground font-semibold">
            {quizResults.total}
          </span>{" "}
          questions correctly.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Status:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              adminConfig.requireQuizPass
                ? quizResults.percentage >= 70
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-red-500/20 text-red-500 border border-red-500/30"
                : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
            }`}
          >
            COMPLETED
          </span>
        </div>
      </div>

      {adminConfig.allowRetake && !quizResults.passed && canTakeCurrentQuiz && (
        <Button
          onClick={onRetakeQuiz}
          className="w-48 mt-3 text-sm"
          variant="outline"
          size="sm"
        >
          Retake Quiz
        </Button>
      )}
      {adminConfig.allowRetake &&
        !quizResults.passed &&
        !canTakeCurrentQuiz && (
          <p className="text-destructive text-xs mt-2">
            You have no attempts remaining to retake this quiz.
          </p>
        )}
    </div>
  );
};

export default QuizResults;
