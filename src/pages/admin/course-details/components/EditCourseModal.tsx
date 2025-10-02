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
} from "@/Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";

export interface EditCourseFormData {
  title: string;
  content?: string;
  status?: "draft" | "published" | "archived";
}

interface EditCourseModalProps {
  open: boolean;
  formData: EditCourseFormData;
  onChange: (changes: Partial<EditCourseFormData>) => void;
  onCancel: () => void;
  onClose: () => void;
  onSave: () => void;
}

const EditCourseModal = ({
  open,
  formData,
  onChange,
  onCancel,
  onClose,
  onSave,
}: EditCourseModalProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the course title, description, and status
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="course-title">Course Title</Label>
            <Input
              id="course-title"
              value={formData.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Enter course title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={formData.content || ""}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Enter course description"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-status">Status</Label>
            <Select
              value={formData.status || "draft"}
              onValueChange={(value: "draft" | "published" | "archived") =>
                onChange({ status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onCancel();
              onClose();
            }}
            type="button"
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!formData.title}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseModal;
