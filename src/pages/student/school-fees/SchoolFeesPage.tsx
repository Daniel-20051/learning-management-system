import { useEffect, useState } from "react";
import { CoursesApi } from "@/api/courses";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { Badge } from "@/Components/ui/badge";
import Navbar from "@/Components/navbar";
import { 
  Receipt, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Wallet,
  Loader2,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
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

interface SchoolFeesItem {
  id: number;
  item: string;
  amount: number;
  description: string;
}

interface SchoolFeesData {
  academic_year: string;
  semester: string;
  school_fees: {
    amount: number;
    currency: string;
    source: string;
    items: SchoolFeesItem[];
    payment_setup_total: number;
    configuration: any;
  };
  payment_status: string;
  payment: any;
  wallet: {
    balance: number;
    currency: string;
    can_pay_from_wallet: boolean;
  };
}

const formatCurrency = (amount: number, currency: string = "NGN") => {
  const symbol = currency === "NGN" ? "₦" : currency;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function SchoolFeesPage() {
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [data, setData] = useState<SchoolFeesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const coursesApi = new CoursesApi();

  useEffect(() => {
    fetchSchoolFees();
  }, []);

  const fetchSchoolFees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await coursesApi.GetSchoolFees();
      const responseData = response?.data || response;
      
      if (responseData?.success && responseData?.data) {
        setData(responseData.data);
      } else {
        setError(responseData?.message || "Failed to load school fees information");
      }
    } catch (err: any) {
      console.error("Error fetching school fees:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to load school fees";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = () => {
    if (!data) return;
    
    if (!data.wallet.can_pay_from_wallet) {
      toast.error("Insufficient wallet balance. Please top up your wallet first.");
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!data) return;

    setPaying(true);
    setConfirmDialogOpen(false);

    try {
      const response = await coursesApi.PaySchoolFees();
      const responseData = response?.data || response;
      
      if (responseData?.success || responseData?.status) {
        const successMessage = responseData?.message || "School fees paid successfully!";
        toast.success(successMessage);
        
        // Show wallet update info if available
        if (responseData?.data?.wallet) {
          const wallet = responseData.data.wallet;
          toast.info(
            `Wallet debited: ${formatCurrency(wallet.debited, wallet.currency)}. ` +
            `New balance: ${formatCurrency(wallet.new_balance, wallet.currency)}`
          );
        }
        
        // Refresh school fees data
        await fetchSchoolFees();
      } else {
        throw new Error(responseData?.message || "Failed to pay school fees");
      }
    } catch (err: any) {
      console.error("Error paying school fees:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to pay school fees";
      toast.error(message);
    } finally {
      setPaying(false);
    }
  };

  const isPaid = data?.payment_status === "paid" || data?.payment_status === "completed";
  const canPay = data?.wallet.can_pay_from_wallet && !isPaid;
  const remainingBalance = data 
    ? data.wallet.balance - data.school_fees.amount 
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navbar sidebar={false} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 mt-6 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">School Fees</h1>
          <p className="text-muted-foreground mt-1">View and pay your school fees</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Semester Information and Wallet Balance - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semester Information */}
              <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Semester Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Academic Year</p>
                      <p className="font-semibold">{data.academic_year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Semester</p>
                      <p className="font-semibold">{data.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge 
                        variant={isPaid ? "default" : "secondary"}
                        className={isPaid ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {isPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Balance */}
              <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(data.wallet.balance, data.wallet.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">After Payment</p>
                      <p className={`text-xl font-semibold ${remainingBalance < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                        {formatCurrency(remainingBalance, data.wallet.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* School Fees Details */}
            <Card className="pt-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  School Fees Breakdown
                </CardTitle>
                <CardDescription>
                  Total amount: {formatCurrency(data.school_fees.amount, data.school_fees.currency)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.school_fees.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.item}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.amount, data.school_fees.currency)}
                      </p>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between p-4 border-t-2 border-primary mt-4">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(data.school_fees.amount, data.school_fees.currency)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            {isPaid && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  Payment Completed
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your school fees for {data.academic_year} {data.semester} semester has been paid successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Insufficient Balance Warning */}
            {!isPaid && !data.wallet.can_pay_from_wallet && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Insufficient Balance</AlertTitle>
                <AlertDescription>
                  Your wallet balance is insufficient to pay school fees. 
                  You need {formatCurrency(data.school_fees.amount - data.wallet.balance, data.wallet.currency)} more.
                  <Button
                    variant="link"
                    className="p-0 h-auto ml-2"
                    onClick={() => window.location.href = "/wallet"}
                  >
                    Top up wallet
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Button */}
            {!isPaid && (
              <div className="flex justify-end gap-4">
                <Button
                  onClick={handlePayClick}
                  disabled={!canPay || paying}
                  size="lg"
                  className="gap-2"
                >
                  {paying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Pay School Fees
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No School Fees Information</AlertTitle>
            <AlertDescription>
              School fees information is not available at this time.
            </AlertDescription>
          </Alert>
        )}
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm School Fees Payment</AlertDialogTitle>
            <AlertDialogDescription>
              {data && (
                <>
                  You are about to pay <strong>{formatCurrency(data.school_fees.amount, data.school_fees.currency)}</strong> for school fees.
                  <br />
                  <br />
                  Your current wallet balance: <strong>{formatCurrency(data.wallet.balance, data.wallet.currency)}</strong>
                  <br />
                  Balance after payment: <strong>{formatCurrency(remainingBalance, data.wallet.currency)}</strong>
                  <br />
                  <br />
                  This action cannot be undone. Do you want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={paying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment} disabled={paying}>
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

