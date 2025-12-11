import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Loader2, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
  course_level: number;
  price: number;
  currency?: string;
}

interface PurchaseCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onPurchaseSuccess?: () => void;
}

const PurchaseCourseDialog = ({
  open,
  onOpenChange,
  course,
  onPurchaseSuccess,
}: PurchaseCourseDialogProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"initiate" | "processing" | "success" | "error">("initiate");

  // This would typically integrate with Flutterwave or another payment gateway
  const handleInitiatePayment = async () => {
    if (!course) return;

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // TODO: Integrate with Flutterwave payment gateway
      // For now, we'll simulate the payment flow
      // In production, this would:
      // 1. Initialize Flutterwave payment
      // 2. Get payment reference
      // 3. Call the purchase API with the reference

      // Simulated payment reference (replace with actual Flutterwave integration)
      const paymentReference = `FLW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Import API dynamically to avoid circular dependencies
      const { Api } = await import("@/api/index");
      const api = new Api();
      
      const response = await api.PurchaseCourse({
        course_id: course.id,
        payment_reference: paymentReference,
        payment_method: "flutterwave",
      });

      // Handle both response formats (direct response or response.data)
      const purchaseData = response.data || response;
      const isSuccess = response.success || purchaseData?.success || response.status;

      if (isSuccess) {
        setPaymentStep("success");
        const successMessage = response.message || purchaseData?.message || "Course purchased successfully!";
        toast.success(successMessage);
        
        // Log transaction details if available
        if (purchaseData?.transaction) {
          console.log("Transaction details:", purchaseData.transaction);
          if (purchaseData.transaction.note) {
            toast.info(purchaseData.transaction.note);
          }
        }
        
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }

        // Navigate to course after a short delay
        setTimeout(() => {
          navigate(`/unit/${course.id}`);
          onOpenChange(false);
        }, 2000);
      } else {
        throw new Error(response.message || purchaseData?.message || "Purchase failed");
      }
    } catch (error: any) {
      console.error("Error purchasing course:", error);
      setPaymentStep("error");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while purchasing the course";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStep("initiate");
      onOpenChange(false);
    }
  };

  if (!course) return null;

  const currency = course.currency || "NGN";
  const currencySymbol = currency === "NGN" ? "₦" : currency;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Purchase Course
          </DialogTitle>
          <DialogDescription>
            Complete your purchase to access this course
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "initiate" && (
          <div className="space-y-4">
            {/* Course Info */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{course.course_code}</Badge>
                <Badge className="bg-blue-600 text-white">Marketplace</Badge>
              </div>
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                Level {course.course_level} · {course.course_unit} Unit
                {course.course_unit !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="text-sm font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                {currencySymbol}
                {course.price.toLocaleString()}
              </span>
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                This is a WPU marketplace course. 100% of the revenue goes to WPU.
                You will be redirected to complete payment.
              </p>
            </div>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Processing your payment...
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Purchase Successful!</h3>
              <p className="text-sm text-muted-foreground">
                You have been enrolled in this course. Redirecting...
              </p>
            </div>
          </div>
        )}

        {paymentStep === "error" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Payment Failed</h3>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {paymentStep === "initiate" && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </>
          )}
          {(paymentStep === "error" || paymentStep === "success") && (
            <Button onClick={handleClose} className="w-full">
              {paymentStep === "error" ? "Close" : "Continue"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseCourseDialog;

