import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface SubmitAttemptConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  attemptId?: number;
}

export function SubmitAttemptConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  attemptId,
}: SubmitAttemptConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Time Limit Exceeded
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                You have an existing quiz attempt that has exceeded the time
                limit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  What happened?
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You started a quiz attempt but didn't complete it within the
                  time limit. The system requires you to submit this attempt
                  before starting a new one.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  What will happen next?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Submitting this attempt will save your current progress and
                  allow you to start a fresh attempt.
                  {attemptId && (
                    <span className="block mt-1 text-xs text-blue-600 dark:text-blue-400">
                      Attempt ID: {attemptId}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Attempt & Start New"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
