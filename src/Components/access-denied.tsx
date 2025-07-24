import { Button } from "@/Components/ui/button";

interface AccessDeniedProps {
  module: number;
  previousModuleResult: any;
  totalQuestions: number;
  onGoBackToQuiz: () => void;
}

const AccessDenied = ({
  module,
  previousModuleResult,
  totalQuestions,
  onGoBackToQuiz,
}: AccessDeniedProps) => {
  return (
    <div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-5">
          <div className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-destructive text-2xl">🚫</span>
              </div>
              <h2 className="text-3xl font-bold text-destructive mb-4">
                Access Denied
              </h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              You need to attempt the quiz for Module {module} before accessing
              this module.
            </p>
            {previousModuleResult && (
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm mb-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Your last attempt:
                </h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Score:{" "}
                    <span className="text-foreground font-semibold">
                      {previousModuleResult.score}/{totalQuestions}
                    </span>{" "}
                    (
                    <span className="text-foreground font-semibold">
                      {previousModuleResult.percentage}%
                    </span>
                    )
                  </p>
                  <p className="text-muted-foreground">
                    Required: Quiz Attempt
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        previousModuleResult.passed
                          ? "bg-green-500/20 text-green-500 border border-green-500/30"
                          : "bg-red-500/20 text-red-500 border border-red-500/30"
                      }`}
                    >
                      {previousModuleResult.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={onGoBackToQuiz}
              className="px-8 py-3 text-lg"
              size="lg"
            >
              Go Back to Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
