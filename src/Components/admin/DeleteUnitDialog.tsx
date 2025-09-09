import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { Api } from "@/api";

type DeleteUnitDialogProps = {
  open: boolean;
  unit: {
    id: string | number;
    title: string;
  } | null;
  onClose: () => void;
  onDelete?: (unitId: string | number) => void;
};

const DeleteUnitDialog = ({
  open,
  unit,
  onClose,
  onDelete,
}: DeleteUnitDialogProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    description: string;
  } | null>(null);

  const api = new Api();

  const handleDelete = async () => {
    if (!unit) return;

    try {
      setIsDeleting(true);
      setAlert(null);

      const response = await api.DeleteUnit(String(unit.id));

      // Check for successful deletion
      if (response && (response.data?.success || response.status === 200)) {
        // Call the parent callback to refresh the units
        if (onDelete) {
          onDelete(unit.id);
        }

        // Close dialog immediately after successful deletion
        onClose();
        setAlert(null);
      } else {
        throw new Error(response?.data?.message || "Failed to delete unit");
      }
    } catch (error: any) {
      console.error("Error deleting unit:", error);

      setAlert({
        type: "error",
        title: "Delete Failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete unit. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setAlert(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => (!val ? handleClose() : undefined)}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Unit
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the unit
            and all its content.
          </DialogDescription>
        </DialogHeader>

        {/* Alert Display */}
        {alert && (
          <Alert
            className={
              alert.type === "error" ? "border-destructive" : "border-green-500"
            }
          >
            <AlertCircle
              className={alert.type === "error" ? "h-4 w-4" : "hidden"}
            />
            <CheckCircle
              className={
                alert.type === "success" ? "h-4 w-4 text-green-500" : "hidden"
              }
            />
            <AlertTitle
              className={
                alert.type === "error" ? "text-destructive" : "text-green-700"
              }
            >
              {alert.title}
            </AlertTitle>
            <AlertDescription
              className={
                alert.type === "error" ? "text-destructive" : "text-green-600"
              }
            >
              {alert.description}
            </AlertDescription>
          </Alert>
        )}

        {unit && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the unit:
            </p>
            <p className="font-medium mt-1 p-2 bg-muted rounded">
              "{unit.title}"
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !unit}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Unit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUnitDialog;
