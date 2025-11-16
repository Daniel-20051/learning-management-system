import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Skeleton } from "@/Components/ui/skeleton";
import { Loader2, Save, RefreshCw } from "lucide-react";
import {
  getStudent,
  updateStudent,
  type StudentDetails,
  type UpdateStudentData,
} from "@/api/admin";
import { toast } from "sonner";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  onStudentUpdated: (updatedData: UpdateStudentData & { id: number }) => void;
}

export default function EditStudentDialog({
  open,
  onOpenChange,
  studentId,
  onStudentUpdated,
}: EditStudentDialogProps) {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateStudentData>({
    fname: "",
    lname: "",
    level: 100,
    phone: "",
    matric_number: "",
  });

  useEffect(() => {
    if (open && studentId) {
      // Reset states first
      setStudent(null);
      setError(null);
      setLoading(false);
      setSaving(false);
      setFormData({
        fname: "",
        lname: "",
        level: 100,
        phone: "",
        matric_number: "",
      });
      
      // Add a small delay to ensure dialog is fully mounted
      const timer = setTimeout(() => {
        fetchStudentDetails();
      }, 50);
      return () => clearTimeout(timer);
    }
    
    // Ensure body scroll is restored when dialog closes
    if (!open) {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup on unmount
      setStudent(null);
      setError(null);
      setLoading(false);
      setSaving(false);
      // Force restore pointer events and scroll
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, [open, studentId]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getStudent(studentId);
      if (response.success) {
        const studentData = response.data.student;
        setStudent(studentData);
        setFormData({
          fname: studentData.fname,
          lname: studentData.lname,
          level: studentData.level,
          phone: studentData.phone || "",
          matric_number: studentData.matric_number || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch student details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "level" ? parseInt(value) || 100 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    try {
      setSaving(true);
      const response = await updateStudent(studentId, formData);
      if (response.success) {
        toast.success(response.message);
        // Notify parent component of the update
        onStudentUpdated({ ...formData, id: studentId });
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing while loading or saving
          if (loading || saving) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape while saving
          if (saving) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information. Email cannot be changed.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : student ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fname">First Name *</Label>
                  <Input
                    id="fname"
                    name="fname"
                    value={formData.fname}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">Last Name *</Label>
                  <Input
                    id="lname"
                    name="lname"
                    value={formData.lname}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={student.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matric_number">Matric Number</Label>
                <Input
                  id="matric_number"
                  name="matric_number"
                  value={formData.matric_number}
                  onChange={handleInputChange}
                  placeholder="e.g., WSP/2024/001"
                  disabled={saving}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    min="100"
                    max="800"
                    step="100"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="e.g., 100, 200, 300"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234801234567"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive font-medium mb-2">Failed to fetch student details</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                fetchStudentDetails();
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No student data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

