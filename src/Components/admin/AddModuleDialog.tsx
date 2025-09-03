import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { Plus } from "lucide-react";

interface ModuleFormData {
  title: string;
  description: string;
}

interface AddModuleDialogProps {
  onAddModule: (moduleData: ModuleFormData) => void;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export interface AddModuleDialogRef {
  closeDialog: () => void;
}

const AddModuleDialog = forwardRef<AddModuleDialogRef, AddModuleDialogProps>(
  ({ onAddModule, children, isLoading = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [moduleFormData, setModuleFormData] = useState<ModuleFormData>({
      title: "",
      description: "",
    });

    const handleAddModule = () => {
      onAddModule(moduleFormData);
      // Don't close dialog or reset form here - let parent handle it after API success
    };

    // Method to close dialog and reset form (called by parent after successful API call)
    const closeDialog = () => {
      setModuleFormData({ title: "", description: "" });
      setIsOpen(false);
    };

    // Expose closeDialog method to parent via ref
    useImperativeHandle(ref, () => ({
      closeDialog,
    }));

    const handleCancel = () => {
      if (!isLoading) {
        setModuleFormData({ title: "", description: "" });
        setIsOpen(false);
      }
    };

    const handleOpenChange = (open: boolean) => {
      if (!isLoading) {
        setIsOpen(open);
        if (!open) {
          setModuleFormData({ title: "", description: "" });
        }
      }
    };

    const isFormValid =
      moduleFormData.title.trim() && moduleFormData.description.trim();

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children || (
            <Button size="lg" onClick={() => setIsOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Add Module
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Add a new module to this course
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                placeholder="Enter module title"
                value={moduleFormData.title}
                onChange={(e) =>
                  setModuleFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                placeholder="Enter module description"
                value={moduleFormData.description}
                onChange={(e) =>
                  setModuleFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddModule}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Adding..." : "Add Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

AddModuleDialog.displayName = "AddModuleDialog";

export default AddModuleDialog;
