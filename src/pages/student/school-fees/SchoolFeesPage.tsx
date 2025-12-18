import { useEffect, useState } from "react";
import { CoursesApi } from "@/api/courses";
import { Api } from "@/api";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import Navbar from "@/Components/navbar";
import { 
  Receipt, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Wallet,
  Loader2,
  DollarSign,
  History,
  ChevronLeft,
  ChevronRight,
  Filter
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

interface PaymentHistoryItem {
  id: number;
  amount: number;
  currency: string;
  status: string;
  academic_year: string;
  semester: string;
  date: string;
  teller_no: string;
  type: string;
  student_level: string;
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

  // Transaction history state
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyFilters, setHistoryFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    semester: "",
    academic_year: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);

  const coursesApi = new CoursesApi();
  const api = new Api();

  useEffect(() => {
    fetchSchoolFees();
    fetchHistory();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyFilters]);

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
        
        // Refresh school fees data and history
        await fetchSchoolFees();
        await fetchHistory();
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

  const fetchAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true);
      const response = await api.Getsessions();
      const items = response?.data?.data ?? response?.data ?? [];

      if (Array.isArray(items) && items.length > 0) {
        // Build unique academic year list from API
        const uniqueYears = Array.from(
          new Set(items.map((it: any) => it.academic_year).filter(Boolean))
        ) as string[];
        setAvailableAcademicYears(uniqueYears.sort().reverse()); // Sort descending (newest first)
      }
    } catch (err: any) {
      console.error("Error fetching academic years:", err);
      // Fallback to empty array - will be populated from history if available
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const params: any = {
        page: historyFilters.page,
        limit: historyFilters.limit,
      };

      if (historyFilters.status) params.status = historyFilters.status;
      if (historyFilters.semester) params.semester = historyFilters.semester;
      if (historyFilters.academic_year) params.academic_year = historyFilters.academic_year;

      const response = await coursesApi.GetSchoolFeesHistory(params);
      const responseData = response?.data || response;

      if (responseData?.success && responseData?.data) {
        const historyData = responseData.data.history || [];
        setHistory(historyData);
        setPagination(responseData.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
        });

        // Extract unique academic years from history and merge with available years
        if (historyData.length > 0) {
          const historyYears = Array.from(
            new Set(historyData.map((item: PaymentHistoryItem) => item.academic_year).filter(Boolean))
          ) as string[];
          
          setAvailableAcademicYears((prev) => {
            const merged = Array.from(new Set([...prev, ...historyYears]));
            return merged.sort().reverse(); // Sort descending (newest first)
          });
        }
      } else {
        setHistoryError(responseData?.message || "Failed to load payment history");
      }
    } catch (err: any) {
      console.error("Error fetching payment history:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to load payment history";
      setHistoryError(message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setHistoryFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage: number) => {
    setHistoryFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "";
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
            {/* Semester Information and Wallet Balance - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semester Information Skeleton */}
              <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-40" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Balance Skeleton */}
              <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-8 w-40" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-6 w-32 ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* School Fees Breakdown Skeleton */}
            <Card className="pt-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-48" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-40 mt-2" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 border-t-2 mt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History Skeleton */}
            <Card className="pt-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-56 mt-2" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters Skeleton */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table Skeleton */}
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-7 gap-4 pb-2 border-b">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                  {/* Table Rows */}
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="grid grid-cols-7 gap-4 py-3 border-b">
                      {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                        <Skeleton key={col} className="h-4 w-full" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
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

            {/* Payment History */}
            <Card className="pt-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View your school fees payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filters</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <Select
                        value={historyFilters.status || "all"}
                        onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester-filter">Semester</Label>
                      <Select
                        value={historyFilters.semester || "all"}
                        onValueChange={(value) => handleFilterChange("semester", value === "all" ? "" : value)}
                      >
                        <SelectTrigger id="semester-filter">
                          <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Semesters</SelectItem>
                          <SelectItem value="1ST">1ST</SelectItem>
                          <SelectItem value="2ND">2ND</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academic-year-filter">Academic Year</Label>
                      <Select
                        value={historyFilters.academic_year || "all"}
                        onValueChange={(value) => handleFilterChange("academic_year", value === "all" ? "" : value)}
                        disabled={loadingAcademicYears}
                      >
                        <SelectTrigger id="academic-year-filter">
                          <SelectValue placeholder={loadingAcademicYears ? "Loading..." : "All Academic Years"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Academic Years</SelectItem>
                          {availableAcademicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limit-filter">Items per Page</Label>
                      <Select
                        value={String(historyFilters.limit)}
                        onValueChange={(value) => {
                          setHistoryFilters((prev) => ({
                            ...prev,
                            limit: parseInt(value),
                            page: 1,
                          }));
                        }}
                      >
                        <SelectTrigger id="limit-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : historyError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{historyError}</AlertDescription>
                  </Alert>
                ) : history.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Payment History</AlertTitle>
                    <AlertDescription>
                      You don't have any payment history yet.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Academic Year</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Semester</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Level</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Teller No</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-muted/50">
                              <td className="p-3 text-sm">{formatDate(item.date)}</td>
                              <td className="p-3 text-sm font-semibold">
                                {formatCurrency(item.amount, item.currency)}
                              </td>
                              <td className="p-3 text-sm">{item.academic_year}</td>
                              <td className="p-3 text-sm">{item.semester}</td>
                              <td className="p-3 text-sm">{item.student_level}</td>
                              <td className="p-3">
                                <Badge
                                  variant={getStatusBadgeVariant(item.status)}
                                  className={getStatusBadgeColor(item.status)}
                                >
                                  {item.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm font-mono text-muted-foreground">
                                {item.teller_no}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                          {pagination.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1 || historyLoading}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || historyLoading}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
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

