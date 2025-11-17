import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Check, X } from "lucide-react";
import type { AdminListItem, AdminPermissions } from "@/api/admin";

interface ViewPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminListItem | null;
}

export default function ViewPermissionsDialog({
  open,
  onOpenChange,
  admin,
}: ViewPermissionsDialogProps) {
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

  if (!admin) return null;

  const permissions: AdminPermissions = admin.permissions;

  const PermissionItem = ({
    label,
    value,
  }: {
    label: string;
    value: boolean;
  }) => (
    <div className="flex items-center justify-between py-2 border-b">
      <span className="text-sm">{label}</span>
      {value ? (
        <Badge variant="default" className="bg-green-500">
          <Check className="h-3 w-3 mr-1" />
          Allowed
        </Badge>
      ) : (
        <Badge variant="secondary">
          <X className="h-3 w-3 mr-1" />
          Denied
        </Badge>
      )}
    </div>
  );

  const PermissionSection = ({
    title,
    permissions,
  }: {
    title: string;
    permissions: Record<string, boolean>;
  }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-base">{title}</h4>
      <div className="space-y-1">
        {Object.entries(permissions).map(([key, value]) => (
          <PermissionItem
            key={key}
            label={key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            value={value}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Permissions & Access</DialogTitle>
          <DialogDescription>
            View permissions and access levels for {admin.fname} {admin.lname}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-6">
            {/* Staff Permissions */}
            <PermissionSection
              title="Staff Management"
              permissions={permissions.staff}
            />

            {/* Admin Permissions */}
            <PermissionSection
              title="Admin Management"
              permissions={permissions.admins}
            />

            {/* System Permissions */}
            <PermissionSection
              title="System Access"
              permissions={permissions.system}
            />

            {/* Content Permissions */}
            <PermissionSection
              title="Content Management"
              permissions={permissions.content}
            />

            {/* Course Permissions */}
            <PermissionSection
              title="Course Management"
              permissions={permissions.courses}
            />

            {/* Student Permissions */}
            <PermissionSection
              title="Student Management"
              permissions={permissions.students}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

