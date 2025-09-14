import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Loader2 } from "lucide-react";

export interface QuizFormData {
  title: string;
  description: string;
  duration_minutes: number;
  status: string;
}

export interface CreateQuizDialogRef {
  openDialog: () => void;
  closeDialog: () => void;
}

interface CreateQuizDialogProps {
  moduleTitle: string;
  moduleId: string;
  onCreateQuiz: (moduleId: string, quizData: QuizFormData) => Promise<void>;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateQuizDialog = forwardRef<CreateQuizDialogRef, CreateQuizDialogProps>(
  (
    {
      moduleTitle,
      moduleId,
      onCreateQuiz,
      isLoading = false,
      open: externalOpen,
      onOpenChange,
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;
    const [formData, setFormData] = useState<QuizFormData>({
      title: "",
      description: "",
      duration_minutes: 20,
      status: "draft",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useImperativeHandle(ref, () => ({
      openDialog: () => setOpen(true),
      closeDialog: () => {
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          duration_minutes: 20,
          status: "draft",
        });
        setErrors({});
      },
    }));

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.title.trim()) {
        newErrors.title = "Quiz title is required";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Quiz description is required";
      }

      if (formData.duration_minutes <= 0) {
        newErrors.duration_minutes = "Duration must be greater than 0";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        await onCreateQuiz(moduleId, formData);
        // Dialog will be closed by parent component after successful creation
      } catch (error) {
        console.error("Error creating quiz:", error);
      }
    };

    const handleInputChange = (
      field: keyof QuizFormData,
      value: string | number
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Quiz for {moduleTitle}</DialogTitle>
            <DialogDescription>
              Create a new quiz for this module.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter quiz title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter quiz description"
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    handleInputChange(
                      "duration_minutes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className={errors.duration_minutes ? "border-red-500" : ""}
                />
                {errors.duration_minutes && (
                  <p className="text-sm text-red-500">
                    {errors.duration_minutes}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Quiz"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

CreateQuizDialog.displayName = "CreateQuizDialog";

export default CreateQuizDialog;
