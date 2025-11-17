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
import type { Staff } from "@/api/admin";

interface StaffActionDialogsProps {
  selectedStaff: Staff | null;
  actionLoading: boolean;
  showDeactivateDialog: boolean;
  showResetPasswordDialog: boolean;
  onDeactivateDialogChange: (open: boolean) => void;
  onResetPasswordDialogChange: (open: boolean) => void;
  onConfirmDeactivate: () => void;
  onConfirmResetPassword: () => void;
}

export default function StaffActionDialogs({
  selectedStaff,
  actionLoading,
  showDeactivateDialog,
  showResetPasswordDialog,
  onDeactivateDialogChange,
  onResetPasswordDialogChange,
  onConfirmDeactivate,
  onConfirmResetPassword,
}: StaffActionDialogsProps) {
  // Extract first and last name from full_name
  const staffName = selectedStaff?.full_name || "this staff member";

  return (
    <>
      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={onDeactivateDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Staff</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {staffName}? The staff member will not be able to login until
              reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDeactivate}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog
        open={showResetPasswordDialog}
        onOpenChange={onResetPasswordDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Staff Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the password for {staffName}? A new password will be set and
              an email notification will be sent to the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmResetPassword} disabled={actionLoading}>
              {actionLoading ? "Resetting..." : "Reset Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

