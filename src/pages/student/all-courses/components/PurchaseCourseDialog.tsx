import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Loader2, ShoppingCart, AlertCircle, CheckCircle2, Wallet, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { WalletApi } from "@/api/wallet";

// Currency conversion utility
const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // USD to NGN: multiply by rate
  if (fromCurrency === "USD" && toCurrency === "NGN") {
    return amount * exchangeRate;
  }

  // NGN to USD: divide by rate
  if (fromCurrency === "NGN" && toCurrency === "USD") {
    return amount / exchangeRate;
  }

  return amount;
};

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
  const walletApi = new WalletApi();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"initiate" | "processing" | "success" | "error">("initiate");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("NGN");
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number>(1500); // Default fallback rate

  // Calculate currency conversion if needed
  const currencyConversion = useMemo(() => {
    if (!course) return null;

    const courseCurrency = course.currency || "NGN";
    const studentCurrency = currency;

    // Check if conversion is needed
    if (courseCurrency === studentCurrency) {
      return null; // No conversion needed
    }

    const originalPrice = course.price;
    const convertedPrice = convertCurrency(originalPrice, courseCurrency, studentCurrency, exchangeRate);

    return {
      originalPrice,
      originalCurrency: courseCurrency,
      convertedPrice,
      convertedCurrency: studentCurrency,
      exchangeRate,
      needsConversion: true,
    };
  }, [course, currency, exchangeRate]);

  const fetchWalletBalance = useCallback(async () => {
    setIsLoadingWallet(true);
    try {
      // Import API dynamically to avoid circular dependencies
      const { Api } = await import("@/api/index");
      const api = new Api();
      const response = await api.getUserProfile();
      const profileData = response as any;
      if (profileData?.data?.success || profileData?.data?.status) {
        const userData = profileData?.data?.data?.user;
        if (userData) {
          setWalletBalance(parseFloat(userData.wallet_balance) || 0);
          setCurrency(userData.currency || "NGN");
        }
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast.error("Failed to load wallet balance");
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  // Fetch exchange rate
  const fetchExchangeRate = useCallback(async () => {
    try {
      const response = await walletApi.GetExchangeRate();
      if (response?.data?.exchange_rate) {
        setExchangeRate(response.data.exchange_rate);
      }
    } catch (err: any) {
      console.error("Error fetching exchange rate:", err);
      // Keep default rate of 1500 if API fails
    }
  }, []);

  // Fetch wallet balance and exchange rate when dialog opens
  useEffect(() => {
    if (open) {
      fetchWalletBalance();
      fetchExchangeRate();
    } else {
      // Reset state when dialog closes
      setPaymentStep("initiate");
      setIsLoadingWallet(true);
    }
  }, [open, fetchWalletBalance, fetchExchangeRate]);

  // This would typically integrate with Flutterwave or another payment gateway
  const handleInitiatePayment = async () => {
    if (!course) return;

    // Calculate the amount to debit (converted price if conversion is needed)
    const amountToDebit = currencyConversion?.convertedPrice ?? course.price;

    // Verify wallet balance before proceeding
    if (walletBalance < amountToDebit) {
      toast.error("Insufficient wallet balance. Please top up your wallet to continue.");
      return;
    }

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Import API dynamically to avoid circular dependencies
      const { Api } = await import("@/api/index");
      const api = new Api();
      
      const response = await api.PurchaseCourse({
        course_id: course.id,
      });

      // Handle both response formats (direct response or response.data)
      const purchaseData = response.data || response;
      const isSuccess = response.success || purchaseData?.success || response.status;

      if (isSuccess) {
        setPaymentStep("success");
        toast.success("Success");
        
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

  const courseCurrency = course.currency || currency;
  const studentCurrency = currency;
  const studentCurrencySymbol = studentCurrency === "NGN" ? "₦" : "$";
  const courseCurrencySymbol = courseCurrency === "NGN" ? "₦" : "$";
  
  // Calculate the amount to debit (converted price if conversion is needed)
  const amountToDebit = currencyConversion?.convertedPrice ?? course.price;
  const remainingBalance = walletBalance - amountToDebit;
  const hasInsufficientBalance = walletBalance < amountToDebit;

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
              <div className="flex items-center">
                <Badge variant="outline">{course.course_code}</Badge>
              </div>
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                Level {course.course_level} · {course.course_unit} Unit
                {course.course_unit !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Wallet Balance Display */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wallet Balance:</span>
              </div>
              {isLoadingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <span className={`text-sm font-semibold ${hasInsufficientBalance ? "text-red-600" : "text-green-600"}`}>
                  {studentCurrencySymbol}
                  {walletBalance.toLocaleString()}
                </span>
              )}
            </div>

            {/* Currency Conversion Display */}
            {!isLoadingWallet && currencyConversion && currencyConversion.needsConversion && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">Currency Conversion</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800">Course Price ({currencyConversion.originalCurrency}):</span>
                    <span className="font-medium text-amber-900">
                      {courseCurrencySymbol}
                      {currencyConversion.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-amber-700">
                    <span>Exchange Rate:</span>
                    <span>
                      1 {currencyConversion.originalCurrency} = {currencyConversion.exchangeRate.toLocaleString()} {currencyConversion.convertedCurrency}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                    <span className="font-semibold text-amber-900">Amount to Debit ({currencyConversion.convertedCurrency}):</span>
                    <span className="font-bold text-lg text-amber-900">
                      {studentCurrencySymbol}
                      {currencyConversion.convertedPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Price Display */}
            {!isLoadingWallet && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="text-sm font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  {studentCurrencySymbol}
                  {amountToDebit.toLocaleString(undefined, {
                    minimumFractionDigits: currencyConversion ? 2 : 0,
                    maximumFractionDigits: currencyConversion ? 2 : 0,
                  })}
                </span>
              </div>
            )}

            {/* Remaining Balance */}
            {!isLoadingWallet && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Balance After Purchase:</span>
                <span className={`text-sm font-semibold ${remainingBalance < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                  {studentCurrencySymbol}
                  {remainingBalance.toLocaleString(undefined, {
                    minimumFractionDigits: currencyConversion ? 2 : 0,
                    maximumFractionDigits: currencyConversion ? 2 : 0,
                  })}
                </span>
              </div>
            )}

            {/* Insufficient Balance Warning */}
            {!isLoadingWallet && hasInsufficientBalance && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800">
                  Insufficient wallet balance. You need {studentCurrencySymbol}
                  {(amountToDebit - walletBalance).toLocaleString(undefined, {
                    minimumFractionDigits: currencyConversion ? 2 : 0,
                    maximumFractionDigits: currencyConversion ? 2 : 0,
                  })} more to purchase this course.
                </p>
              </div>
            )}
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
              <h3 className="font-semibold text-lg">Success</h3>
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
                disabled={isProcessing || isLoadingWallet || hasInsufficientBalance}
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

