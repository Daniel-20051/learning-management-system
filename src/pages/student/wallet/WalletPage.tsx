import { useEffect, useState, useRef } from "react";
import { WalletApi } from "@/api/wallet";
import type { WalletTransaction, WalletTransactionsFilters } from "@/api/wallet";
import { AuthApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  Wallet,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/Components/navbar";
import { toast } from "sonner";

const formatCurrency = (amount: number, currency: string = "NGN") => {
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
};

// Declare Flutterwave types
declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("NGN");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMoneyDialogOpen, setAddMoneyDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{
    currency: string;
    total_credits: number;
    total_debits: number;
  } | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [filters, setFilters] = useState<WalletTransactionsFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const flutterwaveLoaded = useRef(false);
  const { user } = useAuth();

  const walletApi = new WalletApi();
  const authApi = new AuthApi();

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
    fetchAcademicYears();
    loadFlutterwaveScript();
    
    // Handle Flutterwave redirect (in case callback doesn't fire)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const txRef = urlParams.get('tx_ref');
    const transactionId = urlParams.get('transaction_id');
    const status = urlParams.get('status');
    
    if (paymentStatus === 'success' && txRef && (transactionId || status === 'successful')) {
      // Clean up URL
      window.history.replaceState({}, '', '/wallet');
      
      // Get amount from localStorage (stored before opening Flutterwave)
      const storedAmount = localStorage.getItem(`payment_amount_${txRef}`);
      if (storedAmount) {
        const amount = parseFloat(storedAmount);
        localStorage.removeItem(`payment_amount_${txRef}`);
        
        console.log("Payment successful via redirect. Funding wallet:", {
          tx_ref: txRef,
          transaction_id: transactionId || '',
          amount: amount
        });
        
        handleFundWallet(txRef, transactionId || '', amount);
      }
    }
  }, []);

  const loadFlutterwaveScript = () => {
    if (flutterwaveLoaded.current || document.getElementById('flutterwave-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'flutterwave-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      flutterwaveLoaded.current = true;
    };
    document.body.appendChild(script);
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUserProfile();
      const profileData = response as any;
      if (profileData?.data?.success || profileData?.data?.status) {
        const userData = profileData?.data?.data?.user;
        if (userData) {
          setWalletBalance(parseFloat(userData.wallet_balance) || 0);
          setCurrency(userData.currency || "NGN");
        }
      }
    } catch (err: any) {
      console.error("Error fetching wallet balance:", err);
      setError("Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true);
      const response = await authApi.Getsessions();
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
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const fetchTransactions = async (filterParams?: WalletTransactionsFilters) => {
    try {
      setLoadingTransactions(true);
      const currentFilters = filterParams || filters;
      const response = await walletApi.GetTransactions(currentFilters);
      
      // Handle new response structure
      if (response.data) {
        const { transactions: transactionsData, pagination, summary: summaryData } = response.data;
        
        if (transactionsData && Array.isArray(transactionsData)) {
          setTransactions(transactionsData);
          
          if (pagination) {
            setPage(pagination.page);
            setTotalPages(pagination.totalPages);
            setTotal(pagination.total);
          }
          
          if (summaryData) {
            setSummary(summaryData);
          }
        }
      } else {
        // Fallback for legacy structure
        const transactionsData = (response as any).transactions || (response as any).data?.transactions;
        if (transactionsData && Array.isArray(transactionsData)) {
          setTransactions(transactionsData);
        }
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      toast.error("Failed to load transaction history");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleFundWallet = async (
    transactionReference: string,
    flutterwaveTransactionId: string,
    amount: number
  ) => {
    setIsFunding(true);
    try {
      const response = await walletApi.FundWallet({
        transaction_reference: transactionReference,
        flutterwave_transaction_id: flutterwaveTransactionId,
        amount: amount,
      });

      const data = response.data || response;
      const success = response.success || response.status || (data as any)?.success;
      
      if (success) {
        toast.success("Wallet funded successfully!");
        setAddMoneyDialogOpen(false);
        setAmount(""); // Clear amount after successful funding
        
        // Refresh wallet balance and transactions
        await fetchWalletData();
        await fetchTransactions({ ...filters, page: 1 });
      } else {
        throw new Error((data as any)?.message || response.message || "Failed to fund wallet");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fund wallet. Please contact support.";
      toast.error(errorMessage);
    } finally {
      setIsFunding(false);
    }
  };

  const generateTransactionReference = () => {
    // Generate unique transaction reference
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `WALLET-${timestamp}-${random}`.toUpperCase();
  };

  const handleAddMoney = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Dynamic minimum amount based on currency
    const minAmount = currency === "USD" ? 5 : 100;
    if (amountNum < minAmount) {
      const minAmountFormatted = formatCurrency(minAmount, currency);
      toast.error(`Minimum amount is ${minAmountFormatted}`);
      return;
    }

    // Close the dialog first to avoid z-index conflicts with Flutterwave modal
    setAddMoneyDialogOpen(false);
    setIsAddingMoney(true);
    
    // Small delay to ensure dialog is fully closed
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Wait for Flutterwave script to load
      if (!flutterwaveLoaded.current) {
        await new Promise((resolve) => {
          const checkFlutterwave = setInterval(() => {
            if (window.FlutterwaveCheckout || flutterwaveLoaded.current) {
              clearInterval(checkFlutterwave);
              resolve(true);
            }
          }, 100);
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkFlutterwave);
            resolve(false);
          }, 5000);
        });
      }

      if (!window.FlutterwaveCheckout) {
        throw new Error("Flutterwave payment gateway failed to load. Please refresh and try again.");
      }

      // Generate transaction reference
      const txRef = generateTransactionReference();
      
      // Get Flutterwave public key from backend or environment
      let publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "";
      
      // If not in environment, try to get from backend
      if (!publicKey) {
        try {
          const keyResponse = await walletApi.GetFlutterwavePublicKey();
          publicKey = keyResponse.public_key || "";
        } catch (err) {
          console.warn("Could not fetch Flutterwave public key from backend:", err);
        }
      }
      
      if (!publicKey) {
        throw new Error("Flutterwave public key is not configured. Please contact support or set VITE_FLUTTERWAVE_PUBLIC_KEY in your environment variables.");
      }

      // Store amount and txRef for use in callback
      const paymentAmount = amountNum;
      const paymentTxRef = txRef;
      
      // Store payment info in localStorage for redirect handling
      localStorage.setItem(`payment_amount_${paymentTxRef}`, paymentAmount.toString());

      // Open Flutterwave inline modal directly
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: paymentTxRef,
        amount: paymentAmount,
        currency: currency,
        payment_options: "card, banktransfer, ussd, mobilemoney",
        redirect_url: `${window.location.origin}/wallet?payment=success&tx_ref=${paymentTxRef}`,
        customer: {
          email: user?.email || "",
          name: user?.name || "",
          phone_number: (user as any)?.phone || "",
        },
        customizations: {
          title: "Wallet Top-up",
          description: `Add ${formatCurrency(paymentAmount, currency)} to your wallet`,
          logo: "/assets/logo.png",
        },
        callback: async (response: any) => {
          console.log("Flutterwave callback triggered:", response);
          setIsAddingMoney(false); // Reset loading state
          
          // Check multiple possible response formats
          const isSuccessful = 
            response?.status === "successful" || 
            response?.status === "success" ||
            response?.data?.status === "successful" ||
            response?.data?.status === "success";
          
          if (isSuccessful) {
            // Get transaction reference and ID from response
            const responseTxRef = response?.tx_ref || response?.data?.tx_ref || paymentTxRef;
            const transactionId = 
              response?.transaction_id?.toString() || 
              response?.id?.toString() || 
              response?.data?.id?.toString() || 
              response?.data?.transaction_id?.toString() || 
              "";
            
            console.log("Payment successful. Funding wallet with:", {
              tx_ref: responseTxRef,
              transaction_id: transactionId,
              amount: paymentAmount
            });
            
            // Payment successful, verify and fund wallet using Flutterwave response
            try {
              await handleFundWallet(responseTxRef, transactionId, paymentAmount);
            } catch (error) {
              console.error("Error funding wallet:", error);
              toast.error("Payment successful but failed to fund wallet. Please contact support.");
              setAddMoneyDialogOpen(true);
            }
          } else {
            console.log("Payment not successful:", response);
            toast.error("Payment was not successful. Please try again.");
            // Reopen dialog if payment failed
            setAddMoneyDialogOpen(true);
          }
        },
        onclose: () => {
          console.log("Flutterwave modal closed");
          setIsAddingMoney(false);
          // Reopen dialog if user closes Flutterwave modal
          setAddMoneyDialogOpen(true);
        },
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to initiate payment. Please try again.";
      toast.error(errorMessage);
      setIsAddingMoney(false);
      // Reopen dialog on error
      setAddMoneyDialogOpen(true);
    }
  };

  const handleFilterChange = (key: keyof WalletTransactionsFilters, value: any) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value, page: 1 };
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 1, limit: 50 };
    setFilters(clearedFilters);
    fetchTransactions(clearedFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navbar sidebar={false} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 mt-6 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wallet</h1>
            <p className="text-muted-foreground mt-1">Manage your wallet balance and view transaction history</p>
          </div>
          <Button
            onClick={() => setAddMoneyDialogOpen(true)}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Add Money
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Balance Card */}
        <div className="border bg-card rounded-lg p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
              {loading ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {formatCurrency(walletBalance, currency)}
                </h2>
              )}
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="border bg-card rounded-lg">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Transaction History</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  View all your wallet transactions
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select
                      value={filters.type || "all"}
                      onValueChange={(value) => handleFilterChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Debit">Debit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Semester</label>
                    <Select
                      value={filters.semester || "all"}
                      onValueChange={(value) => handleFilterChange("semester", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Semesters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        <SelectItem value="1ST">1ST</SelectItem>
                        <SelectItem value="2ND">2ND</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Academic Year</label>
                    <Select
                      value={filters.academic_year || "all"}
                      onValueChange={(value) => handleFilterChange("academic_year", value)}
                      disabled={loadingAcademicYears}
                    >
                      <SelectTrigger>
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Actions</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Total Credits</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(summary.total_credits, summary.currency)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">Total Debits</p>
                  <p className="text-lg font-bold text-red-900">
                    {formatCurrency(summary.total_debits, summary.currency)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">Net Balance</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(summary.total_credits - summary.total_debits, summary.currency)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {loadingTransactions && transactions.length === 0 ? (
            <div className="p-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your transaction history will appear here once you make a transaction.
              </p>
              <Button onClick={() => setAddMoneyDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Money
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Semester/Year</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const transactionType = transaction.type || transaction.transaction_type;
                      const isCredit = transaction.type === "Credit" || transaction.transaction_type === "credit";
                      const transactionCurrency = transaction.currency || currency;
                      const transactionDate = transaction.date || transaction.created_at || "";
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <ArrowDownCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpCircle className="h-4 w-4 text-red-600" />
                              )}
                              <Badge
                                variant={isCredit ? "default" : "secondary"}
                                className={
                                  isCredit
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {transactionType || "Unknown"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {transaction.service_name || transaction.purpose || "Transaction"}
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                isCredit ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isCredit ? "+" : "-"}
                              {formatCurrency(transaction.amount, transactionCurrency)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatCurrency(transaction.balance || 0, transactionCurrency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(transactionDate)}
                          </TableCell>
                          <TableCell>
                            {transaction.semester || transaction.academic_year ? (
                              <div className="text-sm">
                                {transaction.semester && (
                                  <Badge variant="outline" className="mr-1">
                                    {transaction.semester}
                                  </Badge>
                                )}
                                {transaction.academic_year && (
                                  <span className="text-muted-foreground">
                                    {transaction.academic_year}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {transaction.ref || transaction.reference_id ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {transaction.ref || transaction.reference_id}
                              </code>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing page {page} of {totalPages} ({total} total transactions)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1 || loadingTransactions}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loadingTransactions}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages || loadingTransactions}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyDialogOpen} onOpenChange={setAddMoneyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Money to Wallet
            </DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to your wallet. Minimum amount is {formatCurrency(currency === "USD" ? 5 : 100, currency)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  min={currency === "USD" ? "5" : "100"}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current balance: {formatCurrency(walletBalance, currency)}
              </p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                You will be redirected to complete the payment securely.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddMoneyDialogOpen(false);
                setAmount("");
              }}
              disabled={isAddingMoney}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMoney} disabled={isAddingMoney || isFunding}>
              {isAddingMoney || isFunding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isFunding ? "Processing..." : "Opening payment..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

