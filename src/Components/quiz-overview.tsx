import { Button } from "@/Components/ui/button";
import { saveQuizResult } from "@/lib/quizResults";
import { toast } from "sonner";

interface QuizOverviewProps {
  module: number;
  adminConfig: any;
  canTakeCurrentQuiz: boolean;
  displayRemainingAttempts: number;
  existingQuizResult: any;
  onStartQuiz: () => void;
}

const QuizOverview = ({
  module,
  adminConfig,
  canTakeCurrentQuiz,
  displayRemainingAttempts,
  existingQuizResult,
  onStartQuiz,
}: QuizOverviewProps) => {
  const handleStartQuiz = () => {
    if (canTakeCurrentQuiz) {
      // Count the attempt when starting the quiz
      saveQuizResult(module, 0, 0, false);
      onStartQuiz();
    } else {
      toast.error(
        "You have reached the maximum number of attempts for this quiz.",
        {
          duration: 3000,
          description: `Maximum attempts allowed: ${adminConfig.maxAttempts}`,
        }
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full md:w-[70%] flex flex-col gap-4">
        {/* Warning Alert - Only show if user can take the quiz */}
        {canTakeCurrentQuiz && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
            <div className="text-orange-500 text-lg">⚠️</div>
            <div className="text-orange-500">
              <p className="font-semibold text-sm">Quiz Instructions</p>
              <p className="text-xs opacity-90">
                Do not Click Start Quiz until you are ready to take the quiz.
              </p>
            </div>
          </div>
        )}

        {/* Quiz Details Card */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          {!canTakeCurrentQuiz && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="text-destructive text-lg">⚠️</div>
                <div className="text-destructive">
                  <p className="font-semibold text-sm">No Attempts Remaining</p>
                  <p className="text-xs opacity-90">
                    You have used all {adminConfig.maxAttempts} attempts for
                    this quiz.
                  </p>
                </div>
              </div>
            </div>
          )}
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quiz Details
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground font-medium text-sm">
                Attempts:
              </span>
              <span className="text-foreground font-semibold text-sm">
                {displayRemainingAttempts} left ({adminConfig.maxAttempts}{" "}
                attempts allowed)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-medium text-sm">
                Duration:
              </span>
              <span className="text-foreground font-semibold text-sm">
                {adminConfig.testDuration} minutes
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleStartQuiz}
              disabled={!canTakeCurrentQuiz}
              className="px-4 py-1 text-sm"
              variant={canTakeCurrentQuiz ? "default" : "secondary"}
            >
              {canTakeCurrentQuiz ? "Start Quiz" : "No Attempts Left"}
            </Button>
          </div>
        </div>

        {/* Grade Section */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Grade
          </h2>
          {existingQuizResult ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Your last attempt:{" "}
                <span className="text-foreground font-semibold">
                  {existingQuizResult.percentage}%
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                We keep your highest score.
              </p>
              <div className="text-3xl font-bold text-primary">
                {existingQuizResult.percentage}%
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                You haven't submitted this yet. We keep your highest score.
              </p>
              <div className="text-3xl font-bold text-muted-foreground">--</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizOverview;
