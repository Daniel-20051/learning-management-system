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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { createAdmin, type CreateAdminData } from "@/api/admin";

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminCreated?: () => void;
}

export default function CreateAdminDialog({ open, onOpenChange, onAdminCreated }: CreateAdminDialogProps) {
  const [formData, setFormData] = useState<CreateAdminData>({
    email: "",
    password: "",
    fname: "",
    lname: "",
    role: "wsp_admin",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup effect to restore body styles when dialog closes
  useEffect(() => {
    if (!open) {
      // Use a longer timeout to ensure dialog animation completes
      const timer = setTimeout(() => {
        // Remove any inline styles that might block interaction
        if (document.body.style.pointerEvents === 'none') {
          document.body.style.pointerEvents = '';
        }
        if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
        }
        // Also check for any overlay elements that might remain
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
        overlays.forEach(overlay => {
          if (overlay instanceof HTMLElement) {
            overlay.style.pointerEvents = '';
          }
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createAdmin(formData);
      if (response.success) {
        toast.success(response.message || "Admin created successfully! Welcome email sent.");
        onOpenChange(false);
        setFormData({
          email: "",
          password: "",
          fname: "",
          lname: "",
          role: "wsp_admin",
          phone: "",
        });
        onAdminCreated?.();
      }
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
          <DialogDescription>
            Add a new admin to the system. An email will be sent with login credentials.
          </DialogDescription>
        </DialogHeader>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Admins have full access to the system. Create admin accounts carefully.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name *</Label>
                <Input
                  id="fname"
                  placeholder="John"
                  value={formData.fname}
                  onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name *</Label>
                <Input
                  id="lname"
                  placeholder="Doe"
                  value={formData.lname}
                  onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="newadmin@pinnacleuniversity.co"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: "super_admin" | "wsp_admin") => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin - Full control</SelectItem>
                  <SelectItem value="wsp_admin">WSP Admin - Content management only</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                <Info className="h-3 w-3 mt-0.5" />
                <div>
                  <p><strong>Super Admin:</strong> Full system access and control</p>
                  <p><strong>WSP Admin:</strong> Content management and limited access</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+2348033333333"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="TempPassword123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                A welcome email with login credentials will be sent to the admin.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

