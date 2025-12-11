import { useState, useEffect } from "react";
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
import { Loader2, ShoppingCart, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Api } from "@/api/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/Components/ui/alert";

interface Course {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
  course_level: number;
  price: number;
  currency?: string;
}

interface MultipleCourseRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourses: Course[];
  onRegistrationSuccess?: () => void;
}

const MultipleCourseRegistrationDialog = ({
  open,
  onOpenChange,
  selectedCourses,
  onRegistrationSuccess,
}: MultipleCourseRegistrationDialogProps) => {
  const api = new Api();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [sessions, setSessions] = useState<string[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("NGN");
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  const semesters = ["1ST", "2ND"];

  // Calculate total amount
  const totalAmount = selectedCourses.reduce((sum, course) => {
    return sum + (parseFloat(String(course.price)) || 0);
  }, 0);

  const remainingBalance = walletBalance - totalAmount;
  const hasInsufficientBalance = totalAmount > 0 && walletBalance < totalAmount;

  // Fetch sessions and wallet balance when dialog opens
  useEffect(() => {
    if (open) {
      fetchSessions();
      fetchWalletBalance();
    } else {
      // Reset state when dialog closes
      setSelectedSession("");
      setSelectedSemester("");
      setSessions([]);
      setIsLoadingSessions(true);
    }
  }, [open]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await api.Getsessions();
      const items = response?.data?.data ?? response?.data ?? [];

      if (Array.isArray(items) && items.length > 0) {
        const uniqueYears = Array.from(
          new Set(items.map((it: any) => it.academic_year))
        ) as string[];
        setSessions(uniqueYears);

        // Find active semester and auto-select it
        const active = items.find((it: any) => 
          it.status && String(it.status).toLowerCase() === "active"
        );

        if (active?.academic_year && active?.semester) {
          setSelectedSession(active.academic_year);
          setSelectedSemester(active.semester);
        } else if (items[0]?.academic_year) {
          setSelectedSession(items[0].academic_year);
          setSelectedSemester(items[0].semester || "1ST");
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchWalletBalance = async () => {
    setIsLoadingWallet(true);
    try {
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
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const formatCurrency = (amount: number, curr: string = "NGN") => {
    const symbol = curr === "NGN" ? "₦" : curr;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const handleRegister = async () => {
    if (!selectedSession || !selectedSemester) {
      toast.error("Please select academic session and semester");
      return;
    }

    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    if (hasInsufficientBalance) {
      toast.error(`Insufficient wallet balance. Required: ${formatCurrency(totalAmount, currency)}, Available: ${formatCurrency(walletBalance, currency)}`);
      return;
    }

    setIsProcessing(true);
    try {
      const courseIds = selectedCourses.map((c) => c.id);
      const level = selectedCourses[0]?.course_level || "100";

      const response = await api.RegisterCourse({
        course_ids: courseIds,
        academic_year: selectedSession,
        semester: selectedSemester,
        level: String(level),
      });

      // Handle both response formats
      const responseData = response.data || response;
      const isSuccess = responseData?.status || responseData?.success;

      if (isSuccess) {
        const message = responseData?.message || `Successfully registered for ${courseIds.length} course(s)`;
        toast.success(message);

        // Show payment details if payment was made
        if (responseData?.data?.payment) {
          const payment = responseData.data.payment;
          toast.info(
            `Payment: ${formatCurrency(payment.amount_paid, currency)} | New Balance: ${formatCurrency(payment.new_balance, currency)}`,
            { duration: 5000 }
          );
        }

        // Show note if available
        if (responseData?.data?.note) {
          toast.info(responseData.data.note, { duration: 4000 });
        }

        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        }

        // Close dialog and refresh
        onOpenChange(false);
      } else {
        throw new Error(responseData?.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Error registering for courses:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while registering for courses";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
    }
  };

  if (selectedCourses.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Register for {selectedCourses.length} Course{selectedCourses.length !== 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Review your selection and complete registration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session and Semester Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Session
              </label>
              <Select
                value={selectedSession}
                onValueChange={setSelectedSession}
                disabled={isLoadingSessions}
              >
                <SelectTrigger>
                  {isLoadingSessions ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select academic session" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semester
              </label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
                disabled={isLoadingSessions}
              >
                <SelectTrigger>
                  {isLoadingSessions ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select semester" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Courses List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Selected Courses:</h3>
            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
              {selectedCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {course.course_code}
                      </Badge>
                      <span className="text-sm font-medium">{course.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Level {course.course_level} · {course.course_unit} Unit
                      {course.course_unit !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {course.price > 0 ? (
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(course.price, course.currency || currency)}
                      </span>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 text-xs">FREE</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wallet Balance:</span>
              {isLoadingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-lg font-semibold">
                  {formatCurrency(walletBalance, currency)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount, currency)}
              </span>
            </div>
            {totalAmount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Remaining Balance:</span>
                <span
                  className={`text-lg font-semibold ${
                    remainingBalance < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(remainingBalance, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Insufficient Balance Alert */}
          {hasInsufficientBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient wallet balance. Required: {formatCurrency(totalAmount, currency)},
                Available: {formatCurrency(walletBalance, currency)}. Please fund your wallet.
              </AlertDescription>
            </Alert>
          )}

          {/* Free Courses Note */}
          {totalAmount === 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                All selected courses are free. No payment required.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            disabled={
              isProcessing ||
              isLoadingSessions ||
              !selectedSession ||
              !selectedSemester ||
              hasInsufficientBalance
            }
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                {totalAmount > 0 ? "Register and Pay" : "Register"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleCourseRegistrationDialog;

