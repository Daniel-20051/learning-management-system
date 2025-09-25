import { forwardRef, useImperativeHandle, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Api } from "@/api";
import { Info, BarChart3, Users, Gauge } from "lucide-react";

export interface QuizStatsDialogRef {
  openDialog: (quiz: { id: number; title?: string }) => void;
  closeDialog: () => void;
}

interface QuizStatsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type QuizStats = {
  average_score?: number;
  max_possible_score?: number;
  quiz_id?: number;
  submitted_attempts?: number;
};

const QuizStatsDialog = forwardRef<QuizStatsDialogRef, QuizStatsDialogProps>(
  ({ open, onOpenChange }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [quiz, setQuiz] = useState<{ id: number; title?: string } | null>(
      null
    );
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    useImperativeHandle(ref, () => ({
      openDialog: async (q) => {
        setQuiz(q);
        setIsOpen(true);
        setError(null);
        setStats(null);
        try {
          setLoading(true);
          const api = new Api();
          const res = await api.GetQuizStats(Number(q.id));
          const data = (((res as any) ?? {})?.data?.data ?? {}) as QuizStats;
          setStats(data);
        } catch (err: any) {
          setError(err?.response?.data?.message || "Failed to load stats");
          console.log("Failed to load quiz stats (dialog)", err);
        } finally {
          setLoading(false);
        }
      },
      closeDialog: () => {
        setIsOpen(false);
        setTimeout(() => {
          setQuiz(null);
          setStats(null);
          setError(null);
        }, 300);
      },
    }));

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[520px] mt-7">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Quiz Stats{quiz?.title ? ` • ${quiz.title}` : ""}
            </DialogTitle>
            <DialogDescription>
              Live statistics for this quiz.
            </DialogDescription>
          </DialogHeader>

          <Card className="pt-2">
            <CardContent className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="h-10 w-10 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="text-sm text-muted-foreground mt-3">
                    Loading stats…
                  </div>
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gauge className="h-4 w-4" /> Average Score
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {stats?.average_score ?? 0}
                      {typeof stats?.max_possible_score === "number" ? (
                        <span className="text-sm text-muted-foreground">
                          {" "}
                          / {stats?.max_possible_score}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="h-4 w-4" /> Max Possible Score
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {stats?.max_possible_score ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-4 w-4" /> Submitted Attempts
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {stats?.submitted_attempts ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="text-xs text-muted-foreground">Quiz ID</div>
                    <div className="text-lg font-semibold mt-1">
                      {stats?.quiz_id ?? quiz?.id}
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }
);

QuizStatsDialog.displayName = "QuizStatsDialog";

export default QuizStatsDialog;
