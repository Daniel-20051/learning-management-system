import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";

export interface NoteViewerDialogProps {
  open: boolean;
  title?: string;
  content: string;
  onClose: () => void;
}

const NoteViewerDialog: React.FC<NoteViewerDialogProps> = ({
  open,
  title,
  content,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {title || "Note"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteViewerDialog;
