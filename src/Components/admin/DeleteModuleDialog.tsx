import { Button } from "@/Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";

type DeleteModuleDialogProps = {
  open: boolean;
  moduleTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const DeleteModuleDialog = ({
  open,
  moduleTitle,
  onCancel,
  onConfirm,
  loading = false,
}: DeleteModuleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete module?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The module "{moduleTitle}" and its
            units will be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col md:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModuleDialog;
