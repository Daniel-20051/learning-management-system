import React from "react";

type AttemptSummaryProps = {
  loading: boolean;
  error: string | null;
  attempt: any | null;
};

const LatestAttemptSummary: React.FC<AttemptSummaryProps> = ({
  loading,
  error,
  attempt,
}) => {
  return (
    <div className="rounded-lg border max-h-[70vh] overflow-y-auto bg-card">
      <div className="p-5 border-b">
        <p className="font-semibold">Your grade</p>
      </div>
      <div className="p-5 text-sm">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
            <span>Loading latest attempt…</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : attempt && attempt?.summary ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-xs text-muted-foreground">Total score</div>
                <div className="text-base font-semibold">
                  {attempt.summary.total_score} /{" "}
                  {attempt.summary.max_possible_score}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Percentage</div>
                <div className="text-base font-semibold">
                  {attempt.summary.percentage}%
                </div>
              </div>
              {attempt?.attempt?.status ? (
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-base font-semibold capitalize">
                    {attempt.attempt.status}
                  </div>
                </div>
              ) : null}
            </div>

            {Array.isArray(attempt.questions) &&
            attempt.questions.length > 0 ? (
              <div className="mt-2">
                <div className="text-sm font-medium mb-2">
                  Question breakdown
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[40vh]">
                  {attempt.questions.map((q: any, idx: number) => {
                    const isCorrect =
                      (q?.is_student_correct as boolean | undefined) ??
                      Boolean(q?.is_correct);
                    const selectedIdsRaw =
                      (q?.student_selected_option_ids as any) ??
                      (q?.selected_option_ids as any) ??
                      null;
                    const selectedIds: number[] = Array.isArray(selectedIdsRaw)
                      ? selectedIdsRaw
                      : typeof selectedIdsRaw === "number"
                      ? [selectedIdsRaw]
                      : [];
                    const selectedFromIds = Array.isArray(q?.options)
                      ? q.options
                          .filter((o: any) =>
                            selectedIds.includes(Number(o?.id))
                          )
                          .map((o: any) => o?.option_text ?? o?.text ?? "")
                          .filter(Boolean)
                      : [];
                    const correctFromSingle =
                      q?.correct_option_text ??
                      q?.correct_option?.option_text ??
                      "";
                    const correctFromArray = Array.isArray(q?.correct_options)
                      ? q.correct_options
                          .map((o: any) => o?.option_text ?? o?.text ?? "")
                          .filter(Boolean)
                      : [];
                    const correctFromOptions = Array.isArray(q?.options)
                      ? q.options
                          .filter((o: any) => !!o?.is_correct)
                          .map((o: any) => o?.option_text ?? o?.text ?? "")
                          .filter(Boolean)
                      : [];
                    const correctSet = Array.from(
                      new Set(
                        [
                          correctFromSingle,
                          ...correctFromArray,
                          ...correctFromOptions,
                        ].filter(Boolean)
                      )
                    );
                    const correctLabel = correctSet.join(", ");
                    let selected =
                      q?.selected_option_text ??
                      q?.selected_option?.option_text ??
                      selectedFromIds.join(", ") ??
                      "";
                    if (!selected && isCorrect && correctSet.length > 0) {
                      selected = correctLabel;
                    }
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded border ${
                          isCorrect
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">
                              Question {idx + 1}
                            </div>
                            <div className="text-sm font-medium">
                              {q?.question_text || ""}
                            </div>
                            {selected ? (
                              <div className="text-xs mt-1">
                                Your answer:{" "}
                                <span className="font-medium">{selected}</span>
                              </div>
                            ) : null}
                            {correctLabel ? (
                              <div className="text-xs mt-1">
                                Correct answer:{" "}
                                <span className="font-medium">
                                  {correctLabel}
                                </span>
                              </div>
                            ) : null}
                          </div>
                          <div
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              isCorrect
                                ? "text-green-800 bg-green-100"
                                : "text-red-800 bg-red-100"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Incorrect"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                No answered questions to display.
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">
            You haven’t submitted this yet. We keep your highest score.
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestAttemptSummary;
