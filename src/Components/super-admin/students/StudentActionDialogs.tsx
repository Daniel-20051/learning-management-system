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
import type { Student } from "@/api/admin";

interface StudentActionDialogsProps {
  selectedStudent: Student | null;
  actionLoading: boolean;
  showDeactivateDialog: boolean;
  showActivateDialog: boolean;
  showResetPasswordDialog: boolean;
  onDeactivateDialogChange: (open: boolean) => void;
  onActivateDialogChange: (open: boolean) => void;
  onResetPasswordDialogChange: (open: boolean) => void;
  onConfirmDeactivate: () => void;
  onConfirmActivate: () => void;
  onConfirmResetPassword: () => void;
}

export default function StudentActionDialogs({
  selectedStudent,
  actionLoading,
  showDeactivateDialog,
  showActivateDialog,
  showResetPasswordDialog,
  onDeactivateDialogChange,
  onActivateDialogChange,
  onResetPasswordDialogChange,
  onConfirmDeactivate,
  onConfirmActivate,
  onConfirmResetPassword,
}: StudentActionDialogsProps) {
  return (
    <>
      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={onDeactivateDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedStudent?.fname}{" "}
              {selectedStudent?.lname}? The student will not be able to login until
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

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={onActivateDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate {selectedStudent?.fname}{" "}
              {selectedStudent?.lname}? The student will be able to login again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmActivate}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Activating..." : "Activate"}
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
            <AlertDialogTitle>Reset Student Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the password for {selectedStudent?.fname}{" "}
              {selectedStudent?.lname}? A new temporary password will be generated and
              an email notification will be sent to the student.
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

