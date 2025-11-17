import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import type { AdminListItem } from "@/api/admin";

interface AdminActionDialogsProps {
  selectedAdmin: AdminListItem | null;
  actionLoading: boolean;
  showDeactivateDialog: boolean;
  onDeactivateDialogChange: (open: boolean) => void;
  onConfirmDeactivate: () => void;
  currentAdminId?: number;
}

export default function AdminActionDialogs({
  selectedAdmin,
  actionLoading,
  showDeactivateDialog,
  onDeactivateDialogChange,
  onConfirmDeactivate,
  currentAdminId,
}: AdminActionDialogsProps) {
  const adminName = selectedAdmin
    ? `${selectedAdmin.fname} ${selectedAdmin.lname}`
    : "this admin";
  const isCurrentAdmin = selectedAdmin?.id === currentAdminId;
  const isSuperAdmin = selectedAdmin?.role === "super_admin";

  // Cleanup effect to restore body styles when dialog closes
  useEffect(() => {
    if (!showDeactivateDialog) {
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
  }, [showDeactivateDialog]);

  return (
    <>
      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={onDeactivateDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Admin</AlertDialogTitle>
            <AlertDialogDescription>
              {isCurrentAdmin ? (
                <span className="text-destructive font-medium">
                  You cannot deactivate your own account.
                </span>
              ) : isSuperAdmin ? (
                <span className="text-orange-600 font-medium">
                  Warning: You cannot deactivate other Super Admins. Only WSP Admins can be deactivated.
                </span>
              ) : (
                <>
                  Are you sure you want to deactivate {adminName}? The admin will not be able to login until
                  reactivated.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            {!isCurrentAdmin && !isSuperAdmin && (
              <AlertDialogAction
                onClick={onConfirmDeactivate}
                disabled={actionLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {actionLoading ? "Deactivating..." : "Deactivate"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

