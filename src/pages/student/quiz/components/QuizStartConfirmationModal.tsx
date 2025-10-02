import React from "react";
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

interface QuizStartConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quizTitle: string;
  durationMinutes?: number;
  attemptsAllowed?: number;
  isLoading?: boolean;
}

export const QuizStartConfirmationModal: React.FC<
  QuizStartConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  quizTitle,
  durationMinutes,
  attemptsAllowed,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirm Quiz Start
          </DialogTitle>
          <DialogDescription className="text-left">
            You are about to start the quiz: <strong>"{quizTitle}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  Important: Once you start this quiz, your attempt will begin
                  immediately.
                </p>
                <p className="text-sm text-amber-700">
                  Make sure you are ready to complete the quiz in one sitting.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {durationMinutes && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{durationMinutes} minutes</span>
              </div>
            )}

            {attemptsAllowed && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Attempts:</span>
                <span className="font-medium">{attemptsAllowed} allowed</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Starting..." : "Start Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
